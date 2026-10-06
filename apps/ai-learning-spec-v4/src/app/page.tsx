import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MODULES, TOTAL_TOPICS } from "@/content/curriculum";
import { PROJECTS } from "@/content/projects";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="text-sm font-semibold tracking-wide">IH · AI Engineering Learning OS</span>
          <nav className="flex gap-2">
            <Link href="/login" className="rounded-md px-3 py-1.5 text-[13.5px] text-white/85 hover:bg-white/10">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-md bg-white px-3 py-1.5 text-[13.5px] font-medium text-navy hover:bg-white/90">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-[13px] font-medium uppercase tracking-widest text-accent">
          Ismaili Harvard Learning Science · IHLS
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink">
          A serious, evidence-driven study system for becoming an AI Engineer.
        </h1>
        <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-soft">
          The complete original curriculum — Python, mathematics, data analysis, SQL &
          data engineering, machine learning, deep learning, and MLOps — preserved in full
          and taught through retrieval practice, transfer tasks, case decisions, spaced
          review, and real project evidence. Harvard-mapped layers are labeled honestly
          with verification status. This is a self-study system, not a Harvard credential.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/signup" className="rounded-lg bg-navy px-5 py-2.5 text-[14.5px] font-medium text-white hover:bg-navy-deep">
            Start studying
          </Link>
          <Link href="/login" className="rounded-lg border border-line bg-card px-5 py-2.5 text-[14.5px] font-medium text-ink hover:border-ink-faint">
            Sign in
          </Link>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: `${MODULES.length}`, v: "original modules, preserved in full" },
            { k: `${totalLessons}`, v: "structured lessons with transfer tasks" },
            { k: `${TOTAL_TOPICS}`, v: "topics feeding the spaced-review engine" },
            { k: `${PROJECTS.length}`, v: "real-data projects on a 10-level ladder" },
          ].map((s) => (
            <div key={s.v} className="rounded-xl border border-line bg-card p-5">
              <dt className="text-2xl font-semibold text-navy">{s.k}</dt>
              <dd className="mt-1 text-[13px] leading-snug text-ink-soft">{s.v}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Mastery, not completion",
              b: "Content seen, recall demonstrated, transfer demonstrated, and project evidence are tracked separately. Watching a lesson never counts as knowing it.",
            },
            {
              t: "State-adaptive study",
              b: "Focused, drifting, foggy, or overloaded — the system adapts task size and scaffolding to your state instead of forcing a fixed protocol. No diagnoses, ever.",
            },
            {
              t: "Evidence-based career engine",
              b: "Two encoded reference AI-engineer roles drive a skill-gap analysis computed only from your recorded evidence. No invented readiness scores.",
            },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-line bg-card p-5">
              <h3 className="text-[15px] font-semibold text-ink">{f.t}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{f.b}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line py-6">
        <p className="mx-auto max-w-5xl px-5 text-[12px] text-ink-faint">
          Not affiliated with, endorsed by, or a credential from Harvard University.
        </p>
      </footer>
    </div>
  );
}
