import "server-only";

import { and, asc, desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  assessmentItems,
  attempts,
  courses,
  lessons,
  masteryRecords,
  reviewItems,
  skillEvidence,
  userProjects,
} from "@/db/schema";
import { attemptScore, ema as EMA, masteryLevel, MASTERY_LABELS, nextInterval, outcomeScore } from "@/lib/mastery-math";

export { attemptScore, masteryLevel, MASTERY_LABELS, nextInterval };

export type LearningState = "deep" | "drift" | "fog" | "overload";

export const LEARNING_STATES: { id: LearningState; label: string; guidance: string }[] = [
  {
    id: "deep",
    label: "I'm focused",
    guidance:
      "Full task size. Derivations, transfer tasks and open cases are appropriate. The session is not cut short by a timer while answer quality holds.",
  },
  {
    id: "drift",
    label: "I'm drifting",
    guidance:
      "One concept, one question, one attempt, feedback, next. Task size is reduced until attention stabilises.",
  },
  {
    id: "fog",
    label: "Starting feels hard",
    guidance:
      "Low-friction entry: an easy recall from something you already know, a short example, a small attempt, then difficulty increases gradually.",
  },
  {
    id: "overload",
    label: "There is too much at once",
    guidance:
      "Fewer simultaneous elements, more worked examples, segmented material, heavier scaffolding. Difficulty is held, not increased.",
  },
];

/** Difficulty ceiling per state — state changes delivery, never the learning principles. */
export function allowedDifficulty(state: LearningState): string[] {
  switch (state) {
    case "deep":
      return ["A", "B", "C", "D", "E", "F"];
    case "drift":
      return ["A", "B", "C"];
    case "fog":
      return ["A", "B"];
    case "overload":
      return ["A", "B"];
  }
}

export function taskBudget(state: LearningState): number {
  return state === "deep" ? 4 : state === "drift" ? 2 : 1;
}

/* ------------------------- mastery persistence ----------------------- */

export async function recordAttemptAndUpdate(params: {
  userId: number;
  itemId: string;
  lessonId: string;
  response: string;
  outcome: string;
  helpLevel: string;
  errorType: string;
  learningState: string;
  phase: string;
  skills: string[];
}) {
  const score = attemptScore(params.outcome, params.helpLevel);
  const independent = params.helpLevel === "none" || params.helpLevel === "hint";

  await db.insert(attempts).values({
    userId: params.userId,
    itemId: params.itemId,
    lessonId: params.lessonId,
    response: params.response,
    outcome: params.outcome,
    score,
    helpLevel: params.helpLevel,
    independent,
    errorType: params.errorType,
    learningState: params.learningState,
  });

  await updateMastery(params.userId, "lesson", params.lessonId, params.phase, score, independent);
  for (const skillId of params.skills) {
    await updateMastery(params.userId, "skill", skillId, params.phase, score, independent);
    if (score >= 0.8 && independent) {
      await db.insert(skillEvidence).values({
        userId: params.userId,
        skillId,
        kind: params.phase === "transfer" ? "transfer" : "assessment",
        description: `Independent ${params.phase} performance on assessment item ${params.itemId}`,
        independent: true,
        weight: params.phase === "transfer" ? 1.5 : 1,
      });
    }
  }

  await scheduleReview(params.userId, params.lessonId, params.itemId, params.outcome, params.phase);
  return { score, independent };
}

async function updateMastery(
  userId: number,
  nodeType: "lesson" | "skill" | "course",
  nodeId: string,
  phase: string,
  score: number,
  independent: boolean,
) {
  const existing = await db
    .select()
    .from(masteryRecords)
    .where(
      and(
        eq(masteryRecords.userId, userId),
        eq(masteryRecords.nodeType, nodeType),
        eq(masteryRecords.nodeId, nodeId),
      ),
    )
    .limit(1);

  const prev = existing[0];
  const n = (prev?.evidenceCount ?? 0) + 1;
  const recall = phase === "recall" ? EMA(prev?.recall ?? 0, score, n) : prev?.recall ?? 0;
  const application =
    phase === "application" ? EMA(prev?.application ?? 0, score, n) : prev?.application ?? 0;
  const transfer = phase === "transfer" ? EMA(prev?.transfer ?? 0, score, n) : prev?.transfer ?? 0;
  const independence = EMA(prev?.independence ?? 0, independent ? 1 : 0, n);

  let projectEvidence = 0;
  if (nodeType === "skill") {
    const ev = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(skillEvidence)
      .where(
        and(
          eq(skillEvidence.userId, userId),
          eq(skillEvidence.skillId, nodeId),
          eq(skillEvidence.kind, "project"),
        ),
      );
    projectEvidence = ev[0]?.c ?? 0;
  }

  const level = masteryLevel({
    recall,
    application,
    transfer,
    independence,
    evidenceCount: n,
    delayedPerformance: prev?.delayedPerformance ?? 0,
    projectEvidence,
  });

  if (prev) {
    await db
      .update(masteryRecords)
      .set({ recall, application, transfer, independence, evidenceCount: n, level, updatedAt: new Date() })
      .where(eq(masteryRecords.id, prev.id));
  } else {
    await db.insert(masteryRecords).values({
      userId,
      nodeType,
      nodeId,
      recall,
      application,
      transfer,
      independence,
      evidenceCount: n,
      level,
    });
  }
}

const REVIEW_ACTIVITIES = ["free_recall", "explain", "transfer", "debugging", "oral"];

async function scheduleReview(
  userId: number,
  lessonId: string,
  itemId: string,
  outcome: string,
  phase: string,
) {
  const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  const label = lesson[0]?.title ?? lessonId;

  const existing = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), eq(reviewItems.itemId, itemId)))
    .limit(1);

  const importance = phase === "transfer" ? 1.5 : 1;
  const prev = existing[0];
  const base = prev ?? { intervalDays: 1, ease: 2.3, lapses: 0 };
  const next = nextInterval(base.intervalDays, base.ease, base.lapses, outcome, importance);
  const dueAt = new Date(Date.now() + next.interval * 24 * 60 * 60 * 1000);
  // Interleave the activity type so review never collapses into term-definition drilling.
  const activityType =
    REVIEW_ACTIVITIES[(next.lapses + Math.round(next.interval)) % REVIEW_ACTIVITIES.length]!;

  if (prev) {
    await db
      .update(reviewItems)
      .set({
        intervalDays: next.interval,
        ease: next.ease,
        lapses: next.lapses,
        dueAt,
        lastResult: outcome,
        activityType,
      })
      .where(eq(reviewItems.id, prev.id));
  } else {
    await db.insert(reviewItems).values({
      userId,
      lessonId,
      itemId,
      label,
      dueAt,
      intervalDays: next.interval,
      ease: next.ease,
      lapses: next.lapses,
      importance,
      lastResult: outcome,
      activityType,
    });
  }
}

/** Delayed performance: a review graded at least 24 hours after the original attempt. */
export async function recordDelayedPerformance(userId: number, lessonId: string, outcome: string) {
  const score = outcomeScore(outcome);
  const existing = await db
    .select()
    .from(masteryRecords)
    .where(
      and(
        eq(masteryRecords.userId, userId),
        eq(masteryRecords.nodeType, "lesson"),
        eq(masteryRecords.nodeId, lessonId),
      ),
    )
    .limit(1);
  const prev = existing[0];
  if (!prev) return;
  const delayed = EMA(prev.delayedPerformance, score, prev.evidenceCount + 1);
  const level = masteryLevel({
    recall: prev.recall,
    application: prev.application,
    transfer: prev.transfer,
    independence: prev.independence,
    evidenceCount: prev.evidenceCount,
    delayedPerformance: delayed,
    projectEvidence: 0,
  });
  await db
    .update(masteryRecords)
    .set({ delayedPerformance: delayed, level, updatedAt: new Date() })
    .where(eq(masteryRecords.id, prev.id));
}

/* -------------------------- the task engine -------------------------- */

export type NextTask = {
  kind: "review" | "transfer" | "practice" | "lesson" | "project" | "english";
  title: string;
  reason: string;
  href: string;
};

/**
 * Every recommendation carries a reason. No busywork: a task is produced only
 * when it builds knowledge, verifies mastery, trains transfer, creates
 * evidence or closes a stated career gap.
 */
export async function nextBestTasks(userId: number, state: LearningState): Promise<NextTask[]> {
  const budget = taskBudget(state);
  const tasks: NextTask[] = [];

  const due = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), lte(reviewItems.dueAt, new Date())))
    .orderBy(asc(reviewItems.dueAt))
    .limit(3);

  for (const r of due) {
    tasks.push({
      kind: "review",
      title: `Review: ${r.label}`,
      reason:
        r.lapses > 0
          ? `This item was missed ${r.lapses} time(s); the spacing interval was shortened so the memory is rebuilt before it decays.`
          : "Scheduled retrieval — the gap since your last successful recall has reached the point where retrieval is effortful and therefore useful.",
      href: "/review",
    });
  }

  if (tasks.length < budget) {
    const weak = await db
      .select()
      .from(masteryRecords)
      .where(and(eq(masteryRecords.userId, userId), eq(masteryRecords.nodeType, "lesson")))
      .orderBy(asc(masteryRecords.transfer))
      .limit(5);

    for (const m of weak) {
      if (tasks.length >= budget) break;
      if (m.application >= 0.6 && m.transfer < 0.6) {
        const lesson = await db.select().from(lessons).where(eq(lessons.id, m.nodeId)).limit(1);
        if (lesson[0]) {
          tasks.push({
            kind: "transfer",
            title: `Transfer check: ${lesson[0].title}`,
            reason:
              "You can apply this in the form you were taught, but transfer evidence is still missing. Mastery above L5 requires solving an unfamiliar version.",
            href: `/learn/${lesson[0].id}#practice`,
          });
        }
      }
    }
  }

  if (tasks.length < budget) {
    const started = await db
      .select({ id: masteryRecords.nodeId })
      .from(masteryRecords)
      .where(and(eq(masteryRecords.userId, userId), eq(masteryRecords.nodeType, "lesson")));
    const seen = new Set(started.map((s) => s.id));
    const all = await db
      .select({ id: lessons.id, title: lessons.title, courseId: lessons.courseId })
      .from(lessons)
      .orderBy(asc(lessons.courseId), asc(lessons.position));
    const next = all.find((l) => !seen.has(l.id));
    if (next) {
      const course = await db.select().from(courses).where(eq(courses.id, next.courseId)).limit(1);
      tasks.push({
        kind: "lesson",
        title: `Study: ${next.title}`,
        reason: `Next unstarted node in ${course[0]?.title ?? "the curriculum"}; its prerequisites are either met or empty.`,
        href: `/learn/${next.id}`,
      });
    }
  }

  if (tasks.length < budget) {
    const active = await db
      .select()
      .from(userProjects)
      .where(and(eq(userProjects.userId, userId), eq(userProjects.status, "in_progress")))
      .orderBy(desc(userProjects.updatedAt))
      .limit(1);
    if (active[0]) {
      tasks.push({
        kind: "project",
        title: "Advance your active project",
        reason:
          "Project evidence is required for mastery level 8 and for any CV claim. An in-progress project with no recent evidence is the highest-value unfinished work you have.",
        href: "/projects",
      });
    }
  }

  return tasks.slice(0, Math.max(1, budget));
}

/** Help-dependency signal — assisted versus independent performance. */
export async function dependencyProfile(userId: number) {
  const rows = await db
    .select({
      total: sql<number>`count(*)::int`,
      independent: sql<number>`sum(case when ${attempts.independent} then 1 else 0 end)::int`,
      avgScore: sql<number>`coalesce(avg(${attempts.score}), 0)::float`,
      assistedAvg: sql<number>`coalesce(avg(case when not ${attempts.independent} then ${attempts.score} end), 0)::float`,
      independentAvg: sql<number>`coalesce(avg(case when ${attempts.independent} then ${attempts.score} end), 0)::float`,
    })
    .from(attempts)
    .where(eq(attempts.userId, userId));
  return rows[0];
}

export async function errorProfile(userId: number) {
  return db
    .select({ errorType: attempts.errorType, count: sql<number>`count(*)::int` })
    .from(attempts)
    .where(eq(attempts.userId, userId))
    .groupBy(attempts.errorType)
    .orderBy(desc(sql`count(*)`));
}

export async function lessonItems(lessonId: string, state: LearningState) {
  const allowed = allowedDifficulty(state);
  const items = await db
    .select()
    .from(assessmentItems)
    .where(eq(assessmentItems.lessonId, lessonId))
    .orderBy(asc(assessmentItems.position));
  return items.filter((i) => allowed.includes(i.difficulty));
}
