"use client";
import Link from "next/link";
import { useState } from "react";

type Row = { href: string; num: number; title: string; course: string; courseSlug: string; level: string; time: string; data: string };

export default function Catalogue({ rows, courses }: { rows: Row[]; courses: { slug: string; name: string; count: number }[] }) {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? rows : rows.filter((r) => r.courseSlug === filter);
  const tabs = [{ slug: "all", name: "All labs", count: rows.length }, ...courses];
  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.slug}
            role="tab"
            aria-selected={filter === t.slug}
            onClick={() => setFilter(t.slug)}
            className={`-mb-px min-h-[44px] border-b-2 text-[15px] ${filter === t.slug ? "border-madder font-medium" : "border-transparent text-mute hover:text-ink"}`}
          >
            {t.name} <span className="font-mono text-[12px] text-mute">{t.count}</span>
          </button>
        ))}
      </div>
      <ol>
        {shown.map((r) => (
          <li key={r.href} className="border-b border-rule">
            <Link href={r.href} className="group grid grid-cols-[3rem_1fr] gap-x-4 gap-y-1 py-4 sm:grid-cols-[3rem_1fr_13rem_6rem]">
              <span className="font-mono text-[13px] text-mute">{String(r.num).padStart(2, "0")}</span>
              <span>
                <span className="font-medium group-hover:text-madder group-hover:underline">{r.title}</span>
                <span className="mt-0.5 block font-mono text-[12px] text-mute">{r.data}</span>
              </span>
              <span className="col-start-2 text-sm text-mute sm:col-start-auto">{r.course}</span>
              <span className="col-start-2 font-mono text-[12px] text-mute sm:col-start-auto sm:text-right">{[r.level, r.time].filter(Boolean).join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
