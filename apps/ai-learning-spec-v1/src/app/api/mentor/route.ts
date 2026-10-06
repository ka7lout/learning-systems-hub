import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { attempts, courses, lessons, mentorMessages } from "@/db/schema";
import { UnauthorizedError, requireUser } from "@/lib/auth";
import { SPECIALISTS, type Specialist, mentorRespond, providerStatus } from "@/lib/ai";
import { ensureReady, getCurrentState, getOrCreateThread } from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  message: z.string().trim().min(1).max(4000),
  specialist: z.enum(SPECIALISTS.map((s) => s.key) as [Specialist, ...Specialist[]]),
  lessonKey: z.string().max(120).nullable().optional(),
  attemptMade: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await ensureReady();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 422 });
    }
    const { message, specialist, lessonKey, attemptMade } = parsed.data;

    const thread = await getOrCreateThread(user.id, lessonKey ?? null);
    await db.insert(mentorMessages).values({
      userId: user.id,
      threadId: thread.id,
      role: "user",
      content: message,
      specialist,
    });

    let lessonContext = null;
    if (lessonKey) {
      const [lesson] = await db.select().from(lessons).where(eq(lessons.key, lessonKey)).limit(1);
      if (lesson) {
        const [course] = await db.select().from(courses).where(eq(courses.key, lesson.courseKey)).limit(1);
        lessonContext = {
          title: lesson.title,
          courseTitle: course?.title ?? lesson.courseKey,
          why: lesson.why,
          objectives: lesson.objectives,
          topics: lesson.topics,
          blocks: lesson.blocks.map((b) => ({ title: b.title, body: b.body })),
          notebookMustWrite: lesson.notebook.mustWrite,
        };
      }
    }

    const recent = await db
      .select({ lessonKey: attempts.lessonKey, errorClass: attempts.errorClass, outcome: attempts.outcome })
      .from(attempts)
      .where(eq(attempts.userId, user.id))
      .orderBy(desc(attempts.createdAt))
      .limit(5);

    const state = await getCurrentState(user.id);

    const response = await mentorRespond({
      specialist,
      message,
      context: {
        learnerName: user.name,
        contentMode: user.settings?.contentMode ?? "standard",
        studyState: state?.state ?? "deep",
        helpPolicy: user.settings?.hintPolicy ?? "attempt_first",
        lesson: lessonContext,
        recentErrors: recent.map((r) => ({ lesson: r.lessonKey, errorClass: r.errorClass, outcome: r.outcome })),
        targetRole: user.settings?.targetRoleKey ?? null,
        attemptMade,
      },
      tier: specialist === "english_coach" || specialist === "study_coach" ? "fast" : "pro",
    });

    if (response.ok) {
      await db.insert(mentorMessages).values({
        userId: user.id,
        threadId: thread.id,
        role: "mentor",
        content: response.content,
        specialist,
        provider: response.provider,
      });
      return Response.json({ ok: true, content: response.content, provider: response.provider, specialist });
    }

    const notice =
      response.reason === "not_configured"
        ? "No AI provider is configured in this deployment, so the mentor cannot answer. Nothing was generated."
        : `The AI provider (${response.provider}) did not respond (${response.reason}${response.detail ? `: ${response.detail}` : ""}). Nothing was generated.`;

    await db.insert(mentorMessages).values({
      userId: user.id,
      threadId: thread.id,
      role: "system_notice",
      content: `${notice}\n\n${response.fallback}`,
      specialist,
      provider: "unavailable",
    });

    return Response.json(
      {
        ok: false,
        error: notice,
        reason: response.reason,
        fallback: response.fallback,
        providerStatus: providerStatus(),
      },
      { status: 503 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) return Response.json({ error: "Sign in required" }, { status: 401 });
    return Response.json({ error: "Mentor request failed" }, { status: 500 });
  }
}
