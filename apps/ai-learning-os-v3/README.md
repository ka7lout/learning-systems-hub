# Ismaili Harvard AI Engineering Learning OS

A Harvard-informed, research-informed AI Engineering pathway delivered through the Ismaili Harvard
Learning Science (IHLS) operating model: active learning, retrieval, spacing, interleaving, transfer,
cases, projects, feedback, externalised executive function and AI tutoring that does not replace the
learner's thinking.

**This is not a Harvard degree, Harvard enrolment or Harvard credit.** It is a Harvard-mapped
self-study curriculum. Harvard College and Harvard Extension School are kept strictly separate, and
every externally derived claim carries a verification status.

## What exists in this build
- **Curriculum graph** — 22 prerequisite-ordered stages, 22 course nodes, cycle-checked. The original
  eight modules are preserved topic by topic (see `CURRICULUM.md`).
- **Authored lessons** with why-statements, worked examples, failure modes, cases, notebook guidance
  (MUST WRITE / RECOMMENDED / OPTIONAL) and sources.
- **Active mastery engine** — 20+ task types (prediction, code reading, debugging, derivation,
  diagnosis, transfer, case decision, oral, design review, incident). Multiple-choice is a minor
  component by design.
- **Mastery ladder L0–L9** where transfer, independence, project evidence and delayed retention are
  separate requirements, not one progress bar.
- **Adaptive spacing** driven by difficulty, lapses, importance and last result, with rotating activity
  types so review is never term-definition drilling.
- **State-adaptive delivery** across four operational states (focused / drifting / starting-is-hard /
  too-much-at-once). These are delivery modes, never diagnoses.
- **AI Mentor Council** — a lead mentor plus specialists, help-level ceilings, an instruction hierarchy
  that treats retrieved text as data, an anti-compulsion guardrail, and truthful degraded mode when no
  provider credential exists.
- **Project ladder** — levels 1–10 including all 21 original projects, with data-provenance policy,
  definitions of done and an evidence trail. Evidence class (Practice Only → Signature Project) is
  computed from artefacts, never self-declared.
- **Skill graph** with evidence weighted by independence; **career engine** mapping two role blueprints
  to owned/missing evidence; **freelance simulations**; **seven-dimension technical English**; and a
  portfolio that refuses to generate unsupported CV lines.

## Run
```bash
npx drizzle-kit push
npx tsx --env-file=.env src/db/seed.ts
npm run build && npm run start
npx tsx --env-file=.env scripts/test.ts
```

## Documentation
`ARCHITECTURE.md`, `SECURITY.md`, `DATABASE.md`, `CONTENT_MODEL.md`, `CURRICULUM.md`, `AI_SYSTEM.md`,
`PROJECT_SYSTEM.md`, `CAREER_ENGINE.md`, `ENGLISH_SYSTEM.md`, `TESTING.md`, `DEPLOYMENT.md`,
`ENVIRONMENT.md`, `RESEARCH_SOURCES.md`, `CHANGELOG.md`, `docs/research/`.

## Honesty guarantees
No invented Harvard courses, job requirements, metrics, users, projects or achievements. Empty states
are real. Provider failures are shown as failures. Unverified claims say so.
