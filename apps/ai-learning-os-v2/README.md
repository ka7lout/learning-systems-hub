# IHLS — Ismaili Harvard AI Engineering Learning OS

A Harvard-informed (**not** Harvard-affiliated, no Harvard credential) AI engineering self-study system. Learning works like this: attempt → retrieval → feedback → transfer → case → build → delayed review, and mastery comes only from evidence.

## Quick start
1. Set `DATABASE_URL` (PostgreSQL). Set `PUTER_AUTH_TOKEN` too if you want the AI Mentor.
2. `npm install && npx drizzle-kit push && npm run build && npm start`
3. Register. The first account is given the `admin` role, and later accounts are `student`.
4. The curriculum seeds itself on first use (`src/lib/seed.ts`, idempotent, versioned by `SEED_VERSION`).

## What exists
- **Curriculum graph:** 12 modules and 61 units. This includes all 34 sections of Original Modules 1–8, kept word for word. Units are labelled Harvard College / Harvard Extension / Industry / Research, and every prerequisite is validated so there are no cycles or broken links.
- **Practice engine:** recall → application (explain-why) → transfer → case tasks. The key-point checklist shows up only after you attempt. You record the help level and the error type (7-type taxonomy).
- **Mastery:** L0–L9 pyramid built from recall/application/transfer scores. Independent work counts more than assisted work, and L6 needs an independent transfer.
- **Spaced review:** adapts to failures, lapses and how you do on transfer.
- **State adaptation:** Deep / Drift / Fog / Overload changes how big a task is and what kind of task you get. It never diagnoses anything, and there is no mandatory timer.
- **AI Mentor Council:** Lead Mentor → specialist via `SPECIALISTS`, one call with no recursion. A model router picks Pro or Flash. Guardrails cover AI dependency and repeated reassurance. Prompt-injection isolation is in place.
- **Projects:** all 21 original projects plus Levels 8–10, with milestones (Definition of Done), environment links and evidence.
- **Skills, career gap (two target roles), portfolio/CV eligibility, English lab (browser speech + feedback), freelance client simulation, research hypotheses, admin validation and audit log.**

See `docs/` for architecture, security, content model, testing and sources.

## Deliberate deviations from the specification (honest)
- **Database:** this platform provides PostgreSQL with Drizzle, not MongoDB. The collections map onto tables (`docs/DATABASE.md`).
- **Auth:** sessions are server-side and live in Postgres. Tokens are random, only their SHA-256 hash is stored, and the cookie is httpOnly. Passwords use Node's `scrypt` with `timingSafeEqual` (no custom crypto primitives). Better Auth / GitHub OAuth are **not** integrated yet, so GitHub evidence is added as links.
- **Not yet implemented:** web research/search ingestion service (SEARCH_API_KEY), blob uploads, vector/hybrid retrieval, a full admin CMS (content is versioned in code), browser Python/SQL execution, Playwright E2E (a curl-based E2E/authorization script is included instead).
