"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      if (res.ok) {
        router.refresh();
        router.push("/");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Sign-in failed");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[rgb(var(--background))]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-navy-600 mx-auto flex items-center justify-center shadow-lg shadow-navy-600/20 mb-4">
            <GraduationCap className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Ismaili Harvard AI Engineering</h1>
          <p className="text-[rgb(var(--text-muted))] text-sm">Sign in with your email to start or continue your learning journey.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:border-navy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Name <span className="text-[rgb(var(--text-subtle))] font-normal">(optional)</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:border-navy-500"
            />
          </div>
          {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">{error}</div>}
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-2.5 rounded-lg bg-navy-600 hover:bg-navy-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Continue"}
          </button>
          <p className="text-[11px] text-[rgb(var(--text-subtle))] text-center leading-relaxed pt-2">
            By continuing you agree to use this as a personal learning OS. No password is required in this preview; your session is stored in a secure cookie.
          </p>
        </form>
        <div className="mt-6 text-center text-[11px] text-[rgb(var(--text-subtle))] space-y-1">
          <p>Harvard-informed curriculum (not an official Harvard degree or product)</p>
          <p>State-adaptive learning · Retrieval · Transfer · Projects · AI Mentor</p>
        </div>
      </div>
    </div>
  );
}
