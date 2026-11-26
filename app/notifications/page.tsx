import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { ago } from "@/lib/admin";
import { markNotificationsRead } from "@/app/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function Notifications() {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login?next=/notifications");
  const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  const unread = (data ?? []).filter((n: any) => !n.read_at).length;
  return (
    <div className="wrap max-w-3xl py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">Notifications</h1>
        {unread > 0 && <form action={markNotificationsRead}><button className="btn-ghost min-h-[40px] px-4 text-sm">Mark all {unread} as read</button></form>}
      </div>
      <ul className="mt-8 divide-y divide-rule border-y border-rule">
        {(data ?? []).map((n: any) => (
          <li key={n.id} className="flex gap-4 py-4">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-cyan"}`} />
            <div className="min-w-0 flex-1">
              {n.link ? <Link href={n.link} className="font-medium hover:text-cyan">{n.title}</Link> : <p className="font-medium">{n.title}</p>}
              {n.body && <p className="mt-0.5 text-sm text-mute">{n.body}</p>}
            </div>
            <span className="whitespace-nowrap text-xs text-mute">{ago(n.created_at)}</span>
          </li>
        ))}
        {!data?.length && <li className="py-6 text-mute">No notifications yet.</li>}
      </ul>
    </div>
  );
}
