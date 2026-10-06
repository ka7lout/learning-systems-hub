import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { evidence, userProjects, projectCatalog, skills } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { PageHeader, Section, Empty } from "@/components/ui";
import { EvidenceForm } from "@/components/client";
import { cvEligible, CV_TIERS } from "@/lib/learning";

export default async function Portfolio() {
  const u = await requireUser();
  const [ev, projects, sk] = await Promise.all([
    db.select().from(evidence).where(eq(evidence.ownerId, u.id)).orderBy(desc(evidence.createdAt)),
    db.select({ id: userProjects.id, title: projectCatalog.title }).from(userProjects).innerJoin(projectCatalog, eq(projectCatalog.id, userProjects.catalogId)).where(eq(userProjects.ownerId, u.id)),
    db.select({ id: skills.id, name: skills.name }).from(skills),
  ]);
  const pTitle = new Map(projects.map((p) => [p.id, p.title]));
  const skName = new Map(sk.map((s) => [s.id, s.name]));
  const cv = ev.filter((e) => cvEligible(e.cvTier, e.url));
  return (
    <>
      <PageHeader title="Portfolio & CV evidence" lead="Only high-signal evidence with a verifiable link (Portfolio Project tier or above) is suggested for your CV. Every CV line maps to an artifact — no invented impact." />
      <Section title="CV-eligible evidence">
        {cv.length ? <ul className="space-y-2">{cv.map((e) => <li key={e.id} className="card p-4 text-sm"><div className="flex flex-wrap gap-1.5"><span className="chip !text-ok">{e.cvTier}</span>{e.userProjectId && <span className="chip">{pTitle.get(e.userProjectId)}</span>}{e.skillId && <span className="chip">{skName.get(e.skillId)}</span>}</div><p className="mt-2">{e.description}</p><a className="text-xs text-accent underline" href={e.url!} target="_blank" rel="noreferrer">{e.url}</a></li>)}</ul> : <Empty>No CV-eligible evidence yet. That requires a Portfolio Project-tier artifact or higher with a link you can show an employer.</Empty>}
      </Section>
      <Section title={`All evidence (${ev.length})`}>
        {ev.length ? <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs text-muted"><tr><th className="p-3">Tier</th><th className="p-3">Kind</th><th className="p-3">Description</th></tr></thead><tbody className="divide-y divide-line">{ev.map((e) => <tr key={e.id}><td className="p-3 whitespace-nowrap">{e.cvTier}</td><td className="p-3">{e.kind}</td><td className="p-3">{e.description}</td></tr>)}</tbody></table></div> : <p className="text-sm text-muted">None recorded.</p>}
        <p className="mt-2 text-xs text-muted">Tiers: {CV_TIERS.join(" → ")}</p>
      </Section>
      <Section title="Record evidence"><div className="card p-5"><EvidenceForm projects={projects} skills={sk} /></div></Section>
    </>
  );
}
