import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { tracks, allLabs } from "@/lib/labs";
import { updateEnquiryStatus, createBatch, toggleBatch, updateEnrolment, issueCertificate } from "@/app/actions";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const LEAD = ["New", "Contacted", "Demo booked", "Proposal sent", "Won", "Lost"];
const ENROL = ["Requested", "Confirmed", "Completed", "Cancelled"];

export default async function Admin() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) redirect("/login?next=/admin");
  if (profile?.role !== "admin") redirect("/dashboard");

  const [{ data: leads }, { data: batches }, { data: enrols }, { data: students }, { data: certs }, { data: progress }] = await Promise.all([
    supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("batches").select("*").order("created_at", { ascending: false }),
    supabase.from("enrolments").select("id, status, user_id, batches(title)").order("created_at", { ascending: false }).limit(200),
    supabase.from("profiles").select("id, full_name, institution, phone, role").order("created_at", { ascending: false }).limit(500),
    supabase.from("certificates").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("lab_progress").select("user_id, lab_id"),
  ]);
  const name = new Map((students ?? []).map((s: any) => [s.id, s.full_name || "—"]));
  const labsDone = new Map<string, number>();
  (progress ?? []).forEach((p: any) => labsDone.set(p.user_id, (labsDone.get(p.user_id) ?? 0) + 1));
  const won = (leads ?? []).filter((l: any) => l.status === "Won").length;
  const stats = [
    ["Leads", leads?.length ?? 0], ["Won", won], ["Open batches", (batches ?? []).filter((b: any) => b.is_open).length],
    ["Students", (students ?? []).filter((s: any) => s.role === "student").length], ["Labs completed", progress?.length ?? 0], ["Certificates", certs?.length ?? 0],
  ];

  return (
    <div className="wrap py-12">
      <h1 className="text-[40px] font-semibold leading-tight">Admin</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([k, v]) => (
          <div key={k as string} className="card p-4"><div className="text-sm text-mute">{k}</div><div className="font-display text-3xl font-semibold">{v}</div></div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Leads and demo requests</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Date</th><th>Name</th><th>Institution</th><th>Phone</th><th>Interest</th><th>Pax</th><th>Status</th></tr></thead>
            <tbody>
              {(leads ?? []).map((l: any) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap">{l.created_at.slice(0, 10)}</td>
                  <td>{l.name}{l.message && <div className="text-xs text-mute">{l.message}</div>}</td>
                  <td>{l.institution}</td>
                  <td className="whitespace-nowrap"><a className="underline" href={`https://wa.me/91${String(l.phone).replace(/\D/g, "").slice(-10)}`}>{l.phone}</a></td>
                  <td>{l.interest}</td>
                  <td>{l.participants ?? "—"}</td>
                  <td>
                    <form action={updateEnquiryStatus} className="flex gap-1">
                      <input type="hidden" name="id" value={l.id} />
                      <select name="status" defaultValue={l.status} className="input min-h-0 py-1 text-sm">{LEAD.map((s) => <option key={s}>{s}</option>)}</select>
                      <button className="btn-red min-h-0 px-3 py-1 text-sm">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
              {(leads ?? []).length === 0 && <tr><td colSpan={7}>No leads yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[360px_1fr]">
        <form action={createBatch} className="card grid gap-3 self-start">
          <h2 className="text-xl font-bold">New batch</h2>
          <label className="label">Title<input name="title" required className="input" placeholder="GenAI 2-day workshop" /></label>
          <label className="label">Track<select name="track" className="input">{tracks.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}</select></label>
          <label className="label">Institution (optional)<input name="institution" className="input" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="label">Starts<input name="starts_on" type="date" className="input" /></label>
            <label className="label">Ends<input name="ends_on" type="date" className="input" /></label>
          </div>
          <label className="label">Seats<input name="seats" type="number" defaultValue={60} className="input" /></label>
          <button className="btn-red">Create batch</button>
        </form>
        <div>
          <h2 className="text-2xl font-bold">Batches</h2>
          <ul className="mt-4 grid gap-2">
            {(batches ?? []).map((b: any) => (
              <li key={b.id} className="card flex flex-wrap items-center gap-3 p-4">
                <span className="flex-1"><b>{b.title}</b> <span className="text-sm text-mute">· {b.track} · {b.starts_on ?? "TBA"} · {b.seats} seats</span></span>
                <form action={toggleBatch}>
                  <input type="hidden" name="id" value={b.id} /><input type="hidden" name="open" value={b.is_open ? "0" : "1"} />
                  <button className="btn-ghost min-h-0 px-3 py-1 text-sm text-madder">{b.is_open ? "Close enrolment" : "Reopen"}</button>
                </form>
              </li>
            ))}
            {(batches ?? []).length === 0 && <li className="card p-4">No batches yet.</li>}
          </ul>
          <h2 className="mt-8 text-2xl font-bold">Enrolments</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Student</th><th>Batch</th><th>Status</th></tr></thead>
              <tbody>
                {(enrols ?? []).map((e: any) => (
                  <tr key={e.id}>
                    <td>{name.get(e.user_id) ?? "—"}</td><td>{e.batches?.title}</td>
                    <td>
                      <form action={updateEnrolment} className="flex gap-1">
                        <input type="hidden" name="id" value={e.id} />
                        <select name="status" defaultValue={e.status} className="input min-h-0 py-1 text-sm">{ENROL.map((s) => <option key={s}>{s}</option>)}</select>
                        <button className="btn-red min-h-0 px-3 py-1 text-sm">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {(enrols ?? []).length === 0 && <tr><td colSpan={3}>No enrolments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[360px_1fr]">
        <form action={issueCertificate} className="card grid gap-3 self-start">
          <h2 className="text-xl font-bold">Issue certificate</h2>
          <label className="label">Student account (optional)
            <select name="user_id" className="input"><option value="">— Not linked —</option>{(students ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)}</option>)}</select>
          </label>
          <label className="label">Name on certificate<input name="recipient_name" required className="input" /></label>
          <label className="label">Programme<input name="programme" required className="input" placeholder="2-day Generative AI workshop" /></label>
          <label className="label">Institution<input name="institution" className="input" /></label>
          <button className="btn-red">Issue</button>
        </form>
        <div>
          <h2 className="text-2xl font-bold">Students</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Name</th><th>Institution</th><th>Phone</th><th className="text-right">Labs done (of {allLabs.length})</th></tr></thead>
              <tbody>
                {(students ?? []).filter((s: any) => s.role === "student").map((s: any) => (
                  <tr key={s.id}><td>{s.full_name || "—"}</td><td>{s.institution || "—"}</td><td>{s.phone || "—"}</td><td className="text-right">{labsDone.get(s.id) ?? 0}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="mt-8 text-2xl font-bold">Certificates issued</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {(certs ?? []).map((c: any) => <li key={c.id} className="card p-3"><b>{c.id}</b> · {c.recipient_name} · {c.programme} · {c.issued_on}</li>)}
            {(certs ?? []).length === 0 && <li className="card p-3">None yet.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
