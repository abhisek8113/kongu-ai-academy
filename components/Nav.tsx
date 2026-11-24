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
    <nav className="sticky top-0 z-20 bg-madder text-white">
      <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-saffron text-sm text-[#3a0c12]">KA</span>
          Kongu AI Academy
        </Link>
        <ul className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px] font-medium">
          <li><Link href="/labs" className="hover:underline">Labs</Link></li>
          <li><Link href="/programmes" className="hover:underline">Programmes</Link></li>
          <li><Link href="/verify" className="hover:underline">Verify certificate</Link></li>
          {user ? (
            <>
              <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
              {profile?.role === "admin" && <li><Link href="/admin" className="hover:underline">Admin</Link></li>}
              <li>
                <form action={signOut}><button className="rounded-lg border border-white/50 px-3 py-1.5 hover:bg-white/10">Sign out</button></form>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/login" className="hover:underline">Log in</Link></li>
              <li><Link href="/signup" className="rounded-lg bg-saffron px-3 py-1.5 font-semibold text-[#2b0a0f]">Join free</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
