import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { activateFromPayment, adminDb, markFailed, paymentsEnabled, verifyCheckoutSignature } from "@/lib/payments";

export async function POST(req: Request) {
  if (!paymentsEnabled()) return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const { razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: sig, failed } = b ?? {};
  if (typeof o !== "string") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { data: tx } = await adminDb().from("payment_transactions").select("user_id").eq("order_id", o).maybeSingle();
  if (!tx || tx.user_id !== user.id) return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (failed) { await markFailed(o, typeof p === "string" ? p : null, String(failed)); return NextResponse.json({ ok: false }); }
  if (typeof p !== "string" || typeof sig !== "string" || !verifyCheckoutSignature(o, p, sig)) {
    return NextResponse.json({ error: "Payment signature invalid" }, { status: 400 });
  }
  try {
    await activateFromPayment(o, p);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
