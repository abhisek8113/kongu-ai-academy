import { requireAdminPage, fmtTime, ago } from "@/lib/admin";
import { grantAccess, revokeAccess, savePlan } from "@/app/actions";
import { paymentsEnabled } from "@/lib/payments";

const inr = (p: number) => "₹" + (p / 100).toLocaleString("en-IN");

export default async function AdminSubs() {
  const { supabase } = await requireAdminPage("/admin/subscriptions");
  await supabase.rpc("expire_subscriptions");
  const [{ data: plans }, { data: subs }, { data: pays }, { data: students }, { data: reqs }] = await Promise.all([
    supabase.from("subscription_plans").select("*").order("sort"),
    supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(300),
    supabase.from("payment_transactions").select("*").order("created_at", { ascending: false }).limit(300),
    supabase.from("profiles").select("id, full_name, email").neq("role", "admin").order("created_at", { ascending: false }),
    supabase.from("activity_log").select("*").eq("action", "membership_request").order("created_at", { ascending: false }).limit(30),
  ]);
  const now = Date.now();
  const live = (subs ?? []).filter((x: any) => ["active", "trial"].includes(x.status) && (!x.ends_at || new Date(x.ends_at).getTime() > now));
  const revenue = (pays ?? []).filter((p: any) => p.status === "paid").reduce((n: number, p: any) => n + p.amount_paise, 0);
  const name = (id: string) => { const p = (students ?? []).find((s: any) => s.id === id); return p?.full_name || p?.email || id.slice(0, 8); };
  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Subscriptions & payments</h1>
      <p className={`mt-2 text-sm ${paymentsEnabled() ? "text-[#5fd39a]" : "text-gold"}`}>{paymentsEnabled() ? "Razorpay online payments: connected" : "Razorpay online payments: not configured (add the keys in Vercel). Students can request a plan; grant access below after you receive payment."}</p>
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-4">
        {[["Active memberships", live.length], ["Expired / cancelled", (subs ?? []).filter((x: any) => ["expired", "cancelled"].includes(x.status)).length], ["Revenue (verified)", inr(revenue)], ["Pending / failed payments", (pays ?? []).filter((p: any) => p.status !== "paid" && p.status !== "refunded").length]].map(([k, v]) => (
          <div key={k as string} className="bg-night p-4"><dt className="text-sm text-mute">{k}</dt><dd className="mt-1 text-2xl font-semibold">{v}</dd></div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 xl:grid-cols-[380px_1fr]">
        <form action={grantAccess} className="card grid gap-3 self-start">
          <h2 className="text-lg">Grant or extend access</h2>
          <label className="label">Student<select name="user_id" required className="input"><option value="">Choose…</option>{(students ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.email}</option>)}</select></label>
          <label className="label">Plan<select name="plan_id" className="input"><option value="">Complimentary</option>{(plans ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="label">Days<input name="days" type="number" min={1} max={3650} defaultValue={30} className="input" /></label>
          <label className="label">Note (e.g. UPI ref)<input name="note" maxLength={300} className="input" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="trial" value="1" /> Mark as trial</label>
          <button className="btn-red">Grant access</button>
          <p className="text-xs text-mute">Every grant and revoke is recorded in the activity log.</p>
        </form>
        <div>
          <h2 className="text-lg">Membership requests</h2>
          <ul className="mt-2 divide-y divide-rule border-y border-rule text-sm">
            {(reqs ?? []).map((r: any) => <li key={r.id} className="flex justify-between py-2"><span>{r.actor} → {r.meta?.plan}</span><span className="text-mute">{ago(r.created_at)}</span></li>)}
            {!reqs?.length && <li className="py-3 text-mute">No requests.</li>}
          </ul>
          <h2 className="mt-8 text-lg">Memberships</h2>
          <div className="mt-2 overflow-x-auto rounded-xl border border-rule"><table className="tbl"><thead><tr><th>Student</th><th>Plan</th><th>Source</th><th>Status</th><th>Ends</th><th></th></tr></thead><tbody>
            {(subs ?? []).map((x: any) => <tr key={x.id}><td>{name(x.user_id)}</td><td>{(plans ?? []).find((p: any) => p.id === x.plan_id)?.name ?? "—"}</td><td>{x.source}</td><td><span className="pill">{x.status}</span></td><td>{x.ends_at ? fmtTime(x.ends_at) : "—"}</td>
              <td>{["active", "trial"].includes(x.status) && <form action={revokeAccess}><input type="hidden" name="id" value={x.id} /><button className="text-xs text-[#FF8A8A] underline">Revoke</button></form>}</td></tr>)}
            {!subs?.length && <tr><td colSpan={6} className="text-mute">No memberships yet.</td></tr>}
          </tbody></table></div>
        </div>
      </div>

      <h2 className="mt-10 text-xl">Plans and prices</h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        {[...(plans ?? []), { id: "", name: "", description: "", price_paise: 0, period_days: 30, features: [], active: true }].map((p: any, i: number) => (
          <form key={p.id || `new${i}`} action={savePlan} className="card grid gap-2">
            <p className="font-medium">{p.id ? p.name : "New plan"}</p>
            <input name="id" defaultValue={p.id} readOnly={!!p.id} placeholder="id e.g. monthly" className="input" required />
            <input name="name" defaultValue={p.name} placeholder="Name" className="input" />
            <input name="description" defaultValue={p.description} placeholder="Description" className="input" />
            <div className="grid grid-cols-2 gap-2"><label className="label">Price ₹<input name="price" type="number" step="1" min={0} defaultValue={p.price_paise / 100} className="input" /></label><label className="label">Days<input name="period_days" type="number" min={1} defaultValue={p.period_days} className="input" /></label></div>
            <textarea name="features" defaultValue={(p.features ?? []).join("\n")} rows={3} placeholder="One feature per line" className="input" />
            <select name="active" defaultValue={p.active ? "1" : "0"} className="input"><option value="1">Shown on pricing page</option><option value="0">Hidden</option></select>
            <button className="btn-ghost">Save plan</button>
          </form>
        ))}
      </div>

      <h2 className="mt-10 text-xl">Payments</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-rule"><table className="tbl"><thead><tr><th>Date</th><th>Student</th><th>Plan</th><th>Amount</th><th>Status</th><th>Razorpay ref</th></tr></thead><tbody>
        {(pays ?? []).map((p: any) => <tr key={p.id}><td>{fmtTime(p.created_at)}</td><td>{name(p.user_id)}</td><td>{p.plan_id}</td><td>{inr(p.amount_paise)}</td><td><span className="pill">{p.status}</span>{p.error && <span className="ml-2 text-xs text-[#FF8A8A]">{p.error}</span>}</td><td className="font-mono text-[12px]">{p.payment_id ?? p.order_id}</td></tr>)}
        {!pays?.length && <tr><td colSpan={6} className="text-mute">No payments yet.</td></tr>}
      </tbody></table></div>
    </div>
  );
}
