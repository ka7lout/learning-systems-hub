# Ismaili Harvard AI Engineering Learning OS

A Harvard-informed, learning-science-driven self-study operating system for AI
Engineering. **Not affiliated with Harvard University; grants no credential.**

## What exists (all real, no mocks)

- **Canonical curriculum** (`src/content/curriculum.ts`): the complete Original
  Curriculum — Modules 1–8 with **every topic preserved** (Python, Math & Stats,
  Data Analysis, Excel & Power BI, Databases & Data Engineering, ML, Deep
  Learning incl. Transformers/LLMs, MLOps) — organized as a prerequisite DAG
  with additive Harvard College/Extension mappings labeled by verification
  status (`confirmed_current` / `confirmed_historical` / `likely_not_verified`
  / `design_decision`). Session-count mismatches in the source outline are
  preserved as explicit notes, never resolved by deletion.
- **Project ladder** (`src/content/projects.ts`): the original 21-project
  catalog across 10 ladder levels, each with real-data provenance policy,
  definition of done, skill mapping, and CV-signal class.
- **Skill graph & career engine** (`src/content/roles.ts`, `src/lib/learner.ts`):
  L0–L9 mastery from evidence only; independent vs assisted evidence tracked
  separately; gap analysis against two encoded reference roles.
- **IHLS learning engine**: learning states (Deep/Drift/Fog/Overload, human
  language, no diagnoses), free-recall + transfer + case checkpoints with honest
  self-grading, notebook guidance (MUST WRITE / RECOMMENDED / OPTIONAL),
  adaptive spaced-review scheduler (`src/lib/scheduler.ts`), distraction
  capture ("Later"), and an explainable "what should I do now?" recommender.
- **AI Mentor** (`src/lib/ai.ts`): provider abstraction (OpenAI-compatible,
  Anthropic, Puter). Attempt-first Socratic policy, anti-reassurance guardrail,
  30 msg/hour rate limit. When no provider is configured, the UI shows a
  truthful "not configured" state and a clearly-labeled rule-based guide —
  failure is never simulated as success.

## Architecture

- Next.js App Router + server actions; PostgreSQL via Drizzle ORM
  (`src/db/schema.ts`). *(The platform mandates PostgreSQL; the original
  specification's MongoDB section is implemented on Postgres as a documented
  adaptation.)*
- Curriculum/content: versioned canonical TypeScript model (source of truth in
  the repo). Learner state: PostgreSQL. Code artifacts: GitHub (links +
  evidence records). Heavy compute: Codespaces/Colab/Kaggle — this app never
  executes student code.

## Security

- Credential auth (bcrypt) + httpOnly DB-backed session cookies.
- Every student-owned row is scoped by a **server-derived** `userId`; client
  ownership identifiers are never trusted; all mutations re-check ownership.
- Secrets live only in environment variables (see `.env.example`, names only).
- Input validation and URL allow-listing (`https://` only) on all mutations;
  mentor requests rate-limited per user.

## Environment

| Variable | Required | Scope | Purpose |
|---|---|---|---|
| `DATABASE_URL` | yes | server | PostgreSQL connection |
| `PUTER_AUTH_TOKEN`, `PUTER_MODEL_NAME` | no | server | Puter AI provider |
| `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL` | no | server | OpenAI-compatible provider |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | no | server | Anthropic provider |

## Develop

```bash
npm install
npx drizzle-kit push   # apply schema
npm run dev
```

## Honesty contract

Empty states are truthful; analytics derive only from persisted learner events;
Harvard mappings carry verification badges; mastery requires evidence, and
"complete" projects require a repository plus documented data provenance.
See `docs/research/RESEARCH_SOURCES.md` for the source status log.
