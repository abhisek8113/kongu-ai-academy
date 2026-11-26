import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Set of lab ids the admin has unpublished. Labs are published unless listed here. */
export async function getUnpublished(): Promise<Set<string>> {
  try {
    const { data } = await createClient().from("lab_settings").select("lab_id").eq("published", false);
    return new Set((data ?? []).map((r: any) => r.lab_id));
  } catch {
    return new Set();
  }
}

/** The single public demo lab, from platform settings. */
export async function getPublicLab(): Promise<string> {
  try {
    const { data } = await createClient().from("platform_settings").select("value").eq("key", "public_lab").maybeSingle();
    return data?.value ?? "playground/python";
  } catch {
    return "playground/python";
  }
}

/**
 * Server-side gate for every lab page (second layer after middleware).
 * Access is decided by the database function has_lab_access.
 */
export async function requirePublished(labId: string) {
  const supabase = createClient();
  const { data: allowed, error } = await supabase.rpc("has_lab_access", { lab: labId });
  if (error) notFound();
  if (allowed) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/`);
  const off = await getUnpublished();
  if (off.has(labId)) notFound();
  redirect("/pricing");
}
