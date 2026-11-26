"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/actions";

export const AUTH_CHANNEL = "kaa-auth";

/**
 * Real logout: ends the session on the server (cookies cleared + activity logged),
 * clears the browser session, tells other tabs, then hard-navigates so no cached
 * protected page or client state survives.
 */
export default function LogoutButton({ className = "", label = "Sign out" }: { className?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    setBusy(true); setErr(null);
    try {
      const res = await signOut();
      if (res && "error" in res && res.error) throw new Error(res.error);
      await createClient().auth.signOut({ scope: "local" }).catch(() => {});
      try { new BroadcastChannel(AUTH_CHANNEL).postMessage("signed-out"); } catch {}
      try { Object.keys(localStorage).filter((k) => k.startsWith("kaa:cache")).forEach((k) => localStorage.removeItem(k)); } catch {}
      window.location.replace("/login?signedout=1");
    } catch (e: any) {
      setBusy(false);
      setErr("Sign-out failed. Check your connection and try again.");
    }
  };
  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={run} disabled={busy} className={className}>{busy ? "Signing out…" : label}</button>
      {err && <span role="alert" className="mt-1 text-xs text-[#FF8A8A]">{err}</span>}
    </span>
  );
}
