import { ORIGINAL_MODULES } from "./original-curriculum";
import { ORIGINAL_LESSON_META } from "./lesson-meta";
import { EXTENSION_LESSONS } from "./extension-lessons";
import { AUTHORED_BLOCKS } from "./authored";
import { STAGES, COURSES, COURSE_BY_ID } from "./stages";
import { SKILLS } from "./skills";
import { PROJECTS } from "./projects";
import { ROLES } from "./roles";
import { ENGLISH_TERMS } from "./english";
import { SOURCES } from "./sources";
import { HARVARD_MAPPINGS } from "./harvard";
import { ASSESSMENTS } from "./assessments";
import type { CurriculumGraph, Lesson } from "./types";

export const CONTENT_VERSION = "1.0.0";
const VERSION = CONTENT_VERSION;
const VERIFIED = "2026-10-05";

/** Maps an original module id to the course that carries it. */
const MODULE_TO_COURSE: Record<string, string> = {
  om1: "c-python",
  om2: "c-math-foundations",
  om3: "c-data-analysis",
  om4: "c-excel-powerbi",
  om5: "c-databases",
  om6: "c-ml",
  om7: "c-deep-learning",
  om8: "c-deployment",
};

function buildOriginalLessons(): Lesson[] {
  const out: Lesson[] = [];
  for (const mod of ORIGINAL_MODULES) {
    const courseId = MODULE_TO_COURSE[mod.id];
    const course = COURSE_BY_ID[courseId];
    if (!course) throw new Error(`No course mapped for original module ${mod.id}`);
    for (const session of mod.sessions) {
      const key = `${mod.id}-${session.n}`;
      const id = `l-${key}`;
      const meta = ORIGINAL_LESSON_META[key];
      if (!meta) throw new Error(`Missing lesson metadata for ${key} — original material must never be dropped.`);
      const blocks = AUTHORED_BLOCKS[id] ?? [];
      out.push({
        id,
        type: "lesson",
        courseId,
        stageId: course.stageId,
        title: `${mod.title} · ${session.title}`,
        originalSession: session.n,
        sourceCategory: "Original Curriculum",
        importance: meta.importance,
        level: meta.level,
        prerequisites: meta.prereqs,
        corequisites: [],
        topics: session.topics,
        learningObjectives: meta.objectives,
        skills: meta.skills,
        estimatedEffortMinutes: meta.effort,
        masteryCriteria: meta.mastery,
        projects: meta.projects ?? [],
        careerRoles: meta.roles ?? [],
        sources: course.sources ?? [],
        notebook: meta.notebook,
        blocks,
        contentStatus: blocks.length > 0 ? "authored" : "outline_only",
        harvardMappings: course.harvardMappings ?? [],
        version: VERSION,
        lastVerified: VERIFIED,
      });
    }
  }
  return out;
}

function buildExtensionLessons(): Lesson[] {
  return EXTENSION_LESSONS.map((l) => {
    const course = COURSE_BY_ID[l.courseId];
    if (!course) throw new Error(`Unknown course ${l.courseId} for lesson ${l.id}`);
    const blocks = AUTHORED_BLOCKS[l.id] ?? [];
    return {
      id: l.id,
      type: "lesson" as const,
      courseId: l.courseId,
      stageId: course.stageId,
      title: l.title,
      sourceCategory: l.sourceCategory,
      importance: l.importance,
      level: l.level,
      prerequisites: l.prereqs,
      corequisites: [],
      topics: l.topics,
      learningObjectives: l.objectives,
      skills: l.skills,
      estimatedEffortMinutes: l.effort,
      masteryCriteria: l.mastery,
      projects: l.projects ?? [],
      careerRoles: l.roles ?? [],
      sources: l.sources ?? course.sources ?? [],
      notebook: l.notebook,
      blocks,
      contentStatus: (blocks.length > 0 ? "authored" : "outline_only") as Lesson["contentStatus"],
      harvardMappings: l.harvardMappings ?? course.harvardMappings ?? [],
      version: VERSION,
      lastVerified: VERIFIED,
    };
  });
}

export interface GraphValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
  stats: Record<string, number>;
}

/** §128 — detect prerequisite cycles and dangling references before publication. */
export function validateGraph(graph: CurriculumGraph): GraphValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lessonIds = new Set(graph.lessons.map((l) => l.id));
  const skillIds = new Set(graph.skills.map((s) => s.id));
  const projectIds = new Set(graph.projects.map((p) => p.id));
  const roleIds = new Set(graph.roles.map((r) => r.id));
  const sourceIds = new Set(graph.sources.map((s) => s.sourceId));
  const mappingIds = new Set(graph.harvardMappings.map((m) => m.id));
  const courseIds = new Set(graph.courses.map((c) => c.id));
  const stageIds = new Set(graph.stages.map((s) => s.id));

  for (const l of graph.lessons) {
    if (!courseIds.has(l.courseId)) errors.push(`lesson ${l.id}: unknown course ${l.courseId}`);
    if (!stageIds.has(l.stageId)) errors.push(`lesson ${l.id}: unknown stage ${l.stageId}`);
    for (const p of l.prerequisites) if (!lessonIds.has(p)) errors.push(`lesson ${l.id}: unknown prerequisite ${p}`);
    for (const s of l.skills) if (!skillIds.has(s)) errors.push(`lesson ${l.id}: unknown skill ${s}`);
    for (const p of l.projects) if (!projectIds.has(p)) errors.push(`lesson ${l.id}: unknown project ${p}`);
    for (const r of l.careerRoles) if (!roleIds.has(r)) errors.push(`lesson ${l.id}: unknown role ${r}`);
    for (const s of l.sources) if (!sourceIds.has(s)) errors.push(`lesson ${l.id}: unknown source ${s}`);
    for (const m of l.harvardMappings ?? []) if (!mappingIds.has(m)) errors.push(`lesson ${l.id}: unknown harvard mapping ${m}`);
    if (l.topics.length === 0) errors.push(`lesson ${l.id}: has no topics`);
    if (l.learningObjectives.length === 0) errors.push(`lesson ${l.id}: has no objectives`);
  }

  for (const a of graph.assessments) {
    if (!lessonIds.has(a.lessonId)) errors.push(`assessment ${a.id}: unknown lesson ${a.lessonId}`);
    for (const s of a.skillIds) if (!skillIds.has(s)) errors.push(`assessment ${a.id}: unknown skill ${s}`);
    if (a.evaluation === "auto" && a.numericAnswer === undefined && a.correctChoiceIndex === undefined) {
      errors.push(`assessment ${a.id}: claims automatic evaluation but has no deterministic answer`);
    }
  }

  for (const s of graph.skills) for (const d of s.dependsOn) if (!skillIds.has(d)) errors.push(`skill ${s.id}: unknown dependency ${d}`);
  for (const m of graph.harvardMappings) if (!sourceIds.has(m.sourceId)) errors.push(`mapping ${m.id}: unknown source ${m.sourceId}`);

  // Cycle detection over lesson prerequisites (iterative DFS).
  const colour = new Map<string, 0 | 1 | 2>();
  const byId = new Map(graph.lessons.map((l) => [l.id, l]));
  const visit = (start: string) => {
    const stack: { id: string; i: number }[] = [{ id: start, i: 0 }];
    colour.set(start, 1);
    while (stack.length) {
      const frame = stack[stack.length - 1];
      const node = byId.get(frame.id);
      const prereqs = node?.prerequisites ?? [];
      if (frame.i < prereqs.length) {
        const next = prereqs[frame.i++];
        const c = colour.get(next) ?? 0;
        if (c === 1) errors.push(`prerequisite cycle detected involving ${frame.id} → ${next}`);
        else if (c === 0 && byId.has(next)) {
          colour.set(next, 1);
          stack.push({ id: next, i: 0 });
        }
      } else {
        colour.set(frame.id, 2);
        stack.pop();
      }
    }
  };
  for (const l of graph.lessons) if ((colour.get(l.id) ?? 0) === 0) visit(l.id);

  // Truthfulness warnings — surfaced in the admin audit, never hidden.
  const outlineOnly = graph.lessons.filter((l) => l.contentStatus === "outline_only").length;
  if (outlineOnly) warnings.push(`${outlineOnly} lessons are outline-only; the UI must say so rather than imply authored content.`);
  const lessonsWithoutAssessments = graph.lessons.filter((l) => !graph.assessments.some((a) => a.lessonId === l.id)).length;
  if (lessonsWithoutAssessments) warnings.push(`${lessonsWithoutAssessments} lessons have no assessment items yet.`);

  const topicCount = graph.lessons.reduce((n, l) => n + l.topics.length, 0);
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      stages: graph.stages.length,
      courses: graph.courses.length,
      lessons: graph.lessons.length,
      topics: topicCount,
      assessments: graph.assessments.length,
      skills: graph.skills.length,
      projects: graph.projects.length,
      roles: graph.roles.length,
      sources: graph.sources.length,
      harvardMappings: graph.harvardMappings.length,
      englishTerms: graph.englishTerms.length,
      authoredLessons: graph.lessons.filter((l) => l.contentStatus === "authored").length,
    },
  };
}

export function buildCurriculumGraph(): CurriculumGraph {
  const lessons = [...buildOriginalLessons(), ...buildExtensionLessons()];
  return {
    stages: STAGES,
    courses: COURSES,
    lessons,
    assessments: ASSESSMENTS,
    skills: SKILLS,
    projects: PROJECTS,
    roles: ROLES,
    englishTerms: ENGLISH_TERMS,
    sources: SOURCES,
    harvardMappings: HARVARD_MAPPINGS,
  };
}

export * from "./types";
export { ORIGINAL_MODULES, ORIGINAL_TOPIC_COUNT } from "./original-curriculum";
export { HARVARD_REALITY_CHECK, HARVARD_GAP_MATRIX } from "./harvard";
export { LEARNING_STATES, HELP_LEVELS, ERROR_TYPES, MASTERY_LEVELS, PROGRESS_DIMENSIONS, SPACING, MECHANISM_EVIDENCE, RESEARCH_HYPOTHESES, LEARNING_YIELD_INPUTS } from "./learning-science";
export { PROJECT_LADDER } from "./projects";
export { ENGLISH_DIMENSIONS, SPEAKING_ACTIVITIES } from "./english";
export { STAGES, COURSES } from "./stages";
