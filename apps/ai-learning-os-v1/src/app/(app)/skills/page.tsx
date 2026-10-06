import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes, nodeSkills, skillEvidence, skills } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";

const STATUS = ["Not started", "Developing", "Competent", "Independently demonstrated"];

export default async function SkillsPage() {
  const user = await requireUser();
  const [all, ev, links] = await Promise.all([
    db.select().from(skills).orderBy(asc(skills.category), asc(skills.name)),
    db.select({ skillId: skillEvidence.skillId, strength: sql<number>`max(${skillEvidence.strength})::int`, count: sql<number>`count(*)::int`, independent: sql<number>`sum(case when ${skillEvidence.independent} then 1 else 0 end)::int`, kinds: sql<string>`string_agg(distinct ${skillEvidence.sourceType}, ', ')` }).from(skillEvidence).where(eq(skillEvidence.ownerId, user.id)).groupBy(skillEvidence.skillId),
    db.select({ skillId: nodeSkills.skillId, nodeId: nodeSkills.nodeId, title: curriculumNodes.title }).from(nodeSkills).innerJoin(curriculumNodes, eq(curriculumNodes.id, nodeSkills.nodeId)),
  ]);
  const evMap = new Map(ev.map((e) => [e.skillId, e]));
  const cats = [...new Set(all.map((s) => s.category))];
  const statusOf = (id: string) => { const e = evMap.get(id); if (!e) return 0; if (e.strength >= 3) return 3; if (e.strength >= 2 && e.independent >= 2) return 2; return 1; };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Skills" lead="Competency model. Each skill links to lessons and is advanced only by evidence: independent assessments, delayed transfer, project artifacts, deployments, oral and interview simulations. Video or lesson completion never counts." />
      <div className="mb-4 flex flex-wrap gap-1.5 text-xs">{STATUS.map((s, i) => <span key={s} className={`badge ${i === 3 ? "!bg-ok-soft !text-ok" : i === 2 ? "!bg-accent-soft !text-accent-strong" : ""}`}>{s}</span>)}</div>
      <div className="space-y-5">
        {cats.map((c) => (
          <section key={c} className="card p-5">
            <h2 className="text-sm font-semibold">{c}</h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {all.filter((s) => s.category === c).map((s) => { const st = statusOf(s.id); const e = evMap.get(s.id); const ls = links.filter((l) => l.skillId === s.id).slice(0, 3); return (
                <li key={s.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2"><span className="font-medium">{s.name}</span><span className={`badge ${st === 3 ? "!bg-ok-soft !text-ok" : st === 2 ? "!bg-accent-soft !text-accent-strong" : ""}`}>{STATUS[st]}</span></div>
                  <div className="mt-0.5 text-xs text-muted">{s.description}</div>
                  {e ? <div className="mt-1 text-xs text-muted">{e.count} evidence item(s), {e.independent} independent · {e.kinds}</div> : <div className="mt-1 text-xs text-muted">No evidence yet.</div>}
                  {ls.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{ls.map((l) => <Link key={l.nodeId} href={`/learn/${l.nodeId}`} className="badge hover:underline">{l.title}</Link>)}</div>}
                </li>
              ); })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
