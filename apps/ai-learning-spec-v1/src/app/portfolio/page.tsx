import Link from "next/link";
import { AppShell } from "@/components/shell";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getEvidenceFor, getMasteryFor, getUserProjects } from "@/lib/data";
import { dependencyAudit } from "@/lib/engine";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const user = await requirePage();
  const [projects, evidence, mastery, audit] = await Promise.all([
    getUserProjects(user.id),
    getEvidenceFor(user.id),
    getMasteryFor(user.id),
    dependencyAudit(user.id),
  ]);

  const signature = projects.filter((p) => p.evidenceClass === "Signature Project" && p.status === "done");
  const strongest = [...mastery].sort((a, b) => b.level - a.level).slice(0, 8);

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Portfolio"
        title="External evidence"
        description="Everything on this page comes from artifacts you recorded. Nothing is inferred from lessons viewed, and no impact number is generated that you could not show on request."
      />

      {evidence.length === 0 ? (
        <EmptyState
          title="No evidence recorded yet"
          description="Start a project, attach the repository, deployment, report or model card, and describe exactly what each artifact proves. That record is what the career engine and CV bullets are allowed to cite."
          actionHref="/projects"
          actionLabel="Open the project ladder"
        />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs text-muted">Artifacts</p>
              <p className="text-xl font-semibold tabular-nums text-ink">{evidence.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted">Completed projects</p>
              <p className="text-xl font-semibold tabular-nums text-ink">
                {projects.filter((p) => p.status === "done").length}
              </p>
              <p className="text-[11px] text-muted">{signature.length} signature-class</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted">Independent attempt rate</p>
              <p className="text-xl font-semibold tabular-nums text-ink">
                {audit.independentPassRate === null ? "—" : `${Math.round(audit.independentPassRate * 100)}%`}
              </p>
              <p className="text-[11px] text-muted">pass rate without substantial help</p>
            </Card>
          </section>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">Evidence register</h2>
            <ul className="space-y-3 text-sm">
              {evidence.map((e) => (
                <li key={e.id} className="border-b border-line pb-3 last:border-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="accent">{e.kind.replace(/_/g, " ")}</Badge>
                    <Link href={`/projects/${e.projectKey}`} className="text-xs text-accentink underline underline-offset-4">
                      {e.projectTitle}
                    </Link>
                    <Badge>{e.evidenceClass}</Badge>
                  </div>
                  <p className="text-ink">{e.description}</p>
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noreferrer" className="break-all text-xs text-muted underline underline-offset-4">
                      {e.url}
                    </a>
                  ) : (
                    <p className="text-xs text-muted">No URL attached — this artifact cannot be externally verified yet.</p>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          {strongest.length > 0 ? (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-ink">Strongest demonstrated skills</h2>
              <ul className="grid gap-1 text-sm sm:grid-cols-2">
                {strongest.map((m) => (
                  <li key={m.skillKey} className="flex items-center justify-between gap-2">
                    <span className="text-ink">{m.skillKey}</span>
                    <Badge tone={m.level >= 6 ? "good" : "warn"}>L{m.level}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
