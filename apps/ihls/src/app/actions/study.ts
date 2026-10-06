"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { action, type ActionResult } from "@/lib/api";
import {
  getSettings,
  newId,
  owned,
  recordEvent,
  type ErrorEntryDoc,
  type EvidenceDoc,
  type LaterItemDoc,
  type NoteDoc,
  type ProjectSubmissionDoc,
  type SettingsDoc,
  type SpeakingAttemptDoc,
  type SubmissionDoc,
  type TaskDoc,
} from "@/lib/dal";
import { buildCurriculumGraph } from "@/content";
import { HELP_LEVELS } from "@/content/learning-science";
import { computeSkillMastery, markContentSeen, persistMastery } from "@/lib/engines/mastery";
import { upsertReviewItem } from "@/lib/engines/review";
import { suggestNextTasks } from "@/lib/engines/tasks";

const graph = () => buildCurriculumGraph();

/* ------------------------------------------------------------------ lessons */

export async function openLessonAction(input: { lessonId: string }): Promise<ActionResult<{ skillsMarked: number }>> {
  return action(
    { name: "lesson.open", schema: z.object({ lessonId: z.string().min(1).max(64) }), limit: { limit: 240, windowMs: 60_000 } },
    input,
    async (session, { lessonId }) => {
      const lesson = graph().lessons.find((l) => l.id === lessonId);
      if (!lesson) throw new Error("not_found");
      await markContentSeen(session, lesson.skills);
      await recordEvent(session, "lesson_opened", { title: lesson.title }, lesson.id);
      return { skillsMarked: lesson.skills.length };
    },
  );
}

/* -------------------------------------------------------------- assessments */

const attemptSchema = z.object({
  assessmentId: z.string().min(1).max(64),
  answer: z.string().min(1, "Write your answer before submitting.").max(20_000),
  helpLevel: z.enum(HELP_LEVELS as unknown as [string, ...string[]]),
  selfRating: z.coerce.number().int().min(1).max(5).optional(),
  durationSeconds: z.coerce.number().int().min(0).max(86_400).optional(),
});

export type AttemptOutcome = {
  submissionId: string;
  evaluation: "auto" | "mentor" | "self";
  correct: boolean | null;
  feedback: string;
  rubric: string[];
  nextReviewAt?: string;
};

/**
 * Records an attempt. Auto-graded items are checked deterministically against the
 * stored answer key; everything else is stored with `correct: null` until the
 * student self-assesses against the rubric or a mentor review happens (§216).
 */
export async function submitAttemptAction(input: unknown): Promise<ActionResult<AttemptOutcome>> {
  return action(
    { name: "assessment.attempt", schema: attemptSchema, limit: { limit: 60, windowMs: 60_000 } },
    input,
    async (session, data) => {
      const g = graph();
      const assessment = g.assessments.find((a) => a.id === data.assessmentId);
      if (!assessment) throw new Error("not_found");
      const lesson = g.lessons.find((l) => l.id === assessment.lessonId);

      let correct: boolean | null = null;
      let feedback = "";
      let feedbackSource: SubmissionDoc["feedbackSource"] = undefined;

      const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
      const autoChoice = assessment.evaluation === "auto" && assessment.choices && assessment.correctChoiceIndex !== undefined;
      const autoNumeric = assessment.evaluation === "auto" && assessment.numericAnswer !== undefined;

      if (autoChoice) {
        const choices = assessment.choices!;
        const byText = choices.findIndex((c) => normalise(c) === normalise(data.answer));
        const byIndex = /^\d+$/.test(data.answer.trim()) ? Number(data.answer.trim()) : -1;
        const chosen = byText >= 0 ? byText : byIndex;
        correct = chosen === assessment.correctChoiceIndex;
        feedback = correct
          ? "Correct choice. Now say in one sentence why the other options fail."
          : "That is not the expected choice. Re-read the prompt, then explain why your option fails.";
        feedbackSource = "deterministic";
      } else if (autoNumeric) {
        const value = Number(data.answer.replace(/[^0-9eE+.-]/g, ""));
        const tolerance = assessment.numericTolerance ?? 0;
        correct = Number.isFinite(value) && Math.abs(value - assessment.numericAnswer!) <= tolerance;
        feedback = correct
          ? `Within the accepted tolerance of ±${tolerance}.`
          : `Outside the accepted tolerance of ±${tolerance}. Check your units, rounding and the formula you used.`;
        feedbackSource = "deterministic";
      } else if (data.selfRating !== undefined) {
        correct = data.selfRating >= 4;
        feedback = "Recorded as your own judgement against the rubric. Ask the mentor for a check if you are unsure.";
        feedbackSource = "self";
      } else {
        feedback = "Stored without a judgement. Compare your answer with the rubric, or ask the mentor to check it.";
      }

      const submission = await owned<SubmissionDoc>(session, "submissions").insert({
        _id: newId("sub"),
        assessmentId: assessment.id,
        lessonId: assessment.lessonId,
        skillIds: assessment.skillIds,
        tier: assessment.tier,
        answer: data.answer,
        helpLevel: data.helpLevel as SubmissionDoc["helpLevel"],
        evaluation: assessment.evaluation,
        correct,
        selfRating: data.selfRating as SubmissionDoc["selfRating"],
        feedback,
        feedbackSource,
        durationSeconds: data.durationSeconds,
      });

      let nextReviewAt: string | undefined;
      if (correct !== null) {
        const item = await upsertReviewItem(
          session,
          assessment,
          lesson?.importance ?? "CORE",
          correct,
          data.helpLevel !== "No Help",
        );
        nextReviewAt = item.dueAt;
        const mastery = await computeSkillMastery(session, assessment.skillIds);
        await persistMastery(session, mastery);
      }

      await recordEvent(session, "attempt", { assessmentId: assessment.id, correct, helpLevel: data.helpLevel }, assessment.lessonId);
      revalidatePath("/dashboard");
      revalidatePath("/skills");
      return { submissionId: submission._id, evaluation: assessment.evaluation, correct, feedback, rubric: assessment.rubric, nextReviewAt };
    },
  );
}

/* ------------------------------------------------------------------- review */

export async function gradeReviewAction(input: unknown): Promise<ActionResult<{ dueAt: string }>> {
  return action(
    {
      name: "review.grade",
      schema: z.object({ assessmentId: z.string().min(1).max(64), passed: z.coerce.boolean(), helpUsed: z.coerce.boolean().default(false) }),
      limit: { limit: 120, windowMs: 60_000 },
    },
    input,
    async (session, data) => {
      const g = graph();
      const assessment = g.assessments.find((a) => a.id === data.assessmentId);
      if (!assessment) throw new Error("not_found");
      const lesson = g.lessons.find((l) => l.id === assessment.lessonId);
      const item = await upsertReviewItem(session, assessment, lesson?.importance ?? "CORE", data.passed, data.helpUsed);
      await recordEvent(session, "review", { assessmentId: assessment.id, passed: data.passed }, assessment.lessonId);
      revalidatePath("/review");
      return { dueAt: item.dueAt };
    },
  );
}

/* -------------------------------------------------------------------- tasks */

export async function refreshTasksAction(): Promise<ActionResult<{ created: number }>> {
  return action({ name: "tasks.refresh", schema: z.object({}), limit: { limit: 20, windowMs: 60_000 } }, {}, async (session) => {
    const settings = await getSettings(session);
    const store = owned<TaskDoc>(session, "tasks");
    const suggestions = await suggestNextTasks(session, {
      learningState: settings.learningState,
      careerTargets: settings.careerTargets,
    });
    const open = await store.find({ state: "suggested" });
    const existing = new Set(open.map((t) => `${t.targetKind}:${t.targetId}`));
    let created = 0;
    for (const s of suggestions) {
      if (existing.has(`${s.targetKind}:${s.targetId}`)) continue;
      await store.insert({
        _id: newId("tsk"),
        title: s.title,
        description: s.description,
        reasonKind: s.reasonKind,
        reasonText: s.reasonText,
        targetKind: s.targetKind,
        targetId: s.targetId,
        estimatedMinutes: s.estimatedMinutes,
        state: "suggested",
      });
      created += 1;
    }
    revalidatePath("/dashboard");
    return { created };
  });
}

export async function setTaskStateAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      name: "tasks.setState",
      schema: z.object({ taskId: z.string().min(1).max(64), state: z.enum(["suggested", "active", "done", "dismissed"]) }),
      limit: { limit: 120, windowMs: 60_000 },
    },
    input,
    async (session, data) => {
      const store = owned<TaskDoc>(session, "tasks");
      const task = await store.findOne({ _id: data.taskId });
      if (!task) throw new Error("not_found");
      await store.update({ _id: data.taskId }, { state: data.state, completedAt: data.state === "done" ? new Date().toISOString() : undefined });
      if (data.state === "done") await recordEvent(session, "task_done", { title: task.title });
      revalidatePath("/dashboard");
      return { id: data.taskId };
    },
  );
}

/* ------------------------------------------------------- state and capture */

export async function setLearningStateAction(input: unknown): Promise<ActionResult<{ state: string }>> {
  return action(
    { name: "state.set", schema: z.object({ state: z.enum(["deep", "drift", "fog", "overload"]) }), limit: { limit: 60, windowMs: 60_000 } },
    input,
    async (session, data) => {
      const settings = await getSettings(session);
      await owned<SettingsDoc>(session, "settings").update({ _id: settings._id }, { learningState: data.state });
      await recordEvent(session, "state_set", { state: data.state });
      revalidatePath("/dashboard");
      return { state: data.state };
    },
  );
}

export async function captureLaterAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    { name: "later.capture", schema: z.object({ text: z.string().min(1).max(500) }), limit: { limit: 60, windowMs: 60_000 } },
    input,
    async (session, data) => {
      const doc = await owned<LaterItemDoc>(session, "later_items").insert({ _id: newId("ltr"), text: data.text, handled: false });
      await recordEvent(session, "distraction_captured", {});
      return { id: doc._id };
    },
  );
}

export async function resolveLaterAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    { name: "later.resolve", schema: z.object({ id: z.string().min(1).max(64) }), limit: { limit: 60, windowMs: 60_000 } },
    input,
    async (session, data) => {
      await owned<LaterItemDoc>(session, "later_items").update({ _id: data.id }, { handled: true });
      revalidatePath("/dashboard");
      return { id: data.id };
    },
  );
}

/* -------------------------------------------------------------------- notes */

export async function saveNoteAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      name: "note.save",
      schema: z.object({
        lessonId: z.string().min(1).max(64),
        kind: z.enum(["must_write", "recommended", "free"]),
        content: z.string().min(1).max(20_000),
      }),
      limit: { limit: 120, windowMs: 60_000 },
    },
    input,
    async (session, data) => {
      const store = owned<NoteDoc>(session, "notes");
      const existing = await store.findOne({ lessonId: data.lessonId, kind: data.kind });
      if (existing) {
        await store.update({ _id: existing._id }, { content: data.content });
        await recordEvent(session, "note_saved", { kind: data.kind }, data.lessonId);
        return { id: existing._id };
      }
      const doc = await store.insert({ _id: newId("not"), lessonId: data.lessonId, kind: data.kind, content: data.content });
      await recordEvent(session, "note_saved", { kind: data.kind }, data.lessonId);
      return { id: doc._id };
    },
  );
}

/* ----------------------------------------------------------- error notebook */

export async function addErrorAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      name: "error.add",
      schema: z.object({
        errorType: z.string().min(1).max(60),
        lessonId: z.string().max(64).optional(),
        skillIds: z.array(z.string().max(64)).max(10).default([]),
        description: z.string().min(1).max(2000),
        correction: z.string().min(1).max(2000),
      }),
      limit: { limit: 60, windowMs: 60_000 },
    },
    input,
    async (session, data) => {
      const doc = await owned<ErrorEntryDoc>(session, "error_notebook").insert({
        _id: newId("err"),
        errorType: data.errorType,
        lessonId: data.lessonId,
        skillIds: data.skillIds,
        description: data.description,
        correction: data.correction,
        resolved: false,
      });
      revalidatePath("/practice");
      return { id: doc._id };
    },
  );
}

export async function resolveErrorAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    { name: "error.resolve", schema: z.object({ id: z.string().min(1).max(64) }), limit: { limit: 60, windowMs: 60_000 } },
    input,
    async (session, data) => {
      await owned<ErrorEntryDoc>(session, "error_notebook").update({ _id: data.id }, { resolved: true });
      const entry = await owned<ErrorEntryDoc>(session, "error_notebook").findOne({ _id: data.id });
      if (entry?.skillIds.length) {
        const mastery = await computeSkillMastery(session, entry.skillIds);
        await persistMastery(session, mastery);
      }
      revalidatePath("/practice");
      revalidatePath("/skills");
      return { id: data.id };
    },
  );
}

/* ----------------------------------------------------------------- projects */

export async function saveProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      name: "project.save",
      schema: z.object({
        projectId: z.string().min(1).max(64),
        status: z.enum(["not_started", "in_progress", "submitted", "reviewed"]),
        summary: z.string().max(5000).default(""),
        repository: z.string().url().max(500).optional().or(z.literal("")),
        deployment: z.string().url().max(500).optional().or(z.literal("")),
        report: z.string().url().max(500).optional().or(z.literal("")),
        dataset: z.string().url().max(500).optional().or(z.literal("")),
        notebook: z.string().url().max(500).optional().or(z.literal("")),
        dodChecked: z.array(z.string().max(64)).max(60).default([]),
      }),
      limit: { limit: 60, windowMs: 60_000 },
    },
    input,
    async (session, data) => {
      const spec = graph().projects.find((p) => p.id === data.projectId);
      if (!spec) throw new Error("not_found");
      const store = owned<ProjectSubmissionDoc>(session, "project_submissions");
      const links = {
        repository: data.repository || undefined,
        deployment: data.deployment || undefined,
        report: data.report || undefined,
        dataset: data.dataset || undefined,
      };
      const existing = await store.findOne({ projectId: data.projectId });
      if (existing) {
        await store.update({ _id: existing._id }, { status: data.status, summary: data.summary, links, dodChecked: data.dodChecked });
        revalidatePath(`/projects/${data.projectId}`);
        return { id: existing._id };
      }
      const doc = await store.insert({
        _id: newId("prj"),
        projectId: data.projectId,
        status: data.status,
        summary: data.summary,
        links,
        dodChecked: data.dodChecked,
      });
      revalidatePath(`/projects/${data.projectId}`);
      return { id: doc._id };
    },
  );
}

/* ----------------------------------------------------------------- evidence */

export async function addEvidenceAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      name: "evidence.add",
      schema: z.object({
        kind: z.enum(["repository", "commit", "pull_request", "deployment", "report", "dataset", "metric", "review", "oral", "other"]),
        projectId: z.string().max(64).optional(),
        skillIds: z.array(z.string().max(64)).max(20).default([]),
        title: z.string().min(1).max(160),
        url: z.string().url().max(500).optional().or(z.literal("")),
        description: z.string().max(2000).default(""),
      }),
      limit: { limit: 60, windowMs: 60_000 },
    },
    input,
    async (session, data) => {
      const doc = await owned<EvidenceDoc>(session, "project_evidence").insert({
        _id: newId("evd"),
        kind: data.kind,
        projectId: data.projectId || undefined,
        skillIds: data.skillIds,
        title: data.title,
        url: data.url || undefined,
        description: data.description,
        verified: false, // only a human review or a deterministic check sets this (§166)
      });
      if (data.skillIds.length) {
        const mastery = await computeSkillMastery(session, data.skillIds);
        await persistMastery(session, mastery);
      }
      revalidatePath("/portfolio");
      revalidatePath("/career");
      return { id: doc._id };
    },
  );
}

export async function deleteEvidenceAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    { name: "evidence.delete", schema: z.object({ id: z.string().min(1).max(64) }), limit: { limit: 60, windowMs: 60_000 } },
    input,
    async (session, data) => {
      await owned<EvidenceDoc>(session, "project_evidence").remove({ _id: data.id });
      revalidatePath("/portfolio");
      return { id: data.id };
    },
  );
}

/* ----------------------------------------------------------------- speaking */

export async function saveSpeakingAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      name: "speaking.save",
      schema: z.object({
        activityId: z.string().min(1).max(64),
        transcript: z.string().min(1).max(10_000),
        durationSeconds: z.coerce.number().int().min(0).max(7200),
        selfRating: z.coerce.number().int().min(1).max(5),
      }),
      limit: { limit: 60, windowMs: 60_000 },
    },
    input,
    async (session, data) => {
      const doc = await owned<SpeakingAttemptDoc>(session, "speaking_attempts").insert({
        _id: newId("spk"),
        activityId: data.activityId,
        transcript: data.transcript,
        durationSeconds: data.durationSeconds,
        selfRating: data.selfRating as SpeakingAttemptDoc["selfRating"],
        feedbackSource: "self",
      });
      await recordEvent(session, "speaking", { activityId: data.activityId });
      revalidatePath("/learn/english");
      return { id: doc._id };
    },
  );
}

/* ----------------------------------------------------------------- settings */

export async function saveSettingsAction(input: unknown): Promise<ActionResult<{ saved: true }>> {
  return action(
    {
      name: "settings.save",
      schema: z.object({
        theme: z.enum(["light", "dark", "system"]),
        language: z.enum(["en", "ar"]),
        englishMode: z.enum(["standard", "b1b2"]),
        vocabularyAssist: z.coerce.boolean(),
        englishTraining: z.coerce.boolean(),
        reducedMotion: z.coerce.boolean(),
        textSize: z.enum(["normal", "large", "xlarge"]),
        readingDensity: z.enum(["comfortable", "compact"]),
        hintPolicy: z.enum(["minimal", "balanced", "generous"]),
        careerTargets: z.array(z.string().max(64)).max(5),
        notifications: z.coerce.boolean(),
      }),
      limit: { limit: 60, windowMs: 60_000 },
    },
    input,
    async (session, data) => {
      const settings = await getSettings(session);
      const validRoles = new Set(graph().roles.map((r) => r.id));
      await owned<SettingsDoc>(session, "settings").update(
        { _id: settings._id },
        { ...data, careerTargets: data.careerTargets.filter((r) => validRoles.has(r)) },
      );
      revalidatePath("/settings");
      return { saved: true as const };
    },
  );
}
