"use client";
import { useState } from "react";
import { requestMembership } from "@/app/actions";

declare global { interface Window { Razorpay?: any } }
const loadRzp = () => new Promise<void>((res, rej) => {
  if (window.Razorpay) return res();
  const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => res(); s.onerror = () => rej(new Error("Could not load the payment window."));
  document.body.appendChild(s);
});

export default function Checkout({ plan, planName, enabled, signedIn }: { plan: string; planName: string; enabled: boolean; signedIn: boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!signedIn) return <a href={`/signup?next=/pricing`} className="btn-red w-full justify-center">Create account to continue</a>;
  if (!enabled) {
    return (
      <div>
        <button disabled={busy} onClick={async () => { setBusy(true); const r = await requestMembership(planName); setBusy(false);
          setMsg("error" in r && r.error ? r.error : r.ok === "already" ? "Request already sent today — we'll contact you." : "Request sent. The academy will activate your membership after payment confirmation."); }}
          className="btn-red w-full justify-center">{busy ? "Sending…" : "Request this plan"}</button>
        {msg && <p className="mt-2 text-sm text-mute">{msg}</p>}
      </div>
    );
  }
  const pay = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/payments/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const o = await r.json(); if (!r.ok) throw new Error(o.error);
      await loadRzp();
      const rzp = new window.Razorpay({
        key: o.keyId, order_id: o.orderId, amount: o.amount, currency: "INR", name: "Kongu AI Academy", description: o.planName, prefill: { email: o.email },
        theme: { color: "#386BFF" },
        handler: async (resp: any) => {
          setMsg("Verifying payment…");
          const v = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
          const j = await v.json();
          if (v.ok && j.ok) window.location.href = "/account/subscription?paid=1";
          else { setMsg(j.error ?? "We could not verify the payment. If money was deducted, report a Payment issue."); setBusy(false); }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", (e: any) => {
        fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ razorpay_order_id: o.orderId, razorpay_payment_id: e.error?.metadata?.payment_id, failed: e.error?.description ?? "failed" }) });
        setMsg(`Payment failed: ${e.error?.description ?? "please try again"}`); setBusy(false);
      });
      rzp.open();
    } catch (e: any) { setMsg(e.message ?? "Payment could not start."); setBusy(false); }
  };
  return <div><button onClick={pay} disabled={busy} className="btn-red w-full justify-center">{busy ? "Please wait…" : "Pay with UPI, card or net banking"}</button>{msg && <p role="status" className="mt-2 text-sm text-mute">{msg}</p>}</div>;
}
