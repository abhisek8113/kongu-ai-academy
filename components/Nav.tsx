import { getUserAndProfile } from "@/lib/supabase/server";
import SiteNav from "@/components/SiteNav";

export default async function Nav() {
  let user = null, profile: any = null;
  try {
    ({ user, profile } = await getUserAndProfile());
  } catch {
    // Supabase not configured: public navigation only
  }
  return <SiteNav user={!!user} isAdmin={profile?.role === "admin"} />;
}
