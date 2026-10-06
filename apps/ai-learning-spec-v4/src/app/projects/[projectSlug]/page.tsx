import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, Badge, SectionTitle, EmptyState } from "@/components/ui";
import { getProject } from "@/content/projects";
import { getSkill } from "@/content/roles";
import { db } from "@/db";
import { userProjects, projectEvidence } from "@/db/schema";
import { startProjectAction, updateProjectAction, addEvidenceAction } from "@/app/actions";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const spec = getProject(projectSlug);
  if (!spec) notFound();
  const user = await requireUser();

  const rows = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.userId, user.id), eq(userProjects.projectSlug, projectSlug)))
    .limit(1);
  const inst = rows[0];

  const evidence = inst
    ? await db
        .select()
        .from(projectEvidence)
        .where(and(eq(projectEvidence.userId, user.id), eq(projectEvidence.userProjectId, inst.id)))
        .orderBy(desc(projectEvidence.createdAt))
    : [];

  return (
    <PageShell path="/projects">
      <nav className="text-[12.5px] text-ink-faint" aria-label="Breadcrumb">
        <Link href="/projects" className="hover:text-accent">Projects</Link> / {spec.title}
      </nav>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{spec.title}</h1>
        <Badge tone="navy">Level {spec.level} · {spec.levelName}</Badge>
        <Badge tone="warn">{spec.cvClass.replace(/_/g, " ")}</Badge>
      </div>
      <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-soft">{spec.summary}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle sub="Real public data only. Provenance is part of the deliverable.">Data policy</SectionTitle>
            <p className="text-[13.5px] leading-relaxed text-ink-soft">{spec.dataPolicy}</p>
          </Card>

          <Card>
            <SectionTitle sub="The project is complete only when every applicable item is true.">
              Definition of done
            </SectionTitle>
            <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] text-ink-soft">
              {spec.definitionOfDone.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Card>

          {!inst ? (
            <Card>
              <SectionTitle sub="Starting a project creates your own instance — nothing is pre-filled or simulated.">
                Start this project
              </SectionTitle>
              <form action={startProjectAction}>
                <input type="hidden" name="projectSlug" value={spec.slug} />
                <button className="rounded-lg bg-navy px-4 py-2 text-[13.5px] font-medium text-white hover:bg-navy-deep">
                  Start project
                </button>
              </form>
            </Card>
          ) : (
            <Card>
              <SectionTitle sub="Marking complete requires a repository URL and documented data provenance — otherwise the status stays at submitted.">
                Your project workspace
              </SectionTitle>
              <form action={updateProjectAction} className="space-y-3">
                <input type="hidden" name="projectSlug" value={spec.slug} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="status" className="block text-[12.5px] font-medium text-ink-soft">Status</label>
                    <select id="status" name="status" defaultValue={inst.status} className="mt-1 w-full rounded-lg border border-line px-2 py-2 text-[13.5px]">
                      <option value="planned">planned</option>
                      <option value="active">active</option>
                      <option value="submitted">submitted</option>
                      <option value="complete">complete</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="repoUrl" className="block text-[12.5px] font-medium text-ink-soft">Repository URL (https)</label>
                    <input id="repoUrl" name="repoUrl" type="url" defaultValue={inst.repoUrl ?? ""} placeholder="https://github.com/…" className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[13.5px]" />
                  </div>
                  <div>
                    <label htmlFor="demoUrl" className="block text-[12.5px] font-medium text-ink-soft">Demo / deployment URL</label>
                    <input id="demoUrl" name="demoUrl" type="url" defaultValue={inst.demoUrl ?? ""} placeholder="https://…" className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[13.5px]" />
                  </div>
                  <div>
                    <label htmlFor="datasetSource" className="block text-[12.5px] font-medium text-ink-soft">Data provenance (source, license, date)</label>
                    <input id="datasetSource" name="datasetSource" defaultValue={inst.datasetSource ?? ""} placeholder="e.g., NYC TLC trip data, public domain, retrieved 2026-03-01" className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[13.5px]" />
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-[12.5px] font-medium text-ink-soft">Engineering notes (decisions, failures, next steps)</label>
                  <textarea id="notes" name="notes" rows={4} defaultValue={inst.notes ?? ""} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[13.5px]" />
                </div>
                <button className="rounded-lg bg-navy px-4 py-2 text-[13.5px] font-medium text-white hover:bg-navy-deep">
                  Save project
                </button>
              </form>
            </Card>
          )}

          {inst && (
            <Card>
              <SectionTitle sub="Every CV claim must map to evidence: repos, commits, reports, deployments, metrics.">
                Evidence log
              </SectionTitle>
              <form action={addEvidenceAction} className="grid gap-2 sm:grid-cols-[130px_1fr_auto]">
                <input type="hidden" name="projectSlug" value={spec.slug} />
                <label className="sr-only" htmlFor="ev-kind">Evidence kind</label>
                <select id="ev-kind" name="kind" className="rounded-lg border border-line px-2 py-2 text-[13px]">
                  {["repo", "commit", "report", "deployment", "metric", "demo", "other"].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <div className="grid gap-2">
                  <label className="sr-only" htmlFor="ev-desc">Description</label>
                  <input id="ev-desc" name="description" required maxLength={2000} placeholder="What this evidence shows" className="rounded-lg border border-line px-3 py-2 text-[13px]" />
                  <label className="sr-only" htmlFor="ev-url">URL</label>
                  <input id="ev-url" name="url" type="url" placeholder="https:// (optional)" className="rounded-lg border border-line px-3 py-2 text-[13px]" />
                </div>
                <button className="self-start rounded-lg border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink hover:border-ink-faint">
                  Add
                </button>
              </form>
              {evidence.length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No evidence recorded yet" body="Add your repository, key commits, reports, or deployment links as you build. This log feeds your skill graph and career readiness truthfully." />
                </div>
              ) : (
                <ul className="mt-3 space-y-2">
                  {evidence.map((e) => (
                    <li key={e.id} className="rounded-lg border border-line px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Badge tone="navy">{e.kind}</Badge>
                        <span className="text-[12px] text-ink-faint">{e.createdAt.toISOString().slice(0, 10)}</span>
                      </div>
                      <p className="mt-1 text-[13.5px] text-ink-soft">{e.description}</p>
                      {e.url && (
                        <a href={e.url} target="_blank" rel="noreferrer" className="text-[12.5px] font-medium text-accent hover:underline">
                          {e.url} ↗
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Skills this project evidences</SectionTitle>
            <ul className="space-y-1.5">
              {spec.skills.map((s) => (
                <li key={s} className="text-[13.5px] text-ink-soft">
                  • {getSkill(s)?.name ?? s}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12.5px] text-ink-faint">
              Completing this project with a repository and provenance records L8 (“can build
              something with it”) evidence for each skill above.
            </p>
          </Card>
          <Card>
            <SectionTitle>Execution environments</SectionTitle>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Build in GitHub (source of truth), run heavy workloads in Codespaces, Colab, Kaggle,
              or locally. This platform tracks briefs, evidence, and review — it is not a compute
              cluster and never pretends to run your training jobs.
            </p>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
