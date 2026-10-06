import Link from "next/link";
import { and, asc, eq, gt, lte, sql } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, Badge, SectionTitle, EmptyState } from "@/components/ui";
import { db } from "@/db";
import { reviewItems } from "@/db/schema";
import { gradeReviewAction } from "@/app/actions";
import { GRADE_LABELS } from "@/lib/scheduler";
import { retrievalPromptsForTopic } from "@/content/curriculum";

export default async function ReviewPage() {
  const user = await requireUser();
  const now = new Date();

  const due = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, user.id), lte(reviewItems.dueAt, now)))
    .orderBy(asc(reviewItems.dueAt))
    .limit(10);

  const upcomingCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, user.id), gt(reviewItems.dueAt, now)));

  const item = due[0];
  const prompts = item ? retrievalPromptsForTopic(item.topicName) : [];

  return (
    <PageShell path="/review">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Spaced review</h1>
      <p className="mt-1 max-w-2xl text-[14px] text-ink-soft">
        Active retrieval, not re-reading. Intervals adapt to your honest grades — failures come
        back tomorrow, strong recalls stretch further out.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!item ? (
            <EmptyState
              title="Nothing is due right now"
              body={
                Number(upcomingCount[0]?.count ?? 0) > 0
                  ? `Your queue is healthy — ${upcomingCount[0].count} item(s) are scheduled for later. Reviews appear here when their interval elapses.`
                  : "Your review queue is empty. Complete a lesson's recall checkpoint to seed its topics into the scheduler."
              }
            />
          ) : (
            <Card className="border-l-4 border-l-accent">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="navy">{item.moduleSlug}</Badge>
                <Badge>
                  rep {item.reps} · interval {item.intervalDays}d{item.lapses > 0 ? ` · ${item.lapses} lapse(s)` : ""}
                </Badge>
                <span className="text-[12.5px] text-ink-faint">{due.length} due in total</span>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-ink">{item.topicName}</h2>
              <div className="mt-3 space-y-2">
                {prompts.map((p) => (
                  <p key={p} className="rounded-lg bg-surface px-3 py-2 text-[13.5px] leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </div>
              <p className="mt-3 text-[12.5px] text-ink-faint">
                Speak or write your answer first — out loud counts. Then check against your notebook or the lesson (
                <Link href={`/learn/${item.moduleSlug}/${item.lessonSlug}`} className="font-medium text-accent hover:underline">
                  open lesson
                </Link>
                ) and grade yourself honestly.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {GRADE_LABELS.map((g) => (
                  <form key={g.grade} action={gradeReviewAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="grade" value={g.grade} />
                    <button
                      title={g.hint}
                      className={`rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                        g.grade < 3
                          ? "border-bad/30 bg-bad-soft text-bad hover:border-bad"
                          : "border-good/30 bg-good-soft text-good hover:border-good"
                      }`}
                    >
                      {g.grade} · {g.label}
                    </button>
                  </form>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card>
          <SectionTitle sub="How the scheduler treats your grades.">Grading guide</SectionTitle>
          <ul className="space-y-2 text-[13px] text-ink-soft">
            {GRADE_LABELS.map((g) => (
              <li key={g.grade}>
                <span className="font-semibold text-ink">{g.grade} — {g.label}:</span> {g.hint}.
                {g.grade < 3 ? " Resets the interval; the item returns tomorrow." : ""}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-ink-faint">
            Grading dishonestly only corrupts your own schedule. The system never punishes a lapse —
            it just brings the item back sooner.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
