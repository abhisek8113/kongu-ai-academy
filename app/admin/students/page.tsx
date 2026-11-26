import Link from "next/link";
import { requireAdminPage, ago, TOTAL_LABS } from "@/lib/admin";

export default async function StudentsPage({ searchParams }: { searchParams: { q?: string; sort?: string } }) {
  const { supabase } = await requireAdminPage("/admin/students");
  const q = (searchParams.q ?? "").trim();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(1000);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,institution.ilike.%${q}%,phone.ilike.%${q}%`);
  const [{ data: people }, { data: progress }] = await Promise.all([
    query,
    supabase.from("lab_progress").select("user_id").limit(50000),
  ]);
  const done = new Map<string, number>();
  (progress ?? []).forEach((p: any) => done.set(p.user_id, (done.get(p.user_id) ?? 0) + 1));
  let rows = (people ?? []) as any[];
  if (searchParams.sort === "progress") rows = [...rows].sort((a, b) => (done.get(b.id) ?? 0) - (done.get(a.id) ?? 0));
  if (searchParams.sort === "active") rows = [...rows].sort((a, b) => String(b.last_seen_at ?? "").localeCompare(String(a.last_seen_at ?? "")));

  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Students</h1>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-3">
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Name, email, phone or college" className="input min-h-[36px] w-72 py-1 text-sm" />
          <button className="btn-ghost min-h-[36px] px-3 text-sm">Search</button>
        </form>
        <div className="flex gap-4 text-sm">
          <span className="text-mute">Sort:</span>
          {[["", "Newest"], ["active", "Last active"], ["progress", "Most labs"]].map(([k, l]) => (
            <Link key={k} href={`/admin/students?${new URLSearchParams({ ...(q ? { q } : {}), ...(k ? { sort: k } : {}) })}`}
              className={(searchParams.sort ?? "") === k ? "font-medium text-ink underline" : "text-mute hover:text-ink"}>{l}</Link>
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-[12px] text-mute">{rows.length} people</p>
      <div className="mt-2 overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Institution</th><th className="text-right">Labs</th><th>Last active</th><th>Joined</th></tr></thead>
          <tbody>
            {rows.map((p) => {
              const n = done.get(p.id) ?? 0;
              return (
                <tr key={p.id}>
                  <td className="whitespace-nowrap">
                    <Link href={`/admin/students/${p.id}`} className="font-medium hover:text-madder hover:underline">{p.full_name || "—"}</Link>
                    {p.role === "admin" && <span className="pill ml-2">admin</span>}
                  </td>
                  <td>{p.email ?? "—"}</td>
                  <td className="whitespace-nowrap">{p.phone ? <a className="hover:underline" href={`https://wa.me/91${String(p.phone).replace(/\D/g, "").slice(-10)}`}>{p.phone}</a> : "—"}</td>
                  <td>{p.institution || "—"}</td>
                  <td className="whitespace-nowrap text-right font-mono text-[13px]">{n}<span className="text-mute">/{TOTAL_LABS}</span></td>
                  <td className="whitespace-nowrap text-mute">{ago(p.last_seen_at)}</td>
                  <td className="whitespace-nowrap text-mute">{ago(p.created_at)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="text-mute">No students yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
