/**
 * Canonical content types for the Ismaili Harvard AI Engineering Learning OS.
 *
 * Spec references: §126 (source status model), §127 (curriculum source labels),
 * §128 (curriculum graph), §40 (importance classification), §144 (notebook guidance).
 */

export type SourceCategory =
  | "Original Curriculum"
  | "Harvard College"
  | "Harvard Extension"
  | "Industry Extension"
  | "Research Extension";

export type Importance =
  | "CORE"
  | "SUPPORT"
  | "ADVANCED"
  | "SPECIALIZATION"
  | "INDUSTRY_EXTENSION"
  | "RESEARCH";

/** §126 — never collapse these statuses. */
export type VerificationStatus =
  | "confirmed_current"
  | "confirmed_historical"
  | "likely_not_verified"
  | "not_found"
  | "design_decision"
  | "research_hypothesis";

export type EvidenceStrength = "strong" | "moderate" | "emerging" | "speculative";

export interface SourceRecord {
  sourceId: string;
  url: string;
  title: string;
  author?: string;
  publisher: string;
  sourceType: "official_catalog" | "syllabus" | "program_page" | "vendor_docs" | "standard" | "research" | "job_posting" | "industry_report";
  license?: string;
  publishedAt?: string;
  accessedAt: string;
  verificationStatus: VerificationStatus;
  notes?: string;
  /** Short factual extract actually read from the page at accessedAt. */
  extract?: string[];
}

export interface Stage {
  id: string;
  order: number;
  title: string;
  summary: string;
  spineIndex: number;
}

export interface Course {
  id: string;
  stageId: string;
  title: string;
  sourceCategory: SourceCategory;
  secondarySourceCategories?: SourceCategory[];
  importance: Importance;
  summary: string;
  originalSessionCount?: number;
  /** Harvard mapping ids (see harvard.ts) — mapping only, never a claim of equivalence. */
  harvardMappings?: string[];
  sources?: string[];
  note?: string;
}

export type BlockKind =
  | "why"
  | "concept"
  | "mental_model"
  | "math"
  | "worked_example"
  | "code"
  | "pitfall"
  | "transfer"
  | "case"
  | "checkpoint"
  | "engineering_note";

export interface LearningBlock {
  id: string;
  kind: BlockKind;
  title: string;
  body: string;
  lang?: "python" | "sql" | "bash" | "text" | "ts";
}

export interface NotebookGuidance {
  mustWrite: string[];
  recommended: string[];
  optional: string[];
}

export interface Lesson {
  id: string;
  type: "lesson";
  courseId: string;
  stageId: string;
  title: string;
  /** Original session number inside the original module, when applicable. */
  originalSession?: number;
  sourceCategory: SourceCategory;
  secondarySourceCategories?: SourceCategory[];
  importance: Importance;
  level: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[];
  corequisites: string[];
  /** Verbatim topic list preserved from the original curriculum where applicable (§37). */
  topics: string[];
  learningObjectives: string[];
  skills: string[];
  estimatedEffortMinutes: number;
  masteryCriteria: string[];
  projects: string[];
  careerRoles: string[];
  sources: string[];
  notebook: NotebookGuidance;
  blocks: LearningBlock[];
  /** Truthful content state — never pretend an unauthored lesson is authored (§216, §217). */
  contentStatus: "authored" | "outline_only";
  harvardMappings?: string[];
  version: string;
  lastVerified: string;
}

/** §143 — active mastery task types. Multiple choice is a small component only. */
export type AssessmentType =
  | "free_recall"
  | "explain_own_words"
  | "explain_why"
  | "predict_output"
  | "code_reading"
  | "code_completion"
  | "debugging"
  | "algorithm_trace"
  | "complexity_analysis"
  | "compare_approaches"
  | "choose_method"
  | "derivation"
  | "calculation"
  | "diagnose_failure"
  | "transfer"
  | "case_decision"
  | "oral_explanation"
  | "design_review"
  | "project_checkpoint"
  | "timed_challenge"
  | "interview_simulation"
  | "incident_response"
  | "research_critique"
  | "multiple_choice";

export type EvaluationMode = "auto" | "mentor" | "self";

export interface AssessmentItem {
  id: string;
  lessonId: string;
  skillIds: string[];
  type: AssessmentType;
  /** recall → application → transfer (§149). */
  tier: "recall" | "application" | "transfer";
  prompt: string;
  context?: string;
  /** Deterministic checking is only claimed where it is actually possible. */
  evaluation: EvaluationMode;
  expectedPoints: string[];
  rubric: string[];
  choices?: string[];
  correctChoiceIndex?: number;
  numericAnswer?: number;
  numericTolerance?: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
}

export interface Skill {
  id: string;
  title: string;
  family: string;
  description: string;
  dependsOn: string[];
  roles: string[];
  interviewQuestions: string[];
  englishTerms: string[];
}

export interface ProjectSpec {
  id: string;
  title: string;
  ladderLevel: number;
  ladderTrack: string;
  sourceCategory: SourceCategory;
  problem: string;
  /** §172 — real public data only; never invent a dataset that does not exist. */
  dataPolicy: {
    recommendedSources: { name: string; url: string; verificationStatus: VerificationStatus }[];
    mustRecord: string[];
    syntheticAllowed: boolean;
  };
  requirements: string[];
  acceptanceCriteria: string[];
  milestones: { id: string; title: string; definitionOfDone: string[] }[];
  skills: string[];
  careerRoles: string[];
  evidenceExpected: string[];
  cvClass: "Practice Only" | "Skill Evidence" | "Technical Artifact" | "Portfolio Project" | "Professional Evidence" | "Signature Project";
}

export interface RoleRequirement {
  id: string;
  label: string;
  kind: "hard" | "preferred";
  skillIds: string[];
  sourceStatus: VerificationStatus;
}

export interface CareerRole {
  id: string;
  title: string;
  referenceEmployer: string;
  referenceUrl?: string;
  verificationStatus: VerificationStatus;
  locationNote: string;
  seniorityNote: string;
  requirements: RoleRequirement[];
  disclaimer: string;
}

export interface EnglishTerm {
  term: string;
  domain: string;
  b1b2: string;
  arabic: string;
  example: string;
  ipa?: string;
}

export interface HarvardMapping {
  id: string;
  identifier: string;
  title: string;
  offeringBody: "Harvard College" | "Harvard SEAS" | "Harvard Extension";
  verificationStatus: VerificationStatus;
  sourceId: string;
  /** Exactly what the source says — no paraphrase that adds claims. */
  evidence: string;
  /** Which parts of this curriculum it informs. Mapping, not equivalence. */
  mapsToCourses: string[];
  tags?: string[];
  lastVerified: string;
}

export interface CurriculumGraph {
  stages: Stage[];
  courses: Course[];
  lessons: Lesson[];
  assessments: AssessmentItem[];
  skills: Skill[];
  projects: ProjectSpec[];
  roles: CareerRole[];
  englishTerms: EnglishTerm[];
  sources: SourceRecord[];
  harvardMappings: HarvardMapping[];
}
