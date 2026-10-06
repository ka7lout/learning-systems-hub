import Link from "next/link";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { assessmentItems, lessons } from "@/db/schema";
import { AppShell } from "@/components/shell";
import { PracticeItem } from "@/components/client";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getProgressFor } from "@/lib/data";

export const dynamic = "force-dynamic";

const TASK_TYPES = [
  "free recall",
  "explain in your own words",
  "predict output",
  "code reading",
  "debugging",
  "complexity analysis",
  "choose a method",
  "derivation",
  "transfer task",
  "case decision",
  "oral explanation",
];

export default async function PracticePage() {
  const user = await requirePage();
  const progress = await getProgressFor(user.id);
  const keys = progress.map((p) => p.lessonKey);

  const openedLessons = keys.length > 0 ? await db.select().from(lessons).where(inArray(lessons.key, keys)) : [];
  const items = keys.length > 0 ? await db.select().from(assessmentItems).where(inArray(assessmentItems.lessonKey, keys)) : [];

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Practice Lab"
        title="Active practice, not multiple choice"
        description="Every item requires you to produce something — a recall, an explanation, a prediction, a diagnosis, a decision — and then judge it honestly against a rubric."
      />

      <Card className="mb-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Task types used in this system</h2>
        <div className="flex flex-wrap gap-1.5">
          {TASK_TYPES.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Multiple choice is deliberately a minor component. Recognition is the weakest evidence of competence, and it is
          the easiest thing to pass without understanding.
        </p>
      </Card>

      {openedLessons.length === 0 ? (
        <EmptyState
          title="No lessons opened yet"
          description="Practice items appear here for the lessons you have actually opened, so this page reflects your real study history."
          actionHref="/curriculum"
          actionLabel="Choose a lesson"
        />
      ) : (
        <div className="space-y-4">
          {openedLessons.map((lesson) => {
            const lessonItems = items.filter((i) => i.lessonKey === lesson.key);
            const state = progress.find((p) => p.lessonKey === lesson.key);
            return (
              <Card key={lesson.key} className="p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-ink">{lesson.title}</h2>
                  <div className="flex items-center gap-2">
                    {state ? <Badge tone={state.status === "demonstrated" ? "good" : "warn"}>{state.status}</Badge> : null}
                    <Link href={`/learn/${lesson.key}`} className="text-xs text-accentink underline underline-offset-4">
                      open lesson
                    </Link>
                  </div>
                </div>
                <details>
                  <summary className="cursor-pointer text-sm text-muted">
                    {lessonItems.length} practice item{lessonItems.length === 1 ? "" : "s"}
                  </summary>
                  <div className="mt-3 space-y-3">
                    {lessonItems.map((item) => (
                      <PracticeItem
                        key={item.key}
                        item={{
                          key: item.key,
                          type: item.type,
                          stage: item.stage,
                          difficulty: item.difficulty,
                          prompt: item.prompt,
                          context: item.context,
                          rubric: item.rubric,
                        }}
                      />
                    ))}
                  </div>
                </details>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
