import "server-only";
import { db } from "@/db";
import { nodes, mappings, practiceItems, projectCatalog, skills, careerRoles, englishTerms, sources } from "@/db/schema";
import { MODULES, UNITS, PROJECTS, PROJECT_MILESTONES, SKILLS, SOURCES, MAPPINGS, ROLES, ENGLISH_TERMS, type UnitDef } from "@/content/curriculum";
import { sql } from "drizzle-orm";
import { validateCurriculum as validate } from "./validate";

export const SEED_VERSION = 3;

export function validateCurriculum(units: UnitDef[] = UNITS) { return validate(units); }

export function practiceFor(u: UnitDef) {
  const items = [
    { id: `${u.id}-recall`, nodeId: u.id, taskType: "free_recall", difficulty: "A", stage: "recall",
      prompt: `Close your notes. From memory, list and briefly define the key ideas of "${u.title}". Aim for at least five of: ${u.topics.length} listed topics.`,
      keyPoints: u.topics, modelAnswer: `Topics in this unit: ${u.topics.join(", ")}.` },
    { id: `${u.id}-why`, nodeId: u.id, taskType: "explain_why", difficulty: "B", stage: "application",
      prompt: `Explain in your own words why an AI engineer needs "${u.title}". Give one concrete situation where getting it wrong would cause a real failure.`,
      keyPoints: ["names a concrete engineering situation", "explains the consequence of getting it wrong", "uses correct terminology"], modelAnswer: u.why },
    { id: `${u.id}-transfer`, nodeId: u.id, taskType: "transfer", difficulty: "D", stage: "transfer", prompt: u.transfer.prompt, keyPoints: u.transfer.keyPoints, modelAnswer: u.transfer.answer },
  ];
  if (u.caseTask) items.push({ id: `${u.id}-case`, nodeId: u.id, taskType: "case_decision", difficulty: "E", stage: "case", prompt: u.caseTask.prompt, keyPoints: u.caseTask.keyPoints, modelAnswer: u.caseTask.answer });
  return items;
}

const DEFAULT_MUST_WRITE = ["The concept in your own words (1–2 sentences)", "Essential formula / rule / algorithm with the meaning of each symbol", "One worked example or structure", "One common mistake", "One 'why' statement", "When to use it (and when not)"];

let seeded: Promise<void> | null = null;
export function ensureSeed() {
  if (!seeded) seeded = runSeed().catch((e) => { seeded = null; throw e; });
  return seeded;
}

async function runSeed() {
  const errs = validateCurriculum();
  if (errs.length) throw new Error("Curriculum validation failed: " + errs.join("; "));
  const res = await db.execute(sql`select count(*)::int as c from ${nodes} where version = ${SEED_VERSION}`);
  const count = Number((res.rows[0] as { c: number }).c);
  if (count === MODULES.length + UNITS.length) return;

  await db.transaction(async (tx) => {
    for (const s of SOURCES) await tx.insert(sources).values({ ...s, accessedAt: "2026" }).onConflictDoUpdate({ target: sources.id, set: { ...s } });
    let order = 0;
    for (const m of MODULES) {
      const v = { id: m.id, type: "module", parentId: null, spine: m.spine, title: m.title, sourceCategory: m.sourceCategory, tier: "CORE", level: "—", sessions: m.sessions, sortOrder: order++, why: m.note ?? "", topics: [], objectives: [], mustWrite: [], masteryCriteria: [], prerequisites: [], skills: [], sourceRefs: [], version: SEED_VERSION, lastVerified: "2026" };
      await tx.insert(nodes).values(v).onConflictDoUpdate({ target: nodes.id, set: v });
    }
    for (const u of UNITS) {
      const v = { id: u.id, type: "unit", parentId: u.parentId, spine: u.spine, title: u.title, sourceCategory: u.sourceCategory, tier: u.tier, level: u.level, sessions: null, sortOrder: order++, why: u.why, topics: u.topics,
        objectives: [`Explain the core ideas of ${u.title} from memory`, `Apply them to a direct problem`, `Transfer them to an unfamiliar situation`],
        mustWrite: u.mustWrite ?? DEFAULT_MUST_WRITE,
        masteryCriteria: ["Independent recall attempt scoring ≥ 70%", "Independent transfer attempt scoring ≥ 70%", "Delayed review passed at least once"],
        prerequisites: u.prerequisites, skills: u.skills, sourceRefs: u.sourceRefs, version: SEED_VERSION, lastVerified: "2026" };
      await tx.insert(nodes).values(v).onConflictDoUpdate({ target: nodes.id, set: v });
      for (const p of practiceFor(u)) await tx.insert(practiceItems).values(p).onConflictDoUpdate({ target: practiceItems.id, set: p });
    }
    await tx.delete(mappings);
    await tx.insert(mappings).values(MAPPINGS);
    for (const p of PROJECTS) {
      const v = { id: p.id, title: p.title, ladderLevel: p.ladderLevel, origin: Number(p.id.slice(1)) <= 21 ? "Original Curriculum" : "Industry/Research Extension",
        brief: `Build "${p.title}" as a reasoning-driven project, not a tutorial copy. Define the problem, establish a baseline, evaluate honestly and analyze failures.`,
        nodeIds: p.nodeIds, skills: p.skills, dataGuidance: p.data, milestones: PROJECT_MILESTONES };
      await tx.insert(projectCatalog).values(v).onConflictDoUpdate({ target: projectCatalog.id, set: v });
    }
    for (const s of SKILLS) {
      const v = { ...s, nodeIds: UNITS.filter((u) => u.skills.includes(s.id)).map((u) => u.id) };
      await tx.insert(skills).values(v).onConflictDoUpdate({ target: skills.id, set: v });
    }
    for (const r of ROLES) {
      const v = { ...r, snapshotDate: "2026 (student blueprint)" };
      await tx.insert(careerRoles).values(v).onConflictDoUpdate({ target: careerRoles.id, set: v });
    }
    for (const t of ENGLISH_TERMS) await tx.insert(englishTerms).values(t).onConflictDoUpdate({ target: englishTerms.term, set: t });
  });
}
