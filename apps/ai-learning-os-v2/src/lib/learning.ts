// Pure IHLS logic: scheduling, mastery, state adaptation. No I/O — unit-testable.

export type StudyState = "deep" | "drift" | "fog" | "overload";
export type HelpLevel = "none" | "hint" | "guidance" | "reminder" | "worked_example" | "full_explanation";
export const HELP_LEVELS: HelpLevel[] = ["none", "hint", "guidance", "reminder", "worked_example", "full_explanation"];
export const ERROR_TYPES = ["concept", "recall", "selection", "execution", "transfer", "attention", "load"] as const;
export type ErrorType = (typeof ERROR_TYPES)[number];

export const ERROR_LABELS: Record<ErrorType, string> = {
  concept: "Concept — the idea itself isn't clear yet",
  recall: "Recall — I knew it but couldn't retrieve it",
  selection: "Selection — I picked the wrong tool/method",
  execution: "Execution — right plan, wrong steps",
  transfer: "Transfer — fine on the example, failed on the new case",
  attention: "Attention — I lost focus",
  load: "Load — too much at once",
};

export const STATE_COPY: Record<StudyState, { label: string; plan: string; taskStages: string[]; maxConcepts: number }> = {
  deep: { label: "I'm focused", plan: "Good time for the transfer or case task. Keep going while answers stay sharp; no fixed timer.", taskStages: ["transfer", "case", "application", "recall"], maxConcepts: 4 },
  drift: { label: "I'm drifting", plan: "One concept, one question, one attempt, feedback — then decide. Park stray thoughts in Later.", taskStages: ["application", "recall"], maxConcepts: 1 },
  fog: { label: "Starting feels hard", plan: "Start with an easy recall of something you already know. Then a short example. Difficulty rises only after a small win.", taskStages: ["recall", "application"], maxConcepts: 1 },
  overload: { label: "There is too much at once", plan: "Fewer items, more worked steps. Read the model structure first, then attempt a smaller piece.", taskStages: ["recall"], maxConcepts: 1 },
};

/** Spacing: grows interval on success, shrinks on failure; harder items and weaker transfer grow slower. */
export function nextReview(prev: { intervalDays: number; reps: number; lapses: number } | null, score: number, opts: { transfer?: boolean } = {}) {
  const p = prev ?? { intervalDays: 0, reps: 0, lapses: 0 };
  if (score < 0.6) {
    return { intervalDays: 1, reps: 0, lapses: p.lapses + 1 };
  }
  const base = p.reps === 0 ? 1 : p.reps === 1 ? 3 : p.intervalDays * (score >= 0.85 ? 2.3 : 1.6);
  const lapsePenalty = Math.max(0.5, 1 - p.lapses * 0.12);
  const transferBonus = opts.transfer && score >= 0.8 ? 1.2 : 1;
  const intervalDays = Math.min(90, Math.max(1, Math.round(base * lapsePenalty * transferBonus * 10) / 10));
  return { intervalDays, reps: p.reps + 1, lapses: p.lapses };
}

export type MasteryInput = { recall: number; application: number; transfer: number; independentCount: number; contentSeen: boolean; delayedPass: boolean; projectEvidence: boolean };

/** L0–L9 mastery pyramid derived only from evidence. */
export function masteryLevel(m: MasteryInput): number {
  let l = 0;
  if (m.contentSeen) l = 1;
  if (m.recall >= 0.5) l = 2;
  if (m.recall >= 0.7) l = 3;
  if (m.application >= 0.7) l = 4;
  if (m.application >= 0.7 && m.recall >= 0.8) l = 5;
  if (m.transfer >= 0.7 && m.independentCount >= 1) l = 6;
  if (l >= 6 && m.delayedPass) l = 7;
  if (l >= 7 && m.projectEvidence) l = 8;
  return l;
}
export const LEVEL_LABELS = ["Not met yet", "Recognize", "Recall", "Explain", "Use", "Choose when to use", "Solve new problems", "Integrate (retained over time)", "Build with it", "Teach it"];

export function competenceBand(level: number): "developing" | "competent" | "independently demonstrated" | "not started" {
  if (level === 0) return "not started";
  if (level < 4) return "developing";
  if (level < 6) return "competent";
  return "independently demonstrated";
}

/** Exponential moving update so recent evidence weighs more, independent work weighs more than assisted. */
export function updateDimension(prev: number, score: number, help: HelpLevel) {
  const weight = help === "none" ? 0.6 : help === "hint" ? 0.4 : 0.2;
  const capped = help === "none" ? score : Math.min(score, help === "hint" ? 0.85 : 0.6);
  return Math.round((prev * (1 - weight) + capped * weight) * 1000) / 1000;
}

/** Break/mode-change recommendation driven by performance signals, never a fixed timer. */
export function sessionAdvice(recentScores: number[], state: StudyState): string | null {
  if (recentScores.length < 3) return null;
  const last3 = recentScores.slice(-3);
  const avg = last3.reduce((a, b) => a + b, 0) / 3;
  const declining = last3[0] > last3[1] && last3[1] > last3[2];
  if (avg < 0.4) return "Your last few answers point to a missing prerequisite rather than effort. Step back to the prerequisite unit, then return.";
  if (declining && state === "deep") return "Answer quality is dropping. A short movement break or switching task type could help — then come back to the same problem.";
  if (avg >= 0.85 && state !== "deep") return "You're doing well. If it feels right, try the transfer task.";
  return null;
}

export function scoreFromKeyPoints(total: number, covered: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, covered / total));
}

export const CV_TIERS = ["Practice Only", "Skill Evidence", "Technical Artifact", "Portfolio Project", "Professional Evidence", "Signature Project"] as const;
export function cvEligible(tier: string, url: string | null | undefined) {
  const idx = CV_TIERS.indexOf(tier as (typeof CV_TIERS)[number]);
  return idx >= 3 && !!url;
}

/** Reassurance guardrail: repeated checking without new evidence. */
export function shouldLimitReassurance(recentChecks: { response: string }[], current: string) {
  const same = recentChecks.filter((c) => c.response.trim() === current.trim()).length;
  return same >= 2;
}
