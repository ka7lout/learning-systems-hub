import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const learners = pgTable("learners", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  targetRole: varchar("target_role", { length: 180 }).notNull(),
  preferredLanguage: varchar("preferred_language", { length: 24 }).default("en").notNull(),
  learningState: varchar("learning_state", { length: 24 }).default("deep").notNull(),
  ...timestamps,
}, (table) => ({
  emailIdx: uniqueIndex("learners_email_idx").on(table.email),
}));

export const curriculumNodes = pgTable("curriculum_nodes", {
  id: varchar("id", { length: 100 }).primaryKey(),
  parentId: varchar("parent_id", { length: 100 }),
  title: varchar("title", { length: 180 }).notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  sourceCategory: varchar("source_category", { length: 40 }).notNull(),
  status: varchar("status", { length: 32 }).default("published").notNull(),
  level: varchar("level", { length: 32 }).notNull(),
  description: text("description").notNull(),
  topics: jsonb("topics").$type<string[]>().notNull(),
  objectives: jsonb("objectives").$type<string[]>().notNull(),
  prerequisites: jsonb("prerequisites").$type<string[]>().notNull(),
  masteryCriteria: jsonb("mastery_criteria").$type<string[]>().notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
  sequence: integer("sequence").notNull(),
  ...timestamps,
});

export const skills = pgTable("skills", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  domain: varchar("domain", { length: 80 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 32 }).default("developing").notNull(),
  evidenceCount: integer("evidence_count").default(0).notNull(),
  ...timestamps,
});

export const projects = pgTable("projects", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  level: integer("level").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  evidenceType: varchar("evidence_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 32 }).default("not_started").notNull(),
  sourcePolicy: text("source_policy").notNull(),
  ...timestamps,
});

export const projectMilestones = pgTable("project_milestones", {
  id: varchar("id", { length: 120 }).primaryKey(),
  projectId: varchar("project_id", { length: 100 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  status: varchar("status", { length: 32 }).default("todo").notNull(),
  ...timestamps,
});

export const learningSessions = pgTable("learning_sessions", {
  id: varchar("id", { length: 120 }).primaryKey(),
  learnerId: varchar("learner_id", { length: 64 }).notNull(),
  nodeId: varchar("node_id", { length: 100 }).notNull(),
  state: varchar("state", { length: 24 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  qualitySignal: integer("quality_signal"),
  ...timestamps,
});

export const assessmentSubmissions = pgTable("assessment_submissions", {
  id: varchar("id", { length: 120 }).primaryKey(),
  learnerId: varchar("learner_id", { length: 64 }).notNull(),
  nodeId: varchar("node_id", { length: 100 }).notNull(),
  taskType: varchar("task_type", { length: 40 }).notNull(),
  response: text("response").notNull(),
  score: integer("score"),
  helpLevel: varchar("help_level", { length: 40 }).default("no_help").notNull(),
  independent: boolean("independent").default(true).notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const masteryRecords = pgTable("mastery_records", {
  id: varchar("id", { length: 120 }).primaryKey(),
  learnerId: varchar("learner_id", { length: 64 }).notNull(),
  nodeId: varchar("node_id", { length: 100 }).notNull(),
  completion: integer("completion").default(0).notNull(),
  recall: integer("recall").default(0).notNull(),
  transfer: integer("transfer").default(0).notNull(),
  implementation: integer("implementation").default(0).notNull(),
  delayedRetention: integer("delayed_retention").default(0).notNull(),
  evidenceLevel: varchar("evidence_level", { length: 40 }).default("starting").notNull(),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  learnerNodeIdx: uniqueIndex("mastery_learner_node_idx").on(table.learnerId, table.nodeId),
}));

export const reviewItems = pgTable("review_items", {
  id: varchar("id", { length: 120 }).primaryKey(),
  learnerId: varchar("learner_id", { length: 64 }).notNull(),
  nodeId: varchar("node_id", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  taskType: varchar("task_type", { length: 40 }).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  priority: varchar("priority", { length: 20 }).default("normal").notNull(),
  status: varchar("status", { length: 24 }).default("due").notNull(),
  ...timestamps,
});

export const sources = pgTable("sources", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  publisher: varchar("publisher", { length: 160 }).notNull(),
  url: text("url").notNull(),
  sourceType: varchar("source_type", { length: 48 }).notNull(),
  verificationStatus: varchar("verification_status", { length: 32 }).notNull(),
  accessedAt: timestamp("accessed_at", { withTimezone: true }).notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const mentorThreads = pgTable("mentor_threads", {
  id: varchar("id", { length: 120 }).primaryKey(),
  learnerId: varchar("learner_id", { length: 64 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  specialist: varchar("specialist", { length: 60 }).default("lead_mentor").notNull(),
  ...timestamps,
});

export const mentorMessages = pgTable("mentor_messages", {
  id: varchar("id", { length: 120 }).primaryKey(),
  threadId: varchar("thread_id", { length: 120 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  helpLevel: varchar("help_level", { length: 40 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const careerRoles = pgTable("career_roles", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  track: varchar("track", { length: 80 }).notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements").$type<string[]>().notNull(),
  sourceStatus: varchar("source_status", { length: 32 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull(),
});

export const englishTerms = pgTable("english_terms", {
  id: varchar("id", { length: 100 }).primaryKey(),
  term: varchar("term", { length: 100 }).notNull(),
  definition: text("definition").notNull(),
  arabicMeaning: text("arabic_meaning"),
  example: text("example").notNull(),
  domain: varchar("domain", { length: 80 }).notNull(),
  ...timestamps,
});

export const laterItems = pgTable("later_items", {
  id: varchar("id", { length: 120 }).primaryKey(),
  learnerId: varchar("learner_id", { length: 64 }).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  status: varchar("status", { length: 24 }).default("open").notNull(),
  ...timestamps,
});

export type Learner = typeof learners.$inferSelect;
export type CurriculumNode = typeof curriculumNodes.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type ReviewItem = typeof reviewItems.$inferSelect;
export type MasteryRecord = typeof masteryRecords.$inferSelect;
export type Source = typeof sources.$inferSelect;
