import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, curriculumNodes, nodePrerequisites, practiceItems, projectCatalog, skills, sources, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { PageHeader, Stat, StatusBadge } from "@/components/ui";
import { ORIGINAL_TOPIC_COUNT } from "@/content/original";

export default async function AdminPage() {
  await requireRole(["admin", "content_editor", "reviewer"]);
  const [counts] = await db.select({
    lessons: sql<number>`(select count(*) from ${curriculumNodes} where type='lesson')::int`,
    topics: sql<number>`(select count(*) from ${curriculumNodes} where type='topic')::int`,
    originalTopics: sql<number>`(select count(*) from ${curriculumNodes} where type='topic' and source_category='original')::int`,
    edges: sql<number>`(select count(*) from ${nodePrerequisites})::int`,
    practice: sql<number>`(select count(*) from ${practiceItems})::int`,
    projects: sql<number>`(select count(*) from ${projectCatalog})::int`,
    skills: sql<number>`(select count(*) from ${skills})::int`,
    users: sql<number>`(select count(*) from ${users})::int`,
    unsourced: sql<number>`(select count(*) from ${curriculumNodes} where type='lesson' and source_category like 'harvard%' and jsonb_array_length(harvard_mapping)=0)::int`,
    noPractice: sql<number>`(select count(*) from ${curriculumNodes} n where type='lesson' and not exists (select 1 from ${practiceItems} p where p.node_id=n.id))::int`,
  }).from(sql`(select 1) as one`);
  const srcs = await db.select({ status: sources.verificationStatus, c: sql<number>`count(*)::int` }).from(sources).groupBy(sources.verificationStatus);
  const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(30);
  const validation = [
    { label: "All original topics present", ok: counts.originalTopics === ORIGINAL_TOPIC_COUNT, detail: `${counts.originalTopics}/${ORIGINAL_TOPIC_COUNT}` },
    { label: "Every lesson has practice items", ok: counts.noPractice === 0, detail: `${counts.noPractice} without` },
    { label: "Harvard-labelled lessons carry a mapping", ok: counts.unsourced === 0, detail: `${counts.unsourced} without` },
    { label: "Prerequisite graph acyclic (checked at seed)", ok: true, detail: `${counts.edges} edges` },
  ];
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Admin" lead="Content integrity, source statuses and audit trail. Content is versioned in code (src/content) and seeded idempotently; editing happens through pull requests, which keeps history reviewable." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Lessons" value={counts.lessons} /><Stat label="Topic nodes" value={counts.topics} /><Stat label="Practice items" value={counts.practice} /><Stat label="Projects" value={counts.projects} /><Stat label="Skills" value={counts.skills} /><Stat label="Prerequisite edges" value={counts.edges} /><Stat label="Users" value={counts.users} hint="real accounts only" /></div>
      <section className="card mt-4 p-5"><h2 className="text-sm font-semibold">Publication validation</h2><ul className="mt-2 space-y-1 text-sm">{validation.map((v) => <li key={v.label} className="flex justify-between gap-2"><span>{v.label}</span><span className={`badge ${v.ok ? "!bg-ok-soft !text-ok" : "!bg-danger-soft !text-danger"}`}>{v.ok ? "pass" : "fail"} · {v.detail}</span></li>)}</ul></section>
      <section className="card mt-4 p-5"><h2 className="text-sm font-semibold">Sources by verification status</h2><div className="mt-2 flex flex-wrap gap-2">{srcs.map((s) => <span key={s.status} className="flex items-center gap-1 text-sm"><StatusBadge s={s.status} /> {s.c}</span>)}</div></section>
      <section className="card mt-4 p-5"><h2 className="text-sm font-semibold">Audit log (latest 30)</h2><ul className="mt-2 space-y-1 text-xs">{logs.map((l) => <li key={l.id} className="flex justify-between gap-2 border-t border-border py-1"><span>{l.action} <span className="text-muted">{JSON.stringify(l.meta)}</span></span><span className="text-muted">{l.createdAt.toLocaleString()}</span></li>)}</ul></section>
    </div>
  );
}
