import Link from "next/link";
import { requireAdminPage, ago } from "@/lib/admin";
import { tracks } from "@/lib/labs";
import { courses } from "@/lib/courseLabs";
import { createBatch, toggleBatch, updateEnrolment } from "@/app/actions";

const ENROL = ["Requested", "Confirmed", "Completed", "Cancelled"];

export default async function BatchesPage() {
  const { supabase } = await requireAdminPage("/admin/batches");
  const [{ data: batches }, { data: enrols }, { data: people }] = await Promise.all([
    supabase.from("batches").select("*").order("created_at", { ascending: false }),
    supabase.from("enrolments").select("id, status, user_id, created_at, batches(title)").order("created_at", { ascending: false }).limit(500),
    supabase.from("profiles").select("id, full_name, email"),
  ]);
  const name = new Map((people ?? []).map((p: any) => [p.id, p.full_name || p.email || "—"]));
  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Batches & enrolments</h1>
      <div className="mt-6 grid gap-10 xl:grid-cols-[320px_1fr]">
        <form action={createBatch} className="card grid gap-3 self-start">
          <h2 className="text-lg">New batch</h2>
          <label className="label">Title<input name="title" required className="input" placeholder="GenAI 2-day workshop" /></label>
          <label className="label">Course / track<select name="track" className="input">
            {courses.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            {tracks.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select></label>
          <label className="label">Institution (optional)<input name="institution" className="input" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="label">Starts<input name="starts_on" type="date" className="input" /></label>
            <label className="label">Ends<input name="ends_on" type="date" className="input" /></label>
          </div>
          <label className="label">Seats<input name="seats" type="number" defaultValue={60} className="input" /></label>
          <button className="btn-red">Create batch</button>
        </form>
        <div className="min-w-0">
          <h2 className="text-xl">Batches</h2>
          <ul className="mt-3 border-t border-rule">
            {(batches ?? []).map((b: any) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 border-b border-rule py-3">
                <span className="flex-1"><b className="font-medium">{b.title}</b> <span className="text-sm text-mute">· {b.track} · {b.starts_on ?? "TBA"} · {b.seats} seats</span></span>
                <span className="pill">{b.is_open ? "open" : "closed"}</span>
                <form action={toggleBatch}>
                  <input type="hidden" name="id" value={b.id} /><input type="hidden" name="title" value={b.title} /><input type="hidden" name="open" value={b.is_open ? "0" : "1"} />
                  <button className="text-sm underline">{b.is_open ? "Close" : "Reopen"}</button>
                </form>
              </li>
            ))}
            {!batches?.length && <li className="py-3 text-mute">No batches yet.</li>}
          </ul>
          <h2 className="mt-10 text-xl">Enrolments</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Student</th><th>Batch</th><th>Requested</th><th>Status</th></tr></thead>
              <tbody>
                {(enrols ?? []).map((e: any) => (
                  <tr key={e.id}>
                    <td><Link className="hover:underline" href={`/admin/students/${e.user_id}`}>{name.get(e.user_id) ?? "—"}</Link></td>
                    <td>{e.batches?.title}</td>
                    <td className="whitespace-nowrap text-mute">{ago(e.created_at)}</td>
                    <td>
                      <form action={updateEnrolment} className="flex gap-1">
                        <input type="hidden" name="id" value={e.id} /><input type="hidden" name="student" value={name.get(e.user_id) ?? ""} /><input type="hidden" name="batch" value={e.batches?.title ?? ""} />
                        <select name="status" defaultValue={e.status} className="input min-h-0 py-1 text-sm">{ENROL.map((s) => <option key={s}>{s}</option>)}</select>
                        <button className="btn-red min-h-0 px-3 py-1 text-sm">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!enrols?.length && <tr><td colSpan={4} className="text-mute">No enrolments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
