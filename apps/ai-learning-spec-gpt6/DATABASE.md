# Database

## Runtime

PostgreSQL via Drizzle ORM. This is an implementation constraint from the provided starter, and supersedes the MongoDB architecture preference in the standalone product spec. The schema is `src/db/schema.ts`; Drizzle config reads `DATABASE_URL` only.

## Collections/tables

- Better Auth: `user`, `session`, `account`, `verification`.
- Learner: `learner_profiles`, `learning_events`, `mastery_records`, `review_items`, `learning_tasks`, `later_items`.
- Shared content: `curriculum_nodes`, `curriculum_sources`, `projects_catalog`, `skills`, `career_roles`, `job_requirements`, `english_terms`.
- Private evidence: `projects`, `project_evidence`, `skill_evidence`, `portfolio_items`, `english_attempts`, `ai_threads`, `ai_messages`, `ai_runs`.

Large binary files should be stored in approved object storage; only metadata and references belong in PostgreSQL. This release does not upload files.

## Isolation

A student row is scoped by the `ownerId` obtained from Better Auth session on the server. Never accept owner/user IDs from JSON as authorization. Do not return whole database rows by default; return explicit DTOs. Use foreign keys and cascade deletion for student-owned resources.

## Schema workflow

```bash
npx drizzle-kit push
```

Use reviewed migrations for production change management. Back up before applying destructive changes. Seed content is immutable-on-conflict so published learner progress is never overwritten by a content bootstrap.
