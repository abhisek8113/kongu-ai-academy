import Link from "next/link";
import { createClient as anon } from "@supabase/supabase-js";
import { paymentsEnabled } from "@/lib/payments";
import Checkout, { LockedNotice } from "@/components/Checkout";

export const revalidate = 60;
export const metadata = { title: "Pricing", description: "Kongu AI Academy membership plans: one free demo lab, full lab access with a membership." };
const inr = (p: number) => "₹" + (p / 100).toLocaleString("en-IN");

export default async function Pricing() {
  const supabase = anon(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data: plans } = await supabase.from("subscription_plans").select("*").eq("active", true).order("sort");
  const enabled = paymentsEnabled();
  return (
    <div className="wrap py-12">
      <p className="kicker">Pricing</p>
      <h1 className="mt-3 text-4xl">Simple memberships</h1>
      <p className="mt-3 max-w-2xl text-mute">Try the Python demo lab free, without an account. A membership unlocks every published lab, graded exercises, submissions and progress tracking.</p>
      <LockedNotice />
      {!enabled && <p className="mt-6 rounded-xl border border-rule p-4 text-sm text-mute">Online payment is being set up. Pick a plan to send a request — the academy confirms payment by UPI or bank transfer and activates your membership the same day.</p>}
      <div className="mt-8 grid gap-5 lg:grid-cols-4">
        <div className="card flex flex-col">
          <h2 className="text-xl">Free Explorer</h2>
          <p className="mt-2 font-display text-3xl">₹0</p>
          <ul className="mt-4 flex-1 space-y-2 text-sm text-mute"><li>✓ One public demo lab (Python)</li><li>✓ Lab previews and syllabus</li><li>✓ No card needed</li></ul>
          <Link href="/playground/python" className="btn-ghost mt-6 justify-center">Try the demo lab</Link>
        </div>
        {(plans ?? []).map((p: any) => (
          <div key={p.id} className={`card flex flex-col ${p.id === "quarterly" ? "border-madder/70 shadow-glow" : ""}`}>
            <h2 className="text-xl">{p.name}</h2>
            <p className="mt-2 font-display text-3xl">{inr(p.price_paise)}<span className="text-sm text-mute"> / {p.period_days} days</span></p>
            <p className="mt-2 text-sm text-mute">{p.description}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">{(p.features ?? []).map((f: string) => <li key={f}>✓ {f}</li>)}</ul>
            <div className="mt-6"><Checkout plan={p.id} planName={p.name} enabled={enabled} /></div>
          </div>
        ))}
      </div>
      <ol className="mt-14 grid gap-4 text-sm text-mute md:grid-cols-5">
        {["Try the free demo lab", "Create your account", "Verify your email", "Choose a plan and pay", "Start learning from your dashboard"].map((t, i) => (
          <li key={t} className="rounded-xl border border-rule p-4"><span className="font-mono text-cyan">Step {i + 1}</span><p className="mt-1 text-ink">{t}</p></li>
        ))}
      </ol>
    </div>
  );
}
