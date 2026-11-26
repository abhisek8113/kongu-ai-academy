import Link from "next/link";
import { courseLabs, courses } from "@/lib/courseLabs";
import { catalog, planned } from "@/lib/catalog";
import HeroScene from "@/components/three/HeroScene";
import Journey from "@/components/home/Journey";
import LabsExplorer from "@/components/home/LabsExplorer";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import Testimonials from "@/components/home/Testimonials";

const trust = [
  ["25", "practical learning labs"],
  ["Real", "datasets in every lab"],
  ["Colab", "notebooks, nothing to install"],
  ["Colleges", "& corporate teams trained"],
];

const projects = [
  { title: "House Price Prediction", area: "Regression", href: "/courses/classical-ml/lab-02-housing-price-regression" },
  { title: "Customer Churn Prediction", area: "Classification · model card", href: "/courses/classical-ml/lab-13-capstone-churn-model-card" },
  { title: "Credit Risk Analysis", area: "Classification · fairness", href: "/courses/classical-ml/lab-05-credit-risk-german" },
  { title: "Customer Segmentation", area: "K-means clustering", href: "/courses/classical-ml/lab-08-kmeans-mall-segments" },
  { title: "SMS Spam Classification", area: "Naive Bayes from scratch", href: "/courses/python-data-foundations/lab-06-naive-bayes-sms-spam" },
  { title: "HR Attrition Analysis", area: "Analytics capstone", href: "/courses/python-data-foundations/lab-12-hr-attrition-capstone" },
  { title: "Sales Analytics Dashboard", area: "Power BI", href: "/labs/power-bi/bi-04" },
  { title: "Chat-with-your-PDFs App", area: "Generative AI · RAG", href: "/labs/ai-labs/ai-03" },
];

const services = [
  ["AI & ML workshops", "1–3 day hands-on sessions; every student finishes a working notebook."],
  ["Python training", "From first program to pandas, for beginners and non-CS departments."],
  ["Data Science training", "EDA, statistics, ML and deployment on real datasets."],
  ["Generative AI workshops", "Prompting, LLM apps, RAG and agents, built live."],
  ["Power BI training", "Power Query, DAX and dashboards for business and commerce students."],
  ["Faculty Development Programmes", "5-day FDPs that hand faculty a complete lab kit to teach from."],
  ["Value-Added Courses", "30–45 hour semester courses mapped to your syllabus, with a capstone."],
  ["Custom institutional training", "Programmes designed around your department, batch and outcomes."],
];

const formats = [
  ["90-minute demo session", "Any department or school", "Free"],
  ["1-day school workshop", "Classes 6–12, up to 60", "₹250 / student"],
  ["1-day college workshop", "UG students, up to 60", "₹600 / student"],
  ["2–3 day hands-on workshop", "UG / PG students", "₹1,200 / student"],
  ["5-day Faculty Development Programme", "Faculty, 30–40", "₹75,000 / batch"],
  ["30-hour value-added course", "Semester batch", "₹3,500 / student"],
  ["Corporate AI / Power Platform training", "Teams", "On request"],
];

const why = [
  ["Practical first", "Every concept is taught by doing it in a notebook, not on slides."],
  ["Real datasets", "Retail, credit, HR, housing, SMS and more — the messy data you meet at work."],
  ["Google Colab", "Runs in the browser; students need no installation or powerful laptop."],
  ["Step-by-step exercises", "Each lab has a lesson, guided exercises and a self-check."],
  ["Industry examples", "Churn, credit risk, segmentation, dashboards: problems companies pay to solve."],
  ["Instructor-led", "A practising data science trainer in the room, not a recorded video."],
  ["Project-oriented", "Learners finish with projects they can show in interviews."],
  ["Institutional experience", "Programmes delivered at colleges and for corporate teams."],
];

const faq = [
  ["Who can join?", "College students, school students from Class 6, faculty, working professionals and corporate teams. Labs are grouped by level so everyone has a starting point."],
  ["Do I need programming knowledge?", "No. Python & Data Foundations starts from the basics. Later courses assume the foundations course or equivalent experience."],
  ["Are practical notebooks provided?", "Yes. Every course lab has a Google Colab notebook, a lesson and a dataset. Open it from the lab page and run it in your browser."],
  ["Will I work with real datasets?", "Yes — every lab ships with its dataset, such as retail sales, credit records, housing prices, SMS messages and HR data."],
  ["Is the training suitable for college students?", "Yes. Programmes are mapped to Anna University and Bharathiar University syllabi, and to CBSE AI subjects 417 and 843 for schools."],
  ["Do you offer college workshops?", "Yes — 1-day, 2–3 day and value-added course formats. See the formats and prices above."],
  ["Do you provide faculty development?", "Yes. 5-day FDPs give faculty the notebooks, datasets and guides to teach the labs themselves."],
  ["How can an institution arrange a training programme?", "Book a free demo below or WhatsApp +91 95145 24599. We agree the format, dates and syllabus, then send a written proposal."],
  ["How can I request a free demo?", "Fill in the demo form on this page. We reply within 48 hours with a date and a syllabus."],
];

export default function Home() {
  const labCards = courses.flatMap((c) =>
    c.labs.map((l) => ({
      id: l.lab, href: `/courses/${c.slug}/${l.lab}`, num: l.num, title: l.title, course: c.name, courseSlug: c.slug,
      track: l.track, level: l.level, time: l.time, colab: l.colab, skills: l.goals,
      datasets: l.datasets.filter((d) => /\.(csv|tsv|sqlite|json)$/.test(d)),
    }))
  );

  return (
    <>
      <Reveal />

      {/* HERO */}
      <section className="relative -mt-[68px] flex min-h-[100svh] flex-col overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(56,107,255,.22),transparent_55%),radial-gradient(ellipse_at_15%_80%,rgba(0,212,255,.08),transparent_50%)]" />
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute inset-y-0 right-[-35%] w-[110%] opacity-60 sm:right-[-15%] sm:opacity-100 lg:right-[-4%] lg:w-[62%]"><HeroScene /></div>
        <div className="wrap relative z-10 flex flex-1 items-center pb-12 pt-32 lg:pb-36">
          <div className="max-w-[640px]">
            <p className="kicker">Kongu AI Academy · Coimbatore</p>
            <h1 className="mt-5 text-[42px] leading-[1.03] sm:text-[64px]">
              <span className="grad-text">Build Your Future in Artificial Intelligence.</span>
            </h1>
            <p className="mt-6 max-w-[540px] text-lg text-mute">
              Master Python, Data Science, Machine Learning and Generative AI through practical projects, real datasets and hands-on laboratory experiences.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/#courses" className="btn-red">Explore Courses</Link>
              <Link href="/#demo" className="btn-ghost">Book a Free Demo</Link>
            </div>
            <p className="mt-6 font-display text-sm tracking-wide text-gold">Learn AI. Build Intelligence. Shape Tomorrow.</p>
          </div>
        </div>
        <div className="relative z-10 border-t border-white/10 bg-night/60 backdrop-blur-md lg:absolute lg:inset-x-0 lg:bottom-0">
          <dl className="wrap grid grid-cols-2 lg:grid-cols-4">
            {trust.map(([a, b], i) => (
              <div key={b} className={`py-5 ${i % 2 ? "border-l border-white/10 pl-5 lg:pl-8" : ""} ${i === 2 ? "lg:border-l lg:pl-8" : ""}`}>
                <dt className="font-display text-xl font-semibold text-ink sm:text-2xl">{a}</dt>
                <dd className="text-sm text-mute">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-rule bg-panel/40">
        <ul className="wrap flex flex-wrap justify-center gap-x-10 gap-y-3 py-6 text-sm text-mute">
          {["Practical training", "Real-world datasets", "Hands-on notebooks", "College training experience", "Industry-relevant curriculum", "Experienced instruction"].map((t) => (
            <li key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold" />{t}</li>
          ))}
        </ul>
      </section>

      {/* ABOUT + JOURNEY */}
      <section id="about" className="section">
        <div className="wrap">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div className="reveal">
              <p className="kicker">About the academy</p>
              <h2 className="h-section mt-4">Education Beyond Theory. Intelligence Through Practice.</h2>
            </div>
            <p className="reveal text-lg text-mute">
              Students learn by building: they load real data, clean it, analyse it, train models and explain the results, all in notebooks they keep. Click through the journey — every stage ends in a project.
            </p>
          </div>
          <div className="reveal mt-12"><Journey /></div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="section border-t border-rule bg-gradient-to-b from-deep/40 to-transparent">
        <div className="wrap">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker">Courses</p>
              <h2 className="h-section mt-4">Eight programmes. One practical method.</h2>
            </div>
            <p className="max-w-md text-mute">Self-paced courses come with Colab labs you can start today. Instructor-led programmes are delivered at your college or company.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {catalog.map((c) => (
              <article key={c.name} className="reveal group flex flex-col rounded-2xl border border-rule bg-panel/70 p-6 transition duration-300 hover:border-madder/50 hover:shadow-glow">
                <div className="flex items-center justify-between gap-2">
                  <span className={`pill ${c.status.startsWith("Self") ? "border-cyan/40 text-cyan" : "border-gold/40 text-gold"}`}>{c.status}</span>
                  {c.labs && <span className="font-mono text-[11px] text-mute">{c.labs} labs</span>}
                </div>
                <h3 className="mt-4 text-xl">{c.name}</h3>
                <p className="mt-2 text-sm text-mute">{c.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                  <div><dt className="text-mute">Level</dt><dd>{c.level}</dd></div>
                  <div><dt className="text-mute">Duration</dt><dd>{c.duration}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-1.5">{c.skills.map((s) => <span key={s} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[12px] text-mute">{s}</span>)}</div>
                <div className="mt-4 text-[13px]">
                  <p className="text-mute">You will be able to</p>
                  <ul className="mt-1 space-y-1">{c.outcomes.map((o) => <li key={o} className="flex gap-2"><span className="text-cyan">›</span>{o}</li>)}</ul>
                </div>
                <p className="mt-4 text-[13px]"><span className="text-mute">Projects: </span>{c.projects.join(" · ")}</p>
                <div className="mt-auto flex gap-2 pt-6">
                  {c.href && <Link href={c.href} className="btn-ghost min-h-[40px] flex-1 px-3 text-sm">View labs</Link>}
                  <Link href={`/?course=${encodeURIComponent(c.name)}#demo`} className="btn-red min-h-[40px] flex-1 px-3 text-sm">Enquire</Link>
                </div>
              </article>
            ))}
          </div>
          <p className="reveal mt-8 text-sm text-mute"><span className="text-gold">Planned:</span> {planned.join(", ")} — in development, not yet open for enrolment.</p>
        </div>
      </section>

      {/* LABS */}
      <section id="labs" className="section border-t border-rule">
        <div className="wrap">
          <div className="reveal grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <p className="kicker">AI learning labs</p>
              <h2 className="h-section mt-4">{courseLabs.length} labs. Real data. Open in Colab.</h2>
            </div>
            <p className="text-mute">Every lab has a lesson, a runnable Google Colab notebook, its dataset and a self-check. Search by topic, dataset or skill.</p>
          </div>
          <div className="mt-10">
            <LabsExplorer labs={labCards} courses={courses.map((c) => ({ slug: c.slug, name: c.name }))} />
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section border-t border-rule bg-gradient-to-b from-deep/30 to-transparent">
        <div className="wrap">
          <div className="reveal max-w-2xl">
            <p className="kicker">Projects</p>
            <h2 className="h-section mt-4">What learners build</h2>
            <p className="mt-4 text-mute">These are the demonstration projects inside our labs — every learner builds them. Student work will be shown here only with the student's permission.</p>
          </div>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {projects.map((p, i) => (
              <li key={p.title} className="reveal bg-night">
                <Link href={p.href} className="group flex h-full flex-col p-6 transition hover:bg-panel">
                  <span className="font-mono text-[11px] text-mute">{String(i + 1).padStart(2, "0")} · Lab project (demonstration)</span>
                  <span className="mt-6 font-display text-lg font-semibold group-hover:text-cyan">{p.title}</span>
                  <span className="mt-1 text-sm text-mute">{p.area}</span>
                  <span className="mt-6 text-sm text-madder-light">Open the lab →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* INSTITUTIONS */}
      <section id="institutions" className="section border-t border-rule">
        <div className="wrap">
          <div className="reveal grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="kicker">College & institutional training</p>
              <h2 className="h-section mt-4">Professional training for your campus.</h2>
            </div>
            <p className="text-mute">For engineering colleges, arts and science colleges, universities, schools and training institutions. Programmes are mapped to your syllabus and delivered on site or online.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {services.map(([t, d], i) => (
              <div key={t} className="reveal bg-night p-6">
                <span className="font-mono text-[11px] text-cyan">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-[17px]">{t}</h3>
                <p className="mt-2 text-sm text-mute">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="reveal">
              <h3 className="text-2xl">Formats and starting prices</h3>
              <div className="mt-5 overflow-x-auto rounded-xl border border-rule">
                <table className="tbl">
                  <thead><tr><th>Format</th><th>Who it is for</th><th className="text-right">Starts at</th></tr></thead>
                  <tbody>
                    {formats.map((f) => <tr key={f[0]}><td className="font-medium">{f[0]}</td><td className="text-mute">{f[1]}</td><td className="whitespace-nowrap text-right font-medium text-gold">{f[2]}</td></tr>)}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-mute">Prices exclude GST. Travel outside Coimbatore at actuals.</p>
            </div>
            <div className="reveal glass p-6 sm:p-8">
              <h3 className="text-xl">What every programme includes</h3>
              <ul className="mt-5 space-y-3 text-[15px]">
                {["Practical, instructor-led delivery", "Clear learning outcomes per session", "Course materials and step-by-step guides", "Real datasets for every exercise", "Hands-on exercises in Google Colab", "Certificates, verifiable online", "Faculty support for follow-up teaching"].map((x) => (
                  <li key={x} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />{x}</li>
                ))}
              </ul>
              <Link href="/?course=Institutional%20training#demo" className="btn-gold mt-7 w-full">Request an institutional proposal</Link>
            </div>
          </div>

          <div id="corporate" className="reveal mt-16 scroll-mt-24 rounded-2xl border border-gold/25 bg-gradient-to-br from-deep to-night p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="kicker !text-gold">Corporate training</p>
                <h3 className="mt-3 text-2xl sm:text-3xl">AI, analytics and automation for teams.</h3>
                <p className="mt-3 text-mute">Data analytics, Power BI, Power Apps, Power Automate and Generative AI training for working teams, built around your own processes and data. Delivered by a trainer with corporate analytics and AI training experience, including SLB.</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {["Data analytics", "Power BI", "Power Apps", "Power Automate", "Generative AI", "Python for analysts"].map((x) => <span key={x} className="pill border-gold/30 text-ink">{x}</span>)}
                <Link href="/?course=Corporate%20training#demo" className="btn-red mt-3 w-full lg:w-auto">Discuss team training</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section id="instructor" className="section border-t border-rule bg-gradient-to-b from-deep/30 to-transparent">
        <div className="wrap grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="reveal relative mx-auto aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,107,255,.35),transparent_60%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[88px] font-semibold text-ink/90">AM</span>
            </div>
            <div className="gold-rule absolute inset-x-6 bottom-16" />
            <p className="absolute inset-x-0 bottom-6 text-center font-display text-sm tracking-wide text-gold">Founder & Lead Trainer</p>
          </div>
          <div className="reveal">
            <p className="kicker">Your instructor</p>
            <h2 className="h-section mt-4">Abhisek M</h2>
            <p className="mt-2 text-lg text-gold">Founder & Lead Trainer</p>
            <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                ["Academic background", "M.Sc. Statistics, PSG College of Arts and Science"],
                ["Experience", "Six years of teaching and training"],
                ["Corporate training", "Data analytics and AI training, including SLB"],
                ["Colleges", "Training programmes at KGiSL, Nandha and Kaleeswari"],
                ["Technical expertise", "Python, statistics, machine learning, Generative AI, Power BI, SQL"],
                ["Curriculum", "Author of the academy's lab courses and Colab notebooks"],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-line pt-3"><dt className="text-sm text-mute">{k}</dt><dd className="mt-1">{v}</dd></div>
              ))}
            </dl>
            <blockquote className="mt-8 border-l-2 border-gold pl-5 text-lg text-ink/90">
              Teaching approach: you understand a method once you have run it on real data, broken it, and fixed it yourself.
            </blockquote>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section border-t border-rule">
        <div className="wrap">
          <div className="reveal max-w-2xl">
            <p className="kicker">Why Kongu AI Academy</p>
            <h2 className="h-section mt-4">Built around doing, not watching.</h2>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {why.map(([t, d]) => (
              <div key={t} className="reveal border-t border-line pt-5">
                <h3 className="text-[17px]">{t}</h3>
                <p className="mt-2 text-sm text-mute">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* DEMO */}
      <section id="demo" className="section scroll-mt-16 border-t border-rule bg-[radial-gradient(ellipse_at_80%_20%,rgba(56,107,255,.16),transparent_55%)]">
        <div className="wrap grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal">
            <p className="kicker">Free demo</p>
            <h2 className="h-section mt-4">Experience Practical AI Learning Before You Enrol.</h2>
            <p className="mt-5 text-lg text-mute">A free 90-minute session for your class, department or team. We reply within 48 hours with a date and a syllabus.</p>
            <ul className="mt-8 space-y-4 text-[15px]">
              <li><span className="text-mute">WhatsApp / phone</span><br /><a className="text-lg hover:text-cyan" href="https://wa.me/919514524599">+91 95145 24599</a></li>
              <li><span className="text-mute">Email</span><br /><a className="text-lg hover:text-cyan" href="mailto:abhisekmurugesan@gmail.com">abhisekmurugesan@gmail.com</a></li>
              <li><span className="text-mute">Based in</span><br /><span className="text-lg">Coimbatore, Tamil Nadu · serving institutions across India</span></li>
            </ul>
          </div>
          <div className="reveal glass p-6 sm:p-8"><EnquiryForm /></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section border-t border-rule">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal">
            <p className="kicker">FAQ</p>
            <h2 className="h-section mt-4">Questions, answered.</h2>
          </div>
          <div className="reveal divide-y divide-rule border-y border-rule">
            {faq.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                  {q}<span className="text-xl text-cyan transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-mute">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "Kongu AI Academy",
        slogan: "Learn AI. Build Intelligence. Shape Tomorrow.",
        url: "https://kongu-ai-academy.vercel.app",
        email: "abhisekmurugesan@gmail.com",
        telephone: "+91-95145-24599",
        address: { "@type": "PostalAddress", addressLocality: "Coimbatore", addressRegion: "Tamil Nadu", addressCountry: "IN" },
        founder: { "@type": "Person", name: "Abhisek M", jobTitle: "Founder & Lead Trainer" },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }) }} />
    </>
  );
}
