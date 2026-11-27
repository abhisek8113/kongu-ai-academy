"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp } from "@/app/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="btn-red w-full" disabled={pending}>{pending ? "Please wait…" : label}</button>;
}

export default function AuthForm({ mode, next, notice, portal = "student" }: { mode: "login" | "signup"; next?: string; notice?: string; portal?: "student" | "admin" }) {
  const admin = portal === "admin";
  const [state, action] = useFormState(mode === "login" ? signIn : signUp, null as any);
  return (
    <form action={action} className="card grid gap-4 p-7">
      <div>
        <p className={`kicker ${admin ? "text-gold" : ""}`}>{admin ? "Administrator console" : mode === "login" ? "Student login" : "Join Kongu AI Academy"}</p>
        <h1 className="mt-2 text-3xl">{admin ? "Admin sign in" : mode === "login" ? "Welcome back" : "Create your account"}</h1>
        {admin && <p className="mt-2 text-sm text-mute">Restricted area. Sign-in attempts are logged.</p>}
        {mode === "login" && next && <p className="mt-2 text-sm text-mute">Log in to open the lab you requested.</p>}
        {mode === "signup" && <p className="mt-2 text-sm text-mute">Free to join. Accounts are approved by the academy before lab progress and enrolment are enabled.</p>}
      </div>
      {notice && <p role="alert" className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">{notice}</p>}
      {mode === "signup" && (
        <>
          <label className="label">Full name<input name="full_name" required className="input" autoComplete="name" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="label">Phone<input name="phone" type="tel" className="input" autoComplete="tel" /></label>
            <label className="label">College / school / company<input name="institution" className="input" /></label>
          </div>
        </>
      )}
      <label className="label">Email<input name="email" type="email" required className="input" autoComplete="email" /></label>
      <label className="label">
        <span className="flex justify-between">Password {mode === "login" && <Link href="/forgot" className="font-normal text-mute underline hover:text-ink">Forgot password?</Link>}</span>
        <input name="password" type="password" required minLength={8} className="input" autoComplete={mode === "login" ? "current-password" : "new-password"} />
      </label>
      <input type="hidden" name="next" value={next ?? ""} />
      <input type="hidden" name="portal" value={portal} />
      {state?.error && <p role="alert" className="text-sm text-[#FF8A8A]">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-[#5fd39a]">{state.ok}</p>}
      <Submit label={mode === "login" ? "Log in" : "Create account"} />
      {!admin && <p className="text-sm text-mute">
        {mode === "login" ? <>New here? <Link href="/signup" className="text-ink underline">Create an account</Link></> : <>Have an account? <Link href="/login" className="text-ink underline">Log in</Link></>}
      </p>}
    </form>
  );
}
