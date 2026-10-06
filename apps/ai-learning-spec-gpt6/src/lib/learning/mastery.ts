export type PracticeKind = "recall" | "practice" | "transfer" | "debug" | "explain" | "case";
export type HelpLevel = "no_help" | "hint" | "guidance" | "concept_reminder" | "worked_example" | "full_explanation";

export type Evaluation = { score: number | null; correct: boolean | null; feedback: string };

/** Only deterministically check tasks with a known answer; open responses remain ungraded. */
export function evaluateAttempt(nodeId: string, kind: PracticeKind, answer: string): Evaluation {
  if (nodeId === "python-programming-u1-t1" && (kind === "practice" || kind === "transfer")) {
    const expected = kind === "practice" ? "7" : "8";
    const normalized = answer.trim().replace(/^`|`$/g, "").replace(/\s+/g, "");
    const correct = normalized === expected || normalized === `print(${expected})`;
    return {
      score: correct ? 100 : 0,
      correct,
      feedback: correct
        ? "The result is correct. Explain the evaluation order, then try a new expression without this example."
        : `Not quite. Predict the grouped expression again and write the intermediate operation before the final value.`,
    };
  }
  return {
    score: null,
    correct: null,
    feedback: "Your attempt is saved. This open response has not been automatically graded; use the mentor, a rubric, or a reviewer for feedback.",
  };
}

export function nextReviewInterval(previousIntervalDays: number, correct: boolean, helpLevel: HelpLevel): number {
  if (!correct || helpLevel === "worked_example" || helpLevel === "full_explanation") return 1;
  if (helpLevel === "guidance" || helpLevel === "concept_reminder") return Math.min(7, Math.max(2, previousIntervalDays + 1));
  return Math.min(30, Math.max(3, previousIntervalDays * 2));
}

export function deriveCompletion(recall: number | null, transfer: number | null, independence: number | null): string {
  if (recall === null && transfer === null) return "in_progress";
  if (recall !== null && recall >= 80 && transfer !== null && transfer >= 80 && independence !== null && independence >= 80) return "competent";
  return "developing";
}
