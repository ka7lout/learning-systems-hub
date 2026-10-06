import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph, ERROR_TYPES } from "@/content";
import { owned, type ErrorEntryDoc, type SubmissionDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, EmptyState } from "@/components/ui";
import { ErrorNotebook } from "@/components/practice-widgets";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const submissions = await owned<SubmissionDoc>(session, "submissions").find({}, { sort: { createdAt: -1 } });
  const errors = await owned<ErrorEntryDoc>(session, "error_notebook").find({}, { sort: { createdAt: -1 }, limit: 50 });

  const byAssessment = new Map<string, SubmissionDoc[]>();
  for (const s of submissions) byAssessment.set(s.assessmentId, [...(byAssessment.get(s.assessmentId) ?? []), s]);

  const tiers = ["recall", "application", "transfer"] as const;
  const lessonTitle = (id: string) => graph.lessons.find((l) => l.id === id)?.title ?? id;

  return (
    <>
      <PageHeader
        title="Practice Lab"
        lede="Active retrieval, not re-reading. Every item records how much help you used, because that is what separates recognition from recall."
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            {tiers.map((tier) => {
              const items = graph.assessments.filter((a) => a.tier === tier);
              return (
                <Card key={tier}>
                  <CardHead
                    title={tier === "recall" ? "Recall" : tier === "application" ? "Application" : "Transfer"}
                    hint={
                      tier === "recall"
                        ? "Can you produce it without the page in front of you?"
                        : tier === "application"
                          ? "Can you use it on a problem of the same shape?"
                          : "Can you use it when the context changes — new data, new constraint, unfamiliar code?"
                    }
                    action={<Chip>{items.length} items</Chip>}
                  />
                  <ul className="divide-y divide-[var(--line)]">
                    {items.map((a) => {
                      const attempts = byAssessment.get(a.id) ?? [];
                      const passed = attempts.some((s) => s.correct === true);
                      return (
                        <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <Link href={`/practice/${a.id}`} className="text-sm font-medium underline-offset-2 hover:underline">
                              {a.prompt.slice(0, 120)}{a.prompt.length > 120 ? "…" : ""}
                            </Link>
                            <p className="mt-0.5 text-xs text-ink-3">
                              {lessonTitle(a.lessonId)} · {a.type.replace(/_/g, " ")} · {a.estimatedMinutes} min
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {a.evaluation === "auto" && <Chip tone="accent">auto-checked</Chip>}
                            {passed ? <Chip tone="positive">Passed</Chip> : attempts.length > 0 ? <Chip tone="caution">{attempts.length} attempts</Chip> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              );
            })}
          </div>

          <div className="space-y-5">
            <Card>
              <CardHead title="Error notebook" hint="§145 — errors are data. A corrected error is debugging evidence." />
              <div className="card-pad">
                <ErrorNotebook
                  entries={errors.map((e) => ({
                    _id: e._id,
                    errorType: e.errorType,
                    description: e.description,
                    correction: e.correction,
                    resolved: e.resolved,
                    lessonId: e.lessonId,
                  }))}
                  errorTypes={ERROR_TYPES.map((t) => t.label)}
                  lessonOptions={graph.lessons.map((l) => ({ id: l.id, title: l.title }))}
                />
              </div>
            </Card>

            <Card>
              <CardHead title="Recent attempts" />
              {submissions.length === 0 ? (
                <EmptyState title="No attempts yet" body="Your attempt history appears here with the help level you recorded. Nothing is shown until you make one." />
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {submissions.slice(0, 12).map((s) => (
                    <li key={s._id} className="px-5 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/practice/${s.assessmentId}`} className="truncate text-sm underline-offset-2 hover:underline">
                          {lessonTitle(s.lessonId)}
                        </Link>
                        {s.correct === true ? <Chip tone="positive">pass</Chip> : s.correct === false ? <Chip tone="caution">retry</Chip> : <Chip>unjudged</Chip>}
                      </div>
                      <p className="text-xs text-ink-3">
                        {new Date(s.createdAt).toLocaleString()} · {s.helpLevel} · {s.tier}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHead title="Running code" hint="Honest limits." />
              <div className="card-pad text-sm text-ink-2">
                <p>
                  This server does not execute code you write. Student code is never run on the backend, which removes a whole class of
                  security problems and means nothing here can pretend to have tested your work.
                </p>
                <p className="mt-2">
                  Run Python locally, in GitHub Codespaces, Colab or Kaggle, then bring back the output, the error message or the
                  repository link as evidence.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
