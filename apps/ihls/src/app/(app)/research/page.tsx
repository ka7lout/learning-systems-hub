import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph, MECHANISM_EVIDENCE, RESEARCH_HYPOTHESES, LEARNING_YIELD_INPUTS } from "@/content";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, SourceCategoryChip, VerificationChip } from "@/components/ui";

export const dynamic = "force-dynamic";

const STRENGTH_TONE: Record<string, "positive" | "accent" | "caution" | "critical"> = {
  strong: "positive",
  moderate: "accent",
  emerging: "caution",
  speculative: "critical",
};

export default async function ResearchPage() {
  await pageSession();
  const graph = buildCurriculumGraph();
  const researchLessons = graph.lessons.filter((l) => l.sourceCategory === "Research Extension" || l.importance === "RESEARCH");
  const byStatus = (s: string) => graph.sources.filter((x) => x.verificationStatus === s);

  return (
    <>
      <PageHeader
        title="Research"
        lede="The evidence behind the method, the sources behind the content, and an explicit list of the things this system assumes but has not proven."
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHead title="Mechanisms and how well they are supported" hint="§84 — labelled, not asserted." />
            <ul className="divide-y divide-[var(--line)]">
              {MECHANISM_EVIDENCE.map((m) => (
                <li key={m.mechanism} className="px-5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{m.mechanism}</p>
                    <Chip tone={STRENGTH_TONE[m.strength]}>{m.strength}</Chip>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-2">{m.note}</p>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHead title="Open hypotheses" hint="§224 — stated as hypotheses, not features." />
              <ul className="divide-y divide-[var(--line)]">
                {RESEARCH_HYPOTHESES.map((h) => (
                  <li key={h.id} className="px-5 py-2.5">
                    <p className="text-sm"><span className="font-semibold">{h.id}.</span> {h.statement}</p>
                    <p className="mt-0.5 text-xs text-ink-3">
                      {h.measurable ? "Measurable from the events this system already records." : "Not currently measurable here."}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line px-5 py-3 text-xs text-ink-3">
                None of these has been tested on your data. They are listed so that the design&rsquo;s assumptions are visible, not so that
                the system can claim them as results.
              </p>
            </Card>

            <Card>
              <CardHead title="Learning Yield" hint="An internal construct, not a validated measure." />
              <div className="card-pad text-sm text-ink-2">
                <p>If a yield figure is ever computed, it is built only from these recorded inputs:</p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                  {LEARNING_YIELD_INPUTS.map((i) => <li key={i}>{i}</li>)}
                </ul>
                <p className="mt-2 text-xs text-ink-3">
                  It is not a psychometric instrument and should never be reported as an ability score.
                </p>
              </div>
            </Card>
          </div>
        </div>

        <h2 id="sources" className="mt-8 text-sm font-semibold tracking-tight">Source dossier</h2>
        <p className="mt-1 text-sm text-ink-2">
          {graph.sources.length} records. {byStatus("confirmed_current").length} confirmed current,{" "}
          {byStatus("likely_not_verified").length} recorded but not verified against the primary source,{" "}
          {byStatus("design_decision").length} design decisions.
        </p>

        <Card className="mt-3">
          <ul className="divide-y divide-[var(--line)]">
            {graph.sources.map((s) => (
              <li key={s.sourceId} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-sm font-medium underline underline-offset-2">
                      {s.title}
                    </a>
                    <p className="mt-0.5 text-xs text-ink-3">
                      {s.publisher} · {s.sourceType.replace(/_/g, " ")} · retrieved {s.accessedAt}
                      {s.publishedAt ? ` · published ${s.publishedAt}` : ""}
                      {s.license ? ` · ${s.license}` : ""}
                    </p>
                  </div>
                  <VerificationChip status={s.verificationStatus} />
                </div>
                {s.extract && s.extract.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-ink-3">Extract read from the page ({s.extract.length} statements)</summary>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-2">
                      {s.extract.map((e) => <li key={e}>{e}</li>)}
                    </ul>
                  </details>
                )}
                {s.notes && <p className="mt-1.5 text-xs text-ink-2">{s.notes}</p>}
              </li>
            ))}
          </ul>
        </Card>

        <h2 className="mt-8 text-sm font-semibold tracking-tight">Research-track material in the curriculum</h2>
        {researchLessons.length === 0 ? (
          <p className="mt-2 text-sm text-ink-3">No lesson is currently classified as research-track.</p>
        ) : (
          <Card className="mt-3">
            <ul className="divide-y divide-[var(--line)]">
              {researchLessons.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <Link href={`/learn/${l.id}`} className="text-sm underline-offset-2 hover:underline">{l.title}</Link>
                  <div className="flex gap-1.5">
                    <SourceCategoryChip category={l.sourceCategory} />
                    <Chip>{l.importance.replace(/_/g, " ").toLowerCase()}</Chip>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="mt-6">
          <CardHead title="How to read a source here" />
          <div className="card-pad space-y-2 text-sm text-ink-2">
            <p>
              <strong className="text-ink">Confirmed current</strong> means the page was fetched on the retrieval date and the statement
              appears on it. <strong className="text-ink">Not verified</strong> means the claim is recorded but the primary source was not
              reachable or not checked in this pass — it is not evidence.
            </p>
            <p>
              Where two official pages disagree, the conflict is recorded rather than resolved by guessing. Course listings change every
              term; a retrieval date is part of the claim, not decoration.
            </p>
          </div>
        </Card>
      </PageBody>
    </>
  );
}
