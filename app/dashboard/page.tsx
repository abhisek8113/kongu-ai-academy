import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { tracks } from "@/lib/labs";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) redirect("/login?next=/dashboard");
  const [{ data: progress }, { data: enrolments }, { data: certs }] = await Promise.all([
    supabase.from("lab_progress").select("lab_id, completed_at").eq("user_id", user.id),
    supabase.from("enrolments").select("id, status, batches(title, track, starts_on)").eq("user_id", user.id),
    supabase.from("certificates").select("*").eq("user_id", user.id),
  ]);
  const done = new Set((progress ?? []).map((p: any) => p.lab_id));
  const total = tracks.reduce((n, t) => n + t.labs.length, 0);
  return (
    <div className="wrap py-12">
      <h1 className="text-[40px] font-semibold leading-tight">Hello{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
      {profile?.status !== "approved" && profile?.role !== "admin" && (
        <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-5">
          <p className="font-medium text-gold">{profile?.status === "rejected" ? "Your account was not approved." : "Your account is awaiting approval."}</p>
          <p className="mt-1 text-sm text-mute">{profile?.status === "rejected" ? "Please contact us on WhatsApp +91 95145 24599." : "You can read every lesson now. Kongu AI Academy will approve your account shortly — then you can track progress and enrol."}</p>
        </div>
      )}
      <p className="mt-2 text-mute">{done.size} of {total} labs completed{profile?.institution ? ` · ${profile.institution}` : ""}</p>

      <h2 className="mt-10 text-2xl font-bold">Lab progress</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((t) => {
          const n = t.labs.filter((l) => done.has(l.id)).length;
          const pct = Math.round((n / t.labs.length) * 100);
          return (
            <Link key={t.slug} href={`/labs/${t.slug}`} className="card hover:border-line">
              <div className="flex items-center justify-between"><span className="font-bold">{t.name}</span><span className="text-sm">{n}/{t.labs.length}</span></div>
              <div className="mt-3 h-1.5 bg-cream"><div className="h-1.5 bg-madder" style={{ width: `${pct}%` }} /></div>
              <div className="mt-2 text-sm text-mute">{pct === 100 ? "Track complete" : n === 0 ? "Start track →" : "Continue →"}</div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold">My programmes</h2>
          {(enrolments ?? []).length === 0 ? (
            <p className="card mt-4">No enrolments yet. <Link href="/programmes" className="font-semibold text-madder underline">Browse open programmes</Link>.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {(enrolments ?? []).map((e: any) => (
                <li key={e.id} className="card flex items-center justify-between gap-3">
                  <span><b>{e.batches?.title}</b><br /><span className="text-sm text-mute">{e.batches?.starts_on ?? "Date to be announced"}</span></span>
                  <span className="pill">{e.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-bold">My certificates</h2>
          {(certs ?? []).length === 0 ? (
            <p className="card mt-4">Certificates appear here once your programme is completed.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {(certs ?? []).map((c: any) => (
                <li key={c.id} className="card">
                  <b>{c.programme}</b>
                  <div className="text-sm text-mute">ID {c.id} · issued {c.issued_on}</div>
                  <Link href={`/verify/${c.id}`} className="text-sm font-semibold text-madder underline">Verification link</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
