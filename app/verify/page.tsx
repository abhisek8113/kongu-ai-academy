import { redirect } from "next/navigation";

export const metadata = { title: "Verify a certificate" };

async function go(f: FormData) {
  "use server";
  const id = String(f.get("id") ?? "").trim().toUpperCase();
  if (id) redirect(`/verify/${encodeURIComponent(id)}`);
}

export default function Verify() {
  return (
    <div className="wrap max-w-lg py-14">
      <form action={go} className="card grid gap-3">
        <h1 className="text-3xl font-semibold">Verify a certificate</h1>
        <p className="text-sm text-mute">Enter the certificate ID printed on the certificate, for example KAA-2026-AB12CD.</p>
        <label className="label">Certificate ID<input name="id" required className="input uppercase" /></label>
        <button className="btn-red">Verify</button>
      </form>
    </div>
  );
}
