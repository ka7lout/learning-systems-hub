# Ismaili Harvard AI Engineering Learning OS

A working learning system for AI engineering: a prerequisite-checked curriculum graph, an active-practice
mastery engine, adaptive spaced retrieval, a project/evidence ladder, a skill graph, a career gap engine,
a technical-English layer, a freelance simulator and an AI mentor council with truthful failure states.

**Honest framing.** This is a *Harvard-informed, research-informed self-study curriculum*. It is not
affiliated with Harvard University, it confers no Harvard credential, and Harvard College / Harvard
Extension School material is kept in separate labelled layers. Claims that were not re-verified against an
official page during this build are marked `likely_not_verified` in the source register (`/sources`).

## What exists in the running system

| Layer | Status |
|---|---|
| Original Curriculum (Modules 1–8, every topic preserved verbatim) | seeded, 34 lesson nodes |
| Harvard College layer (requirement structure, programming, formal reasoning, systems, probability, math, ML theory, data systems, ethics) | seeded |
| Harvard Extension layer (graduate DL, LLM foundations, practical AI systems) | seeded |
| Industry Extension (software engineering, cloud, big data, MLOps, RAG, agents, security, English, career, freelancing, secondary languages) | seeded |
| Research Extension (research engineering, capstone) | seeded |
| Practice items (free recall, explain, predict output, code reading, debugging, complexity, choose-method, derivation, transfer, case decision, oral) | 162 items |
| Project ladder (21 original projects + agentic / production / research levels) | 25 projects |
| Skill graph | 74 skills |
| Career role blueprints with requirement→evidence mapping | 2 roles, 38 requirements |
| Technical English vocabulary + speaking/writing lab | 30 terms, 8 activity types |

## Stack

- Next.js 16 (App Router, React 19, server components)
- PostgreSQL + Drizzle ORM (`src/db/schema.ts`)
- Tailwind CSS v4 design tokens (`src/app/globals.css`)
- Zod validation at every API boundary
- scrypt password hashing + server-side session cookies (`src/lib/auth.ts`)

> **Deviation from the original specification:** the spec named MongoDB. This deployment target provides a
> managed PostgreSQL instance, so the same collection model is implemented as relational tables with
> JSONB for structured content. The data contracts (ownership scoping, versioned content, provenance
> records, evidence records) are unchanged.

## Running

```bash
npm install
cp .env.example .env     # set DATABASE_URL
npx drizzle-kit push     # apply schema
npm run build && npm start
```

Curriculum content is seeded idempotently on first request (`src/db/seed.ts`) after passing a validation
gate: unknown tracks, unknown prerequisites, prerequisite cycles, missing mastery criteria, missing
notebook guidance and unknown skill references all block publication.

## Documentation

- `ARCHITECTURE.md` — system structure, engines, data flow
- `CURRICULUM.md` — the curriculum model, source layers and preservation guarantee
- `AI_SYSTEM.md` — mentor council, routing, guardrails, failure behaviour
- `SECURITY.md` — authorization model, LLM instruction hierarchy, data isolation
- `ENVIRONMENT.md` — every environment variable, scope and purpose
- `docs/research/README.md` — research dossier and verification log
