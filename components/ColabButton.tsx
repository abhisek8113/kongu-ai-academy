"use client";
import { logColabOpen } from "@/app/actions";

export default function ColabButton({ href, lab, title }: { href: string; lab: string; title: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="btn-sun"
      onClick={() => { logColabOpen(lab, title).catch(() => {}); }}
    >
      Open notebook in Colab
    </a>
  );
}
