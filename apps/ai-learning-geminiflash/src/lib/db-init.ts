import { pool, db } from "@/db";
import { seedDatabase } from "@/db/seed";

let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;

  try {
    // Check if curriculum_nodes table exists
    const checkRes = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'curriculum_nodes'
      );
    `);

    const tableExists = checkRes.rows[0]?.exists;

    if (!tableExists) {
      console.log("Creating database tables...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'student',
          avatar TEXT,
          state_preference TEXT NOT NULL DEFAULT 'deep',
          english_mode TEXT NOT NULL DEFAULT 'standard_tech',
          target_role_id TEXT DEFAULT 'navisoft_ai_engineer',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS curriculum_nodes (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          stage TEXT NOT NULL,
          source_category TEXT NOT NULL,
          module_number INTEGER,
          session_index INTEGER,
          level TEXT NOT NULL,
          prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
          corequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
          why_it_matters TEXT NOT NULL,
          learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
          skills JSONB NOT NULL DEFAULT '[]'::jsonb,
          must_write_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
          recommended_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
          optional_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
          english_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
          sources JSONB NOT NULL DEFAULT '[]'::jsonb,
          order_index INTEGER NOT NULL DEFAULT 0,
          version TEXT NOT NULL DEFAULT '1.0.0',
          last_verified TEXT
        );

        CREATE TABLE IF NOT EXISTS learning_blocks (
          id TEXT PRIMARY KEY,
          node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          code_snippet TEXT,
          language TEXT DEFAULT 'python',
          starter_code TEXT,
          solution_code TEXT,
          test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
          hints JSONB NOT NULL DEFAULT '[]'::jsonb,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          order_index INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS skills (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          level TEXT NOT NULL,
          prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
          career_roles JSONB NOT NULL DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS user_progress (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'available',
          completion_pct INTEGER NOT NULL DEFAULT 0,
          mastery_level INTEGER NOT NULL DEFAULT 0,
          completed_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
          last_accessed_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS mastery_records (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
          skill_id TEXT,
          task_type TEXT NOT NULL,
          understanding_score INTEGER NOT NULL DEFAULT 0,
          recall_score INTEGER NOT NULL DEFAULT 0,
          explanation_score INTEGER NOT NULL DEFAULT 0,
          problem_solving_score INTEGER NOT NULL DEFAULT 0,
          transfer_score INTEGER NOT NULL DEFAULT 0,
          help_level_used TEXT NOT NULL DEFAULT 'no_help',
          is_independent BOOLEAN NOT NULL DEFAULT TRUE,
          feedback TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS review_items (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
          concept TEXT NOT NULL,
          prompt TEXT NOT NULL,
          ideal_answer TEXT NOT NULL,
          activity_type TEXT NOT NULL DEFAULT 'free_recall',
          next_review_date TIMESTAMP NOT NULL,
          interval_days INTEGER NOT NULL DEFAULT 1,
          repetitions INTEGER NOT NULL DEFAULT 0,
          ease_factor DOUBLE PRECISION NOT NULL DEFAULT 2.5,
          failure_count INTEGER NOT NULL DEFAULT 0,
          last_reviewed_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          reason_type TEXT NOT NULL,
          node_id TEXT,
          priority TEXT NOT NULL DEFAULT 'medium',
          difficulty TEXT NOT NULL DEFAULT 'intermediate',
          status TEXT NOT NULL DEFAULT 'pending',
          output_artifact TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          completed_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          ladder_level INTEGER NOT NULL DEFAULT 1,
          is_original_catalog BOOLEAN NOT NULL DEFAULT TRUE,
          catalog_index INTEGER,
          description TEXT NOT NULL,
          why_important TEXT NOT NULL,
          dataset_name TEXT,
          dataset_url TEXT,
          dataset_license TEXT,
          requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
          acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
          starter_code TEXT,
          architecture_diagram TEXT,
          suggested_milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
          rubric JSONB NOT NULL DEFAULT '{}'::jsonb
        );

        CREATE TABLE IF NOT EXISTS user_projects (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'not_started',
          evidence_level TEXT NOT NULL DEFAULT 'practice',
          github_repo TEXT,
          commit_hash TEXT,
          colab_url TEXT,
          codespaces_url TEXT,
          deployment_url TEXT,
          report_markdown TEXT,
          completed_milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
          evaluation_score INTEGER,
          evaluator_feedback TEXT,
          is_portfolio_visible BOOLEAN DEFAULT FALSE,
          started_at TIMESTAMP NOT NULL DEFAULT NOW(),
          completed_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ai_conversations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          node_id TEXT,
          specialist_persona TEXT NOT NULL DEFAULT 'lead_mentor',
          thread_title TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS ai_messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
          sender TEXT NOT NULL,
          persona TEXT NOT NULL,
          content TEXT NOT NULL,
          help_level TEXT DEFAULT 'no_help',
          thought_process TEXT,
          evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS career_roles (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          archetype TEXT NOT NULL,
          description TEXT NOT NULL,
          required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
          preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
          seniority TEXT NOT NULL,
          typical_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
          flagship_projects JSONB NOT NULL DEFAULT '[]'::jsonb,
          interview_domains JSONB NOT NULL DEFAULT '[]'::jsonb,
          last_verified TEXT
        );

        CREATE TABLE IF NOT EXISTS freelance_simulations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          scenario_slug TEXT NOT NULL,
          client_name TEXT NOT NULL,
          client_brief TEXT NOT NULL,
          conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
          proposal_markdown TEXT,
          scope_of_work TEXT,
          estimated_budget INTEGER,
          status TEXT NOT NULL DEFAULT 'discovery',
          score INTEGER,
          coach_feedback TEXT,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS english_terms (
          id TEXT PRIMARY KEY,
          term TEXT NOT NULL UNIQUE,
          category TEXT NOT NULL,
          part_of_speech TEXT NOT NULL,
          b1_b2_definition TEXT NOT NULL,
          technical_definition TEXT NOT NULL,
          arabic_meaning TEXT NOT NULL,
          pronunciation_ipa TEXT NOT NULL,
          example_sentence TEXT NOT NULL,
          common_mistakes TEXT
        );

        CREATE TABLE IF NOT EXISTS speaking_submissions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          node_id TEXT,
          prompt_type TEXT NOT NULL,
          prompt_text TEXT NOT NULL,
          transcript TEXT NOT NULL,
          fluency_score INTEGER NOT NULL DEFAULT 0,
          terminology_score INTEGER NOT NULL DEFAULT 0,
          clarity_score INTEGER NOT NULL DEFAULT 0,
          feedback TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS later_items (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          note TEXT,
          status TEXT NOT NULL DEFAULT 'saved',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      await seedDatabase();
    }

    isInitialized = true;
  } catch (err) {
    console.error("Error initializing database schema:", err);
  }
}
