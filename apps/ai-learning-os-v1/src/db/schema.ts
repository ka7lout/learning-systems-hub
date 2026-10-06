import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  real,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("student"), // student | admin | content_editor | reviewer | support | research_editor | career_editor
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  ownerId: uuid("owner_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"), // light | dark | system
  language: text("language").notNull().default("en"), // en | ar
  englishMode: text("english_mode").notNull().default("standard"), // standard | b1b2
  vocabularyAssist: boolean("vocabulary_assist").notNull().default(true),
  englishTraining: boolean("english_training").notNull().default(false),
  hintPolicy: text("hint_policy").notNull().default("attempt_first"), // attempt_first | open
  reducedMotion: boolean("reduced_motion").notNull().default(false),
  textSize: text("text_size").notNull().default("normal"), // normal | large
  readingDensity: text("reading_density").notNull().default("comfortable"), // comfortable | compact
  targetRoleSlug: text("target_role_slug"),
  defaultLearningState: text("default_learning_state").notNull().default("deep"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Curriculum graph                                                    */
/* ------------------------------------------------------------------ */

export const curriculumNodes = pgTable(
  "curriculum_nodes",
  {
    id: text("id").primaryKey(), // slug
    type: text("type").notNull(), // stage | course | module | lesson | topic
    parentId: text("parent_id"),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    sourceCategory: text("source_category").notNull(), // original | harvard_college | harvard_extension | industry | research
    priority: text("priority").notNull().default("core"), // core | support | advanced | specialization | industry | research
    level: text("level").notNull().default("foundation"), // foundation | intermediate | advanced | graduate | research
    position: integer("position").notNull().default(0),
    estimatedMinutes: integer("estimated_minutes").notNull().default(60),
    why: text("why").notNull().default(""),
    objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
    content: jsonb("content").$type<LessonSection[]>().notNull().default([]),
    notebook: jsonb("notebook").$type<NotebookGuidance | null>(),
    harvardMapping: jsonb("harvard_mapping").$type<HarvardMapping[]>().notNull().default([]),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull().default([]),
    masteryCriteria: jsonb("mastery_criteria").$type<string[]>().notNull().default([]),
    version: integer("version").notNull().default(1),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("curriculum_parent_idx").on(t.parentId)],
);

export const nodePrerequisites = pgTable(
  "node_prerequisites",
  {
    nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
    prerequisiteId: text("prerequisite_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.nodeId, t.prerequisiteId] })],
);

export const skills = pgTable("skills", {
  id: text("id").primaryKey(), // slug
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
});

export const nodeSkills = pgTable(
  "node_skills",
  {
    nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
    skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.nodeId, t.skillId] })],
);

export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  sourceType: text("source_type").notNull(), // official_catalog | syllabus | program_page | research | docs | job_posting | standard
  verificationStatus: text("verification_status").notNull(), // confirmed_current | confirmed_historical | likely_not_verified | not_found | design_decision | research_hypothesis
  accessedAt: timestamp("accessed_at", { withTimezone: true }),
  notes: text("notes").notNull().default(""),
});

export const practiceItems = pgTable(
  "practice_items",
  {
    id: text("id").primaryKey(),
    nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // free_recall | explain_why | predict_output | code_reading | debugging | choose_method | derivation | calculation | transfer | case_decision | oral | design_review | compare
    difficulty: text("difficulty").notNull().default("B"), // A..F
    prompt: text("prompt").notNull(),
    rubric: jsonb("rubric").$type<string[]>().notNull().default([]),
    reference: text("reference").notNull().default(""),
    isTransfer: boolean("is_transfer").notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("practice_node_idx").on(t.nodeId)],
);

/* ------------------------------------------------------------------ */
/* Learner state (owner-scoped)                                        */
/* ------------------------------------------------------------------ */

export const practiceAttempts = pgTable(
  "practice_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull().references(() => practiceItems.id, { onDelete: "cascade" }),
    nodeId: text("node_id").notNull(),
    response: text("response").notNull(),
    selfScore: integer("self_score").notNull(), // 0-3 : 0 blank, 1 partial, 2 mostly, 3 complete
    helpLevel: text("help_level").notNull().default("none"), // none | hint | guidance | concept_reminder | worked_example | full_explanation
    learningState: text("learning_state").notNull().default("deep"),
    isTransfer: boolean("is_transfer").notNull().default(false),
    isReview: boolean("is_review").notNull().default(false),
    errorType: text("error_type"), // concept | recall | selection | execution | transfer | attention | load
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("attempt_owner_idx").on(t.ownerId, t.nodeId)],
);

export const masteryRecords = pgTable(
  "mastery_records",
  {
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
    level: integer("level").notNull().default(0), // L0..L9
    recallScore: real("recall_score").notNull().default(0),
    transferScore: real("transfer_score").notNull().default(0),
    independentAttempts: integer("independent_attempts").notNull().default(0),
    assistedAttempts: integer("assisted_attempts").notNull().default(0),
    contentSeen: boolean("content_seen").notNull().default(false),
    lastAssessedAt: timestamp("last_assessed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.ownerId, t.nodeId] })],
);

export const reviewItems = pgTable(
  "review_items",
  {
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    intervalDays: real("interval_days").notNull().default(1),
    lapses: integer("lapses").notNull().default(0),
    repetitions: integer("repetitions").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.ownerId, t.nodeId] }), index("review_due_idx").on(t.ownerId, t.dueAt)],
);

export const learningSessions = pgTable("learning_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  state: text("state").notNull(), // deep | drift | fog | overload
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const laterItems = pgTable("later_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const projectCatalog = pgTable("project_catalog", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  ladderLevel: integer("ladder_level").notNull(), // 1..10
  domain: text("domain").notNull(),
  sourceCategory: text("source_category").notNull().default("original"),
  brief: text("brief").notNull(),
  dataGuidance: text("data_guidance").notNull(),
  deliverables: jsonb("deliverables").$type<string[]>().notNull().default([]),
  definitionOfDone: jsonb("definition_of_done").$type<string[]>().notNull().default([]),
  skillIds: jsonb("skill_ids").$type<string[]>().notNull().default([]),
  prerequisiteNodeIds: jsonb("prerequisite_node_ids").$type<string[]>().notNull().default([]),
});

export const userProjects = pgTable(
  "user_projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    catalogId: text("catalog_id").notNull().references(() => projectCatalog.id),
    status: text("status").notNull().default("planned"), // planned | in_progress | in_review | done
    repoUrl: text("repo_url"),
    codespaceUrl: text("codespace_url"),
    colabUrl: text("colab_url"),
    kaggleUrl: text("kaggle_url"),
    datasetUrl: text("dataset_url"),
    datasetLicense: text("dataset_license"),
    deploymentUrl: text("deployment_url"),
    reportUrl: text("report_url"),
    notes: text("notes"),
    checklist: jsonb("checklist").$type<Record<string, boolean>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("user_projects_owner_idx").on(t.ownerId)],
);

export const projectEvidence = pgTable(
  "project_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    userProjectId: uuid("user_project_id").notNull().references(() => userProjects.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // commit | pull_request | deployment | report | metric | demo | test_run | model_card
    url: text("url"),
    description: text("description").notNull(),
    evidenceClass: text("evidence_class").notNull().default("skill_evidence"), // practice_only | skill_evidence | technical_artifact | portfolio_project | professional_evidence | signature_project
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("evidence_owner_idx").on(t.ownerId)],
);

/* ------------------------------------------------------------------ */
/* Career                                                              */
/* ------------------------------------------------------------------ */

export const careerRoles = pgTable("career_roles", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  employer: text("employer").notNull(),
  sourceUrl: text("source_url").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }),
  verificationStatus: text("verification_status").notNull(),
  seniority: text("seniority").notNull().default("unknown"),
  location: text("location").notNull().default("unknown"),
  summary: text("summary").notNull().default(""),
});

export const roleRequirements = pgTable(
  "role_requirements",
  {
    roleSlug: text("role_slug").notNull().references(() => careerRoles.slug, { onDelete: "cascade" }),
    skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
    requirementType: text("requirement_type").notNull(), // hard | preferred | familiarity
  },
  (t) => [primaryKey({ columns: [t.roleSlug, t.skillId] })],
);

export const skillEvidence = pgTable(
  "skill_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull(), // assessment | delayed_transfer | project | code_review | debugging | oral | interview_sim | deployed_artifact
    refId: text("ref_id"),
    strength: integer("strength").notNull().default(1), // 1 developing, 2 competent, 3 independently demonstrated
    independent: boolean("independent").notNull().default(false),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("skill_evidence_owner_idx").on(t.ownerId, t.skillId)],
);

/* ------------------------------------------------------------------ */
/* English, professional simulations, AI                               */
/* ------------------------------------------------------------------ */

export const englishTerms = pgTable("english_terms", {
  term: text("term").primaryKey(),
  simpleDefinition: text("simple_definition").notNull(),
  arabic: text("arabic").notNull().default(""),
  example: text("example").notNull(),
  domain: text("domain").notNull(),
});

export const activityAttempts = pgTable(
  "activity_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    activityType: text("activity_type").notNull(), // english_speaking | english_writing | interview | freelance_discovery | incident | research_critique | system_design
    activityKey: text("activity_key").notNull(),
    prompt: text("prompt").notNull(),
    response: text("response").notNull(),
    selfAssessment: jsonb("self_assessment").$type<Record<string, number>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_owner_idx").on(t.ownerId, t.activityType)],
);

export const aiThreads = pgTable(
  "ai_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    nodeId: text("node_id"),
    title: text("title").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_threads_owner_idx").on(t.ownerId)],
);

export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id").notNull().references(() => aiThreads.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user | assistant | system_note
    specialist: text("specialist"),
    action: text("action"),
    model: text("model"),
    content: text("content").notNull(),
    status: text("status").notNull().default("ok"), // ok | provider_error | unavailable
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_messages_thread_idx").on(t.threadId)],
);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  action: text("action").notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* JSON types                                                          */
/* ------------------------------------------------------------------ */

export type LessonSection = {
  heading: string;
  body: string; // markdown-lite paragraphs separated by blank lines
  code?: { language: string; source: string };
  kind?: "why" | "concept" | "example" | "failure" | "connection" | "case";
};

export type NotebookGuidance = {
  mustWrite: string[];
  recommended: string[];
  optional: string[];
};

export type HarvardMapping = {
  course: string;
  title: string;
  school: "Harvard College" | "Harvard Extension" | "Harvard SEAS";
  exactMatch: boolean;
  depth: string;
  harvardAdds: string;
  weAddBeyond: string;
  status: "confirmed_current" | "confirmed_historical" | "likely_not_verified" | "not_found";
  sourceId: string;
};
