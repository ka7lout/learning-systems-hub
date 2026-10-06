# Architecture
Next.js 16 (App Router) + PostgreSQL via Drizzle ORM. Server components read owner-scoped data; mutations go through zod-validated route handlers (`src/app/api/*`) wrapped by `handler()` (uniform errors, request id).

Layers: `src/content` (canonical curriculum, Harvard layer, catalog, lesson builder) → `src/db/seed.ts` (idempotent upserts, cycle detection, auto-seed) → `src/lib/engine.ts` (mastery, review scheduling, recommendation with "why", career gap, snapshots) → `src/lib/ai` (AIProvider, ModelRouter, MentorOrchestrator) → `src/app/(app)` screens.

Design decision: the deployment target provides PostgreSQL, so the MongoDB collection design in the specification is implemented as relational tables with identical semantics (owner-scoped documents, JSONB for structured lesson content). Retrieval for the mentor is node-scoped (lesson excerpts + learner state), not whole-curriculum prompts.
