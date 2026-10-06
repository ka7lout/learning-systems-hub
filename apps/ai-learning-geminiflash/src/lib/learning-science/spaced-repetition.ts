export interface ReviewCalculationInput {
  grade: number; // 0 to 5 (0: complete blackout, 3: correct with difficulty, 5: flawless instant recall)
  repetitions: number;
  previousInterval: number;
  previousEaseFactor: number;
  failureCount: number;
  transferScore?: number; // 0 to 10
}

export interface ReviewCalculationOutput {
  nextReviewDate: Date;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  failureCount: number;
}

/**
 * Enhanced SuperMemo-2 Spaced Repetition Algorithm
 * Factors in transfer performance, failure count, and response calibration.
 */
export function calculateNextReview(input: ReviewCalculationInput): ReviewCalculationOutput {
  const {
    grade,
    repetitions,
    previousInterval,
    previousEaseFactor,
    failureCount,
    transferScore = 7
  } = input;

  let newRepetitions = repetitions;
  let newInterval = 1;
  let newEaseFactor = previousEaseFactor;
  let newFailureCount = failureCount;

  // Update ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  newEaseFactor = previousEaseFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  
  // Bound ease factor between 1.3 (hardest) and 2.8 (easiest)
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;
  if (newEaseFactor > 2.8) newEaseFactor = 2.8;

  if (grade < 3) {
    // Failure / lapsed memory
    newRepetitions = 0;
    newInterval = 1;
    newFailureCount += 1;
  } else {
    // Successful recall
    newRepetitions += 1;
    
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 4;
    } else {
      // Modulate interval with transfer score modifier
      const transferMultiplier = transferScore >= 8 ? 1.15 : transferScore <= 4 ? 0.85 : 1.0;
      newInterval = Math.round(previousInterval * newEaseFactor * transferMultiplier);
    }
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    nextReviewDate: nextDate,
    intervalDays: newInterval,
    repetitions: newRepetitions,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    failureCount: newFailureCount
  };
}
