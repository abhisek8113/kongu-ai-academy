"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-red w-full" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>;
}

export default function Forgot() {
  const [state, action] = useFormState(requestPasswordReset, null as any);
  return (
    <div className="wrap max-w-md py-16">
      <form action={action} className="card grid gap-4">
        <h1 className="text-3xl">Reset your password</h1>
        <p className="text-sm text-mute">Enter the email you signed up with. We'll send a link to set a new password.</p>
        <label className="label">Email<input name="email" type="email" required className="input" autoComplete="email" /></label>
        {state?.error && <p role="alert" className="text-sm text-[#FF8A8A]">{state.error}</p>}
        {state?.ok && <p role="status" className="text-sm text-[#5fd39a]">{state.ok}</p>}
        <Submit />
        <Link href="/login" className="text-sm text-mute underline hover:text-ink">Back to log in</Link>
      </form>
    </div>
  );
}
