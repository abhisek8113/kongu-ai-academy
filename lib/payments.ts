import "server-only";
import crypto from "crypto";
import { createClient as createAdmin } from "@supabase/supabase-js";

// Server-only secrets. None of these are NEXT_PUBLIC, so they never reach the browser.
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const paymentsEnabled = () => Boolean(KEY_ID && KEY_SECRET && SERVICE_ROLE);
export const publicKeyId = () => KEY_ID ?? "";

export function adminDb() {
  if (!SERVICE_ROLE) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, SERVICE_ROLE, { auth: { persistSession: false } });
}

async function rzp(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.description ?? `Razorpay error ${res.status}`);
  return body;
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", KEY_SECRET!).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

export function verifyWebhookSignature(raw: string, signature: string) {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");
  return safeEqual(expected, signature);
}

export async function createOrder(userId: string, planId: string) {
  const db = adminDb();
  const { data: plan } = await db.from("subscription_plans").select("*").eq("id", planId).eq("active", true).maybeSingle();
  if (!plan) throw new Error("Plan not available");
  // The amount always comes from the database, never from the browser.
  const order = await rzp("/orders", { method: "POST", body: JSON.stringify({ amount: plan.price_paise, currency: "INR", receipt: `kaa_${Date.now()}`, notes: { user_id: userId, plan_id: plan.id } }) });
  const { error } = await db.from("payment_transactions").insert({ user_id: userId, plan_id: plan.id, order_id: order.id, amount_paise: plan.price_paise, status: "created" });
  if (error) throw new Error(error.message);
  return { orderId: order.id as string, amount: plan.price_paise as number, planName: plan.name as string };
}

/** Idempotent: confirms the payment with Razorpay, then grants or extends the membership once. */
export async function activateFromPayment(orderId: string, paymentId: string) {
  const db = adminDb();
  const { data: tx } = await db.from("payment_transactions").select("*").eq("order_id", orderId).maybeSingle();
  if (!tx) throw new Error("Unknown order");
  if (tx.status === "paid") return { already: true };
  const payment = await rzp(`/payments/${paymentId}`);
  if (payment.order_id !== orderId || payment.amount !== tx.amount_paise || !["captured", "authorized"].includes(payment.status)) {
    await db.from("payment_transactions").update({ status: "failed", payment_id: paymentId, error: `Verification failed (${payment.status})`, updated_at: new Date().toISOString() }).eq("id", tx.id);
    throw new Error("Payment could not be verified");
  }
  if (payment.status === "authorized") await rzp(`/payments/${paymentId}/capture`, { method: "POST", body: JSON.stringify({ amount: tx.amount_paise, currency: "INR" }) });
  // Claim the transaction atomically so a webhook and the checkout callback can't both activate.
  const { data: claimed } = await db.from("payment_transactions").update({ status: "paid", payment_id: paymentId, updated_at: new Date().toISOString() }).eq("id", tx.id).neq("status", "paid").select("id");
  if (!claimed?.length) return { already: true };
  const { data: plan } = await db.from("subscription_plans").select("period_days").eq("id", tx.plan_id).single();
  const { data: current } = await db.from("subscriptions").select("ends_at").eq("user_id", tx.user_id).in("status", ["active", "trial"]).order("ends_at", { ascending: false }).limit(1).maybeSingle();
  const base = current?.ends_at && new Date(current.ends_at) > new Date() ? new Date(current.ends_at) : new Date();
  const ends = new Date(base.getTime() + (plan?.period_days ?? 30) * 86400000);
  const { data: sub } = await db.from("subscriptions").insert({ user_id: tx.user_id, plan_id: tx.plan_id, status: "active", source: "payment", starts_at: new Date().toISOString(), ends_at: ends.toISOString() }).select("id").single();
  await db.from("payment_transactions").update({ subscription_id: sub?.id }).eq("id", tx.id);
  await db.from("activity_log").insert({ user_id: tx.user_id, action: "payment_success", meta: { order: orderId, plan: tx.plan_id, amount: tx.amount_paise } });
  return { already: false };
}

export async function markFailed(orderId: string, paymentId: string | null, reason: string) {
  const db = adminDb();
  await db.from("payment_transactions").update({ status: "failed", payment_id: paymentId, error: reason.slice(0, 300), updated_at: new Date().toISOString() }).eq("order_id", orderId).eq("status", "created");
}
