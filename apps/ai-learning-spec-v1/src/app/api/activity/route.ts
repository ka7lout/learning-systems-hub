import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { englishActivities, freelanceAttempts, freelanceScenarios, laterItems, studySessions, users } from "@/db/schema";
import { UnauthorizedError, requireUser } from "@/lib/auth";
import { ensureReady } from "@/lib/data";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("state"), state: z.enum(["deep", "drift", "fog", "overload"]) }),
  z.object({ action: z.literal("later_add"), text: z.string().trim().min(1).max(500) }),
  z.object({ action: z.literal("later_done"), id: z.number().int().positive() }),
  z.object({
    action: z.literal("english"),
    dimension: z.enum(["reading", "listening", "writing", "speaking", "interaction", "vocabulary", "professional"]),
    activity: z.string().trim().min(2).max(200),
    response: z.string().trim().min(1).max(20000),
    mode: z.enum(["text", "speech"]).default("text"),
    promptKey: z.string().max(120).nullable().optional(),
  }),
  z.object({
    action: z.literal("freelance"),
    scenarioKey: z.string().min(1).max(120),
    questionsAsked: z.array(z.string().max(500)).max(30),
    proposal: z.string().max(20000),
  }),
  z.object({
    action: z.literal("settings"),
    theme: z.enum(["light", "dark", "system"]).optional(),
    uiLanguage: z.enum(["en", "ar"]).optional(),
    contentMode: z.enum(["standard", "b1b2", "arabic"]).optional(),
    vocabAssist: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
    readingDensity: z.enum(["compact", "comfortable"]).optional(),
    hintPolicy: z.enum(["attempt_first", "open"]).optional(),
    targetRoleKey: z.string().max(120).nullable().optional(),
  }),
]);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await ensureReady();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 422 });
    }
    const body = parsed.data;

    switch (body.action) {
      case "state": {
        await db.insert(studySessions).values({ userId: user.id, state: body.state });
        return Response.json({ ok: true });
      }
      case "later_add": {
        await db.insert(laterItems).values({ userId: user.id, text: body.text });
        return Response.json({ ok: true });
      }
      case "later_done": {
        await db
          .update(laterItems)
          .set({ done: true })
          .where(and(eq(laterItems.id, body.id), eq(laterItems.userId, user.id)));
        return Response.json({ ok: true });
      }
      case "english": {
        await db.insert(englishActivities).values({
          userId: user.id,
          dimension: body.dimension,
          activity: body.activity,
          response: body.response,
          mode: body.mode,
          promptKey: body.promptKey ?? null,
        });
        return Response.json({ ok: true });
      }
      case "freelance": {
        const [scenario] = await db
          .select()
          .from(freelanceScenarios)
          .where(eq(freelanceScenarios.key, body.scenarioKey))
          .limit(1);
        if (!scenario) return Response.json({ error: "Unknown scenario" }, { status: 404 });
        const asked = body.questionsAsked.map((q) => q.toLowerCase());
        const matched = scenario.requiredQuestions.filter((req) => {
          const keywords = req
            .toLowerCase()
            .replace(/[^a-z\s]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length > 4);
          return asked.some((a) => keywords.filter((k) => a.includes(k)).length >= 1);
        });
        const coverage = scenario.requiredQuestions.length
          ? matched.length / scenario.requiredQuestions.length
          : 0;
        await db.insert(freelanceAttempts).values({
          userId: user.id,
          scenarioKey: body.scenarioKey,
          questionsAsked: body.questionsAsked,
          proposal: body.proposal,
          coverage,
        });
        return Response.json({
          ok: true,
          coverage,
          covered: matched,
          missed: scenario.requiredQuestions.filter((q) => !matched.includes(q)),
          hiddenConstraints: scenario.hiddenConstraints,
          rubric: scenario.deliverableRubric,
        });
      }
      case "settings": {
        const next = { ...(user.settings ?? {}) };
        for (const [key, value] of Object.entries(body)) {
          if (key === "action" || value === undefined) continue;
          (next as Record<string, unknown>)[key] = value;
        }
        await db.update(users).set({ settings: next }).where(eq(users.id, user.id));
        return Response.json({ ok: true, settings: next });
      }
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) return Response.json({ error: "Sign in required" }, { status: 401 });
    return Response.json({ error: "Request failed" }, { status: 500 });
  }
}
