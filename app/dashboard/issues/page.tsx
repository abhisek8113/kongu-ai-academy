import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { ago } from "@/lib/admin";
import { statusClass } from "@/lib/tickets";
import ReportIssue from "@/components/ReportIssue";

export const dynamic = "force-dynamic";
export const metadata = { title: "My issues" };

export default async function MyIssues() {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login?next=/dashboard/issues");
  const { data } = await supabase.from("support_tickets").select("id, category, lab, status, severity, created_at, updated_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <div className="wrap py-12">
      <Link href="/dashboard" className="eyebrow hover:text-ink">← Dashboard</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">My issues</h1>
        <ReportIssue className="btn-red" label="Report a new issue" />
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-rule">
        <table className="tbl">
          <thead><tr><th>#</th><th>Issue</th><th>Lab</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>
            {(data ?? []).map((t: any) => (
              <tr key={t.id}>
                <td className="font-mono text-[13px] text-mute">{t.id}</td>
                <td><Link href={`/dashboard/issues/${t.id}`} className="font-medium hover:text-cyan">{t.category}</Link></td>
                <td className="text-mute">{t.lab ?? "—"}</td>
                <td><span className={`pill ${statusClass(t.status)}`}>{t.status}</span></td>
                <td className="whitespace-nowrap text-mute">{ago(t.updated_at)}</td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={5} className="text-mute">You haven't reported any issues.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
