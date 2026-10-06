// Canonical content model types for the Ismaili Harvard AI Engineering Learning OS.
// This is the structured content/data model the application consumes (spec §124+).
// Content here is version-controlled and treated as the curriculum source of truth;
// all learner state lives in PostgreSQL.

export type SourceCategory =
  | "original" // Original Curriculum — preserved verbatim, never deleted
  | "harvard_college"
  | "harvard_extension"
  | "industry" // Industry / Practical Extension
  | "research"; // Research Extension

export type VerificationStatus =
  | "confirmed_current"
  | "confirmed_historical"
  | "likely_not_verified"
  | "not_found"
  | "design_decision"
  | "research_hypothesis";

export type TopicPriority =
  | "core"
  | "support"
  | "advanced"
  | "specialization"
  | "industry_extension"
  | "research";

export interface HarvardMapping {
  /** Candidate Harvard course identifier or program, e.g. "CS50", "STAT 110". */
  course: string;
  layer: "harvard_college" | "harvard_extension";
  /** Honest status. Course numbers/titles change; nothing here claims enrollment or equivalence. */
  status: VerificationStatus;
  officialUrl?: string;
  note: string;
}

export interface Topic {
  slug: string;
  name: string;
  priority: TopicPriority;
}

export interface NotebookGuidance {
  mustWrite: string[];
  recommended: string[];
  optional: string[];
}

export interface TransferTask {
  title: string;
  prompt: string;
}

export interface Lesson {
  slug: string;
  title: string;
  moduleSlug: string;
  order: number;
  why: string; // "WHY" before the concept (spec §33)
  objectives: string[];
  topics: Topic[];
  notebook: NotebookGuidance;
  /** Extra retrieval prompts beyond the auto-generated per-topic ones. */
  extraRetrieval?: string[];
  transfer: TransferTask;
  caseStudy?: TransferTask;
  /** Skill slugs this lesson develops (links into the skill graph). */
  skills: string[];
}

export interface Module {
  slug: string;
  title: string;
  order: number;
  sourceCategory: SourceCategory;
  sessions: number;
  summary: string;
  /** Module slugs that should normally be studied before this one (prerequisite DAG). */
  prerequisites: string[];
  /** Modules that can run in parallel with this one. */
  parallelWith?: string[];
  harvardMappings: HarvardMapping[];
  lessons: Lesson[];
  sessionNote?: string; // preserves session-count mismatches truthfully (spec: resolve mapping, never delete)
}

export type ProjectLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ProjectSpec {
  slug: string;
  title: string;
  level: ProjectLevel;
  levelName: string;
  sourceCategory: SourceCategory;
  summary: string;
  dataPolicy: string; // real public data requirement / provenance expectations
  definitionOfDone: string[];
  skills: string[];
  cvClass:
    | "practice_only"
    | "skill_evidence"
    | "technical_artifact"
    | "portfolio_project"
    | "professional_evidence"
    | "signature_project";
}

export interface Skill {
  slug: string;
  name: string;
  area:
    | "programming"
    | "mathematics"
    | "data"
    | "machine_learning"
    | "deep_learning"
    | "llm"
    | "engineering"
    | "cloud_mlops"
    | "communication"
    | "research";
}

export interface RoleRequirement {
  skillSlug: string;
  kind: "hard" | "preferred" | "familiarity";
  note?: string;
}

export interface TargetRole {
  slug: string;
  title: string;
  blueprint: string; // where this blueprint came from (student-supplied, dated)
  status: VerificationStatus;
  sourceUrl?: string;
  summary: string;
  requirements: RoleRequirement[];
}

/** Mastery levels L0–L9 (spec §34). */
export const MASTERY_LEVELS: { level: number; label: string }[] = [
  { level: 0, label: "Not yet encountered" },
  { level: 1, label: "I recognize it" },
  { level: 2, label: "I can recall it" },
  { level: 3, label: "I can explain it" },
  { level: 4, label: "I can use it" },
  { level: 5, label: "I can choose when to use it" },
  { level: 6, label: "I can solve a new problem with it" },
  { level: 7, label: "I can combine it with other concepts" },
  { level: 8, label: "I can build something with it" },
  { level: 9, label: "I can teach it" },
];

export type LearningState = "deep" | "drift" | "fog" | "overload";

export const LEARNING_STATES: Record<
  LearningState,
  { label: string; prompt: string; guidance: string }
> = {
  deep: {
    label: "I'm focused",
    prompt: "Focus is stable and energy is good.",
    guidance:
      "Longer study unit allowed. Keep going while answer quality stays high — no mechanical timer cutoffs. Take on the transfer task and the case after the core practice.",
  },
  drift: {
    label: "I'm drifting",
    prompt: "Attention is starting to slip.",
    guidance:
      "Shrink the unit: one concept → one question → one attempt → feedback → next. Capture distractions in Later instead of fighting them. Short, fast feedback loops.",
  },
  fog: {
    label: "Starting feels hard",
    prompt: "Low energy or hard to begin (no medical diagnosis implied).",
    guidance:
      "Start with the lowest-friction task: one easy recall from something you already know, then a short example, then one small attempt. Ramp difficulty only after momentum returns.",
  },
  overload: {
    label: "There is too much at once",
    prompt: "Cognitive load feels too high.",
    guidance:
      "Reduce simultaneous elements. Work from the worked example first, cover one topic only, and defer the transfer task. Smaller steps, more scaffolding, fewer open tabs.",
  },
};
