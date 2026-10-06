import { z } from "zod";
import { handler, ok, fail, parseBody } from "@/lib/http";
import { requireUser, rateLimit } from "@/lib/auth";
import { MENTOR_ACTIONS, runMentor } from "@/lib/ai/mentor";

const schema = z.object({
  threadId: z.string().uuid().nullable().optional(),
  nodeId: z.string().max(200).nullable().optional(),
  action: z.enum(MENTOR_ACTIONS),
  message: z.string().min(1).max(8000),
  learningState: z.enum(["deep", "drift", "fog", "overload"]).default("deep"),
});

export const POST = handler(async (req) => {
  const user = await requireUser();
  if (!rateLimit(`mentor:${user.id}`, 40, 10 * 60 * 1000)) return fail("Mentor rate limit reached (40 requests / 10 min). Take a short retrieval break and try again.", 429, "rate_limited");
  const body = await parseBody(req, schema);
  const result = await runMentor({ ownerId: user.id, threadId: body.threadId ?? null, nodeId: body.nodeId ?? null, action: body.action, message: body.message, learningState: body.learningState });
  if (!result.ok) return fail(result.message, result.code === "not_configured" ? 503 : 502, result.code);
  return ok(result);
});
