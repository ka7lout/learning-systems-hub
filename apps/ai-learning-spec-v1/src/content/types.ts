export type SourceCategory =
  | "Original Curriculum"
  | "Harvard College"
  | "Harvard Extension"
  | "Industry Extension"
  | "Research Extension";

export type VerificationStatus =
  | "confirmed_current"
  | "confirmed_historical"
  | "likely_not_verified"
  | "not_found"
  | "design_decision"
  | "research_hypothesis";

export type CourseLevel =
  | "CORE"
  | "SUPPORT"
  | "ADVANCED"
  | "SPECIALIZATION"
  | "INDUSTRY"
  | "RESEARCH";

export type CourseSpec = {
  key: string;
  trackKey: string;
  title: string;
  sourceCategory: SourceCategory;
  level: CourseLevel;
  summary: string;
  learningObjectives: string[];
  masteryCriteria: string[];
  estimatedHours: number;
  weeklyWorkload: string;
  learningMode: string;
  sourceRefs: string[];
  verificationStatus: VerificationStatus;
  prerequisites?: string[];
  corequisites?: string[];
};

export type LessonBlock = {
  kind: "concept" | "worked_example" | "code" | "caution" | "case" | "math" | "checklist";
  title: string;
  body: string;
  b1b2?: string;
  arabic?: string;
};

export type LessonSpec = {
  key: string;
  courseKey: string;
  title: string;
  why: string;
  objectives: string[];
  topics: string[];
  blocks: LessonBlock[];
  notebook: { mustWrite: string[]; recommended: string[]; optional: string[] };
  skillKeys: string[];
  sourceCategory: SourceCategory;
  sourceRefs?: string[];
  estimatedMinutes?: number;
};
