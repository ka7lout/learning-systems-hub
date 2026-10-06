"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = { mode: "sign-in" | "sign-up" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.message ?? "We could not complete that request. Check your details and try again.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Authentication is unavailable right now. Check the application configuration and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="brand-lockup auth-brand" href="/" aria-label="IHLS home">
          <span className="brand-mark">i</span><span><strong>ihls</strong><small>learning system</small></span>
        </Link>
        <div className="auth-intro">
          <span className="eyebrow"><LockKeyhole size={14} /> PRIVATE LEARNING SPACE</span>
          <h1 id="auth-title">{isSignUp ? "Build your learning record." : "Welcome back."}</h1>
          <p>{isSignUp ? "Create an account to save your learning evidence, projects, and review plan." : "Sign in to continue from your own persisted curriculum and evidence."}</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {isSignUp && <label>Name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required /></label>}
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label>
          <label>Password<input type="password" autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={isSignUp ? 12 : 1} maxLength={128} required />{isSignUp && <small>Use at least 12 characters.</small>}</label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? "Working…" : isSignUp ? "Create account" : "Sign in"}<ArrowRight size={16} /></button>
        </form>
        <p className="auth-switch">{isSignUp ? "Already have an account?" : "New to IHLS?"} <Link href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Sign in" : "Create an account"}</Link></p>
        <p className="auth-privacy">Your learning record is private to your account. Curriculum sources are shown separately from personal evidence.</p>
      </section>
    </main>
  );
}
