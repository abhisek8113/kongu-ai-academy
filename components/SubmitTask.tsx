"use client";
import { useState } from "react";
import { submitTask } from "@/app/actions";

/** Manual submission for notebook labs (code/answers pasted from Colab), reviewed by the instructor. */
export default function SubmitTask({ lab, task = "main" }: { lab: string; task?: string }) {
  const [answer, setAnswer] = useState(""), [output, setOutput] = useState("");
  const [msg, setMsg] = useState<string | null>(null), [busy, setBusy] = useState(false);
  return (
    <div className="card">
      <h2 className="text-lg">Submit your work</h2>
      <p className="mt-1 text-sm text-mute">Paste your final code or answers from the notebook, plus the output. Your instructor reviews it and replies on your dashboard.</p>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} maxLength={20000} placeholder="Your code / answers" className="input mt-3 font-mono text-[13px]" />
      <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={3} maxLength={20000} placeholder="Output you got (optional)" className="input mt-2 font-mono text-[13px]" />
      <button disabled={busy} onClick={async () => { setBusy(true); const r = await submitTask({ lab, task, answer, output, passed: null }); setBusy(false); setMsg("error" in r && r.error ? r.error : "Submitted for review. See My submissions on your dashboard."); if (!("error" in r && r.error)) { setAnswer(""); setOutput(""); } }} className="btn-red mt-3">{busy ? "Submitting…" : "Submit for review"}</button>
      {msg && <p role="status" className="mt-2 text-sm text-mute">{msg}</p>}
    </div>
  );
}
