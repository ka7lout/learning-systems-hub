# Ismaili Harvard AI Engineering Learning OS

A Harvard-informed, self-directed AI-engineering learning environment. It preserves the complete eight-module learner-provided curriculum, adds verified Harvard College and Harvard Extension reference layers, and records evidence of recall, transfer, independent work, projects, skills and technical communication.

This is **not** a Harvard course, enrollment, degree or credential. Harvard College and Harvard Extension are separately labeled. Every Harvard assertion includes an official source, a status and a verification date. The dated research dossier is in [`docs/research/verification-dossier.md`](docs/research/verification-dossier.md).

## Stack

- Next.js App Router, React and strict TypeScript
- PostgreSQL through Drizzle ORM (platform runtime requirement; the original product brief's MongoDB preference is intentionally not used here)
- Better Auth with the Drizzle PostgreSQL adapter
- Zod-validated endpoints and Lucide icons
- Puter-compatible server-side AI provider abstraction; live provider calls require a configured server token and are never represented as successful if unavailable

## Start locally

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `AUTH_SECRET` from secure local/deployment configuration.
2. Install dependencies with `npm install`.
3. Apply the schema with `npx drizzle-kit push`.
4. Start with `npm run dev`.
5. Visit `/sign-up`, create a real learner account, then sign in. The shared curriculum seeds lazily on the learning workspace; learner progress is empty until an action is persisted.

See [`ENVIRONMENT.md`](ENVIRONMENT.md), [`DATABASE.md`](DATABASE.md) and [`DEPLOYMENT.md`](DEPLOYMENT.md).

## What is present

- Canonical seeded curriculum graph and prerequisite-cycle checks.
- Original eight module outline, all named topics and 21 named original project ideas.
- Separate verified-current / historical / not-verified Harvard mapping records.
- State-selected adaptive study support without medical diagnosis.
- Persistent learner-owned mastery events, review items, projects, evidence, skills, role gaps, English practice and mentor messages.
- Attempt-first learning interactions and explicit independent-vs-assisted evidence.
- Truthful provider-not-configured and no-evidence states.

## Important limits

GitHub OAuth/repository inspection, live job-feed ingestion, file/object storage, browser speech scoring, remote code execution, institutional grades, real employment outcomes and hosted research-study claims are not implemented. These are not simulated. Python/ML execution belongs in local development, Codespaces, Colab or Kaggle; this application does not execute arbitrary student code on its server. Market role blueprints are learner-supplied references, not verified live openings.

## Verification

Run the prescribed Next.js type generation, TypeScript, production build and managed preview/database healthcheck before release. See [`TESTING.md`](TESTING.md).
