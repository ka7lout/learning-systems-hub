import "server-only";
import type { Session } from "@/lib/auth/session";
import { owned, newId, type ErrorEntryDoc, type EvidenceDoc, type MasteryRecord, type SubmissionDoc } from "@/lib/dal";
import type { MasteryLevelId } from "@/content/learning-science";

/**
 * MASTERY ENGINE (§34, §35, §180, §182, §218).
 *
 * Mastery is computed only from recorded evidence. Reading a lesson sets
 * `contentSeen` and nothing else — it can never move a skill past "exposed".
 * Unaided correct answers count more than assisted ones (§142 help levels),
 * transfer counts more than recall, and project/debugging evidence is required
 * for "independently demonstrated".
 */

const EMPTY_COMPONENTS: MasteryRecord["components"] = {
  contentSeen: 0,
  practice: 0,
  recall: 0,
  transfer: 0,
  implementation: 0,
  debugging: 0,
  project: 0,
  delayedRetention: 0,
};

const HELP_WEIGHT: Record<string, number> = {
  "No Help": 1,
  Hint: 0.8,
  Guidance: 0.6,
  "Concept Reminder": 0.5,
  "Worked Example": 0.25,
  "Full Explanation": 0.1,
};

export interface SkillMastery {
  skillId: string;
  level: MasteryLevelId;
  components: MasteryRecord["components"];
  attempts: number;
  unaidedPasses: number;
  transferPasses: number;
  evidenceCount: number;
  lastEvidenceAt?: string;
}

function levelFrom(c: MasteryRecord["components"], unaidedPasses: number, transferPasses: number, evidenceCount: number): MasteryLevelId {
  if (c.contentSeen === 0 && c.practice === 0 && unaidedPasses === 0) return "unknown";
  if (unaidedPasses === 0) return "exposed";
  if (unaidedPasses >= 1 && (transferPasses === 0 || c.recall < 0.6)) return "developing";
  if (transferPasses >= 1 && unaidedPasses >= 2 && (evidenceCount > 0 || c.implementation > 0)) {
    if (transferPasses >= 2 && evidenceCount >= 1 && c.delayedRetention > 0) return "independent";
    return "competent";
  }
  return "developing";
}

export async function computeSkillMastery(session: Session, skillIds: string[]): Promise<Map<string, SkillMastery>> {
  const submissions = await owned<SubmissionDoc>(session, "submissions").find({});
  const evidence = await owned<EvidenceDoc>(session, "project_evidence").find({});
  const seen = await owned<MasteryRecord>(session, "mastery_records").find({});
  // Debugging is evidenced by errors the student diagnosed and corrected (§145, §218).
  const fixedErrors = await owned<ErrorEntryDoc>(session, "error_notebook").find({ resolved: true });
  const seenBySkill = new Map(seen.map((r) => [r.skillId, r]));

  const out = new Map<string, SkillMastery>();
  for (const skillId of skillIds) {
    const subs = submissions.filter((s) => s.skillIds.includes(skillId));
    const ev = evidence.filter((e) => e.skillIds.includes(skillId));
    const stored = seenBySkill.get(skillId);
    const components = { ...EMPTY_COMPONENTS, ...(stored?.components ?? {}) };

    let unaided = 0;
    let transfer = 0;
    let recallScore = 0;
    let recallCount = 0;
    for (const s of subs) {
      if (s.correct === null) continue;
      const w = HELP_WEIGHT[s.helpLevel] ?? 0.5;
      if (s.correct) {
        if (w >= 0.8) unaided += 1;
        if (s.tier === "transfer") transfer += 1;
        recallScore += w;
      }
      recallCount += 1;
    }
    components.practice = subs.length;
    components.recall = recallCount ? Number((recallScore / recallCount).toFixed(2)) : 0;
    components.transfer = transfer;
    components.implementation = ev.filter((e) => e.kind === "repository" || e.kind === "deployment").length;
    components.debugging = fixedErrors.filter((e) => e.skillIds.includes(skillId)).length;
    components.project = ev.filter((e) => Boolean(e.projectId)).length;

    const level = levelFrom(components, unaided, transfer, ev.length);
    out.set(skillId, {
      skillId,
      level,
      components,
      attempts: subs.length,
      unaidedPasses: unaided,
      transferPasses: transfer,
      evidenceCount: ev.length,
      lastEvidenceAt: ev[ev.length - 1]?.createdAt ?? subs[subs.length - 1]?.createdAt,
    });
  }
  return out;
}

/** Called when a lesson is opened. Sets contentSeen only — never a mastery level. */
export async function markContentSeen(session: Session, skillIds: string[]): Promise<void> {
  const store = owned<MasteryRecord>(session, "mastery_records");
  for (const skillId of skillIds) {
    const existing = await store.findOne({ skillId });
    if (existing) {
      await store.update({ skillId }, { components: { ...existing.components, contentSeen: existing.components.contentSeen + 1 } });
    } else {
      await store.insert({
        _id: newId("mas"),
        skillId,
        level: "exposed",
        components: { ...EMPTY_COMPONENTS, contentSeen: 1 },
        evidenceRefs: [],
      });
    }
  }
}

export async function persistMastery(session: Session, mastery: Map<string, SkillMastery>): Promise<void> {
  const store = owned<MasteryRecord>(session, "mastery_records");
  for (const m of mastery.values()) {
    const existing = await store.findOne({ skillId: m.skillId });
    if (existing) await store.update({ skillId: m.skillId }, { level: m.level, components: m.components, lastEvidenceAt: m.lastEvidenceAt });
    else
      await store.insert({
        _id: newId("mas"),
        skillId: m.skillId,
        level: m.level,
        components: m.components,
        evidenceRefs: [],
        lastEvidenceAt: m.lastEvidenceAt,
      });
  }
}
