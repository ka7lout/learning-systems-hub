import { AppShell } from "@/components/shell";
import { Badge, Card, PageHeader, SourceBadge } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getEvidenceFor, getRoles } from "@/lib/data";
import { roleGapAnalysis } from "@/lib/engine";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  no_evidence: "bad",
  developing: "warn",
  competent: "warn",
  independently_demonstrated: "good",
};

export default async function CareerPage() {
  const user = await requirePage();
  const roles = await getRoles();
  const analyses = await Promise.all(roles.map((r) => roleGapAnalysis(user.id, r.key)));
  const evidence = await getEvidenceFor(user.id);

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Career engine"
        title="Role requirements mapped to evidence you actually own"
        description="These are reference role blueprints supplied to the system, stored as dated snapshots. They are not live vacancies, and this system never predicts hiring outcomes."
      />

      <Card className="mb-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Evidence rule</h2>
        <p className="text-sm leading-relaxed text-muted">
          A CV bullet may only make a claim that maps to an artifact: a repository, a commit or pull request, a
          deployment, a report, a model card or a measured evaluation. You currently have{" "}
          <span className="font-medium text-ink">{evidence.length}</span> recorded artifact
          {evidence.length === 1 ? "" : "s"}. No bullet is generated without one.
        </p>
      </Card>

      <div className="space-y-8">
        {analyses.map((analysis) =>
          analysis ? (
            <section key={analysis.role.key}>
              <div className="mb-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <SourceBadge status={analysis.role.verificationStatus} />
                  <Badge>snapshot {analysis.role.snapshotDate}</Badge>
                  <Badge>{analysis.role.region}</Badge>
                </div>
                <h2 className="text-base font-semibold text-ink">{analysis.role.title}</h2>
                <p className="text-sm text-muted">{analysis.role.company}</p>
                <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted">{analysis.role.notes}</p>
                {analysis.role.sourceUrl ? (
                  <a
                    href={analysis.role.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-accentink underline underline-offset-4"
                  >
                    Original posting
                  </a>
                ) : null}
              </div>

              <Card className="mb-3 p-4">
                <p className="text-sm text-ink">{analysis.readiness.statement}</p>
              </Card>

              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-surfacemuted text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Requirement</th>
                      <th className="px-3 py-2 font-medium">Tier</th>
                      <th className="px-3 py-2 font-medium">Your level</th>
                      <th className="px-3 py-2 font-medium">Evidence status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.gaps.map((gap) => (
                      <tr key={gap.skillKey} className="border-t border-line bg-surface">
                        <td className="px-3 py-2">
                          <p className="font-medium text-ink">{gap.skillTitle}</p>
                          <p className="text-xs text-muted">{gap.note}</p>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted">{gap.importance}</td>
                        <td className="px-3 py-2 tabular-nums text-ink">L{gap.level}</td>
                        <td className="px-3 py-2">
                          <Badge tone={STATUS_TONE[gap.status]}>{gap.status.replace(/_/g, " ")}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null,
        )}
      </div>
    </AppShell>
  );
}
