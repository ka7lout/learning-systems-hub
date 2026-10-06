// Spaced-review scheduling engine — an adapted SM-2 variant.
// Design decision (labeled as such, spec §126): intervals adapt to grade,
// lapses, and ease; spacing is never a sacred fixed table (spec §20).

export interface ReviewState {
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
}

export interface ReviewOutcome extends ReviewState {
  dueAt: Date;
  lastGrade: number;
}

/**
 * grade: 0–5 honest self-assessment after an active retrieval attempt.
 * 0–2 = failed recall (lapse) · 3 = hard · 4 = good · 5 = easy.
 */
export function scheduleNext(state: ReviewState, grade: number, now = new Date()): ReviewOutcome {
  const g = Math.max(0, Math.min(5, Math.round(grade)));
  let { intervalDays, ease, reps, lapses } = state;

  if (g < 3) {
    lapses += 1;
    reps = 0;
    intervalDays = 1; // relearn tomorrow
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    ease = Math.max(1.3, Math.min(2.8, ease + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02))));
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 3;
    else intervalDays = Math.min(60, Math.round(intervalDays * ease * 10) / 10);
    if (g === 3) intervalDays = Math.max(1, Math.round(intervalDays * 0.8 * 10) / 10);
  }

  const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return { intervalDays, ease, reps, lapses, dueAt, lastGrade: g };
}

export const GRADE_LABELS: { grade: number; label: string; hint: string }[] = [
  { grade: 0, label: "Blank", hint: "Could not retrieve anything" },
  { grade: 2, label: "Failed", hint: "Retrieved fragments, mostly wrong" },
  { grade: 3, label: "Hard", hint: "Correct, but slow and effortful" },
  { grade: 4, label: "Good", hint: "Correct with minor hesitation" },
  { grade: 5, label: "Easy", hint: "Instant and confident" },
];
