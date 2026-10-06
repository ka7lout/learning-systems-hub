import { and, asc, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  curriculumNodes,
  nodePrerequisites,
  masteryRecords,
  reviewItems,
  practiceAttempts,
  practiceItems,
  nodeSkills,
  skillEvidence,
  roleRequirements,
  careerRoles,
  skills,
  userProjects,
  projectCatalog,
  projectEvidence,
  settings,
} from "@/db/schema";

export type LearningState = "deep" | "drift" | "fog" | "overload";
export const HELP_LEVELS = ["none", "hint", "guidance", "concept_reminder", "worked_example", "full_explanation"] as const;
export type HelpLevel = (typeof HELP_LEVELS)[number];

export const MASTERY_LABELS = ["Not yet seen", "Recognise it", "Can recall it", "Can explain it", "Can use it", "Know when to use it", "Can solve new problems", "Can combine with other ideas", "Can build with it", "Can teach it"];

/** State-adaptive delivery parameters. Human-facing, never a diagnosis. */
export function stateProfile(state: LearningState) {
  switch (state) {
    case "deep":
      return { label: "Focused", itemsPerBlock: 4, maxDifficulty: "F", startDifficulty: "B", explanation: "Full session. We keep going while quality stays high; no fixed timer.", density: "full" as const };
    case "drift":
      return { label: "Drifting", itemsPerBlock: 1, maxDifficulty: "D", startDifficulty: "A", explanation: "One concept, one question, one attempt, feedback, then decide.", density: "light" as const };
    case "fog":
      return { label: "Starting feels hard", itemsPerBlock: 2, maxDifficulty: "C", startDifficulty: "A", explanation: "We start with an easy recall and a short example, then raise difficulty gradually.", density: "light" as const };
    case "overload":
      return { label: "Too much at once", itemsPerBlock: 1, maxDifficulty: "B", startDifficulty: "A", explanation: "Fewer items, more worked examples, one idea at a time.", density: "minimal" as const };
  }
}

const DIFF_ORDER = ["A", "B", "C", "D", "E", "F"];
export function difficultyAllowed(d: string, max: string) {
  return DIFF_ORDER.indexOf(d) <= DIFF_ORDER.indexOf(max);
}

/* ------------------------------------------------------------------ */
/* Mastery update                                                      */
/* ------------------------------------------------------------------ */

export async function recordAttemptAndUpdateMastery(args: {
  ownerId: string;
  itemId: string;
  response: string;
  selfScore: number;
  helpLevel: HelpLevel;
  learningState: LearningState;
  isReview: boolean;
  errorType?: string | null;
}) {
  const [item] = await db.select().from(practiceItems).where(eq(practiceItems.id, args.itemId)).limit(1);
  if (!item) throw new Error("Practice item not found");
  const independent = args.helpLevel === "none" || args.helpLevel === "hint";

  const [attempt] = await db
    .insert(practiceAttempts)
    .values({ ownerId: args.ownerId, itemId: item.id, nodeId: item.nodeId, response: args.response, selfScore: args.selfScore, helpLevel: args.helpLevel, learningState: args.learningState, isTransfer: item.isTransfer, isReview: args.isReview, errorType: args.errorType ?? null })
    .returning();

  const [existing] = await db.select().from(masteryRecords).where(and(eq(masteryRecords.ownerId, args.ownerId), eq(masteryRecords.nodeId, item.nodeId))).limit(1);
  const prev = existing ?? { level: 0, recallScore: 0, transferScore: 0, independentAttempts: 0, assistedAttempts: 0, contentSeen: true };

  // Exponential moving averages of performance (0..1). Assisted performance is discounted.
  const perf = (args.selfScore / 3) * (independent ? 1 : 0.5);
  const alpha = 0.4;
  const firstAttempt = prev.independentAttempts + prev.assistedAttempts === 0;
  const ema = (old: number, isFirst: boolean) => (isFirst ? perf : old * (1 - alpha) + perf * alpha);
  const recall = item.isTransfer ? prev.recallScore : ema(prev.recallScore, firstAttempt || (prev.recallScore === 0 && prev.transferScore > 0));
  const transfer = item.isTransfer ? ema(prev.transferScore, firstAttempt || (prev.transferScore === 0 && prev.recallScore > 0)) : prev.transferScore;
  const indep = prev.independentAttempts + (independent ? 1 : 0);
  const assisted = prev.assistedAttempts + (independent ? 0 : 1);

  // Level ladder derived from evidence, not from completion.
  let level = 1;
  if (recall >= 0.5) level = 2;
  if (recall >= 0.7 && indep >= 2) level = 3;
  if (recall >= 0.75 && indep >= 3) level = 4;
  if (recall >= 0.8 && transfer >= 0.5) level = 5;
  if (recall >= 0.8 && transfer >= 0.7 && indep >= 4) level = 6;
  if (transfer >= 0.8 && indep >= 6) level = 7;
  level = Math.max(level, Math.min(prev.level, level + 1));

  await db
    .insert(masteryRecords)
    .values({ ownerId: args.ownerId, nodeId: item.nodeId, level, recallScore: recall, transferScore: transfer, independentAttempts: indep, assistedAttempts: assisted, contentSeen: true, lastAssessedAt: new Date(), updatedAt: new Date() })
    .onConflictDoUpdate({ target: [masteryRecords.ownerId, masteryRecords.nodeId], set: { level, recallScore: recall, transferScore: transfer, independentAttempts: indep, assistedAttempts: assisted, contentSeen: true, lastAssessedAt: new Date(), updatedAt: new Date() } });

  await scheduleReview(args.ownerId, item.nodeId, args.selfScore, independent, item.isTransfer);

  // Skill evidence only from independent, successful work.
  if (independent && args.selfScore >= 2) {
    const linked = await db.select({ skillId: nodeSkills.skillId }).from(nodeSkills).where(eq(nodeSkills.nodeId, item.nodeId));
    if (linked.length) {
      await db.insert(skillEvidence).values(linked.map((l) => ({ ownerId: args.ownerId, skillId: l.skillId, sourceType: args.isReview ? "delayed_transfer" : "assessment", refId: attempt.id, strength: item.isTransfer ? 2 : 1, independent: true, note: `${item.type} (${item.difficulty})` })));
    }
  }

  return { attempt, mastery: { level, recall, transfer, independent: indep, assisted } };
}

/** Adaptive spacing: interval grows with success, shrinks on failure; transfer success grows faster. */
async function scheduleReview(ownerId: string, nodeId: string, selfScore: number, independent: boolean, isTransfer: boolean) {
  const [r] = await db.select().from(reviewItems).where(and(eq(reviewItems.ownerId, ownerId), eq(reviewItems.nodeId, nodeId))).limit(1);
  const success = selfScore >= 2 && independent;
  let interval = r?.intervalDays ?? 1;
  let lapses = r?.lapses ?? 0;
  let reps = r?.repetitions ?? 0;
  if (success) {
    const factor = isTransfer ? 2.8 : 2.2;
    interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.min(60, interval * factor);
    reps += 1;
  } else {
    interval = selfScore === 0 ? 0.5 : 1;
    lapses += 1;
    reps = 0;
  }
  const dueAt = new Date(Date.now() + interval * 86400 * 1000);
  await db
    .insert(reviewItems)
    .values({ ownerId, nodeId, dueAt, intervalDays: interval, lapses, repetitions: reps, lastReviewedAt: new Date() })
    .onConflictDoUpdate({ target: [reviewItems.ownerId, reviewItems.nodeId], set: { dueAt, intervalDays: interval, lapses, repetitions: reps, lastReviewedAt: new Date() } });
}

export async function markContentSeen(ownerId: string, nodeId: string) {
  await db
    .insert(masteryRecords)
    .values({ ownerId, nodeId, level: 1, contentSeen: true, updatedAt: new Date() })
    .onConflictDoUpdate({ target: [masteryRecords.ownerId, masteryRecords.nodeId], set: { contentSeen: true, updatedAt: new Date() } });
}

/* ------------------------------------------------------------------ */
/* Readiness, recommendations                                          */
/* ------------------------------------------------------------------ */

export async function getMasteryMap(ownerId: string) {
  const rows = await db.select().from(masteryRecords).where(eq(masteryRecords.ownerId, ownerId));
  return new Map(rows.map((r) => [r.nodeId, r]));
}

export async function getPrereqMap() {
  const rows = await db.select().from(nodePrerequisites);
  const m = new Map<string, string[]>();
  for (const r of rows) m.set(r.nodeId, [...(m.get(r.nodeId) ?? []), r.prerequisiteId]);
  return m;
}

export const CORE_THRESHOLD = 4; // "Can use it" — enough to build on safely

export async function recommendNext(ownerId: string) {
  const [lessons, mastery, prereqs, due, activeProjects, prefs] = await Promise.all([
    db.select().from(curriculumNodes).where(eq(curriculumNodes.type, "lesson")).orderBy(asc(curriculumNodes.position)),
    getMasteryMap(ownerId),
    getPrereqMap(),
    db.select().from(reviewItems).where(and(eq(reviewItems.ownerId, ownerId), lte(reviewItems.dueAt, new Date()))).orderBy(asc(reviewItems.dueAt)).limit(5),
    db.select({ p: userProjects, c: projectCatalog }).from(userProjects).innerJoin(projectCatalog, eq(projectCatalog.id, userProjects.catalogId)).where(and(eq(userProjects.ownerId, ownerId), inArray(userProjects.status, ["planned", "in_progress"]))).limit(1),
    db.select().from(settings).where(eq(settings.ownerId, ownerId)).limit(1),
  ]);

  const recs: { kind: "review" | "lesson" | "project" | "practice"; title: string; href: string; why: string[]; nodeId?: string }[] = [];

  if (due.length) {
    const node = lessons.find((l) => l.id === due[0].nodeId);
    if (node) recs.push({ kind: "review", title: `Review: ${node.title}`, href: `/review`, why: ["Spaced retrieval is due — a short recall now protects what you already learned", `${due.length} item(s) are due`], nodeId: node.id });
  }

  // Weakest in-progress lesson with met prerequisites
  const ready = lessons.filter((l) => {
    const m = mastery.get(l.id);
    if ((m?.level ?? 0) >= CORE_THRESHOLD) return false;
    const pre = prereqs.get(l.id) ?? [];
    return pre.every((p) => (mastery.get(p)?.level ?? 0) >= CORE_THRESHOLD);
  });
  const original = ready.filter((l) => l.sourceCategory === "original");
  const ordered = [...original, ...ready.filter((l) => l.sourceCategory !== "original")].sort((a, b) => {
    const pa = a.priority === "core" ? 0 : a.priority === "support" ? 1 : 2;
    const pb = b.priority === "core" ? 0 : b.priority === "support" ? 1 : 2;
    return pa - pb;
  });
  const started = ordered.find((l) => mastery.get(l.id)?.contentSeen);
  const next = started ?? ordered[0];
  if (next) {
    const m = mastery.get(next.id);
    const why: string[] = [];
    if (m?.contentSeen) why.push(`You have started this lesson (currently: ${MASTERY_LABELS[m.level]}); practice moves it toward "Can use it"`);
    else why.push("All prerequisites are at or above the core threshold");
    if (next.sourceCategory === "original") why.push("Part of your original curriculum spine");
    if (next.priority === "core") why.push("Classified CORE for an AI Engineer");
    recs.push({ kind: m?.contentSeen ? "practice" : "lesson", title: next.title, href: `/learn/${next.id}`, why, nodeId: next.id });
  }

  if (activeProjects[0]) {
    recs.push({ kind: "project", title: activeProjects[0].c.title, href: `/projects/${activeProjects[0].p.id}`, why: ["Projects are the proof; keep evidence flowing (commits, PRs, reports)"] });
  }

  // Role gap hint
  if (prefs[0]?.targetRoleSlug) {
    const gap = await careerGap(ownerId, prefs[0].targetRoleSlug);
    const firstGap = gap.requirements.find((r) => r.requirementType === "hard" && r.status === "missing");
    if (firstGap) recs.push({ kind: "lesson", title: `Close gap: ${firstGap.skillName}`, href: `/skills`, why: [`Hard requirement for ${gap.role.title} with no evidence yet`] });
  }
  return recs;
}

/* ------------------------------------------------------------------ */
/* Career gap                                                          */
/* ------------------------------------------------------------------ */

export async function careerGap(ownerId: string, roleSlug: string) {
  const [role] = await db.select().from(careerRoles).where(eq(careerRoles.slug, roleSlug)).limit(1);
  if (!role) throw new Error("Role not found");
  const reqs = await db.select({ skillId: roleRequirements.skillId, requirementType: roleRequirements.requirementType, skillName: skills.name, category: skills.category }).from(roleRequirements).innerJoin(skills, eq(skills.id, roleRequirements.skillId)).where(eq(roleRequirements.roleSlug, roleSlug));
  const ev = await db.select({ skillId: skillEvidence.skillId, strength: sql<number>`max(${skillEvidence.strength})::int`, count: sql<number>`count(*)::int`, independent: sql<number>`sum(case when ${skillEvidence.independent} then 1 else 0 end)::int` }).from(skillEvidence).where(eq(skillEvidence.ownerId, ownerId)).groupBy(skillEvidence.skillId);
  const evMap = new Map(ev.map((e) => [e.skillId, e]));
  const requirements = reqs.map((r) => {
    const e = evMap.get(r.skillId);
    const status: "missing" | "developing" | "competent" | "demonstrated" = !e ? "missing" : e.strength >= 3 ? "demonstrated" : e.strength >= 2 && e.independent >= 2 ? "competent" : "developing";
    return { ...r, status, evidenceCount: e?.count ?? 0, independentCount: e?.independent ?? 0 };
  });
  const hard = requirements.filter((r) => r.requirementType === "hard");
  const summary = { hardTotal: hard.length, hardWithEvidence: hard.filter((r) => r.status !== "missing").length, hardDemonstrated: hard.filter((r) => r.status === "demonstrated" || r.status === "competent").length };
  return { role, requirements: requirements.sort((a, b) => a.requirementType.localeCompare(b.requirementType) || a.skillName.localeCompare(b.skillName)), summary };
}

/* ------------------------------------------------------------------ */
/* Dashboards                                                          */
/* ------------------------------------------------------------------ */

export async function learnerSnapshot(ownerId: string) {
  const [attemptAgg] = await db.select({ total: sql<number>`count(*)::int`, independent: sql<number>`sum(case when ${practiceAttempts.helpLevel} in ('none','hint') then 1 else 0 end)::int`, transfer: sql<number>`sum(case when ${practiceAttempts.isTransfer} and ${practiceAttempts.selfScore} >= 2 then 1 else 0 end)::int` }).from(practiceAttempts).where(eq(practiceAttempts.ownerId, ownerId));
  const [dueCount] = await db.select({ c: sql<number>`count(*)::int` }).from(reviewItems).where(and(eq(reviewItems.ownerId, ownerId), lte(reviewItems.dueAt, new Date())));
  const [evCount] = await db.select({ c: sql<number>`count(*)::int` }).from(projectEvidence).where(eq(projectEvidence.ownerId, ownerId));
  const mastery = await db.select({ level: masteryRecords.level }).from(masteryRecords).where(eq(masteryRecords.ownerId, ownerId));
  const errors = await db.select({ errorType: practiceAttempts.errorType, c: sql<number>`count(*)::int` }).from(practiceAttempts).where(and(eq(practiceAttempts.ownerId, ownerId), sql`${practiceAttempts.errorType} is not null`)).groupBy(practiceAttempts.errorType).orderBy(desc(sql`count(*)`));
  return {
    attempts: attemptAgg?.total ?? 0,
    independentAttempts: attemptAgg?.independent ?? 0,
    transferSuccesses: attemptAgg?.transfer ?? 0,
    dueReviews: dueCount?.c ?? 0,
    evidenceItems: evCount?.c ?? 0,
    lessonsAtCore: mastery.filter((m) => m.level >= CORE_THRESHOLD).length,
    lessonsStarted: mastery.length,
    errors,
  };
}
