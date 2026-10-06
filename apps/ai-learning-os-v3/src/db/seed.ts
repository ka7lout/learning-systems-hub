/**
 * Seeds the canonical curriculum. Content tables only — learner data is never touched.
 * Run: npx tsx --env-file=.env src/db/seed.ts
 */
import { db, pool } from "./index";
import {
  assessmentItems,
  careerRoles,
  courses,
  englishTerms,
  freelanceSimulations,
  lessons,
  projects,
  skillEdges,
  skills,
  sources,
  stages,
} from "./schema";
import { careerRoleSeeds, englishTermSeeds, freelanceSeeds, skillEdgeSeeds, skillSeeds, sourceSeeds, stageSeeds } from "../content/spine";
import { courseSeeds } from "../content/courses";
import { lessonSeeds } from "../content/lessons";
import { projectSeeds } from "../content/projects";

function validate() {
  const errors: string[] = [];
  const courseIds = new Set(courseSeeds.map((c) => c.id));
  const stageIds = new Set(stageSeeds.map((s) => s.id));
  const skillIds = new Set(skillSeeds.map((s) => s.id));
  const sourceIds = new Set(sourceSeeds.map((s) => s.id));

  for (const c of courseSeeds) {
    if (!stageIds.has(c.stageId)) errors.push(`Course ${c.id} references unknown stage ${c.stageId}`);
    if (c.masteryCriteria.length === 0) errors.push(`Course ${c.id} has no mastery criteria`);
    if (c.objectives.length === 0) errors.push(`Course ${c.id} has no objectives`);
    for (const p of c.prerequisites) if (!courseIds.has(p)) errors.push(`Course ${c.id} has unknown prerequisite ${p}`);
    for (const s of c.skills) if (!skillIds.has(s)) errors.push(`Course ${c.id} references unknown skill ${s}`);
    for (const r of c.sourceRefs) if (!sourceIds.has(r)) errors.push(`Course ${c.id} references unknown source ${r}`);
  }

  // Prerequisite cycle detection (DFS colouring).
  const colour = new Map<string, number>();
  const adjacency = new Map(courseSeeds.map((c) => [c.id, c.prerequisites]));
  const visit = (id: string, path: string[]): void => {
    const c = colour.get(id) ?? 0;
    if (c === 1) {
      errors.push(`Prerequisite cycle detected: ${[...path, id].join(" -> ")}`);
      return;
    }
    if (c === 2) return;
    colour.set(id, 1);
    for (const p of adjacency.get(id) ?? []) visit(p, [...path, id]);
    colour.set(id, 2);
  };
  for (const c of courseSeeds) visit(c.id, []);

  const lessonIds = new Set<string>();
  for (const l of lessonSeeds) {
    if (!courseIds.has(l.courseId)) errors.push(`Lesson ${l.id} references unknown course ${l.courseId}`);
    if (lessonIds.has(l.id)) errors.push(`Duplicate lesson id ${l.id}`);
    lessonIds.add(l.id);
    if (l.notebook.must.length === 0) errors.push(`Lesson ${l.id} has no MUST WRITE notebook guidance`);
    if (l.items.length === 0) errors.push(`Lesson ${l.id} has no assessment items`);
    if (!l.items.some((i) => i.phase === "transfer")) errors.push(`Lesson ${l.id} has no transfer-phase item`);
    for (const s of l.skills) if (!skillIds.has(s)) errors.push(`Lesson ${l.id} references unknown skill ${s}`);
  }

  for (const p of projectSeeds) {
    if (p.definitionOfDone.length === 0) errors.push(`Project ${p.id} has no definition of done`);
    if (p.suggestedData.length === 0) errors.push(`Project ${p.id} has no documented data source decision`);
    for (const s of p.skills) if (!skillIds.has(s)) errors.push(`Project ${p.id} references unknown skill ${s}`);
  }

  for (const r of careerRoleSeeds) {
    for (const s of r.skills) if (!skillIds.has(s)) errors.push(`Role ${r.id} references unknown skill ${s}`);
  }

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }
}

async function main() {
  validate();
  console.log("content validation passed");

  // Content is replaced wholesale; learner-owned tables are untouched.
  await db.delete(assessmentItems);
  await db.delete(lessons);
  await db.delete(courses);
  await db.delete(stages);
  await db.delete(skillEdges);
  await db.delete(skills);
  await db.delete(projects);
  await db.delete(careerRoles);
  await db.delete(englishTerms);
  await db.delete(freelanceSimulations);
  await db.delete(sources);

  await db.insert(sources).values(sourceSeeds);
  await db.insert(stages).values(stageSeeds);
  await db.insert(skills).values(skillSeeds);
  await db.insert(skillEdges).values(skillEdgeSeeds.map(([fromSkill, toSkill]) => ({ fromSkill, toSkill })));

  await db.insert(courses).values(
    courseSeeds.map((c) => ({
      id: c.id,
      stageId: c.stageId,
      position: c.position,
      title: c.title,
      sourceCategory: c.sourceCategory,
      level: c.level,
      priority: c.priority,
      why: c.why,
      summary: c.summary,
      estimatedHours: c.estimatedHours,
      prerequisites: c.prerequisites,
      topics: c.topics,
      objectives: c.objectives,
      masteryCriteria: c.masteryCriteria,
      skills: c.skills,
      harvardMapping: c.harvardMapping,
      sourceRefs: c.sourceRefs,
      lastVerified: c.lastVerified,
    })),
  );

  await db.insert(lessons).values(
    lessonSeeds.map((l) => ({
      id: l.id,
      courseId: l.courseId,
      position: l.position,
      title: l.title,
      why: l.why,
      objectives: l.objectives,
      blocks: l.blocks,
      notebook: l.notebook,
      concepts: l.concepts,
      skills: l.skills,
      sourceCategory: l.sourceCategory,
      sourceRefs: l.sourceRefs,
      estimatedMinutes: l.estimatedMinutes,
    })),
  );

  await db.insert(assessmentItems).values(
    lessonSeeds.flatMap((l) =>
      l.items.map((i, idx) => ({
        id: i.id,
        lessonId: l.id,
        position: idx + 1,
        type: i.type,
        difficulty: i.difficulty,
        phase: i.phase,
        prompt: i.prompt,
        context: i.context ?? null,
        expectedPoints: i.expectedPoints,
        hints: i.hints,
        referenceAnswer: i.referenceAnswer,
        skills: i.skills,
      })),
    ),
  );

  await db.insert(projects).values(projectSeeds);
  await db.insert(careerRoles).values(careerRoleSeeds);
  await db.insert(englishTerms).values(englishTermSeeds);
  await db.insert(freelanceSimulations).values(freelanceSeeds);

  const counts = {
    sources: sourceSeeds.length,
    stages: stageSeeds.length,
    courses: courseSeeds.length,
    lessons: lessonSeeds.length,
    items: lessonSeeds.reduce((n, l) => n + l.items.length, 0),
    skills: skillSeeds.length,
    projects: projectSeeds.length,
    roles: careerRoleSeeds.length,
    englishTerms: englishTermSeeds.length,
  };
  console.log("seeded", counts);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
