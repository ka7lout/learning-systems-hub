import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph, SPACING } from "@/content";
import { dueReviews, interleave, reviewForecast } from "@/lib/engines/review";
import { owned, type ReviewItemDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, EmptyState } from "@/components/ui";
import { ReviewRunner, type ReviewCard } from "@/components/ReviewRunner";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const due = await dueReviews(session, 50);
  const all = await owned<ReviewItemDoc>(session, "review_items").find({});
  const forecast = await reviewForecast(session, 14);

  const cards: ReviewCard[] = interleave(due)
    .map((item) => {
      const assessment = graph.assessments.find((a) => a.id === item.refId);
      const lesson = graph.lessons.find((l) => l.id === item.lessonId);
      if (!assessment || !lesson) return null;
      return {
        assessmentId: assessment.id,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        prompt: assessment.prompt,
        rubric: assessment.rubric,
        expectedPoints: assessment.expectedPoints,
        dueAt: item.dueAt,
        reps: item.reps,
        lapses: item.lapses,
      };
    })
    .filter(Boolean) as ReviewCard[];

  const maxForecast = Math.max(1, ...forecast.map((f) => f.count));

  return (
    <>
      <PageHeader
        title="Review"
        lede="Spaced retrieval over everything you have passed. Items you missed come back sooner; items you held come back later."
      >
        <Chip>{all.length} items in the schedule</Chip>
      </PageHeader>
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHead title="Due now" hint="Interleaved across skills on purpose — blocked practice flatters you." />
            {cards.length === 0 ? (
              <EmptyState
                title={all.length === 0 ? "Nothing scheduled yet" : "Nothing due today"}
                body={
                  all.length === 0
                    ? "Review items are created the first time an attempt is judged. Pass or fail one check in the Practice Lab and the schedule starts."
                    : "Everything in the schedule is ahead of its due date. Come back on the next due date rather than grinding items early."
                }
              />
            ) : (
              <ReviewRunner cards={cards} />
            )}
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHead title="Next 14 days" />
              {all.length === 0 ? (
                <p className="card-pad text-sm text-ink-3">No schedule yet.</p>
              ) : (
                <div className="card-pad">
                  <div className="flex items-end gap-1.5" role="img" aria-label={forecast.map((f) => `${f.date}: ${f.count}`).join(", ")}>
                    {forecast.map((f) => (
                      <div key={f.date} className="flex-1 text-center">
                        <div className="mx-auto w-full rounded-sm" style={{ height: `${8 + (f.count / maxForecast) * 52}px`, background: f.count ? "var(--accent)" : "var(--surface-3)" }} />
                        <span className="mt-1 block text-[0.65rem] text-ink-3">{new Date(f.date).getDate()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <CardHead title="How the schedule works" hint="No hidden magic." />
              <div className="card-pad text-sm text-ink-2">
                <p>
                  A passed item moves along the interval ladder {SPACING.baseIntervalsDays.join(", ")} days, scaled by an ease factor
                  (between {SPACING.minEase} and {SPACING.maxEase}, starting at {SPACING.startEase}) and by how important the parent
                  lesson is. A missed item drops back to the start of the ladder and the ease factor falls.
                </p>
                <p className="mt-2">
                  Using help shortens the next interval, because an assisted recall is weaker evidence than an unassisted one.
                </p>
                <p className="mt-2 text-xs text-ink-3">
                  Spacing and retrieval practice are among the better-supported findings in learning research. The exact interval
                  numbers here are an engineering choice, not a research result.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
