import { and, count, eq, gte } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/db";
import { curriculumNodes, learningEvents, masteryRecords, reviewItems, skillEvidence, skills } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { evaluateAttempt, nextReviewInterval, deriveCompletion, type HelpLevel, type PracticeKind } from "@/lib/learning/mastery";
import { makeSlug } from "@/lib/curriculum/seed";

export const runtime = "nodejs";
const requestSchema = z.object({
  nodeId: z.string().min(1).max(160),
  eventType: z.enum(["recall", "practice", "transfer", "debug", "explain", "case"]),
  answer: z.string().max(5000).default(""),
  helpLevel: z.enum(["no_help", "hint", "guidance", "concept_reminder", "worked_example", "full_explanation"]).default("no_help"),
  errorType: z.enum(["concept_error", "recall_error", "selection_error", "execution_error", "transfer_error", "attention_error", "load_error"]).optional(),
});

export async function POST(request: Request) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const [recent] = await db.select({ value: count() }).from(learningEvents)
    .where(and(eq(learningEvents.ownerId, actor.id), gte(learningEvents.occurredAt, new Date(Date.now() - 60_000))));
  if (recent.value >= 40) return Response.json({ error: "rate_limited", message: "Please pause briefly before recording more attempts." }, { status: 429 });
  const [node] = await db.select({ id: curriculumNodes.id, title: curriculumNodes.title, kind: curriculumNodes.kind }).from(curriculumNodes).where(eq(curriculumNodes.id, input.nodeId)).limit(1);
  if (!node) return Response.json({ error: "curriculum_node_not_found" }, { status: 404 });

  const evaluation = evaluateAttempt(input.nodeId, input.eventType as PracticeKind, input.answer);
  const independent = input.helpLevel === "no_help";
  const eventId = randomUUID();
  const occurredAt = new Date();
  await db.insert(learningEvents).values({
    id: eventId,
    ownerId: actor.id,
    nodeId: input.nodeId,
    eventType: input.eventType,
    performance: evaluation.score === null ? null : String(evaluation.score),
    independent,
    helpLevel: input.helpLevel,
    response: input.answer.trim(),
    errorType: input.errorType ?? null,
    metadata: { correct: evaluation.correct, grading: evaluation.score === null ? "not_automatically_graded" : "deterministic_exercise" },
    occurredAt,
  });

  const [existing] = await db.select().from(masteryRecords).where(and(eq(masteryRecords.ownerId, actor.id), eq(masteryRecords.nodeId, input.nodeId))).limit(1);
  const priorRecall = existing?.recallScore === null || existing?.recallScore === undefined ? null : Number(existing.recallScore);
  const priorTransfer = existing?.transferScore === null || existing?.transferScore === undefined ? null : Number(existing.transferScore);
  const priorIndependence = existing?.independenceScore === null || existing?.independenceScore === undefined ? null : Number(existing.independenceScore);
  const recallScore = input.eventType === "recall" && evaluation.score !== null ? evaluation.score : priorRecall;
  const transferScore = input.eventType === "transfer" && evaluation.score !== null ? evaluation.score : priorTransfer;
  const independenceScore = evaluation.score !== null && independent ? evaluation.score : priorIndependence;
  const completion = deriveCompletion(recallScore, transferScore, independenceScore);
  await db.insert(masteryRecords).values({
    ownerId: actor.id,
    nodeId: input.nodeId,
    completion,
    recallScore: recallScore === null ? null : String(recallScore),
    transferScore: transferScore === null ? null : String(transferScore),
    independenceScore: independenceScore === null ? null : String(independenceScore),
    lastEvidenceAt: occurredAt,
    updatedAt: occurredAt,
  }).onConflictDoUpdate({
    target: [masteryRecords.ownerId, masteryRecords.nodeId],
    set: {
      completion,
      recallScore: recallScore === null ? null : String(recallScore),
      transferScore: transferScore === null ? null : String(transferScore),
      independenceScore: independenceScore === null ? null : String(independenceScore),
      lastEvidenceAt: occurredAt,
      updatedAt: occurredAt,
    },
  });

  let nextReviewAt: string | null = null;
  if ((input.eventType === "practice" || input.eventType === "transfer") && evaluation.score !== null) {
    const [priorReview] = await db.select({ intervalDays: reviewItems.intervalDays }).from(reviewItems)
      .where(and(eq(reviewItems.ownerId, actor.id), eq(reviewItems.nodeId, input.nodeId))).limit(1);
    const intervalDays = nextReviewInterval(priorReview?.intervalDays ?? 1, evaluation.correct === true, input.helpLevel as HelpLevel);
    const dueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
    await db.insert(reviewItems).values({
      id: randomUUID(), ownerId: actor.id, nodeId: input.nodeId, dueAt, intervalDays,
      difficulty: evaluation.correct ? "0.35" : "0.75", status: "due",
      activityType: input.eventType === "transfer" ? "transfer" : "free_recall",
      updatedAt: occurredAt,
    }).onConflictDoUpdate({
      target: [reviewItems.ownerId, reviewItems.nodeId],
      set: { dueAt, intervalDays, difficulty: evaluation.correct ? "0.35" : "0.75", status: "due", activityType: input.eventType === "transfer" ? "transfer" : "free_recall", updatedAt: occurredAt },
    });
    nextReviewAt = dueAt.toISOString();
  } else if (input.eventType === "recall") {
    const [dueItem] = await db.select({ id: reviewItems.id, dueAt: reviewItems.dueAt }).from(reviewItems)
      .where(and(eq(reviewItems.ownerId, actor.id), eq(reviewItems.nodeId, input.nodeId), eq(reviewItems.status, "due"))).limit(1);
    if (dueItem && dueItem.dueAt <= occurredAt) {
      const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.update(reviewItems).set({ dueAt, intervalDays: 1, activityType: "free_recall", updatedAt: occurredAt })
        .where(and(eq(reviewItems.id, dueItem.id), eq(reviewItems.ownerId, actor.id)));
      nextReviewAt = dueAt.toISOString();
    }
  }

  if (evaluation.score !== null && evaluation.score >= 80) {
    const [skill] = await db.select({ id: skills.id }).from(skills).where(eq(skills.id, `skill-${makeSlug(node.title)}`)).limit(1);
    if (skill) {
      await db.insert(skillEvidence).values({
        id: randomUUID(), ownerId: actor.id, skillId: skill.id, evidenceType: input.eventType,
        evidenceSummary: `${input.eventType} attempt recorded for ${node.title}; deterministic score ${evaluation.score}/100; help level ${input.helpLevel}.`,
        independent,
      });
    }
  }

  return Response.json({
    eventId,
    node: { id: node.id, title: node.title },
    evaluation,
    completion,
    independent,
    nextReviewAt,
    message: evaluation.score === null ? "Evidence saved; no automated score was assigned." : "Attempt saved with transparent deterministic feedback.",
  }, { status: 201 });
}
