import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { attempts, englishAttempts, projectEvidence, projects, skillEvidence, userProjects } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { dependencyProfile } from "@/lib/learning";
import { EmptyState, PageHeader, Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const [mine, catalog, evidence, dep, attemptCount, englishCount, skillEv] = await Promise.all([
    db.select().from(userProjects).where(eq(userProjects.userId, user.id)).orderBy(desc(userProjects.updatedAt)),
    db.select().from(projects),
    db.select().from(projectEvidence).where(eq(projectEvidence.userId, user.id)).orderBy(desc(projectEvidence.createdAt)),
    dependencyProfile(user.id),
    db.select({ n: sql<number>`count(*)::int` }).from(attempts).where(eq(attempts.userId, user.id)),
    db.select({ n: sql<number>`count(*)::int` }).from(englishAttempts).where(eq(englishAttempts.userId, user.id)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(skillEvidence)
      .where(eq(skillEvidence.userId, user.id)),
  ]);

  const catalogById = new Map(catalog.map((c) => [c.id, c]));
  const evidenceByProject = new Map<number, typeof evidence>();
  for (const e of evidence) {
    const list = evidenceByProject.get(e.userProjectId) ?? [];
    list.push(e);
    evidenceByProject.set(e.userProjectId, list);
  }
  const publishable = mine.filter(
    (m) => m.repoUrl && ["Portfolio Project", "Professional Evidence", "Signature Project"].includes(m.valueClass),
  );

  return (
    <Shell user={user} active="/portfolio">
      <PageHeader
        title="Portfolio and competence profile"
        lead="Everything here is derived from artefacts you recorded. Nothing is inferred, estimated or generated to fill the page — if a dimension has no evidence, it says so."
      />

      <section className="grid sm:grid-cols-4 gap-2.5">
        {[
          ["Recorded attempts", attemptCount[0]?.n ?? 0],
          ["Skill evidence items", skillEv[0]?.n ?? 0],
          ["Project evidence items", evidence.length],
          ["English responses", englishCount[0]?.n ?? 0],
        ].map(([label, value]) => (
          <div key={label as string} className="surface px-3 py-2.5">
            <p className="text-[11px] muted">{label as string}</p>
            <p className="text-lg font-semibold tabular-nums">{value as number}</p>
          </div>
        ))}
      </section>

      <section className="surface p-4 mt-5">
        <h2 className="text-sm font-medium">Independent versus assisted performance</h2>
        {(dep?.total ?? 0) === 0 ? (
          <p className="muted text-xs mt-2">No attempts recorded yet.</p>
        ) : (
          <p className="muted text-xs mt-2 leading-relaxed">
            {dep!.independent} of {dep!.total} attempts were made with no or minimal help. Independent mean
            score {dep!.independentAvg.toFixed(2)}; assisted mean score {dep!.assistedAvg.toFixed(2)}. Role
            readiness in this product is driven by the independent figure.
          </p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Publishable case studies</h2>
        {publishable.length === 0 ? (
          <EmptyState
            title="No project has reached portfolio class yet"
            body="A project becomes a Portfolio Project only when it has a repository, at least 80% of its definition of done ticked, and a 'done' status. Classification is computed from evidence, never self-declared."
          />
        ) : (
          <ul className="space-y-3">
            {publishable.map((p) => {
              const c = catalogById.get(p.projectId);
              const ev = evidenceByProject.get(p.id) ?? [];
              return (
                <li key={p.id} className="surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium">{c?.title}</h3>
                    <span className="tag tag-ok">{p.valueClass}</span>
                    <span className="tag">L{c?.ladderLevel}</span>
                  </div>
                  <p className="muted text-xs mt-2 leading-relaxed">
                    <strong>Problem:</strong> {c?.problem}
                  </p>
                  {p.notes ? (
                    <p className="prose-block text-[13px] mt-2 whitespace-pre-wrap">{p.notes}</p>
                  ) : (
                    <p className="muted text-xs mt-2">
                      No engineering notes recorded — a case study without decisions and rejected alternatives
                      is incomplete.
                    </p>
                  )}
                  <ul className="mt-2.5 text-xs space-y-1">
                    {p.repoUrl ? (
                      <li>
                        Repository:{" "}
                        <a href={p.repoUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          {p.repoUrl}
                        </a>
                      </li>
                    ) : null}
                    {p.demoUrl ? (
                      <li>
                        Deployment:{" "}
                        <a href={p.demoUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          {p.demoUrl}
                        </a>
                      </li>
                    ) : null}
                    {p.datasetUrl ? (
                      <li>
                        Data provenance:{" "}
                        <a href={p.datasetUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          {p.datasetUrl}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                  <p className="text-[11px] muted mt-2">
                    {p.completedChecks.length} of {c?.definitionOfDone.length ?? 0} definition-of-done items
                    satisfied · {ev.length} evidence item(s) attached
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="surface p-4 mt-6">
        <h2 className="text-sm font-medium">Readiness statement policy</h2>
        <p className="muted text-xs mt-2 leading-relaxed">
          This product will never tell you that you will be hired. The strongest statement it can produce is:
          &ldquo;you have demonstrated the evidence required by this readiness rubric&rdquo; — and it will
          name exactly which requirements still have no evidence behind them.
        </p>
      </section>
    </Shell>
  );
}
