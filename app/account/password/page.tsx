"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { updatePassword } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-red w-full" disabled={pending}>{pending ? "Saving…" : "Save new password"}</button>;
}

export default function NewPassword() {
  const [state, action] = useFormState(updatePassword, null as any);
  return (
    <div className="wrap max-w-md py-16">
      <form action={action} className="card grid gap-4">
        <h1 className="text-3xl">Set a new password</h1>
        <label className="label">New password<input name="password" type="password" minLength={8} required className="input" autoComplete="new-password" /></label>
        <label className="label">Repeat new password<input name="password2" type="password" minLength={8} required className="input" autoComplete="new-password" /></label>
        {state?.error && <p role="alert" className="text-sm text-[#FF8A8A]">{state.error}</p>}
        {state?.ok ? <><p role="status" className="text-sm text-[#5fd39a]">{state.ok}</p><Link href="/dashboard" className="btn-ghost">Go to dashboard</Link></> : <Submit />}
      </form>
    </div>
  );
}
