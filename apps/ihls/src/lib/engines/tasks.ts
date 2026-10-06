import "server-only";
import type { Session } from "@/lib/auth/session";
import { owned, type ProjectSubmissionDoc, type SubmissionDoc, type TaskDoc } from "@/lib/dal";
import { dueReviews } from "./review";
import { computeSkillMastery } from "./mastery";
import { buildCurriculumGraph } from "@/content";
import { LEARNING_STATES } from "@/content/learning-science";
import type { Lesson } from "@/content/types";

/**
 * TASK ENGINE (§219, §220, §221).
 *
 * Produces the "what should I do now?" answer. Every suggestion carries a
 * reason; a candidate without a valid reason is not created. Suggestions are
 * ranked by: overdue review → prerequisite gap → active project → career gap →
 * next unstarted lesson. Available time and learning state cap the task size.
 */

export interface Suggestion {
  title: string;
  description: string;
  reasonKind: TaskDoc["reasonKind"];
  reasonText: string;
  targetKind: TaskDoc["targetKind"];
  targetId: string;
  estimatedMinutes: number;
  priority: number;
}

export interface TaskContext {
  learningState: "deep" | "drift" | "fog" | "overload";
  availableMinutes?: number;
  careerTargets: string[];
}

function lessonUnlocked(lesson: Lesson, completedLessonIds: Set<string>): boolean {
  return lesson.prerequisites.every((p) => completedLessonIds.has(p));
}

export async function suggestNextTasks(session: Session, ctx: TaskContext, limit = 5): Promise<Suggestion[]> {
  const graph = buildCurriculumGraph();
  const state = LEARNING_STATES.find((s) => s.id === ctx.learningState) ?? LEARNING_STATES[0];
  const cap = Math.min(ctx.availableMinutes ?? state.adaptation.taskSizeMinutes, state.adaptation.taskSizeMinutes);

  const submissions = await owned<SubmissionDoc>(session, "submissions").find({});
  const attemptedLessonIds = new Set(submissions.map((s) => s.lessonId));
  const passedByLesson = new Map<string, number>();
  for (const s of submissions) if (s.correct) passedByLesson.set(s.lessonId, (passedByLesson.get(s.lessonId) ?? 0) + 1);
  const completedLessonIds = new Set([...passedByLesson.entries()].filter(([, n]) => n >= 1).map(([id]) => id));

  const suggestions: Suggestion[] = [];

  // 1. Overdue reviews — highest priority, because forgetting is the default.
  const due = await dueReviews(session, 5);
  for (const r of due) {
    const assessment = graph.assessments.find((a) => a.id === r.refId);
    const lesson = graph.lessons.find((l) => l.id === r.lessonId);
    if (!assessment || !lesson) continue;
    suggestions.push({
      title: `Review: ${lesson.title}`,
      description: assessment.prompt.slice(0, 140),
      reasonKind: "review",
      reasonText: `Due since ${new Date(r.dueAt).toLocaleDateString()}. Spacing protects what you already paid for.`,
      targetKind: "assessment",
      targetId: assessment.id,
      estimatedMinutes: Math.min(assessment.estimatedMinutes, cap),
      priority: 100 - Math.min(20, r.lapses * 2),
    });
  }

  // 2. Prerequisite weakness — a skill below "competent" that later lessons depend on.
  const allSkillIds = graph.skills.map((s) => s.id);
  const mastery = await computeSkillMastery(session, allSkillIds);
  const weakSkills = [...mastery.values()].filter((m) => m.attempts > 0 && (m.level === "developing" || m.level === "exposed"));
  for (const weak of weakSkills.slice(0, 3)) {
    const lesson = graph.lessons.find((l) => l.skills.includes(weak.skillId) && attemptedLessonIds.has(l.id));
    const assessment = graph.assessments.find((a) => a.skillIds.includes(weak.skillId) && a.tier !== "recall");
    if (!assessment || !lesson) continue;
    suggestions.push({
      title: `Strengthen: ${graph.skills.find((s) => s.id === weak.skillId)?.title ?? weak.skillId}`,
      description: assessment.prompt.slice(0, 140),
      reasonKind: "prerequisite",
      reasonText: `This skill is at "${weak.level}" and later material depends on it.`,
      targetKind: "assessment",
      targetId: assessment.id,
      estimatedMinutes: Math.min(assessment.estimatedMinutes, cap),
      priority: 80,
    });
  }

  // 3. Active project milestone.
  const projects = await owned<ProjectSubmissionDoc>(session, "project_submissions").find({ status: "in_progress" });
  for (const p of projects.slice(0, 2)) {
    const spec = graph.projects.find((x) => x.id === p.projectId);
    if (!spec) continue;
    const nextMilestone = spec.milestones.find((m) => !p.dodChecked.includes(m.id));
    if (!nextMilestone) continue;
    suggestions.push({
      title: `${spec.title}: ${nextMilestone.title}`,
      description: nextMilestone.definitionOfDone.join(" · "),
      reasonKind: "project",
      reasonText: "Your active project is the evidence your CV will point at.",
      targetKind: "project",
      targetId: spec.id,
      estimatedMinutes: Math.min(60, cap),
      priority: 70,
    });
  }

  // 4. Career gap — a hard requirement with no evidence yet.
  for (const roleId of ctx.careerTargets) {
    const role = graph.roles.find((r) => r.id === roleId);
    if (!role) continue;
    const gap = role.requirements
      .filter((r) => r.kind === "hard")
      .find((r) => r.skillIds.every((s) => (mastery.get(s)?.level ?? "unknown") === "unknown"));
    if (!gap) continue;
    const lesson = graph.lessons.find((l) => l.skills.some((s) => gap.skillIds.includes(s)) && lessonUnlocked(l, completedLessonIds));
    if (!lesson) continue;
    suggestions.push({
      title: `Start: ${lesson.title}`,
      description: lesson.learningObjectives[0] ?? "",
      reasonKind: "career",
      reasonText: `"${gap.label}" is a hard requirement of your target role and you have no evidence for it yet.`,
      targetKind: "lesson",
      targetId: lesson.id,
      estimatedMinutes: Math.min(lesson.estimatedEffortMinutes, cap),
      priority: 60,
    });
    break;
  }

  // 5. Next unlocked lesson in spine order.
  const stageOrder = new Map(graph.stages.map((s) => [s.id, s.order]));
  const nextLesson = graph.lessons
    .filter((l) => !attemptedLessonIds.has(l.id) && lessonUnlocked(l, completedLessonIds))
    .sort((a, b) => (stageOrder.get(a.stageId) ?? 99) - (stageOrder.get(b.stageId) ?? 99) || a.level - b.level)[0];
  if (nextLesson) {
    suggestions.push({
      title: `Study: ${nextLesson.title}`,
      description: nextLesson.learningObjectives[0] ?? "",
      reasonKind: "evidence",
      reasonText: `Next unlocked node in ${graph.stages.find((s) => s.id === nextLesson.stageId)?.title}. Its prerequisites are satisfied.`,
      targetKind: "lesson",
      targetId: nextLesson.id,
      estimatedMinutes: Math.min(nextLesson.estimatedEffortMinutes, cap),
      priority: 40,
    });
  }

  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, limit);
}
