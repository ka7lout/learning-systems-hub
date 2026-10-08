import {  
  pgTableCreator, 
  uuid, 
  text, 
  integer, 
  boolean, 
  timestamp, 
  decimal, 
  jsonb,
  varchar,
  primaryKey,
  index,
  uniqueIndex
 } from "drizzle-orm/pg-core";

export const pgTable = pgTableCreator((name) => "adaptive_study_v1_" + name);

// ============================================
// USERS & PROFILES
// ============================================
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  displayName: text("display_name"),
  semesterStartDate: timestamp("semester_start_date"),
  availableStudyHoursPerDay: integer("available_study_hours_per_day").default(4),
  focusDurationMinutes: integer("focus_duration_minutes").default(20),
  breakDurationMinutes: integer("break_duration_minutes").default(5),
  audioPreference: text("audio_preference").default("silence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// COURSES & CURRICULUM
// ============================================
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  instructor: text("instructor"),
  credits: integer("credits"),
  referenceBook: text("reference_book"),
  referenceBookEdition: text("reference_book_edition"),
  color: text("color").default("#3B82F6"),
  icon: text("icon"),
  semester: varchar("semester", { length: 20 }),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  syllabusUrl: text("syllabus_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("courses_code_idx").on(table.code),
]);

export const courseSources = pgTable("course_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  fileId: text("file_id"),
  filename: text("filename").notNull(),
  path: text("path"),
  type: varchar("type", { length: 20 }).notNull(), // pdf, pptx, docx, md, image, folder, link
  size: text("size"),
  modifiedAt: timestamp("modified_at"),
  driveUrl: text("drive_url"),
  purpose: text("purpose"), // syllabus, lecture, assignment, quiz, exam, reference, resource
  status: varchar("status", { length: 20 }).default("processed"), // processed, failed, unsupported, needs_ocr
  contentHash: text("content_hash"),
  contentSummary: text("content_summary"),
  extractedText: text("extracted_text"),
  pageCount: integer("page_count"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("course_sources_course_id_idx").on(table.courseId),
  index("course_sources_status_idx").on(table.status),
]);

export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("modules_course_id_idx").on(table.courseId),
]);

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("topics_module_id_idx").on(table.moduleId),
]);

export const concepts = pgTable("concepts", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  topicId: uuid("topic_id").references(() => topics.id),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  simpleExplanation: text("simple_explanation"),
  formalDefinition: text("formal_definition"),
  intuition: text("intuition"),
  visualDescription: text("visual_description"),
  equation: text("equation"),
  workedExample: text("worked_example"),
  keyPoints: jsonb("key_points"), // string[]
  commonMistakes: jsonb("common_mistakes"), // string[]
  difficulty: integer("difficulty").default(1), // 1-5
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("concepts_course_id_idx").on(table.courseId),
  index("concepts_topic_id_idx").on(table.topicId),
]);

export const prerequisites = pgTable("prerequisites", {
  id: uuid("id").primaryKey().defaultRandom(),
  conceptId: uuid("concept_id").notNull().references(() => concepts.id),
  prerequisiteConceptId: uuid("prerequisite_concept_id").notNull().references(() => concepts.id),
}, (table) => [
  uniqueIndex("prerequisites_unique_idx").on(table.conceptId, table.prerequisiteConceptId),
]);

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  conceptId: uuid("concept_id").notNull().references(() => concepts.id),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  objective: text("objective"),
  prerequisiteText: text("prerequisite_text"),
  mission: text("mission"),
  simpleExplanation: text("simple_explanation"),
  formalContent: text("formal_content"),
  visualContent: text("visual_content"),
  equationContent: text("equation_content"),
  workedExample: text("worked_example"),
  guidedPractice: text("guided_practice"),
  independentPractice: text("independent_practice"),
  retrievalPrompt: text("retrieval_prompt"),
  reflection: text("reflection"),
  estimatedMinutes: integer("estimated_minutes").default(15),
  displayOrder: integer("display_order").default(0),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("lessons_concept_id_idx").on(table.conceptId),
  index("lessons_course_id_idx").on(table.courseId),
]);

export const lessonSources = pgTable("lesson_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id),
  sourceId: uuid("source_id").notNull().references((): any => courseSources.id),
  sourceType: text("source_type").notNull(), // lecture, textbook, syllabus, exam, ai_generated
  sourceUrl: text("source_url"),
  pageNumber: integer("page_number"),
  sectionNumber: text("section_number"),
  verificationStatus: varchar("verification_status", { length: 20 }).default("verified"), // verified, unverified
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("lesson_sources_lesson_id_idx").on(table.lessonId),
]);

// ============================================
// ASSESSMENTS & QUESTIONS
// ============================================
export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // quiz, midterm, final, assignment, lab
  sourceType: varchar("source_type", { length: 20 }).default("ai_generated"), // actual_iug, textbook_based, ai_generated, unverified
  weightPercentage: integer("weight_percentage"),
  totalQuestions: integer("total_questions"),
  timeLimitMinutes: integer("time_limit_minutes"),
  dueDate: timestamp("due_date"),
  examDate: timestamp("exam_date"),
  instructions: text("instructions"),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("assessments_course_id_idx").on(table.courseId),
]);

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  conceptId: uuid("concept_id").references(() => concepts.id),
  assessmentId: uuid("assessment_id").references(() => assessments.id),
  type: varchar("type", { length: 20 }).notNull(), // multiple_choice, free_response, fill_blank, code_output, true_false
  difficulty: varchar("difficulty", { length: 10 }).default("normal"), // easy, normal, hard, boss, recovery
  questionText: text("question_text").notNull(),
  options: jsonb("options"), // string[] for MCQ
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  hint1: text("hint_1"),
  hint2: text("hint_2"),
  hint3: text("hint_3"),
  partialSolution: text("partial_solution"),
  fullSolution: text("full_solution"),
  commonErrors: jsonb("common_errors"), // string[]
  skill: text("skill"),
  sourceType: varchar("source_type", { length: 20 }).default("ai_generated"), // actual_iug, textbook_based, ai_generated, unverified
  sourceUrl: text("source_url"),
  validationStatus: varchar("validation_status", { length: 20 }).default("validated"), // validated, pending, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("questions_course_id_idx").on(table.courseId),
  index("questions_concept_id_idx").on(table.conceptId),
]);

export const questionAttempts = pgTable("question_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct").notNull(),
  timeSpentSeconds: integer("time_spent_seconds"),
  hintsUsed: integer("hints_used").default(0),
  attemptNumber: integer("attempt_number").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("question_attempts_user_id_idx").on(table.userId),
  index("question_attempts_question_id_idx").on(table.questionId),
]);

export const mistakes = pgTable("mistakes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  conceptId: uuid("concept_id").references(() => concepts.id),
  questionId: uuid("question_id").references(() => questions.id),
  mistakeType: varchar("mistake_type", { length: 30 }).notNull(), // arithmetic, algebra, conceptual, formula_selection, sign_error, unit_conversion, interpretation, skipped_step, careless_error, python_syntax, python_logic, code_interpretation, circuit_setup, diagram_error
  description: text("description").notNull(),
  studentAnswer: text("student_answer"),
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
  howToRecognize: text("how_to_recognize"),
  repeatCount: integer("repeat_count").default(1),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("mistakes_user_id_idx").on(table.userId),
  index("mistakes_concept_id_idx").on(table.conceptId),
]);

// ============================================
// STUDY SESSIONS & PROGRESS
// ============================================
export const studySessions = pgTable("study_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  courseId: uuid("course_id").references(() => courses.id),
  conceptId: uuid("concept_id").references(() => concepts.id),
  lessonId: uuid("lesson_id").references(() => lessons.id),
  type: varchar("type", { length: 20 }).notNull(), // focus, review, practice, diagnostic
  plannedDurationMinutes: integer("planned_duration_minutes"),
  actualDurationMinutes: integer("actual_duration_minutes"),
  completed: boolean("completed").default(false),
  earlyExit: boolean("early_exit").default(false),
  sessionDate: timestamp("session_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("study_sessions_user_id_idx").on(table.userId),
  index("study_sessions_date_idx").on(table.sessionDate),
]);

export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id),
  status: varchar("status", { length: 20 }).default("not_started"), // not_started, in_progress, completed
  currentStep: integer("current_step").default(0),
  exposureLevel: integer("exposure_level").default(0), // 0-7 mastery levels
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  retrievalScore: decimal("retrieval_score", { precision: 5, scale: 2 }),
  practiceScore: decimal("practice_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("lesson_progress_user_lesson_idx").on(table.userId, table.lessonId),
]);

// ============================================
// REVIEW SYSTEM
// ============================================
export const reviewItems = pgTable("review_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  conceptId: uuid("concept_id").notNull().references(() => concepts.id),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  firstLearned: timestamp("first_learned").defaultNow(),
  lastReviewed: timestamp("last_reviewed"),
  nextReview: timestamp("next_review").defaultNow(),
  intervalDays: integer("interval_days").default(1),
  retrievalScore: decimal("retrieval_score", { precision: 5, scale: 2 }),
  practiceScore: decimal("practice_score", { precision: 5, scale: 2 }),
  confidence: integer("confidence"), // 1-5
  errorCount: integer("error_count").default(0),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("review_items_user_id_idx").on(table.userId),
  index("review_items_next_review_idx").on(table.nextReview),
]);

// ============================================
// DAILY PLANS
// ============================================
export const dailyPlans = pgTable("daily_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  planDate: timestamp("plan_date").notNull(),
  planData: jsonb("plan_data").notNull(), // Array of DailyTask objects
  planType: varchar("plan_type", { length: 20 }).default("adaptive"), // provisional, adaptive
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.5"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("daily_plans_user_date_idx").on(table.userId, table.planDate),
]);

export const dailyPlanTasks = pgTable("daily_plan_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id").notNull().references(() => dailyPlans.id),
  courseId: uuid("course_id").references(() => courses.id),
  conceptId: uuid("concept_id").references(() => concepts.id),
  taskType: varchar("task_type", { length: 20 }).notNull(), // learn, review, practice, assessment, repair
  title: text("title").notNull(),
  description: text("description"),
  estimatedMinutes: integer("estimated_minutes"),
  priority: integer("priority").default(0),
  completed: boolean("completed").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("daily_plan_tasks_plan_id_idx").on(table.planId),
]);

// ============================================
// XP & ACHIEVEMENTS
// ============================================
export const xpTransactions = pgTable("xp_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  eventType: varchar("event_type", { length: 30 }).notNull(), // focus_block_completed, practice_problem_completed, retrieval_completed, concept_mastered, daily_plan_completed, lesson_completed
  sourceId: uuid("source_id"),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("xp_transactions_user_id_idx").on(table.userId),
]);

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  achievementType: varchar("achievement_type", { length: 30 }).notNull(), // first_lesson, first_focus, first_mistake, streak_3, streak_7, streak_30, level_5, level_10, level_20, concept_master_1, concept_master_5, perfect_day
  title: text("title").notNull(),
  description: text("description"),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
}, (table) => [
  index("achievements_user_id_idx").on(table.userId),
]);

// ============================================
// NOTES & SCRATCHPAD
// ============================================
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  courseId: uuid("course_id").references(() => courses.id),
  conceptId: uuid("concept_id").references(() => concepts.id),
  lessonId: uuid("lesson_id").references(() => lessons.id),
  type: varchar("type", { length: 20 }).default("general"), // general, question, lesson, mistake, reminder
  title: text("title"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("notes_user_id_idx").on(table.userId),
]);

export const scratchpads = pgTable("scratchpads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  courseId: uuid("course_id").references(() => courses.id),
  conceptId: uuid("concept_id").references(() => concepts.id),
  data: jsonb("data").default("{}"), // canvas state
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("scratchpads_user_id_idx").on(table.userId),
]);

export const distractions = pgTable("distractions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  converted: boolean("converted").default(false),
  convertedToTaskId: uuid("converted_to_task_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("distractions_user_id_idx").on(table.userId),
]);

// ============================================
// DIAGNOSTIC
// ============================================
export const diagnosticResponses = pgTable("diagnostic_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  domain: varchar("domain", { length: 30 }).notNull(), // algebra, fractions, equations, graph_reading, trigonometry_basics, physics_fundamentals, electrical_fundamentals, programming_logic, basic_python
  questionText: text("question_text").notNull(),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct").notNull(),
  difficultyLevel: integer("difficulty_level").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("diagnostic_responses_user_id_idx").on(table.userId),
]);

// ============================================
// SETTINGS
// ============================================
export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  focusDurationMinutes: integer("focus_duration_minutes").default(20),
  breakDurationMinutes: integer("break_duration_minutes").default(5),
  audioPreference: text("audio_preference").default("silence"),
  theme: text("theme").default("dark"),
  availableStudyHoursPerDay: integer("available_study_hours_per_day").default(4),
  preferredSessionWindows: jsonb("preferred_session_windows"), // string[]
  showProvenance: boolean("show_provenance").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("settings_user_id_idx").on(table.userId),
]);

// ============================================
// ADMIN & AUDIT
// ============================================
export const ingestionRuns = pgTable("ingestion_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  runType: varchar("run_type", { length: 20 }).notNull(), // initial, re_ingest
  status: varchar("status", { length: 20 }).default("running"), // running, completed, failed
  filesFound: integer("files_found").default(0),
  filesProcessed: integer("files_processed").default(0),
  filesFailed: integer("files_failed").default(0),
  filesNeedsOcr: integer("files_needs_ocr").default(0),
  filesUnsupported: integer("files_unsupported").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
}, (table) => [
  index("ingestion_runs_started_at_idx").on(table.startedAt),
]);

export const databaseAuditLog = pgTable("database_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: varchar("action", { length: 30 }).notNull(), // schema_change, data_insert, data_update, data_delete, query
  tableName: varchar("table_name", { length: 50 }),
  details: jsonb("details"),
  performedBy: text("performed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("database_audit_log_created_at_idx").on(table.createdAt),
]);
