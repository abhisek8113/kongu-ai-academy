import { requireAdminPage, ago } from "@/lib/admin";
import { courses } from "@/lib/courseLabs";
import { tracks } from "@/lib/labs";
import { setLabPublished } from "@/app/actions";

type Row = { id: string; title: string; group: string };

export default async function AdminLabs({ searchParams }: { searchParams: { sort?: string } }) {
  const { supabase } = await requireAdminPage("/admin/labs");
  const rows: Row[] = [
    { id: "playground/python", title: "Python Playground", group: "Playgrounds" },
    { id: "playground/sql", title: "SQL Playground", group: "Playgrounds" },
    ...courses.flatMap((c) => c.labs.map((l) => ({ id: `${c.slug}/${l.lab}`, title: `${String(l.num).padStart(2, "0")} · ${l.title}`, group: c.name }))),
    ...tracks.flatMap((t) => t.labs.map((l) => ({ id: l.id, title: l.title, group: t.name }))),
  ];
  const [{ data: settings }, { data: opens }, { data: done }, { data: execs }, { data: tickets }] = await Promise.all([
    supabase.from("lab_settings").select("*"),
    supabase.from("activity_log").select("meta, created_at").eq("action", "lab_open").limit(20000),
    supabase.from("lab_progress").select("lab_id").limit(20000),
    supabase.from("lab_executions").select("lab_id, ok, error, created_at").order("created_at", { ascending: false }).limit(20000),
    supabase.from("support_tickets").select("lab, status").limit(5000),
  ]);
  const off = new Set((settings ?? []).filter((s: any) => !s.published).map((s: any) => s.lab_id));
  const count = (arr: any[] | null, key: (x: any) => string | undefined) => { const m = new Map<string, number>(); (arr ?? []).forEach((x) => { const k = key(x); if (k) m.set(k, (m.get(k) ?? 0) + 1); }); return m; };
  const opened = count(opens, (a) => a.meta?.lab);
  const completed = count(done, (d) => d.lab_id);
  const labOf = (execId: string) => execId.startsWith("playground/") ? execId.split("/").slice(0, 2).join("/") : execId;
  const runs = count(execs, (e) => labOf(e.lab_id));
  const fails = count((execs ?? []).filter((e: any) => !e.ok), (e) => labOf(e.lab_id));
  const openTickets = (tickets ?? []).filter((t: any) => !["Resolved", "Closed"].includes(t.status));
  let list = rows.map((r) => ({ ...r, opens: opened.get(r.id) ?? 0, done: completed.get(r.id) ?? 0, runs: runs.get(r.id) ?? 0, fails: fails.get(r.id) ?? 0,
    issues: openTickets.filter((t: any) => t.lab && r.title.toLowerCase().includes(String(t.lab).toLowerCase().replace(/^.*·\s*/, "").slice(0, 18))).length }));
  if (searchParams.sort === "popular") list = [...list].sort((a, b) => b.opens - a.opens);
  if (searchParams.sort === "fails") list = [...list].sort((a, b) => b.fails - a.fails);
  const recentFails = (execs ?? []).filter((e: any) => !e.ok).slice(0, 15);
  const totalRuns = execs?.length ?? 0, totalFails = (execs ?? []).filter((e: any) => !e.ok).length;

  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Laboratories</h1>
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-4">
        {[["Lab sessions (opens)", opens?.length ?? 0], ["Code runs", totalRuns], ["Failed runs", totalFails], ["Unpublished labs", off.size]].map(([k, v]) => (
          <div key={k as string} className="bg-night p-4"><dt className="text-sm text-mute">{k}</dt><dd className="mt-1 text-2xl font-semibold">{v}</dd></div>
        ))}
      </dl>

      <div className="mt-6 flex gap-5 text-sm">
        {[["", "Catalogue order"], ["popular", "Most popular"], ["fails", "Most failures"]].map(([k, l]) => (
          <a key={k} href={`/admin/labs${k ? `?sort=${k}` : ""}`} className={(searchParams.sort ?? "") === k ? "font-medium text-ink underline decoration-madder underline-offset-8" : "text-mute hover:text-ink"}>{l}</a>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-rule">
        <table className="tbl">
          <thead><tr><th>Lab</th><th>Group</th><th className="text-right">Opens</th><th className="text-right">Completed</th><th className="text-right">Runs</th><th className="text-right">Failed</th><th className="text-right">Open issues</th><th>Availability</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.title}</td>
                <td className="text-mute">{r.group}</td>
                <td className="text-right tabular-nums">{r.opens}</td>
                <td className="text-right tabular-nums">{r.done}</td>
                <td className="text-right tabular-nums">{r.runs || "—"}</td>
                <td className={`text-right tabular-nums ${r.fails ? "text-[#FF8A8A]" : ""}`}>{r.fails || "—"}</td>
                <td className="text-right tabular-nums">{r.issues || "—"}</td>
                <td>
                  <form action={setLabPublished} className="flex items-center gap-2">
                    <input type="hidden" name="lab_id" value={r.id} /><input type="hidden" name="title" value={r.title} />
                    <input type="hidden" name="published" value={off.has(r.id) ? "1" : "0"} />
                    <span className={`pill ${off.has(r.id) ? "border-gold/50 text-gold" : "border-[#1f7a4d] text-[#5fd39a]"}`}>{off.has(r.id) ? "Unpublished" : "Published"}</span>
                    <button className="text-xs text-mute underline hover:text-ink">{off.has(r.id) ? "Publish" : "Unpublish"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl">Recent failed runs</h2>
      <ul className="mt-3 divide-y divide-rule border-y border-rule text-sm">
        {recentFails.map((e: any, i: number) => <li key={i} className="grid gap-1 py-2.5 sm:grid-cols-[14rem_1fr_6rem]"><span className="font-mono text-[12px]">{e.lab_id}</span><span className="truncate text-[#FFB3B3]">{e.error}</span><span className="text-right text-xs text-mute">{ago(e.created_at)}</span></li>)}
        {!recentFails.length && <li className="py-4 text-mute">No failed runs recorded.</li>}
      </ul>
    </div>
  );
}
