import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/courseLabs";
import { getUserAndProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: { course: string } }) {
  const c = getCourse(params.course);
  if (!c) notFound();
  let done = new Set<string>();
  try {
    const { supabase, user } = await getUserAndProfile();
    if (user) {
      const { data } = await supabase.from("lab_progress").select("lab_id").eq("user_id", user.id);
      done = new Set((data ?? []).map((r: any) => r.lab_id));
    }
  } catch {}
  const n = c.labs.filter((l) => done.has(`${c.slug}/${l.lab}`)).length;
  const pct = Math.round((n / c.labs.length) * 100);
  return (
    <div>
      <header className="border-b border-ink">
        <div className="wrap py-12">
          <Link href="/courses" className="kicker hover:text-ink">← All courses</Link>
          <h1 className="mt-2 text-[40px] font-semibold leading-tight">{c.name}</h1>
          <p className="mt-2 text-mute">{c.labs.length} hands-on labs with Colab notebooks and datasets.</p>
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm"><span>Your progress</span><span>{n}/{c.labs.length}</span></div>
            <div className="mt-1 h-1.5 bg-cream"><div className="h-1.5 bg-madder" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
      </header>
      <ol className="wrap py-6">
        {c.labs.map((l) => (
          <li key={l.lab}>
            <Link href={`/courses/${c.slug}/${l.lab}`} className="group flex flex-wrap items-center gap-4 border-b border-rule py-4">
              <span className="w-10 font-mono text-[13px] text-mute">{done.has(`${c.slug}/${l.lab}`) ? "✓" : l.num}</span>
              <div className="flex-1">
                <h2 className="text-lg font-medium group-hover:text-madder group-hover:underline">{l.title}</h2>
                <p className="text-sm text-mute">{l.track}</p>
              </div>
              {l.level && <span className="pill">{l.level}</span>}
              <span className="text-sm text-mute">{l.time}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
