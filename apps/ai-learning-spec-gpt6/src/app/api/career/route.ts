import { eq } from "drizzle-orm";
import { db } from "@/db";
import { careerRoles, jobRequirements, jobSnapshots, skillEvidence, skills } from "@/db/schema";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeSkill(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  await ensureCurriculumSeeded();
  const [roles, evidence, snapshots] = await Promise.all([
    db.select().from(careerRoles),
    db.select({ skillId: skillEvidence.skillId, skillTitle: skills.title, evidenceType: skillEvidence.evidenceType, evidenceSummary: skillEvidence.evidenceSummary, independent: skillEvidence.independent, artifactUrl: skillEvidence.artifactUrl })
      .from(skillEvidence).innerJoin(skills, eq(skillEvidence.skillId, skills.id)).where(eq(skillEvidence.ownerId, actor.id)),
    db.select().from(jobSnapshots),
  ]);
  const evidenceSkills = new Set(evidence.map((item) => normalizeSkill(item.skillTitle)));
  const roleData = await Promise.all(roles.map(async (role) => {
    const requirements = await db.select({ skillName: jobRequirements.skillName, requirementType: jobRequirements.requirementType, confidence: jobRequirements.confidence }).from(jobRequirements).where(eq(jobRequirements.roleId, role.id));
    const mappedEvidenceCount = requirements.filter((item) => evidenceSkills.has(normalizeSkill(item.skillName))).length;
    return {
      id: role.id, title: role.title, sourceStatus: role.sourceStatus, sourceNote: role.sourceNote,
      region: role.region, seniority: role.seniority, sourceUrl: role.sourceUrl, snapshotDate: role.snapshotDate,
      requirements, evidenceCount: evidence.length, mappedEvidenceCount,
      gapStatus: evidence.length === 0 ? "no_evidence_yet" : "evidence_review_needed",
    };
  }));
  return Response.json({
    roles: roleData,
    evidence,
    marketSnapshots: snapshots,
    currentJobSnapshotCount: snapshots.filter((snapshot) => snapshot.sourceStatus === "confirmed_current").length,
    marketDataNote: "A dated first-party role example is a single employer-specific snapshot, not a market statistic or hiring prediction. Check the linked posting again; it can close or change.",
  });
}
