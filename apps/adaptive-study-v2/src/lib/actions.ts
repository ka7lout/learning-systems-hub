"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import {
  lessonProgress,
  reviewItems,
  questionAttempts,
  mistakes,
  studySessions,
  distractions,
  scratchpads,
  xpTransactions,
  diagnosticResponses,
  dailyPlans,
  dailyPlanTasks,
  notes,
  lessons,
  concepts,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  getCurrentUser,
  registerUser,
  authenticateUser,
  createSession,
  destroySession,
} from "@/lib/auth";
import { getNextLesson, getReviewQueue } from "@/lib/queries";

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}

async function grantXp(userId: string, eventType: string, sourceId: string | null, amount: number) {
  await db.insert(xpTransactions).values({
    userId,
    eventType,
    sourceId: sourceId ?? undefined,
    amount,
  });
}

// ---------------- AUTH ----------------
export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim() || null;
  if (!email || !password || password.length < 6) {
    redirect("/signup?error=invalid");
  }
  try {
    const user = await registerUser(email, password, name ?? undefined);
    await createSession(user.id);
  } catch {
    redirect("/signup?error=exists");
  }
  redirect("/diagnostic");
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const user = await authenticateUser(email, password);
  if (!user) redirect("/login?error=1");
  await createSession(user.id);
  redirect("/");
}

export async function signOutAction() {
  await destroySession();
  redirect("/login");
}

// ---------------- LESSON PROGRESS ----------------
export async function saveLessonProgressAction(input: {
  lessonId: string;
  masteryLevel: number;
  completed: boolean;
}) {
  const u = await requireUser();
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, u.id), eq(lessonProgress.lessonId, input.lessonId)))
    .limit(1);
  const wasCompleted = existing[0]?.status === "completed";
  const status = input.completed ? "completed" : existing[0] ? existing[0].status : "in_progress";
  if (existing.length) {
    await db
      .update(lessonProgress)
      .set({
        status,
        masteryLevel: input.masteryLevel,
        lastViewed: new Date(),
        completedAt: input.completed ? new Date() : existing[0].completedAt,
      })
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({
      userId: u.id,
      lessonId: input.lessonId,
      status: input.completed ? "completed" : "in_progress",
      masteryLevel: input.masteryLevel,
      lastViewed: new Date(),
      completedAt: input.completed ? new Date() : null,
    });
  }
  // ensure a review item exists for the concept of this lesson
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, input.lessonId)).limit(1);
  if (lesson?.conceptId) {
    const rev = await db
      .select()
      .from(reviewItems)
      .where(and(eq(reviewItems.userId, u.id), eq(reviewItems.conceptId, lesson.conceptId)))
      .limit(1);
    if (!rev.length) {
      // default review interval is an application default, NOT a scientific law
      await db.insert(reviewItems).values({
        userId: u.id,
        conceptId: lesson.conceptId,
        lessonId: lesson.id,
        firstLearned: new Date(),
        nextReview: new Date(Date.now() + 24 * 3600 * 1000), // day 1
      });
    }
  }
  if (input.completed && !wasCompleted) {
    await grantXp(u.id, "concept_mastered", input.lessonId, 150);
  }
  return { ok: true };
}

// ---------------- QUESTION ATTEMPT ----------------
export async function submitAttemptAction(input: {
  questionId: string;
  studentAnswer: string;
  correct: boolean;
  timeMs: number;
  conceptId: string | null;
  mistakeType?: string | null;
}) {
  const u = await requireUser();
  await db.insert(questionAttempts).values({
    userId: u.id,
    questionId: input.questionId,
    correct: input.correct,
    studentAnswer: input.studentAnswer,
    timeMs: input.timeMs,
  });
  if (input.correct) {
    await grantXp(u.id, "practice_problem_completed", input.questionId, 100);
  } else {
    // record / aggregate mistake
    const existing = await db
      .select()
      .from(mistakes)
      .where(and(eq(mistakes.userId, u.id), eq(mistakes.questionId, input.questionId)))
      .limit(1);
    if (existing.length) {
      await db
        .update(mistakes)
        .set({ repeatCount: (existing[0].repeatCount ?? 1) + 1, studentAnswer: input.studentAnswer })
        .where(eq(mistakes.id, existing[0].id));
    } else {
      await db.insert(mistakes).values({
        userId: u.id,
        questionId: input.questionId,
        conceptId: input.conceptId,
        mistakeType: input.mistakeType ?? "conceptual",
        studentAnswer: input.studentAnswer,
        correctAnswer: null,
        explanation: "Recorded from practice attempt.",
      });
    }
    // bump review urgency for the concept
    if (input.conceptId) {
      await db
        .update(reviewItems)
        .set({ errorCount: sql`${reviewItems.errorCount} + 1`, nextReview: new Date() })
        .where(and(eq(reviewItems.userId, u.id), eq(reviewItems.conceptId, input.conceptId)));
    }
  }
  return { ok: true };
}

// ---------------- REVIEW ----------------
export async function completeReviewAction(input: { reviewId: string; score: number }) {
  const u = await requireUser();
  const [rev] = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, u.id), eq(reviewItems.id, input.reviewId)))
    .limit(1);
  if (!rev) return { ok: false };
  // application default intervals (days); adapted by performance
  const intervalDays =
    input.score >= 5 ? 14 : input.score === 4 ? 7 : input.score === 3 ? 3 : input.score === 2 ? 1 : 0;
  const next = new Date(Date.now() + intervalDays * 24 * 3600 * 1000);
  await db
    .update(reviewItems)
    .set({
      lastReviewed: new Date(),
      retrievalScore: String(input.score),
      confidence: Math.max(0, Math.min(7, (rev.confidence ?? 0) + (input.score >= 3 ? 1 : -1))),
      nextReview: next,
    })
    .where(eq(reviewItems.id, rev.id));
  await grantXp(u.id, "retrieval_completed", input.reviewId, 50);
  return { ok: true };
}

// ---------------- STUDY SESSION (FOCUS TIMER) ----------------
export async function startSessionAction(courseId?: string) {
  const u = await requireUser();
  const [s] = await db
    .insert(studySessions)
    .values({ userId: u.id, courseId: courseId ?? undefined, focusBlock: true })
    .returning({ id: studySessions.id });
  return { id: s.id };
}

export async function endSessionAction(input: {
  sessionId: string;
  durationMinutes: number;
  earlyExit: boolean;
  distractionCount: number;
}) {
  const u = await requireUser();
  await db
    .update(studySessions)
    .set({
      endedAt: new Date(),
      durationMinutes: input.durationMinutes,
      earlyExit: input.earlyExit,
      distractionCount: input.distractionCount,
      completedAt: new Date(),
    })
    .where(eq(studySessions.id, input.sessionId));
  await grantXp(u.id, "focus_block_completed", input.sessionId, 50);
  return { ok: true };
}

// ---------------- DISTRACTIONS (PARKING LOT) ----------------
export async function addDistractionAction(text: string, disposition = "save") {
  const u = await requireUser();
  await db.insert(distractions).values({ userId: u.id, text, disposition });
  return { ok: true };
}

// ---------------- SCRATCHPAD ----------------
export async function saveScratchpadAction(input: {
  courseId?: string | null;
  lessonId?: string | null;
  questionId?: string | null;
  data: unknown;
}) {
  const u = await requireUser();
  const key = input.lessonId
    ? eq(scratchpads.lessonId, input.lessonId)
    : input.questionId
      ? eq(scratchpads.questionId, input.questionId)
      : input.courseId
        ? eq(scratchpads.courseId, input.courseId)
        : sql`1=0`;
  const existing = await db
    .select()
    .from(scratchpads)
    .where(and(eq(scratchpads.userId, u.id), key))
    .limit(1);
  if (existing.length) {
    await db
      .update(scratchpads)
      .set({ data: input.data as any, updatedAt: new Date() })
      .where(eq(scratchpads.id, existing[0].id));
  } else {
    await db.insert(scratchpads).values({
      userId: u.id,
      courseId: input.courseId ?? undefined,
      lessonId: input.lessonId ?? undefined,
      questionId: input.questionId ?? undefined,
      data: input.data as any,
    });
  }
  return { ok: true };
}

export async function getScratchpadAction(input: {
  courseId?: string | null;
  lessonId?: string | null;
  questionId?: string | null;
}) {
  const u = await requireUser();
  const key = input.lessonId
    ? eq(scratchpads.lessonId, input.lessonId)
    : input.questionId
      ? eq(scratchpads.questionId, input.questionId)
      : input.courseId
        ? eq(scratchpads.courseId, input.courseId)
        : sql`1=0`;
  const [s] = await db
    .select()
    .from(scratchpads)
    .where(and(eq(scratchpads.userId, u.id), key))
    .limit(1);
  return s?.data ?? null;
}

// ---------------- DIAGNOSTIC ----------------
export async function submitDiagnosticAction(
  responses: { domain: string; question: string; response: string; correct: boolean; score: number }[],
) {
  const u = await requireUser();
  for (const r of responses) {
    await db.insert(diagnosticResponses).values({
      userId: u.id,
      domain: r.domain,
      question: r.question,
      response: r.response,
      correct: r.correct,
      score: r.score,
    });
  }
  return { ok: true };
}

// ---------------- NOTES ----------------
export async function addNoteAction(input: {
  body: string;
  courseId?: string | null;
  lessonId?: string | null;
  conceptId?: string | null;
  type?: string;
}) {
  const u = await requireUser();
  await db.insert(notes).values({
    userId: u.id,
    body: input.body,
    courseId: input.courseId ?? undefined,
    lessonId: input.lessonId ?? undefined,
    conceptId: input.conceptId ?? undefined,
    type: input.type ?? "short",
  });
  return { ok: true };
}

// ---------------- DAILY PLAN ----------------
export async function ensureDailyPlanAction(date: string) {
  const u = await requireUser();
  const existing = await db
    .select()
    .from(dailyPlans)
    .where(and(eq(dailyPlans.userId, u.id), eq(dailyPlans.planDate, date)))
    .limit(1);
  if (existing.length) {
    const tasks = await db
      .select()
      .from(dailyPlanTasks)
      .where(eq(dailyPlanTasks.planId, existing[0].id))
      .orderBy(dailyPlanTasks.position);
    return { plan: existing[0], tasks };
  }
  // build plan from real data
  const tasks: {
    title: string;
    kind: string;
    courseId?: string | null;
    conceptId?: string | null;
    lessonId?: string | null;
    questionId?: string | null;
    durationMinutes?: number;
  }[] = [];

  const due = await getReviewQueue(u.id, 3);
  for (const d of due) {
    const [c] = await db.select().from(concepts).where(eq(concepts.id, d.conceptId!)).limit(1);
    tasks.push({
      title: `Review: ${c?.title ?? "concept"}`,
      kind: "review",
      conceptId: d.conceptId,
      durationMinutes: 5,
    });
  }
  const next = await getNextLesson(u.id);
  if (next) {
    tasks.push({
      title: `Learn: ${next.lesson.title}`,
      kind: "now",
      courseId: next.course.id,
      lessonId: next.lesson.id,
      conceptId: next.lesson.conceptId,
      durationMinutes: 20,
    });
  }
  // up to 2 'after' lessons
  const allLessons = await db
    .select({ lesson: lessons, courseId: lessons.courseId, conceptId: lessons.conceptId })
    .from(lessons)
    .orderBy(lessons.position)
    .limit(20);
  const done = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, u.id), eq(lessonProgress.status, "completed")));
  const doneIds = new Set(done.map((d) => d.lessonId));
  let after = 0;
  for (const l of allLessons) {
    if (after >= 2) break;
    if (doneIds.has(l.lesson.id)) continue;
      if (next && l.lesson.id === next.lesson.id) continue;
    tasks.push({ title: `After: ${l.lesson.title}`, kind: "after", lessonId: l.lesson.id, courseId: l.courseId, durationMinutes: 15 });
    after++;
  }
  tasks.push({ title: "Optional: 5 practice problems", kind: "optional", durationMinutes: 10 });

  const [plan] = await db
    .insert(dailyPlans)
    .values({
      userId: u.id,
      planDate: date,
      confidence: "provisional",
      note: "Plan computed from real curriculum progress and review due dates. Labeled PROVISIONAL until verified against your actual university schedule.",
      isProvisional: true,
    })
    .returning();
  for (let i = 0; i < tasks.length; i++) {
    await db.insert(dailyPlanTasks).values({
      planId: plan.id,
      title: tasks[i].title,
      kind: tasks[i].kind,
      courseId: tasks[i].courseId ?? undefined,
      conceptId: tasks[i].conceptId ?? undefined,
      lessonId: tasks[i].lessonId ?? undefined,
      durationMinutes: tasks[i].durationMinutes,
      position: i,
    });
  }
  const insertedTasks = await db
    .select()
    .from(dailyPlanTasks)
    .where(eq(dailyPlanTasks.planId, plan.id))
    .orderBy(dailyPlanTasks.position);
  return { plan: { ...plan, note: plan.note ?? "" }, tasks: insertedTasks };
}
