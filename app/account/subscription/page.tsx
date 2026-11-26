import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { fmtTime } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "My membership" };
const inr = (p: number) => "₹" + (p / 100).toLocaleString("en-IN");

export default async function MySubscription({ searchParams }: { searchParams: { paid?: string } }) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) redirect("/login?next=/account/subscription");
  await supabase.rpc("expire_subscriptions");
  const [{ data: subs }, { data: pays }, { data: active }] = await Promise.all([
    supabase.from("subscriptions").select("*, subscription_plans(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("payment_transactions").select("*, subscription_plans(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.rpc("has_active_subscription"),
  ]);
  const cur = (subs ?? []).find((x: any) => ["active", "trial"].includes(x.status));
  return (
    <div className="wrap max-w-4xl py-12">
      <h1 className="text-4xl">My membership</h1>
      {searchParams.paid && <p className="mt-4 rounded-xl border border-[#1f7a4d] p-4 text-[#5fd39a]">Payment verified. Your membership is active.</p>}
      <div className="card mt-6">
        {profile?.role === "admin" ? <p>You are the administrator — all labs are unlocked.</p> : active && cur ? (
          <><p className="text-sm text-mute">Current plan</p><p className="mt-1 text-2xl">{cur.subscription_plans?.name ?? "Complimentary access"} <span className="pill ml-2">{cur.status}</span></p>
            <p className="mt-2 text-mute">Access until <b className="text-ink">{cur.ends_at ? fmtTime(cur.ends_at) : "no end date"}</b>. Renew any time — extra time is added on top.</p>
            <Link href="/pricing" className="btn-ghost mt-4">Renew or upgrade</Link></>
        ) : (
          <><p className="text-xl">No active membership</p><p className="mt-1 text-mute">You can use the free Python demo lab. Your progress is kept — renew to unlock every lab again.</p><Link href="/pricing" className="btn-red mt-4">See plans</Link></>
        )}
        <p className="mt-4 text-xs text-mute">To cancel, simply don't renew; access continues until the end date. For refunds, report a Payment issue from your dashboard.</p>
      </div>
      <h2 className="mt-10 text-xl">Payment history</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-rule"><table className="tbl"><thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead><tbody>
        {(pays ?? []).map((p: any) => <tr key={p.id}><td>{fmtTime(p.created_at)}</td><td>{p.subscription_plans?.name}</td><td>{inr(p.amount_paise)}</td><td><span className="pill">{p.status}</span></td><td className="font-mono text-[12px]">{p.payment_id ?? p.order_id}</td></tr>)}
        {!pays?.length && <tr><td colSpan={5} className="text-mute">No payments yet.</td></tr>}
      </tbody></table></div>
      <h2 className="mt-10 text-xl">Membership history</h2>
      <ul className="mt-3 divide-y divide-rule border-y border-rule text-sm">
        {(subs ?? []).map((x: any) => <li key={x.id} className="flex flex-wrap justify-between gap-2 py-2.5"><span>{x.subscription_plans?.name ?? "Complimentary"} · {x.source}</span><span className="text-mute">{fmtTime(x.starts_at)} → {x.ends_at ? fmtTime(x.ends_at) : "—"} <span className="pill ml-2">{x.status}</span></span></li>)}
        {!subs?.length && <li className="py-3 text-mute">None yet.</li>}
      </ul>
    </div>
  );
}
