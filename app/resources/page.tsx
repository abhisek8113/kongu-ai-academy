import Link from "next/link";
import { courses } from "@/lib/courseLabs";

export const metadata = { title: "Learning Resources", description: "Free lessons, notebooks, datasets and in-browser playgrounds from Kongu AI Academy." };

export default function Resources() {
  return (
    <div className="wrap py-12">
      <p className="kicker">Learning resources</p>
      <h1 className="mt-3 text-4xl">Learn by doing</h1>
      <p className="mt-3 max-w-2xl text-mute">Previews are public. Opening a full lab, notebook or playground needs a free student account.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Link href="/playground" className="card hover:border-madder/60"><span className="pill border-cyan/40 text-cyan">Runs in browser</span><h2 className="mt-3 text-xl">Python & SQL Playgrounds</h2><p className="mt-2 text-sm text-mute">9 graded exercises with instant checking.</p></Link>
        {courses.map((c) => (
          <Link key={c.slug} href={`/courses/${c.slug}`} className="card hover:border-madder/60"><span className="pill">Colab notebooks</span><h2 className="mt-3 text-xl">{c.name}</h2><p className="mt-2 text-sm text-mute">{c.labs.length} lessons with datasets and runnable notebooks.</p></Link>
        ))}
        <Link href="/labs" className="card hover:border-madder/60"><span className="pill border-gold/50 text-gold">Instructor-led</span><h2 className="mt-3 text-xl">AI, ML & Power Platform labs</h2><p className="mt-2 text-sm text-mute">Power BI, Power Apps and Power Automate need Microsoft tools, so these run in class.</p></Link>
      </div>
    </div>
  );
}
