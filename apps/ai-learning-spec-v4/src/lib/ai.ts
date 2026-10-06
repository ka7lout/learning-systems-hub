import "server-only";
import { getLesson } from "@/content/curriculum";

// AIProvider abstraction (spec §200): external providers are attempted when
// configured; when none is configured or a call fails, the system reports a
// TRUTHFUL unavailable state and offers a clearly-labeled rule-based Socratic
// guide instead. Failures are never simulated as success (Absolute Truthfulness Rule).

export interface MentorContext {
  lessonSlug?: string;
  moduleSlug?: string;
  learningState: string;
  englishMode: string;
  studentName: string;
}

export interface MentorResult {
  ok: boolean;
  content: string;
  provider: string; // model identifier or "socratic-fallback"
  degraded: boolean; // true when the rule-based fallback answered
}

const SYSTEM_POLICY = `You are the Lead Mentor of the Ismaili Harvard AI Engineering Learning OS — a Harvard-informed self-study curriculum (NOT a Harvard degree; never imply enrollment or credentials).
Teaching contract (IHLS):
- Default flow: identify objective → check prerequisites → explain only what is needed → small example → ask for the student's ATTEMPT → diagnose → smallest useful hint → retry → explain the gap → new problem → transfer.
- If the student asks a practice question without showing an attempt, ask for their attempt first and give only the smallest useful hint. If they explicitly request a full reference explanation or lecture, provide it completely — do not be artificially withholding.
- Anti-reassurance guardrail: do not re-confirm the same answer repeatedly without new evidence; after sufficient confirmation, move to application or a transfer task.
- Never invent Harvard courses, requirements, metrics, or results. Say "I don't know" or "not verified" when uncertain.
- Keep canonical English technical terms; adapt surrounding language to the requested English mode (standard technical English, or B1–B2 simplified with terms kept).
- Adapt task size to the student's reported state (deep/drift/fog/overload): smaller steps and lower friction for fog/overload; richer challenges for deep.
- Be a capable human tutor, not an operating system debugging a human. No fake cognitive scores.`;

function buildContextBlock(ctx: MentorContext): string {
  let block = `Student: ${ctx.studentName}. Reported study state: ${ctx.learningState}. English mode: ${ctx.englishMode}.`;
  if (ctx.lessonSlug && ctx.moduleSlug) {
    const found = getLesson(ctx.moduleSlug, ctx.lessonSlug);
    if (found) {
      block += `\nCurrent lesson: "${found.lesson.title}" (${found.module.title}).`;
      block += `\nWhy it matters: ${found.lesson.why}`;
      block += `\nObjectives: ${found.lesson.objectives.join(" | ")}`;
      block += `\nTopics: ${found.lesson.topics.map((t) => t.name).join(", ")}`;
    }
  }
  return block;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: 900 }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`Provider HTTP ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Provider returned empty content");
  return content;
}

async function callAnthropic(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const rest = messages.filter((m) => m.role !== "system");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
      max_tokens: 900,
      system,
      messages: rest.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Anthropic returned empty content");
  return text;
}

export function externalProviderConfigured(): boolean {
  return Boolean(
    process.env.PUTER_AUTH_TOKEN || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
  );
}

/**
 * Rule-based Socratic guide. Clearly labeled as offline/rule-based —
 * it never pretends to be a live model.
 */
function socraticFallback(userMessage: string, ctx: MentorContext): string {
  const found =
    ctx.lessonSlug && ctx.moduleSlug ? getLesson(ctx.moduleSlug, ctx.lessonSlug) : undefined;
  const lower = userMessage.toLowerCase();
  const wantsAnswer =
    /answer|solve|solution|give me|what is the|explain fully|full explanation/.test(lower);
  const lines: string[] = [];
  lines.push(
    "**Structured practice guide (rule-based — no live AI model is configured right now).**"
  );
  if (found) {
    lines.push(
      `\nWe are inside **${found.lesson.title}**. Why it matters: ${found.lesson.why}`
    );
    lines.push(`\n**Work the IHLS loop on your question:**`);
    lines.push(`1. **Attempt first.** Write your best attempt — even a wrong one produces diagnostic signal.`);
    lines.push(
      `2. **Smallest hint:** re-read this lesson's objective most related to your question: ${found.lesson.objectives
        .slice(0, 2)
        .map((o) => `"${o}"`)
        .join(" or ")}`
    );
    lines.push(
      `3. **Retrieve before looking:** close the material and explain the relevant topic (${found.lesson.topics
        .slice(0, 3)
        .map((t) => t.name)
        .join(", ")}…) in your own words.`
    );
    lines.push(
      `4. **Then check** against the lesson content, log any error in your notebook (concept / recall / selection / execution / transfer), and try the transfer task: *${found.lesson.transfer.title}*.`
    );
  } else {
    lines.push(
      "\nPick a lesson from the Curriculum and open the mentor from inside it so the guide can anchor to real objectives. Meanwhile: write your attempt first, then compare it against the lesson's worked example, then attempt the transfer task."
    );
  }
  if (wantsAnswer) {
    lines.push(
      "\n*A live mentor model would now wait for your attempt before revealing a full solution. The rule-based guide cannot grade free-form answers — use the lesson's mastery checkpoint and the review queue to verify yourself honestly.*"
    );
  }
  lines.push(
    "\n*To enable the live AI mentor, an administrator must configure `PUTER_AUTH_TOKEN`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` on the server.*"
  );
  return lines.join("\n");
}

export async function askMentor(
  history: { role: "user" | "mentor"; content: string }[],
  userMessage: string,
  ctx: MentorContext
): Promise<MentorResult> {
  const messages: ChatMessage[] = [
    { role: "system", content: `${SYSTEM_POLICY}\n\n${buildContextBlock(ctx)}` },
    ...history.slice(-10).map(
      (m): ChatMessage => ({
        role: m.role === "mentor" ? "assistant" : "user",
        content: m.content,
      })
    ),
    { role: "user", content: userMessage },
  ];

  // Try configured providers in order; report truthful failure otherwise.
  if (process.env.OPENAI_API_KEY) {
    try {
      const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
      const content = await callOpenAICompatible(
        process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
        process.env.OPENAI_API_KEY,
        model,
        messages
      );
      return { ok: true, content, provider: model, degraded: false };
    } catch {
      // fall through to next provider / fallback
    }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const content = await callAnthropic(process.env.ANTHROPIC_API_KEY, messages);
      return {
        ok: true,
        content,
        provider: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
        degraded: false,
      };
    } catch {
      // fall through
    }
  }
  if (process.env.PUTER_AUTH_TOKEN) {
    try {
      // Puter driver call (OpenAI-compatible shape via drivers API).
      const res = await fetch("https://api.puter.com/drivers/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PUTER_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          interface: "puter-chat-completion",
          method: "complete",
          args: {
            messages,
            model: process.env.PUTER_MODEL_NAME ?? "deepseek/deepseek-v4-pro",
          },
        }),
        signal: AbortSignal.timeout(45000),
      });
      if (!res.ok) throw new Error(`Puter HTTP ${res.status}`);
      const data = (await res.json()) as {
        result?: { message?: { content?: string | { text?: string }[] } };
      };
      const raw = data.result?.message?.content;
      const content =
        typeof raw === "string" ? raw : raw?.map((c) => c.text ?? "").join("") ?? "";
      if (!content) throw new Error("Puter returned empty content");
      return {
        ok: true,
        content,
        provider: process.env.PUTER_MODEL_NAME ?? "deepseek/deepseek-v4-pro",
        degraded: false,
      };
    } catch {
      // fall through
    }
  }

  // Truthful degraded state: rule-based guide, clearly labeled.
  return {
    ok: true,
    content: socraticFallback(userMessage, ctx),
    provider: "socratic-fallback",
    degraded: true,
  };
}
