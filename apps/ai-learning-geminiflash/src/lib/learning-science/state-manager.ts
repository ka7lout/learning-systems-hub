export type LearningState = "deep" | "drift" | "fog" | "overload";

export interface StateAdaptationConfig {
  state: LearningState;
  displayName: string;
  humanCue: string;
  taskChunkSize: "atomic" | "moderate" | "extended";
  explanationDensity: "minimal_socratic" | "step_by_step" | "high_scaffolding" | "maximum_worked_examples";
  suggestedSessionDurationMinutes: number;
  antiFatigueIntervention: boolean;
  recommendedActivity: string;
  uiTone: string;
}

export const STATE_CONFIGS: Record<LearningState, StateAdaptationConfig> = {
  deep: {
    state: "deep",
    displayName: "Deep Focus",
    humanCue: "I'm focused and ready for challenge",
    taskChunkSize: "extended",
    explanationDensity: "minimal_socratic",
    suggestedSessionDurationMinutes: 60,
    antiFatigueIntervention: false,
    recommendedActivity: "End-to-end implementation, mathematical derivations, and open-ended case studies.",
    uiTone: "Streamlined, high-autonomy, deep technical depth."
  },
  drift: {
    state: "drift",
    displayName: "Drifting / Scattered",
    humanCue: "My focus is slipping",
    taskChunkSize: "atomic",
    explanationDensity: "step_by_step",
    suggestedSessionDurationMinutes: 20,
    antiFatigueIntervention: true,
    recommendedActivity: "Single-concept micro-drills, quick code completions, and immediate verification loops.",
    uiTone: "Segmented, single-focus cards, rapid feedback."
  },
  fog: {
    state: "fog",
    displayName: "Low Initiation Energy (Fog)",
    humanCue: "Starting feels hard / Brain sluggish",
    taskChunkSize: "atomic",
    explanationDensity: "high_scaffolding",
    suggestedSessionDurationMinutes: 15,
    antiFatigueIntervention: true,
    recommendedActivity: "Frictionless review of a known concept, short recall question, progressive difficulty ramp.",
    uiTone: "Low cognitive friction, gentle ramp-up, worked examples with fading support."
  },
  overload: {
    state: "overload",
    displayName: "High Cognitive Overload",
    humanCue: "Too much complexity at once",
    taskChunkSize: "atomic",
    explanationDensity: "maximum_worked_examples",
    suggestedSessionDurationMinutes: 15,
    antiFatigueIntervention: true,
    recommendedActivity: "Fully worked-out step-by-step example, isolate one sub-variable, eliminate simultaneous noise.",
    uiTone: "Maximized scaffolding, visual breakdown, zero unnecessary text."
  }
};

export function getStateAdaptation(state: LearningState): StateAdaptationConfig {
  return STATE_CONFIGS[state] || STATE_CONFIGS.deep;
}

export function recommendNextStepForState(
  state: LearningState,
  blockType: string
): { instruction: string; pacingAdvice: string } {
  switch (state) {
    case "fog":
      return {
        instruction: "Let's start with a gentle, 2-minute recall from the previous step before looking at new code.",
        pacingAdvice: "No pressure to solve the full problem at once. Just identify the first input parameter."
      };
    case "drift":
      return {
        instruction: "Focus on this single sub-task only. Once you verify this output, we'll immediately take a quick 2-minute stretch.",
        pacingAdvice: "One concept -> One attempt -> Instant feedback."
      };
    case "overload":
      return {
        instruction: "Let's isolate just one component. Look at the worked example on the left first.",
        pacingAdvice: "We have temporarily hidden secondary parameters to let your working memory focus on the core formula."
      };
    case "deep":
    default:
      return {
        instruction: "Deep focus active. Work through the full implementation and attempt the transfer challenge.",
        pacingAdvice: "Take as much continuous time as needed. The system will not interrupt while your performance remains high."
      };
  }
}
