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
      <header className="text-white" style={{ background: c.color }}>
        <div className="wrap py-12">
          <Link href="/courses" className="text-sm underline">All courses</Link>
          <h1 className="mt-2 text-4xl font-extrabold">{c.name}</h1>
          <p className="mt-2 text-white/85">{c.labs.length} hands-on labs with Colab notebooks and datasets.</p>
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm"><span>Your progress</span><span>{n}/{c.labs.length}</span></div>
            <div className="mt-1 h-2 rounded-full bg-white/25"><div className="h-2 rounded-full bg-saffron" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
      </header>
      <ol className="wrap grid gap-4 py-10">
        {c.labs.map((l) => (
          <li key={l.lab}>
            <Link href={`/courses/${c.slug}/${l.lab}`} className="card flex flex-wrap items-center gap-4 hover:ring-2 hover:ring-saffron">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white font-display font-bold">{done.has(`${c.slug}/${l.lab}`) ? "✓" : l.num}</span>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{l.title}</h2>
                <p className="text-sm text-[#5d5550]">{l.track}</p>
              </div>
              {l.level && <span className="pill bg-white">{l.level}</span>}
              <span className="text-sm text-[#5d5550]">{l.time}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
