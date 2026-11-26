import Link from "next/link";
import { requireAdminPage, labTitle, TOTAL_LABS } from "@/lib/admin";
import ActivityFeed from "@/components/ActivityFeed";
import AutoRefresh from "@/components/AutoRefresh";

export default async function AdminOverview() {
  const { supabase } = await requireAdminPage();
  const day = new Date(Date.now() - 86400000).toISOString();
  const twoWeeks = new Date(Date.now() - 14 * 86400000).toISOString();
  const week = new Date(Date.now() - 7 * 86400000).toISOString();

  const pendingAcc = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending");
  const [students, activeToday, recent, last14, done7, leadsNew, pending, certs, allDone] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen_at", day),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(25),
    supabase.from("activity_log").select("action, created_at, user_id").gte("created_at", twoWeeks).limit(5000),
    supabase.from("lab_progress").select("lab_id", { count: "exact", head: true }).gte("completed_at", week),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "New"),
    supabase.from("enrolments").select("id", { count: "exact", head: true }).eq("status", "Requested"),
    supabase.from("certificates").select("id", { count: "exact", head: true }),
    supabase.from("lab_progress").select("lab_id").limit(10000),
  ]);

  const days = Array.from({ length: 14 }, (_, i) =>
    new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
  const active = new Map(days.map((d) => [d, new Set<string>()]));
  const completed = new Map(days.map((d) => [d, 0]));
  (last14.data ?? []).forEach((a: any) => {
    const d = new Date(a.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    if (a.user_id && active.has(d)) active.get(d)!.add(a.user_id);
    if (a.action === "lab_complete" && completed.has(d)) completed.set(d, completed.get(d)! + 1);
  });
  const maxA = Math.max(1, ...days.map((d) => active.get(d)!.size));

  const counts = new Map<string, number>();
  (allDone.data ?? []).forEach((r: any) => counts.set(r.lab_id, (counts.get(r.lab_id) ?? 0) + 1));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const kpis: [string, number | null, string][] = [
    ["Accounts to approve", pendingAcc.count, "/admin/students?sort=pending"],
    ["Students", students.count, "/admin/students"],
    ["Active in last 24 h", activeToday.count, "/admin/activity"],
    ["Labs completed (7 days)", done7.count, "/admin/activity?group=Labs"],
    ["New leads", leadsNew.count, "/admin/leads"],
    ["Enrolments to approve", pending.count, "/admin/batches"],

  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[32px] font-semibold leading-tight">Overview</h1>
        <AutoRefresh />
      </div>
      <dl className="mt-6 grid grid-cols-2 border-l border-t border-rule sm:grid-cols-3">
        {kpis.map(([label, n, href]) => (
          <Link key={label} href={href} className="border-b border-r border-rule p-4 hover:bg-cream">
            <dt className="text-sm text-mute">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">{n ?? 0}</dd>
          </Link>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="text-xl">Daily active students · last 14 days</h2>
        <div className="mt-4 grid h-36 items-end gap-1.5 border-b border-line" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {days.map((d) => {
            const n = active.get(d)!.size;
            return (
              <div key={d} className="group flex h-full flex-col justify-end" title={`${d}: ${n} active, ${completed.get(d)} labs completed`}>
                <span className="mb-1 text-center font-mono text-[11px] text-mute">{n || ""}</span>
                <div className="bg-ink group-hover:bg-madder" style={{ height: `${(n / maxA) * 80}%`, minHeight: n ? 3 : 0 }} />
              </div>
            );
          })}
        </div>
        <div className="mt-1 grid gap-1.5 font-mono text-[11px] text-mute" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {days.map((d, i) => <span key={d} className="text-center">{i % 2 ? "" : d.slice(8)}</span>)}
        </div>
      </section>

      <div className="mt-10 grid gap-10 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl">Latest activity</h2>
            <Link href="/admin/activity" className="text-sm text-mute underline hover:text-ink">See all</Link>
          </div>
          <div className="mt-3"><ActivityFeed rows={(recent.data ?? []) as any} /></div>
        </section>
        <section>
          <h2 className="text-xl">Most completed labs</h2>
          <ol className="mt-3 border-t border-rule">
            {top.length === 0 && <li className="py-4 text-mute">No labs completed yet.</li>}
            {top.map(([id, n]) => (
              <li key={id} className="flex justify-between gap-3 border-b border-rule py-2.5 text-[15px]">
                <span>{labTitle(id)}</span><span className="font-mono text-[13px] text-mute">{n}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-mute">{TOTAL_LABS} labs available in total.</p>
        </section>
      </div>
    </div>
  );
}
