# Ismaili Harvard AI Engineering Learning OS

A Harvard-informed, Harvard-mapped, research-informed AI Engineering self-study pathway delivered through the **Ismaili Harvard Learning Science (IHLS)** method. It is not a Harvard programme and never claims to be one.

- **Curriculum as a graph**: 22-stage spine; 8 original modules (every topic preserved, 34 lesson blocks, ~290 topic nodes) + 33 additive lessons labelled Harvard College / Harvard Extension / Industry / Research, with a verified, acyclic prerequisite DAG.
- **Learning system**: active mastery engine (no flashcard core), state-adaptive delivery (Focused / Drifting / Starting feels hard / Too much at once), attempt-first practice with rubric self-scoring and error classification, adaptive spaced review, interleaved Practice Lab, transfer items in every lesson, notebook MUST/RECOMMENDED/OPTIONAL guidance.
- **AI Mentor Council**: Lead Mentor → specialist routing (Socratic Tutor, Examiner, English Coach, Project Supervisor, Study Coach, …) over a provider abstraction (Puter, DeepSeek V4 Pro/Flash routing). Truthful unavailable/failure states.
- **Proof layer**: 25 projects (the original 21 + agents, production AI, research reproduction), definition-of-done gates, evidence capture, skill evidence, portfolio classification, CV-evidence rule.
- **Career / Freelance / English / Research**: two target-role blueprints with gap analysis; freelance, incident, interview, system-design, English and research-critique simulations; source registry with explicit verification status.

## Run
```
npm install
cp .env.example .env   # fill DATABASE_URL (and PUTER_AUTH_TOKEN to enable the mentor)
npx drizzle-kit push
npx tsx scripts/seed.ts   # optional: the app seeds itself on first request when empty
npm run build && npm start
```
The first account created on a fresh database becomes `admin`.

## Tests
```
npx tsx --test tests/content.test.ts tests/isolation.test.ts
```
See `docs/` for ARCHITECTURE, SECURITY, CONTENT_MODEL, CURRICULUM, AI_SYSTEM, CAREER_ENGINE, PROJECT_SYSTEM, ENGLISH_SYSTEM, DATABASE, DEPLOYMENT, TESTING, ENVIRONMENT, RESEARCH_SOURCES, CHANGELOG.
