import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { getSettings } from "@/lib/dal";
import { buildCurriculumGraph } from "@/content";
import { buildRoleReport, type RequirementReport } from "@/lib/engines/career";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, MasteryChip, VerificationChip } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "neutral" | "caution" | "accent" | "positive" }> = {
  no_evidence: { label: "No evidence", tone: "neutral" },
  learning: { label: "Learning", tone: "caution" },
  practised: { label: "Practised", tone: "accent" },
  demonstrated: { label: "Demonstrated", tone: "positive" },
};

function RequirementRow({ r }: { r: RequirementReport }) {
  const s = STATUS[r.status];
  return (
    <li className="px-5 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm">{r.label}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {r.skills.map((sk) => (
              <span key={sk.id} className="flex items-center gap-1">
                <Link href={`/skills#${sk.id}`} className="text-xs underline underline-offset-2">{sk.title}</Link>
                <MasteryChip level={sk.level} />
              </span>
            ))}
            {r.skills.length === 0 && <span className="text-xs text-ink-3">No skill in the graph is mapped to this requirement yet.</span>}
          </div>
          {r.recommendation && <p className="mt-1.5 text-xs text-ink-3">{r.recommendation}</p>}
          {r.evidence.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-xs text-ink-2">
              {r.evidence.map((e, i) => (
                <li key={i}>
                  {e.verified ? "✓" : "·"} {e.title} <span className="text-ink-3">({e.kind}{e.verified ? ", verified" : ", unverified"})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Chip tone={s.tone}>{s.label}</Chip>
      </div>
    </li>
  );
}

export default async function CareerPage() {
  const session = await pageSession();
  const settings = await getSettings(session);
  const graph = buildCurriculumGraph();
  const reports = (await Promise.all(graph.roles.map((r) => buildRoleReport(session, r.id)))).filter(Boolean);

  return (
    <>
      <PageHeader
        title="Career"
        lede="Role readiness, requirement by requirement. There is deliberately no single readiness percentage — a number like that hides exactly the information you need."
      >
        <Link href="/settings" className="btn btn-sm">Targets: {settings.careerTargets.length}</Link>
      </PageHeader>
      <PageBody>
        {reports.map((report) => {
          if (!report) return null;
          const { role, hard, preferred, summary } = report;
          return (
            <section key={role.id} id={role.id} className="mb-8">
              <Card>
                <div className="border-b border-line px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold tracking-tight">{role.title}</h2>
                      <p className="mt-0.5 text-sm text-ink-2">{role.referenceEmployer} · {role.locationNote} · {role.seniorityNote}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <VerificationChip status={role.verificationStatus} />
                      {settings.careerTargets.includes(role.id) && <Chip tone="accent">target</Chip>}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-ink-3">{role.disclaimer}</p>
                </div>

                <div className="grid gap-4 border-b border-line px-5 py-4 sm:grid-cols-3">
                  <div>
                    <p className="h-section">Hard requirements demonstrated</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {summary.hardDemonstrated}
                      <span className="text-base font-normal text-ink-3">/{summary.hardTotal}</span>
                    </p>
                  </div>
                  <div>
                    <p className="h-section">Hard requirements with no evidence</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.hardNoEvidence}</p>
                  </div>
                  <div>
                    <p className="h-section">Preferred demonstrated</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {summary.preferredDemonstrated}
                      <span className="text-base font-normal text-ink-3">/{summary.preferredTotal}</span>
                    </p>
                  </div>
                </div>

                <CardHead title="Hard requirements" hint="Each one is judged on its own evidence." />
                <ul className="divide-y divide-[var(--line)]">
                  {hard.map((r) => <RequirementRow key={r.id} r={r} />)}
                </ul>

                {preferred.length > 0 && (
                  <>
                    <CardHead title="Preferred requirements" />
                    <ul className="divide-y divide-[var(--line)]">
                      {preferred.map((r) => <RequirementRow key={r.id} r={r} />)}
                    </ul>
                  </>
                )}
              </Card>
            </section>
          );
        })}

        <Card>
          <CardHead title="How readiness is judged" hint="§180 — the gates, in order." />
          <ol className="list-decimal space-y-1 px-9 py-4 text-sm text-ink-2">
            <li>Course complete — you worked through the material.</li>
            <li>Skill developing — correct with support.</li>
            <li>Skill competent — correct without help on standard cases.</li>
            <li>Independently demonstrated — correct on unfamiliar cases, with an artefact attached.</li>
            <li>Role-ready for selected requirements — never &ldquo;role-ready&rdquo; as a blanket claim.</li>
          </ol>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-3">
            Requirement text is stored exactly as recorded from the source posting, with its verification status. Where a posting could
            not be re-verified, it stays labelled &ldquo;not verified&rdquo; rather than being presented as current.
          </p>
        </Card>
      </PageBody>
    </>
  );
}
