CREATE TABLE "adaptive_study_v1_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"achievement_type" varchar(30) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"source_type" varchar(20) DEFAULT 'ai_generated',
	"weight_percentage" integer,
	"total_questions" integer,
	"time_limit_minutes" integer,
	"due_date" timestamp,
	"exam_date" timestamp,
	"instructions" text,
	"source_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_concepts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"topic_id" uuid,
	"title" text NOT NULL,
	"title_ar" text,
	"simple_explanation" text,
	"formal_definition" text,
	"intuition" text,
	"visual_description" text,
	"equation" text,
	"worked_example" text,
	"key_points" jsonb,
	"common_mistakes" jsonb,
	"difficulty" integer DEFAULT 1,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_course_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"file_id" text,
	"filename" text NOT NULL,
	"path" text,
	"type" varchar(20) NOT NULL,
	"size" text,
	"modified_at" timestamp,
	"drive_url" text,
	"purpose" text,
	"status" varchar(20) DEFAULT 'processed',
	"content_hash" text,
	"content_summary" text,
	"extracted_text" text,
	"page_count" integer,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"instructor" text,
	"credits" integer,
	"reference_book" text,
	"reference_book_edition" text,
	"color" text DEFAULT '#3B82F6',
	"icon" text,
	"semester" varchar(20),
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"syllabus_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_daily_plan_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"course_id" uuid,
	"concept_id" uuid,
	"task_type" varchar(20) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"estimated_minutes" integer,
	"priority" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_daily_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_date" timestamp NOT NULL,
	"plan_data" jsonb NOT NULL,
	"plan_type" varchar(20) DEFAULT 'adaptive',
	"confidence" numeric(3, 2) DEFAULT '0.5',
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_database_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(30) NOT NULL,
	"table_name" varchar(50),
	"details" jsonb,
	"performed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_diagnostic_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"domain" varchar(30) NOT NULL,
	"question_text" text NOT NULL,
	"user_answer" text,
	"is_correct" boolean NOT NULL,
	"difficulty_level" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_distractions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"converted" boolean DEFAULT false,
	"converted_to_task_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'running',
	"files_found" integer DEFAULT 0,
	"files_processed" integer DEFAULT 0,
	"files_failed" integer DEFAULT 0,
	"files_needs_ocr" integer DEFAULT 0,
	"files_unsupported" integer DEFAULT 0,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'not_started',
	"current_step" integer DEFAULT 0,
	"exposure_level" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"time_spent_seconds" integer DEFAULT 0,
	"retrieval_score" numeric(5, 2),
	"practice_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_lesson_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_url" text,
	"page_number" integer,
	"section_number" text,
	"verification_status" varchar(20) DEFAULT 'verified',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"objective" text,
	"prerequisite_text" text,
	"mission" text,
	"simple_explanation" text,
	"formal_content" text,
	"visual_content" text,
	"equation_content" text,
	"worked_example" text,
	"guided_practice" text,
	"independent_practice" text,
	"retrieval_prompt" text,
	"reflection" text,
	"estimated_minutes" integer DEFAULT 15,
	"display_order" integer DEFAULT 0,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_mistakes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"course_id" uuid NOT NULL,
	"concept_id" uuid,
	"question_id" uuid,
	"mistake_type" varchar(30) NOT NULL,
	"description" text NOT NULL,
	"student_answer" text,
	"correct_answer" text,
	"explanation" text,
	"how_to_recognize" text,
	"repeat_count" integer DEFAULT 1,
	"resolved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"description" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"course_id" uuid,
	"concept_id" uuid,
	"lesson_id" uuid,
	"type" varchar(20) DEFAULT 'general',
	"title" text,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_prerequisites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept_id" uuid NOT NULL,
	"prerequisite_concept_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text,
	"semester_start_date" timestamp,
	"available_study_hours_per_day" integer DEFAULT 4,
	"focus_duration_minutes" integer DEFAULT 20,
	"break_duration_minutes" integer DEFAULT 5,
	"audio_preference" text DEFAULT 'silence',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "adaptive_study_v1_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_question_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"user_answer" text,
	"is_correct" boolean NOT NULL,
	"time_spent_seconds" integer,
	"hints_used" integer DEFAULT 0,
	"attempt_number" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"concept_id" uuid,
	"assessment_id" uuid,
	"type" varchar(20) NOT NULL,
	"difficulty" varchar(10) DEFAULT 'normal',
	"question_text" text NOT NULL,
	"options" jsonb,
	"correct_answer" text NOT NULL,
	"explanation" text,
	"hint_1" text,
	"hint_2" text,
	"hint_3" text,
	"partial_solution" text,
	"full_solution" text,
	"common_errors" jsonb,
	"skill" text,
	"source_type" varchar(20) DEFAULT 'ai_generated',
	"source_url" text,
	"validation_status" varchar(20) DEFAULT 'validated',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_review_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"concept_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"first_learned" timestamp DEFAULT now(),
	"last_reviewed" timestamp,
	"next_review" timestamp DEFAULT now(),
	"interval_days" integer DEFAULT 1,
	"retrieval_score" numeric(5, 2),
	"practice_score" numeric(5, 2),
	"confidence" integer,
	"error_count" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_scratchpads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"course_id" uuid,
	"concept_id" uuid,
	"data" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"focus_duration_minutes" integer DEFAULT 20,
	"break_duration_minutes" integer DEFAULT 5,
	"audio_preference" text DEFAULT 'silence',
	"theme" text DEFAULT 'dark',
	"available_study_hours_per_day" integer DEFAULT 4,
	"preferred_session_windows" jsonb,
	"show_provenance" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "adaptive_study_v1_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_study_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"course_id" uuid,
	"concept_id" uuid,
	"lesson_id" uuid,
	"type" varchar(20) NOT NULL,
	"planned_duration_minutes" integer,
	"actual_duration_minutes" integer,
	"completed" boolean DEFAULT false,
	"early_exit" boolean DEFAULT false,
	"session_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adaptive_study_v1_xp_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"source_id" uuid,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_assessments" ADD CONSTRAINT "adaptive_study_v1_assessments_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_concepts" ADD CONSTRAINT "adaptive_study_v1_concepts_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_concepts" ADD CONSTRAINT "adaptive_study_v1_concepts_topic_id_adaptive_study_v1_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."adaptive_study_v1_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_course_sources" ADD CONSTRAINT "adaptive_study_v1_course_sources_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_daily_plan_tasks" ADD CONSTRAINT "adaptive_study_v1_daily_plan_tasks_plan_id_adaptive_study_v1_daily_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."adaptive_study_v1_daily_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_daily_plan_tasks" ADD CONSTRAINT "adaptive_study_v1_daily_plan_tasks_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_daily_plan_tasks" ADD CONSTRAINT "adaptive_study_v1_daily_plan_tasks_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_lesson_progress" ADD CONSTRAINT "adaptive_study_v1_lesson_progress_lesson_id_adaptive_study_v1_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."adaptive_study_v1_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_lesson_sources" ADD CONSTRAINT "adaptive_study_v1_lesson_sources_lesson_id_adaptive_study_v1_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."adaptive_study_v1_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_lesson_sources" ADD CONSTRAINT "adaptive_study_v1_lesson_sources_source_id_adaptive_study_v1_course_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."adaptive_study_v1_course_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_lessons" ADD CONSTRAINT "adaptive_study_v1_lessons_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_lessons" ADD CONSTRAINT "adaptive_study_v1_lessons_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_mistakes" ADD CONSTRAINT "adaptive_study_v1_mistakes_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_mistakes" ADD CONSTRAINT "adaptive_study_v1_mistakes_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_mistakes" ADD CONSTRAINT "adaptive_study_v1_mistakes_question_id_adaptive_study_v1_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."adaptive_study_v1_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_modules" ADD CONSTRAINT "adaptive_study_v1_modules_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_notes" ADD CONSTRAINT "adaptive_study_v1_notes_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_notes" ADD CONSTRAINT "adaptive_study_v1_notes_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_notes" ADD CONSTRAINT "adaptive_study_v1_notes_lesson_id_adaptive_study_v1_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."adaptive_study_v1_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_prerequisites" ADD CONSTRAINT "adaptive_study_v1_prerequisites_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_prerequisites" ADD CONSTRAINT "adaptive_study_v1_prerequisites_prerequisite_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("prerequisite_concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_question_attempts" ADD CONSTRAINT "adaptive_study_v1_question_attempts_question_id_adaptive_study_v1_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."adaptive_study_v1_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_questions" ADD CONSTRAINT "adaptive_study_v1_questions_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_questions" ADD CONSTRAINT "adaptive_study_v1_questions_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_questions" ADD CONSTRAINT "adaptive_study_v1_questions_assessment_id_adaptive_study_v1_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."adaptive_study_v1_assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_review_items" ADD CONSTRAINT "adaptive_study_v1_review_items_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_review_items" ADD CONSTRAINT "adaptive_study_v1_review_items_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_scratchpads" ADD CONSTRAINT "adaptive_study_v1_scratchpads_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_scratchpads" ADD CONSTRAINT "adaptive_study_v1_scratchpads_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_study_sessions" ADD CONSTRAINT "adaptive_study_v1_study_sessions_course_id_adaptive_study_v1_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."adaptive_study_v1_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_study_sessions" ADD CONSTRAINT "adaptive_study_v1_study_sessions_concept_id_adaptive_study_v1_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."adaptive_study_v1_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_study_sessions" ADD CONSTRAINT "adaptive_study_v1_study_sessions_lesson_id_adaptive_study_v1_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."adaptive_study_v1_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptive_study_v1_topics" ADD CONSTRAINT "adaptive_study_v1_topics_module_id_adaptive_study_v1_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."adaptive_study_v1_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "achievements_user_id_idx" ON "adaptive_study_v1_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assessments_course_id_idx" ON "adaptive_study_v1_assessments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "concepts_course_id_idx" ON "adaptive_study_v1_concepts" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "concepts_topic_id_idx" ON "adaptive_study_v1_concepts" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "course_sources_course_id_idx" ON "adaptive_study_v1_course_sources" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_sources_status_idx" ON "adaptive_study_v1_course_sources" USING btree ("status");--> statement-breakpoint
CREATE INDEX "courses_code_idx" ON "adaptive_study_v1_courses" USING btree ("code");--> statement-breakpoint
CREATE INDEX "daily_plan_tasks_plan_id_idx" ON "adaptive_study_v1_daily_plan_tasks" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "daily_plans_user_date_idx" ON "adaptive_study_v1_daily_plans" USING btree ("user_id","plan_date");--> statement-breakpoint
CREATE INDEX "database_audit_log_created_at_idx" ON "adaptive_study_v1_database_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "diagnostic_responses_user_id_idx" ON "adaptive_study_v1_diagnostic_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "distractions_user_id_idx" ON "adaptive_study_v1_distractions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ingestion_runs_started_at_idx" ON "adaptive_study_v1_ingestion_runs" USING btree ("started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_user_lesson_idx" ON "adaptive_study_v1_lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_sources_lesson_id_idx" ON "adaptive_study_v1_lesson_sources" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lessons_concept_id_idx" ON "adaptive_study_v1_lessons" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "lessons_course_id_idx" ON "adaptive_study_v1_lessons" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "mistakes_user_id_idx" ON "adaptive_study_v1_mistakes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mistakes_concept_id_idx" ON "adaptive_study_v1_mistakes" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "modules_course_id_idx" ON "adaptive_study_v1_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "notes_user_id_idx" ON "adaptive_study_v1_notes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prerequisites_unique_idx" ON "adaptive_study_v1_prerequisites" USING btree ("concept_id","prerequisite_concept_id");--> statement-breakpoint
CREATE INDEX "question_attempts_user_id_idx" ON "adaptive_study_v1_question_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "question_attempts_question_id_idx" ON "adaptive_study_v1_question_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "questions_course_id_idx" ON "adaptive_study_v1_questions" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "questions_concept_id_idx" ON "adaptive_study_v1_questions" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "review_items_user_id_idx" ON "adaptive_study_v1_review_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_items_next_review_idx" ON "adaptive_study_v1_review_items" USING btree ("next_review");--> statement-breakpoint
CREATE INDEX "scratchpads_user_id_idx" ON "adaptive_study_v1_scratchpads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "settings_user_id_idx" ON "adaptive_study_v1_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "study_sessions_user_id_idx" ON "adaptive_study_v1_study_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "study_sessions_date_idx" ON "adaptive_study_v1_study_sessions" USING btree ("session_date");--> statement-breakpoint
CREATE INDEX "topics_module_id_idx" ON "adaptive_study_v1_topics" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "xp_transactions_user_id_idx" ON "adaptive_study_v1_xp_transactions" USING btree ("user_id");