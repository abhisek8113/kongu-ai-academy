"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp } from "@/app/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="btn-red w-full" disabled={pending}>{pending ? "Please wait…" : label}</button>;
}

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action] = useFormState(mode === "login" ? signIn : signUp, null as any);
  return (
    <form action={action} className="card grid gap-3">
      <h1 className="text-3xl font-semibold">{mode === "login" ? "Log in" : "Create your free account"}</h1>
      {mode === "signup" && (
        <>
          <label className="label">Full name<input name="full_name" required className="input" autoComplete="name" /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="label">Phone<input name="phone" type="tel" className="input" autoComplete="tel" /></label>
            <label className="label">College / school / company<input name="institution" className="input" /></label>
          </div>
        </>
      )}
      <label className="label">Email<input name="email" type="email" required className="input" autoComplete="email" /></label>
      <label className="label">Password<input name="password" type="password" required minLength={8} className="input" autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
      <input type="hidden" name="next" value={next ?? ""} />
      {state?.error && <p className="text-sm font-semibold text-red-700">{state.error}</p>}
      {state?.ok && <p className="text-sm font-semibold text-green-800">{state.ok}</p>}
      <Submit label={mode === "login" ? "Log in" : "Create account"} />
      <p className="text-sm text-mute">
        {mode === "login" ? <>New here? <Link href="/signup" className="font-semibold text-madder underline">Join free</Link></> : <>Have an account? <Link href="/login" className="font-semibold text-madder underline">Log in</Link></>}
      </p>
    </form>
  );
}
