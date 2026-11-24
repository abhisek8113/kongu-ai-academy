import Link from "next/link";
import { tracks } from "@/lib/labs";
import EnquiryForm from "@/components/EnquiryForm";
import Loom from "@/components/Loom";

const formats = [
  ["90-minute demo session", "Any department or school", "Free"],
  ["1-day school workshop", "Classes 6–12, up to 60", "₹250 / student"],
  ["1-day college workshop", "UG students, up to 60", "₹600 / student"],
  ["2–3 day hands-on workshop", "UG / PG students", "₹1,200 / student"],
  ["5-day FDP", "Faculty, 30–40", "₹75,000 / batch"],
  ["30-hour value-added course", "Semester batch", "₹3,500 / student"],
  ["Corporate Power Platform / AI training", "Teams", "On request"],
];

export default function Home() {
  const labCount = tracks.reduce((n, t) => n + t.labs.length, 0);
  return (
    <>
      <section className="bg-madder text-white">
        <div className="wrap grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Hands-on AI, ML and Power Platform labs for colleges, schools and teams
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[#f6dfe2]">
              Practitioner-led workshops, FDPs and lab courses from Coimbatore. Every learner builds a real project, and we stay with them for 30 days afterwards.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/labs" className="btn-sun">Explore {labCount} labs</Link>
              <a href="#demo" className="btn-ghost text-white">Book a free demo</a>
            </div>
            <dl className="mt-9 flex flex-wrap gap-8 border-t border-white/20 pt-6">
              <div><dt className="font-display text-2xl font-extrabold">{tracks.length} tracks</dt><dd className="text-sm text-[#f2cfd4]">AI · ML · Power BI · Power Apps · Power Automate</dd></div>
              <div><dt className="font-display text-2xl font-extrabold">6 years</dt><dd className="text-sm text-[#f2cfd4]">teaching and corporate training</dd></div>
              <div><dt className="font-display text-2xl font-extrabold">30 days</dt><dd className="text-sm text-[#f2cfd4]">post-training project support</dd></div>
            </dl>
          </div>
          <Loom />
        </div>
      </section>

      <section className="wrap py-16">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Five lab tracks, one portal</h2>
        <p className="mt-3 max-w-2xl text-[#5d5550]">Each lab has objectives, step-by-step tasks and a deliverable for the learner's portfolio. Learners track their progress in their dashboard.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => (
            <Link key={t.slug} href={`/labs/${t.slug}`} className="card group flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-xl font-display text-lg font-extrabold text-white" style={{ background: t.color }}>{t.short}</span>
              <h3 className="text-xl font-bold">{t.name}</h3>
              <p className="text-[#5d5550]">{t.tagline}</p>
              <span className="mt-auto text-sm font-semibold text-madder">{t.labs.length} labs →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="wrap">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Formats and starting prices</h2>
          <p className="mt-3 text-[#5d5550]">Programmes are mapped to Anna University, Bharathiar University or CBSE (AI 417/843) syllabi.</p>
          <div className="mt-6 overflow-x-auto">
            <table className="tbl bg-white">
              <thead><tr><th>Format</th><th>Who it is for</th><th className="text-right">Starts at</th></tr></thead>
              <tbody>
                {formats.map((f) => (
                  <tr key={f[0]}><td className="font-semibold">{f[0]}</td><td>{f[1]}</td><td className="whitespace-nowrap text-right font-semibold">{f[2]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[#5d5550]">Prices exclude GST. Travel outside Coimbatore at actuals.</p>
        </div>
      </section>

      <section className="wrap grid gap-10 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Taught by a working data scientist</h2>
          <ul className="mt-5 list-disc space-y-2 pl-5">
            <li>Abhisek M: M.Sc Statistics (PSG College of Arts and Science), B.Sc Mathematics</li>
            <li>6 years of teaching and training, from school students to corporate teams</li>
            <li>Corporate trainer in data analytics and AI, including programmes for SLB</li>
            <li>Programmes delivered at KGiSL, Nandha and Kaleeswari colleges</li>
          </ul>
        </div>
        <div id="demo" className="card scroll-mt-24">
          <h2 className="text-2xl font-extrabold">Book a free 90-minute demo</h2>
          <p className="mb-4 mt-2 text-sm text-[#5d5550]">We'll suggest the right format and send a syllabus within 48 hours.</p>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
