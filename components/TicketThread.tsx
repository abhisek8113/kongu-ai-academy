import { replyToTicket } from "@/app/actions";
import { fmtTime } from "@/lib/admin";

type Msg = { id: number; author_name: string | null; body: string; internal: boolean; created_at: string; author_id: string | null };

export default function TicketThread({ ticketId, messages, admin = false, closed = false }: { ticketId: number; messages: Msg[]; admin?: boolean; closed?: boolean }) {
  return (
    <div>
      <ol className="space-y-3">
        {messages.length === 0 && <li className="text-sm text-mute">No replies yet.</li>}
        {messages.map((m) => (
          <li key={m.id} className={`rounded-xl border p-4 ${m.internal ? "border-gold/40 bg-gold/[0.06]" : "border-rule bg-panel/60"}`}>
            <div className="flex flex-wrap justify-between gap-2 text-xs text-mute">
              <span className="font-medium text-ink">{m.author_name ?? "—"}{m.internal && <span className="ml-2 text-gold">Internal note · not visible to student</span>}</span>
              <span>{fmtTime(m.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[15px]">{m.body}</p>
          </li>
        ))}
      </ol>
      {!closed && (
        <form action={replyToTicket} className="mt-4 grid gap-3">
          <input type="hidden" name="ticket_id" value={ticketId} />
          <label className="label">{admin ? "Reply or add a note" : "Add a reply"}<textarea name="body" required maxLength={4000} rows={3} className="input" /></label>
          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-red min-h-[40px] px-4 text-sm">{admin ? "Send" : "Send reply"}</button>
            {admin && <label className="flex items-center gap-2 text-sm text-mute"><input type="checkbox" name="internal" value="1" className="h-4 w-4" /> Internal note (hidden from student)</label>}
          </div>
        </form>
      )}
    </div>
  );
}
