import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { englishAttempts, englishTerms } from "@/db/schema";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
const attemptSchema = z.object({
  dimension: z.enum(["reading", "listening", "writing", "speaking", "interaction", "technical_vocabulary", "professional_communication"]),
  activity: z.string().trim().min(2).max(120),
  response: z.string().trim().min(1).max(5000),
}).strict();

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  await ensureCurriculumSeeded();
  const [terms, attempts] = await Promise.all([
    db.select({ id: englishTerms.id, term: englishTerms.term, definition: englishTerms.definition, arabicMeaning: englishTerms.arabicMeaning, example: englishTerms.example, topic: englishTerms.topic }).from(englishTerms),
    db.select({ id: englishAttempts.id, dimension: englishAttempts.dimension, activity: englishAttempts.activity, response: englishAttempts.response, feedback: englishAttempts.feedback, createdAt: englishAttempts.createdAt }).from(englishAttempts).where(eq(englishAttempts.ownerId, actor.id)).orderBy(desc(englishAttempts.createdAt)).limit(20),
  ]);
  return Response.json({ terms, attempts, proficiencyClaim: null, message: "Vocabulary support is not a CEFR assessment; no proficiency level is inferred." });
}

export async function POST(request: Request) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  const [attempt] = await db.insert(englishAttempts).values({
    id: randomUUID(), ownerId: actor.id, ...parsed.data,
    feedback: "Saved. No automated proficiency score or CEFR level was assigned.",
  }).returning({ id: englishAttempts.id, dimension: englishAttempts.dimension, activity: englishAttempts.activity, createdAt: englishAttempts.createdAt });
  return Response.json({ attempt, feedback: "Your practice is saved. A verified speaking/pronunciation score is not available in this workspace." }, { status: 201 });
}
