# Database

PostgreSQL via Drizzle ORM. (The original specification named MongoDB; this deployment target provides
managed PostgreSQL, so the same logical model — curriculum metadata, learner state, evidence and AI
metadata in the database, code in GitHub, large binaries in object storage — is implemented relationally.
No behaviour from the specification is lost by this substitution.)

## Source-of-truth split
- **Database**: curriculum metadata, learner state, assessments, attempts, mastery, review schedule,
  project metadata, evidence records, career mappings, English records, AI conversation metadata, audit log.
- **GitHub**: project source code.
- **Object storage**: large binary artefacts (not enabled in this environment).
- **External dataset providers**: public datasets; the platform records provenance only.

## Tables
Identity: `users`, `sessions`, `audit_logs`.
Curriculum: `sources`, `stages`, `courses`, `lessons`, `assessment_items`.
Learning state: `attempts`, `mastery_records`, `review_items`, `study_sessions`, `later_items`.
Skills: `skills`, `skill_edges`, `skill_evidence`.
Projects: `projects`, `user_projects`, `project_evidence`.
Career: `career_roles`, `user_career_targets`.
English: `english_terms`, `english_attempts`.
Freelance: `freelance_simulations`, `freelance_runs`.
AI: `ai_threads`, `ai_messages`.

Every learner-owned table carries `user_id` with `ON DELETE CASCADE` and is queried only through
ownership-scoped predicates.

## Commands
```bash
npx drizzle-kit push                      # apply schema
npx tsx --env-file=.env src/db/seed.ts    # seed curriculum (content tables only)
npx tsx --env-file=.env scripts/test.ts   # unit + content + authorization tests
```
The seed replaces content tables only and never touches learner data.
