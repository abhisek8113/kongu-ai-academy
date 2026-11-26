import { getUserAndProfile } from "@/lib/supabase/server";
import SiteNav from "@/components/SiteNav";

export default async function Nav() {
  let user = null, profile: any = null, unread = 0;
  try {
    let supabase;
    ({ supabase, user, profile } = await getUserAndProfile());
    if (user) {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null);
      unread = count ?? 0;
    }
  } catch {
    // Supabase not configured: public navigation only
  }
  return <SiteNav user={!!user} isAdmin={profile?.role === "admin"} unread={unread} />;
}
