import { requireAdminPage, ago, labTitle } from "@/lib/admin";
import { reviewSubmission } from "@/app/actions";

export default async function AdminSubmissions({ searchParams }: { searchParams: { status?: string } }) {
  const { supabase } = await requireAdminPage("/admin/submissions");
  let q = supabase.from("task_submissions").select("*").order("created_at", { ascending: false }).limit(200);
  if (searchParams.status !== "all") q = q.in("status", ["submitted", "needs_work"]);
  const [{ data }, { data: people }] = await Promise.all([q, supabase.from("profiles").select("id, full_name, email")]);
  const who = (id: string) => { const p = (people ?? []).find((x: any) => x.id === id); return p?.full_name || p?.email || id.slice(0, 8); };
  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Task submissions</h1>
      <div className="mt-4 flex gap-5 text-sm"><a href="/admin/submissions" className={searchParams.status !== "all" ? "underline decoration-madder underline-offset-8" : "text-mute"}>To review</a><a href="/admin/submissions?status=all" className={searchParams.status === "all" ? "underline decoration-madder underline-offset-8" : "text-mute"}>All</a></div>
      <ul className="mt-6 space-y-4">
        {(data ?? []).map((x: any) => (
          <li key={x.id} className="card">
            <div className="flex flex-wrap justify-between gap-2 text-sm"><span><b>{who(x.user_id)}</b> · {labTitle(x.lab_id)} · task {x.task_id}</span><span className="text-mute">{ago(x.created_at)} <span className="pill ml-2">{x.status}</span>{x.auto_passed != null && <span className="ml-2 text-xs">{x.auto_passed ? "auto-check ✓" : "auto-check ✗"}</span>}</span></div>
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-rule bg-night p-3 font-mono text-[12.5px]">{x.answer}</pre>
            {x.output && <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-rule p-3 font-mono text-[12px] text-mute">{x.output}</pre>}
            <form action={reviewSubmission} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={x.id} />
              <textarea name="feedback" defaultValue={x.feedback ?? ""} rows={2} placeholder="Feedback for the student" className="input min-w-[260px] flex-1" />
              <button name="status" value="approved" className="btn-red min-h-[40px] px-4 text-sm">Approve</button>
              <button name="status" value="needs_work" className="btn-ghost min-h-[40px] px-4 text-sm">Needs work</button>
              <button name="status" value="rejected" className="btn-ghost min-h-[40px] px-4 text-sm text-[#FF8A8A]">Reject</button>
            </form>
          </li>
        ))}
        {!data?.length && <li className="text-mute">Nothing to review.</li>}
      </ul>
    </div>
  );
}
