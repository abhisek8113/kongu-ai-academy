import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email links (sign-up confirmation, password reset) land here with a one-time code.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") || "/dashboard";
  const next = nextParam.startsWith("/") ? nextParam : "/dashboard";
  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  const fail = new URL("/login", url.origin);
  fail.searchParams.set("error", "That link has expired or was already used. Log in, or request a new reset link.");
  return NextResponse.redirect(fail);
}
