"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = mode === "register"
      ? { intent: "register", name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? "") }
      : { intent: "login", email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? "") };
    const r = await api<{ id: string }>("/api/auth", payload);
    setBusy(false);
    if (!r.ok) return setError(r.error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-sm text-muted"><span className="h-6 w-6 rounded bg-accent" aria-hidden />Ismaili Harvard AI Engineering Learning OS</Link>
      <h1 className="text-2xl font-semibold">{mode === "register" ? "Create your account" : "Sign in"}</h1>
      <p className="mt-1 text-sm text-muted">{mode === "register" ? "Your progress, projects and mentor conversations are private to this account." : "Welcome back."}</p>
      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
        {mode === "register" && (
          <label className="block text-sm">Name<input name="name" required maxLength={100} className="input mt-1" autoComplete="name" /></label>
        )}
        <label className="block text-sm">Email<input name="email" type="email" required className="input mt-1" autoComplete="email" /></label>
        <label className="block text-sm">Password<input name="password" type="password" required minLength={mode === "register" ? 8 : 1} className="input mt-1" autoComplete={mode === "register" ? "new-password" : "current-password"} />{mode === "register" && <span className="mt-1 block text-xs text-muted">At least 8 characters.</span>}</label>
        {error && <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full justify-center" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
      </form>
      <p className="mt-4 text-sm text-muted">
        {mode === "register" ? <>Already have an account? <Link className="text-accent underline" href="/login">Sign in</Link></> : <>New here? <Link className="text-accent underline" href="/signup">Create an account</Link></>}
      </p>
    </main>
  );
}
