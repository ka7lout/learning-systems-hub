# Curriculum model

## Preservation guarantee

The learner's original eight modules are reproduced **without deletion**, including every topic string, in
`src/content/original.ts`:

| Module | Lessons | Topics preserved |
|---|---|---|
| 1 Python Programming | 5 | fundamentals, data structures & functions, error handling & file I/O, algorithms & OOP, advanced OOP & ecosystem |
| 2 Math & Statistics | 5 | linear algebra, advanced linear algebra, calculus & optimization, statistics, probability |
| 3 Data Analysis with Python | 5 | NumPy, performance + inferential statistics + Pandas intro, wrangling, visualization, EDA capstone |
| 4 Excel & Power BI | 2 | kept deliberately as a business/data-analytics extension |
| 5 Databases & Data Engineering | 4 | SQL & design, advanced SQL & scraping, scraping & DE intro, ETL capstone |
| 6 Machine Learning | 6 | preprocessing, regression, classification, ensembles, unsupervised, capstone |
| 7 Deep Learning | 6 | one coherent programme: NN foundations, Keras practice, CV, sequences, NLP, Transformers & LLMs |
| 8 Development & MLOps | 1 | APIs, FastAPI, Streamlit, Docker, CI/CD, final capstone |

Nothing was replaced by Harvard material. Harvard, industry and research content is **additive** and lives
in `src/content/extended.ts`.

## Source layers

Each course declares exactly one primary source category:

- `Original Curriculum`
- `Harvard College`
- `Harvard Extension` (a separate school — never presented as Harvard College)
- `Industry Extension`
- `Research Extension`

## Verification statuses

`confirmed_current`, `confirmed_historical`, `likely_not_verified`, `not_found`, `design_decision`,
`research_hypothesis`. They are never collapsed. What was actually verified during this build:

- Harvard's CS concentration page describes a **tag-based core** — Programming 1/2, Formal Reasoning
  (Discrete Mathematics, Computational Limitations, Algorithms), Systems, Computation and the World,
  Advanced CS (four courses), with an AI requirement for honors — plus mathematical preparation including
  linear algebra and Stat 110 or listed equivalents. Marked `confirmed_current`.
- No Harvard undergraduate degree named "Artificial Intelligence Engineering" was found; the pathway maps
  AI engineering onto CS/math/statistics/engineering/Extension material instead of inventing one.
- Individual Harvard course numbers, syllabi and Extension programme compositions were **not**
  individually re-fetched and are marked `likely_not_verified`.

## Depth layering instead of duplication

Where a topic appears in several layers (e.g. linear regression), the layers add depth rather than repeat:
practical (scikit-learn) → statistical (assumptions, residuals) → mathematical (derivation, conditioning) →
theory (bias–variance, regularization as a prior) → case (metric and threshold decisions) → implementation.

## Lesson anatomy

Every lesson carries: why it matters, objectives, the preserved topic list, teaching blocks (concept,
worked example, code, caution, case, math, checklist) with optional B1-B2 and Arabic variants, notebook
guidance split into **must write / recommended / optional**, skill links, source references and an effort
estimate.

## Assessment model

Hand-written high-signal items cover prediction, debugging, derivation, case decisions, method selection,
code review, complexity and oral defence. Every remaining lesson gets generated free-recall, explanation
and transfer items grounded in its own objectives and topics. Multiple choice is intentionally marginal.

## Mastery and progression

Completion, competence and evidence are tracked separately. A lesson becomes `demonstrated` only when both
recall and transfer evidence exist. Skills reach L8–L9 only with completed project evidence. Role readiness
is expressed as "N of M hard requirements have independently demonstrated evidence", never as a prediction
about employment.
