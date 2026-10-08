import { 
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
 } from "drizzle-orm/pg-core";

export const pgTable = pgTableCreator((name) => "ai_learning_spec_gpt6_" + name);

const now = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updated = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

// Better Auth schema (email/password sessions are managed by the library).
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("session_user_id_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("account_user_id_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const learnerProfiles = pgTable("learner_profiles", {
  ownerId: text("owner_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  learningState: text("learning_state").notNull().default("deep"),
  theme: text("theme").notNull().default("system"),
  language: text("language").notNull().default("en"),
  contentMode: text("content_mode").notNull().default("standard"),
  vocabularyAssist: boolean("vocabulary_assist").notNull().default(true),
  reducedMotion: boolean("reduced_motion").notNull().default(false),
  textScale: text("text_scale").notNull().default("default"),
  targetRoleIds: text("target_role_ids").array().notNull().default([]),
  availableMinutes: integer("available_minutes").notNull().default(30),
  createdAt: now(),
  updatedAt: updated(),
});

export const curriculumNodes = pgTable("curriculum_nodes", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  sourceCategory: text("source_category").notNull(),
  level: text("level").notNull().default("Core"),
  stage: text("stage").notNull().default("Foundations"),
  description: text("description").notNull().default(""),
  why: text("why").notNull().default(""),
  learningObjectives: text("learning_objectives").array().notNull().default([]),
  skills: text("skills").array().notNull().default([]),
  prerequisites: text("prerequisites").array().notNull().default([]),
  corequisites: text("corequisites").array().notNull().default([]),
  estimatedEffort: integer("estimated_effort_hours").notNull().default(1),
  masteryCriteria: jsonb("mastery_criteria").$type<Record<string, unknown>>().notNull().default({}),
  assessments: jsonb("assessments").$type<string[]>().notNull().default([]),
  projectRefs: text("project_refs").array().notNull().default([]),
  sources: jsonb("sources").$type<Array<{ title: string; url: string; status?: string }>>().notNull().default([]),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  version: integer("version").notNull().default(1),
  lastVerified: text("last_verified"),
  changeNotes: text("change_notes").notNull().default("Initial verified seed"),
  createdAt: now(),
  updatedAt: updated(),
}, (table) => [index("curriculum_nodes_parent_idx").on(table.parentId), index("curriculum_nodes_stage_idx").on(table.stage)]);

export const curriculumSources = pgTable("curriculum_sources", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  author: text("author").notNull().default(""),
  publisher: text("publisher").notNull().default(""),
  sourceType: text("source_type").notNull().default("official_academic"),
  license: text("license").notNull().default("Copyright remains with the publisher; link only"),
  publishedAt: text("published_at"),
  accessedAt: text("accessed_at").notNull(),
  contentHash: text("content_hash"),
  verificationStatus: text("verification_status").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: now(),
}, (table) => [uniqueIndex("curriculum_sources_url_idx").on(table.url)]);

export const projectsCatalog = pgTable("projects_catalog", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  ladderLevel: integer("ladder_level").notNull(),
  riskNote: text("risk_note"),
  sourceStatus: text("source_status").notNull().default("learner_provided_project_idea"),
  brief: text("brief").notNull().default("Project idea preserved from the original curriculum. No outcome is claimed.") ,
  definitionOfDone: jsonb("definition_of_done").$type<string[]>().notNull().default([]),
  createdAt: now(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  catalogId: text("catalog_id").references(() => projectsCatalog.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  status: text("status").notNull().default("planned"),
  repositoryUrl: text("repository_url"),
  demoUrl: text("demo_url"),
  reportUrl: text("report_url"),
  problem: text("problem").notNull().default(""),
  architecture: text("architecture").notNull().default(""),
  limitations: text("limitations").notNull().default(""),
  createdAt: now(),
  updatedAt: updated(),
}, (table) => [index("projects_owner_idx").on(table.ownerId)]);

export const projectEvidence = pgTable("project_evidence", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  evidenceType: text("evidence_type").notNull(),
  label: text("label").notNull(),
  url: text("url"),
  notes: text("notes").notNull().default(""),
  createdAt: now(),
}, (table) => [index("project_evidence_owner_idx").on(table.ownerId), index("project_evidence_project_idx").on(table.projectId)]);

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  sourceCategory: text("source_category").notNull(),
  description: text("description").notNull().default(""),
  nodeIds: text("node_ids").array().notNull().default([]),
  createdAt: now(),
});

export const skillEvidence = pgTable("skill_evidence", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  evidenceType: text("evidence_type").notNull(),
  artifactUrl: text("artifact_url"),
  evidenceSummary: text("evidence_summary").notNull(),
  independent: boolean("independent").notNull().default(false),
  createdAt: now(),
}, (table) => [index("skill_evidence_owner_idx").on(table.ownerId), index("skill_evidence_skill_idx").on(table.skillId)]);

export const learningEvents = pgTable("learning_events", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  performance: numeric("performance", { precision: 5, scale: 2 }),
  independent: boolean("independent").notNull().default(true),
  helpLevel: text("help_level").notNull().default("no_help"),
  response: text("response").notNull().default(""),
  errorType: text("error_type"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("learning_events_owner_date_idx").on(table.ownerId, table.occurredAt), index("learning_events_node_idx").on(table.nodeId)]);

export const masteryRecords = pgTable("mastery_records", {
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
  completion: text("completion").notNull().default("not_started"),
  recallScore: numeric("recall_score", { precision: 5, scale: 2 }),
  transferScore: numeric("transfer_score", { precision: 5, scale: 2 }),
  independenceScore: numeric("independence_score", { precision: 5, scale: 2 }),
  lastEvidenceAt: timestamp("last_evidence_at", { withTimezone: true }),
  updatedAt: updated(),
}, (table) => [primaryKey({ columns: [table.ownerId, table.nodeId] })]);

export const reviewItems = pgTable("review_items", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  intervalDays: integer("interval_days").notNull().default(1),
  difficulty: numeric("difficulty", { precision: 4, scale: 2 }).notNull().default("0.5"),
  status: text("status").notNull().default("due"),
  activityType: text("activity_type").notNull().default("free_recall"),
  createdAt: now(),
  updatedAt: updated(),
}, (table) => [index("review_owner_due_idx").on(table.ownerId, table.dueAt), uniqueIndex("review_owner_node_unique_idx").on(table.ownerId, table.nodeId)]);

export const tasks = pgTable("learning_tasks", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  nodeId: text("node_id").references(() => curriculumNodes.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  reason: text("reason").notNull(),
  taskType: text("task_type").notNull(),
  status: text("status").notNull().default("queued"),
  suggestedMinutes: integer("suggested_minutes").notNull().default(10),
  createdAt: now(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [index("learning_tasks_owner_status_idx").on(table.ownerId, table.status)]);

export const careerRoles = pgTable("career_roles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  sourceStatus: text("source_status").notNull(),
  sourceNote: text("source_note").notNull(),
  region: text("region"),
  seniority: text("seniority"),
  sourceUrl: text("source_url"),
  snapshotDate: text("snapshot_date"),
  createdAt: now(),
});

export const jobRequirements = pgTable("job_requirements", {
  id: text("id").primaryKey(),
  roleId: text("role_id").notNull().references(() => careerRoles.id, { onDelete: "cascade" }),
  skillName: text("skill_name").notNull(),
  requirementType: text("requirement_type").notNull().default("blueprint"),
  confidence: text("confidence").notNull().default("learner_supplied"),
  createdAt: now(),
}, (table) => [index("job_requirements_role_idx").on(table.roleId)]);

export const jobSnapshots = pgTable("job_snapshots", {
  id: text("id").primaryKey(),
  employer: text("employer").notNull(),
  roleTitle: text("role_title").notNull(),
  sourceUrl: text("source_url").notNull(),
  snapshotDate: text("snapshot_date").notNull(),
  location: text("location").notNull(),
  seniority: text("seniority").notNull(),
  sourceStatus: text("source_status").notNull(),
  requirements: jsonb("requirements").$type<Array<{ skill: string; type: "required" | "preferred" }>>().notNull().default([]),
  notes: text("notes").notNull().default(""),
  createdAt: now(),
}, (table) => [index("job_snapshots_date_idx").on(table.snapshotDate)]);

export const englishTerms = pgTable("english_terms", {
  id: text("id").primaryKey(),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  arabicMeaning: text("arabic_meaning"),
  example: text("example").notNull(),
  topic: text("topic").notNull(),
  createdAt: now(),
});

export const englishAttempts = pgTable("english_attempts", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  activity: text("activity").notNull(),
  response: text("response").notNull(),
  feedback: text("feedback").notNull().default(""),
  createdAt: now(),
}, (table) => [index("english_attempts_owner_idx").on(table.ownerId)]);

export const aiThreads = pgTable("ai_threads", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Study conversation"),
  contextNodeId: text("context_node_id").references(() => curriculumNodes.id, { onDelete: "set null" }),
  createdAt: now(),
  updatedAt: updated(),
}, (table) => [index("ai_threads_owner_idx").on(table.ownerId)]);

export const aiMessages = pgTable("ai_messages", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  threadId: text("thread_id").notNull().references(() => aiThreads.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: now(),
}, (table) => [index("ai_messages_owner_thread_idx").on(table.ownerId, table.threadId)]);

export const aiRuns = pgTable("ai_runs", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  threadId: text("thread_id").references(() => aiThreads.id, { onDelete: "set null" }),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  status: text("status").notNull(),
  latencyMs: integer("latency_ms"),
  errorClass: text("error_class"),
  createdAt: now(),
}, (table) => [index("ai_runs_owner_created_idx").on(table.ownerId, table.createdAt)]);

export const laterItems = pgTable("later_items", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  sourceContext: text("source_context").notNull().default("study"),
  capturedAt: now(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
}, (table) => [index("later_items_owner_idx").on(table.ownerId)]);

export const portfolioItems = pgTable("portfolio_items", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  artifactClass: text("artifact_class").notNull().default("practice_only"),
  summary: text("summary").notNull(),
  publicUrl: text("public_url"),
  verificationStatus: text("verification_status").notNull().default("student_submitted_unverified"),
  createdAt: now(),
}, (table) => [index("portfolio_owner_idx").on(table.ownerId)]);
