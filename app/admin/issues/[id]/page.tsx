import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage, fmtTime } from "@/lib/admin";
import { TICKET_STATUSES, SEVERITIES, statusClass, duration } from "@/lib/tickets";
import { updateTicket } from "@/app/actions";
import TicketThread from "@/components/TicketThread";

export default async function IssueDetail({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdminPage(`/admin/issues/${params.id}`);
  const id = Number(params.id);
  const [{ data: t }, { data: msgs }] = await Promise.all([
    supabase.from("support_tickets").select("*").eq("id", id).maybeSingle(),
    supabase.from("support_ticket_messages").select("id, author_name, body, internal, created_at, author_id").eq("ticket_id", id).order("created_at"),
  ]);
  if (!t) notFound();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/issues" className="eyebrow hover:text-ink">← Issues</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">#{t.id} · {t.category}</h1>
        <span className={`pill ${statusClass(t.status)}`}>{t.status}</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <p className="whitespace-pre-wrap">{t.description}</p>
          {t.error_message && <pre className="mt-4 overflow-x-auto rounded-lg bg-night p-3 font-mono text-[12.5px] text-[#FFB3B3]">{t.error_message}</pre>}
        </div>
        <dl className="card grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
          <dt className="text-mute">Student</dt><dd><Link className="underline" href={`/admin/students/${t.user_id}`}>{t.student_name ?? "—"}</Link></dd>
          <dt className="text-mute">Student ID</dt><dd className="break-all font-mono text-[12px]">{t.user_id}</dd>
          <dt className="text-mute">Laboratory</dt><dd>{t.lab ?? "—"}</dd>
          <dt className="text-mute">Reported</dt><dd>{fmtTime(t.created_at)}</dd>
          <dt className="text-mute">Page</dt><dd className="break-all">{t.page_url ?? "—"}</dd>
          <dt className="text-mute">Browser</dt><dd className="break-all text-xs">{t.browser ?? "—"}</dd>
          <dt className="text-mute">Assigned</dt><dd>{t.assigned_to ? (t.assigned_to === user!.id ? "You" : "Another admin") : "Unassigned"}</dd>
          <dt className="text-mute">{t.resolved_at ? "Resolved in" : "Open for"}</dt><dd>{duration(t.created_at, t.resolved_at)}</dd>
        </dl>
      </div>

      <form action={updateTicket} className="card mt-6 flex flex-wrap items-end gap-4">
        <input type="hidden" name="id" value={t.id} />
        <label className="label">Status<select name="status" defaultValue={t.status} className="input min-h-[40px]">{TICKET_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Severity<select name="severity" defaultValue={t.severity} className="input min-h-[40px]">{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Assignment<select name="assign" defaultValue="" className="input min-h-[40px]"><option value="">No change</option><option value="me">Assign to me</option><option value="none">Unassign</option></select></label>
        <button className="btn-red min-h-[40px] px-4 text-sm">Update issue</button>
      </form>

      <h2 className="mt-10 text-xl">Conversation and notes</h2>
      <div className="mt-4"><TicketThread ticketId={t.id} messages={(msgs ?? []) as any} admin /></div>
    </div>
  );
}
