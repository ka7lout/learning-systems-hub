import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  real,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// All learner state. Every student-owned row carries userId derived
// server-side from the session — never from the client (spec §189).

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"), // student | admin
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  englishMode: text("english_mode").notNull().default("standard"), // standard | b1b2
  vocabAssist: boolean("vocab_assist").notNull().default(true),
  learningState: text("learning_state").notNull().default("deep"), // deep | drift | fog | overload
  targetRole: text("target_role").notNull().default("nuwave-production-ai-engineer"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Lesson progress: separates "content seen" from "practice completed" (completion ≠ competence).
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug").notNull(),
    moduleSlug: text("module_slug").notNull(),
    contentSeenAt: timestamp("content_seen_at", { withTimezone: true }),
    practiceCompletedAt: timestamp("practice_completed_at", { withTimezone: true }),
    transferCompletedAt: timestamp("transfer_completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (tbl) => [
    uniqueIndex("lesson_progress_user_lesson").on(tbl.userId, tbl.lessonSlug),
    index("lesson_progress_user").on(tbl.userId),
  ]
);

// Free-recall / explain-back / transfer submissions — the real evidence trail.
export const recallSubmissions = pgTable(
  "recall_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug").notNull(),
    kind: text("kind").notNull(), // recall | transfer | case
    prompt: text("prompt").notNull(),
    answer: text("answer").notNull(),
    selfGrade: integer("self_grade"), // 0..5 honest self-assessment
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (tbl) => [index("recall_user").on(tbl.userId)]
);

// Mastery evidence per skill (L0–L9). Append-only evidence records.
export const masteryEvidence = pgTable(
  "mastery_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillSlug: text("skill_slug").notNull(),
    level: integer("level").notNull(), // claimed/demonstrated level 0..9
    evidenceType: text("evidence_type").notNull(), // recall | practice | transfer | project | debugging | oral
    assisted: boolean("assisted").notNull().default(false), // AI-assisted vs independent (spec §225)
    note: text("note"),
    lessonSlug: text("lesson_slug"),
    projectId: uuid("project_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (tbl) => [index("mastery_user_skill").on(tbl.userId, tbl.skillSlug)]
);

// Spaced-review scheduler items (adapted SM-2; difficulty/failure-aware).
export const reviewItems = pgTable(
  "review_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicKey: text("topic_key").notNull(), // lessonSlug:topicSlug
    topicName: text("topic_name").notNull(),
    lessonSlug: text("lesson_slug").notNull(),
    moduleSlug: text("module_slug").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    intervalDays: real("interval_days").notNull().default(1),
    ease: real("ease").notNull().default(2.3),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    lastGrade: integer("last_grade"),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (tbl) => [
    uniqueIndex("review_user_topic").on(tbl.userId, tbl.topicKey),
    index("review_user_due").on(tbl.userId, tbl.dueAt),
  ]
);

// Learner's project instances against the canonical catalog.
export const userProjects = pgTable(
  "user_projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectSlug: text("project_slug").notNull(),
    status: text("status").notNull().default("planned"), // planned | active | submitted | complete
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    datasetSource: text("dataset_source"), // provenance: source + license + date
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (tbl) => [
    uniqueIndex("user_project_unique").on(tbl.userId, tbl.projectSlug),
    index("user_projects_user").on(tbl.userId),
  ]
);

export const projectEvidence = pgTable(
  "project_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userProjectId: uuid("user_project_id")
      .notNull()
      .references(() => userProjects.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // repo | commit | report | deployment | metric | demo | other
    url: text("url"),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (tbl) => [index("evidence_user").on(tbl.userId)]
);

// AI Mentor conversation persistence.
export const mentorMessages = pgTable(
  "mentor_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user | mentor | system
    content: text("content").notNull(),
    lessonSlug: text("lesson_slug"),
    provider: text("provider"), // which backend answered: external model id | "socratic-fallback"
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (tbl) => [index("mentor_user_time").on(tbl.userId, tbl.createdAt)]
);

// Distraction capture — "Later" list (spec §13).
export const laterItems = pgTable(
  "later_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    done: boolean("done").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (tbl) => [index("later_user").on(tbl.userId)]
);
