import Link from "next/link";
import { and, asc, eq, gt, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes, practiceItems, reviewItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Empty, PageHeader } from "@/components/ui";
import { PracticeBlock } from "@/components/PracticeBlock";

export default async function ReviewPage() {
  const user = await requireUser();
  const now = new Date();
  const [due, upcoming] = await Promise.all([
    db.select().from(reviewItems).where(and(eq(reviewItems.ownerId, user.id), lte(reviewItems.dueAt, now))).orderBy(asc(reviewItems.dueAt)).limit(8),
    db.select().from(reviewItems).where(and(eq(reviewItems.ownerId, user.id), gt(reviewItems.dueAt, now))).orderBy(asc(reviewItems.dueAt)).limit(8),
  ]);
  const ids = [...new Set([...due, ...upcoming].map((d) => d.nodeId))];
  const nodes = ids.length ? await db.select({ id: curriculumNodes.id, title: curriculumNodes.title }).from(curriculumNodes).where(inArray(curriculumNodes.id, ids)) : [];
  const titles = new Map(nodes.map((n) => [n.id, n.title]));
  const dueIds = due.map((d) => d.nodeId);
  const items = dueIds.length ? await db.select().from(practiceItems).where(inArray(practiceItems.nodeId, dueIds)) : [];
  // One recall item and one transfer item per due lesson, varied activity types.
  const picked = dueIds.flatMap((id) => {
    const mine = items.filter((i) => i.nodeId === id);
    const recall = mine.find((i) => !i.isTransfer && i.type !== "free_recall") ?? mine.find((i) => !i.isTransfer);
    const transfer = mine.find((i) => i.isTransfer);
    return [recall, transfer].filter((x): x is NonNullable<typeof x> => Boolean(x));
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Review" lead="Spaced retrieval scheduled from your own attempts: intervals grow with independent success (faster for transfer), shrink on lapses. Review mixes activity types — it is not a flashcard deck." />
      {due.length === 0 ? <Empty title="Nothing due right now" body={upcoming.length ? `Next review: ${titles.get(upcoming[0].nodeId)} on ${upcoming[0].dueAt.toLocaleDateString()}.` : "Reviews appear after you record practice attempts in a lesson."} href="/learn" cta="Go to Learn" /> : (
        <PracticeBlock isReview title={`Due now: ${due.length} lesson(s)`} items={picked.map((i) => ({ id: i.id, nodeId: i.nodeId, nodeTitle: titles.get(i.nodeId), type: i.type, difficulty: i.difficulty, prompt: i.prompt, rubric: i.rubric, reference: i.reference, isTransfer: i.isTransfer }))} />
      )}
      {upcoming.length > 0 && (
        <section className="card mt-6 p-5">
          <h2 className="text-sm font-semibold">Upcoming</h2>
          <ul className="mt-2 space-y-1 text-sm">{upcoming.map((u) => <li key={u.nodeId} className="flex justify-between gap-2"><Link href={`/learn/${u.nodeId}`} className="hover:underline">{titles.get(u.nodeId)}</Link><span className="text-xs text-muted">{u.dueAt.toLocaleDateString()} · interval {u.intervalDays.toFixed(1)}d · {u.repetitions} successes · {u.lapses} lapses</span></li>)}</ul>
        </section>
      )}
    </div>
  );
}
