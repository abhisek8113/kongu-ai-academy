"use client";
import { useState } from "react";

const tabs = [
  { key: "overview", label: "Overview", file: "overview.html" },
  { key: "steps", label: "Lesson & exercises", file: "steps.html" },
];

export default function LabViewer({ base }: { base: string }) {
  const [tab, setTab] = useState(tabs[0]);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8dfd8]">
      <div className="flex gap-1 bg-cream p-1.5" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab.key === t.key}
            onClick={() => setTab(t)}
            className={`min-h-[40px] rounded-lg px-4 text-sm font-semibold ${tab.key === t.key ? "bg-madder text-white" : "hover:bg-white"}`}
          >
            {t.label}
          </button>
        ))}
        <a href={`${base}/${tab.file}`} target="_blank" rel="noreferrer" className="ml-auto self-center px-3 text-sm text-madder underline">Open full page</a>
      </div>
      <iframe key={tab.key} src={`${base}/${tab.file}`} title={tab.label} className="h-[75vh] w-full bg-white" />
    </div>
  );
}
