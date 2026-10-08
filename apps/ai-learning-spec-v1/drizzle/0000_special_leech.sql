CREATE TABLE "ai_learning_spec_v1_assessment_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"lesson_key" text NOT NULL,
	"type" text NOT NULL,
	"stage" text DEFAULT 'recall' NOT NULL,
	"difficulty" text DEFAULT 'B' NOT NULL,
	"prompt" text NOT NULL,
	"context" text,
	"options" jsonb,
	"answer_key" text,
	"rubric" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skill_keys" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"item_key" text NOT NULL,
	"lesson_key" text NOT NULL,
	"response_text" text DEFAULT '' NOT NULL,
	"selected_option" integer,
	"help_level" text DEFAULT 'no_help' NOT NULL,
	"self_rating" integer,
	"outcome" text DEFAULT 'submitted' NOT NULL,
	"error_class" text,
	"independent" boolean DEFAULT true NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_career_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"source_url" text,
	"verification_status" text DEFAULT 'likely_not_verified' NOT NULL,
	"snapshot_date" text NOT NULL,
	"region" text DEFAULT 'unspecified' NOT NULL,
	"seniority" text DEFAULT 'unspecified' NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"track_key" text NOT NULL,
	"title" text NOT NULL,
	"source_category" text NOT NULL,
	"level" text DEFAULT 'CORE' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"learning_objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mastery_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estimated_hours" integer DEFAULT 10 NOT NULL,
	"weekly_workload" text DEFAULT '4-6 h/week' NOT NULL,
	"learning_mode" text DEFAULT 'lecture + problem set + project' NOT NULL,
	"source_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"verification_status" text DEFAULT 'design_decision' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"last_verified" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_english_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dimension" text NOT NULL,
	"activity" text NOT NULL,
	"prompt_key" text,
	"response" text DEFAULT '' NOT NULL,
	"mode" text DEFAULT 'text' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_english_terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" text NOT NULL,
	"simple_definition" text NOT NULL,
	"arabic" text DEFAULT '' NOT NULL,
	"example" text DEFAULT '' NOT NULL,
	"domain" text DEFAULT 'ai-engineering' NOT NULL,
	"collocations" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_freelance_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scenario_key" text NOT NULL,
	"questions_asked" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"proposal" text DEFAULT '' NOT NULL,
	"coverage" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_freelance_scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"client_message" text NOT NULL,
	"hidden_constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deliverable_rubric" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_later_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"text" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_lesson_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"lesson_key" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"content_seen_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recall_score" real DEFAULT 0 NOT NULL,
	"transfer_score" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"course_key" text NOT NULL,
	"title" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"why" text DEFAULT '' NOT NULL,
	"objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notebook" jsonb DEFAULT '{"mustWrite":[],"recommended":[],"optional":[]}'::jsonb NOT NULL,
	"skill_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_category" text DEFAULT 'Original Curriculum' NOT NULL,
	"source_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estimated_minutes" integer DEFAULT 45 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_mastery_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"skill_key" text NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"recall" real DEFAULT 0 NOT NULL,
	"application" real DEFAULT 0 NOT NULL,
	"transfer" real DEFAULT 0 NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"independent_evidence" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_mentor_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"thread_id" integer NOT NULL,
	"role" text NOT NULL,
	"specialist" text,
	"content" text NOT NULL,
	"provider" text,
	"help_level" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_mentor_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text DEFAULT 'New conversation' NOT NULL,
	"lesson_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_prerequisites" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_key" text NOT NULL,
	"requires_course_key" text NOT NULL,
	"kind" text DEFAULT 'prerequisite' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_project_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"ladder_level" integer DEFAULT 1 NOT NULL,
	"source_category" text DEFAULT 'Original Curriculum' NOT NULL,
	"brief" text DEFAULT '' NOT NULL,
	"data_policy" text DEFAULT '' NOT NULL,
	"suggested_data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"milestones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"definition_of_done" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skill_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence_class" text DEFAULT 'Portfolio Project' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_project_evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_project_id" integer NOT NULL,
	"kind" text NOT NULL,
	"url" text,
	"description" text DEFAULT '' NOT NULL,
	"skill_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_review_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"lesson_key" text NOT NULL,
	"item_key" text NOT NULL,
	"activity_type" text DEFAULT 'free_recall' NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"interval_days" real DEFAULT 1 NOT NULL,
	"ease" real DEFAULT 2.3 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"importance" integer DEFAULT 2 NOT NULL,
	"last_result" text
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_role_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_key" text NOT NULL,
	"skill_key" text NOT NULL,
	"importance" text DEFAULT 'hard' NOT NULL,
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_sessions" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'engineering' NOT NULL,
	"kind" text DEFAULT 'discipline' NOT NULL,
	"description" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"publisher" text,
	"source_type" text DEFAULT 'web' NOT NULL,
	"verification_status" text DEFAULT 'likely_not_verified' NOT NULL,
	"accessed_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_study_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"state" text DEFAULT 'deep' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_user_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_key" text NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"repo_url" text,
	"demo_url" text,
	"dataset_url" text,
	"report_url" text,
	"notes" text DEFAULT '' NOT NULL,
	"milestone_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dod_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_spec_v1_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_attempts" ADD CONSTRAINT "ai_learning_spec_v1_attempts_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_english_activities" ADD CONSTRAINT "ai_learning_spec_v1_english_activities_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_freelance_attempts" ADD CONSTRAINT "ai_learning_spec_v1_freelance_attempts_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_later_items" ADD CONSTRAINT "ai_learning_spec_v1_later_items_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_lesson_progress" ADD CONSTRAINT "ai_learning_spec_v1_lesson_progress_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_mastery_records" ADD CONSTRAINT "ai_learning_spec_v1_mastery_records_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_mentor_messages" ADD CONSTRAINT "ai_learning_spec_v1_mentor_messages_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_mentor_messages" ADD CONSTRAINT "ai_learning_spec_v1_mentor_messages_thread_id_ai_learning_spec_v1_mentor_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."ai_learning_spec_v1_mentor_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_mentor_threads" ADD CONSTRAINT "ai_learning_spec_v1_mentor_threads_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_project_evidence" ADD CONSTRAINT "ai_learning_spec_v1_project_evidence_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_project_evidence" ADD CONSTRAINT "ai_learning_spec_v1_project_evidence_user_project_id_ai_learning_spec_v1_user_projects_id_fk" FOREIGN KEY ("user_project_id") REFERENCES "public"."ai_learning_spec_v1_user_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_review_items" ADD CONSTRAINT "ai_learning_spec_v1_review_items_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_sessions" ADD CONSTRAINT "ai_learning_spec_v1_sessions_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_study_sessions" ADD CONSTRAINT "ai_learning_spec_v1_study_sessions_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_spec_v1_user_projects" ADD CONSTRAINT "ai_learning_spec_v1_user_projects_user_id_ai_learning_spec_v1_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai_learning_spec_v1_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_items_key_unique" ON "ai_learning_spec_v1_assessment_items" USING btree ("key");--> statement-breakpoint
CREATE INDEX "assessment_items_lesson_idx" ON "ai_learning_spec_v1_assessment_items" USING btree ("lesson_key");--> statement-breakpoint
CREATE INDEX "attempts_user_idx" ON "ai_learning_spec_v1_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "ai_learning_spec_v1_audit_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "career_roles_key_unique" ON "ai_learning_spec_v1_career_roles" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_key_unique" ON "ai_learning_spec_v1_courses" USING btree ("key");--> statement-breakpoint
CREATE INDEX "english_user_idx" ON "ai_learning_spec_v1_english_activities" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "english_term_unique" ON "ai_learning_spec_v1_english_terms" USING btree ("term");--> statement-breakpoint
CREATE INDEX "freelance_user_idx" ON "ai_learning_spec_v1_freelance_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "freelance_key_unique" ON "ai_learning_spec_v1_freelance_scenarios" USING btree ("key");--> statement-breakpoint
CREATE INDEX "later_user_idx" ON "ai_learning_spec_v1_later_items" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_unique" ON "ai_learning_spec_v1_lesson_progress" USING btree ("user_id","lesson_key");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_key_unique" ON "ai_learning_spec_v1_lessons" USING btree ("key");--> statement-breakpoint
CREATE INDEX "lessons_course_idx" ON "ai_learning_spec_v1_lessons" USING btree ("course_key");--> statement-breakpoint
CREATE UNIQUE INDEX "mastery_unique" ON "ai_learning_spec_v1_mastery_records" USING btree ("user_id","skill_key");--> statement-breakpoint
CREATE INDEX "messages_thread_idx" ON "ai_learning_spec_v1_mentor_messages" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "threads_user_idx" ON "ai_learning_spec_v1_mentor_threads" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prereq_unique" ON "ai_learning_spec_v1_prerequisites" USING btree ("course_key","requires_course_key");--> statement-breakpoint
CREATE UNIQUE INDEX "project_catalog_key_unique" ON "ai_learning_spec_v1_project_catalog" USING btree ("key");--> statement-breakpoint
CREATE INDEX "evidence_user_idx" ON "ai_learning_spec_v1_project_evidence" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_unique" ON "ai_learning_spec_v1_review_items" USING btree ("user_id","item_key");--> statement-breakpoint
CREATE INDEX "review_due_idx" ON "ai_learning_spec_v1_review_items" USING btree ("user_id","due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "role_req_unique" ON "ai_learning_spec_v1_role_requirements" USING btree ("role_key","skill_key");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "ai_learning_spec_v1_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_key_unique" ON "ai_learning_spec_v1_skills" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "sources_key_unique" ON "ai_learning_spec_v1_sources" USING btree ("key");--> statement-breakpoint
CREATE INDEX "study_sessions_user_idx" ON "ai_learning_spec_v1_study_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tracks_key_unique" ON "ai_learning_spec_v1_tracks" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "user_project_unique" ON "ai_learning_spec_v1_user_projects" USING btree ("user_id","project_key");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "ai_learning_spec_v1_users" USING btree ("email");