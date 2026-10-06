# Architecture
- Next.js App Router (server components for reads, two JSON API routes for writes: `/api/learn`, `/api/me`, plus `/api/auth/[op]`).
- `src/content/curriculum.ts` — canonical curriculum, projects, skills, roles, sources, mappings, English terms.
- `src/lib/validate.ts` — publication validation (cycles, broken prereqs, missing assessments).
- `src/lib/seed.ts` — idempotent versioned seeding.
- `src/lib/learning.ts` — pure IHLS logic (spacing, mastery, state adaptation, guardrails). Unit-tested.
- `src/lib/dal.ts` — the only data-access layer for student data; every query is scoped by a server-derived `ownerId`.
- `src/lib/ai.ts` — `AIProvider` (Puter, OpenAI-compatible), `MODEL_ROUTER`, specialist prompts, message builder with instruction hierarchy.
- `src/lib/api.ts` — route wrapper: auth → rate limit → Zod validation → typed error mapping (401/404/422/429/503/500 + requestId).
Degraded mode: when the AI provider is missing or failing, the API returns 503 `provider_unavailable`, and curriculum, practice, review, projects and evidence keep working.
