import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, eq, gt, lte } from "drizzle-orm";
import { db } from "@/db";
import { assessmentItems, reviewItems } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { EmptyState, PageHeader, Shell } from "@/components/shell";
import { ReviewCard } from "@/components/review-card";

export const dynamic = "force-dynamic";

const ACTIVITY_INSTRUCTION: Record<string, string> = {
  free_recall: "Close everything. Write what you remember about this node from memory, then check.",
  explain: "Explain the idea in your own words as if teaching a competent colleague.",
  transfer: "Apply the idea to a situation different from the one you learned it in.",
  debugging: "State one way a system using this idea typically breaks, and how you would detect it.",
  oral: "Say the explanation out loud for 60 seconds without reading, then write what you said.",
};

export default async function ReviewPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const now = new Date();
  const [due, upcoming] = await Promise.all([
    db
      .select()
      .from(reviewItems)
      .where(and(eq(reviewItems.userId, user.id), lte(reviewItems.dueAt, now)))
      .orderBy(asc(reviewItems.dueAt))
      .limit(20),
    db
      .select()
      .from(reviewItems)
      .where(and(eq(reviewItems.userId, user.id), gt(reviewItems.dueAt, now)))
      .orderBy(asc(reviewItems.dueAt))
      .limit(10),
  ]);

  const itemIds = due.map((d) => d.itemId).filter((x): x is string => Boolean(x));
  const prompts =
    itemIds.length > 0
      ? await db.select().from(assessmentItems).where(eq(assessmentItems.lessonId, due[0]!.lessonId))
      : [];
  const promptById = new Map(prompts.map((p) => [p.id, p]));

  return (
    <Shell user={user} active="/review">
      <PageHeader
        title="Spaced retrieval"
        lead="Intervals adapt to item difficulty, failure history, importance and your last result — they are not a fixed 1/3/7/14/30 ladder. The activity type rotates so review never collapses into term-definition drilling."
      />

      {due.length === 0 ? (
        <EmptyState
          title="Nothing is due right now"
          body="Review items are created when you record a practice attempt. Nothing is scheduled yet, so this list is genuinely empty rather than padded with filler cards."
        />
      ) : (
        <div className="space-y-3">
          {due.map((r) => (
            <ReviewCard
              key={r.id}
              id={r.id}
              label={r.label}
              lessonId={r.lessonId}
              activityType={r.activityType}
              instruction={ACTIVITY_INSTRUCTION[r.activityType] ?? ACTIVITY_INSTRUCTION.free_recall!}
              lapses={r.lapses}
              intervalDays={r.intervalDays}
              prompt={r.itemId ? promptById.get(r.itemId)?.prompt ?? null : null}
            />
          ))}
        </div>
      )}

      {upcoming.length > 0 ? (
        <section className="surface p-4 mt-6">
          <h2 className="text-sm font-medium">Scheduled ahead</h2>
          <ul className="mt-2 space-y-1.5 text-xs">
            {upcoming.map((u) => (
              <li key={u.id} className="flex justify-between gap-3">
                <Link href={`/learn/${u.lessonId}`} className="underline underline-offset-2">
                  {u.label}
                </Link>
                <span className="muted tabular-nums">
                  {new Date(u.dueAt).toLocaleDateString()} · interval {u.intervalDays.toFixed(1)}d · ease{" "}
                  {u.ease.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Shell>
  );
}
