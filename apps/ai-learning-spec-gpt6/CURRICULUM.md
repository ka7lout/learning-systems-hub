# Curriculum Architecture

The full curriculum dataset is authored in `src/data/curriculum.ts`, validated, and seeded into `curriculum_nodes`, `skills`, `projects_catalog`, `career_roles`, `job_requirements`, `english_terms` and `curriculum_sources`.

## Preserved Original Curriculum

1. Python Programming — 10 sessions, five groups map to two flexible sessions each.
2. Math & Statistics — five sessions/five groups.
3. Data Analysis with Python — 10-session envelope; five source groups map to two flexible sessions each.
4. Excel & Power BI — four sessions; two Excel and two Power BI sessions.
5. Databases & Data Engineering — eight sessions; four source groups map to two flexible sessions each.
6. Machine Learning — 12 sessions; six source groups map to two flexible sessions each.
7. Deep Learning — one coherent 16-session program. The duplicated “Module 7” heading is consolidated without deleting either part or any topic.
8. Development & MLOps — two sessions.

Every source topic and all 21 original project titles are retained in the seed data. Reconciliation notes are stored with the module rather than inventing a hidden source schedule.

## Additive layers

- Verified-current Harvard College CS, mathematics/statistics, systems, AI, data science and engineering references.
- Harvard Extension AI certificate and Data Science & AI ALM structures, separate from College.
- Industry extensions: C/CS foundations, software engineering, data systems, cloud, MLOps, security, LLM/RAG/agents, career, freelancing and technical English.
- Research extension: papers, reproduction, ablation, experimental reasoning and scientific communication.

## Dependency plan

Parallel foundations: Python, mathematics, CS reasoning, SQL/data collection and English. Data analysis follows Python foundations; classical ML follows math/Python/data foundations; deep learning follows ML and calculus/linear algebra; LLM/RAG/agents follow deep learning plus software engineering; production cloud/MLOps follows models, data and software systems. Ethics/security is integrated throughout, not deferred to one final lecture. The database graph is cycle-checked at seed time.

## Mastery and workload

The intended core threshold is reliable independent application with acceptable transfer on core prerequisites. Deep/graduate/research mastery is reserved for appropriate specialties. Effort values are planning estimates, not mandatory daily hours. No learner is held to an artificial “100% complete” gate.

## Harvard reality snapshot

See `docs/research/verification-dossier.md` for the official current sources, status labels, dates, exact known course descriptions, and what could not be verified. Course offering dates and requirements must be checked again before reuse in a later academic year.
