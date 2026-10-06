"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <p className="text-center text-[12.5px] font-medium uppercase tracking-widest text-accent">
          IH · AI Engineering Learning OS
        </p>
        <h1 className="mt-2 text-center text-xl font-semibold text-ink">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h1>
        <form action={formAction} className="mt-6 space-y-4 rounded-xl border border-line bg-card p-6">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="block text-[13px] font-medium text-ink-soft">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                minLength={2}
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[14px] text-ink"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-ink-soft">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[14px] text-ink"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-ink-soft">
              Password {mode === "signup" && <span className="text-ink-faint">(min. 8 characters)</span>}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : 1}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[14px] text-ink"
            />
          </div>
          {state.error && (
            <p role="alert" className="rounded-lg bg-bad-soft px-3 py-2 text-[13px] text-bad">
              {state.error}
            </p>
          )}
          <button
            disabled={pending}
            className="w-full rounded-lg bg-navy px-4 py-2.5 text-[14px] font-medium text-white hover:bg-navy-deep disabled:opacity-60"
          >
            {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-[13px] text-ink-soft">
          {mode === "login" ? (
            <>
              No account?{" "}
              <Link href="/signup" className="font-medium text-accent hover:underline">
                Create one
              </Link>
            </>
          ) : (
            <>
              Already registered?{" "}
              <Link href="/login" className="font-medium text-accent hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
