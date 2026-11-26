import { requireAdminPage, ago } from "@/lib/admin";
import { saveAnnouncement } from "@/app/actions";

export default async function Announcements() {
  const { supabase } = await requireAdminPage("/admin/announcements");
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Announcements</h1>
      <p className="mt-2 text-mute">Published announcements appear on every student's dashboard.</p>
      <div className="mt-6 grid gap-8 xl:grid-cols-[360px_1fr]">
        <form action={saveAnnouncement} className="card grid gap-3 self-start">
          <h2 className="text-lg">New announcement</h2>
          <label className="label">Title<input name="title" required minLength={3} maxLength={160} className="input" /></label>
          <label className="label">Message<textarea name="body" required maxLength={4000} rows={5} className="input" /></label>
          <button className="btn-red">Publish</button>
        </form>
        <ul className="space-y-3">
          {(data ?? []).map((a: any) => (
            <li key={a.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-medium">{a.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-mute">{a.body}</p><p className="mt-2 text-xs text-mute">{ago(a.created_at)}</p></div>
                <div className="flex items-center gap-3">
                  <span className={`pill ${a.published ? "border-[#1f7a4d] text-[#5fd39a]" : "border-gold/50 text-gold"}`}>{a.published ? "Published" : "Hidden"}</span>
                  <form action={saveAnnouncement}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="toggle" value="1" /><input type="hidden" name="published" value={a.published ? "0" : "1"} /><button className="text-xs text-mute underline hover:text-ink">{a.published ? "Hide" : "Publish"}</button></form>
                  <form action={saveAnnouncement}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="delete" value="1" /><button className="text-xs text-[#FF8A8A] underline">Delete</button></form>
                </div>
              </div>
            </li>
          ))}
          {!data?.length && <li className="text-mute">No announcements yet.</li>}
        </ul>
      </div>
    </div>
  );
}
