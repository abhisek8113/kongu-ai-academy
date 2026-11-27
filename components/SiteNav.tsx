"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

const links = [
  ["/", "Home"],
  ["/#programs", "Programs"],
  ["/pricing", "Pricing"],
  ["/#labs", "AI Labs"],
  ["/resources", "Learning Resources"],
  ["/#about", "About"],
  ["/#contact", "Contact"],
];

export default function SiteNav({ user, isAdmin, unread = 0 }: { user: boolean; isAdmin: boolean; unread?: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

  const Bell = () => (
    <Link href="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-mute hover:bg-white/5 hover:text-ink">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
      {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-madder px-1 text-[10px] font-semibold text-white">{unread > 9 ? "9+" : unread}</span>}
    </Link>
  );

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled || open ? "border-b border-white/10 bg-night/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
      <div className="wrap flex h-[68px] items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo />
          <span className="font-display text-[15px] font-semibold tracking-[0.08em]">KONGU AI ACADEMY</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-6 text-[14px] text-mute xl:flex" aria-label="Main">
          {links.map(([href, label]) => <Link key={href} href={href} className="transition hover:text-ink">{label}</Link>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 xl:ml-2 xl:flex">
          {user ? (
            <>
              <Bell />
              <Link href="/dashboard" className="px-2 text-[14px] text-mute hover:text-ink">Dashboard</Link>
              {isAdmin && <Link href="/admin" className="px-2 text-[14px] text-gold hover:brightness-110">Admin console</Link>}
              <LogoutButton className="px-2 text-[14px] text-mute hover:text-ink" />
            </>
          ) : (
            <>
              <Link href="/login" className="px-2 text-[14px] text-mute hover:text-ink">Student Login</Link>
              <Link href="/admin-login" className="px-2 text-[14px] text-gold hover:brightness-110">Admin Login</Link>
            </>
          )}
          <Link href="/#contact" className="btn-red ml-2 min-h-[40px] px-4 text-[14px]">Enquire Now</Link>
        </div>
        <div className="ml-auto flex items-center gap-1 xl:hidden">
          {user && <Bell />}
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {open ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" /> : <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="wrap h-[calc(100dvh-68px)] overflow-y-auto pb-10 pt-4 xl:hidden" aria-label="Mobile">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-rule py-4 text-lg">{label}</Link>
          ))}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" onClick={() => setOpen(false)} className="btn-red">Enquire Now</Link>
            {user ? <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-ghost">Dashboard</Link> : <><Link href="/login" onClick={() => setOpen(false)} className="btn-ghost">Student Login</Link><Link href="/admin-login" onClick={() => setOpen(false)} className="btn-ghost text-gold">Admin Login</Link></>}
            {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="btn-ghost text-gold">Admin</Link>}
            {user && <LogoutButton className="btn-ghost" />}
          </div>
        </nav>
      )}
    </header>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs><linearGradient id="kl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#386BFF" /><stop offset="1" stopColor="#00D4FF" /></linearGradient></defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#0C1328" stroke="url(#kl)" />
      <path d="M10 8v16M10 16l9-8M13.5 13l6.5 11" stroke="url(#kl)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="22.5" cy="10" r="1.8" fill="#D6B46A" />
    </svg>
  );
}
