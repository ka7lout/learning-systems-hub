# Research dossier

## Verification log for this build

| Date | Target | Method | Outcome | Status recorded |
|---|---|---|---|---|
| This build | Harvard CS concentration requirements (`csadvising.seas.harvard.edu/concentration/requirements/`) | Web search returning page content | Tag-based core confirmed: Programming 1/2; Formal Reasoning incl. Discrete Mathematics, Computational Limitations, Algorithms; Systems; Computation and the World; four Advanced CS courses; AI tag for honors. Mathematical preparation includes linear algebra (Math 21b/22a/23a/25a/55a or AM 21b/22a) and Stat 110 or listed equivalents. | `confirmed_current` |
| This build | Harvard CS requirements comparison page | Same search result set | Confirms CS 20 material, CS 32/50/51/61, CS 109a/109b, CS 120/121/136/152 appear in current or former requirement structures | `confirmed_current` (structure only) |
| This build | Existence of a Harvard undergraduate "AI Engineering" degree | Same sources | No such degree found in the requirement structure | `not_found` — the curriculum maps AI engineering onto CS/math/statistics/engineering instead |
| This build | CS50 term syllabus, Harvard Extension AI certificate composition, individual Harvard course syllabi | Not re-fetched | Supplied by the specification only | `likely_not_verified` |
| This build | NUWAVE and Navisoft reference postings | Not re-fetched | Stored as dated requirement blueprints, explicitly not live vacancies | `likely_not_verified` |
| This build | Learning-science references (Dunlosky et al.; Cepeda et al.; WWC practice guide), CEFR, OWASP API Top 10, WCAG 2.2 | Cited from the specification, not re-fetched | Used as the evidence base for retrieval practice, distributed practice, language descriptors, API security and accessibility | `likely_not_verified` |

## How statuses are used

Statuses are stored per source row (`sources` table) and surfaced in the UI at `/sources`, on each course
card in `/curriculum`, and in each lesson's source list. They are never collapsed into a single "verified"
badge, and a status is only raised after a documented re-check.

## Instructional design decisions (not external claims)

These are labelled `design_decision` or `research_hypothesis` in the register and in the UI:

- **State-adaptive delivery** (Deep / Drift / Fog / Overload) changes task size and scaffolding only. It is
  not a diagnosis and uses no clinical language.
- **Adaptive spacing** driven by rubric score, repetition, lapses and item stage, rather than a fixed ladder.
- **Attempt-before-explanation** as the mentor default, with the help level recorded so independent
  performance stays measurable.
- **Evidence-gated mastery**: L8–L9 require completed project evidence.
- **Anti-compulsion guardrail**: repeated identical verification requests are redirected to a test.

Hypotheses worth testing (stated as hypotheses, not findings): smaller task units reduce initiation
friction; explicit transfer checks improve generalization; requiring an attempt before a full explanation
preserves independent performance; contextual vocabulary practice improves technical English usage.

## Deliberate non-implementations

Automated source ingestion, live job-market scraping, GitHub OAuth and object storage are **absent rather
than simulated**. Each is documented in `ENVIRONMENT.md` with the variable that would enable it.
