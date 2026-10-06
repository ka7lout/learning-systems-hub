import { pgTable, text, integer, timestamp, jsonb, boolean, real, serial, primaryKey, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // sha256 of token
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export type Settings = {
  theme: "light" | "dark" | "system";
  uiLanguage: "en" | "ar";
  contentMode: "standard" | "b1b2" | "arabic";
  vocabAssist: boolean;
  englishTraining: boolean;
  density: "comfortable" | "compact";
  textSize: "base" | "lg";
  reducedMotion: boolean;
  hintPolicy: "attempt_first" | "on_request";
  targetRoles: string[];
  studyState: "deep" | "drift" | "fog" | "overload";
};

export const settings = pgTable("settings", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<Settings>().notNull(),
  diagnosticDone: boolean("diagnostic_done").default(false).notNull(),
});

export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  sourceType: text("source_type").notNull(),
  term: text("term"),
  verificationStatus: text("verification_status").notNull(),
  accessedAt: text("accessed_at").notNull(),
  notes: text("notes"),
});

export const nodes = pgTable("curriculum_nodes", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // module | unit | course
  parentId: text("parent_id"),
  spine: text("spine").notNull(),
  title: text("title").notNull(),
  sourceCategory: text("source_category").notNull(),
  tier: text("tier").notNull(),
  level: text("level").notNull(),
  sessions: integer("sessions"),
  sortOrder: integer("sort_order").notNull(),
  why: text("why").notNull(),
  topics: jsonb("topics").$type<string[]>().notNull(),
  objectives: jsonb("objectives").$type<string[]>().notNull(),
  mustWrite: jsonb("must_write").$type<string[]>().notNull(),
  masteryCriteria: jsonb("mastery_criteria").$type<string[]>().notNull(),
  prerequisites: jsonb("prerequisites").$type<string[]>().notNull(),
  skills: jsonb("skills").$type<string[]>().notNull(),
  sourceRefs: jsonb("source_refs").$type<string[]>().notNull(),
  version: integer("version").notNull().default(1),
  lastVerified: text("last_verified"),
});

export const mappings = pgTable("harvard_mappings", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull(),
  course: text("course").notNull(),
  institution: text("institution").notNull(),
  status: text("status").notNull(),
  match: text("match").notNull(),
  adds: text("adds").notNull(),
  sourceId: text("source_id"),
});

export const practiceItems = pgTable("practice_items", {
  id: text("id").primaryKey(),
  nodeId: text("node_id").notNull(),
  taskType: text("task_type").notNull(),
  difficulty: text("difficulty").notNull(), // A-F
  stage: text("stage").notNull(), // recall | application | transfer | case
  prompt: text("prompt").notNull(),
  keyPoints: jsonb("key_points").$type<string[]>().notNull(),
  modelAnswer: text("model_answer").notNull(),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull(),
  nodeId: text("node_id").notNull(),
  response: text("response").notNull(),
  helpLevel: text("help_level").notNull(),
  score: real("score").notNull(),
  grader: text("grader").notNull(), // self | ai
  errorType: text("error_type"),
  feedback: text("feedback"),
  studyState: text("study_state"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("attempts_owner_idx").on(t.ownerId)]);

export const mastery = pgTable("mastery_records", {
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull(),
  level: integer("level").notNull().default(0),
  recall: real("recall").notNull().default(0),
  application: real("application").notNull().default(0),
  transfer: real("transfer").notNull().default(0),
  independentCount: integer("independent_count").notNull().default(0),
  assistedCount: integer("assisted_count").notNull().default(0),
  contentSeen: boolean("content_seen").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.ownerId, t.nodeId] })]);

export const reviews = pgTable("review_items", {
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull(),
  dueAt: timestamp("due_at").notNull(),
  intervalDays: real("interval_days").notNull(),
  lapses: integer("lapses").notNull().default(0),
  reps: integer("reps").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.ownerId, t.nodeId] })]);

export const projectCatalog = pgTable("project_catalog", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  ladderLevel: integer("ladder_level").notNull(),
  origin: text("origin").notNull(),
  brief: text("brief").notNull(),
  nodeIds: jsonb("node_ids").$type<string[]>().notNull(),
  skills: jsonb("skills").$type<string[]>().notNull(),
  dataGuidance: text("data_guidance").notNull(),
  milestones: jsonb("milestones").$type<string[]>().notNull(),
});

export const userProjects = pgTable("user_projects", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  catalogId: text("catalog_id").notNull(),
  status: text("status").notNull().default("active"),
  links: jsonb("links").$type<Record<string, string>>().notNull(),
  milestonesDone: jsonb("milestones_done").$type<number[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evidence = pgTable("project_evidence", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userProjectId: integer("user_project_id"),
  skillId: text("skill_id"),
  kind: text("kind").notNull(),
  url: text("url"),
  description: text("description").notNull(),
  cvTier: text("cv_tier").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(),
  nodeIds: jsonb("node_ids").$type<string[]>().notNull(),
});

export const careerRoles = pgTable("career_roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sourceUrl: text("source_url").notNull(),
  status: text("status").notNull(),
  snapshotDate: text("snapshot_date").notNull(),
  hard: jsonb("hard").$type<string[]>().notNull(),
  preferred: jsonb("preferred").$type<string[]>().notNull(),
  notes: text("notes").notNull(),
});

export const englishTerms = pgTable("english_terms", {
  term: text("term").primaryKey(),
  simple: text("simple").notNull(),
  arabic: text("arabic").notNull(),
  example: text("example").notNull(),
});

export const englishAttempts = pgTable("english_attempts", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activity: text("activity").notNull(),
  dimension: text("dimension").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id"),
  role: text("role").notNull(),
  specialist: text("specialist"),
  content: text("content").notNull(),
  model: text("model"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("ai_owner_idx").on(t.ownerId)]);

export const laterItems = pgTable("later_items", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start").notNull(),
});
