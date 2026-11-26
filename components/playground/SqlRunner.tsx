"use client";
import { useEffect, useRef, useState } from "react";
import { logExecution } from "@/app/actions";
import ReportIssue from "@/components/ReportIssue";
import type { Exercise } from "@/lib/playground";

const SQLJS = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";
const DB_URL = "/course-labs/course-01-foundations-python-math-data/lab-09-chinook-sqlite/chinook.sqlite";

declare global { interface Window { initSqlJs?: (cfg: { locateFile: (f: string) => string }) => Promise<any> } }

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if (window.initSqlJs) return res();
    const s = document.createElement("script");
    s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error("load failed"));
    document.head.appendChild(s);
  });
}

export default function SqlRunner({ exercises }: { exercises: Exercise[] }) {
  const [i, setI] = useState(0);
  const ex = exercises[i];
  const [code, setCode] = useState(ex.starter);
  const [result, setResult] = useState<{ columns: string[]; values: any[][] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const db = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        await loadScript(SQLJS + "sql-wasm.js");
        const SQL = await window.initSqlJs!({ locateFile: (f) => SQLJS + f });
        const buf = await fetch(DB_URL).then((r) => { if (!r.ok) throw new Error("db"); return r.arrayBuffer(); });
        db.current = new SQL.Database(new Uint8Array(buf));
        setState("ready");
      } catch {
        setState("failed");
        setErr("The SQL engine could not load. Refresh the page; if it keeps failing, report an issue.");
      }
    })();
    return () => db.current?.close?.();
  }, []);
  useEffect(() => {
    try { setCode(localStorage.getItem(`kaa:playground/sql:${ex.id}`) ?? ex.starter); } catch { setCode(ex.starter); }
    setResult(null); setErr(null);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = () => {
    if (!db.current) return;
    try { localStorage.setItem(`kaa:playground/sql:${ex.id}`, code); } catch {}
    const t0 = performance.now();
    if (/\b(drop|delete|update|insert|alter|create|attach|pragma)\b/i.test(code)) {
      // The database lives only in this browser tab, but keep it intact for the exercises.
      setErr("This lab is read-only: use SELECT queries."); setResult(null); return;
    }
    try {
      const r = db.current.exec(code);
      const last = r[r.length - 1];
      setResult(last ? { columns: last.columns, values: last.values.slice(0, 200) } : { columns: [], values: [] });
      setErr(null);
      logExecution(`playground/sql/${ex.id}`, true, null, performance.now() - t0).catch(() => {});
    } catch (e: any) {
      setErr(String(e.message || e)); setResult(null);
      logExecution(`playground/sql/${ex.id}`, false, String(e.message || e), performance.now() - t0).catch(() => {});
    }
  };

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
        <li className="hidden rounded-lg border border-rule p-3 text-xs text-mute lg:block">Tables: Artist, Album, Track, Genre, MediaType, Playlist, PlaylistTrack, Customer, Employee, Invoice, InvoiceLine</li>
      </ol>
      <div className="min-w-0">
        <h2 className="text-2xl">{ex.title}</h2>
        <p className="mt-2 text-mute">{ex.task}</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-2 font-mono text-[12px] text-mute">
            <span>query.sql · Chinook music store database</span>
            <span>{state === "loading" ? "Loading database…" : state === "failed" ? "Unavailable" : "SQLite · ready"}</span>
          </div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={8}
            onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); }}
            aria-label="SQL editor" className="block w-full resize-y bg-night p-4 font-mono text-[13.5px] leading-relaxed text-ink outline-none" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={run} disabled={state !== "ready"} className="btn-red min-h-[40px] px-5 text-sm">Run ▶</button>
          <button onClick={() => setCode(ex.starter)} className="btn-ghost min-h-[40px] px-4 text-sm">Reset query</button>
          <span className="text-xs text-mute">Ctrl/⌘ + Enter to run</span>
        </div>
        <p className="mt-5 eyebrow">Expected: <span className="text-ink">{ex.expected}</span>{ex.hint && <span> · Hint: <code>{ex.hint}</code></span>}</p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-rule">
          {err ? <pre className="p-3 font-mono text-[13px] text-[#FFB3B3]">{err}</pre> : result ? (
            result.columns.length ? (
              <table className="tbl font-mono text-[12.5px]">
                <thead><tr>{result.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{result.values.map((row, r) => <tr key={r}>{row.map((v, c) => <td key={c}>{String(v)}</td>)}</tr>)}</tbody>
              </table>
            ) : <p className="p-3 text-sm text-mute">Query ran; no rows returned.</p>
          ) : <p className="p-3 text-sm text-mute">Run a query to see results.</p>}
        </div>
        <div className="mt-6"><ReportIssue lab={`SQL Playground · ${ex.title}`} errorMessage={err ?? undefined} /></div>
      </div>
    </div>
  );
}
