import { 
  pgTableCreator,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  doublePrecision,
 } from "drizzle-orm/pg-core";

export const pgTable = pgTableCreator((name) => "ai_engineering_optionb_" + name);
import { relations } from "drizzle-orm";

// ============================================
// USERS & AUTH
// ============================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetRoleA: boolean("target_role_a").default(false),
  targetRoleB: boolean("target_role_b").default(false),
  englishMode: varchar("english_mode", { length: 30 }).default("standard"),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  learningState: varchar("learning_state", { length: 20 }).default("deep"),
  theme: varchar("theme", { length: 20 }).default("system"),
  reducedMotion: boolean("reduced_motion").default(false),
  textSize: varchar("text_size", { length: 20 }).default("medium"),
  density: varchar("density", { length: 20 }).default("normal"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CURRICULUM GRAPH
// ============================================
export const curriculumStages = pgTable("curriculum_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  stageNumber: integer("stage_number").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sourceCategory: varchar("source_category", { length: 50 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("core"),
  estimatedWeeks: integer("estimated_weeks"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  stageId: uuid("stage_id").references(() => curriculumStages.id),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  shortTitle: varchar("short_title", { length: 100 }),
  description: text("description"),
  sourceCategory: varchar("source_category", { length: 50 }).notNull(),
  sourceLabel: varchar("source_label", { length: 255 }),
  sourceUrl: text("source_url"),
  sourceStatus: varchar("source_status", { length: 50 }).notNull().default("design_decision"),
  level: varchar("level", { length: 50 }).notNull(),
  estimatedEffortHours: doublePrecision("estimated_effort_hours"),
  learningObjectives: jsonb("learning_objectives").$type<string[]>().default([]),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  corequisites: jsonb("corequisites").$type<string[]>().default([]),
  skills: jsonb("skills").$type<string[]>().default([]),
  careerRoles: jsonb("career_roles").$type<string[]>().default([]),
  assessmentTypes: jsonb("assessment_types").$type<string[]>().default([]),
  projectIds: jsonb("project_ids").$type<string[]>().default([]),
  harvardMapping: jsonb("harvard_mapping").$type<{
    courseCode?: string;
    exactMatch?: boolean;
    depth?: string;
    additions?: string[];
  }>(),
  version: varchar("version", { length: 20 }).default("1.0"),
  lastVerified: timestamp("last_verified"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const modules = pgTable("modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id),
  stageId: uuid("stage_id").references(() => curriculumStages.id),
  slug: varchar("slug", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sessionCount: integer("session_count"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: uuid("module_id").references(() => modules.id),
  courseId: uuid("course_id").references(() => courses.id),
  slug: varchar("slug", { length: 200 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  whyThisMatters: text("why_this_matters"),
  learningObjectives: jsonb("learning_objectives").$type<string[]>().default([]),
  content: text("content"),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  concepts: jsonb("concepts").$type<string[]>().default([]),
  skillIds: jsonb("skill_ids").$type<string[]>().default([]),
  masteryCriteria: jsonb("mastery_criteria").$type<string[]>().default([]),
  mustWriteNotes: jsonb("must_write_notes").$type<string[]>().default([]),
  recommendedNotes: jsonb("recommended_notes").$type<string[]>().default([]),
  order: integer("order").notNull().default(0),
  estimatedMinutes: integer("estimated_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningBlocks = pgTable("learning_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  blockType: varchar("block_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  data: jsonb("data").default({}),
  order: integer("order").notNull().default(0),
});

// ============================================
// SKILLS
// ============================================
export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  level: varchar("level", { length: 30 }).notNull(),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  careerRelevance: jsonb("career_relevance").$type<string[]>().default([]),
  englishTerms: jsonb("english_terms").$type<string[]>().default([]),
  order: integer("order").notNull().default(0),
});

// ============================================
// ASSESSMENTS & SUBMISSIONS
// ============================================
export const assessments = pgTable("assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").references(() => lessons.id),
  courseId: uuid("course_id").references(() => courses.id),
  title: varchar("title", { length: 255 }).notNull(),
  assessmentType: varchar("assessment_type", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("b"),
  instructions: text("instructions"),
  items: jsonb("items").default([]),
  rubric: jsonb("rubric").default({}),
  timeLimitMinutes: integer("time_limit_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentItems = pgTable("assessment_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id").references(() => assessments.id, { onDelete: "cascade" }),
  itemType: varchar("item_type", { length: 50 }).notNull(),
  prompt: text("prompt").notNull(),
  data: jsonb("data").default({}),
  correctAnswer: jsonb("correct_answer"),
  hints: jsonb("hints").$type<string[]>().default([]),
  skillIds: jsonb("skill_ids").$type<string[]>().default([]),
  points: doublePrecision("points").default(1),
  order: integer("order").notNull().default(0),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assessmentId: uuid("assessment_id").references(() => assessments.id),
  lessonId: uuid("lesson_id").references(() => lessons.id),
  submissionType: varchar("submission_type", { length: 50 }).notNull(),
  answers: jsonb("answers").default({}),
  score: doublePrecision("score"),
  maxScore: doublePrecision("max_score"),
  feedback: text("feedback"),
  helpLevelsUsed: jsonb("help_levels_used").$type<string[]>().default([]),
  state: varchar("state", { length: 30 }).notNull().default("submitted"),
  startedAt: timestamp("started_at"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// ============================================
// MASTERY & PROGRESS
// ============================================
export const masteryRecords = pgTable("mastery_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").references(() => skills.id),
  lessonId: uuid("lesson_id").references(() => lessons.id),
  conceptSlug: varchar("concept_slug", { length: 200 }),
  masteryLevel: integer("mastery_level").notNull().default(0),
  understanding: doublePrecision("understanding"),
  recall: doublePrecision("recall"),
  explanation: doublePrecision("explanation"),
  problemSolving: doublePrecision("problem_solving"),
  application: doublePrecision("application"),
  transfer: doublePrecision("transfer"),
  projectEvidence: doublePrecision("project_evidence"),
  lastAssessmentScore: doublePrecision("last_assessment_score"),
  independentPerformance: doublePrecision("independent_performance"),
  lastRetrievedAt: timestamp("last_retrieved_at"),
  nextReviewAt: timestamp("next_review_at"),
  reviewCount: integer("review_count").default(0),
  failureCount: integer("failure_count").default(0),
  evidenceCount: integer("evidence_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewItems = pgTable("review_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  masteryRecordId: uuid("mastery_record_id").references(() => masteryRecords.id),
  reviewType: varchar("review_type", { length: 50 }).notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  completed: boolean("completed").default(false),
  performance: doublePrecision("performance"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const errorLogs = pgTable("error_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").references(() => lessons.id),
  skillId: uuid("skill_id").references(() => skills.id),
  errorType: varchar("error_type", { length: 50 }).notNull(),
  description: text("description"),
  context: jsonb("context").default({}),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// PROJECTS
// ============================================
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  projectLevel: integer("project_level").notNull(),
  sourceCategory: varchar("source_category", { length: 50 }).notNull().default("original"),
  problemStatement: text("problem_statement"),
  dataSource: text("data_source"),
  dataLicense: varchar("data_license", { length: 100 }),
  requiredTechnologies: jsonb("required_technologies").$type<string[]>().default([]),
  recommendedPrerequisites: jsonb("recommended_prerequisites").$type<string[]>().default([]),
  skillIds: jsonb("skill_ids").$type<string[]>().default([]),
  careerRoles: jsonb("career_roles").$type<string[]>().default([]),
  milestones: jsonb("milestones").default([]),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  acceptanceCriteria: jsonb("acceptance_criteria").$type<string[]>().default([]),
  deliverables: jsonb("deliverables").$type<string[]>().default([]),
  isFlagship: boolean("is_flagship").default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectSubmissions = pgTable("project_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  status: varchar("status", { length: 30 }).notNull().default("planning"),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  deploymentUrl: text("deployment_url"),
  datasetUrl: text("dataset_url"),
  codespaceUrl: text("codespace_url"),
  colabUrl: text("colab_url"),
  kaggleUrl: text("kaggle_url"),
  reportUrl: text("report_url"),
  apiDocsUrl: text("api_docs_url"),
  title: varchar("title", { length: 255 }),
  problemDefinition: text("problem_definition"),
  approach: text("approach"),
  architecture: text("architecture"),
  evaluation: text("evaluation"),
  failureAnalysis: text("failure_analysis"),
  ethicsAnalysis: text("ethics_analysis"),
  monitoringPlan: text("monitoring_plan"),
  startedAt: timestamp("started_at"),
  submittedAt: timestamp("submitted_at"),
  completedAt: timestamp("completed_at"),
  defenseCompleted: boolean("defense_completed").default(false),
  cvEligible: boolean("cv_eligible").default(false),
  cvBullet: text("cv_bullet"),
  mentorFeedback: text("mentor_feedback"),
  rubricScores: jsonb("rubric_scores").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectMilestones = pgTable("project_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectSubmissionId: uuid("project_submission_id").references(() => projectSubmissions.id, { onDelete: "cascade" }),
  milestoneIndex: integer("milestone_index").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const projectEvidence = pgTable("project_evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectSubmissionId: uuid("project_submission_id").references(() => projectSubmissions.id, { onDelete: "cascade" }),
  evidenceType: varchar("evidence_type", { length: 50 }).notNull(),
  url: text("url"),
  description: text("description"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CAREER
// ============================================
export const careerRoles = pgTable("career_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  roleType: varchar("role_type", { length: 30 }).notNull(),
  description: text("description"),
  requirementsHard: jsonb("requirements_hard").$type<string[]>().default([]),
  requirementsPreferred: jsonb("requirements_preferred").$type<string[]>().default([]),
  locationRestrictions: text("location_restrictions"),
  seniority: varchar("seniority", { length: 30 }),
  sourceUrl: text("source_url"),
  sourceAccessedAt: timestamp("source_accessed_at"),
  snapshotDate: timestamp("snapshot_date"),
  status: varchar("status", { length: 30 }).notNull().default("current"),
  skills: jsonb("skills").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const freelanceServices = pgTable("freelance_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  niche: varchar("niche", { length: 100 }),
  deliverables: jsonb("deliverables").$type<string[]>().default([]),
  skills: jsonb("skills").$type<string[]>().default([]),
  typicalQuestions: jsonb("typical_questions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const freelanceSimulations = pgTable("freelance_simulations", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id").references(() => freelanceServices.id),
  clientRequest: text("client_request").notNull(),
  clientContext: jsonb("client_context").default({}),
  expectedQuestions: jsonb("expected_questions").$type<string[]>().default([]),
  acceptanceCriteria: jsonb("acceptance_criteria").$type<string[]>().default([]),
  redFlags: jsonb("red_flags").$type<string[]>().default([]),
  difficulty: varchar("difficulty", { length: 20 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// ENGLISH SYSTEM
// ============================================
export const englishTerms = pgTable("english_terms", {
  id: uuid("id").defaultRandom().primaryKey(),
  term: varchar("term", { length: 255 }).notNull(),
  b1b2Definition: text("b1b2_definition"),
  arabicMeaning: varchar("arabic_meaning", { length: 255 }),
  exampleSentence: text("example_sentence"),
  partOfSpeech: varchar("part_of_speech", { length: 30 }),
  category: varchar("category", { length: 100 }),
  cefrLevel: varchar("cefr_level", { length: 5 }).default("b2"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const speakingAttempts = pgTable("speaking_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  prompt: text("prompt").notNull(),
  transcript: text("transcript"),
  feedback: text("feedback"),
  relatedLessonId: uuid("related_lesson_id").references(() => lessons.id),
  relatedProjectId: uuid("related_project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// AI MENTOR
// ============================================
export const aiThreads = pgTable("ai_threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  contextType: varchar("context_type", { length: 50 }).notNull(),
  contextId: uuid("context_id"),
  specialist: varchar("specialist", { length: 50 }).default("lead_mentor"),
  learningState: varchar("learning_state", { length: 20 }),
  helpLevel: varchar("help_level", { length: 30 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").notNull().references(() => aiThreads.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 30 }).notNull(),
  content: text("content").notNull(),
  specialist: varchar("specialist", { length: 50 }),
  citations: jsonb("citations").$type<Array<{ sourceId?: string; text?: string; url?: string }>>().default([]),
  evidenceUsed: jsonb("evidence_used").default({}),
  modelUsed: varchar("model_used", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiRuns = pgTable("ai_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").notNull().references(() => aiThreads.id, { onDelete: "cascade" }),
  specialist: varchar("specialist", { length: 50 }).notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  latencyMs: integer("latency_ms"),
  modelUsed: varchar("model_used", { length: 100 }),
  status: varchar("status", { length: 30 }).notNull().default("started"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ============================================
// SOURCES
// ============================================
export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: varchar("source_id", { length: 100 }).notNull().unique(),
  url: text("url"),
  title: varchar("title", { length: 500 }).notNull(),
  author: varchar("author", { length: 255 }),
  publisher: varchar("publisher", { length: 255 }),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  license: varchar("license", { length: 100 }),
  publishedAt: timestamp("published_at"),
  accessedAt: timestamp("accessed_at"),
  contentHash: varchar("content_hash", { length: 64 }),
  verificationStatus: varchar("verification_status", { length: 30 }).notNull().default("unverified"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// NOTIFICATIONS / LATER / TASKS
// ============================================
export const laterItems = pgTable("later_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  taskType: varchar("task_type", { length: 50 }).notNull(),
  relatedType: varchar("related_type", { length: 50 }),
  relatedId: uuid("related_id"),
  reason: text("reason"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  estimatedMinutes: integer("estimated_minutes"),
  requiresEvidence: boolean("requires_evidence").default(false),
  helpLevel: varchar("help_level", { length: 30 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// PORTFOLIO
// ============================================
export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectSubmissionId: uuid("project_submission_id").references(() => projectSubmissions.id),
  title: varchar("title", { length: 255 }).notNull(),
  itemType: varchar("item_type", { length: 50 }).notNull(),
  description: text("description"),
  publicUrl: text("public_url"),
  repoUrl: text("repo_url"),
  imageUrl: text("image_url"),
  artifactClass: varchar("artifact_class", { length: 30 }).notNull(),
  evidenceValidated: boolean("evidence_validated").default(false),
  order: integer("order").notNull().default(0),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resumeEvidence = pgTable("resume_evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bulletText: text("bullet_text").notNull(),
  skillIds: jsonb("skill_ids").$type<string[]>().default([]),
  evidenceRefs: jsonb("evidence_refs").$type<Array<{ type: string; id: string; description: string }>>().default([]),
  projectSubmissionId: uuid("project_submission_id").references(() => projectSubmissions.id),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// AUDIT
// ============================================
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }),
  resourceId: uuid("resource_id"),
  metadata: jsonb("metadata").default({}),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// STUDENT PROGRESS TRACKERS
// ============================================
export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  state: varchar("state", { length: 30 }).notNull().default("not_started"),
  contentSeen: boolean("content_seen").default(false),
  practiceCompleted: boolean("practice_completed").default(false),
  transferCompleted: boolean("transfer_completed").default(false),
  recallScore: doublePrecision("recall_score"),
  transferScore: doublePrecision("transfer_score"),
  notebookNotes: text("notebook_notes"),
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  status: varchar("status", { length: 30 }).notNull().default("enrolled"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});
