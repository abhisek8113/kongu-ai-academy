"use client";
import { useEffect, useRef, useState } from "react";
import { logExecution } from "@/app/actions";
import ReportIssue from "@/components/ReportIssue";
import type { Exercise } from "@/lib/playground";

const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const TIME_LIMIT_MS = 15000;

// Runs inside a Web Worker: the student's code never touches the page or our server.
const WORKER_SRC = `
importScripts("${PYODIDE}pyodide.js");
let py = null;
async function boot() {
  py = await loadPyodide({ indexURL: "${PYODIDE}" });
  postMessage({ type: "ready" });
}
const booting = boot().catch(e => postMessage({ type: "boot-error", error: String(e) }));
onmessage = async (e) => {
  await booting;
  const { code } = e.data;
  let out = "";
  py.setStdout({ batched: s => { out += s + "\\n"; } });
  py.setStderr({ batched: s => { out += s + "\\n"; } });
  try {
    await py.loadPackagesFromImports(code);
    const r = await py.runPythonAsync(code);
    if (r !== undefined && r !== null && out === "") out = String(r);
    postMessage({ type: "done", ok: true, out });
  } catch (err) {
    postMessage({ type: "done", ok: false, out, error: String(err.message || err).split("\\n").slice(-6).join("\\n") });
  }
};`;

export default function PythonRunner({ exercises, labId = "playground/python" }: { exercises: Exercise[]; labId?: string }) {
  const [i, setI] = useState(0);
  const ex = exercises[i];
  const [code, setCode] = useState(ex.starter);
  const [out, setOut] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "running" | "failed">("loading");
  const worker = useRef<Worker | null>(null);

  const start = () => {
    worker.current?.terminate();
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
    const w = new Worker(url);
    w.onmessage = (e) => {
      if (e.data.type === "ready") setState("ready");
      if (e.data.type === "boot-error") { setState("failed"); setErr("Python could not load. Check your internet connection and refresh."); }
    };
    worker.current = w;
    setState("loading");
  };
  useEffect(() => { start(); return () => worker.current?.terminate(); }, []);
  useEffect(() => {
    try { const saved = localStorage.getItem(`kaa:${labId}:${ex.id}`); setCode(saved ?? ex.starter); } catch { setCode(ex.starter); }
    setOut(""); setErr(null);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = () => {
    if (!worker.current || state !== "ready") return;
    try { localStorage.setItem(`kaa:${labId}:${ex.id}`, code); } catch {}
    setState("running"); setOut(""); setErr(null);
    const t0 = performance.now();
    const timer = setTimeout(() => {
      // Infinite loop or very slow code: kill the worker and start a fresh one.
      setErr(`Stopped after ${TIME_LIMIT_MS / 1000} seconds. Check for an infinite loop.`);
      logExecution(`${labId}/${ex.id}`, false, "timeout", performance.now() - t0).catch(() => {});
      start();
    }, TIME_LIMIT_MS);
    worker.current.onmessage = (e) => {
      if (e.data.type !== "done") return;
      clearTimeout(timer);
      setOut(e.data.out.trimEnd());
      setErr(e.data.ok ? null : e.data.error);
      setState("ready");
      logExecution(`${labId}/${ex.id}`, e.data.ok, e.data.ok ? null : e.data.error, performance.now() - t0).catch(() => {});
    };
    worker.current.postMessage({ code });
  };
  const matches = out && out.trim() === ex.expected.trim();

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <ol className="flex gap-2 overflow-x-auto lg:flex-col">
        {exercises.map((e, k) => (
          <li key={e.id} className="shrink-0">
            <button onClick={() => setI(k)} className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm ${k === i ? "border-madder bg-madder/10" : "border-rule text-mute hover:text-ink"}`}>
              <span className="font-mono text-[11px] text-cyan">{String(k + 1).padStart(2, "0")}</span> {e.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="min-w-0">
        <h2 className="text-2xl">{ex.title}</h2>
        <p className="mt-2 text-mute">{ex.task}</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-2 font-mono text-[12px] text-mute">
            <span>main.py</span>
            <span>{state === "loading" ? "Loading Python… (first time ~10–20 s)" : state === "running" ? "Running…" : state === "failed" ? "Unavailable" : "Python 3 · ready"}</span>
          </div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={12}
            onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); if (e.key === "Tab") { e.preventDefault(); const t = e.currentTarget; const s = t.selectionStart; setCode(code.slice(0, s) + "    " + code.slice(t.selectionEnd)); requestAnimationFrame(() => t.setSelectionRange(s + 4, s + 4)); } }}
            aria-label="Code editor" className="block w-full resize-y bg-night p-4 font-mono text-[13.5px] leading-relaxed text-ink outline-none" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={run} disabled={state !== "ready"} className="btn-red min-h-[40px] px-5 text-sm">{state === "running" ? "Running…" : "Run ▶"}</button>
          <button onClick={() => setCode(ex.starter)} className="btn-ghost min-h-[40px] px-4 text-sm">Reset code</button>
          <span className="text-xs text-mute">Ctrl/⌘ + Enter to run · your code is saved in this browser</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <p className="eyebrow">Your output</p>
            <pre className={`mt-2 min-h-[110px] overflow-x-auto rounded-lg border p-3 font-mono text-[13px] ${err ? "border-[#FF8A8A]/40 text-[#FFB3B3]" : matches ? "border-[#1f7a4d] text-[#5fd39a]" : "border-rule"}`}>{err ? `${out ? out + "\n" : ""}${err}` : out || "—"}</pre>
            {matches && <p className="mt-1 text-sm text-[#5fd39a]">✓ Matches the expected output</p>}
          </div>
          <div>
            <p className="eyebrow">Expected output</p>
            <pre className="mt-2 min-h-[110px] overflow-x-auto rounded-lg border border-rule p-3 font-mono text-[13px] text-mute">{ex.expected}</pre>
            {ex.hint && <details className="mt-2 text-sm text-mute"><summary className="cursor-pointer">Hint</summary><code className="mt-1 block">{ex.hint}</code></details>}
          </div>
        </div>
        <div className="mt-6"><ReportIssue lab={`Python Playground · ${ex.title}`} errorMessage={err ?? undefined} /></div>
      </div>
    </div>
  );
}
