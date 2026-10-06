"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp, type ActionResult } from "@/app/actions";
import { ResultNote, SubmitButton } from "@/components/ui";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [signInState, signInAction] = useActionState<ActionResult | null, FormData>(signIn, null);
  const [signUpState, signUpAction] = useActionState<ActionResult | null, FormData>(signUp, null);
  const state = mode === "signin" ? signInState : signUpState;

  useEffect(() => {
    if (state?.ok) router.push("/dashboard");
  }, [state, router]);

  return (
    <div className="surface p-5">
      <div className="flex gap-1.5 mb-4">
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className="btn"
            aria-pressed={mode === m}
            style={
              mode === m
                ? { borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)" }
                : undefined
            }
            onClick={() => setMode(m)}
          >
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <form action={mode === "signin" ? signInAction : signUpAction} className="space-y-3">
        {mode === "signup" ? (
          <label className="block">
            <span className="text-xs muted">Name</span>
            <input name="name" className="field mt-1" required minLength={2} maxLength={80} autoComplete="name" />
          </label>
        ) : null}
        <label className="block">
          <span className="text-xs muted">Email</span>
          <input name="email" type="email" className="field mt-1" required autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-xs muted">
            Password{mode === "signup" ? " (at least 10 characters)" : ""}
          </span>
          <input
            name="password"
            type="password"
            className="field mt-1"
            required
            minLength={mode === "signup" ? 10 : 1}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </label>
        <SubmitButton>{mode === "signup" ? "Create account" : "Sign in"}</SubmitButton>
        <ResultNote result={state} />
      </form>
      <p className="text-[11px] muted mt-4 leading-relaxed">
        Your learning record is private to your account. Every query in this application is scoped to the
        session-derived user id; no learner can read another learner&apos;s progress, projects, attempts or mentor
        threads.
      </p>
    </div>
  );
}
