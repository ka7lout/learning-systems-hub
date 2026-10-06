import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { aiMessages, aiThreads } from "@/db/schema";
import { audit, getUser, rateLimit } from "@/lib/auth";
import {
  buildMentorContext,
  buildMessages,
  callProvider,
  offlineScaffold,
  providerConfigured,
  resolveProvider,
  SPECIALISTS,
  type Specialist,
} from "@/lib/ai";

export const dynamic = "force-dynamic";

const schema = z.object({
  lessonId: z.string().max(120).nullable().optional(),
  specialist: z.enum(SPECIALISTS.map((s) => s.id) as [Specialist, ...Specialist[]]),
  helpLevel: z.enum(["none", "hint", "guidance", "concept_reminder", "worked_example", "full_explanation"]),
  question: z.string().min(2).max(4000),
  attempt: z.string().max(8000).optional(),
  englishMode: z.enum(["standard", "b1b2", "arabic"]).default("standard"),
  learningState: z.enum(["deep", "drift", "fog", "overload"]).default("deep"),
});

export async function POST(req: Request) {
  const requestId = randomUUID();
  const user = await getUser();
  if (!user) {
    return Response.json({ status: "unauthorized", content: "Sign in to use the mentor." }, { status: 401 });
  }
  if (!rateLimit(`mentor:${user.id}`, 20, 60_000)) {
    return Response.json(
      { status: "rate_limited", content: "Mentor rate limit reached. Wait a minute — this protects both cost and your own independent practice." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ status: "error", content: "Malformed request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ status: "error", content: "Invalid mentor request." }, { status: 400 });
  }

  // Anti-compulsion guardrail: repeated identical questions without new evidence.
  const since = new Date(Date.now() - 20 * 60 * 1000);
  const repeats = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(aiMessages)
    .where(
      and(
        eq(aiMessages.userId, user.id),
        eq(aiMessages.role, "student"),
        eq(aiMessages.content, parsed.data.question),
        gte(aiMessages.createdAt, since),
      ),
    );
  if ((repeats[0]?.n ?? 0) >= 2) {
    return Response.json({
      status: "guardrail",
      content:
        "You have asked this exact question twice in the last twenty minutes and no new evidence has been added. Re-reading a confirmed answer does not increase mastery. Move to an application or transfer task, and come back only if a new error appears.",
    });
  }

  const threads = await db
    .select()
    .from(aiThreads)
    .where(and(eq(aiThreads.userId, user.id), eq(aiThreads.specialist, parsed.data.specialist)))
    .orderBy(desc(aiThreads.createdAt))
    .limit(1);
  const threadId =
    threads[0]?.id ??
    (
      await db
        .insert(aiThreads)
        .values({
          userId: user.id,
          lessonId: parsed.data.lessonId ?? null,
          specialist: parsed.data.specialist,
          title: parsed.data.question.slice(0, 80),
        })
        .returning({ id: aiThreads.id })
    )[0]!.id;

  await db.insert(aiMessages).values({
    userId: user.id,
    threadId,
    role: "student",
    content: parsed.data.question,
  });

  const store = await cookies();
  const englishMode = store.get("ihls_english")?.value ?? parsed.data.englishMode;

  if (!providerConfigured()) {
    const content = await offlineScaffold(parsed.data.lessonId ?? null);
    await db.insert(aiMessages).values({
      userId: user.id,
      threadId,
      role: "system_notice",
      specialist: parsed.data.specialist,
      content,
      provider: "none",
      status: "provider_unavailable",
    });
    await audit(user.id, "mentor.provider_unavailable", { requestId });
    return Response.json({ status: "provider_unavailable", content });
  }

  const context = await buildMentorContext(user.id, parsed.data.lessonId ?? null);
  const tier = SPECIALISTS.find((s) => s.id === parsed.data.specialist)?.tier ?? "pro";
  const messages = buildMessages({
    specialist: parsed.data.specialist,
    context,
    englishMode,
    learningState: parsed.data.learningState,
    helpLevel: parsed.data.helpLevel,
    question: parsed.data.question,
    attempt: parsed.data.attempt,
  });

  const started = Date.now();
  const result = await callProvider(messages, tier);
  const latency = Date.now() - started;

  if (result.status !== "ok") {
    const fallback = await offlineScaffold(parsed.data.lessonId ?? null);
    const content = `${result.reason}\n\n${fallback}`;
    await db.insert(aiMessages).values({
      userId: user.id,
      threadId,
      role: "system_notice",
      specialist: parsed.data.specialist,
      content,
      provider: resolveProvider(tier)?.name ?? "none",
      status: result.status,
    });
    await audit(user.id, "mentor.provider_failure", { requestId, latency, status: result.status });
    return Response.json({ status: result.status, content }, { status: 502 });
  }

  await db.insert(aiMessages).values({
    userId: user.id,
    threadId,
    role: "mentor",
    specialist: parsed.data.specialist,
    content: result.content,
    provider: result.provider,
    status: "ok",
  });
  await audit(user.id, "mentor.response", { requestId, latency, model: result.model });

  return Response.json({
    status: "ok",
    content: result.content,
    meta: `${result.provider} · ${result.model} · ${latency} ms · help level ${parsed.data.helpLevel}`,
  });
}
