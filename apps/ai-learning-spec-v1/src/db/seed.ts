import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  assessmentItems,
  careerRoles,
  courses,
  englishTerms,
  freelanceScenarios,
  lessons,
  prerequisites,
  projectCatalog,
  roleRequirements,
  skills,
  sources,
  tracks,
} from "@/db/schema";
import { ORIGINAL_COURSES, ORIGINAL_LESSONS } from "@/content/original";
import { EXTENDED_COURSES, EXTENDED_LESSONS, SOURCES, TRACKS } from "@/content/extended";
import { CAREER_ROLES, ENGLISH_TERMS, FREELANCE_SCENARIOS, PROJECTS, SKILLS } from "@/content/catalog";
import { HANDCRAFTED_ITEMS, defaultItemsFor } from "@/content/assessments";

export const ALL_COURSES = [...ORIGINAL_COURSES, ...EXTENDED_COURSES];
export const ALL_LESSONS = [...ORIGINAL_LESSONS, ...EXTENDED_LESSONS];

export function buildAllItems() {
  const handcraftedLessonKeys = new Set(HANDCRAFTED_ITEMS.map((i) => i.lessonKey));
  const generated = ALL_LESSONS.flatMap((lesson) =>
    handcraftedLessonKeys.has(lesson.key) ? defaultItemsFor(lesson).slice(0, 2) : defaultItemsFor(lesson),
  );
  return [...HANDCRAFTED_ITEMS, ...generated];
}

/** Validation gate (spec §187): never publish an inconsistent curriculum graph. */
export function validateCurriculum(): string[] {
  const problems: string[] = [];
  const courseKeys = new Set(ALL_COURSES.map((c) => c.key));
  const trackKeys = new Set(TRACKS.map((t) => t.key));
  const skillKeys = new Set(SKILLS.map((s) => s.key));

  for (const course of ALL_COURSES) {
    if (!trackKeys.has(course.trackKey)) problems.push(`Course ${course.key}: unknown track ${course.trackKey}`);
    if (course.masteryCriteria.length === 0) problems.push(`Course ${course.key}: no mastery criteria`);
    for (const p of course.prerequisites ?? []) {
      if (!courseKeys.has(p)) problems.push(`Course ${course.key}: unknown prerequisite ${p}`);
    }
  }
  // cycle detection
  const adj = new Map<string, string[]>();
  for (const c of ALL_COURSES) adj.set(c.key, c.prerequisites ?? []);
  const state = new Map<string, number>();
  const visit = (node: string, path: string[]): void => {
    const s = state.get(node) ?? 0;
    if (s === 1) {
      problems.push(`Prerequisite cycle: ${[...path, node].join(" → ")}`);
      return;
    }
    if (s === 2) return;
    state.set(node, 1);
    for (const next of adj.get(node) ?? []) visit(next, [...path, node]);
    state.set(node, 2);
  };
  for (const c of ALL_COURSES) visit(c.key, []);

  const lessonCourseKeys = new Set(ALL_LESSONS.map((l) => l.courseKey));
  for (const key of lessonCourseKeys) {
    if (!courseKeys.has(key)) problems.push(`Lesson references unknown course ${key}`);
  }
  for (const lesson of ALL_LESSONS) {
    if (lesson.topics.length === 0) problems.push(`Lesson ${lesson.key}: no topics`);
    if (lesson.notebook.mustWrite.length === 0) problems.push(`Lesson ${lesson.key}: no notebook guidance`);
    for (const s of lesson.skillKeys) {
      if (!skillKeys.has(s)) problems.push(`Lesson ${lesson.key}: unknown skill ${s}`);
    }
  }
  for (const role of CAREER_ROLES) {
    for (const r of role.requirements) {
      if (!skillKeys.has(r.skillKey)) problems.push(`Role ${role.key}: unknown skill ${r.skillKey}`);
    }
  }
  return problems;
}

let seedPromise: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const problems = validateCurriculum();
  if (problems.length > 0) {
    throw new Error(`Curriculum validation failed:\n${problems.join("\n")}`);
  }

  await db
    .insert(tracks)
    .values(TRACKS.map((t, i) => ({ key: t.key, title: t.title, summary: t.summary, position: i })))
    .onConflictDoUpdate({
      target: tracks.key,
      set: { title: sql`excluded.title`, summary: sql`excluded.summary`, position: sql`excluded.position` },
    });

  await db
    .insert(sources)
    .values(
      SOURCES.map((s) => ({
        key: s.key,
        title: s.title,
        url: s.url ?? null,
        publisher: s.publisher ?? null,
        sourceType: s.sourceType,
        verificationStatus: s.verificationStatus,
        accessedAt: new Date(),
        notes: s.notes ?? null,
      })),
    )
    .onConflictDoUpdate({
      target: sources.key,
      set: {
        title: sql`excluded.title`,
        url: sql`excluded.url`,
        publisher: sql`excluded.publisher`,
        verificationStatus: sql`excluded.verification_status`,
        notes: sql`excluded.notes`,
      },
    });

  await db
    .insert(skills)
    .values(SKILLS.map((s) => ({ key: s.key, title: s.title, category: s.category, kind: s.kind, description: s.description })))
    .onConflictDoUpdate({
      target: skills.key,
      set: { title: sql`excluded.title`, category: sql`excluded.category`, description: sql`excluded.description` },
    });

  await db
    .insert(courses)
    .values(
      ALL_COURSES.map((c, i) => ({
        key: c.key,
        trackKey: c.trackKey,
        title: c.title,
        sourceCategory: c.sourceCategory,
        level: c.level,
        summary: c.summary,
        learningObjectives: c.learningObjectives,
        masteryCriteria: c.masteryCriteria,
        estimatedHours: c.estimatedHours,
        weeklyWorkload: c.weeklyWorkload,
        learningMode: c.learningMode,
        sourceRefs: c.sourceRefs,
        verificationStatus: c.verificationStatus,
        position: i,
        lastVerified: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: courses.key,
      set: {
        title: sql`excluded.title`,
        trackKey: sql`excluded.track_key`,
        summary: sql`excluded.summary`,
        learningObjectives: sql`excluded.learning_objectives`,
        masteryCriteria: sql`excluded.mastery_criteria`,
        sourceCategory: sql`excluded.source_category`,
        level: sql`excluded.level`,
        verificationStatus: sql`excluded.verification_status`,
        position: sql`excluded.position`,
      },
    });

  const prereqRows = ALL_COURSES.flatMap((c) => [
    ...(c.prerequisites ?? []).map((p) => ({ courseKey: c.key, requiresCourseKey: p, kind: "prerequisite" })),
    ...(c.corequisites ?? []).map((p) => ({ courseKey: c.key, requiresCourseKey: p, kind: "corequisite" })),
  ]);
  if (prereqRows.length > 0) {
    await db.insert(prerequisites).values(prereqRows).onConflictDoNothing();
  }

  await db
    .insert(lessons)
    .values(
      ALL_LESSONS.map((l, i) => ({
        key: l.key,
        courseKey: l.courseKey,
        title: l.title,
        position: i,
        why: l.why,
        objectives: l.objectives,
        topics: l.topics,
        blocks: l.blocks,
        notebook: l.notebook,
        skillKeys: l.skillKeys,
        sourceCategory: l.sourceCategory,
        sourceRefs: l.sourceRefs ?? [],
        estimatedMinutes: l.estimatedMinutes ?? 45,
      })),
    )
    .onConflictDoUpdate({
      target: lessons.key,
      set: {
        title: sql`excluded.title`,
        courseKey: sql`excluded.course_key`,
        why: sql`excluded.why`,
        objectives: sql`excluded.objectives`,
        topics: sql`excluded.topics`,
        blocks: sql`excluded.blocks`,
        notebook: sql`excluded.notebook`,
        skillKeys: sql`excluded.skill_keys`,
        sourceRefs: sql`excluded.source_refs`,
        position: sql`excluded.position`,
      },
    });

  const items = buildAllItems();
  await db
    .insert(assessmentItems)
    .values(
      items.map((it) => ({
        key: it.key,
        lessonKey: it.lessonKey,
        type: it.type,
        stage: it.stage,
        difficulty: it.difficulty,
        prompt: it.prompt,
        context: it.context ?? null,
        options: it.options ?? null,
        answerKey: it.answerKey ?? null,
        rubric: it.rubric,
        skillKeys: it.skillKeys,
      })),
    )
    .onConflictDoUpdate({
      target: assessmentItems.key,
      set: {
        prompt: sql`excluded.prompt`,
        context: sql`excluded.context`,
        rubric: sql`excluded.rubric`,
        skillKeys: sql`excluded.skill_keys`,
        type: sql`excluded.type`,
        stage: sql`excluded.stage`,
        difficulty: sql`excluded.difficulty`,
      },
    });

  await db
    .insert(projectCatalog)
    .values(
      PROJECTS.map((p) => ({
        key: p.key,
        title: p.title,
        ladderLevel: p.ladderLevel,
        sourceCategory: p.sourceCategory,
        brief: p.brief,
        dataPolicy: p.dataPolicy,
        suggestedData: p.suggestedData,
        milestones: p.milestones,
        definitionOfDone: p.definitionOfDone,
        skillKeys: p.skillKeys,
        evidenceClass: p.evidenceClass,
      })),
    )
    .onConflictDoUpdate({
      target: projectCatalog.key,
      set: {
        title: sql`excluded.title`,
        brief: sql`excluded.brief`,
        dataPolicy: sql`excluded.data_policy`,
        suggestedData: sql`excluded.suggested_data`,
        milestones: sql`excluded.milestones`,
        definitionOfDone: sql`excluded.definition_of_done`,
        skillKeys: sql`excluded.skill_keys`,
        evidenceClass: sql`excluded.evidence_class`,
      },
    });

  await db
    .insert(careerRoles)
    .values(
      CAREER_ROLES.map((r) => ({
        key: r.key,
        title: r.title,
        company: r.company,
        sourceUrl: r.sourceUrl,
        verificationStatus: r.verificationStatus,
        snapshotDate: r.snapshotDate,
        region: r.region,
        seniority: r.seniority,
        notes: r.notes,
      })),
    )
    .onConflictDoUpdate({
      target: careerRoles.key,
      set: { title: sql`excluded.title`, notes: sql`excluded.notes`, verificationStatus: sql`excluded.verification_status` },
    });

  const reqRows = CAREER_ROLES.flatMap((r) =>
    r.requirements.map((q) => ({ roleKey: r.key, skillKey: q.skillKey, importance: q.importance, note: q.note })),
  );
  await db
    .insert(roleRequirements)
    .values(reqRows)
    .onConflictDoUpdate({
      target: [roleRequirements.roleKey, roleRequirements.skillKey],
      set: { importance: sql`excluded.importance`, note: sql`excluded.note` },
    });

  await db
    .insert(englishTerms)
    .values(
      ENGLISH_TERMS.map((t) => ({
        term: t.term,
        simpleDefinition: t.simpleDefinition,
        arabic: t.arabic,
        example: t.example,
        domain: t.domain,
        collocations: t.collocations,
      })),
    )
    .onConflictDoUpdate({
      target: englishTerms.term,
      set: {
        simpleDefinition: sql`excluded.simple_definition`,
        arabic: sql`excluded.arabic`,
        example: sql`excluded.example`,
        collocations: sql`excluded.collocations`,
      },
    });

  await db
    .insert(freelanceScenarios)
    .values(
      FREELANCE_SCENARIOS.map((s) => ({
        key: s.key,
        title: s.title,
        clientMessage: s.clientMessage,
        hiddenConstraints: s.hiddenConstraints,
        requiredQuestions: s.requiredQuestions,
        deliverableRubric: s.deliverableRubric,
      })),
    )
    .onConflictDoUpdate({
      target: freelanceScenarios.key,
      set: {
        clientMessage: sql`excluded.client_message`,
        hiddenConstraints: sql`excluded.hidden_constraints`,
        requiredQuestions: sql`excluded.required_questions`,
        deliverableRubric: sql`excluded.deliverable_rubric`,
      },
    });
}
