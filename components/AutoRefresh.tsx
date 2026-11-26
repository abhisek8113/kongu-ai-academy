"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Re-fetches the server page every `seconds` so the admin sees new activity without reloading. */
export default function AutoRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [on, seconds, router]);
  return (
    <button onClick={() => setOn((v) => !v)} className="inline-flex items-center gap-2 font-mono text-[12px] text-mute hover:text-ink">
      <span className={`block h-2 w-2 ${on ? "animate-pulse bg-[#1f7a4d]" : "bg-rule"}`} />
      {on ? `Live · updates every ${seconds}s` : "Paused · click to resume"}
    </button>
  );
}
