"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  settings,
  lessonProgress,
  recallSubmissions,
  masteryEvidence,
  reviewItems,
  userProjects,
  projectEvidence,
  mentorMessages,
  laterItems,
} from "@/db/schema";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  requireUser,
} from "@/lib/auth";
import { scheduleNext } from "@/lib/scheduler";
import { getLesson, getModule, topicKey } from "@/content/curriculum";
import { getProject } from "@/content/projects";
import { askMentor } from "@/lib/ai";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface FormState {
  error?: string;
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (name.length < 2) return { error: "Please enter your name (at least 2 characters)." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning();
  await db.insert(settings).values({ userId: user.id }).onConflictDoNothing();
  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Learning engine
// ---------------------------------------------------------------------------

export async function markContentSeen(moduleSlug: string, lessonSlug: string): Promise<void> {
  const user = await requireUser();
  if (!getLesson(moduleSlug, lessonSlug)) return;
  await db
    .insert(lessonProgress)
    .values({ userId: user.id, lessonSlug, moduleSlug, contentSeenAt: new Date() })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonSlug],
      set: { contentSeenAt: sql`coalesce(${lessonProgress.contentSeenAt}, now())`, updatedAt: new Date() },
    });
  revalidatePath(`/learn/${moduleSlug}/${lessonSlug}`);
}

/**
 * Mastery checkpoint: free recall or transfer submission with honest self-grade.
 * On first practice completion, seeds the spaced-review queue with the lesson's topics.
 */
export async function submitCheckpoint(formData: FormData): Promise<void> {
  const user = await requireUser();
  const moduleSlug = String(formData.get("moduleSlug") ?? "");
  const lessonSlug = String(formData.get("lessonSlug") ?? "");
  const kind = String(formData.get("kind") ?? "recall");
  const prompt = String(formData.get("prompt") ?? "").slice(0, 2000);
  const answer = String(formData.get("answer") ?? "").trim().slice(0, 20000);
  const selfGrade = Math.max(0, Math.min(5, Number(formData.get("selfGrade") ?? 0)));
  const found = getLesson(moduleSlug, lessonSlug);
  if (!found || !answer || !["recall", "transfer", "case"].includes(kind)) return;

  await db.insert(recallSubmissions).values({
    userId: user.id,
    lessonSlug,
    kind,
    prompt,
    answer,
    selfGrade,
  });

  const now = new Date();
  const progressSet =
    kind === "recall"
      ? { practiceCompletedAt: now, updatedAt: now }
      : { transferCompletedAt: now, updatedAt: now };
  await db
    .insert(lessonProgress)
    .values({
      userId: user.id,
      lessonSlug,
      moduleSlug,
      contentSeenAt: now,
      ...(kind === "recall" ? { practiceCompletedAt: now } : { transferCompletedAt: now }),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonSlug],
      set: progressSet,
    });

  // Seed review queue (idempotent per topic).
  if (kind === "recall") {
    const values = found.lesson.topics.map((t) => ({
      userId: user.id,
      topicKey: topicKey(lessonSlug, t.slug),
      topicName: t.name,
      lessonSlug,
      moduleSlug,
      dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    }));
    if (values.length > 0) {
      await db.insert(reviewItems).values(values).onConflictDoNothing();
    }
  }

  // Record mastery evidence: recall → L2–L3, transfer/case → L4–L6, scaled by honest self-grade.
  if (selfGrade >= 3) {
    const level = kind === "recall" ? (selfGrade >= 5 ? 3 : 2) : selfGrade >= 5 ? 6 : selfGrade >= 4 ? 5 : 4;
    const evidenceRows = found.lesson.skills.map((skillSlug) => ({
      userId: user.id,
      skillSlug,
      level,
      evidenceType: kind === "recall" ? "recall" : "transfer",
      assisted: false,
      lessonSlug,
      note: `${kind} checkpoint in "${found.lesson.title}" (self-grade ${selfGrade}/5)`,
    }));
    if (evidenceRows.length > 0) await db.insert(masteryEvidence).values(evidenceRows);
  }

  revalidatePath(`/learn/${moduleSlug}/${lessonSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/review");
  revalidatePath("/skills");
}

export async function gradeReviewAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const grade = Math.max(0, Math.min(5, Number(formData.get("grade") ?? 0)));
  if (!id) return;
  const rows = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.id, id), eq(reviewItems.userId, user.id)))
    .limit(1);
  const item = rows[0];
  if (!item) return; // ownership enforced
  const next = scheduleNext(
    { intervalDays: item.intervalDays, ease: item.ease, reps: item.reps, lapses: item.lapses },
    grade
  );
  await db
    .update(reviewItems)
    .set({
      intervalDays: next.intervalDays,
      ease: next.ease,
      reps: next.reps,
      lapses: next.lapses,
      dueAt: next.dueAt,
      lastGrade: next.lastGrade,
      lastReviewedAt: new Date(),
    })
    .where(and(eq(reviewItems.id, id), eq(reviewItems.userId, user.id)));
  revalidatePath("/review");
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Distraction capture — Later list
// ---------------------------------------------------------------------------

export async function addLaterAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim().slice(0, 500);
  if (!text) return;
  await db.insert(laterItems).values({ userId: user.id, text });
  revalidatePath("/dashboard");
}

export async function toggleLaterAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const rows = await db
    .select()
    .from(laterItems)
    .where(and(eq(laterItems.id, id), eq(laterItems.userId, user.id)))
    .limit(1);
  if (!rows[0]) return;
  await db
    .update(laterItems)
    .set({ done: !rows[0].done })
    .where(and(eq(laterItems.id, id), eq(laterItems.userId, user.id)));
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function startProjectAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const projectSlug = String(formData.get("projectSlug") ?? "");
  if (!getProject(projectSlug)) return;
  await db
    .insert(userProjects)
    .values({ userId: user.id, projectSlug, status: "active" })
    .onConflictDoNothing();
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectSlug}`);
}

export async function updateProjectAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const projectSlug = String(formData.get("projectSlug") ?? "");
  const status = String(formData.get("status") ?? "active");
  const repoUrl = String(formData.get("repoUrl") ?? "").trim().slice(0, 500);
  const demoUrl = String(formData.get("demoUrl") ?? "").trim().slice(0, 500);
  const datasetSource = String(formData.get("datasetSource") ?? "").trim().slice(0, 2000);
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 10000);
  if (!["planned", "active", "submitted", "complete"].includes(status)) return;
  const spec = getProject(projectSlug);
  if (!spec) return;

  const urlOk = (u: string) => u === "" || /^https:\/\/[^\s]+$/.test(u);
  if (!urlOk(repoUrl) || !urlOk(demoUrl)) return;

  // Completion gate: a project cannot be marked complete without a repository
  // and documented data provenance (no fake success states).
  const effectiveStatus =
    status === "complete" && (!repoUrl || !datasetSource) ? "submitted" : status;

  const [row] = await db
    .update(userProjects)
    .set({
      status: effectiveStatus,
      repoUrl: repoUrl || null,
      demoUrl: demoUrl || null,
      datasetSource: datasetSource || null,
      notes: notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(userProjects.userId, user.id), eq(userProjects.projectSlug, projectSlug)))
    .returning();

  // Project-level mastery evidence (L8 "can build something with it") only on real completion.
  if (row && effectiveStatus === "complete") {
    const evidenceRows = spec.skills.map((skillSlug) => ({
      userId: user.id,
      skillSlug,
      level: 8,
      evidenceType: "project",
      assisted: false,
      projectId: row.id,
      note: `Completed project "${spec.title}" with repository + data provenance`,
    }));
    await db.insert(masteryEvidence).values(evidenceRows);
  }

  revalidatePath(`/projects/${projectSlug}`);
  revalidatePath("/projects");
  revalidatePath("/skills");
  revalidatePath("/career");
}

export async function addEvidenceAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const projectSlug = String(formData.get("projectSlug") ?? "");
  const kind = String(formData.get("kind") ?? "other");
  const url = String(formData.get("url") ?? "").trim().slice(0, 500);
  const description = String(formData.get("description") ?? "").trim().slice(0, 2000);
  if (!description) return;
  if (url && !/^https:\/\/[^\s]+$/.test(url)) return;
  if (!["repo", "commit", "report", "deployment", "metric", "demo", "other"].includes(kind)) return;

  const rows = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.userId, user.id), eq(userProjects.projectSlug, projectSlug)))
    .limit(1);
  const project = rows[0];
  if (!project) return;

  await db.insert(projectEvidence).values({
    userId: user.id,
    userProjectId: project.id,
    kind,
    url: url || null,
    description,
  });
  revalidatePath(`/projects/${projectSlug}`);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function updateSettingsAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const englishMode = String(formData.get("englishMode") ?? "standard");
  const learningState = String(formData.get("learningState") ?? "deep");
  const targetRole = String(formData.get("targetRole") ?? "nuwave-production-ai-engineer");
  const vocabAssist = formData.get("vocabAssist") === "on";
  if (!["standard", "b1b2"].includes(englishMode)) return;
  if (!["deep", "drift", "fog", "overload"].includes(learningState)) return;
  await db
    .insert(settings)
    .values({ userId: user.id, englishMode, learningState, targetRole, vocabAssist })
    .onConflictDoUpdate({
      target: settings.userId,
      set: { englishMode, learningState, targetRole, vocabAssist, updatedAt: new Date() },
    });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function setLearningStateAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const learningState = String(formData.get("learningState") ?? "deep");
  if (!["deep", "drift", "fog", "overload"].includes(learningState)) return;
  await db
    .insert(settings)
    .values({ userId: user.id, learningState })
    .onConflictDoUpdate({
      target: settings.userId,
      set: { learningState, updatedAt: new Date() },
    });
  const path = String(formData.get("path") ?? "/dashboard");
  revalidatePath(path.startsWith("/") ? path : "/dashboard");
}

// ---------------------------------------------------------------------------
// AI Mentor
// ---------------------------------------------------------------------------

export async function sendMentorMessageAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
  const lessonSlug = String(formData.get("lessonSlug") ?? "") || undefined;
  const moduleSlug = String(formData.get("moduleSlug") ?? "") || undefined;
  if (!message) return;

  // Basic per-user rate limit: max 30 mentor messages per hour.
  const recent = await db
    .select({ count: sql<number>`count(*)` })
    .from(mentorMessages)
    .where(
      and(
        eq(mentorMessages.userId, user.id),
        eq(mentorMessages.role, "user"),
        sql`${mentorMessages.createdAt} > now() - interval '1 hour'`
      )
    );
  if (Number(recent[0]?.count ?? 0) >= 30) {
    await db.insert(mentorMessages).values({
      userId: user.id,
      role: "system",
      content:
        "Rate limit reached (30 mentor messages/hour). This pause is also a learning guardrail: work from your notebook and attempt the task independently, then return.",
      provider: "guardrail",
    });
    revalidatePath("/mentor");
    return;
  }

  const history = await db
    .select({ role: mentorMessages.role, content: mentorMessages.content })
    .from(mentorMessages)
    .where(and(eq(mentorMessages.userId, user.id), sql`${mentorMessages.role} != 'system'`))
    .orderBy(sql`${mentorMessages.createdAt} desc`)
    .limit(10);

  await db.insert(mentorMessages).values({
    userId: user.id,
    role: "user",
    content: message,
    lessonSlug: lessonSlug ?? null,
  });

  const { getUserSettings } = await import("@/lib/auth");
  const userSettings = await getUserSettings(user.id);

  const result = await askMentor(
    history
      .reverse()
      .map((m) => ({ role: m.role === "mentor" ? ("mentor" as const) : ("user" as const), content: m.content })),
    message,
    {
      lessonSlug,
      moduleSlug,
      learningState: userSettings?.learningState ?? "deep",
      englishMode: userSettings?.englishMode ?? "standard",
      studentName: user.name,
    }
  );

  await db.insert(mentorMessages).values({
    userId: user.id,
    role: "mentor",
    content: result.content,
    lessonSlug: lessonSlug ?? null,
    provider: result.provider,
  });

  revalidatePath("/mentor");
  if (moduleSlug && lessonSlug) revalidatePath(`/learn/${moduleSlug}/${lessonSlug}`);
}
