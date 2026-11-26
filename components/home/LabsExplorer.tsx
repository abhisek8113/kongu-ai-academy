"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import ColabButton from "@/components/ColabButton";

export type LabCard = {
  id: string; href: string; num: number; title: string; course: string; courseSlug: string;
  track: string; level: string; time: string; datasets: string[]; skills: string[]; colab: string;
};

const LEVELS = ["All levels", "Beginner", "Intermediate", "Advanced"];

export default function LabsExplorer({ labs, courses }: { labs: LabCard[]; courses: { slug: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("all");
  const [level, setLevel] = useState("All levels");
  const shown = useMemo(() => labs.filter((l) => {
    if (course !== "all" && l.courseSlug !== course) return false;
    if (level !== "All levels" && !l.level.toLowerCase().includes(level.toLowerCase())) return false;
    if (q) {
      const hay = `${l.title} ${l.track} ${l.datasets.join(" ")} ${l.skills.join(" ")}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [labs, q, course, level]);

  return (
    <div>
      <div className="glass flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search labs</span>
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" stroke="currentColor" fill="none" strokeWidth="1.5" /><path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search labs, datasets or skills" className="input border-transparent bg-night/40 pl-9" />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Course">
          {[{ slug: "all", name: "All courses" }, ...courses].map((c) => (
            <button key={c.slug} onClick={() => setCourse(c.slug)} aria-pressed={course === c.slug}
              className={`min-h-[40px] rounded-lg px-3 text-sm transition ${course === c.slug ? "bg-madder text-white" : "text-mute hover:bg-white/5 hover:text-ink"}`}>{c.name}</button>
          ))}
        </div>
        <label>
          <span className="sr-only">Difficulty</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="input min-h-[40px] w-auto bg-night/40">
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
      </div>

      <p className="mt-4 font-mono text-[12px] text-mute" aria-live="polite">{shown.length} of {labs.length} labs</p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((l) => (
          <li key={l.id} className="group relative flex flex-col rounded-xl border border-rule bg-panel/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-madder/60 hover:shadow-glow">
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-[12px] text-cyan">LAB {String(l.num).padStart(2, "0")}</span>
              <span className="pill">{l.course === "Python & Data Foundations" ? "Foundations" : "Classical ML"}</span>
            </div>
            <h3 className="mt-3 text-[17px] font-semibold leading-snug">
              <Link href={l.href} className="after:absolute after:inset-0 hover:text-cyan">{l.title}</Link>
            </h3>
            <p className="mt-1 text-sm text-mute">{l.track}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <div><dt className="text-mute">Difficulty</dt><dd>{l.level || "—"}</dd></div>
              <div><dt className="text-mute">Duration</dt><dd>{l.time.replace("~", "") || "—"}</dd></div>
              <div className="col-span-2"><dt className="text-mute">Dataset</dt><dd className="truncate font-mono text-[12px]">{l.datasets.join(", ") || "—"}</dd></div>
            </dl>
            {l.skills.length > 0 && (
              <ul className="mt-3 space-y-1 text-[13px] text-mute">
                {l.skills.slice(0, 3).map((s) => <li key={s} className="flex gap-2"><span className="text-cyan">›</span><span>{s}</span></li>)}
              </ul>
            )}
            <div className="relative z-10 mt-auto flex gap-2 pt-5">
              <ColabButton href={l.colab} lab={`${l.courseSlug}/${l.id}`} title={l.title} compact />
              <Link href={l.href} className="btn-ghost min-h-[40px] px-3 text-sm">Lesson</Link>
            </div>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="mt-8 text-center text-mute">No labs match. Try a different search or filter.</p>}
    </div>
  );
}
