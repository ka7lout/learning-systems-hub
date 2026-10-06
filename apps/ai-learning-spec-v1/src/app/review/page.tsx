import { AppShell } from "@/components/shell";
import { PracticeItem } from "@/components/client";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getDueReviews, getUpcomingReviews } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await requirePage();
  const [due, upcoming] = await Promise.all([getDueReviews(user.id), getUpcomingReviews(user.id)]);
  const dueKeys = new Set(due.map((d) => d.itemKey));

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Spaced retrieval"
        title="Review"
        description="Intervals adapt to your performance, the item's stage and its failure history. Review is not flashcards: the scheduled activity is the original recall, explanation, debugging or transfer task."
      />

      {due.length === 0 ? (
        <EmptyState
          title="Nothing is due right now"
          description="Review items are created when you record attempts. Study a lesson and practise it, and the retrieval schedule will build itself from your actual results."
          actionHref="/curriculum"
          actionLabel="Open the curriculum"
        />
      ) : (
        <div className="space-y-4">
          {due.map((item) => (
            <div key={item.itemKey}>
              <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                {item.lessonTitle} · repetition {item.reps + 1}
                {item.lapses > 0 ? ` · ${item.lapses} lapse${item.lapses > 1 ? "s" : ""}` : ""}
              </p>
              <PracticeItem
                item={{
                  key: item.itemKey,
                  type: item.type,
                  stage: item.stage,
                  difficulty: "C",
                  prompt: item.prompt,
                  context: item.context,
                  rubric: item.rubric,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 ? (
        <Card className="mt-8 p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Schedule</h2>
          <ul className="space-y-1 text-sm">
            {upcoming.map((u) => (
              <li key={u.itemKey} className="flex items-center justify-between gap-3 border-b border-line pb-1 last:border-0">
                <span className="truncate text-ink">{u.lessonTitle}</span>
                <span className="shrink-0 text-xs text-muted">
                  {dueKeys.has(u.itemKey)
                    ? "due now"
                    : `in ${Math.max(0, Math.ceil((u.dueAt.getTime() - Date.now()) / 86400000))} day(s)`}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </AppShell>
  );
}
