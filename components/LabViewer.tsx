"use client";
import { useState } from "react";

const tabs = [
  { key: "overview", label: "Overview", file: "overview.html" },
  { key: "steps", label: "Lesson & exercises", file: "steps.html" },
];

export default function LabViewer({ base }: { base: string }) {
  const [tab, setTab] = useState(tabs[0]);
  return (
    <div className="border border-ink">
      <div className="flex gap-6 border-b border-ink px-4" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab.key === t.key}
            onClick={() => setTab(t)}
            className={`-mb-px min-h-[44px] border-b-2 text-sm ${tab.key === t.key ? "border-madder font-medium" : "border-transparent text-mute hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
        <a href={`${base}/${tab.file}`} target="_blank" rel="noreferrer" className="ml-auto self-center font-mono text-[12px] text-mute underline hover:text-ink">Open full page</a>
      </div>
      <iframe key={tab.key} src={`${base}/${tab.file}`} title={tab.label} className="h-[75vh] w-full bg-white" />
    </div>
  );
}
