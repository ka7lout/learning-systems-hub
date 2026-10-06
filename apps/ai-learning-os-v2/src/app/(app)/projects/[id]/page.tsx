import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { projectCatalog, userProjects, evidence, skills, nodes } from "@/db/schema";
import { and, eq, inArray, desc } from "drizzle-orm";
import { PageHeader, Section, Empty } from "@/components/ui";
import { ProjectEditor, EvidenceForm } from "@/components/client";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requireUser();
  const pid = Number(id);
  if (!Number.isInteger(pid)) notFound();
  // Ownership-scoped: another student's project id returns 404.
  const [p] = await db.select().from(userProjects).where(and(eq(userProjects.id, pid), eq(userProjects.ownerId, u.id)));
  if (!p) notFound();
  const [c] = await db.select().from(projectCatalog).where(eq(projectCatalog.id, p.catalogId));
  const [ev, sk, units] = await Promise.all([
    db.select().from(evidence).where(and(eq(evidence.ownerId, u.id), eq(evidence.userProjectId, pid))).orderBy(desc(evidence.createdAt)),
    db.select({ id: skills.id, name: skills.name }).from(skills),
    c.nodeIds.length ? db.select({ id: nodes.id, title: nodes.title }).from(nodes).where(inArray(nodes.id, c.nodeIds)) : Promise.resolve([]),
  ]);
  return (
    <>
      <nav className="mb-2 text-xs text-muted"><Link href="/projects" className="hover:underline">Projects</Link></nav>
      <PageHeader title={c.title} lead={c.brief}><span className="chip">{p.status}</span></PageHeader>
      <Section title="Data policy"><p className="text-sm">{c.dataGuidance}</p><p className="mt-1 text-xs text-muted">Record source, license/terms, acquisition date, version, schema, limitations, bias and leakage risks in your README. Synthetic data only when explicitly labelled.</p></Section>
      <Section title="Related units"><ul className="flex flex-wrap gap-2 text-sm">{units.map((x) => <li key={x.id}><Link className="chip !text-accent" href={`/learn/${x.id}`}>{x.title}</Link></li>)}</ul></Section>
      <Section title="Workspace"><div className="card p-5"><ProjectEditor id={p.id} links={p.links} milestones={c.milestones} done={p.milestonesDone} status={p.status} /></div></Section>
      <Section title="Evidence">
        {ev.length ? <ul className="mb-4 space-y-2">{ev.map((e) => <li key={e.id} className="card p-3 text-sm"><span className="chip">{e.cvTier}</span> <span className="chip">{e.kind}</span><p className="mt-1">{e.description}</p>{e.url && <a className="text-xs text-accent underline" href={e.url} target="_blank" rel="noreferrer">{e.url}</a>}</li>)}</ul> : <Empty>No evidence yet. Link a commit, PR, report or deployment that shows what you built.</Empty>}
        <div className="card mt-4 p-5"><EvidenceForm projects={[{ id: p.id, title: c.title }]} skills={sk} defaultProject={p.id} /></div>
      </Section>
    </>
  );
}
