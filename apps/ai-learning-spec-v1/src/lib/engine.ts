import "server-only";
import { and, asc, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  assessmentItems,
  attempts,
  careerRoles,
  courses,
  lessonProgress,
  lessons,
  masteryRecords,
  prerequisites,
  projectCatalog,
  reviewItems,
  roleRequirements,
  userProjects,
} from "@/db/schema";

export type LearningState = "deep" | "drift" | "fog" | "overload";

export const STATE_PLAYBOOK: Record<
  LearningState,
  { label: string; guidance: string; taskSize: number; scaffolding: string }
> = {
  deep: {
    label: "Focused",
    guidance:
      "Work is holding. Take a full learning block: concept → attempt → transfer. The session ends when answer quality drops, not when a timer expires.",
    taskSize: 3,
    scaffolding: "Minimal. Problem first, hint only on request.",
  },
  drift: {
    label: "Drifting",
    guidance:
      "Shrink the unit of work: one concept, one question, one piece of feedback, then decide again. Park intrusive thoughts in Later instead of fighting them.",
    taskSize: 1,
    scaffolding: "Short prompts, immediate feedback, one idea at a time.",
  },
  fog: {
    label: "Starting feels hard",
    guidance:
      "Begin with something you already know. One easy retrieval, one short example, one small attempt — then raise difficulty only if it is working.",
    taskSize: 1,
    scaffolding: "Start from a known item, fully worked example first, then fade support.",
  },
  overload: {
    label: "Too much at once",
    guidance:
      "Reduce simultaneous elements. One worked example, segmented, with no new terminology. Difficulty returns after the load drops.",
    taskSize: 1,
    scaffolding: "Worked examples, segmentation, no parallel concepts, no new vocabulary.",
  },
};

export const HELP_LEVELS = [
  "no_help",
  "hint",
  "guidance",
  "concept_reminder",
  "worked_example",
  "full_explanation",
] as const;
export type HelpLevel = (typeof HELP_LEVELS)[number];

export const ERROR_CLASSES = [
  { key: "concept", label: "Concept error — I did not understand the idea" },
  { key: "recall", label: "Recall error — I knew it but could not retrieve it" },
  { key: "selection", label: "Selection error — I picked the wrong tool/method" },
  { key: "execution", label: "Execution error — right plan, wrong execution" },
  { key: "transfer", label: "Transfer error — fine on the example, failed on the new case" },
  { key: "attention", label: "Attention error — I lost focus mid-task" },
  { key: "load", label: "Load error — the task was larger than I could process" },
] as const;

/** Mastery ladder L0..L9 (spec §34). */
export const MASTERY_LEVELS = [
  "L0 — not encountered",
  "L1 — recognise it",
  "L2 — recall it",
  "L3 — explain it",
  "L4 — use it",
  "L5 — choose when to use it",
  "L6 — solve a new problem with it",
  "L7 — combine it with other concepts",
  "L8 — build something with it",
  "L9 — teach it",
];

function levelFromDims(d: {
  recall: number;
  application: number;
  transfer: number;
  evidenceCount: number;
  independentEvidence: number;
  projectEvidence: number;
}): number {
  let level = 0;
  if (d.evidenceCount > 0) level = 1;
  if (d.recall >= 0.5) level = 2;
  if (d.recall >= 0.7) level = 3;
  if (d.application >= 0.6) level = 4;
  if (d.application >= 0.75 && d.recall >= 0.7) level = 5;
  if (d.transfer >= 0.6) level = 6;
  if (d.transfer >= 0.75 && d.independentEvidence >= 3) level = 7;
  if (d.projectEvidence > 0 && d.transfer >= 0.6) level = 8;
  if (d.projectEvidence > 1 && d.transfer >= 0.8 && d.independentEvidence >= 6) level = 9;
  return level;
}

const EMA = (previous: number, observation: number, weight = 0.4) =>
  previous === 0 ? observation : previous * (1 - weight) + observation * weight;

export type AttemptInput = {
  userId: number;
  itemKey: string;
  responseText: string;
  helpLevel: HelpLevel;
  rubricChecks: boolean[];
  errorClass?: string | null;
};

export async function recordAttempt(input: AttemptInput) {
  const [item] = await db
    .select()
    .from(assessmentItems)
    .where(eq(assessmentItems.key, input.itemKey))
    .limit(1);
  if (!item) throw new Error("Unknown assessment item");

  const total = Math.max(item.rubric.length, 1);
  const met = input.rubricChecks.filter(Boolean).length;
  const score = Math.min(met / total, 1);
  const outcome = score >= 0.8 ? "correct" : score >= 0.5 ? "partial" : "incorrect";
  const independent = input.helpLevel === "no_help" || input.helpLevel === "hint";

  await db.insert(attempts).values({
    userId: input.userId,
    itemKey: item.key,
    lessonKey: item.lessonKey,
    responseText: input.responseText,
    helpLevel: input.helpLevel,
    outcome,
    errorClass: input.errorClass ?? null,
    independent,
    selfRating: Math.round(score * 3),
  });

  // --- mastery
  for (const skillKey of item.skillKeys) {
    const [existing] = await db
      .select()
      .from(masteryRecords)
      .where(and(eq(masteryRecords.userId, input.userId), eq(masteryRecords.skillKey, skillKey)))
      .limit(1);

    const prev = existing ?? {
      recall: 0,
      application: 0,
      transfer: 0,
      evidenceCount: 0,
      independentEvidence: 0,
    };
    const next = {
      recall: item.stage === "recall" ? EMA(prev.recall, score) : prev.recall,
      application:
        item.stage === "application" || item.stage === "case" ? EMA(prev.application, score) : prev.application,
      transfer: item.stage === "transfer" || item.stage === "case" ? EMA(prev.transfer, score) : prev.transfer,
      evidenceCount: prev.evidenceCount + 1,
      independentEvidence: prev.independentEvidence + (independent && score >= 0.5 ? 1 : 0),
    };
    const projectEvidence = await countProjectEvidence(input.userId, skillKey);
    const level = levelFromDims({ ...next, projectEvidence });

    if (existing) {
      await db
        .update(masteryRecords)
        .set({ ...next, level, updatedAt: new Date() })
        .where(eq(masteryRecords.id, existing.id));
    } else {
      await db.insert(masteryRecords).values({ userId: input.userId, skillKey, ...next, level });
    }
  }

  // --- lesson progress
  const [progress] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, input.userId), eq(lessonProgress.lessonKey, item.lessonKey)))
    .limit(1);
  const recallScore = item.stage === "recall" ? EMA(progress?.recallScore ?? 0, score) : progress?.recallScore ?? 0;
  const transferScore =
    item.stage === "transfer" || item.stage === "case" ? EMA(progress?.transferScore ?? 0, score) : progress?.transferScore ?? 0;
  const status = transferScore >= 0.7 && recallScore >= 0.6 ? "demonstrated" : "practiced";
  if (progress) {
    await db
      .update(lessonProgress)
      .set({ recallScore, transferScore, status, lastActivityAt: new Date() })
      .where(eq(lessonProgress.id, progress.id));
  } else {
    await db.insert(lessonProgress).values({
      userId: input.userId,
      lessonKey: item.lessonKey,
      recallScore,
      transferScore,
      status,
      contentSeenAt: new Date(),
    });
  }

  // --- spaced review scheduling
  await scheduleReview(input.userId, item.lessonKey, item.key, item.type, score, item.stage);

  return { score, outcome, independent, rubric: item.rubric, lessonKey: item.lessonKey };
}

async function countProjectEvidence(userId: number, skillKey: string): Promise<number> {
  const rows = await db
    .select({ key: projectCatalog.key, skillKeys: projectCatalog.skillKeys, status: userProjects.status })
    .from(userProjects)
    .innerJoin(projectCatalog, eq(projectCatalog.key, userProjects.projectKey))
    .where(and(eq(userProjects.userId, userId), eq(userProjects.status, "done")));
  return rows.filter((r) => r.skillKeys.includes(skillKey)).length;
}

/**
 * Adaptive spacing: interval responds to performance, item importance and
 * lapse history rather than following a fixed ladder (spec §20, §148).
 */
async function scheduleReview(
  userId: number,
  lessonKey: string,
  itemKey: string,
  activityType: string,
  score: number,
  stage: string,
) {
  const [existing] = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), eq(reviewItems.itemKey, itemKey)))
    .limit(1);

  const importance = stage === "transfer" || stage === "case" ? 3 : 2;
  const quality = score; // 0..1
  const prevEase = existing?.ease ?? 2.3;
  const ease = Math.min(3.2, Math.max(1.3, prevEase + (quality - 0.6) * 0.6));
  const reps = (existing?.reps ?? 0) + 1;
  const lapses = (existing?.lapses ?? 0) + (quality < 0.5 ? 1 : 0);

  let interval: number;
  if (quality < 0.5) interval = 1;
  else if (reps === 1) interval = quality >= 0.8 ? 2 : 1;
  else interval = Math.min(120, Math.max(1, (existing?.intervalDays ?? 1) * ease * (quality >= 0.8 ? 1 : 0.6)));
  if (importance === 3) interval = Math.max(1, interval * 0.8);

  const dueAt = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
  if (existing) {
    await db
      .update(reviewItems)
      .set({ dueAt, intervalDays: interval, ease, reps, lapses, lastResult: quality >= 0.5 ? "pass" : "fail" })
      .where(eq(reviewItems.id, existing.id));
  } else {
    await db.insert(reviewItems).values({
      userId,
      lessonKey,
      itemKey,
      activityType,
      dueAt,
      intervalDays: interval,
      ease,
      reps,
      lapses,
      importance,
      lastResult: quality >= 0.5 ? "pass" : "fail",
    });
  }
}

export type NextTask = {
  kind: "review" | "lesson" | "practice" | "project" | "career" | "english";
  title: string;
  reason: string;
  href: string;
  estimatedMinutes: number;
};

/** "What should I do now?" — every recommendation carries a why (spec §219). */
export async function nextBestTasks(userId: number, state: LearningState = "deep"): Promise<NextTask[]> {
  const tasks: NextTask[] = [];
  const now = new Date();

  const due = await db
    .select({
      itemKey: reviewItems.itemKey,
      lessonKey: reviewItems.lessonKey,
      dueAt: reviewItems.dueAt,
      lessonTitle: lessons.title,
      activityType: reviewItems.activityType,
    })
    .from(reviewItems)
    .innerJoin(lessons, eq(lessons.key, reviewItems.lessonKey))
    .where(and(eq(reviewItems.userId, userId), lte(reviewItems.dueAt, now)))
    .orderBy(asc(reviewItems.dueAt))
    .limit(3);

  for (const item of due) {
    tasks.push({
      kind: "review",
      title: `Retrieval due: ${item.lessonTitle}`,
      reason: "Scheduled retrieval — delayed recall is what distinguishes durable learning from recent exposure.",
      href: `/review`,
      estimatedMinutes: 8,
    });
  }

  const progressRows = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId))
    .orderBy(desc(lessonProgress.lastActivityAt));
  const seen = new Set(progressRows.map((p) => p.lessonKey));

  const weak = progressRows.find((p) => p.status !== "demonstrated" && p.transferScore < 0.6);
  if (weak) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.key, weak.lessonKey)).limit(1);
    if (lesson) {
      tasks.push({
        kind: "practice",
        title: `Transfer check: ${lesson.title}`,
        reason:
          weak.recallScore >= 0.6
            ? "You can recall this but transfer is unproven. Recall without transfer does not survive a new problem."
            : "Recall is still unstable here, so this is the cheapest place to make progress.",
        href: `/learn/${lesson.key}#practice`,
        estimatedMinutes: 15,
      });
    }
  }

  const allLessons = await db.select().from(lessons).orderBy(asc(lessons.position));
  const next = allLessons.find((l) => !seen.has(l.key));
  if (next) {
    const [course] = await db.select().from(courses).where(eq(courses.key, next.courseKey)).limit(1);
    tasks.push({
      kind: "lesson",
      title: `Next in sequence: ${next.title}`,
      reason: course
        ? `Next node in ${course.title}. It is unlocked because the prerequisite chain before it has been opened.`
        : "Next node in the curriculum graph.",
      href: `/learn/${next.key}`,
      estimatedMinutes: next.estimatedMinutes,
    });
  }

  const active = await db
    .select({ projectKey: userProjects.projectKey, status: userProjects.status, title: projectCatalog.title })
    .from(userProjects)
    .innerJoin(projectCatalog, eq(projectCatalog.key, userProjects.projectKey))
    .where(and(eq(userProjects.userId, userId), eq(userProjects.status, "in_progress")))
    .limit(1);
  if (active[0]) {
    tasks.push({
      kind: "project",
      title: `Advance project: ${active[0].title}`,
      reason: "An in-progress project is the strongest evidence you can produce; unfinished projects produce none.",
      href: `/projects/${active[0].projectKey}`,
      estimatedMinutes: 60,
    });
  }

  if (state !== "deep") {
    return tasks
      .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)
      .slice(0, STATE_PLAYBOOK[state].taskSize + 1);
  }
  return tasks.slice(0, 5);
}

export type RoleGap = {
  skillKey: string;
  skillTitle: string;
  importance: string;
  note: string;
  level: number;
  independentEvidence: number;
  status: "no_evidence" | "developing" | "competent" | "independently_demonstrated";
};

export async function roleGapAnalysis(userId: number, roleKey: string) {
  const [role] = await db.select().from(careerRoles).where(eq(careerRoles.key, roleKey)).limit(1);
  if (!role) return null;
  const reqs = await db
    .select()
    .from(roleRequirements)
    .where(eq(roleRequirements.roleKey, roleKey));
  const mastery = await db.select().from(masteryRecords).where(eq(masteryRecords.userId, userId));
  const masteryMap = new Map(mastery.map((m) => [m.skillKey, m]));

  const { SKILLS } = await import("@/content/catalog");
  const titles = new Map(SKILLS.map((s) => [s.key, s.title]));

  const gaps: RoleGap[] = reqs.map((r) => {
    const m = masteryMap.get(r.skillKey);
    const level = m?.level ?? 0;
    const independentEvidence = m?.independentEvidence ?? 0;
    const status: RoleGap["status"] =
      level >= 7 && independentEvidence >= 3
        ? "independently_demonstrated"
        : level >= 5
          ? "competent"
          : level >= 2
            ? "developing"
            : "no_evidence";
    return {
      skillKey: r.skillKey,
      skillTitle: titles.get(r.skillKey) ?? r.skillKey,
      importance: r.importance,
      note: r.note,
      level,
      independentEvidence,
      status,
    };
  });

  const hard = gaps.filter((g) => g.importance === "hard");
  const satisfied = hard.filter((g) => g.status === "independently_demonstrated").length;
  return {
    role,
    gaps: gaps.sort((a, b) => a.level - b.level),
    readiness: {
      hardRequirements: hard.length,
      independentlyDemonstrated: satisfied,
      statement:
        hard.length === 0
          ? "No hard requirements recorded for this role snapshot."
          : `${satisfied} of ${hard.length} hard requirements currently have independently demonstrated evidence in this system. This is a readiness rubric, not a prediction about hiring.`,
    },
  };
}

export async function prerequisiteGraph() {
  const rows = await db.select().from(prerequisites);
  const map = new Map<string, string[]>();
  for (const row of rows) {
    map.set(row.courseKey, [...(map.get(row.courseKey) ?? []), row.requiresCourseKey]);
  }
  return map;
}

export async function dueReviewCount(userId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), lte(reviewItems.dueAt, new Date())));
  return row?.count ?? 0;
}

export async function recentAttempts(userId: number, limit = 10) {
  return db
    .select({
      id: attempts.id,
      itemKey: attempts.itemKey,
      lessonKey: attempts.lessonKey,
      outcome: attempts.outcome,
      helpLevel: attempts.helpLevel,
      independent: attempts.independent,
      errorClass: attempts.errorClass,
      createdAt: attempts.createdAt,
      lessonTitle: lessons.title,
    })
    .from(attempts)
    .innerJoin(lessons, eq(lessons.key, attempts.lessonKey))
    .where(eq(attempts.userId, userId))
    .orderBy(desc(attempts.createdAt))
    .limit(limit);
}

/** AI dependency audit (spec §225): assisted vs independent performance. */
export async function dependencyAudit(userId: number) {
  const rows = await db
    .select({ independent: attempts.independent, outcome: attempts.outcome })
    .from(attempts)
    .where(eq(attempts.userId, userId));
  const total = rows.length;
  const independent = rows.filter((r) => r.independent).length;
  const independentPass = rows.filter((r) => r.independent && r.outcome !== "incorrect").length;
  return {
    total,
    independent,
    assisted: total - independent,
    independentPassRate: independent === 0 ? null : independentPass / independent,
  };
}

export async function lessonsForKeys(keys: string[]) {
  if (keys.length === 0) return [];
  return db.select().from(lessons).where(inArray(lessons.key, keys));
}
