"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, getUserAndProfile } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const origin = () => process.env.NEXT_PUBLIC_SITE_URL || headers().get("origin") || "https://kongu-ai-academy.vercel.app";

export async function signOut(): Promise<{ ok: true } | { error: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await logActivity(supabase, user, "logout").catch(() => {});
  // Revokes this session's refresh token at Supabase and clears the auth cookies.
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function signIn(_: unknown, f: FormData) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: s(f, "email"), password: s(f, "password") });
  if (error) return { error: error.message };
  await logActivity(supabase, data.user, "login");
  const next = s(f, "next");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function signUp(_: unknown, f: FormData) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: s(f, "email"),
    password: s(f, "password"),
    options: {
      data: { full_name: s(f, "full_name"), phone: s(f, "phone"), institution: s(f, "institution") },
      emailRedirectTo: `${origin()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: error.message };
  if (!data.session) return { ok: "Account created. Confirm your email, then wait for Kongu AI Academy to approve your account — you'll be able to track labs and enrol once approved." };
  redirect("/dashboard");
}

export async function submitEnquiry(_: unknown, f: FormData) {
  // spam: honeypot filled, or submitted faster than a human could type
  if (s(f, "website") || Date.now() - Number(s(f, "started") || 0) < 2500) return { ok: "Thank you! We'll contact you within 48 hours." };
  const name = s(f, "name").slice(0, 80), institution = s(f, "institution").slice(0, 120);
  const phone = s(f, "phone").replace(/[^\d+]/g, "");
  const email = s(f, "email").slice(0, 120);
  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Please enter your name.";
  if (!/^(\+?91)?[6-9]\d{9}$/.test(phone)) fields.phone = "Enter a valid 10-digit Indian mobile number.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Enter a valid email address.";
  if (institution.length < 2) fields.institution = "Please enter your college, institution or company.";
  const participants = s(f, "participants") ? parseInt(s(f, "participants")) : null;
  if (participants !== null && (!Number.isFinite(participants) || participants < 1 || participants > 5000)) fields.participants = "1–5000";
  if (Object.keys(fields).length) return { error: "Please check the highlighted fields.", fields };
  const supabase = createClient();
  const interest = s(f, "interest").slice(0, 80) || "General";
  const date = s(f, "preferred_date");
  const message = [date && `Preferred date: ${date}`, s(f, "message").slice(0, 1000)].filter(Boolean).join("\n") || null;
  const { error } = await supabase.from("enquiries").insert({ name, phone, institution, email: email || null, interest, participants, message });
  if (error) return { error: "We couldn't save your request. Please WhatsApp +91 95145 24599 — we'll book you in directly." };
  const { data: { user } } = await supabase.auth.getUser();
  await logActivity(supabase, user, "enquiry", { institution, interest, participants }, name);
  return { ok: "Thank you! We'll contact you within 48 hours to fix your free demo." };
}

export async function requestEnrolment(f: FormData) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) redirect("/login?next=/programmes");
  if (profile?.status !== "approved") redirect("/dashboard");
  const batch_id = Number(f.get("batch_id"));
  await supabase.from("enrolments").insert({ user_id: user.id, batch_id });
  const { data: b } = await supabase.from("batches").select("title").eq("id", batch_id).maybeSingle();
  await logActivity(supabase, user, "enrol_request", { batch: b?.title ?? batch_id });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleLab(f: FormData) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (profile?.status !== "approved") redirect("/dashboard");
  const lab_id = s(f, "lab_id"), path = s(f, "path"), done = s(f, "done") === "1";
  if (done) await supabase.from("lab_progress").delete().eq("user_id", user.id).eq("lab_id", lab_id);
  else await supabase.from("lab_progress").upsert({ user_id: user.id, lab_id, submission_url: s(f, "submission_url") || null });
  await logActivity(supabase, user, done ? "lab_undo" : "lab_complete", { lab: lab_id, title: s(f, "title") || lab_id });
  revalidatePath(path);
  revalidatePath("/dashboard");
}

/** Called from the lab page when a student opens the notebook in Colab. */
export async function logColabOpen(lab: string, title: string) {
  const { supabase, user } = await getUserAndProfile();
  if (user) await logActivity(supabase, user, "colab_open", { lab, title });
}

async function requireAdmin() {
  const ctx = await getUserAndProfile();
  if (!ctx.user || ctx.profile?.role !== "admin") redirect("/dashboard");
  return ctx;
}

export async function updateEnquiryStatus(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const status = s(f, "status");
  await supabase.from("enquiries").update({ status }).eq("id", Number(f.get("id")));
  await logActivity(supabase, user, "admin_lead", { lead: s(f, "name"), status });
  revalidatePath("/admin");
}

export async function createBatch(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = s(f, "title");
  await supabase.from("batches").insert({
    title, track: s(f, "track"), institution: s(f, "institution") || null,
    starts_on: s(f, "starts_on") || null, ends_on: s(f, "ends_on") || null, seats: Number(f.get("seats")) || 60,
  });
  await logActivity(supabase, user, "admin_batch", { batch: title });
  revalidatePath("/admin");
  revalidatePath("/programmes");
}

export async function toggleBatch(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const open = s(f, "open") === "1";
  await supabase.from("batches").update({ is_open: open }).eq("id", Number(f.get("id")));
  await logActivity(supabase, user, "admin_batch_toggle", { batch: s(f, "title"), open });
  revalidatePath("/admin");
  revalidatePath("/programmes");
}

export async function updateEnrolment(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const status = s(f, "status");
  await supabase.from("enrolments").update({ status }).eq("id", Number(f.get("id")));
  await logActivity(supabase, user, "admin_enrolment", { student: s(f, "student"), batch: s(f, "batch"), status });
  revalidatePath("/admin");
}

export async function issueCertificate(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const year = new Date().getFullYear();
  const id = `KAA-${year}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const recipient = s(f, "recipient_name"), programme = s(f, "programme");
  await supabase.from("certificates").insert({
    id, user_id: s(f, "user_id") || null, recipient_name: recipient, programme, institution: s(f, "institution") || null,
  });
  await logActivity(supabase, user, "admin_certificate", { id, recipient, programme });
  revalidatePath("/admin");
}

export async function setStudentStatus(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const status = s(f, "status");
  if (!["approved", "rejected", "pending", "suspended"].includes(status)) return;
  const id = s(f, "id");
  await supabase.from("profiles").update({ status }).eq("id", id).neq("role", "admin");
  await logActivity(supabase, user, "admin_approval", { student: s(f, "name"), status });
  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
}

// ───────────── Password reset ─────────────
export async function requestPasswordReset(_: unknown, f: FormData) {
  const email = s(f, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter the email you signed up with." };
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin()}/auth/callback?next=/account/password` });
  // Same answer whether or not the email exists, so accounts can't be discovered.
  return { ok: "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder." };
}

export async function updatePassword(_: unknown, f: FormData) {
  const pw = s(f, "password"), pw2 = s(f, "password2");
  if (pw.length < 8) return { error: "Use at least 8 characters." };
  if (pw !== pw2) return { error: "The two passwords don't match." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) return { error: error.message };
  return { ok: "Password updated. You're signed in." };
}

// ───────────── Support tickets ─────────────
const CATEGORIES = ["Laboratory not loading", "Code execution failure", "Incorrect output", "Login problem", "Logout problem", "Access problem", "Payment issue", "Dataset issue", "Task submission issue", "Website performance", "Other technical issue", "General query"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const TICKET_STATUS = ["New", "Under Review", "In Progress", "Waiting for Student", "Resolved", "Closed"];

export async function createTicket(_: unknown, f: FormData) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) return { error: "Please log in to report an issue." };
  const category = s(f, "category"), severity = s(f, "severity") || "Medium";
  const description = s(f, "description").slice(0, 4000);
  if (!CATEGORIES.includes(category)) return { error: "Choose an issue category." };
  if (!SEVERITIES.includes(severity)) return { error: "Choose a severity." };
  if (description.length < 5) return { error: "Please describe what happened (at least a few words)." };
  const { data, error } = await supabase.from("support_tickets").insert({
    user_id: user.id, student_name: profile?.full_name || user.email, lab: s(f, "lab").slice(0, 200) || null,
    category, severity, description, error_message: s(f, "error_message").slice(0, 4000) || null,
    browser: s(f, "browser").slice(0, 400) || null, page_url: s(f, "page_url").slice(0, 400) || null,
  }).select("id").single();
  if (error || !data) return { error: "We couldn't save your report. Please WhatsApp +91 95145 24599." };
  await logActivity(supabase, user, "ticket_new", { id: data.id, category, lab: s(f, "lab") });
  revalidatePath("/dashboard");
  return { ok: `Issue #${data.id} reported. You can follow it under Dashboard → My issues.`, id: data.id };
}

export async function replyToTicket(f: FormData) {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  const id = Number(f.get("ticket_id")), body = s(f, "body").slice(0, 4000);
  if (!id || !body) return;
  const isAdmin = profile?.role === "admin";
  const internal = isAdmin && s(f, "internal") === "1";
  await supabase.from("support_ticket_messages").insert({
    ticket_id: id, author_id: user.id, author_name: isAdmin ? "Kongu AI Academy" : profile?.full_name || user.email, body, internal,
  });
  if (isAdmin) await logActivity(supabase, user, internal ? "admin_ticket_note" : "admin_ticket_reply", { id });
  revalidatePath(isAdmin ? `/admin/issues/${id}` : `/dashboard/issues/${id}`);
}

export async function updateTicket(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = Number(f.get("id"));
  const status = s(f, "status"), severity = s(f, "severity");
  const patch: Record<string, unknown> = {};
  if (TICKET_STATUS.includes(status)) patch.status = status;
  if (SEVERITIES.includes(severity)) patch.severity = severity;
  if (s(f, "assign") === "me") patch.assigned_to = user!.id;
  if (s(f, "assign") === "none") patch.assigned_to = null;
  await supabase.from("support_tickets").update(patch).eq("id", id);
  await logActivity(supabase, user, "admin_ticket_update", { id, ...patch });
  revalidatePath(`/admin/issues/${id}`);
  revalidatePath("/admin/issues");
}

// ───────────── Labs: publishing + executions ─────────────
export async function setLabPublished(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const lab_id = s(f, "lab_id"), published = s(f, "published") === "1";
  await supabase.from("lab_settings").upsert({ lab_id, published, updated_at: new Date().toISOString() });
  await logActivity(supabase, user, "admin_lab_publish", { lab: lab_id, title: s(f, "title"), published });
  revalidatePath("/admin/labs");
  revalidatePath("/", "layout");
}

export async function logExecution(lab_id: string, ok: boolean, error: string | null, duration_ms: number) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) return;
  await supabase.from("lab_executions").insert({ user_id: user.id, lab_id: lab_id.slice(0, 120), ok, error: error?.slice(0, 1000) ?? null, duration_ms: Math.round(duration_ms) });
}

// ───────────── Announcements + notifications ─────────────
export async function saveAnnouncement(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = Number(f.get("id")) || null;
  const title = s(f, "title").slice(0, 160), body = s(f, "body").slice(0, 4000);
  if (s(f, "delete") === "1" && id) {
    await supabase.from("announcements").delete().eq("id", id);
  } else if (s(f, "toggle") === "1" && id) {
    await supabase.from("announcements").update({ published: s(f, "published") === "1", updated_at: new Date().toISOString() }).eq("id", id);
  } else if (title.length >= 3 && body) {
    await supabase.from("announcements").insert({ title, body, published: true });
    await logActivity(supabase, user, "admin_announcement", { title });
  }
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function markNotificationsRead() {
  const { supabase, user } = await getUserAndProfile();
  if (!user) return;
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

// ---------- Memberships, submissions, platform settings ----------
export async function requestMembership(plan: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("request_membership", { plan: String(plan).slice(0, 40) });
  if (error) return { error: "Please log in first." };
  return { ok: data as string };
}

export async function grantAccess(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const target = s(f, "user_id"), days = Math.min(Math.max(parseInt(s(f, "days")) || 30, 1), 3650);
  const plan = s(f, "plan_id") || null, note = s(f, "note").slice(0, 300) || null;
  const { data: cur } = await supabase.from("subscriptions").select("ends_at").eq("user_id", target).in("status", ["active", "trial"]).order("ends_at", { ascending: false }).limit(1).maybeSingle();
  const base = cur?.ends_at && new Date(cur.ends_at) > new Date() ? new Date(cur.ends_at) : new Date();
  const ends = new Date(base.getTime() + days * 86400000).toISOString();
  await supabase.from("subscriptions").insert({ user_id: target, plan_id: plan, status: s(f, "trial") ? "trial" : "active", source: "complimentary", ends_at: ends, note, granted_by: user.id });
  await logActivity(supabase, user, "admin_grant_access", { target, days, plan, note });
  revalidatePath("/admin/subscriptions"); revalidatePath(`/admin/students/${target}`);
}

export async function revokeAccess(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = Number(s(f, "id"));
  const { data } = await supabase.from("subscriptions").update({ status: "cancelled", ends_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id).select("user_id").single();
  await logActivity(supabase, user, "admin_revoke_access", { id, target: data?.user_id });
  revalidatePath("/admin/subscriptions");
}

export async function savePlan(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = s(f, "id"), rupees = Number(s(f, "price"));
  if (!/^[a-z0-9-]{2,40}$/.test(id) || !(rupees >= 0 && rupees <= 1000000)) return;
  const row = { id, name: s(f, "name").slice(0, 80) || id, description: s(f, "description").slice(0, 300), price_paise: Math.round(rupees * 100),
    period_days: Math.min(Math.max(parseInt(s(f, "period_days")) || 30, 1), 3650), active: s(f, "active") === "1",
    features: s(f, "features").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 12), updated_at: new Date().toISOString() };
  await supabase.from("subscription_plans").upsert(row);
  await logActivity(supabase, user, "admin_plan", { id, price: rupees, active: row.active });
  revalidatePath("/admin/subscriptions"); revalidatePath("/pricing");
}

export async function setPublicLab(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const lab = s(f, "lab").slice(0, 200);
  if (!lab) return;
  await supabase.from("platform_settings").upsert({ key: "public_lab", value: lab, is_public: true, updated_at: new Date().toISOString() });
  await supabase.from("lab_settings").upsert({ lab_id: lab, published: true, updated_at: new Date().toISOString() });
  await logActivity(supabase, user, "admin_public_lab", { lab });
  revalidatePath("/admin/labs");
}

export async function submitTask(input: { lab: string; task: string; answer: string; output?: string; passed?: boolean | null }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to save submissions." };
  const answer = String(input.answer ?? "").slice(0, 20000);
  if (answer.trim().length < 2) return { error: "Write your answer first." };
  const status = input.passed === true ? "passed" : input.passed === false ? "needs_work" : "submitted";
  const { error } = await supabase.from("task_submissions").insert({ user_id: user.id, lab_id: String(input.lab).slice(0, 200), task_id: String(input.task).slice(0, 100), answer, output: input.output ? String(input.output).slice(0, 20000) : null, auto_passed: input.passed ?? null, status });
  if (error) return { error: "You need an active membership to submit for this lab." };
  await logActivity(supabase, user, "task_submit", { lab: input.lab, task: input.task, status });
  return { ok: true, status };
}

export async function reviewSubmission(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = Number(s(f, "id")), status = s(f, "status");
  if (!["approved", "rejected", "needs_work", "passed"].includes(status)) return;
  await supabase.from("task_submissions").update({ status, feedback: s(f, "feedback").slice(0, 4000) || null, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", id);
  await logActivity(supabase, user, "admin_review", { id, status });
  revalidatePath("/admin/submissions");
}
