import { SetPasswordForm } from "@/components/AdminUserForms";
import { grantAccess, revokeAccess } from "@/app/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage, ago, fmtTime, labTitle } from "@/lib/admin";
import { courses } from "@/lib/courseLabs";
import { tracks } from "@/lib/labs";
import ActivityFeed from "@/components/ActivityFeed";

export default async function StudentDetail({ params }: { params: { id: string } }) {
  const { supabase } = await requireAdminPage(`/admin/students/${params.id}`);
  const [{ data: p }, { data: progress }, { data: activity }, { data: enrols }, { data: certs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("lab_progress").select("*").eq("user_id", params.id).order("completed_at", { ascending: false }),
    supabase.from("activity_log").select("*").eq("user_id", params.id).order("created_at", { ascending: false }).limit(200),
    supabase.from("enrolments").select("id, status, created_at, batches(title)").eq("user_id", params.id),
    supabase.from("certificates").select("*").eq("user_id", params.id),
  ]);
  if (!p) notFound();
  const done = new Set((progress ?? []).map((r: any) => r.lab_id));
  const groups = [
    ...courses.map((c) => ({ name: c.name, ids: c.labs.map((l) => `${c.slug}/${l.lab}`) })),
    ...tracks.map((t) => ({ name: t.name, ids: t.labs.map((l) => l.id) })),
  ];
  const opened = new Set((activity ?? []).filter((a: any) => a.action === "lab_open").map((a: any) => a.meta?.lab));

  return (
    <div>
      <Link href="/admin/students" className="kicker hover:text-ink">← Students</Link>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight">{p.full_name || p.email || "Student"}</h1>
      <dl className="mt-4 grid grid-cols-[7rem_1fr] gap-y-1.5 text-[15px] sm:grid-cols-[7rem_1fr_7rem_1fr]">
        <dt className="font-mono text-[13px] text-mute">Email</dt><dd>{p.email ?? "—"}</dd>
        <dt className="font-mono text-[13px] text-mute">Phone</dt><dd>{p.phone ?? "—"}</dd>
        <dt className="font-mono text-[13px] text-mute">Institution</dt><dd>{p.institution ?? "—"}</dd>
        <dt className="font-mono text-[13px] text-mute">Role</dt><dd>{p.role}</dd>
        <dt className="font-mono text-[13px] text-mute">Joined</dt><dd>{fmtTime(p.created_at)}</dd>
        <dt className="font-mono text-[13px] text-mute">Last active</dt><dd>{ago(p.last_seen_at)}</dd>
      </dl>

      <AdminStudentExtras id={p.id} role={p.role} />

      <section className="mt-10">
        <h2 className="text-xl">Progress · {done.size} labs completed · {opened.size} opened</h2>
        <div className="mt-4 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {groups.map((g) => {
            const n = g.ids.filter((i) => done.has(i)).length;
            return (
              <div key={g.name}>
                <div className="flex justify-between text-sm"><span>{g.name}</span><span className="font-mono text-[12px] text-mute">{n}/{g.ids.length}</span></div>
                <div className="mt-1.5 flex gap-[3px]">
                  {g.ids.map((i) => (
                    <span key={i} title={`${labTitle(i)}${done.has(i) ? " — completed" : opened.has(i) ? " — opened" : ""}`}
                      className="h-3 flex-1" style={{ background: done.has(i) ? "#111" : opened.has(i) ? "#d9d9d6" : "#f5f5f3" }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[12px] text-mute">■ completed · <span className="text-[#bdbdb9]">■</span> opened · hover a square for the lab name</p>
      </section>

      <div className="mt-10 grid gap-10 xl:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="text-xl">Activity</h2>
          <div className="mt-3"><ActivityFeed rows={(activity ?? []) as any} showUser={false} /></div>
        </section>
        <section className="space-y-8">
          <div>
            <h2 className="text-xl">Completed labs</h2>
            <ul className="mt-3 border-t border-rule">
              {(progress ?? []).map((r: any) => (
                <li key={r.lab_id} className="border-b border-rule py-2 text-[15px]">
                  {labTitle(r.lab_id)} <span className="font-mono text-[12px] text-mute">· {ago(r.completed_at)}</span>
                  {r.submission_url && <a href={r.submission_url} target="_blank" rel="noreferrer" className="block truncate text-sm text-madder underline">{r.submission_url}</a>}
                </li>
              ))}
              {!progress?.length && <li className="py-3 text-mute">None yet.</li>}
            </ul>
          </div>
          <div>
            <h2 className="text-xl">Enrolments</h2>
            <ul className="mt-3 border-t border-rule">
              {(enrols ?? []).map((e: any) => <li key={e.id} className="flex justify-between border-b border-rule py-2 text-[15px]"><span>{e.batches?.title}</span><span className="pill">{e.status}</span></li>)}
              {!enrols?.length && <li className="py-3 text-mute">None.</li>}
            </ul>
          </div>
          <div>
            <h2 className="text-xl">Certificates</h2>
            <ul className="mt-3 border-t border-rule">
              {(certs ?? []).map((c: any) => <li key={c.id} className="border-b border-rule py-2 text-[15px]"><Link className="underline" href={`/verify/${c.id}`}>{c.id}</Link> · {c.programme}</li>)}
              {!certs?.length && <li className="py-3 text-mute">None.</li>}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}


async function AdminStudentExtras({ id, role }: { id: string; role: string }) {
  const { createClient } = await import("@/lib/supabase/server");
  const sb = createClient();
  const [{ data: subs }, { data: pays }, { data: subm }, { data: tix }, { data: plans }] = await Promise.all([
    sb.from("subscriptions").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    sb.from("payment_transactions").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    sb.from("task_submissions").select("id, lab_id, task_id, status, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    sb.from("support_tickets").select("id, category, status, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    sb.from("subscription_plans").select("id, name"),
  ]);
  const live = (subs ?? []).find((x: any) => ["active", "trial"].includes(x.status) && (!x.ends_at || new Date(x.ends_at) > new Date()));
  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-2">
      <section className="card">
        <h2 className="text-lg">Membership</h2>
        <p className="mt-2 text-sm">{role === "admin" ? "Administrator (full access)" : live ? <>Active until <b>{live.ends_at ? fmtTime(live.ends_at) : "no end date"}</b> · {live.source}</> : "No active membership — only the free demo lab is open."}</p>
        <form action={grantAccess} className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="user_id" value={id} />
          <label className="label w-24">Days<input name="days" type="number" min={1} defaultValue={30} className="input" /></label>
          <label className="label">Plan<select name="plan_id" className="input"><option value="">Complimentary</option>{(plans ?? []).map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <input name="note" placeholder="Note / UPI ref" className="input w-40" />
          <button className="btn-red min-h-[40px] px-4 text-sm">Grant / extend</button>
        </form>
        <ul className="mt-4 space-y-1 text-sm">
          {(subs ?? []).map((x: any) => <li key={x.id} className="flex flex-wrap items-center justify-between gap-2"><span>{x.source} · <span className="pill">{x.status}</span></span><span className="text-mute">{x.ends_at ? fmtTime(x.ends_at) : "—"}{["active", "trial"].includes(x.status) && <form action={revokeAccess} className="ml-2 inline"><input type="hidden" name="id" value={x.id} /><button className="text-xs text-[#FF8A8A] underline">Revoke</button></form>}</span></li>)}
        </ul>
        {!!pays?.length && <p className="mt-3 text-sm text-mute">Payments: {pays.map((x: any) => `₹${x.amount_paise / 100} ${x.status}`).join(" · ")}</p>}
      </section>
      {role !== "admin" ? <SetPasswordForm userId={id} /> : <div />}
      <section className="card">
        <h2 className="text-lg">Submissions</h2>
        <ul className="mt-2 space-y-1 text-sm">{(subm ?? []).map((x: any) => <li key={x.id} className="flex justify-between gap-2"><span>{x.lab_id} · {x.task_id}</span><span className="pill">{x.status}</span></li>)}{!subm?.length && <li className="text-mute">None.</li>}</ul>
        <Link href="/admin/submissions?status=all" className="mt-2 inline-block text-sm text-mute underline">Review submissions</Link>
      </section>
      <section className="card">
        <h2 className="text-lg">Issues</h2>
        <ul className="mt-2 space-y-1 text-sm">{(tix ?? []).map((x: any) => <li key={x.id} className="flex justify-between gap-2"><Link href={`/admin/issues/${x.id}`} className="hover:text-cyan">#{x.id} {x.category}</Link><span className="pill">{x.status}</span></li>)}{!tix?.length && <li className="text-mute">None.</li>}</ul>
      </section>
    </div>
  );
}
