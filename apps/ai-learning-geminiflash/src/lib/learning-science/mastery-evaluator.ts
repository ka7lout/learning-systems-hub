export interface MasteryLevelDefinition {
  level: number;
  code: string;
  title: string;
  description: string;
  demonstrationCriteria: string;
}

export const MASTERY_PYRAMID: MasteryLevelDefinition[] = [
  { level: 0, code: "L0", title: "Unrecognized", description: "Concept not yet encountered or recognized.", demonstrationCriteria: "None." },
  { level: 1, code: "L1", title: "Recognition", description: "Can recognize and identify the concept when presented with definitions.", demonstrationCriteria: "Identifies core terminology and symbols." },
  { level: 2, code: "L2", title: "Direct Recall", description: "Can retrieve definitions, formulas, and invariants without looking at references.", demonstrationCriteria: "Passes closed-book active recall prompts." },
  { level: 3, code: "L3", title: "Conceptual Explanation", description: "Can articulate the 'Why', mental model, and mechanics in own words.", demonstrationCriteria: "Explains concept to mentor or passes oral viva." },
  { level: 4, code: "L4", title: "Direct Application", description: "Can execute algorithms and write standard code implementing the concept.", demonstrationCriteria: "Solves standard problem sets and guided exercises." },
  { level: 5, code: "L5", title: "Tool Selection & Context", description: "Knows when to use the concept vs alternatives based on trade-offs.", demonstrationCriteria: "Justifies algorithm/model choice in case studies." },
  { level: 6, code: "L6", title: "Novel Transfer", description: "Can apply the concept to unfamiliar domains with noisy constraints.", demonstrationCriteria: "Solves novel transfer challenges without scaffolding." },
  { level: 7, code: "L7", title: "Systemic Integration", description: "Can combine multiple concepts into coherent multi-layer pipelines.", demonstrationCriteria: "Integrates concept into data/ML pipelines." },
  { level: 8, code: "L8", title: "Production Building", description: "Can engineer, test, package, and deploy a robust production system.", demonstrationCriteria: "Completes portfolio project with tests and docs." },
  { level: 9, code: "L9", title: "Instruction & Critique", description: "Can critique research papers, diagnose deep edge cases, and teach.", demonstrationCriteria: "Performs code reviews, debugs complex bugs, authors research audits." }
];

export interface CompositeMasteryEvaluation {
  understandingScore: number; // 0-10
  recallScore: number;        // 0-10
  explanationScore: number;   // 0-10
  problemSolvingScore: number;// 0-10
  transferScore: number;      // 0-10
  projectScore: number;       // 0-10
  helpLevelUsed: "no_help" | "hint" | "guidance" | "concept_reminder" | "worked_example" | "full_explanation";
  isIndependent: boolean;
}

export function computeMasteryLevel(scores: CompositeMasteryEvaluation): { level: number; label: string; confidence: number } {
  const {
    understandingScore,
    recallScore,
    explanationScore,
    problemSolvingScore,
    transferScore,
    projectScore,
    helpLevelUsed,
    isIndependent
  } = scores;

  // Weightings: Transfer and problem solving with independence carry highest signal
  const independenceMultiplier = isIndependent ? 1.0 : helpLevelUsed === "hint" ? 0.85 : 0.6;
  
  const composite = (
    understandingScore * 0.15 +
    recallScore * 0.15 +
    explanationScore * 0.15 +
    problemSolvingScore * 0.20 +
    transferScore * 0.25 +
    projectScore * 0.10
  ) * independenceMultiplier;

  let level = 0;
  if (composite >= 8.8 && transferScore >= 8 && problemSolvingScore >= 8) level = 8;
  else if (composite >= 7.8 && transferScore >= 7) level = 6;
  else if (composite >= 6.5 && problemSolvingScore >= 6) level = 4;
  else if (composite >= 5.0 && explanationScore >= 5) level = 3;
  else if (composite >= 3.5 && recallScore >= 4) level = 2;
  else if (composite >= 1.5) level = 1;

  const def = MASTERY_PYRAMID.find((m) => m.level === level) || MASTERY_PYRAMID[0];

  return {
    level,
    label: `${def.code} - ${def.title}`,
    confidence: Math.min(100, Math.round(composite * 10))
  };
}
