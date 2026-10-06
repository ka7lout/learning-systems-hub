# Database (PostgreSQL / Drizzle) — `src/db/schema.ts`
Shared content: curriculum_nodes, practice_items, harvard_mappings, sources, project_catalog, skills, career_roles, english_terms.
Student-owned (owner_id FK, cascade delete): mastery_records, review_items, attempts, user_projects, project_evidence, ai_messages, english_attempts, later_items, settings.
System: users, sessions (sha256 token ids), audit_logs, rate_limits.
Apply schema: `npx drizzle-kit push`. Backups: rely on managed Postgres point-in-time recovery; content can be fully re-seeded from code.
