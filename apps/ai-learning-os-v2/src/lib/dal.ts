import "server-only";
import { db } from "@/db";
import { nodes, mastery, reviews, attempts, practiceItems, skills, careerRoles, evidence, userProjects, projectCatalog, aiMessages, settings, mappings, sources } from "@/db/schema";
import { and, eq, lte, desc, asc, inArray, gte, sql } from "drizzle-orm";
import { ensureSeed } from "./seed";
import { nextReview, masteryLevel, updateDimension, type HelpLevel, type StudyState, scoreFromKeyPoints, competenceBand } from "./learning";
import { provider, MODEL_ROUTER, buildMessages, type MentorAction, ProviderUnavailableError } from "./ai";
import { getSettings } from "./auth";

// All functions taking ownerId expect a server-derived id from the session — never from client input.

export async function curriculum() {
  await ensureSeed();
  return db.select().from(nodes).orderBy(asc(nodes.sortOrder));
}
export async function unit(id: string) {
  await ensureSeed();
  const [n] = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1);
  if (!n) return null;
  const items = await db.select().from(practiceItems).where(eq(practiceItems.nodeId, id));
  const maps = await db.select().from(mappings).where(eq(mappings.nodeId, id));
  const srcIds = [...new Set([...n.sourceRefs, ...maps.map((m) => m.sourceId).filter(Boolean) as string[]])];
  const srcs = srcIds.length ? await db.select().from(sources).where(inArray(sources.id, srcIds)) : [];
  const prereqs = n.prerequisites.length ? await db.select({ id: nodes.id, title: nodes.title }).from(nodes).where(inArray(nodes.id, n.prerequisites)) : [];
  return { node: n, items, maps, sources: srcs, prereqs };
}

export async function masteryMap(ownerId: string) {
  const rows = await db.select().from(mastery).where(eq(mastery.ownerId, ownerId));
  return new Map(rows.map((r) => [r.nodeId, r]));
}

export async function markSeen(ownerId: string, nodeId: string) {
  await db.insert(mastery).values({ ownerId, nodeId, contentSeen: true, level: 1 }).onConflictDoUpdate({ target: [mastery.ownerId, mastery.nodeId], set: { contentSeen: true, level: sql`greatest(${mastery.level}, 1)` } });
}

export async function recordAttempt(ownerId: string, input: { itemId: string; response: string; helpLevel: HelpLevel; covered: number; errorType: string | null; studyState: StudyState; feedback?: string | null; grader: "self" | "ai" }) {
  const [item] = await db.select().from(practiceItems).where(eq(practiceItems.id, input.itemId)).limit(1);
  if (!item) throw new Error("Unknown practice item");
  const score = scoreFromKeyPoints(item.keyPoints.length, input.covered);
  await db.insert(attempts).values({ ownerId, itemId: item.id, nodeId: item.nodeId, response: input.response, helpLevel: input.helpLevel, score, grader: input.grader, errorType: score >= 0.85 ? null : input.errorType, feedback: input.feedback ?? null, studyState: input.studyState });

  const [prev] = await db.select().from(mastery).where(and(eq(mastery.ownerId, ownerId), eq(mastery.nodeId, item.nodeId)));
  const [rev] = await db.select().from(reviews).where(and(eq(reviews.ownerId, ownerId), eq(reviews.nodeId, item.nodeId)));
  const delayedPass = !!rev && rev.reps >= 1 && rev.dueAt <= new Date() && score >= 0.7 ? true : (rev?.reps ?? 0) >= 2;
  const dim = item.stage === "recall" ? "recall" : item.stage === "transfer" || item.stage === "case" ? "transfer" : "application";
  const base = { recall: prev?.recall ?? 0, application: prev?.application ?? 0, transfer: prev?.transfer ?? 0 };
  base[dim] = updateDimension(base[dim], score, input.helpLevel);
  const independent = (prev?.independentCount ?? 0) + (input.helpLevel === "none" && score >= 0.7 ? 1 : 0);
  const assisted = (prev?.assistedCount ?? 0) + (input.helpLevel !== "none" ? 1 : 0);
  const projEv = await db.select({ c: sql<number>`count(*)::int` }).from(evidence).innerJoin(userProjects, eq(userProjects.id, evidence.userProjectId)).innerJoin(projectCatalog, eq(projectCatalog.id, userProjects.catalogId)).where(and(eq(evidence.ownerId, ownerId), sql`${projectCatalog.nodeIds} ? ${item.nodeId}`));
  const level = masteryLevel({ ...base, independentCount: independent, contentSeen: true, delayedPass, projectEvidence: Number(projEv[0]?.c ?? 0) > 0 });
  const vals = { ...base, level, independentCount: independent, assistedCount: assisted, contentSeen: true, updatedAt: new Date() };
  await db.insert(mastery).values({ ownerId, nodeId: item.nodeId, ...vals }).onConflictDoUpdate({ target: [mastery.ownerId, mastery.nodeId], set: vals });

  const nr = nextReview(rev ? { intervalDays: rev.intervalDays, reps: rev.reps, lapses: rev.lapses } : null, score, { transfer: dim === "transfer" });
  const due = new Date(Date.now() + nr.intervalDays * 86400_000);
  await db.insert(reviews).values({ ownerId, nodeId: item.nodeId, dueAt: due, ...nr }).onConflictDoUpdate({ target: [reviews.ownerId, reviews.nodeId], set: { dueAt: due, ...nr } });
  return { score, level, nextReviewDays: nr.intervalDays, keyPoints: item.keyPoints, modelAnswer: item.modelAnswer };
}

export async function dueReviews(ownerId: string) {
  return db.select({ nodeId: reviews.nodeId, dueAt: reviews.dueAt, title: nodes.title, lapses: reviews.lapses, intervalDays: reviews.intervalDays }).from(reviews).innerJoin(nodes, eq(nodes.id, reviews.nodeId)).where(eq(reviews.ownerId, ownerId)).orderBy(asc(reviews.dueAt));
}

export type NextTask = { nodeId: string; title: string; kind: "review" | "continue" | "new"; reason: string };
export async function nextBestTask(ownerId: string): Promise<NextTask | null> {
  const all = (await curriculum()).filter((n) => n.type === "unit");
  const m = await masteryMap(ownerId);
  const revs = await dueReviews(ownerId);
  const due = revs.find((r) => r.dueAt <= new Date());
  if (due) return { nodeId: due.nodeId, title: due.title, kind: "review", reason: `Review reason: scheduled retrieval is due${due.lapses ? ` (missed ${due.lapses}× before, so it comes back sooner)` : ""}.` };
  const { data: s } = await getSettings(ownerId);
  const roles = s.targetRoles.length ? await db.select().from(careerRoles).where(inArray(careerRoles.id, s.targetRoles)) : [];
  const roleSkills = new Set(roles.flatMap((r) => r.hard));
  const lvl = (id: string) => m.get(id)?.level ?? 0;
  const ready = (n: (typeof all)[number]) => n.prerequisites.every((p) => lvl(p) >= 3);
  const inProgress = all.find((n) => m.get(n.id)?.contentSeen && lvl(n.id) < 6 && ready(n));
  if (inProgress) return { nodeId: inProgress.id, title: inProgress.title, kind: "continue", reason: `Mastery reason: you've started this unit but haven't shown independent transfer yet (currently L${lvl(inProgress.id)}).` };
  const candidates = all.filter((n) => lvl(n.id) === 0 && ready(n));
  const tierRank = (t: string) => (t === "CORE" ? 0 : t === "SUPPORT" ? 1 : 2);
  candidates.sort((a, b) => {
    const ra = a.skills.some((k) => roleSkills.has(k)) ? 0 : 1, rb = b.skills.some((k) => roleSkills.has(k)) ? 0 : 1;
    return tierRank(a.tier) - tierRank(b.tier) || ra - rb || a.sortOrder - b.sortOrder;
  });
  const c = candidates[0];
  if (!c) return null;
  const career = c.skills.find((k) => roleSkills.has(k));
  return { nodeId: c.id, title: c.title, kind: "new", reason: c.prerequisites.length ? `Prerequisite reason: its prerequisites are at a safe threshold (L3+).${career ? ` Skill-gap reason: builds "${career}", required by your target role.` : ""}` : `Foundation reason: no prerequisites, ${c.tier} tier.${career ? ` Builds "${career}" required by your target role.` : ""}` };
}

export async function skillStatus(ownerId: string) {
  await ensureSeed();
  const sk = await db.select().from(skills).orderBy(asc(skills.area));
  const m = await masteryMap(ownerId);
  const ev = await db.select({ skillId: evidence.skillId, c: sql<number>`count(*)::int` }).from(evidence).where(eq(evidence.ownerId, ownerId)).groupBy(evidence.skillId);
  const evMap = new Map(ev.map((e) => [e.skillId, Number(e.c)]));
  return sk.map((s) => {
    const levels = s.nodeIds.map((id) => m.get(id)?.level ?? 0);
    const level = levels.length ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 0;
    const best = levels.length ? Math.max(...levels) : 0;
    return { ...s, level, best, band: competenceBand(best), evidenceCount: evMap.get(s.id) ?? 0 };
  });
}

export async function careerReport(ownerId: string) {
  await ensureSeed();
  const roles = await db.select().from(careerRoles);
  const st = new Map((await skillStatus(ownerId)).map((s) => [s.id, s]));
  const units = (await curriculum()).filter((n) => n.type === "unit");
  return roles.map((r) => {
    const row = (id: string) => { const s = st.get(id); return { id, name: s?.name ?? id, band: s?.band ?? "not started", evidence: s?.evidenceCount ?? 0, independent: (s?.best ?? 0) >= 6 }; };
    const hard = r.hard.map(row), preferred = r.preferred.map(row);
    const missing = hard.filter((h) => !h.independent);
    const tasks = missing.slice(0, 5).map((mk) => { const u = units.find((n) => n.skills.includes(mk.id)); return u ? { skill: mk.name, nodeId: u.id, title: u.title } : null; }).filter(Boolean) as { skill: string; nodeId: string; title: string }[];
    return { ...r, hardRows: hard, preferredRows: preferred, metHard: hard.filter((h) => h.independent && h.evidence > 0).length, missing, tasks };
  });
}

export async function recentErrors(ownerId: string, nodeId?: string) {
  const where = nodeId ? and(eq(attempts.ownerId, ownerId), eq(attempts.nodeId, nodeId)) : eq(attempts.ownerId, ownerId);
  return db.select().from(attempts).where(where).orderBy(desc(attempts.createdAt)).limit(10);
}

export async function mentor(ownerId: string, action: MentorAction, nodeId: string | null, input: string) {
  const { data: s } = await getSettings(ownerId);
  let context = `Learner study state: ${s.studyState}. Content language mode: ${s.contentMode}. Hint policy: ${s.hintPolicy}.`;
  if (nodeId) {
    const u = await unit(nodeId);
    if (u) {
      const [mr] = await db.select().from(mastery).where(and(eq(mastery.ownerId, ownerId), eq(mastery.nodeId, nodeId)));
      const errs = (await recentErrors(ownerId, nodeId)).filter((a) => a.errorType).slice(0, 3);
      context += `\nUnit: ${u.node.title} (${u.node.sourceCategory}, ${u.node.level}). Why: ${u.node.why}\nTopics: ${u.node.topics.join(", ")}\nPrerequisites: ${u.prereqs.map((p) => p.title).join(", ") || "none"}\nMastery level: L${mr?.level ?? 0}\nRecent error types: ${errs.map((e) => e.errorType).join(", ") || "none"}`;
    }
  }
  // AI dependency detector: many mentor requests and no attempts in the last 30 minutes.
  const since = new Date(Date.now() - 30 * 60_000);
  const [{ q }] = await db.select({ q: sql<number>`count(*)::int` }).from(aiMessages).where(and(eq(aiMessages.ownerId, ownerId), eq(aiMessages.role, "user"), gte(aiMessages.createdAt, since)));
  const [{ a }] = await db.select({ a: sql<number>`count(*)::int` }).from(attempts).where(and(eq(attempts.ownerId, ownerId), gte(attempts.createdAt, since)));
  let effective = action;
  let guard: string | null = null;
  if (Number(q) >= 6 && Number(a) === 0 && ["explain", "chat", "example"].includes(action)) {
    effective = "oral";
    guard = "You've asked several questions without an attempt yet. Let's switch to explain-back: answer one question in your own words first.";
  }
  if (action === "check" && input.trim()) {
    const recent = await db.select({ content: aiMessages.content }).from(aiMessages).where(and(eq(aiMessages.ownerId, ownerId), eq(aiMessages.role, "user"), eq(aiMessages.specialist, "Examiner"), gte(aiMessages.createdAt, since)));
    if (recent.filter((r) => r.content.trim() === input.trim()).length >= 2) {
      return { content: "This exact answer has already been checked. Re-checking without changes won't add new evidence. Move on to the next practice task — if you find a new mistake or change your answer, check again then.", specialist: "AI Safety / Integrity Reviewer", model: null, guard: "reassurance-limit" };
    }
  }
  if (s.contentMode === "arabic" && effective === "chat") context += "\nRespond in Arabic with English technical terms.";
  if (s.contentMode === "b1b2" && effective === "chat") context += "\nRespond in B1–B2 English.";
  const historyRows = await db.select().from(aiMessages).where(and(eq(aiMessages.ownerId, ownerId), nodeId ? eq(aiMessages.nodeId, nodeId) : sql`${aiMessages.nodeId} is null`)).orderBy(desc(aiMessages.createdAt)).limit(6);
  const history = historyRows.reverse().map((r) => ({ role: r.role === "user" ? "user" as const : "assistant" as const, content: r.content }));
  const model = MODEL_ROUTER.route(effective);
  const { SPECIALISTS } = await import("./ai");
  const specialist = SPECIALISTS[effective].name;
  if (!provider.available()) throw new ProviderUnavailableError("The AI Mentor is not configured on this deployment (PUTER_AUTH_TOKEN missing). Lessons, practice and review still work.");
  await db.insert(aiMessages).values({ ownerId, nodeId, role: "user", specialist, content: input || `[${action}]` });
  const text = await provider.chat(model, buildMessages(effective, context, input, history));
  const content = guard ? `${guard}\n\n${text}` : text;
  await db.insert(aiMessages).values({ ownerId, nodeId, role: "assistant", specialist, content, model });
  return { content, specialist, model, guard };
}

export async function diagnosticDone(ownerId: string) {
  await db.update(settings).set({ diagnosticDone: true }).where(eq(settings.userId, ownerId));
}
export { lte };
