import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { learnerSnapshot, recommendNext } from "@/lib/engine";
import { PageHeader, Stat } from "@/components/ui";

export default async function Dashboard() {
  const user = await requireUser();
  const [recs, snap] = await Promise.all([recommendNext(user.id), learnerSnapshot(user.id)]);
  const primary = recs[0];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={`What should I do now, ${user.name.split(" ")[0]}?`} lead="Recommendations come from your prerequisite graph, mastery evidence, due reviews, active project and target role — not from a calendar." />

      {primary ? (
        <section className="card border-accent/40 p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Next best task · {primary.kind}</div>
          <h2 className="mt-1 text-xl font-semibold">{primary.title}</h2>
          <div className="mt-3 text-sm">
            <div className="font-medium text-muted">Why this task?</div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">{primary.why.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
          <Link href={primary.href} className="btn btn-primary mt-4">Open</Link>
        </section>
      ) : (
        <section className="card p-6"><div className="font-medium">Nothing to recommend yet</div><p className="mt-1 text-sm text-muted">Open the curriculum and start with Python Fundamentals or Linear Algebra.</p><Link href="/curriculum" className="btn btn-primary mt-4">Open curriculum</Link></section>
      )}

      {recs.length > 1 && (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recs.slice(1).map((r) => (
            <Link key={r.href + r.title} href={r.href} className="card block p-4 hover:bg-surface-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{r.kind}</div>
              <div className="mt-0.5 font-medium">{r.title}</div>
              <div className="mt-1 text-xs text-muted">{r.why[0]}</div>
            </Link>
          ))}
        </section>
      )}

      <h2 className="mt-10 mb-3 text-sm font-semibold text-muted">Evidence so far (real events only)</h2>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Lessons at core threshold" value={snap.lessonsAtCore} hint={`${snap.lessonsStarted} started`} />
        <Stat label="Independent attempts" value={snap.independentAttempts} hint={`of ${snap.attempts} total`} />
        <Stat label="Transfer successes" value={snap.transferSuccesses} hint="transfer items scored ≥ 2 " />
        <Stat label="Project evidence items" value={snap.evidenceItems} hint="commits, PRs, deployments, reports" />
      </section>

      {snap.errors.length > 0 && (
        <section className="card mt-6 p-5">
          <div className="text-sm font-semibold">Error notebook</div>
          <p className="text-xs text-muted">Your own classifications. Concept errors suggest re-learning; selection errors suggest interleaved practice; load errors suggest smaller blocks.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{snap.errors.map((e) => <span key={e.errorType} className="badge">{e.errorType} × {e.c}</span>)}</div>
        </section>
      )}
      {snap.dueReviews > 0 && <p className="mt-6 text-sm text-muted">{snap.dueReviews} review item(s) are due. <Link href="/review" className="text-accent underline">Open review</Link></p>}
    </div>
  );
}
