import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrack } from "@/lib/labs";
import { getUserAndProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: { track: string } }) {
  const t = getTrack(params.track);
  if (!t) notFound();
  let done = new Set<string>();
  try {
    const { supabase, user } = await getUserAndProfile();
    if (user) {
      const { data } = await supabase.from("lab_progress").select("lab_id").eq("user_id", user.id);
      done = new Set((data ?? []).map((r: any) => r.lab_id));
    }
  } catch {}
  const pct = Math.round((t.labs.filter((l) => done.has(l.id)).length / t.labs.length) * 100);
  return (
    <div>
      <header className="text-white" style={{ background: t.color }}>
        <div className="wrap py-12">
          <Link href="/labs" className="text-sm underline">All tracks</Link>
          <h1 className="mt-2 text-4xl font-extrabold">{t.name}</h1>
          <p className="mt-2 max-w-2xl text-white/85">{t.tagline}. For {t.audience}.</p>
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm"><span>Your progress</span><span>{pct}%</span></div>
            <div className="mt-1 h-2 rounded-full bg-white/25"><div className="h-2 rounded-full bg-saffron" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
      </header>
      <ol className="wrap grid gap-4 py-10">
        {t.labs.map((l, i) => (
          <li key={l.id}>
            <Link href={`/labs/${t.slug}/${l.id}`} className="card flex flex-wrap items-center gap-4 hover:ring-2 hover:ring-saffron">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white font-display font-bold">{done.has(l.id) ? "✓" : i + 1}</span>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{l.title}</h2>
                <p className="text-sm text-[#5d5550]">{l.summary}</p>
              </div>
              <span className="pill bg-white">{l.level}</span>
              <span className="text-sm text-[#5d5550]">{l.hours} hours</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
