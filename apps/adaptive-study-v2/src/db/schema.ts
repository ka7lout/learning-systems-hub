// IUG Adaptive Study OS — Database schema (Drizzle ORM, PostgreSQL)
//
// NOTE ON TRUTHFULNESS:
// This schema is created for the LOCAL PostgreSQL instance that backs this
// application (per the platform's DATABASE_URL). The external Supabase project
// and Google Drive referenced in the brief could NOT be reached from this
// environment, so no data from them is fabricated. Where curriculum rows are
// seeded, they are explicitly marked provenance = 'student_supplied_provisional'
// and verification_status = 'unverified' because they have not yet been verified
// against the student's actual Google Drive source.

import {
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  boolean,
  numeric,
  jsonb,
  date,
  index,
} from "drizzle-orm/pg-core";

const id = uuid("id").defaultRandom().primaryKey();
const createdAt = timestamp("created_at").defaultNow().notNull();

// ---------------------------------------------------------------------------
// AUTH / PROFILE
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id,
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  createdAt,
});

export const sessions = pgTable(
  "sessions",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  focusMinutes: integer("focus_minutes").default(20).notNull(),
  breakMinutes: integer("break_minutes").default(5).notNull(),
  audioPref: text("audio_pref").default("none").notNull(), // none|white|pink|brown
  theme: text("theme").default("dark").notNull(),
  availableHours: numeric("available_hours").default("4").notNull(),
  sessionWindows: text("session_windows"), // free text, optional
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// CURRICULUM (shared across users; seeded from student-supplied provisional text)
// ---------------------------------------------------------------------------

export const courses = pgTable("courses", {
  id,
  code: text("code").notNull(),
  title: text("title").notNull(),
  referenceText: text("reference_text"),
  credits: numeric("credits"),
  color: text("color").default("#64748b").notNull(),
  semesterStart: date("semester_start"),
  semesterEnd: date("semester_end"),
  provenance: text("provenance").default("student_supplied_provisional").notNull(),
  verificationStatus: text("verification_status").default("unverified").notNull(),
  position: integer("position").default(0).notNull(),
  createdAt,
});

export const modules = pgTable("modules", {
  id,
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").default(0).notNull(),
});

export const topics = pgTable("topics", {
  id,
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  position: integer("position").default(0).notNull(),
});

export const concepts = pgTable("concepts", {
  id,
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  summary: text("summary"),
  position: integer("position").default(0).notNull(),
});

export const prerequisites = pgTable("prerequisites", {
  id,
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "cascade" }),
  dependsOnId: uuid("depends_on_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "cascade" }),
});

export const lessons = pgTable(
  "lessons",
  {
    id,
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    mission: text("mission"),
    objective: text("objective"),
    prerequisiteText: text("prerequisite_text"),
    simpleExplanation: text("simple_explanation"),
    analogy: text("analogy"),
    formalDefinition: text("formal_definition"),
    equation: text("equation"),
    workedExample: text("worked_example"),
    guidedPractice: text("guided_practice"),
    independentPractice: text("independent_practice"),
    retrievalPrompt: text("retrieval_prompt"),
    reflection: text("reflection"),
    reviewSchedule: text("review_schedule"),
    // PROVENANCE (mandatory per brief)
    sourceDoc: text("source_doc"),
    sourcePage: text("source_page"),
    sourceSection: text("source_section"),
    origin: text("origin").default("ai_explanation").notNull(), // official|ai_explanation|ai_practice|unverified
    generatedByAi: boolean("generated_by_ai").default(true).notNull(),
    verificationStatus: text("verification_status").default("unverified").notNull(),
    position: integer("position").default(0).notNull(),
    createdAt,
  },
  (t) => [
    index("lessons_course_idx").on(t.courseId),
    index("lessons_concept_idx").on(t.conceptId),
  ],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: text("status").default("not_started").notNull(), // not_started|in_progress|completed
    masteryLevel: integer("mastery_level").default(0).notNull(), // 0..7
    lastViewed: timestamp("last_viewed"),
    completedAt: timestamp("completed_at"),
    createdAt,
  },
  (t) => [
    index("lp_user_idx").on(t.userId),
    index("lp_lesson_idx").on(t.lessonId),
  ],
);

export const assessments = pgTable("assessments", {
  id,
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").default("exam").notNull(), // quiz|midterm|final|assignment
  weight: numeric("weight"), // percentage, real only if verified
  examDate: date("exam_date"), // NULL => "Not available"
  coverageText: text("coverage_text"),
  provenance: text("provenance").default("student_supplied_provisional").notNull(),
  verificationStatus: text("verification_status").default("unverified").notNull(),
  createdAt,
});

export const questions = pgTable(
  "questions",
  {
    id,
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    difficulty: text("difficulty").default("normal").notNull(), // easy|normal|hard|boss|recovery
    skill: text("skill"),
    questionText: text("question_text").notNull(),
    answer: text("answer"),
    solution: text("solution"),
    commonErrors: text("common_errors"),
    // SOURCE CLASSIFICATION (mandatory per brief)
    sourceLabel: text("source_label").default("AI_GENERATED").notNull(), // ACTUAL_IUG|TEXTBOOK|AI_GENERATED|UNVERIFIED
    sourceDoc: text("source_doc"),
    origin: text("origin").default("ai_practice").notNull(),
    verificationStatus: text("verification_status").default("unverified").notNull(),
    createdAt,
  },
  (t) => [index("questions_course_idx").on(t.courseId)],
);

export const questionAttempts = pgTable(
  "question_attempts",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    correct: boolean("correct").notNull(),
    studentAnswer: text("student_answer"),
    timeMs: integer("time_ms"),
    createdAt,
  },
  (t) => [index("qa_user_idx").on(t.userId)],
);

export const mistakes = pgTable(
  "mistakes",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
    questionId: uuid("question_id").references(() => questions.id, { onDelete: "set null" }),
    mistakeType: text("mistake_type"), // arithmetic|algebra|conceptual|...
    studentAnswer: text("student_answer"),
    correctAnswer: text("correct_answer"),
    explanation: text("explanation"),
    repeatCount: integer("repeat_count").default(1).notNull(),
    createdAt,
  },
  (t) => [index("mistakes_user_idx").on(t.userId)],
);

export const reviewItems = pgTable(
  "review_items",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    firstLearned: timestamp("first_learned"),
    lastReviewed: timestamp("last_reviewed"),
    retrievalScore: numeric("retrieval_score"),
    practiceScore: numeric("practice_score"),
    confidence: integer("confidence").default(0).notNull(),
    errorCount: integer("error_count").default(0).notNull(),
    nextReview: timestamp("next_review"),
    createdAt,
  },
  (t) => [index("review_user_idx").on(t.userId)],
);

export const studySessions = pgTable(
  "study_sessions",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    durationMinutes: integer("duration_minutes"),
    focusBlock: boolean("focus_block").default(false).notNull(),
    earlyExit: boolean("early_exit").default(false).notNull(),
    distractionCount: integer("distraction_count").default(0).notNull(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [index("ss_user_idx").on(t.userId)],
);

export const dailyPlans = pgTable("daily_plans", {
  id,
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planDate: date("plan_date").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  confidence: text("confidence").default("provisional").notNull(), // provisional|adaptive
  note: text("note"),
  isProvisional: boolean("is_provisional").default(true).notNull(),
});

export const dailyPlanTasks = pgTable("daily_plan_tasks", {
  id,
  planId: uuid("plan_id")
    .notNull()
    .references(() => dailyPlans.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  kind: text("kind").default("now").notNull(), // now|after|review|optional
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  questionId: uuid("question_id").references(() => questions.id, { onDelete: "set null" }),
  durationMinutes: integer("duration_minutes"),
  done: boolean("done").default(false).notNull(),
  position: integer("position").default(0).notNull(),
});

export const notes = pgTable(
  "notes",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
    type: text("type").default("short").notNull(), // short|question|lesson|mistake
    body: text("body").notNull(),
    createdAt,
  },
  (t) => [index("notes_user_idx").on(t.userId)],
);

export const distractions = pgTable(
  "distractions",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    capturedAt: timestamp("captured_at").defaultNow().notNull(),
    disposition: text("disposition").default("save").notNull(), // save|delete|task|ignore
    resolved: boolean("resolved").default(false).notNull(),
  },
  (t) => [index("distractions_user_idx").on(t.userId)],
);

export const scratchpads = pgTable(
  "scratchpads",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    questionId: uuid("question_id").references(() => questions.id, { onDelete: "set null" }),
    data: jsonb("data"), // canvas strokes / text
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("scratch_user_idx").on(t.userId)],
);

export const xpTransactions = pgTable(
  "xp_transactions",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(), // focus_block|practice|retrieval|concept_mastery|daily_plan
    sourceId: text("source_id"),
    amount: integer("amount").notNull(),
    createdAt,
  },
  (t) => [index("xp_user_idx").on(t.userId)],
);

export const achievements = pgTable("achievements", {
  id,
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const diagnosticResponses = pgTable(
  "diagnostic_responses",
  {
    id,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    question: text("question").notNull(),
    response: text("response").notNull(),
    correct: boolean("correct").notNull(),
    score: integer("score").notNull(),
    createdAt,
  },
  (t) => [index("diag_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// SOURCE INVENTORY (truthful record of what was / was not ingested)
// ---------------------------------------------------------------------------

export const sourceInventory = pgTable("source_inventory", {
  id,
  fileId: text("file_id"),
  filename: text("filename"),
  path: text("path"),
  type: text("type"),
  size: text("size"),
  modifiedAt: text("modified_at"),
  course: text("course"),
  purpose: text("purpose"),
  status: text("status").default("pending").notNull(), // processed|failed|unsupported|needs_ocr|unavailable
  sourceUrl: text("source_url"),
  contentHash: text("content_hash"),
  processedAt: timestamp("processed_at"),
});
