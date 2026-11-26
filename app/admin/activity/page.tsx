import Link from "next/link";
import { requireAdminPage, ACTION_GROUPS } from "@/lib/admin";
import ActivityFeed from "@/components/ActivityFeed";
import AutoRefresh from "@/components/AutoRefresh";

export default async function ActivityPage({ searchParams }: { searchParams: { group?: string; q?: string; page?: string } }) {
  const { supabase } = await requireAdminPage("/admin/activity");
  const group = searchParams.group && ACTION_GROUPS[searchParams.group] ? searchParams.group : "All";
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const size = 100;

  let query = supabase.from("activity_log").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (ACTION_GROUPS[group].length) query = query.in("action", ACTION_GROUPS[group]);
  if (q) query = query.ilike("actor", `%${q}%`);
  const { data, count } = await query.range((page - 1) * size, page * size - 1);
  const pages = Math.max(1, Math.ceil((count ?? 0) / size));
  const link = (p: Record<string, string | number>) =>
    "/admin/activity?" + new URLSearchParams({ group, ...(q ? { q } : {}), ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) }).toString();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[32px] font-semibold leading-tight">Live activity</h1>
        <AutoRefresh seconds={15} />
      </div>
      <p className="mt-2 text-mute">Every sign-up, login, lab opened, Colab launch, lab completed, demo request and admin action, newest first.</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink">
        <div className="flex flex-wrap gap-x-5">
          {Object.keys(ACTION_GROUPS).map((g) => (
            <Link key={g} href={"/admin/activity?" + new URLSearchParams({ group: g, ...(q ? { q } : {}) })}
              className={`-mb-px min-h-[40px] border-b-2 pt-2 text-[15px] ${g === group ? "border-madder font-medium" : "border-transparent text-mute hover:text-ink"}`}>{g}</Link>
          ))}
        </div>
        <form className="mb-2 flex gap-2">
          <input type="hidden" name="group" value={group} />
          <input name="q" defaultValue={q} placeholder="Search by name" className="input min-h-[36px] w-48 py-1 text-sm" />
          <button className="btn-ghost min-h-[36px] px-3 text-sm">Search</button>
        </form>
      </div>

      <p className="mt-3 font-mono text-[12px] text-mute">{count ?? 0} events</p>
      <div className="mt-2"><ActivityFeed rows={(data ?? []) as any} /></div>

      {pages > 1 && (
        <div className="mt-6 flex items-center gap-4 text-sm">
          {page > 1 && <Link className="underline" href={link({ page: page - 1 })}>← Newer</Link>}
          <span className="font-mono text-[12px] text-mute">page {page} of {pages}</span>
          {page < pages && <Link className="underline" href={link({ page: page + 1 })}>Older →</Link>}
        </div>
      )}
    </div>
  );
}
