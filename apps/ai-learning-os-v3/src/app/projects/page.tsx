import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectEvidence, projects, userProjects } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { PageHeader, Shell } from "@/components/shell";
import { ProjectEditor, StartProjectButton } from "@/components/project-editor";
import { Disclosure } from "@/components/ui";

export const dynamic = "force-dynamic";

const VALUE_TAG: Record<string, string> = {
  "Practice Only": "tag",
  "Skill Evidence": "tag",
  "Technical Artifact": "tag-accent",
  "Portfolio Project": "tag-accent",
  "Professional Evidence": "tag-ok",
  "Signature Project": "tag-ok",
};

export default async function ProjectsPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const [catalog, mine, evidence] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.ladderLevel), asc(projects.title)),
    db.select().from(userProjects).where(eq(userProjects.userId, user.id)),
    db
      .select()
      .from(projectEvidence)
      .where(eq(projectEvidence.userId, user.id))
      .orderBy(desc(projectEvidence.createdAt)),
  ]);

  const mineById = new Map(mine.map((m) => [m.projectId, m]));
  const evidenceByProject = new Map<number, typeof evidence>();
  for (const e of evidence) {
    const list = evidenceByProject.get(e.userProjectId) ?? [];
    list.push(e);
    evidenceByProject.set(e.userProjectId, list);
  }

  const levels = [...new Set(catalog.map((c) => c.ladderLevel))].sort((a, b) => a - b);

  return (
    <Shell user={user} active="/projects">
      <PageHeader
        title="Project ladder"
        lead="Ten levels from a plain Python application to a research reproduction. The full original 21-project catalogue is preserved. Real public data is required for serious projects, and every project carries a provenance record, a definition of done and an evidence trail."
      />

      <div className="surface p-4 mb-6">
        <h2 className="text-sm font-medium">Where the work actually runs</h2>
        <p className="muted text-xs mt-1.5 leading-relaxed">
          This platform does not execute your training code: arbitrary remote code execution on the web host
          is a security defect, not a feature. Use GitHub Codespaces, local development, Colab or Kaggle for
          compute. The platform owns the brief, the milestones, the definition of done, the evidence record
          and the portfolio linkage. GitHub remains the source of truth for code.
        </p>
      </div>

      <div className="space-y-8">
        {levels.map((level) => (
          <section key={level}>
            <h2 className="text-sm font-semibold">
              Level {level}
              <span className="muted font-normal"> · {catalog.find((c) => c.ladderLevel === level)?.track}</span>
            </h2>
            <ul className="mt-3 space-y-3">
              {catalog
                .filter((c) => c.ladderLevel === level)
                .map((p) => {
                  const own = mineById.get(p.id);
                  const ev = own ? evidenceByProject.get(own.id) ?? [] : [];
                  return (
                    <li key={p.id} className="surface p-4">
                      <div className="flex flex-wrap items-start gap-2 justify-between">
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium">{p.title}</h3>
                          <p className="muted text-xs mt-1.5 leading-relaxed max-w-3xl">{p.problem}</p>
                        </div>
                        {own ? (
                          <span className={VALUE_TAG[own.valueClass] ?? "tag"}>{own.valueClass}</span>
                        ) : (
                          <StartProjectButton projectId={p.id} />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.skills.map((s) => (
                          <span key={s} className="tag">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 mt-4">
                        <Disclosure summary="Constraints and milestones">
                          <ul className="text-xs muted space-y-1">
                            {p.constraints.map((c) => (
                              <li key={c}>· {c}</li>
                            ))}
                          </ul>
                          <ol className="text-xs muted space-y-1 mt-3 list-decimal pl-4">
                            {p.milestones.map((m) => (
                              <li key={m}>{m}</li>
                            ))}
                          </ol>
                        </Disclosure>
                        <Disclosure summary="Data policy and suggested sources">
                          <p className="text-xs muted leading-relaxed">{p.dataPolicy}</p>
                          <ul className="text-xs mt-2 space-y-1.5">
                            {p.suggestedData.map((d) => (
                              <li key={d.name}>
                                <a href={d.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                                  {d.name}
                                </a>
                                <span className="muted"> — {d.note}</span>
                              </li>
                            ))}
                          </ul>
                        </Disclosure>
                      </div>

                      {own ? (
                        <>
                          <ProjectEditor
                            userProjectId={own.id}
                            status={own.status}
                            repoUrl={own.repoUrl}
                            demoUrl={own.demoUrl}
                            datasetUrl={own.datasetUrl}
                            notes={own.notes}
                            definitionOfDone={p.definitionOfDone}
                            completedChecks={own.completedChecks}
                          />
                          {ev.length > 0 ? (
                            <ul className="mt-3 space-y-1.5 text-xs">
                              {ev.map((e) => (
                                <li key={e.id}>
                                  <span className="tag">{e.kind.replace(/_/g, " ")}</span>{" "}
                                  {e.url ? (
                                    <a href={e.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                                      {e.description}
                                    </a>
                                  ) : (
                                    <span>{e.description}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
