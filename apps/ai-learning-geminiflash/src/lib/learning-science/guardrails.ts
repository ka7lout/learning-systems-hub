export interface CompulsionCheckResult {
  isOverChecking: boolean;
  message?: string;
  recommendedAction: "proceed_to_test" | "run_code" | "review_hint" | "continue";
}

export function evaluateCheckingBehavior(checkCount: number, confidence: number): CompulsionCheckResult {
  if (checkCount >= 4) {
    return {
      isOverChecking: true,
      message: "You have verified this solution multiple times. Further confirmation without new empirical data will not increase your learning yield. Proceed directly to the test harness or transfer challenge.",
      recommendedAction: "run_code"
    };
  }
  
  if (checkCount === 3 && confidence >= 70) {
    return {
      isOverChecking: true,
      message: "Your current reasoning is solid. Rather than asking for reassurance, test your code against the edge cases in the test suite.",
      recommendedAction: "proceed_to_test"
    };
  }

  return {
    isOverChecking: false,
    recommendedAction: "continue"
  };
}

export interface DependencyAuditResult {
  isDependent: boolean;
  interventionType?: "mandatory_attempt" | "explain_back" | "fill_the_gap" | "code_prediction";
  instruction?: string;
}

export function auditAIDependency(
  consecutiveQueriesWithoutAttempts: number,
  averageHelpLevel: string
): DependencyAuditResult {
  if (consecutiveQueriesWithoutAttempts >= 2 || averageHelpLevel === "full_explanation") {
    return {
      isDependent: true,
      interventionType: "mandatory_attempt",
      instruction: "To preserve your independent problem-solving capacity, the AI Mentor will provide a targeted Socratic hint rather than the direct code solution. What is your initial hypothesis for the first step?"
    };
  }

  return { isDependent: false };
}
