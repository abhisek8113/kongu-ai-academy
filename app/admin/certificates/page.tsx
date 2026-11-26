import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { issueCertificate } from "@/app/actions";

export default async function CertificatesPage() {
  const { supabase } = await requireAdminPage("/admin/certificates");
  const [{ data: certs }, { data: people }] = await Promise.all([
    supabase.from("certificates").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("profiles").select("id, full_name, email").order("full_name"),
  ]);
  return (
    <div>
      <h1 className="text-[32px] font-semibold leading-tight">Certificates</h1>
      <div className="mt-6 grid gap-10 xl:grid-cols-[320px_1fr]">
        <form action={issueCertificate} className="card grid gap-3 self-start">
          <h2 className="text-lg">Issue a certificate</h2>
          <label className="label">Student account (optional)
            <select name="user_id" className="input"><option value="">— Not linked —</option>{(people ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.email}</option>)}</select>
          </label>
          <label className="label">Name on certificate<input name="recipient_name" required className="input" /></label>
          <label className="label">Programme<input name="programme" required className="input" placeholder="2-day Generative AI workshop" /></label>
          <label className="label">Institution<input name="institution" className="input" /></label>
          <button className="btn-red">Issue</button>
        </form>
        <div className="min-w-0 overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>ID</th><th>Name</th><th>Programme</th><th>Institution</th><th>Issued</th></tr></thead>
            <tbody>
              {(certs ?? []).map((c: any) => (
                <tr key={c.id}><td className="whitespace-nowrap font-mono text-[13px]"><Link className="underline" href={`/verify/${c.id}`}>{c.id}</Link></td><td>{c.recipient_name}</td><td>{c.programme}</td><td>{c.institution ?? "—"}</td><td className="whitespace-nowrap">{c.issued_on}</td></tr>
              ))}
              {!certs?.length && <tr><td colSpan={5} className="text-mute">None issued yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
