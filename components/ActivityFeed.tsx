import Link from "next/link";
import { describe, dotColor, fmtTime, ago } from "@/lib/admin";

export type Activity = { id: number; user_id: string | null; actor: string | null; action: string; meta: any; created_at: string };

export default function ActivityFeed({ rows, showUser = true }: { rows: Activity[]; showUser?: boolean }) {
  if (!rows.length) return <p className="border-t border-rule py-6 text-mute">No activity yet.</p>;
  return (
    <ol className="border-t border-rule">
      {rows.map((a) => (
        <li key={a.id} className="grid grid-cols-[10px_1fr_auto] items-baseline gap-3 border-b border-rule py-2.5 text-[15px]">
          <span className="block h-2 w-2 translate-y-[-1px]" style={{ background: dotColor(a.action) }} aria-hidden="true" />
          <span className="min-w-0">
            {showUser && (a.user_id ? (
              <Link href={`/admin/students/${a.user_id}`} className="font-medium hover:text-madder hover:underline">{a.actor ?? "Someone"}</Link>
            ) : (
              <span className="font-medium">{a.actor ?? "Visitor"}</span>
            ))}{" "}
            <span className={showUser ? "text-mute" : ""}>{describe(a)}</span>
          </span>
          <span className="whitespace-nowrap font-mono text-[12px] text-mute" title={fmtTime(a.created_at)}>{ago(a.created_at)}</span>
        </li>
      ))}
    </ol>
  );
}
