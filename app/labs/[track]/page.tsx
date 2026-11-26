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
      <header className="border-b border-ink">
        <div className="wrap py-12">
          <Link href="/labs" className="kicker hover:text-ink">← All tracks</Link>
          <h1 className="mt-2 text-[40px] font-semibold leading-tight">{t.name}</h1>
          <p className="mt-2 max-w-2xl text-mute">{t.tagline}. For {t.audience}.</p>
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm"><span>Your progress</span><span>{pct}%</span></div>
            <div className="mt-1 h-1.5 bg-cream"><div className="h-1.5 bg-madder" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
      </header>
      <ol className="wrap py-6">
        {t.labs.map((l, i) => (
          <li key={l.id}>
            <Link href={`/labs/${t.slug}/${l.id}`} className="group flex flex-wrap items-center gap-4 border-b border-rule py-4">
              <span className="w-10 font-mono text-[13px] text-mute">{done.has(l.id) ? "✓" : i + 1}</span>
              <div className="flex-1">
                <h2 className="text-lg font-medium group-hover:text-madder group-hover:underline">{l.title}</h2>
                <p className="text-sm text-mute">{l.summary}</p>
              </div>
              <span className="pill">{l.level}</span>
              <span className="text-sm text-mute">{l.hours} hours</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
