import type { SupabaseClient, User } from "@supabase/supabase-js";

export const ACTION_LABELS: Record<string, string> = {
  signup: "Signed up",
  login: "Logged in",
  logout: "Logged out",
  lab_open: "Opened lab",
  colab_open: "Launched Colab",
  lab_complete: "Completed lab",
  lab_undo: "Un-marked lab",
  enquiry: "Demo request",
  enrol_request: "Requested enrolment",
  admin_batch: "Admin: created batch",
  admin_batch_toggle: "Admin: changed batch",
  admin_enrolment: "Admin: updated enrolment",
  admin_lead: "Admin: updated lead",
  admin_certificate: "Admin: issued certificate",
};

/** Write one activity event. Never throws: logging must not break the page. */
export async function logActivity(
  supabase: SupabaseClient,
  user: User | null,
  action: string,
  meta: Record<string, unknown> = {},
  actor?: string | null
) {
  try {
    const name = actor ?? (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? null;
    await supabase.from("activity_log").insert({ user_id: user?.id ?? null, actor: name, action, meta });
    if (user) await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);
  } catch {
    /* ignore */
  }
}
