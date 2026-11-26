"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { stages } from "@/lib/journey";

const JourneyScene = dynamic(() => import("@/components/three/JourneyScene"), { ssr: false });

export default function Journey() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try { const c = document.createElement("canvas"); setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl"))); } catch { setWebgl(false); }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px" });
    if (host.current) io.observe(host.current);
    return () => io.disconnect();
  }, []);
  const s = stages[active];

  return (
    <div>
      <div ref={host} className="relative h-[300px] sm:h-[380px]">
        {inView && webgl && <JourneyScene active={active} onSelect={setActive} />}
        {!webgl && <div className="flex h-full items-center justify-center text-mute">Select a stage below.</div>}
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Learning journey stages">
        {stages.map((st, i) => (
          <button
            key={st.key}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm transition ${i === active ? "border-madder bg-madder/15 text-ink" : "border-line text-mute hover:text-ink"}`}
          >
            <span className="mr-1.5 font-mono text-[11px] text-cyan">{String(i + 1).padStart(2, "0")}</span>{st.name}
          </button>
        ))}
      </div>

      <div className="glass mt-6 grid gap-8 p-6 sm:p-8 md:grid-cols-[1.2fr_1fr]" aria-live="polite">
        <div>
          <p className="kicker">Stage {active + 1} · {s.short}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl">{s.name}</h3>
          <p className="mt-3 text-mute">{s.body}</p>
          <div className="mt-5 flex flex-wrap gap-2">{s.skills.map((k) => <span key={k} className="pill">{k}</span>)}</div>
        </div>
        <div className="border-t border-line pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <p className="eyebrow">Example project</p>
          <Link href={s.project.href} className="mt-2 block text-lg font-medium text-ink hover:text-cyan">{s.project.title} →</Link>
          {s.project.note && <p className="mt-1 text-sm text-gold">{s.project.note}</p>}
          <div className="mt-6 flex gap-3">
            <button className="btn-ghost min-h-[40px] px-4 text-sm" disabled={active === 0} onClick={() => setActive((a) => Math.max(0, a - 1))}>← Previous</button>
            <button className="btn-ghost min-h-[40px] px-4 text-sm" disabled={active === stages.length - 1} onClick={() => setActive((a) => Math.min(stages.length - 1, a + 1))}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
