import Link from "next/link";
import { courseLabs, courses } from "@/lib/courseLabs";
import { tracks } from "@/lib/labs";
import EnquiryForm from "@/components/EnquiryForm";
import NotebookPreview from "@/components/NotebookPreview";
import Catalogue from "@/components/Catalogue";

const offers = [
  { name: "Workshops", time: "1–3 days", price: "from ₹600 / student", body: "Hands-on sessions on Python, machine learning, Generative AI or Power BI. Every student leaves with a finished notebook or dashboard." },
  { name: "Faculty development", time: "5 days", price: "from ₹75,000 / batch", body: "FDPs that hand your faculty the full lab kit: notebooks, datasets and step-by-step guides they can teach from next semester." },
  { name: "Value-added courses", time: "30–45 hours", price: "from ₹3,500 / student", body: "Semester courses built from these labs, mapped to Anna University or Bharathiar syllabi, with a capstone and certificate." },
];

export default function Home() {
  const rows = courses.flatMap((c) =>
    c.labs.map((l) => ({
      href: `/courses/${c.slug}/${l.lab}`, num: l.num, title: l.title, course: c.name, courseSlug: c.slug,
      level: l.level, time: l.time.replace("~", ""), data: l.datasets.filter((d) => !d.endsWith(".md")).slice(0, 2).join(", "),
    }))
  );
  return (
    <>
      <section className="wrap grid gap-12 pb-16 pt-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:pt-16">
        <div>
          <p className="kicker">Coimbatore · {courseLabs.length} Colab labs · real datasets</p>
          <h1 className="mt-4 text-[40px] leading-[1.05] sm:text-[52px]">Learn data science by running real notebooks.</h1>
          <p className="mt-5 max-w-lg text-lg text-mute">
            Kongu AI Academy teaches Python, machine learning and AI through labs you open in Google Colab and finish yourself. For students, colleges and teams across Tamil Nadu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses" className="btn-red">Browse the labs</Link>
            <a href="#demo" className="btn-ghost">Book a session for your college</a>
          </div>
        </div>
        <NotebookPreview />
      </section>

      <section className="wrap" id="catalogue">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink pt-6">
          <h2 className="text-3xl">The catalogue</h2>
          <p className="max-w-md text-sm text-mute">Each lab has a lesson, a Colab notebook, a dataset and a self-check. Free to read; log in to track your progress.</p>
        </div>
        <div className="mt-6">
          <Catalogue rows={rows} courses={courses.map((c) => ({ slug: c.slug, name: c.name, count: c.labs.length }))} />
        </div>
        <p className="mt-6 text-sm text-mute">
          Also available as instructor-led tracks: {tracks.map((t, i) => (
            <span key={t.slug}>{i > 0 && ", "}<Link href={`/labs/${t.slug}`} className="text-ink underline hover:text-madder">{t.name}</Link></span>
          ))}.
        </p>
      </section>

      <section className="wrap mt-24" id="institutions">
        <div className="border-t border-ink pt-6">
          <h2 className="text-3xl">For colleges and schools</h2>
        </div>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {offers.map((o) => (
            <div key={o.name} className="border-t border-rule pt-5">
              <h3 className="text-xl">{o.name}</h3>
              <p className="mt-1 font-mono text-[13px] text-mute">{o.time} · {o.price}</p>
              <p className="mt-4 text-[15px]">{o.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-mute">CBSE schools: support for AI subjects 417 and 843, from Class 9. Prices exclude GST.</p>
      </section>

      <section className="wrap mt-24 grid gap-12 lg:grid-cols-2">
        <div className="border-t border-ink pt-6">
          <h2 className="text-3xl">Who teaches</h2>
          <p className="mt-5 text-lg">Abhisek M</p>
          <p className="text-mute">Founder and lead trainer</p>
          <dl className="mt-6 grid grid-cols-[8rem_1fr] gap-y-3 text-[15px]">
            <dt className="font-mono text-[13px] text-mute">Education</dt><dd>M.Sc Statistics, PSG College of Arts and Science</dd>
            <dt className="font-mono text-[13px] text-mute">Experience</dt><dd>6 years teaching and training</dd>
            <dt className="font-mono text-[13px] text-mute">Corporate</dt><dd>Data analytics and AI training, including for SLB</dd>
            <dt className="font-mono text-[13px] text-mute">Colleges</dt><dd>Programmes at KGiSL, Nandha and Kaleeswari</dd>
          </dl>
        </div>
        <div id="demo" className="scroll-mt-24 border-t border-ink pt-6">
          <h2 className="text-3xl">Book a free demo</h2>
          <p className="mb-6 mt-3 text-mute">A 90-minute session for one class. We'll reply within 48 hours with a date and a syllabus.</p>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
