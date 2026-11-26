import { requireAdminPage, ago } from "@/lib/admin";
import { updateEnquiryStatus } from "@/app/actions";

const LEAD = ["New", "Contacted", "Demo booked", "Proposal sent", "Won", "Lost"];

export default async function LeadsPage() {
  const { supabase } = await requireAdminPage("/admin/leads");
  const { data: leads } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(500);
  const by = new Map(LEAD.map((s) => [s, 0]));
  (leads ?? []).forEach((l: any) => by.set(l.status, (by.get(l.status) ?? 0) + 1));
  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Leads & demo requests</h1>
      <div className="mt-6 grid grid-cols-3 border-l border-t border-rule sm:grid-cols-6">
        {LEAD.map((s) => <div key={s} className="border-b border-r border-rule p-3"><div className="text-sm text-mute">{s}</div><div className="text-2xl font-semibold">{by.get(s)}</div></div>)}
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>When</th><th>Name</th><th>Institution</th><th>Contact</th><th>Interest</th><th>Pax</th><th>Status</th></tr></thead>
          <tbody>
            {(leads ?? []).map((l: any) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap text-mute">{ago(l.created_at)}</td>
                <td>{l.name}{l.message && <div className="text-xs text-mute">{l.message}</div>}</td>
                <td>{l.institution}</td>
                <td className="whitespace-nowrap"><a className="underline" href={`https://wa.me/91${String(l.phone).replace(/\D/g, "").slice(-10)}`}>{l.phone}</a>{l.email && <div className="text-xs">{l.email}</div>}</td>
                <td>{l.interest}</td>
                <td>{l.participants ?? "—"}</td>
                <td>
                  <form action={updateEnquiryStatus} className="flex gap-1">
                    <input type="hidden" name="id" value={l.id} /><input type="hidden" name="name" value={l.name} />
                    <select name="status" defaultValue={l.status} className="input min-h-0 py-1 text-sm">{LEAD.map((s) => <option key={s}>{s}</option>)}</select>
                    <button className="btn-red min-h-0 px-3 py-1 text-sm">Save</button>
                  </form>
                </td>
              </tr>
            ))}
            {!leads?.length && <tr><td colSpan={7} className="text-mute">No leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
