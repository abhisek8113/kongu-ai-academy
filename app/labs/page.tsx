import Link from "next/link";
import { tracks } from "@/lib/labs";

export const metadata = { title: "Lab tracks" };

export default function LabsPage() {
  return (
    <div className="wrap pt-12">
      <p className="kicker">Lab tracks</p>
      <h1 className="mt-3 text-[40px] font-semibold leading-tight">Instructor-led lab tracks</h1>
      <p className="mt-3 max-w-2xl text-mute">Short, structured labs used in our workshops and FDPs: AI, machine learning and Microsoft Power Platform. Each lab lists its objectives, steps and deliverable.</p>
      {tracks.map((t, i) => (
        <section key={t.slug} className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink pb-3">
            <h2 className="text-2xl"><span className="font-mono text-[15px] text-mute">{String(i + 1).padStart(2, "0")}</span> <Link href={`/labs/${t.slug}`} className="hover:text-madder">{t.name}</Link></h2>
            <span className="text-sm text-mute">{t.tagline}</span>
          </div>
          <ol>
            {t.labs.map((l, j) => (
              <li key={l.id} className="border-b border-rule">
                <Link href={`/labs/${t.slug}/${l.id}`} className="group grid grid-cols-[3rem_1fr_auto] gap-4 py-3.5">
                  <span className="font-mono text-[13px] text-mute">{String(j + 1).padStart(2, "0")}</span>
                  <span className="group-hover:text-madder group-hover:underline">{l.title}</span>
                  <span className="font-mono text-[12px] text-mute">{l.level} · {l.hours}h</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
