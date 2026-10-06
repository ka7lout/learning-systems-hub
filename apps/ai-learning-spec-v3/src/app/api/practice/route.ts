import { db } from "@/db";
import { assessmentSubmissions, masteryRecords, reviewItems } from "@/db/schema";
import { DEMO_LEARNER_ID } from "@/lib/seed";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const practiceSchema = z.object({
  nodeId: z.string().min(1).max(100),
  response: z.string().min(3).max(5000),
  taskType: z.string().min(1).max(40),
  helpLevel: z.enum(["no_help", "hint", "guidance", "concept_reminder", "worked_example", "full_explanation"]).default("no_help"),
});

function evaluate(response: string) {
  const normalized = response.toLowerCase();
  const hasReasoning = normalized.length > 80 || normalized.includes("because") || normalized.includes("therefore");
  const score = hasReasoning ? 78 : normalized.length > 30 ? 62 : 42;
  const feedback = hasReasoning
    ? "Good: you gave enough reasoning to inspect, not just a guess. Revisit the edge case and explain what would change under a new constraint."
    : "You have a starting point. Add the reason, a concrete example, and one failure case so the evidence shows understanding rather than recognition.";
  return { score, feedback };
}

export async function POST(request: Request) {
  try {
    const parsed = practiceSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ ok: false, message: "Write a little more before submitting." }, { status: 400 });
    const result = evaluate(parsed.data.response);
    const submissionId = `submission-${crypto.randomUUID()}`;
    await db.insert(assessmentSubmissions).values({ id: submissionId, learnerId: DEMO_LEARNER_ID, nodeId: parsed.data.nodeId, taskType: parsed.data.taskType, response: parsed.data.response, score: result.score, helpLevel: parsed.data.helpLevel, independent: parsed.data.helpLevel === "no_help", feedback: result.feedback });
    await db.update(masteryRecords).set({ recall: Math.max(result.score, 0), transfer: result.score >= 70 ? result.score : 0, lastAttemptAt: new Date(), updatedAt: new Date(), evidenceLevel: result.score >= 70 ? "skill_developing" : "practice_needed" }).where(and(eq(masteryRecords.learnerId, DEMO_LEARNER_ID), eq(masteryRecords.nodeId, parsed.data.nodeId)));
    await db.update(reviewItems).set({ status: "scheduled", dueAt: new Date(Date.now() + (result.score >= 70 ? 4 : 1) * 24 * 60 * 60 * 1000), updatedAt: new Date() }).where(and(eq(reviewItems.learnerId, DEMO_LEARNER_ID), eq(reviewItems.nodeId, parsed.data.nodeId), eq(reviewItems.status, "due")));
    return Response.json({ ok: true, score: result.score, feedback: result.feedback, independent: parsed.data.helpLevel === "no_help" });
  } catch {
    return Response.json({ ok: false, message: "The attempt could not be saved. Nothing was marked complete." }, { status: 500 });
  }
}
