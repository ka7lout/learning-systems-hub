"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/app/actions/auth";

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "register";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);
  const isRegister = mode === "register";

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{isRegister ? "Create your account" : "Sign in"}</h2>
      <p className="mt-1 text-sm text-ink-2">
        {isRegister ? "Your study data is private to your account." : "Welcome back."}
      </p>

      <form action={formAction} className="mt-6 space-y-4" noValidate>
        {isRegister && (
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" name="name" className="input" autoComplete="name" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input"
            autoComplete={isRegister ? "new-password" : "current-password"}
            aria-describedby={isRegister ? "pw-help" : undefined}
          />
          {isRegister && (
            <p id="pw-help" className="mt-1 text-xs text-ink-3">At least 12 characters. Length matters more than symbols.</p>
          )}
        </div>

        {state?.error && (
          <div role="alert" className="rounded border border-[var(--critical)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--critical)]">
            {state.error}
            {state.issues && <ul className="mt-1 list-disc pl-4">{state.issues.map((i) => <li key={i}>{i}</li>)}</ul>}
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full justify-center" disabled={pending}>
          {pending ? "Working…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-sm text-ink-2">
        {isRegister ? (
          <>Already have an account? <Link className="underline underline-offset-2" href="/login">Sign in</Link></>
        ) : (
          <>No account yet? <Link className="underline underline-offset-2" href="/register">Create one</Link></>
        )}
      </p>
    </div>
  );
}
