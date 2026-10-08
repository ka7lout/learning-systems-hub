import { 
  pgTableCreator,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
 } from "drizzle-orm/pg-core";

export const pgTable = pgTableCreator((name) => "ai_learning_geminiflash_" + name);

// ==========================================
// 1. Users & Multi-Tenant Session Isolation
// ==========================================
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("student"), // student | admin | content_editor | reviewer | research_editor | career_editor
  avatar: text("avatar"),
  statePreference: text("state_preference").notNull().default("deep"), // deep | drift | fog | overload
  englishMode: text("english_mode").notNull().default("standard_tech"), // standard_tech | b1_b2 | arabic_assisted | training_mode
  targetRoleId: text("target_role_id").default("navisoft_ai_engineer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 2. Canonical Curriculum & Graph
// ==========================================
export const curriculumNodes = pgTable("curriculum_nodes", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  stage: text("stage").notNull(), // foundations | mathematics | data_systems | machine_learning | deep_learning | modern_ai | ai_systems | research
  sourceCategory: text("source_category").notNull(), // original_curriculum | harvard_college | harvard_extension | industry_extension | research_extension
  moduleNumber: integer("module_number"),
  sessionIndex: integer("session_index"),
  level: text("level").notNull(), // foundational | intermediate | advanced | graduate | research
  prerequisites: jsonb("prerequisites").notNull().default([]), // array of node IDs
  corequisites: jsonb("corequisites").notNull().default([]),
  whyItMatters: text("why_it_matters").notNull(),
  learningObjectives: jsonb("learning_objectives").notNull().default([]),
  skills: jsonb("skills").notNull().default([]),
  mustWriteNotes: jsonb("must_write_notes").notNull().default([]),
  recommendedNotes: jsonb("recommended_notes").notNull().default([]),
  optionalNotes: jsonb("optional_notes").notNull().default([]),
  englishKeywords: jsonb("english_keywords").notNull().default([]),
  sources: jsonb("sources").notNull().default([]), // array of { title, url, verificationStatus, note }
  orderIndex: integer("order_index").notNull().default(0),
  version: text("version").notNull().default("1.0.0"),
  lastVerified: text("last_verified"),
});

export const learningBlocks = pgTable("learning_blocks", {
  id: text("id").primaryKey(),
  nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // orientation | lecture | worked_example | guided_section | problem_set | transfer_task | case_study | debugging_lab | viva_prompt
  title: text("title").notNull(),
  content: text("content").notNull(),
  codeSnippet: text("code_snippet"),
  language: text("language").default("python"),
  starterCode: text("starter_code"),
  solutionCode: text("solution_code"),
  testCases: jsonb("test_cases").notNull().default([]),
  hints: jsonb("hints").notNull().default([]),
  metadata: jsonb("metadata").notNull().default({}),
  orderIndex: integer("order_index").notNull().default(0),
});

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  prerequisites: jsonb("prerequisites").notNull().default([]),
  careerRoles: jsonb("career_roles").notNull().default([]),
});

// ==========================================
// 3. User Progress, Mastery & Review Engine
// ==========================================
export const userProgress = pgTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("available"), // locked | available | in_progress | completed | mastered
  completionPct: integer("completion_pct").notNull().default(0),
  masteryLevel: integer("mastery_level").notNull().default(0), // 0 to 9 (L0 - L9)
  completedBlocks: jsonb("completed_blocks").notNull().default([]),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const masteryRecords = pgTable("mastery_records", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
  skillId: text("skill_id"),
  taskType: text("task_type").notNull(), // recall | derivation | code | debugging | transfer | viva | case
  understandingScore: integer("understanding_score").notNull().default(0), // 0 - 10
  recallScore: integer("recall_score").notNull().default(0),
  explanationScore: integer("explanation_score").notNull().default(0),
  problemSolvingScore: integer("problem_solving_score").notNull().default(0),
  transferScore: integer("transfer_score").notNull().default(0),
  helpLevelUsed: text("help_level_used").notNull().default("no_help"), // no_help | hint | guidance | concept_reminder | worked_example | full_explanation
  isIndependent: boolean("is_independent").notNull().default(true),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewItems = pgTable("review_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull().references(() => curriculumNodes.id, { onDelete: "cascade" }),
  concept: text("concept").notNull(),
  prompt: text("prompt").notNull(),
  idealAnswer: text("ideal_answer").notNull(),
  activityType: text("activity_type").notNull().default("free_recall"), // free_recall | code_predict | error_diagnosis | transfer_check
  nextReviewDate: timestamp("next_review_date").notNull(),
  intervalDays: integer("interval_days").notNull().default(1),
  repetitions: integer("repetitions").notNull().default(0),
  easeFactor: doublePrecision("ease_factor").notNull().default(2.5),
  failureCount: integer("failure_count").notNull().default(0),
  lastReviewedAt: timestamp("last_reviewed_at"),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  reasonType: text("reason_type").notNull(), // prerequisite_gap | skill_gap | project_milestone | review_due | interview_prep | state_adaptation
  nodeId: text("node_id"),
  priority: text("priority").notNull().default("medium"), // low | medium | high | critical
  difficulty: text("difficulty").notNull().default("intermediate"), // beginner | intermediate | advanced | research
  status: text("status").notNull().default("pending"), // pending | in_progress | completed | dismissed
  outputArtifact: text("output_artifact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ==========================================
// 4. Projects & Evidence Engine
// ==========================================
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(), // computer_vision | nlp_llm | tabular_ml | data_engineering | production_systems | research
  ladderLevel: integer("ladder_level").notNull().default(1), // 1 to 10
  isOriginalCatalog: boolean("is_original_catalog").notNull().default(true),
  catalogIndex: integer("catalog_index"),
  description: text("description").notNull(),
  whyImportant: text("why_important").notNull(),
  datasetName: text("dataset_name"),
  datasetUrl: text("dataset_url"),
  datasetLicense: text("dataset_license"),
  requirements: jsonb("requirements").notNull().default([]),
  acceptanceCriteria: jsonb("acceptance_criteria").notNull().default([]),
  starterCode: text("starter_code"),
  architectureDiagram: text("architecture_diagram"),
  suggestedMilestones: jsonb("suggested_milestones").notNull().default([]),
  rubric: jsonb("rubric").notNull().default({}),
});

export const userProjects = pgTable("user_projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("not_started"), // not_started | in_progress | submitted | reviewed | published
  evidenceLevel: text("evidence_level").notNull().default("practice"), // practice | skill_evidence | technical_artifact | portfolio_project | professional_evidence | signature_project
  githubRepo: text("github_repo"),
  commitHash: text("commit_hash"),
  colabUrl: text("colab_url"),
  codespacesUrl: text("codespaces_url"),
  deploymentUrl: text("deployment_url"),
  reportMarkdown: text("report_markdown"),
  completedMilestones: jsonb("completed_milestones").notNull().default([]),
  evaluationScore: integer("evaluation_score"),
  evaluatorFeedback: text("evaluator_feedback"),
  isPortfolioVisible: boolean("is_portfolio_visible").default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ==========================================
// 5. AI Mentor Council & Chat System
// ==========================================
export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id"),
  specialistPersona: text("specialist_persona").notNull().default("lead_mentor"),
  threadTitle: text("thread_title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiMessages = pgTable("ai_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => aiConversations.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(), // user | mentor | specialist | system
  persona: text("persona").notNull(),
  content: text("content").notNull(),
  helpLevel: text("help_level").default("no_help"),
  thoughtProcess: text("thought_process"),
  evidenceRefs: jsonb("evidence_refs").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 6. Career Roles, Freelancing & English
// ==========================================
export const careerRoles = pgTable("career_roles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  archetype: text("archetype").notNull(), // navisoft_ai_engineer | nuwave_production_engineer | ml_systems_engineer | applied_ai_researcher
  description: text("description").notNull(),
  requiredSkills: jsonb("required_skills").notNull().default([]),
  preferredSkills: jsonb("preferred_skills").notNull().default([]),
  seniority: text("seniority").notNull(),
  typicalTasks: jsonb("typical_tasks").notNull().default([]),
  flagshipProjects: jsonb("flagship_projects").notNull().default([]),
  interviewDomains: jsonb("interview_domains").notNull().default([]),
  lastVerified: text("last_verified"),
});

export const freelanceSimulations = pgTable("freelance_simulations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scenarioSlug: text("scenario_slug").notNull(),
  clientName: text("client_name").notNull(),
  clientBrief: text("client_brief").notNull(),
  conversationHistory: jsonb("conversation_history").notNull().default([]),
  proposalMarkdown: text("proposal_markdown"),
  scopeOfWork: text("scope_of_work"),
  estimatedBudget: integer("estimated_budget"),
  status: text("status").notNull().default("discovery"), // discovery | proposal_submitted | accepted | revision_requested | rejected
  score: integer("score"),
  coachFeedback: text("coach_feedback"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const englishTerms = pgTable("english_terms", {
  id: text("id").primaryKey(),
  term: text("term").notNull().unique(),
  category: text("category").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
  b1b2Definition: text("b1_b2_definition").notNull(),
  technicalDefinition: text("technical_definition").notNull(),
  arabicMeaning: text("arabic_meaning").notNull(),
  pronunciationIpa: text("pronunciation_ipa").notNull(),
  exampleSentence: text("example_sentence").notNull(),
  commonMistakes: text("common_mistakes"),
});

export const speakingSubmissions = pgTable("speaking_submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id"),
  promptType: text("prompt_type").notNull(), // concept_defense | architecture_oral | bug_diagnosis | client_discovery | interview_question
  promptText: text("prompt_text").notNull(),
  transcript: text("transcript").notNull(),
  fluencyScore: integer("fluency_score").notNull().default(0),
  terminologyScore: integer("terminology_score").notNull().default(0),
  clarityScore: integer("clarity_score").notNull().default(0),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const laterItems = pgTable("later_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  note: text("note"),
  status: text("status").notNull().default("saved"), // saved | processed | discarded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
