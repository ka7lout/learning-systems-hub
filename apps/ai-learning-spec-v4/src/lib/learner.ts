import "server-only";
import { and, eq, lte, sql, asc } from "drizzle-orm";
import { db } from "@/db";
import {
  lessonProgress,
  masteryEvidence,
  reviewItems,
  userProjects,
} from "@/db/schema";
import { MODULES } from "@/content/curriculum";
import { PROJECTS } from "@/content/projects";
import { SKILLS, TARGET_ROLES, SKILL_GATES } from "@/content/roles";

export interface SkillStatus {
  slug: string;
  name: string;
  area: string;
  /** Highest demonstrated level (0–9), from evidence only. */
  level: number;
  /** Highest level from independent (non-AI-assisted) evidence. */
  independentLevel: number;
  evidenceCount: number;
  gate: "none" | "developing" | "competent" | "independent";
}

export async function getSkillStatuses(userId: string): Promise<SkillStatus[]> {
  const rows = await db
    .select({
      skillSlug: masteryEvidence.skillSlug,
      maxLevel: sql<number>`max(${masteryEvidence.level})`,
      maxIndependent: sql<number>`coalesce(max(${masteryEvidence.level}) filter (where ${masteryEvidence.assisted} = false), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(masteryEvidence)
    .where(eq(masteryEvidence.userId, userId))
    .groupBy(masteryEvidence.skillSlug);

  const bySlug = new Map(rows.map((r) => [r.skillSlug, r]));
  return SKILLS.map((skill) => {
    const r = bySlug.get(skill.slug);
    const level = Number(r?.maxLevel ?? 0);
    const independentLevel = Number(r?.maxIndependent ?? 0);
    let gate: SkillStatus["gate"] = "none";
    if (independentLevel >= SKILL_GATES.independent.minLevel) gate = "independent";
    else if (level >= SKILL_GATES.competent.minLevel) gate = "competent";
    else if (level >= SKILL_GATES.developing.minLevel) gate = "developing";
    return {
      slug: skill.slug,
      name: skill.name,
      area: skill.area,
      level,
      independentLevel,
      evidenceCount: Number(r?.count ?? 0),
      gate,
    };
  });
}

export interface RoleGapEntry {
  skillSlug: string;
  skillName: string;
  kind: "hard" | "preferred" | "familiarity";
  note?: string;
  level: number;
  independentLevel: number;
  status: "missing" | "developing" | "competent" | "independent";
}

export async function getRoleGap(userId: string, roleSlug: string) {
  const role = TARGET_ROLES.find((r) => r.slug === roleSlug) ?? TARGET_ROLES[0];
  const skillStatuses = await getSkillStatuses(userId);
  const bySlug = new Map(skillStatuses.map((s) => [s.slug, s]));
  const entries: RoleGapEntry[] = role.requirements.map((req) => {
    const s = bySlug.get(req.skillSlug);
    const level = s?.level ?? 0;
    const independentLevel = s?.independentLevel ?? 0;
    let status: RoleGapEntry["status"] = "missing";
    if (independentLevel >= SKILL_GATES.independent.minLevel) status = "independent";
    else if (level >= SKILL_GATES.competent.minLevel) status = "competent";
    else if (level >= SKILL_GATES.developing.minLevel) status = "developing";
    return {
      skillSlug: req.skillSlug,
      skillName: s?.name ?? req.skillSlug,
      kind: req.kind,
      note: req.note,
      level,
      independentLevel,
      status,
    };
  });
  return { role, entries };
}

export interface NextTask {
  kind: "review" | "learn" | "transfer" | "project" | "start";
  title: string;
  href: string;
  why: string;
}

export async function getProgressMap(userId: string) {
  const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  return new Map(rows.map((r) => [r.lessonSlug, r]));
}

export async function getDueReviewCount(userId: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), lte(reviewItems.dueAt, new Date())));
  return Number(rows[0]?.count ?? 0);
}

/** "What should I do now?" — deterministic, explainable recommendation (spec §208, §219). */
export async function getNextTask(userId: string): Promise<NextTask> {
  const dueCount = await getDueReviewCount(userId);
  if (dueCount > 0) {
    return {
      kind: "review",
      title: `Clear ${dueCount} due review${dueCount === 1 ? "" : "s"}`,
      href: "/review",
      why: "Spaced retrieval is due. Reviewing before new learning protects prior investment against forgetting.",
    };
  }

  const progress = await getProgressMap(userId);

  // Find next lesson respecting module order and prerequisite modules.
  for (const mod of MODULES) {
    const prereqsMet = mod.prerequisites.every((p) => {
      const prereqMod = MODULES.find((m) => m.slug === p);
      if (!prereqMod) return true;
      // Prerequisite satisfied when at least half its lessons have completed practice.
      const done = prereqMod.lessons.filter((l) => progress.get(l.slug)?.practiceCompletedAt).length;
      return done >= Math.ceil(prereqMod.lessons.length / 2);
    });
    if (!prereqsMet) continue;
    for (const lesson of mod.lessons) {
      const p = progress.get(lesson.slug);
      if (!p?.practiceCompletedAt) {
        return {
          kind: "learn",
          title: `${p?.contentSeenAt ? "Complete the checkpoint in" : "Study"}: ${lesson.title}`,
          href: `/learn/${mod.slug}/${lesson.slug}`,
          why: p?.contentSeenAt
            ? "You read this lesson but have not demonstrated recall yet. Content seen is not competence."
            : `Next unmastered lesson in your prerequisite path (${mod.title}).`,
        };
      }
      if (!p.transferCompletedAt) {
        return {
          kind: "transfer",
          title: `Transfer task: ${lesson.title}`,
          href: `/learn/${mod.slug}/${lesson.slug}`,
          why: "Recall is done but transfer is not. A concept counts only when it works outside the original example.",
        };
      }
    }
  }

  // Everything practiced — push toward project evidence.
  const activeProjects = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.userId, userId), eq(userProjects.status, "active")))
    .orderBy(asc(userProjects.createdAt))
    .limit(1);
  if (activeProjects[0]) {
    const spec = PROJECTS.find((pr) => pr.slug === activeProjects[0].projectSlug);
    return {
      kind: "project",
      title: `Advance project: ${spec?.title ?? activeProjects[0].projectSlug}`,
      href: `/projects/${activeProjects[0].projectSlug}`,
      why: "All lesson checkpoints are complete. Projects convert knowledge into portfolio evidence.",
    };
  }

  return {
    kind: "start",
    title: "Start a project from the ladder",
    href: "/projects",
    why: "Your lesson work is complete and no project is active. Evidence comes from building.",
  };
}

export async function getActiveProjects(userId: string) {
  const rows = await db
    .select()
    .from(userProjects)
    .where(eq(userProjects.userId, userId))
    .orderBy(asc(userProjects.createdAt));
  return rows.map((r) => ({ ...r, spec: PROJECTS.find((p) => p.slug === r.projectSlug) }));
}
