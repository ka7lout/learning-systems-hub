import "server-only";
import type { Session } from "@/lib/auth/session";
import { owned, type EvidenceDoc } from "@/lib/dal";
import { computeSkillMastery } from "./mastery";
import { buildCurriculumGraph } from "@/content";
import type { CareerRole } from "@/content/types";

/**
 * CAREER ENGINE (§160, §163, §165, §166, §180).
 *
 * Readiness is reported per requirement, never as a single "you are ready"
 * percentage, and never as a promise of employment. A requirement is only
 * "demonstrated" when real evidence exists.
 */

export type RequirementStatus = "no_evidence" | "learning" | "practised" | "demonstrated";

export interface RequirementReport {
  id: string;
  label: string;
  kind: "hard" | "preferred";
  status: RequirementStatus;
  skills: { id: string; title: string; level: string }[];
  evidence: { title: string; kind: string; url?: string; verified: boolean }[];
  recommendation?: string;
}

export interface RoleReport {
  role: CareerRole;
  hard: RequirementReport[];
  preferred: RequirementReport[];
  summary: {
    hardTotal: number;
    hardDemonstrated: number;
    hardNoEvidence: number;
    preferredTotal: number;
    preferredDemonstrated: number;
  };
}

export async function buildRoleReport(session: Session, roleId: string): Promise<RoleReport | null> {
  const graph = buildCurriculumGraph();
  const role = graph.roles.find((r) => r.id === roleId);
  if (!role) return null;

  const mastery = await computeSkillMastery(session, graph.skills.map((s) => s.id));
  const evidence = await owned<EvidenceDoc>(session, "project_evidence").find({});

  const toReport = (req: CareerRole["requirements"][number]): RequirementReport => {
    const skills = req.skillIds.map((id) => ({
      id,
      title: graph.skills.find((s) => s.id === id)?.title ?? id,
      level: mastery.get(id)?.level ?? "unknown",
    }));
    const relevantEvidence = evidence.filter((e) => e.skillIds.some((s) => req.skillIds.includes(s)));
    const levels = skills.map((s) => s.level);
    let status: RequirementStatus = "no_evidence";
    if (levels.some((l) => l === "independent") && relevantEvidence.some((e) => e.verified)) status = "demonstrated";
    else if (levels.some((l) => l === "competent" || l === "independent")) status = "practised";
    else if (levels.some((l) => l === "developing" || l === "exposed")) status = "learning";

    const firstGapLesson = graph.lessons.find((l) => l.skills.some((s) => req.skillIds.includes(s)));
    return {
      id: req.id,
      label: req.label,
      kind: req.kind,
      status,
      skills,
      evidence: relevantEvidence.map((e) => ({ title: e.title, kind: e.kind, url: e.url, verified: e.verified })),
      recommendation:
        status === "no_evidence" && firstGapLesson
          ? `Start with "${firstGapLesson.title}", then produce one artefact that proves it.`
          : status === "practised"
            ? "You have practice but no verified artefact. Attach repository, deployment or report evidence."
            : undefined,
    };
  };

  const hard = role.requirements.filter((r) => r.kind === "hard").map(toReport);
  const preferred = role.requirements.filter((r) => r.kind === "preferred").map(toReport);

  return {
    role,
    hard,
    preferred,
    summary: {
      hardTotal: hard.length,
      hardDemonstrated: hard.filter((r) => r.status === "demonstrated").length,
      hardNoEvidence: hard.filter((r) => r.status === "no_evidence").length,
      preferredTotal: preferred.length,
      preferredDemonstrated: preferred.filter((r) => r.status === "demonstrated").length,
    },
  };
}

/** §165/§166 — a CV bullet is only offered when evidence backs it. */
export async function cvEligibleEvidence(session: Session) {
  const graph = buildCurriculumGraph();
  const evidence = await owned<EvidenceDoc>(session, "project_evidence").find({});
  return evidence
    .filter((e) => e.verified && (Boolean(e.url) || e.description.length > 40))
    .map((e) => {
      const project = graph.projects.find((p) => p.id === e.projectId);
      return {
        evidenceId: e._id,
        cvClass: project?.cvClass ?? ("Skill Evidence" as const),
        title: e.title,
        url: e.url,
        description: e.description,
        skills: e.skillIds.map((id) => graph.skills.find((s) => s.id === id)?.title ?? id),
      };
    });
}
