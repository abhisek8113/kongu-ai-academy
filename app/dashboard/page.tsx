import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { courses } from "@/lib/courseLabs";
import { tracks } from "@/lib/labs";
import { getUnpublished } from "@/lib/published";
import { ago, labTitle, describe } from "@/lib/admin";
import { statusClass } from "@/lib/tickets";
import ReportIssue from "@/components/ReportIssue";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const labHref = (id: string) => {
  if (id.startsWith("playground/")) return "/" + id.split("/").slice(0, 2).join("/");
  if (id.includes("/")) return `/courses/${id}`;
  const t = tracks.find((t) => t.labs.some((l) => l.id === id));
  return t ? `/labs/${t.slug}/${id}` : "/courses";
};

export default async function Dashboard() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) redirect("/login?next=/dashboard");
  const [off, { data: progress }, { data: activity }, { data: tickets }, { data: news }, { data: enrolments }, { data: certs }] = await Promise.all([
    getUnpublished(),
    supabase.from("lab_progress").select("lab_id, completed_at").eq("user_id", user.id),
    supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(60),
    supabase.from("support_tickets").select("id, category, status, updated_at").eq("user_id", user.id).not("status", "in", "(Resolved,Closed)").order("updated_at", { ascending: false }),
    supabase.from("announcements").select("*").eq("published", true).order("created_at", { ascending: false }).limit(4),
    supabase.from("enrolments").select("id, status, batches(title, starts_on)").eq("user_id", user.id),
    supabase.from("certificates").select("*").eq("user_id", user.id),
  ]);
  const done = new Set((progress ?? []).map((p: any) => p.lab_id));
  const groups = [
    ...courses.map((c) => ({ name: c.name, href: `/courses/${c.slug}`, ids: c.labs.map((l) => `${c.slug}/${l.lab}`) })),
    ...tracks.map((t) => ({ name: t.name, href: `/labs/${t.slug}`, ids: t.labs.map((l) => l.id) })),
  ].map((g) => ({ ...g, ids: g.ids.filter((i) => !off.has(i)) })).filter((g) => g.ids.length);
  const available = groups.reduce((n, g) => n + g.ids.length, 0) + ["playground/python", "playground/sql"].filter((p) => !off.has(p)).length;
  const completed = groups.reduce((n, g) => n + g.ids.filter((i) => done.has(i)).length, 0);
  const recent: { id: string; title: string; at: string }[] = [];
  const seen = new Set<string>();
  (activity ?? []).filter((a: any) => a.action === "lab_open" && a.meta?.lab).forEach((a: any) => {
    if (!seen.has(a.meta.lab) && recent.length < 5) { seen.add(a.meta.lab); recent.push({ id: a.meta.lab, title: a.meta.title ?? labTitle(a.meta.lab), at: a.created_at }); }
  });
  const approved = profile?.status === "approved" || profile?.role === "admin";

  return (
    <div className="wrap py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Student dashboard</p>
          <h1 className="mt-2 text-[36px] leading-tight">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
          <p className="mt-1 text-mute">{profile?.institution ? `${profile.institution} · ` : ""}{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/courses" className="btn-red min-h-[40px] px-4 text-sm">Browse labs</Link>
          <Link href="/playground" className="btn-ghost min-h-[40px] px-4 text-sm">Playgrounds</Link>
        </div>
      </div>

      {!approved && (
        <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-5">
          <p className="font-medium text-gold">{profile?.status === "rejected" ? "Your account was not approved." : "Your account is awaiting approval."}</p>
          <p className="mt-1 text-sm text-mute">{profile?.status === "rejected" ? "Please contact us on WhatsApp +91 95145 24599." : "You can open every lab and playground now. Saving progress and enrolment unlock once the academy approves your account."}</p>
        </div>
      )}

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule lg:grid-cols-4">
        {[["Labs available to you", available], ["Labs completed", completed], ["Open support issues", tickets?.length ?? 0], ["Certificates", certs?.length ?? 0]].map(([k, v]) => (
          <div key={k as string} className="bg-night p-5"><dt className="text-sm text-mute">{k}</dt><dd className="mt-1 font-display text-3xl font-semibold">{v}</dd></div>
        ))}
      </dl>

      <div className="mt-10 grid gap-10 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl">Learning progress</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {groups.map((g) => {
                const n = g.ids.filter((i) => done.has(i)).length, pct = Math.round((n / g.ids.length) * 100);
                return (
                  <Link key={g.name} href={g.href} className="rounded-xl border border-rule bg-panel/60 p-4 transition hover:border-madder/60">
                    <div className="flex justify-between text-sm"><span className="font-medium">{g.name}</span><span className="font-mono text-[12px] text-mute">{n}/{g.ids.length}</span></div>
                    <div className="mt-3 h-1.5 rounded-full bg-rule"><div className="h-1.5 rounded-full bg-gradient-to-r from-madder to-cyan" style={{ width: `${pct}%` }} /></div>
                  </Link>
                );
              })}
            </div>
          </section>
          <section>
            <h2 className="text-xl">Recently opened labs</h2>
            <ul className="mt-3 divide-y divide-rule border-y border-rule">
              {recent.map((r) => <li key={r.id} className="flex justify-between gap-3 py-3"><Link href={labHref(r.id)} className="hover:text-cyan">{r.title}</Link><span className="text-xs text-mute">{ago(r.at)}</span></li>)}
              {!recent.length && <li className="py-4 text-mute">No labs opened yet — <Link href="/courses" className="text-ink underline">start with Lab 01</Link>.</li>}
            </ul>
          </section>
          <section>
            <h2 className="text-xl">Recent activity</h2>
            <ul className="mt-3 divide-y divide-rule border-y border-rule text-[15px]">
              {(activity ?? []).slice(0, 8).map((a: any) => <li key={a.id} className="flex justify-between gap-3 py-2.5"><span className="text-mute">You {describe(a)}</span><span className="whitespace-nowrap text-xs text-mute">{ago(a.created_at)}</span></li>)}
              {!activity?.length && <li className="py-4 text-mute">Nothing yet.</li>}
            </ul>
          </section>
        </div>
        <aside className="space-y-8">
          <section className="card">
            <h2 className="text-lg">Announcements</h2>
            <ul className="mt-3 space-y-4">
              {(news ?? []).map((n: any) => <li key={n.id}><p className="font-medium">{n.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-mute">{n.body}</p><p className="mt-1 text-xs text-mute">{ago(n.created_at)}</p></li>)}
              {!news?.length && <li className="text-sm text-mute">No announcements right now.</li>}
            </ul>
          </section>
          <section className="card">
            <div className="flex items-center justify-between"><h2 className="text-lg">Support</h2><Link href="/dashboard/issues" className="text-sm text-mute underline hover:text-ink">My issues</Link></div>
            <ul className="mt-3 space-y-2 text-sm">
              {(tickets ?? []).map((t: any) => <li key={t.id} className="flex items-center justify-between gap-2"><Link href={`/dashboard/issues/${t.id}`} className="hover:text-cyan">#{t.id} {t.category}</Link><span className={`pill ${statusClass(t.status)}`}>{t.status}</span></li>)}
              {!tickets?.length && <li className="text-mute">No open issues.</li>}
            </ul>
            <div className="mt-4"><ReportIssue /></div>
          </section>
          <section className="card">
            <h2 className="text-lg">Programmes & certificates</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {(enrolments ?? []).map((e: any) => <li key={e.id} className="flex justify-between gap-2"><span>{e.batches?.title}</span><span className="pill">{e.status}</span></li>)}
              {(certs ?? []).map((c: any) => <li key={c.id}><Link href={`/verify/${c.id}`} className="underline">{c.programme}</Link> <span className="font-mono text-[11px] text-mute">{c.id}</span></li>)}
              {!enrolments?.length && !certs?.length && <li className="text-mute">None yet. <Link href="/programmes" className="text-ink underline">See open programmes</Link>.</li>}
            </ul>
          </section>
          <Link href="/account/password" className="block text-sm text-mute underline hover:text-ink">Change password</Link>
        </aside>
      </div>
    </div>
  );
}
