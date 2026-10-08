import { 
  boolean,
  index,
  integer,
  jsonb,
  pgTableCreator,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
 } from "drizzle-orm/pg-core";

export const pgTable = pgTableCreator((name) => "ai_learning_os_v3_" + name);

/* ------------------------------------------------------------------ */
/* Identity, sessions, authorization                                   */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("student"),
    settings: jsonb("settings")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    token: text("token").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Verified sources                                                    */
/* ------------------------------------------------------------------ */

export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  sourceType: text("source_type").notNull(),
  license: text("license"),
  publishedAt: text("published_at"),
  accessedAt: text("accessed_at").notNull(),
  /** confirmed_current | confirmed_historical | likely_not_verified | not_found | design_decision | research_hypothesis */
  verificationStatus: text("verification_status").notNull(),
  notes: text("notes"),
});

/* ------------------------------------------------------------------ */
/* Curriculum graph                                                    */
/* ------------------------------------------------------------------ */

export const stages = pgTable("stages", {
  id: text("id").primaryKey(),
  position: integer("position").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
});

export const courses = pgTable(
  "courses",
  {
    id: text("id").primaryKey(),
    stageId: text("stage_id")
      .notNull()
      .references(() => stages.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    /** Original Curriculum | Harvard College | Harvard Extension | Industry Extension | Research Extension */
    sourceCategory: text("source_category").notNull(),
    level: text("level").notNull(),
    priority: text("priority").notNull(), // CORE | SUPPORT | ADVANCED | SPECIALIZATION | INDUSTRY | RESEARCH
    why: text("why").notNull(),
    summary: text("summary").notNull(),
    estimatedHours: integer("estimated_hours").notNull(),
    prerequisites: jsonb("prerequisites").$type<string[]>().notNull().default([]),
    topics: jsonb("topics").$type<string[]>().notNull().default([]),
    objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
    masteryCriteria: jsonb("mastery_criteria").$type<string[]>().notNull().default([]),
    skills: jsonb("skills").$type<string[]>().notNull().default([]),
    harvardMapping: jsonb("harvard_mapping")
      .$type<
        {
          candidate: string;
          institution: string;
          verification: string;
          adds: string;
          note?: string;
        }[]
      >()
      .notNull()
      .default([]),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull().default([]),
    version: integer("version").notNull().default(1),
    lastVerified: text("last_verified").notNull(),
  },
  (t) => [index("courses_stage_idx").on(t.stageId)],
);

export type LessonBlock =
  | { kind: "prose"; title?: string; body: string }
  | { kind: "math"; title?: string; body: string }
  | { kind: "code"; title?: string; language: string; body: string }
  | { kind: "worked"; title: string; body: string }
  | { kind: "pitfall"; title: string; body: string }
  | { kind: "case"; title: string; body: string };

export const lessons = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    why: text("why").notNull(),
    objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
    blocks: jsonb("blocks").$type<LessonBlock[]>().notNull().default([]),
    notebook: jsonb("notebook")
      .$type<{ must: string[]; recommended: string[]; optional: string[] }>()
      .notNull()
      .default({ must: [], recommended: [], optional: [] }),
    concepts: jsonb("concepts").$type<string[]>().notNull().default([]),
    skills: jsonb("skills").$type<string[]>().notNull().default([]),
    sourceCategory: text("source_category").notNull(),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull().default([]),
    estimatedMinutes: integer("estimated_minutes").notNull().default(45),
    version: integer("version").notNull().default(1),
  },
  (t) => [index("lessons_course_idx").on(t.courseId)],
);

/* ------------------------------------------------------------------ */
/* Assessment / active mastery engine                                  */
/* ------------------------------------------------------------------ */

export const assessmentItems = pgTable(
  "assessment_items",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    /** free_recall | explain | predict_output | code_reading | code_completion | debugging |
     *  trace | complexity | compare | choose_method | derivation | calculation | diagnose |
     *  transfer | case_decision | oral | design_review | interview | incident | research_critique | mcq */
    type: text("type").notNull(),
    /** A..F difficulty ladder */
    difficulty: text("difficulty").notNull(),
    /** recall | application | transfer */
    phase: text("phase").notNull(),
    prompt: text("prompt").notNull(),
    context: text("context"),
    expectedPoints: jsonb("expected_points").$type<string[]>().notNull().default([]),
    hints: jsonb("hints").$type<string[]>().notNull().default([]),
    referenceAnswer: text("reference_answer").notNull(),
    skills: jsonb("skills").$type<string[]>().notNull().default([]),
  },
  (t) => [index("assessment_items_lesson_idx").on(t.lessonId)],
);

export const attempts = pgTable(
  "attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => assessmentItems.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    response: text("response").notNull(),
    /** self-reported outcome: missed | partial | solid */
    outcome: text("outcome").notNull(),
    score: real("score").notNull(),
    /** none | hint | guidance | concept_reminder | worked_example | full_explanation */
    helpLevel: text("help_level").notNull().default("none"),
    independent: boolean("independent").notNull().default(true),
    /** concept | recall | selection | execution | transfer | attention | load | none */
    errorType: text("error_type").notNull().default("none"),
    learningState: text("learning_state").notNull().default("deep"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("attempts_user_idx").on(t.userId, t.lessonId)],
);

export const masteryRecords = pgTable(
  "mastery_records",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nodeType: text("node_type").notNull(), // lesson | course | skill
    nodeId: text("node_id").notNull(),
    level: integer("level").notNull().default(0), // L0..L9
    recall: real("recall").notNull().default(0),
    application: real("application").notNull().default(0),
    transfer: real("transfer").notNull().default(0),
    independence: real("independence").notNull().default(0),
    evidenceCount: integer("evidence_count").notNull().default(0),
    delayedPerformance: real("delayed_performance").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("mastery_unique").on(t.userId, t.nodeType, t.nodeId)],
);

export const reviewItems = pgTable(
  "review_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    itemId: text("item_id"),
    activityType: text("activity_type").notNull().default("free_recall"),
    label: text("label").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    intervalDays: real("interval_days").notNull().default(1),
    ease: real("ease").notNull().default(2.3),
    lapses: integer("lapses").notNull().default(0),
    importance: real("importance").notNull().default(1),
    lastResult: text("last_result"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("review_user_due_idx").on(t.userId, t.dueAt)],
);

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  depthTarget: text("depth_target").notNull().default("strong"),
});

export const skillEdges = pgTable("skill_edges", {
  id: serial("id").primaryKey(),
  fromSkill: text("from_skill").notNull(),
  toSkill: text("to_skill").notNull(),
});

export const skillEvidence = pgTable(
  "skill_evidence",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id").notNull(),
    /** assessment | transfer | code_review | project | debugging | oral | interview | deployment */
    kind: text("kind").notNull(),
    description: text("description").notNull(),
    url: text("url"),
    independent: boolean("independent").notNull().default(true),
    weight: real("weight").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("skill_evidence_user_idx").on(t.userId, t.skillId)],
);

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  ladderLevel: integer("ladder_level").notNull(),
  track: text("track").notNull(),
  sourceCategory: text("source_category").notNull(),
  problem: text("problem").notNull(),
  constraints: jsonb("constraints").$type<string[]>().notNull().default([]),
  dataPolicy: text("data_policy").notNull(),
  suggestedData: jsonb("suggested_data")
    .$type<{ name: string; url: string; note: string }[]>()
    .notNull()
    .default([]),
  milestones: jsonb("milestones").$type<string[]>().notNull().default([]),
  definitionOfDone: jsonb("definition_of_done").$type<string[]>().notNull().default([]),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  prerequisites: jsonb("prerequisites").$type<string[]>().notNull().default([]),
});

export const userProjects = pgTable(
  "user_projects",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id").notNull(),
    status: text("status").notNull().default("planned"), // planned | in_progress | review | done
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    datasetUrl: text("dataset_url"),
    notes: text("notes"),
    /** Practice Only | Skill Evidence | Technical Artifact | Portfolio Project | Professional Evidence | Signature Project */
    valueClass: text("value_class").notNull().default("Practice Only"),
    completedChecks: jsonb("completed_checks").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_project_unique").on(t.userId, t.projectId)],
);

export const projectEvidence = pgTable(
  "project_evidence",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userProjectId: integer("user_project_id").notNull(),
    kind: text("kind").notNull(), // repository | commit | pull_request | deployment | report | demo | dataset | test_run
    url: text("url"),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("project_evidence_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Career engine                                                       */
/* ------------------------------------------------------------------ */

export const careerRoles = pgTable("career_roles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  sourceUrl: text("source_url").notNull(),
  snapshotDate: text("snapshot_date").notNull(),
  verificationStatus: text("verification_status").notNull(),
  region: text("region").notNull(),
  seniority: text("seniority").notNull(),
  summary: text("summary").notNull(),
  hardRequirements: jsonb("hard_requirements").$type<string[]>().notNull().default([]),
  preferredRequirements: jsonb("preferred_requirements").$type<string[]>().notNull().default([]),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  interviewQuestions: jsonb("interview_questions").$type<string[]>().notNull().default([]),
  notes: text("notes").notNull(),
});

export const userCareerTargets = pgTable(
  "user_career_targets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("career_target_unique").on(t.userId, t.roleId)],
);

/* ------------------------------------------------------------------ */
/* English system                                                      */
/* ------------------------------------------------------------------ */

export const englishTerms = pgTable("english_terms", {
  id: text("id").primaryKey(),
  term: text("term").notNull(),
  b1b2: text("b1b2").notNull(),
  arabic: text("arabic").notNull(),
  example: text("example").notNull(),
  category: text("category").notNull(),
});

export const englishAttempts = pgTable(
  "english_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** reading | listening | writing | speaking | interaction | vocabulary | professional */
    dimension: text("dimension").notNull(),
    activity: text("activity").notNull(),
    prompt: text("prompt").notNull(),
    response: text("response").notNull(),
    selfRating: integer("self_rating").notNull().default(3),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("english_attempts_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Freelance simulations                                               */
/* ------------------------------------------------------------------ */

export const freelanceSimulations = pgTable("freelance_simulations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  clientBrief: text("client_brief").notNull(),
  hiddenConstraints: jsonb("hidden_constraints").$type<string[]>().notNull().default([]),
  requiredQuestions: jsonb("required_questions").$type<string[]>().notNull().default([]),
  deliverables: jsonb("deliverables").$type<string[]>().notNull().default([]),
  stage: text("stage").notNull(),
});

export const freelanceRuns = pgTable(
  "freelance_runs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    simulationId: text("simulation_id").notNull(),
    questionsAsked: jsonb("questions_asked").$type<string[]>().notNull().default([]),
    scopeDraft: text("scope_draft").notNull(),
    coverage: real("coverage").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("freelance_runs_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* AI mentor                                                           */
/* ------------------------------------------------------------------ */

export const aiThreads = pgTable(
  "ai_threads",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id"),
    specialist: text("specialist").notNull().default("lead_mentor"),
    title: text("title").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_threads_user_idx").on(t.userId)],
);

export const aiMessages = pgTable(
  "ai_messages",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    threadId: integer("thread_id").notNull(),
    role: text("role").notNull(), // student | mentor | system_notice
    specialist: text("specialist"),
    content: text("content").notNull(),
    provider: text("provider").notNull().default("none"),
    status: text("status").notNull().default("ok"), // ok | provider_unavailable | blocked
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_messages_thread_idx").on(t.userId, t.threadId)],
);

/* ------------------------------------------------------------------ */
/* Study operations                                                    */
/* ------------------------------------------------------------------ */

export const studySessions = pgTable(
  "study_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    learningState: text("learning_state").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("study_sessions_user_idx").on(t.userId)],
);

export const laterItems = pgTable(
  "later_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("later_items_user_idx").on(t.userId)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    action: text("action").notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_logs_user_idx").on(t.userId)],
);
