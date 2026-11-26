"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "Overview"],
  ["/admin/activity", "Live activity"],
  ["/admin/students", "Students"],
  ["/admin/leads", "Leads"],
  ["/admin/batches", "Batches & enrolments"],
  ["/admin/certificates", "Certificates"],
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="mt-5 flex gap-x-5 gap-y-1 overflow-x-auto border-b border-rule pb-2 lg:flex-col lg:border-b-0 lg:border-l lg:pb-0">
      {items.map(([href, label]) => {
        const on = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap py-1.5 text-[15px] lg:-ml-px lg:border-l-2 lg:pl-4 ${on ? "font-medium text-ink lg:border-madder" : "text-mute hover:text-ink lg:border-transparent"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
