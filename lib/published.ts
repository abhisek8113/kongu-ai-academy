import { notFound } from "next/navigation";
import { createClient, getUserAndProfile } from "@/lib/supabase/server";

/** Set of lab ids the admin has unpublished. Labs are published unless listed here. */
export async function getUnpublished(): Promise<Set<string>> {
  try {
    const { data } = await createClient().from("lab_settings").select("lab_id").eq("published", false);
    return new Set((data ?? []).map((r: any) => r.lab_id));
  } catch {
    return new Set();
  }
}

/** For a lab page: 404 for students when unpublished; the admin can still preview it. */
export async function requirePublished(labId: string) {
  const off = await getUnpublished();
  if (!off.has(labId)) return;
  try {
    const { profile } = await getUserAndProfile();
    if (profile?.role === "admin") return;
  } catch {}
  notFound();
}
