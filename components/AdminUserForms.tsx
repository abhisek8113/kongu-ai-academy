"use client";
import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { adminCreateUser, adminSetPassword } from "@/app/actions";

function Btn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="btn-red" disabled={pending}>{pending ? "Working…" : label}</button>;
}

function Credentials({ email, password, note }: { email: string; password: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Kongu AI Academy login\nhttps://kongu-ai-academy.vercel.app/login\nEmail: ${email}\nPassword: ${password}`;
  return (
    <div className="rounded-xl border border-[#1f7a4d] bg-[#1f7a4d]/10 p-4">
      <p className="font-medium text-[#5fd39a]">Done — share these login details with the student now</p>
      <pre className="mt-2 whitespace-pre-wrap font-mono text-[13px]">{text}</pre>
      <button type="button" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); }} className="btn-ghost mt-2 min-h-[36px] px-3 text-sm">{copied ? "Copied ✓" : "Copy login details"}</button>
      <p className="mt-2 text-xs text-mute">{note ?? "For security this password is shown only once and is never stored in readable form. If it's lost, set a new one."}</p>
    </div>
  );
}

export function CreateUserForm() {
  const [st, action] = useFormState(adminCreateUser, null as any);
  return (
    <form action={action} className="card grid gap-3">
      <h2 className="text-lg">Create a student account</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="label">Full name<input name="full_name" required className="input" /></label>
        <label className="label">Email<input name="email" type="email" required className="input" /></label>
        <label className="label">Phone<input name="phone" className="input" /></label>
        <label className="label">College / company<input name="institution" className="input" /></label>
        <label className="label">Password <span className="font-normal text-mute">(leave empty to generate)</span><input name="password" minLength={8} className="input font-mono" autoComplete="off" /></label>
        <label className="label">Free access days <span className="font-normal text-mute">(0 = none)</span><input name="days" type="number" min={0} max={3650} defaultValue={0} className="input" /></label>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="approve" value="1" defaultChecked /> Approve the account now</label>
      {st?.error && <p role="alert" className="text-sm text-[#FF8A8A]">{st.error}</p>}
      {st?.ok && <Credentials email={st.email} password={st.password} note={st.confirmed ? undefined : "The student must first click the confirmation email Supabase sends them. Add SUPABASE_SERVICE_ROLE_KEY in Vercel to skip this step."} />}
      <div><Btn label="Create account" /></div>
    </form>
  );
}

export function SetPasswordForm({ userId }: { userId: string }) {
  const [st, action] = useFormState(adminSetPassword, null as any);
  return (
    <form action={action} className="card grid gap-3">
      <h2 className="text-lg">Password</h2>
      <p className="text-sm text-mute">Existing passwords are encrypted and can't be viewed by anyone. Set a new one and give it to the student.</p>
      <input type="hidden" name="user_id" value={userId} />
      <label className="label">New password <span className="font-normal text-mute">(leave empty to generate)</span><input name="password" minLength={8} className="input font-mono" autoComplete="off" /></label>
      {st?.error && <p role="alert" className="text-sm text-[#FF8A8A]">{st.error}</p>}
      {st?.ok && st.emailed && <p className="text-sm text-[#5fd39a]">A password-reset email was sent to {st.email}.</p>}
      {st?.ok && st.password && <Credentials email={st.email} password={st.password} />}
      <div><Btn label="Set new password" /></div>
    </form>
  );
}
