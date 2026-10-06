import "server-only";
import type { Session } from "@/lib/auth/session";
import { owned, recordEvent, newId, type AiMessageDoc, type AiThreadDoc, type SubmissionDoc, type ErrorEntryDoc, type SettingsDoc } from "@/lib/dal";
import { getProvider, routeModel, type ChatMessage } from "./provider";
import { buildCurriculumGraph } from "@/content";
import { computeSkillMastery } from "@/lib/engines/mastery";

/**
 * AI MENTOR COUNCIL (§139, §140, §141, §142, §183, §194).
 *
 * One Lead Mentor routes to one specialist per turn. There is no recursive
 * agent loop. Context is retrieved, scoped and minimal: only the current node,
 * its prerequisites, the student's own mastery and recent errors — never another
 * student's data, never the whole curriculum in one prompt.
 */

export const SPECIALISTS = [
  { id: "socratic", label: "Socratic Tutor", brief: "Teaches by questioning. Gives the smallest useful hint, then asks you to try again." },
  { id: "research_specialist", label: "Research Specialist", brief: "Finds, checks and cites sources. States uncertainty explicitly." },
  { id: "curriculum_auditor", label: "Curriculum Auditor", brief: "Checks whether the sequence, prerequisites and claims hold together." },
  { id: "examiner", label: "Examiner", brief: "Asks for proof of understanding and marks against the rubric." },
  { id: "code_reviewer", label: "Code Reviewer", brief: "Reviews correctness, design and style — in that order." },
  { id: "project_supervisor", label: "Project Supervisor", brief: "Holds the definition of done and the evidence requirements." },
  { id: "career_analyst", label: "Career Analyst", brief: "Maps work to role requirements and refuses unsupported CV claims." },
  { id: "freelance_coach", label: "Freelance Coach", brief: "Trains discovery, scope, estimates and client communication." },
  { id: "english_coach", label: "English Coach", brief: "Improves technical English without removing technical terms." },
  { id: "study_coach", label: "Study Coach", brief: "Adapts task size and sequencing to your current study state." },
  { id: "integrity_reviewer", label: "AI Safety / Integrity Reviewer", brief: "Watches for AI dependency and academic-integrity drift." },
  { id: "writing_coach", label: "Technical Writing Coach", brief: "Improves documents, ADRs, model cards and reports." },
] as const;

export type SpecialistId = (typeof SPECIALISTS)[number]["id"];

export const MENTOR_ACTIONS = [
  { id: "explain", label: "Explain", specialist: "socratic", helpLevel: "Guidance" },
  { id: "hint", label: "Give me a hint", specialist: "socratic", helpLevel: "Hint" },
  { id: "check", label: "Check my reasoning", specialist: "examiner", helpLevel: "Guidance" },
  { id: "simplify", label: "Simplify", specialist: "english_coach", helpLevel: "Concept Reminder" },
  { id: "example", label: "Give an example", specialist: "socratic", helpLevel: "Worked Example" },
  { id: "challenge", label: "Challenge me", specialist: "examiner", helpLevel: "No Help" },
  { id: "arabic", label: "Arabic explanation", specialist: "english_coach", helpLevel: "Full Explanation" },
  { id: "b1b2", label: "B1-B2 English", specialist: "english_coach", helpLevel: "Concept Reminder" },
  { id: "oral", label: "Ask me verbally", specialist: "examiner", helpLevel: "No Help" },
  { id: "project", label: "Connect to project", specialist: "project_supervisor", helpLevel: "Guidance" },
  { id: "notebook", label: "Tell me what to write", specialist: "study_coach", helpLevel: "Guidance" },
] as const;

export type MentorActionId = (typeof MENTOR_ACTIONS)[number]["id"];

const LEAD_RULES = `You are the Lead Mentor of a serious AI-engineering learning system.

Non-negotiable behaviour:
- Default to active learning: identify the objective, check prerequisites, explain only what is necessary, give one example, then ask the student to attempt the work.
- Give the SMALLEST useful hint first. Do not solve the problem unless the action explicitly requests a full explanation.
- Never invent Harvard courses, job requirements, metrics, sources or results. If you do not know, say so plainly.
- Keep authentic technical terminology. In B1-B2 mode simplify the surrounding sentence, never the canonical term.
- Be direct and adult. No motivational filler, no praise for trivial actions, no emoji.
- If the student is asking you to do their thinking, say so and redirect.`;

export interface MentorContext {
  lessonId?: string;
  assessmentId?: string;
  studentQuestion: string;
  action: MentorActionId;
}

async function assembleContext(session: Session, ctx: MentorContext, settings: SettingsDoc): Promise<{ prompt: string; refs: string[] }> {
  const graph = buildCurriculumGraph();
  const refs: string[] = [];
  const parts: string[] = [];

  if (ctx.lessonId) {
    const lesson = graph.lessons.find((l) => l.id === ctx.lessonId);
    if (lesson) {
      refs.push(lesson.id);
      const course = graph.courses.find((c) => c.id === lesson.courseId);
      parts.push(
        [
          `CURRENT NODE: ${lesson.title}`,
          `Course: ${course?.title} (${lesson.sourceCategory}, importance ${lesson.importance})`,
          `Objectives: ${lesson.learningObjectives.join(" | ")}`,
          `Topics: ${lesson.topics.join(", ")}`,
          `Mastery criteria: ${lesson.masteryCriteria.join(" | ")}`,
          lesson.contentStatus === "outline_only"
            ? "NOTE: this lesson is seeded as an outline only. Teach from the topic list and say that the written lesson has not been authored yet."
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
      if (lesson.prerequisites.length) {
        const prereqs = lesson.prerequisites.map((p) => graph.lessons.find((l) => l.id === p)?.title).filter(Boolean);
        parts.push(`PREREQUISITES: ${prereqs.join("; ")}`);
      }
      // Retrieve only the most relevant authored blocks, not the whole lesson (§183).
      const q = ctx.studentQuestion.toLowerCase();
      const scored = lesson.blocks
        .map((b) => ({ b, score: q.split(/\W+/).filter((w) => w.length > 4 && b.body.toLowerCase().includes(w)).length }))
        .sort((x, y) => y.score - x.score)
        .slice(0, 2)
        .filter((x) => x.score > 0 || lesson.blocks.length <= 2);
      for (const { b } of scored) {
        refs.push(`${lesson.id}#${b.id}`);
        parts.push(`LESSON EXTRACT (${b.kind} — ${b.title}):\n${b.body.slice(0, 1200)}`);
      }
    }
  }

  if (ctx.assessmentId) {
    const a = graph.assessments.find((x) => x.id === ctx.assessmentId);
    if (a) {
      refs.push(a.id);
      parts.push(`CURRENT TASK (${a.type}, tier ${a.tier}): ${a.prompt}\nRubric: ${a.rubric.join(" | ")}\nDO NOT reveal the expected points unless the action is a full explanation.`);
    }
  }

  const mastery = await computeSkillMastery(session, graph.skills.map((s) => s.id));
  const weak = [...mastery.values()].filter((m) => m.attempts > 0 && m.level !== "independent").slice(0, 5);
  if (weak.length) {
    parts.push(`STUDENT MASTERY (own data only): ${weak.map((m) => `${graph.skills.find((s) => s.id === m.skillId)?.title}=${m.level}`).join(", ")}`);
  }

  const errors = await owned<ErrorEntryDoc>(session, "error_notebook").find({ resolved: false }, { sort: { createdAt: -1 }, limit: 3 });
  if (errors.length) parts.push(`RECENT UNRESOLVED ERRORS: ${errors.map((e) => `${e.errorType}: ${e.description}`).join(" | ")}`);

  parts.push(
    `STUDENT PREFERENCES: English mode=${settings.englishMode}; interface language=${settings.language}; study state=${settings.learningState}; hint policy=${settings.hintPolicy}.`,
  );

  return { prompt: parts.join("\n\n"), refs };
}

export async function runMentor(session: Session, ctx: MentorContext, settings: SettingsDoc, threadId?: string) {
  const action = MENTOR_ACTIONS.find((a) => a.id === ctx.action) ?? MENTOR_ACTIONS[0];
  const specialist = SPECIALISTS.find((s) => s.id === action.specialist)!;
  const { prompt, refs } = await assembleContext(session, ctx, settings);

  const actionRule: Record<MentorActionId, string> = {
    explain: "Explain the concept at the minimum depth needed, then ask one question that checks understanding.",
    hint: "Give exactly one hint — the smallest that unblocks the next step. Do not give the answer. End by asking them to try again.",
    check: "Inspect the student's reasoning. Name what is correct, name the first thing that is wrong, and ask them to repair it themselves.",
    simplify: "Restate at B1-B2 level. Keep every canonical technical term; simplify only the surrounding language.",
    example: "Give one worked example, fully worked, then a second similar problem for the student to solve alone.",
    challenge: "Pose one harder problem that requires transfer to a new context. Do not teach first.",
    arabic: "Answer in Modern Standard Arabic, but keep technical terms in English with the Arabic meaning in parentheses.",
    b1b2: "Answer in simplified B1-B2 English while keeping all technical terms exact.",
    oral: "Ask the student to answer aloud. Give one question, state the time limit, and say what you will assess.",
    project: "Connect this concept to the student's active project and name the specific artefact it should produce.",
    notebook: "State exactly what belongs in the notebook under MUST WRITE, RECOMMENDED and OPTIONAL. Be short and concrete.",
  };

  const messages: ChatMessage[] = [
    { role: "system", content: `${LEAD_RULES}\n\nACTIVE SPECIALIST: ${specialist.label} — ${specialist.brief}\nACTION RULE: ${actionRule[ctx.action]}` },
    { role: "system", content: `RETRIEVED CONTEXT (do not quote verbatim unless asked):\n${prompt}` },
    { role: "user", content: ctx.studentQuestion },
  ];

  const tier = routeModel(specialist.id);
  const result = await getProvider().chat(messages, tier);

  // Persist the exchange, including truthful failure states.
  const threads = owned<AiThreadDoc>(session, "ai_threads");
  let thread = threadId ? await threads.findOne({ _id: threadId }) : null;
  if (!thread) {
    thread = await threads.insert({
      _id: newId("thr"),
      title: ctx.studentQuestion.slice(0, 60) || specialist.label,
      lessonId: ctx.lessonId,
      lastMessageAt: new Date().toISOString(),
    });
  }
  const messagesStore = owned<AiMessageDoc>(session, "ai_messages");
  await messagesStore.insert({
    _id: newId("msg"),
    threadId: thread._id,
    role: "student",
    specialist: specialist.id,
    content: ctx.studentQuestion,
    contextRefs: refs,
    status: "ok",
  });
  const reply = await messagesStore.insert({
    _id: newId("msg"),
    threadId: thread._id,
    role: "mentor",
    specialist: specialist.id,
    content: result.status === "ok" ? result.text : "",
    model: result.status === "ok" ? result.model : undefined,
    contextRefs: refs,
    status: result.status === "ok" ? "ok" : result.status === "provider_unavailable" ? "provider_unavailable" : "error",
  });
  await threads.update({ _id: thread._id }, { lastMessageAt: new Date().toISOString() });
  await recordEvent(session, "mentor_call", { specialist: specialist.id, action: ctx.action, status: result.status, helpLevel: action.helpLevel }, ctx.lessonId);

  return { thread, reply, result, specialist, helpLevel: action.helpLevel };
}

/** §26, §225 — AI dependency audit computed from real recorded help levels. */
export async function aiDependencyAudit(session: Session) {
  const submissions = await owned<SubmissionDoc>(session, "submissions").find({});
  const total = submissions.length;
  if (total === 0) return { total: 0, unaidedRate: null, byLevel: {} as Record<string, number>, verdict: "No attempts recorded yet." };
  const byLevel: Record<string, number> = {};
  for (const s of submissions) byLevel[s.helpLevel] = (byLevel[s.helpLevel] ?? 0) + 1;
  const unaided = (byLevel["No Help"] ?? 0) + (byLevel["Hint"] ?? 0);
  const unaidedRate = unaided / total;
  const verdict =
    unaidedRate >= 0.6
      ? "Healthy: most first attempts are unaided or hint-level."
      : unaidedRate >= 0.35
        ? "Watch: assistance is frequent. Try attempting before opening the mentor."
        : "Dependency risk: most attempts use heavy assistance. Independent performance is not being trained.";
  return { total, unaidedRate, byLevel, verdict };
}
