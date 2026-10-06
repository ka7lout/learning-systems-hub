import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell";
import { ProjectWorkspace } from "@/components/client";
import { Badge, Card, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getProject, getUserProject } from "@/lib/data";

export const dynamic = "force-dynamic";

const ENVIRONMENTS = [
  { label: "GitHub Codespaces", href: "https://github.com/codespaces" },
  { label: "Google Colab", href: "https://colab.research.google.com/" },
  { label: "Kaggle Notebooks", href: "https://www.kaggle.com/code" },
];

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  const user = await requirePage();
  const project = await getProject(projectKey);
  if (!project) notFound();
  const mine = await getUserProject(user.id, projectKey);

  return (
    <AppShell user={user}>
      <nav className="mb-4 text-xs text-muted">
        <Link href="/projects" className="hover:text-ink">
          Projects
        </Link>
        <span className="px-1">/</span>
        <span>L{project.ladderLevel}</span>
      </nav>

      <PageHeader
        eyebrow={`${project.sourceCategory} · ${project.evidenceClass}`}
        title={project.title}
        description={project.brief}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-2 text-sm font-semibold text-ink">Data policy</h2>
            <p className="text-sm leading-relaxed text-ink">{project.dataPolicy}</p>
            {project.suggestedData.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {project.suggestedData.map((d) => (
                  <li key={d.url}>
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-accentink underline underline-offset-4">
                      {d.name}
                    </a>
                    <span className="block text-xs text-muted">{d.note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted">No external dataset is required for this project.</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">Workspace</h2>
            <ProjectWorkspace
              projectKey={project.key}
              started={Boolean(mine)}
              milestones={project.milestones}
              definitionOfDone={project.definitionOfDone}
              state={
                mine
                  ? {
                      status: mine.project.status,
                      repoUrl: mine.project.repoUrl,
                      demoUrl: mine.project.demoUrl,
                      datasetUrl: mine.project.datasetUrl,
                      reportUrl: mine.project.reportUrl,
                      notes: mine.project.notes,
                      milestoneState: mine.project.milestoneState,
                      dodState: mine.project.dodState,
                    }
                  : null
              }
            />
          </Card>

          {mine && mine.evidence.length > 0 ? (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink">Recorded evidence</h2>
              <ul className="space-y-2 text-sm">
                {mine.evidence.map((e) => (
                  <li key={e.id} className="border-b border-line pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="accent">{e.kind.replace(/_/g, " ")}</Badge>
                      {e.url ? (
                        <a href={e.url} target="_blank" rel="noreferrer" className="truncate text-xs text-accentink underline underline-offset-4">
                          {e.url}
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-ink">{e.description}</p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="mb-2 text-sm font-semibold text-ink">Execution environments</h2>
            <p className="mb-2 text-xs leading-relaxed text-muted">
              This platform does not execute your training code. It tracks the brief, milestones, evidence and review.
              Run real workloads where they belong:
            </p>
            <ul className="space-y-1 text-sm">
              {ENVIRONMENTS.map((env) => (
                <li key={env.href}>
                  <a href={env.href} target="_blank" rel="noreferrer" className="text-accentink underline underline-offset-4">
                    {env.label}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <h2 className="mb-2 text-sm font-semibold text-ink">Skills this can evidence</h2>
            <div className="flex flex-wrap gap-1.5">
              {project.skillKeys.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
