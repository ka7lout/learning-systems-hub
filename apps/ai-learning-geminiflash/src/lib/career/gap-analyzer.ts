import { CANONICAL_CAREER_ROLES, CareerRoleSeed } from "@/data/career-roles";
import { CANONICAL_SKILLS } from "@/data/skills";

export interface SkillGapAnalysisResult {
  role: CareerRoleSeed;
  readinessPercentage: number;
  matchedRequiredSkills: Array<{ id: string; name: string; masteryLevel: number }>;
  missingRequiredSkills: Array<{ id: string; name: string; recommendedNodeId: string }>;
  matchedPreferredSkills: Array<{ id: string; name: string }>;
  missingPreferredSkills: Array<{ id: string; name: string }>;
  recommendedNextActions: string[];
}

export function analyzeCareerSkillGap(
  targetRoleId: string,
  userMasteredSkillIds: string[] = ["sk-python", "sk-sql-databases", "sk-linear-algebra", "sk-classical-ml"]
): SkillGapAnalysisResult {
  const role = CANONICAL_CAREER_ROLES.find((r) => r.id === targetRoleId || r.slug === targetRoleId) || CANONICAL_CAREER_ROLES[0];

  const matchedRequired: SkillGapAnalysisResult["matchedRequiredSkills"] = [];
  const missingRequired: SkillGapAnalysisResult["missingRequiredSkills"] = [];
  const matchedPreferred: SkillGapAnalysisResult["matchedPreferredSkills"] = [];
  const missingPreferred: SkillGapAnalysisResult["missingPreferredSkills"] = [];

  for (const skillId of role.requiredSkills) {
    const skillDef = CANONICAL_SKILLS.find((s) => s.id === skillId);
    const skillName = skillDef ? skillDef.name : skillId;

    if (userMasteredSkillIds.includes(skillId)) {
      matchedRequired.push({ id: skillId, name: skillName, masteryLevel: 7 });
    } else {
      missingRequired.push({
        id: skillId,
        name: skillName,
        recommendedNodeId: getRecommendedNodeForSkill(skillId)
      });
    }
  }

  for (const skillId of role.preferredSkills) {
    const skillDef = CANONICAL_SKILLS.find((s) => s.id === skillId);
    const skillName = skillDef ? skillDef.name : skillId;

    if (userMasteredSkillIds.includes(skillId)) {
      matchedPreferred.push({ id: skillId, name: skillName });
    } else {
      missingPreferred.push({ id: skillId, name: skillName });
    }
  }

  const totalRequired = role.requiredSkills.length;
  const readiness = totalRequired > 0 ? Math.round((matchedRequired.length / totalRequired) * 100) : 0;

  const recommendedActions: string[] = [];
  if (missingRequired.length > 0) {
    recommendedActions.push(`Close high-priority gap: complete "${missingRequired[0].name}" curriculum module.`);
  }
  if (role.flagshipProjects.length > 0) {
    recommendedActions.push(`Implement flagship portfolio artifact: "${role.flagshipProjects[0]}".`);
  }
  recommendedActions.push("Complete an oral viva simulation defending architectural trade-offs in English.");

  return {
    role,
    readinessPercentage: readiness,
    matchedRequiredSkills: matchedRequired,
    missingRequiredSkills: missingRequired,
    matchedPreferredSkills: matchedPreferred,
    missingPreferredSkills: missingPreferred,
    recommendedNextActions: recommendedActions
  };
}

function getRecommendedNodeForSkill(skillId: string): string {
  switch (skillId) {
    case "sk-deep-learning":
      return "m7-s1-neural-networks-foundations";
    case "sk-llm-transformers":
      return "m7-s6-transformers-llms-rag-agents";
    case "sk-rag-vector-db":
      return "m7-s6-transformers-llms-rag-agents";
    case "sk-agentic-systems":
      return "m7-s6-transformers-llms-rag-agents";
    case "sk-mlops-docker-cicd":
      return "m8-s1-fastapi-streamlit-docker";
    default:
      return "m1-s1-fundamentals";
  }
}
