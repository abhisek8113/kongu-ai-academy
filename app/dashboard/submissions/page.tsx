import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { ago, labTitle } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "My submissions" };

export default async function MySubmissions() {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login?next=/dashboard/submissions");
  const { data } = await supabase.from("task_submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <div className="wrap max-w-4xl py-12">
      <h1 className="text-4xl">My submissions</h1>
      <ul className="mt-8 space-y-3">
        {(data ?? []).map((x: any) => (
          <li key={x.id} className="card">
            <div className="flex flex-wrap justify-between gap-2 text-sm"><span>{labTitle(x.lab_id)} · task {x.task_id}</span><span className="text-mute">{ago(x.created_at)} <span className="pill ml-2">{x.status.replace("_", " ")}</span></span></div>
            {x.feedback && <p className="mt-3 rounded-lg border border-cyan/30 p-3 text-sm"><span className="text-cyan">Instructor feedback:</span> {x.feedback}</p>}
          </li>
        ))}
        {!data?.length && <li className="text-mute">No submissions yet. Finish an exercise and press “Submit”.</li>}
      </ul>
    </div>
  );
}
