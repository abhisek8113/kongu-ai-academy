import Link from "next/link";
import { getUserAndProfile } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export default async function Nav() {
  let user = null, profile: any = null;
  try {
    ({ user, profile } = await getUserAndProfile());
  } catch {
    // Supabase not configured yet: show public nav
  }
  return (
    <header className="sticky top-0 z-20 border-b border-ink bg-white/95 backdrop-blur">
      <div className="wrap flex flex-wrap items-center gap-x-8 gap-y-2 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
          <span className="block h-3.5 w-3.5 bg-madder" aria-hidden="true" />
          Kongu AI Academy
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-1 text-[15px]">
          <Link href="/courses" className="hover:text-madder">Courses</Link>
          <Link href="/labs" className="hover:text-madder">Lab tracks</Link>
          <Link href="/programmes" className="hover:text-madder">For institutions</Link>
          <Link href="/verify" className="hover:text-madder">Verify</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-madder">Dashboard</Link>
              {profile?.role === "admin" && <Link href="/admin" className="hover:text-madder">Admin</Link>}
              <form action={signOut}><button className="text-mute hover:text-ink">Sign out</button></form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-madder">Log in</Link>
              <Link href="/signup" className="border border-ink px-3 py-1.5 font-medium hover:bg-ink hover:text-white">Join free</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
