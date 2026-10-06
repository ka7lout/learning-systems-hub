import { z } from "zod";
import { route } from "@/lib/api";
import { markSeen, recordAttempt, mentor, diagnosticDone } from "@/lib/dal";
import { HELP_LEVELS, ERROR_TYPES } from "@/lib/learning";
import { HttpError, audit } from "@/lib/auth";
import { db } from "@/db";
import { mastery, nodes } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";

const Body = z.discriminatedUnion("op", [
  z.object({ op: z.literal("seen"), nodeId: z.string().max(40) }),
  z.object({ op: z.literal("attempt"), itemId: z.string().max(60), response: z.string().trim().min(3, "Write an attempt first").max(8000), helpLevel: z.enum(HELP_LEVELS as [string, ...string[]]), covered: z.number().int().min(0).max(50), errorType: z.enum(ERROR_TYPES).nullable(), studyState: z.enum(["deep", "drift", "fog", "overload"]) }),
  z.object({ op: z.literal("mentor"), action: z.enum(["explain", "hint", "check", "simplify", "example", "challenge", "arabic", "b1b2", "oral", "project", "write", "chat", "english_feedback", "freelance_client"]), nodeId: z.string().max(40).nullable(), input: z.string().max(6000) }),
  z.object({ op: z.literal("diagnostic"), known: z.array(z.string().max(40)).max(100) }),
]);

export const POST = route(Body, async (b, user) => {
  if (b.op === "seen") { await markSeen(user.id, b.nodeId); return { ok: true }; }
  if (b.op === "attempt") return recordAttempt(user.id, { itemId: b.itemId, response: b.response, helpLevel: b.helpLevel as never, covered: b.covered, errorType: b.errorType, studyState: b.studyState, grader: "self" });
  if (b.op === "mentor") return mentor(user.id, b.action, b.nodeId, b.input);
  if (b.op === "diagnostic") {
    // Self-reported familiarity only marks content as "recognized" (L1) — never mastery.
    await ensureSeed();
    const valid = b.known.length ? await db.select({ id: nodes.id }).from(nodes).where(inArray(nodes.id, b.known)) : [];
    for (const v of valid) await markSeen(user.id, v.id);
    await diagnosticDone(user.id);
    await audit(user.id, "diagnostic.complete", { count: valid.length });
    return { ok: true, marked: valid.length };
  }
  throw new HttpError(400, "Unknown op");
}, { limit: [60, 60] });

export const DELETE = route(null, async (_b, user) => { await db.delete(mastery).where(eq(mastery.ownerId, user.id)); await audit(user.id, "mastery.reset"); return { ok: true }; });
