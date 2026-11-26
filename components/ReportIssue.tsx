"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createTicket } from "@/app/actions";

const CATEGORIES = ["Laboratory not loading", "Code execution failure", "Incorrect output", "Login problem", "Access problem", "Website performance", "Other technical issue"];

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-red" disabled={pending}>{pending ? "Sending…" : "Send report"}</button>;
}

/** "Report an Issue" button + dialog. Captures lab, page, browser and an optional error message. */
export default function ReportIssue({ lab, errorMessage, label = "Report an issue", className }: { lab?: string; errorMessage?: string; label?: string; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action] = useFormState(createTicket, null as any);
  const [env, setEnv] = useState({ browser: "", page: "" });
  useEffect(() => setEnv({ browser: `${navigator.userAgent} · ${window.innerWidth}×${window.innerHeight}`, page: window.location.pathname }), []);
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={className ?? "inline-flex items-center gap-2 text-sm text-mute underline hover:text-ink"}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l7 12.5H1z" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M8 6v4M8 11.6v.4" stroke="currentColor" strokeWidth="1.4" /></svg>
        {label}
      </button>
      <dialog ref={ref} className="w-[min(560px,92vw)] rounded-2xl border border-line bg-panel p-0 text-ink backdrop:bg-night/80 backdrop:backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="kicker">Support</p><h2 className="mt-1 text-2xl">Report an issue</h2></div>
            <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="text-2xl text-mute hover:text-ink">×</button>
          </div>
          {state?.ok ? (
            <div className="mt-6" role="status">
              <p className="text-[#5fd39a]">{state.ok}</p>
              <div className="mt-5 flex gap-3"><Link href={`/dashboard/issues/${state.id}`} className="btn-red">View issue</Link><button type="button" className="btn-ghost" onClick={() => ref.current?.close()}>Close</button></div>
            </div>
          ) : (
            <form action={action} className="mt-5 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="label">Category *
                  <select name="category" required className="input" defaultValue={errorMessage ? "Code execution failure" : ""}>
                    <option value="" disabled>Choose…</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="label">Severity
                  <select name="severity" className="input" defaultValue="Medium">{["Low", "Medium", "High", "Critical"].map((s) => <option key={s}>{s}</option>)}</select>
                </label>
              </div>
              <label className="label">Laboratory<input name="lab" defaultValue={lab ?? ""} maxLength={200} className="input" placeholder="e.g. Lab 04 · KNN on Iris" /></label>
              <label className="label">What happened? *<textarea name="description" required minLength={5} maxLength={4000} rows={4} className="input" placeholder="What you did, what you expected, what you saw." /></label>
              <label className="label">Error message (optional)<textarea name="error_message" defaultValue={errorMessage ?? ""} maxLength={4000} rows={3} className="input font-mono text-[13px]" /></label>
              <input type="hidden" name="browser" value={env.browser} />
              <input type="hidden" name="page_url" value={env.page} />
              <p className="text-xs text-mute">We attach your browser and page automatically so we can reproduce the problem.</p>
              {state?.error && <p role="alert" className="text-sm text-[#FF8A8A]">{state.error}</p>}
              <div className="flex gap-3"><Submit /><button type="button" className="btn-ghost" onClick={() => ref.current?.close()}>Cancel</button></div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
