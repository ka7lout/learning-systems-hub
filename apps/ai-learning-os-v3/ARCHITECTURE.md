# Architecture

Next.js App Router (server components by default) + PostgreSQL via Drizzle ORM.

```
Browser
  │  (server actions / fetch)
  ▼
Next.js server  ── src/app/actions.ts        mutations: auth → Zod → authorize → scoped write
                ── src/app/api/mentor/route  AI orchestration
                ── src/app/api/health/route  liveness + content + provider truth
  │
  ├── src/lib/auth.ts        session resolution, rate limiting, audit
  ├── src/lib/learning.ts    mastery persistence, spacing, task engine (server-only)
  ├── src/lib/mastery-math.ts  pure scoring/scheduling (unit-testable)
  ├── src/lib/ai.ts          provider abstraction, model routing, mentor council, degraded mode
  └── src/db/*               schema + pooled client
```

## Boundaries
- Server-only modules import `server-only`; pure maths lives in `mastery-math.ts` so tests run outside Next.
- No vendor SDK call sites outside `src/lib/ai.ts`; the provider is replaceable (Puter → OpenAI-compatible).
- Client components are leaves: forms, pickers, the mentor panel. All reads happen on the server.

## Request lifecycle for a practice attempt
1. Client submits the form to a server action.
2. `requireUser()` resolves the session; unauthenticated calls throw.
3. Zod validates the payload; the item is loaded from the database (not trusted from the client).
4. `recordAttemptAndUpdate` writes the attempt, updates lesson and skill mastery with independence
   weighting, records skill evidence when the work was independent and strong, and schedules the review.
5. Paths are revalidated; the dashboard recommendation changes on the next render.

## Build order actually followed
Research → curriculum/learning-science model → schema and engines → seeded content → APIs and actions →
information architecture → visual layer → validation. The UI was never used as a substitute for a
missing engine; every screen renders real data or a truthful empty state.
