import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/courseLabs";
import { getUserAndProfile } from "@/lib/supabase/server";
import { toggleLab } from "@/app/actions";
import LabViewer from "@/components/LabViewer";
import ColabButton from "@/components/ColabButton";
import ReportIssue from "@/components/ReportIssue";
import { requirePublished } from "@/lib/published";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export default async function CourseLabPage({ params }: { params: { course: string; lab: string } }) {
  const c = getCourse(params.course);
  const idx = c?.labs.findIndex((l) => l.lab === params.lab) ?? -1;
  if (!c || idx < 0) notFound();
  await requirePublished(`${params.course}/${params.lab}`);
  const l = c.labs[idx];
  const prev = c.labs[idx - 1], next = c.labs[idx + 1];
  const id = `${c.slug}/${l.lab}`;
  const path = `/courses/${id}`;
  let user: any = null, approved = false, done = false;
  try {
    const ctx = await getUserAndProfile();
    user = ctx.user;
    approved = ctx.profile?.status === "approved";
    if (user) {
      const { data } = await ctx.supabase.from("lab_progress").select("lab_id").eq("user_id", user.id).eq("lab_id", id).maybeSingle();
      done = !!data;
      await logActivity(ctx.supabase, user, "lab_open", { lab: id, title: l.title });
    }
  } catch {}
  return (
    <div className="wrap py-8">
      <Link href={`/courses/${c.slug}`} className="kicker hover:text-ink">← {c.name}</Link>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl"><span className="font-mono text-[0.6em] text-mute">{String(l.num).padStart(2, "0")}</span> {l.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {l.track && <span className="pill">{l.track}</span>}
        {l.level && <span className="pill">{l.level}</span>}
        {l.time && <span className="pill">{l.time}</span>}
        <span className="pill">Google Colab</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <LabViewer base={l.base} />
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card grid gap-3">
            <ColabButton href={l.colab} lab={id} title={l.title} />
            <ReportIssue lab={l.title} />
            <a href={`${l.base}/${l.notebook}`} download className="btn-ghost text-madder">Download notebook (.ipynb)</a>
            <a href={`${l.base}/bundle/dataset.zip`} download className="btn-ghost text-madder">Download dataset (.zip)</a>
            {l.datasets.length > 0 && <p className="text-xs text-mute">Includes: {l.datasets.join(", ")}</p>}
          </div>
          {l.goals.length > 0 && (
            <div className="card">
              <h2 className="font-bold">You will learn</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{l.goals.map((g) => <li key={g}>{g}</li>)}</ul>
            </div>
          )}
          <div className="card">
            <h2 className="font-bold">Your progress</h2>
            {user && !approved ? (
              <p className="mt-2 text-sm text-gold">Your account is awaiting approval. You can read the lesson and use the notebook now.</p>
            ) : user ? (
              <form action={toggleLab} className="mt-3">
                <input type="hidden" name="lab_id" value={id} />
                <input type="hidden" name="path" value={path} />
                <input type="hidden" name="done" value={done ? "1" : "0"} />
                <input type="hidden" name="title" value={l.title} />
                <button className={done ? "btn-ghost w-full text-madder" : "btn-red w-full"}>{done ? "✓ Completed · undo" : "Mark lab complete"}</button>
              </form>
            ) : (
              <p className="mt-2 text-sm"><Link href={`/login?next=${path}`} className="font-semibold text-madder underline">Log in</Link> to track progress.</p>
            )}
          </div>
          <div className="flex justify-between gap-2 text-sm font-semibold">
            {prev ? <Link href={`/courses/${c.slug}/${prev.lab}`} className="text-madder underline">← Lab {prev.num}</Link> : <span />}
            {next && <Link href={`/courses/${c.slug}/${next.lab}`} className="text-madder underline">Lab {next.num} →</Link>}
          </div>
        </aside>
      </div>
    </div>
  );
}
