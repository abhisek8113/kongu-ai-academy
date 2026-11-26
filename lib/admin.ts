import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import { courseLabs } from "@/lib/courseLabs";
import { allLabs } from "@/lib/labs";

export async function requireAdminPage(path = "/admin") {
  const ctx = await getUserAndProfile();
  if (!ctx.user) redirect(`/login?next=${path}`);
  if (ctx.profile?.role !== "admin") redirect("/dashboard");
  return ctx;
}

const titles = new Map<string, string>([
  ...courseLabs.map((l) => [`${l.course}/${l.lab}`, l.title] as [string, string]),
  ...allLabs.map((l) => [l.id, l.title] as [string, string]),
]);
export const labTitle = (id: string) => titles.get(id) ?? id;
export const TOTAL_LABS = titles.size;

export function ago(iso?: string | null) {
  if (!iso) return "never";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** One readable line for an activity event. */
export function describe(a: { action: string; meta: any }) {
  const m = a.meta ?? {};
  switch (a.action) {
    case "signup": return `signed up${m.institution ? ` · ${m.institution}` : ""}`;
    case "login": return "logged in";
    case "logout": return "logged out";
    case "lab_open": return `opened ${m.title ?? labTitle(m.lab)}`;
    case "colab_open": return `launched Colab for ${m.title ?? labTitle(m.lab)}`;
    case "lab_complete": return `completed ${m.title ?? labTitle(m.lab)}`;
    case "lab_undo": return `un-marked ${m.title ?? labTitle(m.lab)}`;
    case "enquiry": return `requested a demo · ${m.institution ?? ""}${m.interest ? ` · ${m.interest}` : ""}`;
    case "enrol_request": return `requested enrolment in ${m.batch}`;
    case "admin_batch": return `created batch ${m.batch}`;
    case "admin_batch_toggle": return `${m.open ? "reopened" : "closed"} batch ${m.batch ?? ""}`;
    case "admin_enrolment": return `set ${m.student ?? "a student"} → ${m.status}${m.batch ? ` (${m.batch})` : ""}`;
    case "admin_lead": return `marked lead ${m.lead ?? ""} → ${m.status}`;
    case "admin_approval": return `${m.status === "approved" ? "approved" : m.status === "rejected" ? "rejected" : "reset"} ${m.student ?? "an account"}`;
    case "ticket_new": return `reported issue #${m.id} · ${m.category}${m.lab ? ` (${m.lab})` : ""}`;
    case "admin_ticket_update": return `updated issue #${m.id}${m.status ? ` → ${m.status}` : ""}`;
    case "admin_ticket_reply": return `replied to issue #${m.id}`;
    case "admin_ticket_note": return `added an internal note to issue #${m.id}`;
    case "admin_lab_publish": return `${m.published ? "published" : "unpublished"} ${m.title ?? m.lab}`;
    case "admin_announcement": return `posted announcement “${m.title}”`;
    case "admin_certificate": return `issued certificate ${m.id} to ${m.recipient}`;
    default: return a.action;
  }
}

export const ACTION_GROUPS: Record<string, string[]> = {
  "All": [],
  "Logins": ["login", "logout", "signup"],
  "Labs": ["lab_open", "colab_open", "lab_complete", "lab_undo"],
  "Leads & enrolment": ["enquiry", "enrol_request"],
  "Support": ["ticket_new", "admin_ticket_update", "admin_ticket_reply", "admin_ticket_note"],
  "Admin actions": ["admin_lab_publish", "admin_announcement", "admin_ticket_update", "admin_ticket_reply", "admin_approval", "admin_batch", "admin_batch_toggle", "admin_enrolment", "admin_lead", "admin_certificate"],
};

export const dotColor = (action: string) =>
  action === "lab_complete" ? "#1f7a4d" : action === "enquiry" || action === "enrol_request" ? "#b3261e" :
  action.startsWith("admin") ? "#5f5f5b" : action === "signup" ? "#1f5fa6" : "#111";
