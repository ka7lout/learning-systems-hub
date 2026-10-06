import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ORIGINAL_MODULES, ORIGINAL_TOPIC_COUNT } from "@/content/original";
import { PROJECTS } from "@/content/catalog";
import { EXT_LESSONS, STAGES } from "@/content/harvard";

export default async function Landing() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const originalSections = ORIGINAL_MODULES.reduce((a, m) => a + m.sections.length, 0);
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent" aria-hidden />
          <span className="font-semibold tracking-tight">Ismaili Harvard AI Engineering Learning OS</span>
        </div>
        <nav className="flex gap-2">
          <Link className="btn" href="/login">Sign in</Link>
          <Link className="btn btn-primary" href="/signup">Create account</Link>
        </nav>
      </header>

      <section className="mt-20 max-w-3xl">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight">From foundations to independently demonstrated AI engineering competence.</h1>
        <p className="mt-5 text-lg text-muted">
          A Harvard-informed, Harvard-mapped self-study curriculum delivered through the Ismaili Harvard Learning Science method: active recall, spacing, transfer, cases, projects, and an AI mentor that asks for your attempt before it gives you the answer. This is not a Harvard degree and does not claim to be one.
        </p>
        <div className="mt-8 flex gap-3">
          <Link className="btn btn-primary" href="/signup">Start with a clean account</Link>
          <Link className="btn" href="/login">I already have an account</Link>
        </div>
      </section>

      <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: `${ORIGINAL_MODULES.length} modules · ${originalSections} sessions-blocks`, v: `${ORIGINAL_TOPIC_COUNT} original topics preserved, none removed` },
          { k: `${EXT_LESSONS.length} additive lessons`, v: "Harvard College, Harvard Extension, industry and research layers, each labelled" },
          { k: `${PROJECTS.length} projects`, v: "The original 21 plus agents, production AI and research reproduction" },
          { k: `${STAGES.length}-stage spine`, v: "Prerequisite graph, not a flat course list" },
        ].map((c) => (
          <div key={c.k} className="card p-5">
            <div className="font-semibold">{c.k}</div>
            <div className="mt-1 text-sm text-muted">{c.v}</div>
          </div>
        ))}
      </section>

      <section className="mt-20 grid gap-8 md:grid-cols-3">
        {[
          { h: "Understanding, not completion", p: "Mastery is inferred from recall, transfer, independent work and project evidence — never from watching or opening a lesson." },
          { h: "State-adaptive, not timer-driven", p: "Tell the system whether you are focused, drifting, struggling to start, or overloaded. Task size and density adapt. No mandatory Pomodoro, no diagnoses." },
          { h: "Truthful by construction", p: "Every Harvard claim carries a verification status and source. Empty states stay empty until you create real evidence. Provider failures are shown as failures." },
        ].map((c) => (
          <div key={c.h}>
            <h2 className="font-semibold">{c.h}</h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">{c.p}</p>
          </div>
        ))}
      </section>

      <footer className="mt-24 border-t border-border pt-6 text-xs text-muted">
        Harvard course identifiers and structures are cited from official Harvard pages with retrieval dates and statuses inside the app. Harvard is not affiliated with this project.
      </footer>
    </main>
  );
}
