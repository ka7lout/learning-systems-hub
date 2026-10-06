import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { handler, ok, parseBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { activityAttempts, laterItems, settings, skillEvidence } from "@/db/schema";
import { SIMULATIONS } from "@/content/catalog";

const schema = z.discriminatedUnion("intent", [
  z.object({ intent: z.literal("activity"), activityKey: z.string().min(1).max(200), response: z.string().min(1).max(20000), selfAssessment: z.record(z.string(), z.number().int().min(0).max(1)) }),
  z.object({ intent: z.literal("later_add"), text: z.string().min(1).max(300) }),
  z.object({ intent: z.literal("later_done"), id: z.string().uuid(), done: z.boolean() }),
  z.object({
    intent: z.literal("settings"),
    theme: z.enum(["light", "dark", "system"]).optional(),
    language: z.enum(["en", "ar"]).optional(),
    englishMode: z.enum(["standard", "b1b2"]).optional(),
    vocabularyAssist: z.boolean().optional(),
    englishTraining: z.boolean().optional(),
    hintPolicy: z.enum(["attempt_first", "open"]).optional(),
    reducedMotion: z.boolean().optional(),
    textSize: z.enum(["normal", "large"]).optional(),
    readingDensity: z.enum(["comfortable", "compact"]).optional(),
    targetRoleSlug: z.string().max(200).nullable().optional(),
    defaultLearningState: z.enum(["deep", "drift", "fog", "overload"]).optional(),
  }),
]);

export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await parseBody(req, schema);

  if (body.intent === "later_add") {
    const [row] = await db.insert(laterItems).values({ ownerId: user.id, text: body.text }).returning();
    return ok(row);
  }
  if (body.intent === "later_done") {
    await db.update(laterItems).set({ done: body.done }).where(and(eq(laterItems.id, body.id), eq(laterItems.ownerId, user.id)));
    return ok({ updated: true });
  }
  if (body.intent === "settings") {
    const { intent: _i, ...rest } = body;
    void _i;
    const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
    await db.insert(settings).values({ ownerId: user.id, ...clean }).onConflictDoUpdate({ target: settings.ownerId, set: { ...clean, updatedAt: new Date() } });
    return ok({ updated: true });
  }

  const sim = SIMULATIONS.find((s) => s.key === body.activityKey);
  if (!sim) return ok({ error: "unknown activity" }, { status: 404 });
  const [row] = await db.insert(activityAttempts).values({ ownerId: user.id, activityType: sim.type, activityKey: sim.key, prompt: sim.prompt, response: body.response, selfAssessment: body.selfAssessment }).returning();
  const met = Object.values(body.selfAssessment).filter((v) => v === 1).length;
  if (sim.rubric.length && met / sim.rubric.length >= 0.75) {
    const sourceType = sim.type === "interview" ? "interview_sim" : sim.type === "english_speaking" ? "oral" : "assessment";
    await db.insert(skillEvidence).values(sim.skillIds.map((s) => ({ ownerId: user.id, skillId: s, sourceType, refId: row.id, strength: 2, independent: true, note: sim.title })));
  }
  return ok({ id: row.id, rubricMet: met, rubricTotal: sim.rubric.length });
});
