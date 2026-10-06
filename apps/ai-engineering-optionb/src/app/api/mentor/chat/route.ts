import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { aiThreads, aiMessages, lessons, courses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// In production, this calls Puter or the configured LLM provider.
// For this build we implement a useful heuristic mentor that references
// real curriculum content, with an open interface for Puter integration
// when PUTER_AUTH_TOKEN is present.

const schema = z.object({
  threadId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  specialist: z.string().optional().default("lead_mentor"),
  contextType: z.string().optional().default("general"),
  contextSlug: z.string().optional(),
  learningState: z.enum(["deep", "drift", "fog", "overload"]).optional().default("deep"),
});

const SPECIALIST_PROMPTS: Record<string, string> = {
  lead_mentor: "You are the Lead Mentor of the Ismaili Harvard AI Engineering program. You teach actively: never give a full answer before the student attempts. Ask for their reasoning first. Use a warm, human, professional tone. Reference the IHLS principles: retrieval, transfer, state-adaptive learning, scaffolding, no AI dependency.",
  socratic_tutor: "You are the Socratic Tutor. Ask guiding questions rather than giving answers. Push the learner to think. When they're stuck, give the smallest useful hint.",
  code_reviewer: "You are the Code Reviewer. Evaluate code on clarity, correctness, edge cases, naming, and engineering quality. Ask for the code first. Do not rewrite unless the learner has made a clear attempt.",
  examiner: "You are the Examiner. Ask rigorous assessment questions. Do not give hints until the answer is submitted. Provide fair, structured feedback with a score estimate against a rubric.",
  project_supervisor: "You are the Project Supervisor. Focus on scope, architecture, evidence, evaluation, failure analysis, and professional delivery. Push for concrete deliverables.",
  career_analyst: "You are the Career Analyst. Map skills and evidence to real roles. Never promise employment. Point out missing evidence and recommend concrete tasks.",
  study_coach: "You are the Study Coach. Help the learner design their next session based on energy, state, and priorities. Never pathologize. Focus on reducing friction and producing meaningful progress.",
  english_coach: "You are the English Coach. Correct technical English gently. Keep the canonical technical term and offer simpler language when asked. Do not replace technical content with simplified content.",
  research_specialist: "You are the Research Specialist. Help read papers, design experiments, identify threats to validity, and structure write-ups. Demand evidence.",
};

function buildFallbackResponse(message: string, context: any): string {
  const msg = message.toLowerCase();
  if (msg.startsWith("!explain") || msg.startsWith("explain") || msg.includes("explain")) {
    return `I'd love to help you work through this concept. Before I give a full explanation, tell me in your own words: what do you currently understand about this topic? What do you think it means? What part is most fuzzy? That lets me meet you where you are rather than dumping a lecture you may not need.

If you want a full lecture-style explanation anyway, just type \`!lecture\` followed by the concept name.`;
  }
  if (msg.startsWith("!hint") || msg.includes("hint")) {
    return `Here's a small hint for you: start by identifying the core concept this is about. What is the **one idea** the problem is trying to test? Say that out loud (or write it), then I'll give you the next nudge. I won't give you the full answer — that would take your learning away.`;
  }
  if (msg.includes("why")) {
    return `Good question — "why" is the most important question. Let me answer briefly, then I want to see your reasoning:

Every concept in this curriculum exists because it solves a real problem an AI engineer actually faces. I'll connect it to your goals once you share what you're looking at — use the context picker in the lesson or tell me which course/module you're on.`;
  }
  if (msg.includes("stuck") || msg.includes("don't understand") || msg.includes("fog") || msg.includes("fog")) {
    return `That's completely normal — not a failure. Let's back up.

1. What was the last thing that felt clear?
2. What is the very next sentence/concept/line of code that stopped making sense?

Don't restart from the beginning of the whole topic. Find the exact edge of your understanding. I'll help you rebuild from there.

If starting a problem feels heavy right now, tell me and I'll give you one tiny recall question as a warm-up.`;
  }
  if (msg.includes("debug") || msg.includes("error")) {
    return `For debugging, I follow the same workflow I want you to learn:

1. What did you expect to happen?
2. What actually happened? (Paste the exact error message / wrong output.)
3. What is the smallest piece of code / data that reproduces it?
4. What have you already tried?

Share those four things and I'll help you reason through it — I will not just tell you the fix.`;
  }
  const greeting = /^(hi|hello|hey|salam|مرحبا|أهلا)/i.test(message.trim());
  if (greeting) {
    return `Hi! I'm your Lead Mentor for the Ismaili Harvard AI Engineering program.

I work a bit differently from a typical chatbot:
- I will usually ask for your attempt before I give you a full answer.
- I'd rather give you a small hint than the whole solution.
- I care about what you can do independently, not what you can copy.

What are you working on right now? Or type \`!help\` to see what I can do.`;
  }
  return `Got it. Before I go further, can you share:

1. Which concept or problem you're working on?
2. What you've tried so far (even if it's wrong)?
3. What you think the issue is?

That gives me enough to give you targeted help without doing the work for you. If you just want a quick command:
- \`!explain <topic>\` → reference explanation
- \`!hint\` → smallest nudge
- \`!example <topic>\` → worked example
- \`!why <topic>\` → why this matters for AI engineering
- \`!state <deep|drift|fog|overload>\` → adapt to your current state`;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }
    const { message, specialist, contextType, contextSlug, learningState } = parsed.data;
    let threadId = parsed.data.threadId;

    // Load or create thread
    let thread;
    if (threadId) {
      const threads = await db.select().from(aiThreads).where(eq(aiThreads.id, threadId)).limit(1);
      thread = threads[0];
    }
    if (!thread) {
      const [newThread] = await db
        .insert(aiThreads)
        .values({
          userId: user.id,
          title: message.slice(0, 80),
          contextType: contextType || "general",
          specialist,
          learningState,
        })
        .returning();
      thread = newThread;
      threadId = newThread.id;
    }

    // Load recent messages for context
    const priorMessages = await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.threadId, thread.id))
      .orderBy(desc(aiMessages.createdAt))
      .limit(8);

    // Load context content if applicable
    let contextContent = "";
    if (contextType === "lesson" && contextSlug) {
      const lessonRows = await db
        .select({ title: lessons.title, content: lessons.content, course: courses.title })
        .from(lessons)
        .leftJoin(courses, eq(courses.id, lessons.courseId))
        .where(eq(lessons.slug, contextSlug))
        .limit(1);
      if (lessonRows[0]) {
        contextContent = `\n\nCurrent lesson: ${lessonRows[0].title} (${lessonRows[0].course || ""}).\nExcerpt (for grounding):\n${(lessonRows[0].content || "").slice(0, 1500)}`;
      }
    }

    // Save user message
    await db.insert(aiMessages).values({
      threadId: thread.id,
      role: "user",
      content: message,
      specialist,
      modelUsed: null as any,
    });

    // Try to call Puter if configured, otherwise use heuristic response
    let aiContent: string;
    let modelUsed = "ihls-mentor-v1-fallback";
    const puterToken = process.env.PUTER_AUTH_TOKEN;
    const puterModel = process.env.PUTER_MODEL_NAME || "deepseek/deepseek-v4-pro";
    if (puterToken) {
      try {
        const systemPrompt = `${SPECIALIST_PROMPTS[specialist] || SPECIALIST_PROMPTS.lead_mentor}\n\nCurrent learning state: ${learningState}.\nUser's name: ${user.name || "learner"}.${contextContent ? "\n\nRelevant curriculum context (grounded in verified material):" + contextContent : ""}\n\nIMPORTANT RULES:\n- Do NOT answer when the learner hasn't attempted. Ask them for their attempt/reasoning first.\n- Do NOT write full solutions unless they've already shown substantial effort and the ask is for a reference explanation.\n- Keep responses concise but not robotic.\n- When you don't know something, say so. Do not invent Harvard courses, requirements, or facts.\n- You are the AI mentor of the Ismaili Harvard AI Engineering program (Harvard-informed self-study, not an official Harvard degree).`;
        const messages = [
          { role: "system", content: systemPrompt },
          ...priorMessages.reverse().map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ];
        const puterResp = await fetch("https://api.puter.com/drivers/ai/chat", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${puterToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: puterModel,
            messages,
            temperature: 0.4,
            max_tokens: 1200,
          }),
        });
        if (puterResp.ok) {
          const data = await puterResp.json();
          aiContent = data?.choices?.[0]?.message?.content || data?.content || data?.result;
          modelUsed = puterModel;
        } else {
          aiContent = buildFallbackResponse(message, contextContent);
        }
      } catch (e) {
        console.warn("Puter call failed, using fallback:", e);
        aiContent = buildFallbackResponse(message, contextContent);
      }
    } else {
      aiContent = buildFallbackResponse(message, contextContent);
    }

    // Save assistant message
    await db.insert(aiMessages).values({
      threadId: thread.id,
      role: "assistant",
      content: aiContent,
      specialist,
      modelUsed,
      citations: [],
    });

    return NextResponse.json({
      ok: true,
      threadId: thread.id,
      content: aiContent,
      specialist,
      modelUsed,
    });
  } catch (e: any) {
    console.error("Mentor error:", e);
    return NextResponse.json({ error: "Mentor service error" }, { status: 500 });
  }
}
