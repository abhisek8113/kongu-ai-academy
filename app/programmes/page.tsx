import { getUserAndProfile } from "@/lib/supabase/server";
import { requestEnrolment } from "@/app/actions";
import { getTrack } from "@/lib/labs";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata = { title: "Programmes" };
export const dynamic = "force-dynamic";

export default async function Programmes() {
  let batches: any[] = [], user: any = null;
  try {
    const ctx = await getUserAndProfile();
    user = ctx.user;
    const { data } = await ctx.supabase.from("batches").select("*").eq("is_open", true).order("starts_on");
    batches = data ?? [];
  } catch {}
  return (
    <div className="wrap grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
      <section>
        <h1 className="text-4xl font-extrabold">Open programmes</h1>
        <p className="mt-3 text-[#5d5550]">Join an upcoming batch. Your enrolment request is confirmed by our team.</p>
        {batches.length === 0 ? (
          <div className="card mt-8">No open batches right now. Request a demo or a custom programme for your institution using the form.</div>
        ) : (
          <ul className="mt-8 grid gap-4">
            {batches.map((b) => (
              <li key={b.id} className="card flex flex-wrap items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{b.title}</h2>
                  <p className="text-sm text-[#5d5550]">
                    {getTrack(b.track)?.name ?? b.track}{b.institution ? ` · ${b.institution}` : ""}
                    {b.starts_on ? ` · ${b.starts_on}${b.ends_on ? ` to ${b.ends_on}` : ""}` : ""} · {b.seats} seats
                  </p>
                </div>
                <form action={requestEnrolment}>
                  <input type="hidden" name="batch_id" value={b.id} />
                  <button className="btn-red">{user ? "Request enrolment" : "Log in to enrol"}</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
      <aside className="card self-start">
        <h2 className="text-2xl font-extrabold">For institutions</h2>
        <p className="mb-4 mt-2 text-sm text-[#5d5550]">Workshops, FDPs, value-added courses and corporate training, customised to your syllabus.</p>
        <EnquiryForm />
      </aside>
    </div>
  );
}
