import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectCatalog, projectEvidence, userProjects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Empty, PageHeader } from "@/components/ui";

const CLASSES = ["signature_project", "professional_evidence", "portfolio_project", "technical_artifact", "skill_evidence", "practice_only"];
const CV_ELIGIBLE = new Set(["signature_project", "professional_evidence", "portfolio_project", "technical_artifact"]);

export default async function PortfolioPage() {
  const user = await requireUser();
  const rows = await db.select({ e: projectEvidence, p: userProjects, c: projectCatalog }).from(projectEvidence).innerJoin(userProjects, eq(userProjects.id, projectEvidence.userProjectId)).innerJoin(projectCatalog, eq(projectCatalog.id, userProjects.catalogId)).where(eq(projectEvidence.ownerId, user.id)).orderBy(desc(projectEvidence.createdAt));
  const cvRows = rows.filter((r) => CV_ELIGIBLE.has(r.e.evidenceClass));
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Portfolio" lead="External evidence. Every CV bullet must map to a repository, commit/PR, deployed system, report, or metric source. Nothing here is generated without an underlying artifact." />
      {rows.length === 0 ? <Empty title="No portfolio evidence yet" body="Attach evidence on a project page. Only technical artifacts, portfolio projects, professional evidence and signature projects are CV-eligible." href="/projects" cta="Go to projects" /> : (
        <>
          <section className="card p-5">
            <h2 className="text-sm font-semibold">CV-eligible evidence ({cvRows.length})</h2>
            {cvRows.length === 0 ? <p className="mt-1 text-sm text-muted">You have evidence, but none classified above “skill evidence”. Reclassify only when the artifact genuinely supports it.</p> : (
              <ul className="mt-2 space-y-2 text-sm">{cvRows.map((r) => <li key={r.e.id} className="rounded-md border border-border p-3"><div className="font-medium">{r.c.title} — {r.e.kind.replace("_", " ")}</div><p className="mt-0.5">{r.e.description}</p><div className="mt-1 text-xs text-muted">Evidence: {r.e.url ? <a href={r.e.url} className="text-accent underline break-all" target="_blank" rel="noreferrer">{r.e.url}</a> : "no URL — add one before using this on a CV"} · <Link href={`/projects/${r.p.id}`} className="underline">project</Link></div></li>)}</ul>
            )}
          </section>
          <section className="card mt-4 p-5">
            <h2 className="text-sm font-semibold">All evidence by class</h2>
            {CLASSES.map((c) => { const items = rows.filter((r) => r.e.evidenceClass === c); if (!items.length) return null; return <div key={c} className="mt-3"><div className="text-xs font-semibold uppercase tracking-wide text-muted">{c.replace(/_/g, " ")} · {items.length}</div><ul className="mt-1 space-y-1 text-sm">{items.map((r) => <li key={r.e.id} className="flex flex-wrap justify-between gap-2 border-t border-border py-1"><span>{r.c.title}: {r.e.description}</span><span className="text-xs text-muted">{r.e.kind.replace("_", " ")} · {r.e.createdAt.toLocaleDateString()}</span></li>)}</ul></div>; })}
          </section>
          <section className="card mt-4 p-5"><h2 className="text-sm font-semibold">Case-study template</h2><p className="mt-1 text-xs text-muted">For each portfolio project write: problem · constraints · approach · architecture · data source (with license) · implementation · testing · evaluation · failures · security · deployment · limitations · next steps · GitHub · demo. Use the Mentor's Technical Writing Coach from the project page.</p></section>
        </>
      )}
    </div>
  );
}
