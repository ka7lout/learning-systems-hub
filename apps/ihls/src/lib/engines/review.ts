import "server-only";
import type { Session } from "@/lib/auth/session";
import { owned, newId, type ReviewItemDoc } from "@/lib/dal";
import { SPACING } from "@/content/learning-science";
import type { AssessmentItem, Importance } from "@/content/types";

/**
 * REVIEW / SPACING ENGINE (§20, §148).
 *
 * Schedules by item difficulty, failure history, importance, mastery and the
 * elapsed delay — not by a fixed flashcard interval. Review items are varied
 * activity types because they point at assessment items of many kinds (§143),
 * never at term–definition cards.
 */

export interface ScheduleInput {
  passed: boolean;
  difficulty: number;
  importance: Importance;
  helpUsed: boolean;
}

export function nextSchedule(current: Pick<ReviewItemDoc, "ease" | "intervalDays" | "reps" | "lapses">, input: ScheduleInput) {
  let ease = current.ease || SPACING.startEase;
  let reps = current.reps;
  let lapses = current.lapses;
  let intervalDays: number;

  if (input.passed) {
    reps += 1;
    ease = Math.min(SPACING.maxEase, ease + (input.helpUsed ? 0.0 : 0.08) - (input.difficulty - 3) * 0.03);
    const base = SPACING.baseIntervalsDays[Math.min(reps - 1, SPACING.baseIntervalsDays.length - 1)];
    intervalDays = base * (reps > SPACING.baseIntervalsDays.length ? ease : 1);
  } else {
    lapses += 1;
    reps = 0;
    ease = Math.max(SPACING.minEase, ease - 0.25);
    intervalDays = 1;
  }

  const importanceFactor = SPACING.importanceMultiplier[input.importance] ?? 1;
  // An assisted recall is weaker evidence than an unassisted one, so it earns a
  // shorter interval rather than the full step (§142, §148).
  const helpFactor = input.passed && input.helpUsed ? 0.6 : 1;
  intervalDays = Math.max(1, Math.round(intervalDays * importanceFactor * helpFactor));

  const dueAt = new Date(Date.now() + intervalDays * 86_400_000).toISOString();
  return { ease: Number(ease.toFixed(2)), intervalDays, reps, lapses, dueAt };
}

export async function upsertReviewItem(session: Session, assessment: AssessmentItem, importance: Importance, passed: boolean, helpUsed: boolean): Promise<ReviewItemDoc> {
  const store = owned<ReviewItemDoc>(session, "review_items");
  const existing = await store.findOne({ refId: assessment.id });
  const current = existing ?? {
    ease: SPACING.startEase,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
  };
  const next = nextSchedule(current, { passed, difficulty: assessment.difficulty, importance, helpUsed });
  if (existing) {
    const updated = await store.update(
      { refId: assessment.id },
      { ...next, lastResult: passed ? "pass" : "fail", lastReviewedAt: new Date().toISOString() },
    );
    return updated!;
  }
  return store.insert({
    _id: newId("rev"),
    refKind: "assessment",
    refId: assessment.id,
    lessonId: assessment.lessonId,
    skillIds: assessment.skillIds,
    ...next,
    lastResult: passed ? "pass" : "fail",
    lastReviewedAt: new Date().toISOString(),
  });
}

export async function dueReviews(session: Session, limit = 20): Promise<ReviewItemDoc[]> {
  const store = owned<ReviewItemDoc>(session, "review_items");
  const all = await store.find({}, { sort: { dueAt: 1 } });
  const now = Date.now();
  return all.filter((r) => new Date(r.dueAt).getTime() <= now).slice(0, limit);
}

export async function reviewForecast(session: Session, days = 14): Promise<{ date: string; count: number }[]> {
  const all = await owned<ReviewItemDoc>(session, "review_items").find({});
  const out: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(Date.now() + i * 86_400_000);
    const key = day.toISOString().slice(0, 10);
    out.push({ date: key, count: all.filter((r) => r.dueAt.slice(0, 10) === key).length });
  }
  return out;
}

/**
 * §21 — interleaving. Mixes related-but-confusable items rather than blocking
 * by topic, but only when there are enough distinct skills to make it meaningful.
 */
export function interleave<T extends { skillIds: string[] }>(items: T[]): T[] {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const key = item.skillIds[0] ?? "_";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(item);
  }
  if (buckets.size < 2) return items;
  const out: T[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const list of buckets.values()) {
      const next = list.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}
