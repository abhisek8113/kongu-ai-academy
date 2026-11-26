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
  if (!data.session) return { ok: "Account created. Check your email and click the confirmation link, then log in." };
  redirect("/dashboard");
}

export async function submitEnquiry(_: unknown, f: FormData) {
  const name = s(f, "name"), phone = s(f, "phone"), institution = s(f, "institution");
  if (!name || !phone || !institution) return { error: "Please fill in your name, phone and institution." };
  const supabase = createClient();
  const participants = parseInt(s(f, "participants")) || null;
  const interest = s(f, "interest") || "General";
  const { error } = await supabase.from("enquiries").insert({
    name, phone, institution, email: s(f, "email") || null, interest, participants, message: s(f, "message") || null,
  });
  if (error) return { error: "Could not save your request. Please WhatsApp +91 95145 24599." };
  const { data: { user } } = await supabase.auth.getUser();
  await logActivity(supabase, user, "enquiry", { institution, interest, participants }, name);
  return { ok: "Thank you! We'll contact you within 48 hours to fix your free demo." };
}

export async function requestEnrolment(f: FormData) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login?next=/programmes");
  const batch_id = Number(f.get("batch_id"));
  await supabase.from("enrolments").insert({ user_id: user.id, batch_id });
  const { data: b } = await supabase.from("batches").select("title").eq("id", batch_id).maybeSingle();
  await logActivity(supabase, user, "enrol_request", { batch: b?.title ?? batch_id });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleLab(f: FormData) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login");
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
