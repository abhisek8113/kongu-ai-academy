import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrack } from "@/lib/labs";
import { getUserAndProfile } from "@/lib/supabase/server";
import { toggleLab } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function LabPage({ params }: { params: { track: string; lab: string } }) {
  const t = getTrack(params.track);
  const idx = t?.labs.findIndex((l) => l.id === params.lab) ?? -1;
  if (!t || idx < 0) notFound();
  const lab = t.labs[idx];
  const next = t.labs[idx + 1];
  let user: any = null, done = false, submission = "";
  try {
    const ctx = await getUserAndProfile();
    user = ctx.user;
    if (user) {
      const { data } = await ctx.supabase.from("lab_progress").select("*").eq("user_id", user.id).eq("lab_id", lab.id).maybeSingle();
      done = !!data; submission = data?.submission_url ?? "";
    }
  } catch {}
  const path = `/labs/${t.slug}/${lab.id}`;
  return (
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
      <article>
        <Link href={`/labs/${t.slug}`} className="text-sm font-semibold text-madder underline">{t.name}</Link>
        <h1 className="mt-2 text-4xl font-extrabold">{lab.title}</h1>
        <p className="mt-3 text-lg text-[#5d5550]">{lab.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill bg-cream">{lab.level}</span>
          <span className="pill bg-cream">{lab.hours} hours</span>
          {lab.tools.map((x) => <span key={x} className="pill bg-cream">{x}</span>)}
        </div>
        <h2 className="mt-10 text-2xl font-bold">You will learn to</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">{lab.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        <h2 className="mt-8 text-2xl font-bold">Lab steps</h2>
        <ol className="mt-3 space-y-3">
          {lab.steps.map((s, i) => (
            <li key={s} className="flex gap-3"><span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-madder font-bold text-white">{i + 1}</span><span className="pt-1">{s}</span></li>
          ))}
        </ol>
        <div className="card mt-8"><div className="text-sm font-semibold text-[#5d5550]">Deliverable</div><div className="mt-1 text-lg font-bold">{lab.deliverable}</div></div>
      </article>
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card">
          <h2 className="text-lg font-bold">Your progress</h2>
          {user ? (
            <form action={toggleLab} className="mt-3 grid gap-3">
              <input type="hidden" name="lab_id" value={lab.id} />
              <input type="hidden" name="path" value={path} />
              <input type="hidden" name="done" value={done ? "1" : "0"} />
              {!done && <label className="label">Submission link (GitHub, Drive, app)<input name="submission_url" type="url" className="input" placeholder="https://" /></label>}
              {done && submission && <a href={submission} className="break-all text-sm underline">{submission}</a>}
              <button className={done ? "btn-ghost text-madder" : "btn-red"}>{done ? "Mark as not done" : "Mark lab complete"}</button>
            </form>
          ) : (
            <p className="mt-2 text-sm">
              <Link href={`/login?next=${path}`} className="font-semibold text-madder underline">Log in</Link> or{" "}
              <Link href="/signup" className="font-semibold text-madder underline">join free</Link> to track progress and submit your work.
            </p>
          )}
        </div>
        {next && (
          <Link href={`/labs/${t.slug}/${next.id}`} className="card block hover:ring-2 hover:ring-saffron">
            <div className="text-sm text-[#5d5550]">Next lab</div><div className="font-bold">{next.title} →</div>
          </Link>
        )}
      </aside>
    </div>
  );
}
