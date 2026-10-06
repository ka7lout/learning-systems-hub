import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  curriculumNodes,
  nodePrerequisites,
  skills,
  nodeSkills,
  sources,
  practiceItems,
  projectCatalog,
  careerRoles,
  roleRequirements,
  englishTerms,
} from "@/db/schema";
import { ORIGINAL_MODULES } from "@/content/original";
import { SOURCES, SECTION_MAPPINGS, STAGES, MODULE_STAGE, EXT_LESSONS, ORIGINAL_PREREQS, RETRIEVAL_DATE } from "@/content/harvard";
import { SKILLS, PROJECTS, CAREER_ROLES, ENGLISH_TERMS } from "@/content/catalog";
import { buildSections, buildNotebook, buildMasteryCriteria, buildPractice } from "@/content/lessons";

type NodeInsert = typeof curriculumNodes.$inferInsert;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Kahn's algorithm — throws when the prerequisite graph has a cycle. */
export function assertAcyclic(edges: { nodeId: string; prerequisiteId: string }[], ids: Set<string>) {
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of ids) indeg.set(id, 0);
  for (const e of edges) {
    if (!ids.has(e.nodeId) || !ids.has(e.prerequisiteId)) throw new Error(`Prerequisite edge references unknown node: ${e.prerequisiteId} -> ${e.nodeId}`);
    adj.set(e.prerequisiteId, [...(adj.get(e.prerequisiteId) ?? []), e.nodeId]);
    indeg.set(e.nodeId, (indeg.get(e.nodeId) ?? 0) + 1);
  }
  const queue = [...ids].filter((id) => indeg.get(id) === 0);
  let visited = 0;
  while (queue.length) {
    const n = queue.shift()!;
    visited++;
    for (const m of adj.get(n) ?? []) {
      indeg.set(m, indeg.get(m)! - 1);
      if (indeg.get(m) === 0) queue.push(m);
    }
  }
  if (visited !== ids.size) throw new Error("Prerequisite graph contains a cycle");
}

export function buildCurriculum() {
  const nodes: NodeInsert[] = [];
  const edges: { nodeId: string; prerequisiteId: string }[] = [];
  const nodeSkillRows: { nodeId: string; skillId: string }[] = [];
  const practice: (typeof practiceItems.$inferInsert)[] = [];
  const verified = new Date(RETRIEVAL_DATE);

  for (const s of STAGES) {
    nodes.push({ id: s.id, type: "stage", parentId: null, title: s.title, summary: s.summary, sourceCategory: "original", priority: "core", level: "foundation", position: s.position, estimatedMinutes: 0 });
  }

  let modPos = 0;
  for (const m of ORIGINAL_MODULES) {
    modPos++;
    const totalMin = m.sections.length * 120;
    nodes.push({ id: m.id, type: "module", parentId: MODULE_STAGE[m.id], title: m.title, summary: `${m.statedSessions} sessions. ${m.sessionNote ?? ""}`.trim(), sourceCategory: "original", priority: "core", level: "foundation", position: modPos, estimatedMinutes: totalMin, verifiedAt: verified });
    let secPos = 0;
    for (const s of m.sections) {
      secPos++;
      const mappings = SECTION_MAPPINGS[s.id] ?? [];
      nodes.push({
        id: s.id,
        type: "lesson",
        parentId: m.id,
        title: s.title,
        summary: `${s.sessionSpan}. ${s.topics.length} topics preserved from the original curriculum.`,
        sourceCategory: "original",
        priority: m.id === "m4-excel-powerbi" ? "industry" : "core",
        level: m.id.startsWith("m7") || m.id.startsWith("m8") ? "advanced" : m.id.startsWith("m6") ? "intermediate" : "foundation",
        position: secPos,
        estimatedMinutes: 120,
        why: s.why,
        objectives: s.objectives,
        content: buildSections({ id: s.id, title: s.title, why: s.why, objectives: s.objectives, topics: s.topics, sessionNote: m.sessionNote }),
        notebook: buildNotebook({ title: s.title, topics: s.topics }),
        harvardMapping: mappings,
        sourceRefs: [...new Set(mappings.map((x) => x.sourceId))],
        masteryCriteria: buildMasteryCriteria({ topics: s.topics, objectives: s.objectives }),
        verifiedAt: verified,
      });
      let tp = 0;
      for (const t of s.topics) {
        tp++;
        nodes.push({ id: `${s.id}-t-${slugify(t)}`, type: "topic", parentId: s.id, title: t, summary: "", sourceCategory: "original", priority: "core", level: "foundation", position: tp, estimatedMinutes: 20 });
      }
      for (const sk of s.skills) nodeSkillRows.push({ nodeId: s.id, skillId: sk });
      for (const p of buildPractice({ id: s.id, title: s.title, topics: s.topics })) practice.push({ ...p, nodeId: s.id, position: practice.length });
    }
  }

  for (const [nodeId, prereqs] of Object.entries(ORIGINAL_PREREQS)) for (const p of prereqs) edges.push({ nodeId, prerequisiteId: p });

  let extPos = 100;
  for (const l of EXT_LESSONS) {
    extPos++;
    nodes.push({
      id: l.id,
      type: "lesson",
      parentId: l.stage,
      title: l.title,
      summary: `${l.topics.length} topics. Additive layer: ${l.sourceCategory.replace("_", " ")}.`,
      sourceCategory: l.sourceCategory,
      priority: l.priority,
      level: l.level,
      position: extPos,
      estimatedMinutes: l.minutes,
      why: l.why,
      objectives: l.objectives,
      content: buildSections({ id: l.id, title: l.title, why: l.why, objectives: l.objectives, topics: l.topics }),
      notebook: buildNotebook({ title: l.title, topics: l.topics }),
      harvardMapping: l.mappings,
      sourceRefs: [...new Set(l.mappings.map((x) => x.sourceId))],
      masteryCriteria: buildMasteryCriteria({ topics: l.topics, objectives: l.objectives }),
      verifiedAt: l.mappings.length ? verified : null,
    });
    let tp = 0;
    for (const t of l.topics) {
      tp++;
      nodes.push({ id: `${l.id}-t-${slugify(t)}`, type: "topic", parentId: l.id, title: t, summary: "", sourceCategory: l.sourceCategory, priority: l.priority, level: l.level, position: tp, estimatedMinutes: 20 });
    }
    for (const p of l.prerequisites) edges.push({ nodeId: l.id, prerequisiteId: p });
    for (const sk of l.skills) nodeSkillRows.push({ nodeId: l.id, skillId: sk });
    for (const p of buildPractice({ id: l.id, title: l.title, topics: l.topics })) practice.push({ ...p, nodeId: l.id, position: practice.length });
  }

  const ids = new Set(nodes.map((n) => n.id));
  assertAcyclic(edges, ids);
  const skillIds = new Set(SKILLS.map((s) => s.id));
  for (const r of nodeSkillRows) if (!skillIds.has(r.skillId)) throw new Error(`Unknown skill ${r.skillId} on ${r.nodeId}`);
  for (const p of PROJECTS) {
    for (const s of p.skillIds) if (!skillIds.has(s)) throw new Error(`Unknown skill ${s} on project ${p.id}`);
    for (const n of p.prerequisiteNodeIds) if (!ids.has(n)) throw new Error(`Unknown prerequisite node ${n} on project ${p.id}`);
  }
  return { nodes, edges, nodeSkillRows, practice };
}

export async function seedAll() {
  const { nodes, edges, nodeSkillRows, practice } = buildCurriculum();

  await db.insert(sources).values(SOURCES.map((s) => ({ id: s.id, url: s.url, title: s.title, publisher: s.publisher, sourceType: s.sourceType, verificationStatus: s.verificationStatus, accessedAt: s.accessed ? new Date(RETRIEVAL_DATE) : null, notes: s.notes })))
    .onConflictDoUpdate({ target: sources.id, set: { url: sql`excluded.url`, title: sql`excluded.title`, publisher: sql`excluded.publisher`, sourceType: sql`excluded.source_type`, verificationStatus: sql`excluded.verification_status`, accessedAt: sql`excluded.accessed_at`, notes: sql`excluded.notes` } });

  await db.insert(skills).values(SKILLS).onConflictDoUpdate({ target: skills.id, set: { name: sql`excluded.name`, category: sql`excluded.category`, description: sql`excluded.description` } });

  for (let i = 0; i < nodes.length; i += 200) {
    await db.insert(curriculumNodes).values(nodes.slice(i, i + 200)).onConflictDoUpdate({
      target: curriculumNodes.id,
      set: { type: sql`excluded.type`, parentId: sql`excluded.parent_id`, title: sql`excluded.title`, summary: sql`excluded.summary`, sourceCategory: sql`excluded.source_category`, priority: sql`excluded.priority`, level: sql`excluded.level`, position: sql`excluded.position`, estimatedMinutes: sql`excluded.estimated_minutes`, why: sql`excluded.why`, objectives: sql`excluded.objectives`, content: sql`excluded.content`, notebook: sql`excluded.notebook`, harvardMapping: sql`excluded.harvard_mapping`, sourceRefs: sql`excluded.source_refs`, masteryCriteria: sql`excluded.mastery_criteria`, verifiedAt: sql`excluded.verified_at`, updatedAt: sql`now()` },
    });
  }

  await db.delete(nodePrerequisites);
  await db.insert(nodePrerequisites).values(edges);
  await db.delete(nodeSkills);
  await db.insert(nodeSkills).values(nodeSkillRows);

  for (let i = 0; i < practice.length; i += 200) {
    await db.insert(practiceItems).values(practice.slice(i, i + 200)).onConflictDoUpdate({
      target: practiceItems.id,
      set: { nodeId: sql`excluded.node_id`, type: sql`excluded.type`, difficulty: sql`excluded.difficulty`, prompt: sql`excluded.prompt`, rubric: sql`excluded.rubric`, reference: sql`excluded.reference`, isTransfer: sql`excluded.is_transfer`, position: sql`excluded.position` },
    });
  }

  await db.insert(projectCatalog).values(PROJECTS).onConflictDoUpdate({
    target: projectCatalog.id,
    set: { title: sql`excluded.title`, ladderLevel: sql`excluded.ladder_level`, domain: sql`excluded.domain`, sourceCategory: sql`excluded.source_category`, brief: sql`excluded.brief`, dataGuidance: sql`excluded.data_guidance`, deliverables: sql`excluded.deliverables`, definitionOfDone: sql`excluded.definition_of_done`, skillIds: sql`excluded.skill_ids`, prerequisiteNodeIds: sql`excluded.prerequisite_node_ids` },
  });

  for (const r of CAREER_ROLES) {
    await db.insert(careerRoles).values({ slug: r.slug, title: r.title, employer: r.employer, sourceUrl: r.sourceUrl, verificationStatus: r.verificationStatus, seniority: r.seniority, location: r.location, summary: r.summary, capturedAt: null })
      .onConflictDoUpdate({ target: careerRoles.slug, set: { title: sql`excluded.title`, employer: sql`excluded.employer`, sourceUrl: sql`excluded.source_url`, verificationStatus: sql`excluded.verification_status`, seniority: sql`excluded.seniority`, location: sql`excluded.location`, summary: sql`excluded.summary` } });
    await db.delete(roleRequirements).where(sql`${roleRequirements.roleSlug} = ${r.slug}`);
    const rows = [
      ...r.hard.map((s) => ({ roleSlug: r.slug, skillId: s, requirementType: "hard" })),
      ...r.preferred.map((s) => ({ roleSlug: r.slug, skillId: s, requirementType: "preferred" })),
      ...r.familiarity.map((s) => ({ roleSlug: r.slug, skillId: s, requirementType: "familiarity" })),
    ];
    await db.insert(roleRequirements).values(rows);
  }

  await db.insert(englishTerms).values(ENGLISH_TERMS).onConflictDoUpdate({ target: englishTerms.term, set: { simpleDefinition: sql`excluded.simple_definition`, arabic: sql`excluded.arabic`, example: sql`excluded.example`, domain: sql`excluded.domain` } });

  return { nodes: nodes.length, edges: edges.length, practice: practice.length, projects: PROJECTS.length, skills: SKILLS.length, sources: SOURCES.length };
}

let seedPromise: Promise<void> | null = null;
/** Seeds the curriculum on first use when the database is empty (clean deploys). */
export async function ensureSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const [row] = await db.select({ c: sql<number>`count(*)::int` }).from(curriculumNodes);
    if (!row || row.c === 0) await seedAll();
  })().catch((e) => {
    seedPromise = null;
    throw e;
  });
  return seedPromise;
}
