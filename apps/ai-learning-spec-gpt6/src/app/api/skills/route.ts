import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { skillEvidence, skills } from "@/db/schema";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  await ensureCurriculumSeeded();
  const [allSkills, evidence] = await Promise.all([
    db.select({ id: skills.id, title: skills.title, category: skills.category, sourceCategory: skills.sourceCategory, description: skills.description, nodeIds: skills.nodeIds }).from(skills),
    db.select({ id: skillEvidence.id, skillId: skillEvidence.skillId, evidenceType: skillEvidence.evidenceType, evidenceSummary: skillEvidence.evidenceSummary, independent: skillEvidence.independent, createdAt: skillEvidence.createdAt }).from(skillEvidence).where(eq(skillEvidence.ownerId, actor.id)),
  ]);
  const bySkill = new Map<string, typeof evidence>();
  for (const item of evidence) bySkill.set(item.skillId, [...(bySkill.get(item.skillId) ?? []), item]);
  const mapped = allSkills.map((skill) => ({ ...skill, evidence: bySkill.get(skill.id) ?? [], status: bySkill.has(skill.id) ? "evidence_recorded" : "no_evidence_yet" }));
  return Response.json({ skills: mapped, evidenceCount: evidence.length });
}
