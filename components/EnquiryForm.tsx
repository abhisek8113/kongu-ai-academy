"use client";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitEnquiry } from "@/app/actions";

const INTERESTS = [
  "Python & Data Foundations", "Classical Machine Learning", "Artificial Intelligence", "Generative AI", "Data Science",
  "Power BI", "Power Apps", "Power Automate", "Faculty Development Programme", "Value-added course",
  "School AI programme", "Institutional training", "Corporate training",
];

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-red w-full" disabled={pending}>{pending ? "Sending…" : "Request Free Demo"}</button>;
}

export default function EnquiryForm() {
  const [state, action] = useFormState(submitEnquiry, null as any);
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [started, setStarted] = useState("0");
  useEffect(() => {
    setStarted(String(Date.now()));
    const c = new URLSearchParams(window.location.search).get("course");
    if (c) setInterest(INTERESTS.find((i) => i.toLowerCase() === c.toLowerCase()) ?? INTERESTS[0]);
  }, []);
  const today = new Date().toISOString().slice(0, 10);

  if (state?.ok) {
    return (
      <div className="py-6 text-center" role="status">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-madder/15 text-2xl text-cyan">✓</div>
        <p className="mt-4 text-xl font-semibold">Request received</p>
        <p className="mt-2 text-mute">{state.ok}</p>
      </div>
    );
  }
  const err = (k: string) => state?.fields?.[k] && <span className="text-xs font-normal text-[#FF8A8A]">{state.fields[k]}</span>;
  return (
    <form action={action} className="relative grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="label">Name *<input name="name" required maxLength={80} className="input" autoComplete="name" />{err("name")}</label>
        <label className="label">Phone number *<input name="phone" type="tel" required inputMode="tel" maxLength={16} className="input" autoComplete="tel" placeholder="10-digit mobile" />{err("phone")}</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="label">Email<input name="email" type="email" maxLength={120} className="input" autoComplete="email" />{err("email")}</label>
        <label className="label">College / institution / company *<input name="institution" required maxLength={120} className="input" />{err("institution")}</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="label">Interested course
          <select name="interest" value={interest} onChange={(e) => setInterest(e.target.value)} className="input">{INTERESTS.map((i) => <option key={i}>{i}</option>)}</select>
        </label>
        <label className="label">Participants<input name="participants" type="number" min={1} max={5000} className="input" />{err("participants")}</label>
        <label className="label">Preferred date<input name="preferred_date" type="date" min={today} className="input [color-scheme:dark]" /></label>
      </div>
      <label className="label">Message<textarea name="message" rows={3} maxLength={1000} className="input" /></label>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <input type="hidden" name="started" value={started} />
      {state?.error && <p role="alert" className="rounded-lg border border-[#FF8A8A]/40 bg-[#FF8A8A]/10 px-3 py-2 text-sm text-[#FFB3B3]">{state.error}</p>}
      <Submit />
      <p className="text-xs text-mute">We use your details only to arrange your demo. See our <a href="/privacy" className="underline">privacy policy</a>.</p>
    </form>
  );
}
