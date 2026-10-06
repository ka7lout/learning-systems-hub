"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  assessmentItems,
  englishAttempts,
  freelanceRuns,
  freelanceSimulations,
  laterItems,
  projectEvidence,
  projects,
  reviewItems,
  skillEvidence,
  userCareerTargets,
  userProjects,
  users,
} from "@/db/schema";
import {
  audit,
  createSession,
  destroySession,
  hashPassword,
  rateLimit,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { recordAttemptAndUpdate, recordDelayedPerformance } from "@/lib/learning";

export type ActionResult = { ok: boolean; message?: string };

const email = z.string().email().max(200);
const password = z.string().min(10, "Use at least 10 characters").max(200);

/* ----------------------------- identity ----------------------------- */

export async function signUp(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const parsed = z
    .object({ name: z.string().min(2).max(80), email, password })
    .safeParse({ name: form.get("name"), email: form.get("email"), password: form.get("password") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const normalized = parsed.data.email.toLowerCase();
  if (!rateLimit(`signup:${normalized}`, 5, 60_000)) {
    return { ok: false, message: "Too many attempts. Wait a minute." };
  }
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, normalized)).limit(1);
  if (existing.length > 0) return { ok: false, message: "An account with that email already exists." };

  const inserted = await db
    .insert(users)
    .values({
      email: normalized,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role: "student",
      settings: { englishMode: "standard", theme: "light" },
    })
    .returning({ id: users.id });

  const userId = inserted[0]!.id;
  await createSession(userId);
  await audit(userId, "auth.signup");
  return { ok: true };
}

export async function signIn(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const parsed = z
    .object({ email, password: z.string().min(1).max(200) })
    .safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { ok: false, message: "Invalid email or password." };
  const normalized = parsed.data.email.toLowerCase();
  if (!rateLimit(`signin:${normalized}`, 8, 60_000)) {
    return { ok: false, message: "Too many attempts. Wait a minute." };
  }
  const rows = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await audit(null, "auth.signin_failed", { email: normalized });
    return { ok: false, message: "Invalid email or password." };
  }
  await createSession(user.id);
  await audit(user.id, "auth.signin");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  await destroySession();
  store.delete("ihls_state");
  revalidatePath("/", "layout");
}

/* --------------------------- preferences ---------------------------- */

export async function setLearningState(state: string): Promise<void> {
  const parsed = z.enum(["deep", "drift", "fog", "overload"]).safeParse(state);
  if (!parsed.success) return;
  const store = await cookies();
  store.set("ihls_state", parsed.data, { path: "/", maxAge: 60 * 60 * 12, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function setPreference(key: string, value: string): Promise<void> {
  const allowed: Record<string, string[]> = {
    ihls_theme: ["light", "dark"],
    ihls_motion: ["full", "reduced"],
    ihls_text: ["normal", "large"],
    ihls_density: ["normal", "compact"],
    ihls_english: ["standard", "b1b2", "arabic"],
    ihls_vocab: ["on", "off"],
  };
  if (!allowed[key]?.includes(value)) return;
  const store = await cookies();
  store.set(key, value, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

/* ----------------------------- practice ----------------------------- */

const attemptSchema = z.object({
  itemId: z.string().min(1).max(120),
  response: z.string().min(1, "Write your attempt first").max(8000),
  outcome: z.enum(["missed", "partial", "solid"]),
  helpLevel: z.enum(["none", "hint", "guidance", "concept_reminder", "worked_example", "full_explanation"]),
  errorType: z.enum(["none", "concept", "recall", "selection", "execution", "transfer", "attention", "load"]),
});

export async function submitAttempt(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (!rateLimit(`attempt:${user.id}`, 60, 60_000)) return { ok: false, message: "Slow down a moment." };

  const parsed = attemptSchema.safeParse({
    itemId: form.get("itemId"),
    response: form.get("response"),
    outcome: form.get("outcome"),
    helpLevel: form.get("helpLevel"),
    errorType: form.get("errorType"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid submission" };

  const rows = await db.select().from(assessmentItems).where(eq(assessmentItems.id, parsed.data.itemId)).limit(1);
  const item = rows[0];
  if (!item) return { ok: false, message: "Unknown assessment item." };

  const store = await cookies();
  const learningState = store.get("ihls_state")?.value ?? "deep";

  const result = await recordAttemptAndUpdate({
    userId: user.id,
    itemId: item.id,
    lessonId: item.lessonId,
    response: parsed.data.response,
    outcome: parsed.data.outcome,
    helpLevel: parsed.data.helpLevel,
    errorType: parsed.data.errorType,
    learningState,
    phase: item.phase,
    skills: item.skills,
  });

  await audit(user.id, "practice.attempt", { itemId: item.id, outcome: parsed.data.outcome });
  revalidatePath(`/learn/${item.lessonId}`);
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: `Recorded. Weighted score ${result.score.toFixed(2)} (${result.independent ? "independent" : "assisted"}). Review scheduled.`,
  };
}

export async function gradeReview(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .object({ reviewId: z.coerce.number().int().positive(), outcome: z.enum(["missed", "partial", "solid"]) })
    .safeParse({ reviewId: form.get("reviewId"), outcome: form.get("outcome") });
  if (!parsed.success) return { ok: false, message: "Invalid review grade." };

  const rows = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.id, parsed.data.reviewId), eq(reviewItems.userId, user.id)))
    .limit(1);
  const item = rows[0];
  if (!item) return { ok: false, message: "Review item not found." };

  const { nextInterval } = await import("@/lib/learning");
  const next = nextInterval(item.intervalDays, item.ease, item.lapses, parsed.data.outcome, item.importance);
  await db
    .update(reviewItems)
    .set({
      intervalDays: next.interval,
      ease: next.ease,
      lapses: next.lapses,
      dueAt: new Date(Date.now() + next.interval * 24 * 60 * 60 * 1000),
      lastResult: parsed.data.outcome,
    })
    .where(and(eq(reviewItems.id, item.id), eq(reviewItems.userId, user.id)));

  const ageHours = (Date.now() - new Date(item.createdAt).getTime()) / 3_600_000;
  if (ageHours >= 24) await recordDelayedPerformance(user.id, item.lessonId, parsed.data.outcome);

  revalidatePath("/review");
  revalidatePath("/dashboard");
  return { ok: true, message: `Next retrieval in ${next.interval.toFixed(1)} day(s).` };
}

/* ----------------------------- projects ----------------------------- */

export async function startProject(projectId: string): Promise<void> {
  const user = await requireUser();
  const valid = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).limit(1);
  if (valid.length === 0) return;
  await db
    .insert(userProjects)
    .values({ userId: user.id, projectId, status: "in_progress" })
    .onConflictDoNothing();
  await audit(user.id, "project.start", { projectId });
  revalidatePath("/projects");
}

const projectUpdateSchema = z.object({
  userProjectId: z.coerce.number().int().positive(),
  status: z.enum(["planned", "in_progress", "review", "done"]),
  repoUrl: z.string().url().max(500).or(z.literal("")),
  demoUrl: z.string().url().max(500).or(z.literal("")),
  datasetUrl: z.string().url().max(500).or(z.literal("")),
  notes: z.string().max(5000),
});

export async function updateProject(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = projectUpdateSchema.safeParse({
    userProjectId: form.get("userProjectId"),
    status: form.get("status"),
    repoUrl: form.get("repoUrl") ?? "",
    demoUrl: form.get("demoUrl") ?? "",
    datasetUrl: form.get("datasetUrl") ?? "",
    notes: form.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Links must be full URLs (https://…)." };
  }
  const checks = form.getAll("checks").map(String).slice(0, 40);

  const owned = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.id, parsed.data.userProjectId), eq(userProjects.userId, user.id)))
    .limit(1);
  if (owned.length === 0) return { ok: false, message: "Project not found." };

  const catalog = await db.select().from(projects).where(eq(projects.id, owned[0]!.projectId)).limit(1);
  const dod = catalog[0]?.definitionOfDone ?? [];
  const hasRepo = parsed.data.repoUrl.length > 0;
  const completion = dod.length === 0 ? 0 : checks.length / dod.length;

  // Evidence-driven CV value classification — never a self-declared label.
  let valueClass = "Practice Only";
  if (hasRepo) valueClass = "Skill Evidence";
  if (hasRepo && completion >= 0.5) valueClass = "Technical Artifact";
  if (hasRepo && completion >= 0.8 && parsed.data.status === "done") valueClass = "Portfolio Project";
  if (hasRepo && completion === 1 && parsed.data.demoUrl.length > 0 && parsed.data.status === "done") {
    valueClass = (catalog[0]?.ladderLevel ?? 0) >= 9 ? "Signature Project" : "Professional Evidence";
  }

  await db
    .update(userProjects)
    .set({
      status: parsed.data.status,
      repoUrl: parsed.data.repoUrl || null,
      demoUrl: parsed.data.demoUrl || null,
      datasetUrl: parsed.data.datasetUrl || null,
      notes: parsed.data.notes,
      completedChecks: checks,
      valueClass,
      updatedAt: new Date(),
    })
    .where(and(eq(userProjects.id, parsed.data.userProjectId), eq(userProjects.userId, user.id)));

  if (parsed.data.status === "done" && hasRepo && catalog[0]) {
    for (const skillId of catalog[0].skills) {
      const already = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(skillEvidence)
        .where(
          and(
            eq(skillEvidence.userId, user.id),
            eq(skillEvidence.skillId, skillId),
            eq(skillEvidence.kind, "project"),
            eq(skillEvidence.url, parsed.data.repoUrl),
          ),
        );
      if ((already[0]?.c ?? 0) === 0) {
        await db.insert(skillEvidence).values({
          userId: user.id,
          skillId,
          kind: "project",
          description: `Completed project: ${catalog[0].title}`,
          url: parsed.data.repoUrl,
          independent: true,
          weight: 2,
        });
      }
    }
  }

  await audit(user.id, "project.update", { userProjectId: parsed.data.userProjectId, valueClass });
  revalidatePath("/projects");
  revalidatePath("/portfolio");
  return { ok: true, message: `Saved. Evidence class: ${valueClass}.` };
}

export async function addEvidence(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .object({
      userProjectId: z.coerce.number().int().positive(),
      kind: z.enum(["repository", "commit", "pull_request", "deployment", "report", "demo", "dataset", "test_run"]),
      url: z.string().url().max(500).or(z.literal("")),
      description: z.string().min(5).max(1000),
    })
    .safeParse({
      userProjectId: form.get("userProjectId"),
      kind: form.get("kind"),
      url: form.get("url") ?? "",
      description: form.get("description"),
    });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid evidence." };

  const owned = await db
    .select({ id: userProjects.id })
    .from(userProjects)
    .where(and(eq(userProjects.id, parsed.data.userProjectId), eq(userProjects.userId, user.id)))
    .limit(1);
  if (owned.length === 0) return { ok: false, message: "Project not found." };

  await db.insert(projectEvidence).values({
    userId: user.id,
    userProjectId: parsed.data.userProjectId,
    kind: parsed.data.kind,
    url: parsed.data.url || null,
    description: parsed.data.description,
  });
  await audit(user.id, "project.evidence", { userProjectId: parsed.data.userProjectId, kind: parsed.data.kind });
  revalidatePath("/projects");
  revalidatePath("/portfolio");
  return { ok: true, message: "Evidence recorded." };
}

/* ------------------------- distraction capture ----------------------- */

export async function captureLater(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z.string().min(1).max(300).safeParse(form.get("text"));
  if (!parsed.success) return { ok: false, message: "Write the thought first." };
  await db.insert(laterItems).values({ userId: user.id, text: parsed.data });
  revalidatePath("/dashboard");
  return { ok: true, message: "Parked. Back to the task." };
}

export async function resolveLater(id: number): Promise<void> {
  const user = await requireUser();
  await db
    .update(laterItems)
    .set({ resolved: true })
    .where(and(eq(laterItems.id, id), eq(laterItems.userId, user.id)));
  revalidatePath("/dashboard");
}

/* ------------------------------ english ------------------------------ */

export async function recordEnglishAttempt(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .object({
      dimension: z.enum(["reading", "listening", "writing", "speaking", "interaction", "vocabulary", "professional"]),
      activity: z.string().min(2).max(200),
      prompt: z.string().min(2).max(2000),
      response: z.string().min(10, "Write or transcribe your actual response").max(8000),
      selfRating: z.coerce.number().int().min(1).max(5),
    })
    .safeParse({
      dimension: form.get("dimension"),
      activity: form.get("activity"),
      prompt: form.get("prompt"),
      response: form.get("response"),
      selfRating: form.get("selfRating"),
    });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid submission." };

  await db.insert(englishAttempts).values({ userId: user.id, ...parsed.data });
  if (parsed.data.selfRating >= 4) {
    await db.insert(skillEvidence).values({
      userId: user.id,
      skillId: parsed.data.dimension === "professional" ? "communication" : "technical-english",
      kind: "oral",
      description: `${parsed.data.dimension}: ${parsed.data.activity}`,
      independent: true,
      weight: 1,
    });
  }
  revalidatePath("/english");
  return { ok: true, message: "Recorded against that dimension only — no overall level is inferred." };
}

/* ----------------------------- freelance ----------------------------- */

export async function submitFreelanceRun(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const simulationId = z.string().min(1).max(80).safeParse(form.get("simulationId"));
  const scopeDraft = z.string().min(20, "Write a scope statement").max(6000).safeParse(form.get("scopeDraft"));
  if (!simulationId.success || !scopeDraft.success) {
    return { ok: false, message: scopeDraft.success ? "Invalid simulation." : scopeDraft.error.issues[0]!.message };
  }
  const asked = form.getAll("questions").map(String);
  const sim = await db
    .select()
    .from(freelanceSimulations)
    .where(eq(freelanceSimulations.id, simulationId.data))
    .limit(1);
  if (sim.length === 0) return { ok: false, message: "Simulation not found." };

  const coverage = sim[0]!.requiredQuestions.length === 0 ? 0 : asked.length / sim[0]!.requiredQuestions.length;
  await db.insert(freelanceRuns).values({
    userId: user.id,
    simulationId: simulationId.data,
    questionsAsked: asked,
    scopeDraft: scopeDraft.data,
    coverage,
  });
  revalidatePath("/freelance");
  return {
    ok: true,
    message:
      coverage >= 0.75
        ? `Discovery coverage ${(coverage * 100).toFixed(0)}% — enough to quote responsibly.`
        : `Discovery coverage ${(coverage * 100).toFixed(0)}% — below the 75% threshold. Quoting now would be guessing.`,
  };
}

/* ------------------------------- career ------------------------------ */

export async function toggleCareerTarget(roleId: string): Promise<void> {
  const user = await requireUser();
  const existing = await db
    .select({ id: userCareerTargets.id })
    .from(userCareerTargets)
    .where(and(eq(userCareerTargets.userId, user.id), eq(userCareerTargets.roleId, roleId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(userCareerTargets).where(and(eq(userCareerTargets.id, existing[0]!.id), eq(userCareerTargets.userId, user.id)));
  } else {
    await db.insert(userCareerTargets).values({ userId: user.id, roleId });
  }
  revalidatePath("/career");
}
