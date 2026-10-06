import { z } from "zod";
import { handler, ok, parseBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { HELP_LEVELS, recordAttemptAndUpdateMastery, markContentSeen } from "@/lib/engine";
import { db } from "@/db";
import { learningSessions } from "@/db/schema";

const schema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("attempt"),
    itemId: z.string().min(1).max(200),
    response: z.string().min(1).max(20000),
    selfScore: z.number().int().min(0).max(3),
    helpLevel: z.enum(HELP_LEVELS),
    learningState: z.enum(["deep", "drift", "fog", "overload"]),
    isReview: z.boolean().default(false),
    errorType: z.enum(["concept", "recall", "selection", "execution", "transfer", "attention", "load"]).nullable().optional(),
  }),
  z.object({ intent: z.literal("seen"), nodeId: z.string().min(1).max(200) }),
  z.object({ intent: z.literal("state"), state: z.enum(["deep", "drift", "fog", "overload"]), note: z.string().max(500).optional() }),
]);

export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await parseBody(req, schema);
  if (body.intent === "seen") {
    await markContentSeen(user.id, body.nodeId);
    return ok({ seen: true });
  }
  if (body.intent === "state") {
    await db.insert(learningSessions).values({ ownerId: user.id, state: body.state, note: body.note ?? null });
    return ok({ state: body.state });
  }
  const result = await recordAttemptAndUpdateMastery({ ownerId: user.id, itemId: body.itemId, response: body.response, selfScore: body.selfScore, helpLevel: body.helpLevel, learningState: body.learningState, isReview: body.isReview, errorType: body.errorType ?? null });
  return ok({ attemptId: result.attempt.id, mastery: result.mastery });
});
