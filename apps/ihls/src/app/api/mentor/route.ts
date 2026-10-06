import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/api";
import { getSettings, audit } from "@/lib/dal";
import { MENTOR_ACTIONS, runMentor } from "@/lib/ai/mentor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/mentor
 * auth: session required · authz: owner only (context is scoped by session)
 * input: schema below · output: { status, content, specialist, helpLevel, threadId }
 * rate limit: 20 requests / 5 minutes / user
 * errors: 401, 400, 429, 200 with status "provider_unavailable" | "error"
 * logging: audit entry per call; message content stored in the student's own thread
 */
const schema = z.object({
  studentQuestion: z.string().min(1, "Ask a question.").max(4000),
  action: z.enum(MENTOR_ACTIONS.map((a) => a.id) as [string, ...string[]]),
  lessonId: z.string().max(64).optional(),
  assessmentId: z.string().max(64).optional(),
  threadId: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Sign in to use the mentor." }, { status: 401 });
  }

  const rl = rateLimit({ key: `mentor:${session.userId}`, limit: 20, windowMs: 5 * 60_000 });
  if (!rl.ok) {
    await audit({ actorId: session.userId, action: "mentor.call", outcome: "deny", meta: { reason: "rate_limited" } });
    return NextResponse.json(
      { error: `Mentor rate limit reached. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }

  const settings = await getSettings(session);
  const { thread, result, specialist, helpLevel } = await runMentor(
    session,
    {
      studentQuestion: parsed.data.studentQuestion,
      action: parsed.data.action as never,
      lessonId: parsed.data.lessonId,
      assessmentId: parsed.data.assessmentId,
    },
    settings,
    parsed.data.threadId,
  );

  await audit({ actorId: session.userId, action: "mentor.call", outcome: result.status === "ok" ? "allow" : "error", meta: { specialist: specialist.id } });

  return NextResponse.json({
    status: result.status,
    content: result.status === "ok" ? result.text : "",
    message: result.status === "ok" ? undefined : result.reason,
    model: result.status === "ok" ? result.model : undefined,
    specialist: specialist.label,
    helpLevel,
    threadId: thread._id,
  });
}
