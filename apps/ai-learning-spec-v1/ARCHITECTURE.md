# Architecture

## Build order actually followed

1. **Educational system first.** Source verification → curriculum graph (`src/content/*`) → lesson,
   notebook, assessment and project models → validation gate (`validateCurriculum` in `src/db/seed.ts`).
2. **Application.** Schema, auth, ownership-scoped data layer, engines, API routes.
3. **Frontend information architecture.** Every screen maps to a real capability or a truthful empty state.
4. **Visual layer.** Tokenised design system applied last.

## Modules

| Path | Responsibility |
|---|---|
| `src/content/types.ts` | Course / lesson / verification type contracts |
| `src/content/original.ts` | Original Curriculum, Modules 1–8, all topics verbatim |
| `src/content/extended.ts` | 22-area track spine, Harvard College / Extension / Industry / Research courses, source register |
| `src/content/catalog.ts` | Skills, project ladder, career role blueprints, English vocabulary, freelance scenarios |
| `src/content/assessments.ts` | Hand-written high-signal items + generated recall/explain/transfer items per lesson |
| `src/db/schema.ts` | 30 tables: identity, curriculum, assessment, mastery, review, projects, evidence, career, English, mentor, audit |
| `src/db/seed.ts` | Validation gate + idempotent upsert seeding |
| `src/lib/auth.ts` | scrypt hashing, session creation, `getCurrentUser` (the only identity source) |
| `src/lib/data.ts` | Read layer; all user queries are filtered by the session-derived `userId` |
| `src/lib/engine.ts` | Mastery ladder, attempt recording, adaptive spacing, next-best-task, role gap analysis, dependency audit |
| `src/lib/ai.ts` | Provider abstraction, model routing, mentor council policy, rule-based fallback |
| `src/app/api/*` | Zod-validated route handlers |
| `src/app/*` | Server-rendered screens; `src/components/client.tsx` holds all interactive components |

## Engines

**Mastery engine.** Each attempt updates per-skill exponential moving averages for recall, application and
transfer, plus counts of total and *independent* evidence (help level ≤ hint). Level L0–L9 is derived from
those dimensions; L8–L9 additionally require completed project evidence, so they are unreachable by
practice alone.

**Review engine.** Interval responds to rubric score, repetition count, lapse history and item stage
(transfer/case items are scheduled more aggressively). A failed item resets to one day. The scheduled
activity is the original task — recall, debugging, transfer — not a flashcard.

**Task engine.** `nextBestTasks` merges due retrieval, weak transfer, the next unopened graph node and the
active project, then truncates by study state (Deep / Drift / Fog / Overload). Every recommendation carries
a human-readable reason.

**Career engine.** Role requirements are stored as dated snapshots with a verification status. Gap analysis
joins requirements to the learner's mastery records and reports how many hard requirements have
*independently demonstrated* evidence. It never predicts hiring.

## Data flow for a protected read

```
Request → cookie → sessions table (unexpired) → users row
       → server-derived userId
       → query always filtered by that userId
       → render
```

No API route or page accepts an owner identifier from the client.
