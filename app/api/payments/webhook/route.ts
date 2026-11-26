import { NextResponse } from "next/server";
import { activateFromPayment, adminDb, markFailed, paymentsEnabled, verifyWebhookSignature } from "@/lib/payments";

// Razorpay → this endpoint. Signature checked on the raw body; each event handled once.
export async function POST(req: Request) {
  if (!paymentsEnabled()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, sig)) return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  const evt = JSON.parse(raw);
  const eventId = req.headers.get("x-razorpay-event-id") ?? `${evt.event}:${evt.payload?.payment?.entity?.id ?? evt.created_at}`;
  const { error: dup } = await adminDb().from("payment_webhook_events").insert({ event_id: eventId, event: evt.event, payload: evt });
  if (dup) return NextResponse.json({ ok: true, duplicate: true });
  const pay = evt.payload?.payment?.entity;
  try {
    if ((evt.event === "payment.captured" || evt.event === "order.paid") && pay?.order_id) await activateFromPayment(pay.order_id, pay.id);
    if (evt.event === "payment.failed" && pay?.order_id) await markFailed(pay.order_id, pay.id, pay.error_description ?? "failed");
    if (evt.event === "refund.processed" && pay?.order_id) await adminDb().from("payment_transactions").update({ status: "refunded" }).eq("order_id", pay.order_id);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
