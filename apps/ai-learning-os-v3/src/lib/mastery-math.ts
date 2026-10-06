/**
 * Pure scoring and scheduling functions. No server-only imports, so they can be
 * unit-tested directly outside the Next.js runtime.
 */

const OUTCOME_SCORE: Record<string, number> = { missed: 0, partial: 0.55, solid: 1 };

const HELP_PENALTY: Record<string, number> = {
  none: 1,
  hint: 0.9,
  guidance: 0.75,
  concept_reminder: 0.7,
  worked_example: 0.5,
  full_explanation: 0.3,
};

export function outcomeScore(outcome: string): number {
  return OUTCOME_SCORE[outcome] ?? 0;
}

export function attemptScore(outcome: string, helpLevel: string): number {
  return outcomeScore(outcome) * (HELP_PENALTY[helpLevel] ?? 1);
}

/**
 * The mastery ladder (L0..L9). Levels above L5 require transfer evidence,
 * L8 requires project evidence and L9 requires delayed retention.
 */
export function masteryLevel(r: {
  recall: number;
  application: number;
  transfer: number;
  independence: number;
  evidenceCount: number;
  delayedPerformance: number;
  projectEvidence: number;
}): number {
  if (r.evidenceCount === 0) return 0;
  let level = 1;
  if (r.recall >= 0.5) level = 2;
  if (r.recall >= 0.7) level = 3;
  if (r.application >= 0.6) level = 4;
  if (r.application >= 0.75 && r.evidenceCount >= 3) level = 5;
  if (r.transfer >= 0.6) level = 6;
  if (r.transfer >= 0.75 && r.independence >= 0.7) level = 7;
  if (r.projectEvidence > 0 && r.transfer >= 0.7 && r.independence >= 0.7) level = 8;
  if (level >= 8 && r.delayedPerformance >= 0.75) level = 9;
  return level;
}

export const MASTERY_LABELS = [
  "Not encountered",
  "Recognises it",
  "Can recall it",
  "Can explain it",
  "Can use it",
  "Knows when to use it",
  "Solves new problems with it",
  "Integrates it with other concepts",
  "Has built something with it",
  "Could teach it",
];

/**
 * Spacing intervals adapt to difficulty, failure history, importance and the
 * last result — not a fixed 1/3/7/14/30 ladder.
 */
export function nextInterval(
  prev: number,
  ease: number,
  lapses: number,
  result: string,
  importance: number,
): { interval: number; ease: number; lapses: number } {
  if (result === "missed") {
    return { interval: Math.max(0.5, prev * 0.3), ease: Math.max(1.4, ease - 0.25), lapses: lapses + 1 };
  }
  if (result === "partial") {
    return { interval: Math.max(1, prev * 1.25), ease: Math.max(1.5, ease - 0.05), lapses };
  }
  const grown = prev <= 1 ? 2 : prev * ease;
  const importanceFactor = importance >= 1.5 ? 0.8 : 1;
  return { interval: Math.min(120, grown * importanceFactor), ease: Math.min(3.1, ease + 0.08), lapses };
}

export function ema(prev: number, next: number, n: number): number {
  return n <= 1 ? next : prev + (next - prev) * Math.max(0.25, 1 / Math.min(n, 6));
}
