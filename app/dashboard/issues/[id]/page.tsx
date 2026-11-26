import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { fmtTime } from "@/lib/admin";
import { statusClass } from "@/lib/tickets";
import TicketThread from "@/components/TicketThread";

export const dynamic = "force-dynamic";

export default async function MyIssue({ params }: { params: { id: string } }) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect(`/login?next=/dashboard/issues/${params.id}`);
  const id = Number(params.id);
  // RLS returns nothing for another student's ticket.
  const [{ data: t }, { data: msgs }] = await Promise.all([
    supabase.from("support_tickets").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("support_ticket_messages").select("id, author_name, body, internal, created_at, author_id").eq("ticket_id", id).order("created_at"),
  ]);
  if (!t) notFound();
  return (
    <div className="wrap max-w-3xl py-12">
      <Link href="/dashboard/issues" className="eyebrow hover:text-ink">← My issues</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">#{t.id} · {t.category}</h1>
        <span className={`pill ${statusClass(t.status)}`}>{t.status}</span>
      </div>
      <p className="mt-1 text-sm text-mute">Reported {fmtTime(t.created_at)}{t.lab ? ` · ${t.lab}` : ""}</p>
      <div className="card mt-6">
        <p className="whitespace-pre-wrap">{t.description}</p>
        {t.error_message && <pre className="mt-4 overflow-x-auto rounded-lg bg-night p-3 font-mono text-[12.5px] text-[#FFB3B3]">{t.error_message}</pre>}
      </div>
      <h2 className="mt-10 text-xl">Conversation</h2>
      <div className="mt-4"><TicketThread ticketId={t.id} messages={(msgs ?? []) as any} closed={t.status === "Closed"} /></div>
    </div>
  );
}
