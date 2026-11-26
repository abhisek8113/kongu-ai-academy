import Link from "next/link";
import { requireAdminPage, ago } from "@/lib/admin";
import { TICKET_STATUSES, SEVERITIES, statusClass, severityClass, duration } from "@/lib/tickets";

export default async function IssuesPage({ searchParams }: { searchParams: { status?: string; severity?: string; q?: string } }) {
  const { supabase } = await requireAdminPage("/admin/issues");
  const status = searchParams.status ?? "open";
  const severity = searchParams.severity ?? "";
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(300);
  if (status === "open") query = query.not("status", "in", "(Resolved,Closed)");
  else if (TICKET_STATUSES.includes(status)) query = query.eq("status", status);
  if (SEVERITIES.includes(severity)) query = query.eq("severity", severity);
  if (q) query = query.or(`description.ilike.%${q}%,student_name.ilike.%${q}%,lab.ilike.%${q}%,category.ilike.%${q}%`);
  const [{ data }, { data: all }] = await Promise.all([query, supabase.from("support_tickets").select("status, created_at, resolved_at").limit(5000)]);
  const counts = new Map<string, number>();
  (all ?? []).forEach((t: any) => counts.set(t.status, (counts.get(t.status) ?? 0) + 1));
  const resolved = (all ?? []).filter((t: any) => t.resolved_at);
  const avgH = resolved.length ? resolved.reduce((n: number, t: any) => n + (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()), 0) / resolved.length / 3600000 : null;
  const link = (p: Record<string, string>) => "/admin/issues?" + new URLSearchParams({ status, ...(severity ? { severity } : {}), ...(q ? { q } : {}), ...p }).toString();

  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Issues</h1>
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-4">
        {[["Open", (all ?? []).filter((t: any) => !["Resolved", "Closed"].includes(t.status)).length], ["New", counts.get("New") ?? 0], ["Resolved / closed", (counts.get("Resolved") ?? 0) + (counts.get("Closed") ?? 0)], ["Avg. resolution", avgH === null ? "—" : avgH < 48 ? `${avgH.toFixed(1)} h` : `${Math.round(avgH / 24)} d`]].map(([k, v]) => (
          <div key={k as string} className="bg-night p-4"><div className="text-sm text-mute">{k}</div><div className="mt-1 text-2xl font-semibold">{v}</div></div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line pb-3">
        {[["open", "Open"], ["all", "All"], ...TICKET_STATUSES.map((s) => [s, s])].map(([k, l]) => (
          <Link key={k} href={link({ status: k })} className={`text-sm ${status === k ? "font-medium text-ink underline decoration-madder decoration-2 underline-offset-8" : "text-mute hover:text-ink"}`}>{l}</Link>
        ))}
      </div>
      <form className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="status" value={status} />
        <select name="severity" defaultValue={severity} className="input min-h-[38px] w-auto py-1 text-sm"><option value="">All severities</option>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select>
        <input name="q" defaultValue={q} placeholder="Search description, student, lab" className="input min-h-[38px] w-72 py-1 text-sm" />
        <button className="btn-ghost min-h-[38px] px-3 text-sm">Filter</button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-rule">
        <table className="tbl">
          <thead><tr><th>#</th><th>Issue</th><th>Student</th><th>Lab</th><th>Severity</th><th>Status</th><th>Age</th></tr></thead>
          <tbody>
            {(data ?? []).map((t: any) => (
              <tr key={t.id}>
                <td className="font-mono text-[13px] text-mute">{t.id}</td>
                <td><Link href={`/admin/issues/${t.id}`} className="font-medium hover:text-cyan">{t.category}</Link><div className="max-w-xs truncate text-xs text-mute">{t.description}</div></td>
                <td>{t.student_name ?? "—"}</td>
                <td className="text-mute">{t.lab ?? "—"}</td>
                <td className={severityClass(t.severity)}>{t.severity}</td>
                <td><span className={`pill ${statusClass(t.status)}`}>{t.status}</span></td>
                <td className="whitespace-nowrap text-mute">{t.resolved_at ? `fixed in ${duration(t.created_at, t.resolved_at)}` : ago(t.created_at)}</td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={7} className="text-mute">No issues match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
