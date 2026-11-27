"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SiteNav from "@/components/SiteNav";
import AuthSync from "@/components/AuthSync";

/**
 * Login state is read in the browser (straight from Supabase in Mumbai), so public
 * pages can be pre-built and served instantly from the CDN instead of on every request.
 */
export default function Nav() {
  const [s, setS] = useState({ user: false, admin: false, unread: 0 });
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const sb = createClient();
    const load = async () => {
      const { data: { session } } = await sb.auth.getSession();
      const u = session?.user;
      if (!u) return setS({ user: false, admin: false, unread: 0 });
      const [{ data: p }, { count }] = await Promise.all([
        sb.from("profiles").select("role").eq("id", u.id).maybeSingle(),
        sb.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", u.id).is("read_at", null),
      ]);
      setS({ user: true, admin: p?.role === "admin", unread: count ?? 0 });
    };
    load();
    const { data } = sb.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN" || e === "SIGNED_OUT") load(); });
    return () => data.subscription.unsubscribe();
  }, []);
  return <><AuthSync signedIn={s.user} /><SiteNav user={s.user} isAdmin={s.admin} unread={s.unread} /></>;
}
