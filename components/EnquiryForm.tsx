"use client";
import { useFormState, useFormStatus } from "react-dom";
import { submitEnquiry } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-red w-full" disabled={pending}>{pending ? "Sending…" : "Request free demo"}</button>;
}

export default function EnquiryForm() {
  const [state, action] = useFormState(submitEnquiry, null as any);
  if (state?.ok) return <p className="rounded-xl bg-white p-4 font-semibold text-green-800">{state.ok}</p>;
  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="label">Your name<input name="name" required className="input" autoComplete="name" /></label>
        <label className="label">Phone<input name="phone" type="tel" required className="input" autoComplete="tel" /></label>
      </div>
      <label className="label">Institution or company<input name="institution" required className="input" /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="label">Interested in
          <select name="interest" className="input">
            <option>College workshop</option><option>Faculty Development Programme</option><option>Value-added course</option>
            <option>School AI programme</option><option>Power BI / Power Apps / Power Automate</option><option>Corporate training</option>
          </select>
        </label>
        <label className="label">Approx. participants<input name="participants" type="number" min={1} className="input" /></label>
      </div>
      <label className="label">Email (optional)<input name="email" type="email" className="input" /></label>
      <label className="label">Anything else?<textarea name="message" rows={3} className="input" /></label>
      {state?.error && <p className="text-sm font-semibold text-red-700">{state.error}</p>}
      <Submit />
    </form>
  );
}
