"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getUserAndProfile } from "@/lib/supabase/server";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signIn(_: unknown, f: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: s(f, "email"), password: s(f, "password") });
  if (error) return { error: error.message };
  redirect(s(f, "next") || "/dashboard");
}

export async function signUp(_: unknown, f: FormData) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: s(f, "email"),
    password: s(f, "password"),
    options: {
      data: { full_name: s(f, "full_name"), phone: s(f, "phone"), institution: s(f, "institution") },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/login`,
    },
  });
  if (error) return { error: error.message };
  if (!data.session) return { ok: "Check your email to confirm your account, then log in." };
  redirect("/dashboard");
}

export async function submitEnquiry(_: unknown, f: FormData) {
  const name = s(f, "name"), phone = s(f, "phone"), institution = s(f, "institution");
  if (!name || !phone || !institution) return { error: "Please fill in your name, phone and institution." };
  const supabase = createClient();
  const participants = parseInt(s(f, "participants")) || null;
  const { error } = await supabase.from("enquiries").insert({
    name, phone, institution, email: s(f, "email") || null,
    interest: s(f, "interest") || "General", participants, message: s(f, "message") || null,
  });
  if (error) return { error: "Could not save your request. Please WhatsApp +91 95145 24599." };
  return { ok: "Thank you! We'll contact you within 48 hours to fix your free demo." };
}

export async function requestEnrolment(f: FormData) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login?next=/programmes");
  await supabase.from("enrolments").insert({ user_id: user.id, batch_id: Number(f.get("batch_id")) });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleLab(f: FormData) {
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login");
  const lab_id = s(f, "lab_id"), path = s(f, "path"), done = s(f, "done") === "1";
  if (done) await supabase.from("lab_progress").delete().eq("user_id", user.id).eq("lab_id", lab_id);
  else await supabase.from("lab_progress").upsert({ user_id: user.id, lab_id, submission_url: s(f, "submission_url") || null });
  revalidatePath(path);
  revalidatePath("/dashboard");
}

async function requireAdmin() {
  const ctx = await getUserAndProfile();
  if (!ctx.user || ctx.profile?.role !== "admin") redirect("/dashboard");
  return ctx.supabase;
}

export async function updateEnquiryStatus(f: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("enquiries").update({ status: s(f, "status") }).eq("id", Number(f.get("id")));
  revalidatePath("/admin");
}

export async function createBatch(f: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("batches").insert({
    title: s(f, "title"), track: s(f, "track"), institution: s(f, "institution") || null,
    starts_on: s(f, "starts_on") || null, ends_on: s(f, "ends_on") || null, seats: Number(f.get("seats")) || 60,
  });
  revalidatePath("/admin");
  revalidatePath("/programmes");
}

export async function toggleBatch(f: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("batches").update({ is_open: s(f, "open") === "1" }).eq("id", Number(f.get("id")));
  revalidatePath("/admin");
  revalidatePath("/programmes");
}

export async function updateEnrolment(f: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("enrolments").update({ status: s(f, "status") }).eq("id", Number(f.get("id")));
  revalidatePath("/admin");
}

export async function issueCertificate(f: FormData) {
  const supabase = await requireAdmin();
  const year = new Date().getFullYear();
  const id = `KAA-${year}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  await supabase.from("certificates").insert({
    id, user_id: s(f, "user_id") || null, recipient_name: s(f, "recipient_name"),
    programme: s(f, "programme"), institution: s(f, "institution") || null,
  });
  revalidatePath("/admin");
}
