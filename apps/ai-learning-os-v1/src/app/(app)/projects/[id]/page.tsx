import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes, projectCatalog, projectEvidence, skills, userProjects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getMasteryMap, CORE_THRESHOLD } from "@/lib/engine";
import { SourceBadge } from "@/components/ui";
import { ProjectEditor } from "@/components/ProjectForm";
import { MentorPanel } from "@/components/MentorPanel";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  // Owner-scoped: another student's project id resolves to not-found.
  const [p] = await db.select().from(userProjects).where(and(eq(userProjects.id, id), eq(userProjects.ownerId, user.id))).limit(1);
  if (!p) notFound();
  const [cat] = await db.select().from(projectCatalog).where(eq(projectCatalog.id, p.catalogId)).limit(1);
  const [evidence, skillRows, prereqNodes, mastery] = await Promise.all([
    db.select().from(projectEvidence).where(and(eq(projectEvidence.userProjectId, p.id), eq(projectEvidence.ownerId, user.id))).orderBy(desc(projectEvidence.createdAt)),
    cat.skillIds.length ? db.select().from(skills).where(inArray(skills.id, cat.skillIds)) : Promise.resolve([]),
    cat.prerequisiteNodeIds.length ? db.select({ id: curriculumNodes.id, title: curriculumNodes.title }).from(curriculumNodes).where(inArray(curriculumNodes.id, cat.prerequisiteNodeIds)).orderBy(asc(curriculumNodes.position)) : Promise.resolve([]),
    getMasteryMap(user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="text-xs text-muted"><Link href="/projects" className="hover:underline">Projects</Link> / <span className="text-ink">{cat.title}</span></nav>
      <div className="mt-2 flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{cat.title}</h1><SourceBadge s={cat.sourceCategory} /><span className="badge">Level {cat.ladderLevel}</span><span className="badge">{cat.domain}</span></div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-semibold">Brief</h2>
            <p className="mt-1 text-sm leading-relaxed">{cat.brief}</p>
            <h3 className="mt-4 text-sm font-semibold">Data policy</h3>
            <p className="mt-1 text-sm text-muted">{cat.dataGuidance}</p>
            <p className="mt-2 text-xs text-muted">Record: source, license/terms, acquisition date, version, schema, data dictionary, known limitations, bias risks, leakage risks, reproducibility. Synthetic data only for explicit synthetic-data lessons or deterministic tests, and must be labelled.</p>
            <h3 className="mt-4 text-sm font-semibold">Deliverables</h3>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{cat.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
            <div className="mt-4 flex flex-wrap gap-1.5">{skillRows.map((s) => <span key={s.id} className="badge">{s.name}</span>)}</div>
            {prereqNodes.length > 0 && <div className="mt-3 text-xs text-muted">Prerequisite lessons: {prereqNodes.map((n) => <Link key={n.id} href={`/learn/${n.id}`} className={`badge mr-1 hover:underline ${(mastery.get(n.id)?.level ?? 0) >= CORE_THRESHOLD ? "!bg-ok-soft !text-ok" : "!bg-warn-soft !text-warn"}`}>{n.title}</Link>)}</div>}
          </section>

          <ProjectEditor project={{ id: p.id, status: p.status, repoUrl: p.repoUrl, codespaceUrl: p.codespaceUrl, colabUrl: p.colabUrl, kaggleUrl: p.kaggleUrl, datasetUrl: p.datasetUrl, datasetLicense: p.datasetLicense, deploymentUrl: p.deploymentUrl, reportUrl: p.reportUrl, notes: p.notes, checklist: p.checklist }} dod={cat.definitionOfDone} />

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Evidence ({evidence.length})</h2>
            {evidence.length === 0 ? <p className="mt-1 text-sm text-muted">No evidence yet. Nothing is counted toward skills or portfolio until you attach a real artifact.</p> : (
              <ul className="mt-2 space-y-2 text-sm">{evidence.map((e) => <li key={e.id} className="rounded-md border border-border p-3"><div className="flex flex-wrap items-center gap-1.5"><span className="badge">{e.kind.replace("_", " ")}</span><span className="badge">{e.evidenceClass.replace(/_/g, " ")}</span><span className="text-xs text-muted">{e.createdAt.toLocaleDateString()}</span></div><p className="mt-1">{e.description}</p>{e.url && <a href={e.url} target="_blank" rel="noreferrer" className="text-xs text-accent underline break-all">{e.url}</a>}</li>)}</ul>
            )}
          </section>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <MentorPanel nodeId={cat.prerequisiteNodeIds[0] ?? null} nodeTitle={cat.title} compact />
          <p className="mt-2 text-xs text-muted">Project Supervisor mode: ask for a review of your plan, a Jira-style task breakdown (issue · context · acceptance criteria · constraints · DoD), or a defence question before you submit.</p>
        </aside>
      </div>
    </div>
  );
}
