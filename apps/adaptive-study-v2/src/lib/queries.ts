// Centralized data-access layer. Every dashboard metric derives from a real
// query against the database. There are NO hardcoded stats anywhere.
import { db } from "@/db";
import {
  users,
  courses,
  modules,
  topics,
  concepts,
  prerequisites,
  lessons,
  lessonProgress,
  assessments,
  questions,
  questionAttempts,
  mistakes,
  reviewItems,
  studySessions,
  dailyPlans,
  dailyPlanTasks,
  notes,
  distractions,
  scratchpads,
  xpTransactions,
  achievements,
  diagnosticResponses,
  sourceInventory,
} from "@/db/schema";
import { eq, and, desc, sql, gte, lte, isNull, count, sum, inArray } from "drizzle-orm";

// ------- generic safe wrapper (empty vs error are distinct) ----------------
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function safe<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown database error" };
  }
}

// ------- XP / level / streak ----------------
export async function getXpTotal(userId: string): Promise<number> {
  const [r] = await db
    .select({ total: sum(xpTransactions.amount) })
    .from(xpTransactions)
    .where(eq(xpTransactions.userId, userId));
  return Number(r?.total ?? 0);
}

export function levelForXp(xp: number): { level: number; next: number } {
  // Configurable & simple: each level needs 500 XP more than the last is overkill;
  // use a gentle curve: level = floor(sqrt(xp/250)) + 1.
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 250)) + 1);
  const xpForLevel = (l: number) => Math.pow(l - 1, 2) * 250;
  const next = xpForLevel(level + 1);
  return { level, next };
}

export async function getStreak(userId: string): Promise<number> {
  const rows = await db
    .select({ d: sql<string>`date_trunc('day', ${studySessions.startedAt})::date` })
    .from(studySessions)
    .where(eq(studySessions.userId, userId));
  const days = new Set(rows.map((r) => r.d));
  let streak = 0;
  const cursor = new Date();
  // if today has no session yet, start counting from yesterday
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type UserStats = {
  xp: number;
  level: number;
  nextLevelXp: number;
  streak: number;
  completedLessons: number;
  studyMinutes: number;
  reviewDue: number;
  mistakes: number;
  attempts: number;
  conceptsStudied: number;
};

export async function getUserStats(userId: string): Promise<UserStats> {
  const xp = await getXpTotal(userId);
  const { level, next } = levelForXp(xp);
  const [completed] = await db
    .select({ c: count() })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed")));
  const [minutes] = await db
    .select({ s: sum(studySessions.durationMinutes) })
    .from(studySessions)
    .where(eq(studySessions.userId, userId));
  const [review] = await db
    .select({ c: count() })
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), lte(reviewItems.nextReview, new Date())));
  const [mk] = await db
    .select({ c: count() })
    .from(mistakes)
    .where(eq(mistakes.userId, userId));
  const [att] = await db
    .select({ c: count() })
    .from(questionAttempts)
    .where(eq(questionAttempts.userId, userId));
  const [concepts] = await db
    .select({ c: count() })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed")));
  return {
    xp,
    level,
    nextLevelXp: next,
    streak: await getStreak(userId),
    completedLessons: Number(completed?.c ?? 0),
    studyMinutes: Number(minutes?.s ?? 0),
    reviewDue: Number(review?.c ?? 0),
    mistakes: Number(mk?.c ?? 0),
    attempts: Number(att?.c ?? 0),
    conceptsStudied: Number(concepts?.c ?? 0),
  };
}

// ------- curriculum ----------------
export async function getCourses() {
  return db.select().from(courses).orderBy(courses.position);
}

export async function getCourse(courseId: string) {
  const [c] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return c ?? null;
}

export async function getCourseConcepts(courseId: string) {
  return db
    .select()
    .from(concepts)
    .where(eq(concepts.courseId, courseId))
    .orderBy(concepts.position);
}

export async function getCourseLessons(courseId: string) {
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(lessons.position);
}

export async function getCourseAssessments(courseId: string) {
  return db.select().from(assessments).where(eq(assessments.courseId, courseId));
}

// ------- lessons ----------------
export async function getLesson(lessonId: string) {
  const [l] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return l ?? null;
}

export async function getLessonProgress(userId: string, lessonId: string) {
  const [p] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);
  return p ?? null;
}

export async function getUserLessonProgressMap(userId: string) {
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId, status: lessonProgress.status, mastery: lessonProgress.masteryLevel })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
  const map: Record<string, { status: string; mastery: number }> = {};
  for (const r of rows) map[r.lessonId] = { status: r.status, mastery: r.mastery ?? 0 };
  return map;
}

export async function getNextLesson(userId: string): Promise<{
  lesson: typeof lessons.$inferSelect;
  course: typeof courses.$inferSelect;
} | null> {
  // completed lesson ids for this user
  const done = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed")));
  const doneIds = done.map((d) => d.lessonId);
  const rows = await db
    .select({ lesson: lessons, course: courses })
    .from(lessons)
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .orderBy(courses.position, lessons.position)
    .limit(50);
  const next = doneIds.length ? rows.find((r) => !doneIds.includes(r.lesson.id)) : rows[0];
  return next ?? null;
}

// ------- review queue ----------------
export async function getReviewQueue(userId: string, limit = 6) {
  return db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), lte(reviewItems.nextReview, new Date())))
    .orderBy(reviewItems.nextReview)
    .limit(limit);
}

export async function getConceptTitle(conceptId: string | null) {
  if (!conceptId) return null;
  const [c] = await db.select().from(concepts).where(eq(concepts.id, conceptId)).limit(1);
  return c?.title ?? null;
}

// ------- practice ----------------
export async function getQuestions(opts: { courseId?: string; difficulty?: string; limit?: number } = {}) {
  const where = [];
  if (opts.courseId) where.push(eq(questions.courseId, opts.courseId));
  if (opts.difficulty) where.push(eq(questions.difficulty, opts.difficulty));
  return db
    .select()
    .from(questions)
    .where(where.length ? and(...where) : undefined)
    .orderBy(sql`random()`)
    .limit(opts.limit ?? 10);
}

export async function getQuestion(questionId: string) {
  const [q] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  return q ?? null;
}

// ------- mistakes ----------------
export async function getMistakes(userId: string) {
  return db.select().from(mistakes).where(eq(mistakes.userId, userId)).orderBy(desc(mistakes.createdAt));
}

export async function getWeakConcepts(userId: string) {
  // weak = concepts with mistakes or low review confidence, ordered by error count
  const rows = await db
    .select({
      conceptId: mistakes.conceptId,
      errors: count(),
    })
    .from(mistakes)
    .where(and(eq(mistakes.userId, userId), sql`${mistakes.conceptId} is not null`))
    .groupBy(mistakes.conceptId)
    .orderBy(desc(count()));
  const titles = await Promise.all(
    rows.map(async (r) => ({ ...r, title: await getConceptTitle(r.conceptId) })),
  );
  return titles.filter((t) => t.conceptId && t.title);
}

// ------- study sessions ----------------
export async function getStudySessions(userId: string, limitN = 20) {
  return db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(desc(studySessions.startedAt))
    .limit(limitN);
}

// ------- diagnostic ----------------
export async function getDiagnosticDone(userId: string): Promise<boolean> {
  const [r] = await db
    .select({ c: count() })
    .from(diagnosticResponses)
    .where(eq(diagnosticResponses.userId, userId));
  return Number(r?.c ?? 0) > 0;
}

// ------- daily plan ----------------
export async function getDailyPlan(userId: string, date: string) {
  const [plan] = await db
    .select()
    .from(dailyPlans)
    .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.planDate, date)))
    .orderBy(desc(dailyPlans.generatedAt))
    .limit(1);
  if (!plan) return null;
  const tasks = await db
    .select()
    .from(dailyPlanTasks)
    .where(eq(dailyPlanTasks.planId, plan.id))
    .orderBy(dailyPlanTasks.position);
  return { plan, tasks };
}

// ------- NEXT TASK (the heart of the system) ----------------
export type NextTask =
  | { type: "diagnostic"; title: string; subtitle: string }
  | { type: "review"; title: string; subtitle: string; reviewId: string; concept: string | null }
  | { type: "lesson"; title: string; subtitle: string; lessonId: string; courseCode: string; courseTitle: string }
  | { type: "practice"; title: string; subtitle: string }
  | { type: "none"; title: string; subtitle: string };

export async function getNextTask(userId: string): Promise<NextTask> {
  const diagDone = await getDiagnosticDone(userId);
  if (!diagDone) {
    return {
      type: "diagnostic",
      title: "Find your starting point",
      subtitle: "Complete the 20–30 minute diagnostic so the system can route you correctly.",
    };
  }
  const due = await getReviewQueue(userId, 1);
  if (due.length) {
    const c = await getConceptTitle(due[0].conceptId);
    return {
      type: "review",
      title: `Review: ${c ?? "a concept"}`,
      subtitle: "A scheduled review is due now.",
      reviewId: due[0].id,
      concept: c,
    };
  }
  const next = await getNextLesson(userId);
  if (next) {
    return {
      type: "lesson",
      title: next.lesson.title,
      subtitle: `${next.course.code} — ${next.course.title}`,
      lessonId: next.lesson.id,
      courseCode: next.course.code,
      courseTitle: next.course.title,
    };
  }
  // nothing scheduled
  return {
    type: "none",
    title: "No tasks scheduled right now",
    subtitle:
      "There are no due reviews and no unfinished lessons in the seeded curriculum. You can review weak concepts or start a course.",
  };
}

// ------- source inventory / data health (truthful) ----------------
export async function getSourceInventoryStats() {
  const [files] = await db.select({ c: count() }).from(sourceInventory);
  const byStatus = await db
    .select({ status: sourceInventory.status, c: count() })
    .from(sourceInventory)
    .groupBy(sourceInventory.status);
  return { total: Number(files?.c ?? 0), byStatus };
}

export async function getDbCounts() {
  const tables: [string, any][] = [
    ["users", users],
    ["courses", courses],
    ["modules", modules],
    ["topics", topics],
    ["concepts", concepts],
    ["lessons", lessons],
    ["assessments", assessments],
    ["questions", questions],
    ["studySessions", studySessions],
    ["questionAttempts", questionAttempts],
    ["mistakes", mistakes],
    ["reviewItems", reviewItems],
    ["xpTransactions", xpTransactions],
    ["sourceInventory", sourceInventory],
    ["diagnosticResponses", diagnosticResponses],
  ];
  const out: Record<string, number> = {};
  for (const [name, tbl] of tables) {
    const [r] = await db.select({ c: count() }).from(tbl);
    out[name] = Number(r?.c ?? 0);
  }
  return out;
}

export async function getAssessmentsAll() {
  return db.select().from(assessments).orderBy(assessments.courseId);
}

export async function getXpByDay(userId: string, days = 14) {
  const rows = await db
    .select({
      d: sql<string>`date_trunc('day', ${xpTransactions.createdAt})::date`,
      xp: sum(xpTransactions.amount),
    })
    .from(xpTransactions)
    .where(eq(xpTransactions.userId, userId))
    .groupBy(sql`date_trunc('day', ${xpTransactions.createdAt})::date`);
  return rows.map((r) => ({ d: String(r.d), xp: Number(r.xp ?? 0) }));
}

export async function getAttemptBreakdown(userId: string) {
  const rows = await db
    .select({ correct: questionAttempts.correct, c: count() })
    .from(questionAttempts)
    .where(eq(questionAttempts.userId, userId))
    .groupBy(questionAttempts.correct);
  const out = { correct: 0, incorrect: 0 };
  for (const r of rows) {
    if (r.correct) out.correct = Number(r.c);
    else out.incorrect = Number(r.c);
  }
  return out;
}
