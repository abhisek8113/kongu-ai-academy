"use client";
import { logColabOpen } from "@/app/actions";

export default function ColabButton({ href, lab, title, compact = false }: { href: string; lab: string; title: string; compact?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={compact ? "btn-red min-h-[40px] flex-1 px-3 text-sm" : "btn-red"}
      onClick={() => { logColabOpen(lab, title).catch(() => {}); }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7a5 5 0 1 0 0 10M17 7a5 5 0 1 1 0 10" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>
      Open in Colab
    </a>
  );
}
