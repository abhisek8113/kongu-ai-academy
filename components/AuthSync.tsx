"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const PRIVATE = /^\/(dashboard|admin|notifications|account|courses\/[^/]+\/[^/]+|labs\/[^/]+\/[^/]+|playground\/sql)/;

/** Keeps every open tab in step with the real session (logout in one tab logs out all). */
export default function AuthSync({ signedIn }: { signedIn: boolean }) {
  useEffect(() => {
    const supabase = createClient();
    const leave = () => {
      if (PRIVATE.test(location.pathname)) location.replace(`/login?next=${encodeURIComponent(location.pathname)}`);
      else location.reload();
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && signedIn) leave();
    });
    let ch: BroadcastChannel | null = null;
    try { ch = new BroadcastChannel("kaa-auth"); ch.onmessage = () => { if (signedIn) leave(); }; } catch {}
    // Back/forward cache or a tab left open: re-check the session when the page is shown again.
    const recheck = async () => {
      if (!signedIn) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) leave();
    };
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) recheck(); };
    const onVis = () => { if (document.visibilityState === "visible") recheck(); };
    window.addEventListener("pageshow", onShow);
    document.addEventListener("visibilitychange", onVis);
    return () => { sub.subscription.unsubscribe(); ch?.close(); window.removeEventListener("pageshow", onShow); document.removeEventListener("visibilitychange", onVis); };
  }, [signedIn]);
  return null;
}
