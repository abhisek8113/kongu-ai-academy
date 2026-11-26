import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrder, paymentsEnabled, publicKeyId } from "@/lib/payments";

export async function POST(req: Request) {
  if (!paymentsEnabled()) return NextResponse.json({ error: "Online payments are not configured yet." }, { status: 503 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const { plan } = await req.json().catch(() => ({}));
  if (typeof plan !== "string" || plan.length > 40) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  try {
    const o = await createOrder(user.id, plan);
    return NextResponse.json({ ...o, keyId: publicKeyId(), email: user.email });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Could not start payment" }, { status: 400 });
  }
}
