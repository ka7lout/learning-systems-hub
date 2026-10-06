import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Identity / access                                                   */
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
      .$type<{
        theme?: "light" | "dark" | "system";
        uiLanguage?: "en" | "ar";
        contentMode?: "standard" | "b1b2" | "arabic";
        vocabAssist?: boolean;
        reducedMotion?: boolean;
        readingDensity?: "compact" | "comfortable";
        hintPolicy?: "attempt_first" | "open";
        targetRoleKey?: string | null;
      }>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Sources / provenance                                                */
/* ------------------------------------------------------------------ */

export const sources = pgTable(
  "sources",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    url: text("url"),
    publisher: text("publisher"),
    sourceType: text("source_type").notNull().default("web"),
    // confirmed_current | confirmed_historical | likely_not_verified | not_found
    // | design_decision | research_hypothesis
    verificationStatus: text("verification_status").notNull().default("likely_not_verified"),
    accessedAt: timestamp("accessed_at", { withTimezone: true }),
    notes: text("notes"),
  },
  (t) => [uniqueIndex("sources_key_unique").on(t.key)],
);

/* ------------------------------------------------------------------ */
/* Curriculum graph                                                    */
/* ------------------------------------------------------------------ */

export const tracks = pgTable(
  "tracks",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    position: integer("position").notNull().default(0),
  },
  (t) => [uniqueIndex("tracks_key_unique").on(t.key)],
);

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    trackKey: text("track_key").notNull(),
    title: text("title").notNull(),
    // Original Curriculum | Harvard College | Harvard Extension |
    // Industry Extension | Research Extension
    sourceCategory: text("source_category").notNull(),
    level: text("level").notNull().default("CORE"), // CORE|SUPPORT|ADVANCED|SPECIALIZATION|INDUSTRY|RESEARCH
    summary: text("summary").notNull().default(""),
    learningObjectives: jsonb("learning_objectives").$type<string[]>().notNull().default([]),
    masteryCriteria: jsonb("mastery_criteria").$type<string[]>().notNull().default([]),
    estimatedHours: integer("estimated_hours").notNull().default(10),
    weeklyWorkload: text("weekly_workload").notNull().default("4-6 h/week"),
    learningMode: text("learning_mode").notNull().default("lecture + problem set + project"),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull().default([]),
    verificationStatus: text("verification_status").notNull().default("design_decision"),
    position: integer("position").notNull().default(0),
    version: integer("version").notNull().default(1),
    lastVerified: timestamp("last_verified", { withTimezone: true }),
  },
  (t) => [uniqueIndex("courses_key_unique").on(t.key)],
);

export const prerequisites = pgTable(
  "prerequisites",
  {
    id: serial("id").primaryKey(),
    courseKey: text("course_key").notNull(),
    requiresCourseKey: text("requires_course_key").notNull(),
    kind: text("kind").notNull().default("prerequisite"), // prerequisite | corequisite
  },
  (t) => [uniqueIndex("prereq_unique").on(t.courseKey, t.requiresCourseKey)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    courseKey: text("course_key").notNull(),
    title: text("title").notNull(),
    position: integer("position").notNull().default(0),
    why: text("why").notNull().default(""),
    objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
    topics: jsonb("topics").$type<string[]>().notNull().default([]),
    blocks: jsonb("blocks")
      .$type<
        {
          kind: "concept" | "worked_example" | "code" | "caution" | "case" | "math" | "checklist";
          title: string;
          body: string;
          b1b2?: string;
          arabic?: string;
        }[]
      >()
      .notNull()
      .default([]),
    notebook: jsonb("notebook")
      .$type<{ mustWrite: string[]; recommended: string[]; optional: string[] }>()
      .notNull()
      .default({ mustWrite: [], recommended: [], optional: [] }),
    skillKeys: jsonb("skill_keys").$type<string[]>().notNull().default([]),
    sourceCategory: text("source_category").notNull().default("Original Curriculum"),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull().default([]),
    estimatedMinutes: integer("estimated_minutes").notNull().default(45),
    version: integer("version").notNull().default(1),
  },
  (t) => [uniqueIndex("lessons_key_unique").on(t.key), index("lessons_course_idx").on(t.courseKey)],
);

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

export const skills = pgTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull().default("engineering"),
    kind: text("kind").notNull().default("discipline"), // discipline | tool
    description: text("description").notNull().default(""),
  },
  (t) => [uniqueIndex("skills_key_unique").on(t.key)],
);

/* ------------------------------------------------------------------ */
/* Assessment                                                          */
/* ------------------------------------------------------------------ */

export const assessmentItems = pgTable(
  "assessment_items",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    lessonKey: text("lesson_key").notNull(),
    // free_recall | explain | predict_output | code_reading | debugging |
    // transfer | case_decision | choose_method | derivation | complexity | mcq | oral
    type: text("type").notNull(),
    stage: text("stage").notNull().default("recall"), // recall | application | transfer | case
    difficulty: text("difficulty").notNull().default("B"), // A..F
    prompt: text("prompt").notNull(),
    context: text("context"),
    options: jsonb("options").$type<string[]>(),
    answerKey: text("answer_key"),
    rubric: jsonb("rubric").$type<string[]>().notNull().default([]),
    skillKeys: jsonb("skill_keys").$type<string[]>().notNull().default([]),
  },
  (t) => [
    uniqueIndex("assessment_items_key_unique").on(t.key),
    index("assessment_items_lesson_idx").on(t.lessonKey),
  ],
);

export const attempts = pgTable(
  "attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemKey: text("item_key").notNull(),
    lessonKey: text("lesson_key").notNull(),
    responseText: text("response_text").notNull().default(""),
    selectedOption: integer("selected_option"),
    // no_help | hint | guidance | concept_reminder | worked_example | full_explanation
    helpLevel: text("help_level").notNull().default("no_help"),
    selfRating: integer("self_rating"), // 0..3 (missed, hard, ok, easy)
    outcome: text("outcome").notNull().default("submitted"), // correct | partial | incorrect | submitted
    errorClass: text("error_class"), // concept|recall|selection|execution|transfer|attention|load
    independent: boolean("independent").notNull().default(true),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("attempts_user_idx").on(t.userId, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Mastery / review                                                    */
/* ------------------------------------------------------------------ */

export const masteryRecords = pgTable(
  "mastery_records",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillKey: text("skill_key").notNull(),
    level: integer("level").notNull().default(0), // L0..L9
    recall: real("recall").notNull().default(0),
    application: real("application").notNull().default(0),
    transfer: real("transfer").notNull().default(0),
    evidenceCount: integer("evidence_count").notNull().default(0),
    independentEvidence: integer("independent_evidence").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("mastery_unique").on(t.userId, t.skillKey)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonKey: text("lesson_key").notNull(),
    status: text("status").notNull().default("in_progress"), // in_progress | practiced | demonstrated
    contentSeenAt: timestamp("content_seen_at", { withTimezone: true }),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
    recallScore: real("recall_score").notNull().default(0),
    transferScore: real("transfer_score").notNull().default(0),
  },
  (t) => [uniqueIndex("lesson_progress_unique").on(t.userId, t.lessonKey)],
);

export const reviewItems = pgTable(
  "review_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonKey: text("lesson_key").notNull(),
    itemKey: text("item_key").notNull(),
    activityType: text("activity_type").notNull().default("free_recall"),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    intervalDays: real("interval_days").notNull().default(1),
    ease: real("ease").notNull().default(2.3),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    importance: integer("importance").notNull().default(2),
    lastResult: text("last_result"),
  },
  (t) => [
    uniqueIndex("review_unique").on(t.userId, t.itemKey),
    index("review_due_idx").on(t.userId, t.dueAt),
  ],
);

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const projectCatalog = pgTable(
  "project_catalog",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    ladderLevel: integer("ladder_level").notNull().default(1),
    sourceCategory: text("source_category").notNull().default("Original Curriculum"),
    brief: text("brief").notNull().default(""),
    dataPolicy: text("data_policy").notNull().default(""),
    suggestedData: jsonb("suggested_data").$type<{ name: string; url: string; note: string }[]>().notNull().default([]),
    milestones: jsonb("milestones").$type<string[]>().notNull().default([]),
    definitionOfDone: jsonb("definition_of_done").$type<string[]>().notNull().default([]),
    skillKeys: jsonb("skill_keys").$type<string[]>().notNull().default([]),
    evidenceClass: text("evidence_class").notNull().default("Portfolio Project"),
  },
  (t) => [uniqueIndex("project_catalog_key_unique").on(t.key)],
);

export const userProjects = pgTable(
  "user_projects",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectKey: text("project_key").notNull(),
    status: text("status").notNull().default("planned"), // planned|in_progress|in_review|done|abandoned
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    datasetUrl: text("dataset_url"),
    reportUrl: text("report_url"),
    notes: text("notes").notNull().default(""),
    milestoneState: jsonb("milestone_state").$type<Record<string, boolean>>().notNull().default({}),
    dodState: jsonb("dod_state").$type<Record<string, boolean>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_project_unique").on(t.userId, t.projectKey)],
);

export const projectEvidence = pgTable(
  "project_evidence",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userProjectId: integer("user_project_id")
      .notNull()
      .references(() => userProjects.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // repo|commit|pr|deployment|report|model_card|test_suite|oral_defense|incident_report
    url: text("url"),
    description: text("description").notNull().default(""),
    skillKeys: jsonb("skill_keys").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("evidence_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Career                                                              */
/* ------------------------------------------------------------------ */

export const careerRoles = pgTable(
  "career_roles",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    company: text("company").notNull().default(""),
    sourceUrl: text("source_url"),
    verificationStatus: text("verification_status").notNull().default("likely_not_verified"),
    snapshotDate: text("snapshot_date").notNull(),
    region: text("region").notNull().default("unspecified"),
    seniority: text("seniority").notNull().default("unspecified"),
    notes: text("notes").notNull().default(""),
  },
  (t) => [uniqueIndex("career_roles_key_unique").on(t.key)],
);

export const roleRequirements = pgTable(
  "role_requirements",
  {
    id: serial("id").primaryKey(),
    roleKey: text("role_key").notNull(),
    skillKey: text("skill_key").notNull(),
    importance: text("importance").notNull().default("hard"), // hard | preferred | familiarity
    note: text("note").notNull().default(""),
  },
  (t) => [uniqueIndex("role_req_unique").on(t.roleKey, t.skillKey)],
);

/* ------------------------------------------------------------------ */
/* English                                                             */
/* ------------------------------------------------------------------ */

export const englishTerms = pgTable(
  "english_terms",
  {
    id: serial("id").primaryKey(),
    term: text("term").notNull(),
    simpleDefinition: text("simple_definition").notNull(),
    arabic: text("arabic").notNull().default(""),
    example: text("example").notNull().default(""),
    domain: text("domain").notNull().default("ai-engineering"),
    collocations: jsonb("collocations").$type<string[]>().notNull().default([]),
  },
  (t) => [uniqueIndex("english_term_unique").on(t.term)],
);

export const englishActivities = pgTable(
  "english_activities",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dimension: text("dimension").notNull(), // reading|listening|writing|speaking|interaction|vocabulary|professional
    activity: text("activity").notNull(),
    promptKey: text("prompt_key"),
    response: text("response").notNull().default(""),
    mode: text("mode").notNull().default("text"), // text | speech
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("english_user_idx").on(t.userId, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Freelance simulations                                               */
/* ------------------------------------------------------------------ */

export const freelanceScenarios = pgTable(
  "freelance_scenarios",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    clientMessage: text("client_message").notNull(),
    hiddenConstraints: jsonb("hidden_constraints").$type<string[]>().notNull().default([]),
    requiredQuestions: jsonb("required_questions").$type<string[]>().notNull().default([]),
    deliverableRubric: jsonb("deliverable_rubric").$type<string[]>().notNull().default([]),
  },
  (t) => [uniqueIndex("freelance_key_unique").on(t.key)],
);

export const freelanceAttempts = pgTable(
  "freelance_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scenarioKey: text("scenario_key").notNull(),
    questionsAsked: jsonb("questions_asked").$type<string[]>().notNull().default([]),
    proposal: text("proposal").notNull().default(""),
    coverage: real("coverage").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("freelance_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Mentor / study state / misc                                         */
/* ------------------------------------------------------------------ */

export const mentorThreads = pgTable(
  "mentor_threads",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New conversation"),
    lessonKey: text("lesson_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("threads_user_idx").on(t.userId)],
);

export const mentorMessages = pgTable(
  "mentor_messages",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    threadId: integer("thread_id")
      .notNull()
      .references(() => mentorThreads.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user | mentor | system_notice
    specialist: text("specialist"),
    content: text("content").notNull(),
    provider: text("provider"), // puter | openai | anthropic | rule_based | unavailable
    helpLevel: text("help_level"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_thread_idx").on(t.threadId, t.createdAt)],
);

export const studySessions = pgTable(
  "study_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    state: text("state").notNull().default("deep"), // deep | drift | fog | overload
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    note: text("note").notNull().default(""),
  },
  (t) => [index("study_sessions_user_idx").on(t.userId, t.startedAt)],
);

export const laterItems = pgTable(
  "later_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    done: boolean("done").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("later_user_idx").on(t.userId)],
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
  (t) => [index("audit_user_idx").on(t.userId, t.createdAt)],
);
