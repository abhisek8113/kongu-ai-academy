import Link from "next/link";
import { tracks } from "@/lib/labs";

export const metadata = { title: "Labs" };

export default function LabsPage() {
  return (
    <div className="wrap py-12">
      <h1 className="text-4xl font-extrabold">Lab tracks</h1>
      <p className="mt-3 max-w-2xl text-[#5d5550]">Pick a track. Each lab lists its objectives, steps and the deliverable you add to your portfolio. Log in to track your progress.</p>
      <div className="mt-8 grid gap-6">
        {tracks.map((t) => (
          <section key={t.slug} className="card">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl font-display font-extrabold text-white" style={{ background: t.color }}>{t.short}</span>
              <div>
                <h2 className="text-2xl font-extrabold"><Link href={`/labs/${t.slug}`} className="hover:underline">{t.name}</Link></h2>
                <p className="text-sm text-[#5d5550]">{t.tagline} · For {t.audience}</p>
              </div>
              <Link href={`/labs/${t.slug}`} className="btn-red ml-auto">Open track</Link>
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {t.labs.map((l) => (
                <li key={l.id}>
                  <Link href={`/labs/${t.slug}/${l.id}`} className="flex justify-between gap-3 rounded-lg bg-white px-3 py-2 hover:ring-2 hover:ring-saffron">
                    <span>{l.title}</span><span className="whitespace-nowrap text-sm text-[#5d5550]">{l.level} · {l.hours}h</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
