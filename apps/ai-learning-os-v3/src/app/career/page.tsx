import { redirect } from "next/navigation";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  careerRoles,
  masteryRecords,
  projects,
  skillEvidence,
  skills,
  userCareerTargets,
  userProjects,
} from "@/db/schema";
import { getUser } from "@/lib/auth";
import { PageHeader, Shell } from "@/components/shell";
import { TargetToggle } from "@/components/career-toggle";

export const dynamic = "force-dynamic";

export default async function CareerPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const [roles, targets, allSkills, mastery, evidence, myProjects, catalog] = await Promise.all([
    db.select().from(careerRoles).orderBy(asc(careerRoles.title)),
    db.select().from(userCareerTargets).where(eq(userCareerTargets.userId, user.id)),
    db.select().from(skills),
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
    db.select().from(userProjects).where(eq(userProjects.userId, user.id)),
    db.select().from(projects),
  ]);

  const targetIds = new Set(targets.map((t) => t.roleId));
  const skillName = new Map(allSkills.map((s) => [s.id, s.name]));
  const masteryBySkill = new Map(mastery.filter((m) => m.nodeType === "skill").map((m) => [m.nodeId, m]));
  const evidenceBySkill = new Map(evidence.map((e) => [e.skillId, e]));
  const catalogById = new Map(catalog.map((c) => [c.id, c]));

  return (
    <Shell user={user} active="/career">
      <PageHeader
        title="Career engine"
        lead="Role requirements are decomposed into skill nodes and matched against evidence you actually own. The platform never predicts employment; it reports whether a readiness rubric is satisfied, and labels every unverified posting as unverified."
      />

      <div className="space-y-6">
        {roles.map((role) => {
          const owned = role.skills.filter((s) => (evidenceBySkill.get(s)?.independent ?? 0) > 0);
          const developing = role.skills.filter(
            (s) => !owned.includes(s) && (masteryBySkill.get(s)?.level ?? 0) > 0,
          );
          const missing = role.skills.filter((s) => !owned.includes(s) && !developing.includes(s));
          const relevantProjects = myProjects
            .filter((p) => {
              const c = catalogById.get(p.projectId);
              return c ? c.skills.some((s) => role.skills.includes(s)) : false;
            })
            .filter((p) => p.repoUrl);

          return (
            <section key={role.id} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold">{role.title}</h2>
                  <p className="muted text-xs mt-1">
                    {role.organization} · {role.seniority} · {role.region}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tag tag-warn">{role.verificationStatus}</span>
                  <TargetToggle roleId={role.id} active={targetIds.has(role.id)} />
                </div>
              </div>

              <p className="prose-block text-[13px] mt-3">{role.summary}</p>

              <div className="grid lg:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-xs font-medium">Hard requirements (as stated in the blueprint)</h3>
                  <ul className="mt-1.5 space-y-1 text-[13px] muted">
                    {role.hardRequirements.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-medium">Preferred / breadth requirements</h3>
                  <ul className="mt-1.5 space-y-1 text-[13px] muted">
                    {role.preferredRequirements.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                <GapColumn title="Independently demonstrated" tone="tag-ok" items={owned.map((s) => skillName.get(s) ?? s)} empty="Nothing yet." />
                <GapColumn title="In progress" tone="tag-accent" items={developing.map((s) => skillName.get(s) ?? s)} empty="Nothing started." />
                <GapColumn title="Gap — no evidence" tone="tag-warn" items={missing.map((s) => skillName.get(s) ?? s)} empty="No gaps recorded." />
              </div>

              <div className="bar mt-4">
                <span style={{ width: `${role.skills.length ? (owned.length / role.skills.length) * 100 : 0}%` }} />
              </div>
              <p className="text-[11px] muted mt-1.5">
                {owned.length} of {role.skills.length} mapped skills carry independent evidence. This is a
                statement about your recorded evidence against this rubric — not a prediction about hiring.
              </p>

              <div className="mt-5">
                <h3 className="text-xs font-medium">Evidence-traceable CV lines</h3>
                {relevantProjects.length === 0 ? (
                  <p className="muted text-xs mt-1.5 leading-relaxed">
                    No CV line can be generated yet. A bullet is only produced when it maps to a repository,
                    deployment or report you have recorded. Invented impact statements are not available in
                    this product.
                  </p>
                ) : (
                  <ul className="mt-1.5 space-y-1.5 text-[13px]">
                    {relevantProjects.map((p) => {
                      const c = catalogById.get(p.projectId);
                      return (
                        <li key={p.id}>
                          · {c?.title}: {c?.problem.split(".")[0]}.{" "}
                          <a href={p.repoUrl!} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                            evidence
                          </a>{" "}
                          <span className="tag">{p.valueClass}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-medium">Interview questions this role implies</h3>
                <ul className="mt-1.5 space-y-1 text-[13px] muted">
                  {role.interviewQuestions.map((q) => (
                    <li key={q}>· {q}</li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] muted mt-4 leading-relaxed">
                Source:{" "}
                <a href={role.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  {role.sourceUrl}
                </a>{" "}
                · snapshot {role.snapshotDate}. {role.notes}
              </p>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

function GapColumn({
  title,
  tone,
  items,
  empty,
}: {
  title: string;
  tone: string;
  items: string[];
  empty: string;
}) {
  return (
    <div>
      <span className={tone}>{title}</span>
      {items.length === 0 ? (
        <p className="muted text-xs mt-2">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-[12px] muted">
          {items.map((i) => (
            <li key={i}>· {i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
