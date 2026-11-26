"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, getUserAndProfile } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const origin = () => process.env.NEXT_PUBLIC_SITE_URL || headers().get("origin") || "https://kongu-ai-academy.vercel.app";

export async function signOut() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await logActivity(supabase, user, "logout");
  await supabase.auth.signOut();
  redirect("/");
}

export async function signIn(_: unknown, f: FormData) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: s(f, "email"), password: s(f, "password") });
  if (error) return { error: error.message };
  await logActivity(supabase, data.user, "login");
  const next = s(f, "next");
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signUp(_: unknown, f: FormData) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: s(f, "email"),
    password: s(f, "password"),
    options: {
      data: { full_name: s(f, "full_name"), phone: s(f, "phone"), institution: s(f, "institution") },
      emailRedirectTo: `${origin()}/login`,
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
  if (!["approved", "rejected", "pending"].includes(status)) return;
  const id = s(f, "id");
  await supabase.from("profiles").update({ status }).eq("id", id).neq("role", "admin");
  await logActivity(supabase, user, "admin_approval", { student: s(f, "name"), status });
  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
}
