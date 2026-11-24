import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Certificate verification" };
export const dynamic = "force-dynamic";

export default async function VerifyId({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id).toUpperCase();
  let cert: any = null;
  try {
    const { data } = await createClient().from("certificates").select("*").eq("id", id).maybeSingle();
    cert = data;
  } catch {}
  return (
    <div className="wrap max-w-xl py-14">
      {cert ? (
        <div className="card border-2 border-green-700">
          <div className="pill bg-green-700 text-white">Verified</div>
          <h1 className="mt-3 text-3xl font-extrabold">{cert.recipient_name}</h1>
          <p className="mt-2 text-lg">completed <b>{cert.programme}</b></p>
          <p className="mt-1 text-[#5d5550]">{cert.institution ? `${cert.institution} · ` : ""}Issued {cert.issued_on} by Kongu AI Academy</p>
          <p className="mt-4 text-sm text-[#5d5550]">Certificate ID {cert.id}</p>
        </div>
      ) : (
        <div className="card border-2 border-red-700">
          <div className="pill bg-red-700 text-white">Not found</div>
          <h1 className="mt-3 text-2xl font-extrabold">No certificate with ID {id}</h1>
          <p className="mt-2 text-[#5d5550]">Check the ID and try again, or contact us on +91 95145 24599.</p>
        </div>
      )}
      <Link href="/verify" className="mt-6 inline-block font-semibold text-madder underline">Verify another</Link>
    </div>
  );
}
