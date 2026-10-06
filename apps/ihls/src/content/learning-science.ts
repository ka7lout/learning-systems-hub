import type { EvidenceStrength } from "./types";

/**
 * Ismaili Harvard Learning Science (IHLS) configuration — §7–§36, §45–§52,
 * §84 (auditable evidence grading), §143–§152, §224 (research hypotheses).
 *
 * Every mechanism here carries an evidence label. Nothing is presented as
 * established science when it is a design decision (§51, §84).
 */

export interface LearningStateConfig {
  id: "deep" | "drift" | "fog" | "overload";
  humanLabel: string;
  description: string;
  adaptation: {
    taskSizeMinutes: number;
    explanationDensity: "full" | "medium" | "minimal";
    scaffolding: "fading" | "standard" | "heavy";
    simultaneousConcepts: number;
    exampleCount: number;
    difficultyShift: -2 | -1 | 0 | 1;
    transitionEveryMinutes: number;
  };
  guidance: string[];
}

/** §9, §145, §146 — four operational states. Never a diagnosis (§10, §61). */
export const LEARNING_STATES: LearningStateConfig[] = [
  {
    id: "deep",
    humanLabel: "I'm focused",
    description: "Attention is available and holding. This is the window for difficult derivations, new abstractions and long implementation work.",
    adaptation: { taskSizeMinutes: 50, explanationDensity: "medium", scaffolding: "fading", simultaneousConcepts: 3, exampleCount: 1, difficultyShift: 1, transitionEveryMinutes: 50 },
    guidance: [
      "Spend this window on the hardest thing on your list, not on review.",
      "Resist switching tasks — the cost of re-entry is the thing you are protecting.",
    ],
  },
  {
    id: "drift",
    humanLabel: "I'm drifting",
    description: "You are present but attention keeps leaving. Retrieval and implementation beat reading here, because they force engagement.",
    adaptation: { taskSizeMinutes: 20, explanationDensity: "medium", scaffolding: "standard", simultaneousConcepts: 2, exampleCount: 2, difficultyShift: 0, transitionEveryMinutes: 20 },
    guidance: [
      "Switch from input to output: write, code, or answer rather than read.",
      "Use a capture note for every distraction instead of following it (§13).",
    ],
  },
  {
    id: "fog",
    humanLabel: "Starting feels hard",
    description: "Initiation is the obstacle, not capability. Shrink the first action until it is almost trivial, then let momentum do the rest.",
    adaptation: { taskSizeMinutes: 10, explanationDensity: "minimal", scaffolding: "heavy", simultaneousConcepts: 1, exampleCount: 2, difficultyShift: -1, transitionEveryMinutes: 10 },
    guidance: [
      "Start with a two-minute concrete action — open the file, re-read one note, run one cell.",
      "Lower the standard for this session on purpose. Minimum viable learning still counts (§30).",
    ],
  },
  {
    id: "overload",
    humanLabel: "There is too much at once",
    description: "Working memory is saturated. Reduce the number of simultaneous ideas before reducing difficulty.",
    adaptation: { taskSizeMinutes: 15, explanationDensity: "full", scaffolding: "heavy", simultaneousConcepts: 1, exampleCount: 3, difficultyShift: -2, transitionEveryMinutes: 15 },
    guidance: [
      "One concept, one representation, one example. Park everything else in the later list.",
      "Externalise: write the pieces down so they stop competing for memory (§12).",
    ],
  },
];

/** §142 — help levels, stored per attempt so AI dependency is measurable (§26, §225). */
export const HELP_LEVELS = ["No Help", "Hint", "Guidance", "Concept Reminder", "Worked Example", "Full Explanation"] as const;
export type HelpLevel = (typeof HELP_LEVELS)[number];

/** §27 — error notebook taxonomy. */
export const ERROR_TYPES = [
  { id: "concept", label: "Concept Error", meaning: "The underlying idea was wrong or missing." },
  { id: "recall", label: "Recall Error", meaning: "You knew it but could not retrieve it." },
  { id: "selection", label: "Selection Error", meaning: "You chose the wrong method for the situation." },
  { id: "execution", label: "Execution Error", meaning: "Right method, wrong execution — arithmetic, syntax, slip." },
  { id: "transfer", label: "Transfer Error", meaning: "You could not apply it in a new context." },
  { id: "attention", label: "Attention Error", meaning: "You misread or skipped part of the problem." },
  { id: "load", label: "Load Error", meaning: "Too much at once; the failure was capacity, not knowledge." },
] as const;

/** §34, §35, §73 — mastery pyramid and thresholds. */
export const MASTERY_LEVELS = [
  { id: "unknown", label: "Not started", meaning: "No evidence yet." },
  { id: "exposed", label: "Content seen", meaning: "You have read or watched it. This is not mastery (§182)." },
  { id: "developing", label: "Developing", meaning: "Correct with support, or correct but slow and uncertain." },
  { id: "competent", label: "Competent", meaning: "Correct without help on standard cases, and able to explain why." },
  { id: "independent", label: "Independently demonstrated", meaning: "Correct on unfamiliar cases and transfer tasks, with evidence attached." },
] as const;

export type MasteryLevelId = (typeof MASTERY_LEVELS)[number]["id"];

/** §218 — progress is three separate things, never one percentage. */
export const PROGRESS_DIMENSIONS = [
  "Content seen",
  "Practice completed",
  "Recall performance",
  "Transfer performance",
  "Implementation evidence",
  "Debugging evidence",
  "Project evidence",
  "Delayed retention",
] as const;

/** §20, §148 — spacing configuration. Interval shape is evidence-informed, parameters are a design decision. */
export const SPACING = {
  baseIntervalsDays: [1, 3, 7, 16, 35, 70],
  minEase: 1.3,
  maxEase: 2.8,
  startEase: 2.3,
  /** Importance and failure rate modulate the interval (§148). */
  importanceMultiplier: { CORE: 0.85, SUPPORT: 1.0, ADVANCED: 1.0, SPECIALIZATION: 1.1, INDUSTRY_EXTENSION: 1.1, RESEARCH: 1.2 } as Record<string, number>,
  evidence: "moderate" as EvidenceStrength,
  evidenceNote:
    "Distributed practice is strongly supported (Cepeda et al. 2006; Dunlosky et al. 2013). The specific interval sequence and ease parameters here are a design decision, not a finding.",
};

/** §84 — every mechanism labelled by evidence strength. */
export const MECHANISM_EVIDENCE: { mechanism: string; strength: EvidenceStrength; note: string }[] = [
  { mechanism: "Retrieval practice (testing effect)", strength: "strong", note: "High-utility in Dunlosky et al. 2013; central to the mastery engine rather than an add-on." },
  { mechanism: "Distributed practice (spacing)", strength: "strong", note: "High-utility; drives the review queue." },
  { mechanism: "Worked examples with fading support", strength: "strong", note: "Well supported for novices in technical domains; implemented as help levels." },
  { mechanism: "Interleaving", strength: "moderate", note: "Benefits are task-dependent; applied to related-but-confusable material only." },
  { mechanism: "Elaborative interrogation / self-explanation", strength: "moderate", note: "Implemented as 'explain why' and 'explain in own words' task types." },
  { mechanism: "Transfer training through varied context", strength: "moderate", note: "Transfer is hard to produce; measured separately rather than assumed." },
  { mechanism: "Case method for decision-making", strength: "moderate", note: "Long professional-education track record; evidence is weaker than for retrieval." },
  { mechanism: "Learning styles (visual/auditory/kinaesthetic matching)", strength: "speculative", note: "Not used. §32 forbids it; the evidence does not support matching instruction to a style." },
  { mechanism: "State-adaptive task sizing", strength: "emerging", note: "A design decision informed by cognitive load theory. Treated as a hypothesis to be tested (§224), not a finding." },
  { mechanism: "Learning Yield metric", strength: "emerging", note: "An internal construct of this system. It is not a validated psychometric measure." },
];

/** §60, §224 — the hypotheses this system is designed to be able to test. */
export const RESEARCH_HYPOTHESES = [
  { id: "H1", statement: "Retrieval-heavy sessions produce better delayed retention than reading-heavy sessions of equal duration.", measurable: true },
  { id: "H2", statement: "Transfer performance improves when practice varies context rather than repeating the original context.", measurable: true },
  { id: "H3", statement: "Self-reported learning state predicts error type distribution within a session.", measurable: true },
  { id: "H4", statement: "Lower AI help levels during first attempts correlate with better delayed independent performance.", measurable: true },
  { id: "H5", statement: "Project-linked practice produces more durable skill evidence than isolated exercises.", measurable: true },
  { id: "H6", statement: "Oral explanation reveals knowledge gaps that written answers conceal.", measurable: true },
];

/** §144 — defaults applied when a lesson does not override them. */
export const DEFAULT_NOTEBOOK_MUST_WRITE = [
  "the concept in your own words",
  "the formula / rule / algorithm, if essential",
  "the meaning of each variable or symbol",
  "one worked example or structure",
  "one common mistake",
  "one 'why' statement",
  "when to use this concept",
];

/** §29 — Learning Yield inputs. Computed only from real recorded events (§217). */
export const LEARNING_YIELD_INPUTS = [
  "successful unaided retrievals",
  "transfer tasks passed",
  "implementation evidence produced",
  "errors converted into corrected understanding",
  "delayed retention checks passed",
];
