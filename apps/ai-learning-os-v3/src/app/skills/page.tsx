import { redirect } from "next/navigation";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { masteryRecords, skillEdges, skillEvidence, skills } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { MASTERY_LABELS } from "@/lib/learning";
import { EmptyState, PageHeader, Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const [allSkills, mastery, evidenceCounts, edges, recentEvidence] = await Promise.all([
    db.select().from(skills).orderBy(asc(skills.category), asc(skills.name)),
    db.select().from(masteryRecords).where(eq(masteryRecords.userId, user.id)),
    db
      .select({
        skillId: skillEvidence.skillId,
        n: sql<number>`count(*)::int`,
        independent: sql<number>`sum(case when ${skillEvidence.independent} then 1 else 0 end)::int`,
      })
      .from(skillEvidence)
      .where(eq(skillEvidence.userId, user.id))
      .groupBy(skillEvidence.skillId),
    db.select().from(skillEdges),
    db
      .select()
      .from(skillEvidence)
      .where(eq(skillEvidence.userId, user.id))
      .orderBy(desc(skillEvidence.createdAt))
      .limit(12),
  ]);

  const masteryBySkill = new Map(
    mastery.filter((m) => m.nodeType === "skill").map((m) => [m.nodeId, m]),
  );
  const evidenceBySkill = new Map(evidenceCounts.map((e) => [e.skillId, e]));
  const categories = [...new Set(allSkills.map((s) => s.category))];

  function statusOf(skillId: string) {
    const m = masteryBySkill.get(skillId);
    const ev = evidenceBySkill.get(skillId);
    if (!m && !ev) return { label: "No evidence", tag: "tag" };
    const independent = ev?.independent ?? 0;
    if ((m?.transfer ?? 0) >= 0.7 && independent >= 2) return { label: "Independently demonstrated", tag: "tag-ok" };
    if ((m?.application ?? 0) >= 0.6) return { label: "Competent", tag: "tag-accent" };
    return { label: "Developing", tag: "tag-warn" };
  }

  return (
    <Shell user={user} active="/skills">
      <PageHeader
        title="Skill graph"
        lead="Skills are not marked from video completion. A skill moves only on recorded evidence: assessments, transfer tasks, debugging, project artefacts, oral explanation and deployments — weighted by whether the work was independent."
      />

      <div className="space-y-7">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-sm font-semibold">{cat}</h2>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2.5">
              {allSkills
                .filter((s) => s.category === cat)
                .map((s) => {
                  const m = masteryBySkill.get(s.id);
                  const ev = evidenceBySkill.get(s.id);
                  const status = statusOf(s.id);
                  const feeds = edges.filter((e) => e.fromSkill === s.id).map((e) => e.toSkill);
                  return (
                    <li key={s.id} className="surface p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-medium">{s.name}</span>
                        <span className={status.tag}>{status.label}</span>
                      </div>
                      <p className="muted text-[11px] mt-1.5 leading-relaxed">{s.description}</p>
                      <p className="text-[11px] muted mt-2">
                        Depth target: {s.depthTarget} · mastery {m ? `L${m.level} (${MASTERY_LABELS[m.level]})` : "L0"} ·
                        evidence {ev?.n ?? 0} ({ev?.independent ?? 0} independent)
                      </p>
                      {m ? (
                        <div className="bar mt-2">
                          <span style={{ width: `${(m.level / 9) * 100}%` }} />
                        </div>
                      ) : null}
                      {feeds.length > 0 ? (
                        <p className="text-[11px] muted mt-2">Unlocks: {feeds.join(", ")}</p>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold mb-2">Recent evidence</h2>
        {recentEvidence.length === 0 ? (
          <EmptyState
            title="No skill evidence recorded yet"
            body="Evidence appears here after an independent high-scoring attempt, a completed project with a repository, or a recorded oral explanation."
          />
        ) : (
          <ul className="space-y-1.5 text-xs">
            {recentEvidence.map((e) => (
              <li key={e.id} className="surface px-3 py-2 flex flex-wrap justify-between gap-2">
                <span>
                  <span className="tag">{e.kind}</span> {e.description}
                </span>
                <span className="muted">
                  {e.independent ? "independent" : "assisted"} · weight {e.weight} ·{" "}
                  {new Date(e.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
