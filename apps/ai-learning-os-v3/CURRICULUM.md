# Curriculum

## Spine (22 stages, prerequisite-ordered)
Mathematical Foundations · Programming Foundations · Computer Science Foundations · Data Foundations ·
Statistics and Probability · Data Analysis · Data Engineering · Classical ML · Deep Learning ·
Computer Vision · NLP · Transformers/LLMs · RAG/GraphRAG · Agents · Software Engineering for AI ·
Cloud · MLOps · Security/Responsible AI/Governance · Technical English · Career · Freelancing · Research.

## Original curriculum preservation
Every topic of the original eight modules is stored verbatim in the `courses.topics` array and is
visible on each course page. Nothing was deleted, summarised away or replaced by a Harvard equivalent.

| Original module | Node id | Topics preserved | Classification |
|---|---|---|---|
| 1 Python Programming | `orig-m1-python` | 40 | Original Curriculum / CORE |
| 2 Math & Statistics | `orig-m2-math-stats` | 35 | Original Curriculum / CORE |
| 3 Data Analysis with Python | `orig-m3-data-analysis` | 55 | Original Curriculum / CORE |
| 4 Excel & Power BI | `orig-m4-excel-powerbi` | 14 | Original Curriculum / INDUSTRY (explicitly not Harvard core) |
| 5 Databases & Data Engineering | `orig-m5-databases` | 29 | Original Curriculum / CORE |
| 6 Machine Learning | `orig-m6-ml` | 45 | Original Curriculum / CORE |
| 7 Deep Learning (unified 16-session track) | `orig-m7-deep-learning` | 67 | Original Curriculum / CORE |
| 8 Development & MLOps (+ lifecycle depth) | `orig-m8-mlops` | 19 | Original Curriculum / CORE |

Where the original outline's session count did not match its grouped bullets (Modules 3, 4, 5, 6, 7),
the material was reorganised into coherent nodes — never reduced.

## Additive layers
- **Harvard-informed academic depth**: `harvard-math-depth` (matrix calculus, MLE/MAP, convexity,
  estimator properties), `cs-foundations-core` (C, memory, data structures, algorithms, formal
  reasoning), `cs-systems` (organisation, OS, concurrency, networking, accelerators).
- **Modern AI**: `llm-engineering`, `rag-engineering`, `agent-engineering`.
- **Engineering and production**: `software-eng-ai`, `cloud-engineering`, `security-responsible-ai`,
  `de-big-data`.
- **Professional**: `technical-english`, `career-engineering`, `freelance-engineering`.
- **Research**: `research-engineering`.

## Harvard reality check (as verified in this build)
- The Harvard CS concentration is structured around tagged requirement areas — programming, formal
  reasoning, systems, computation and the world, advanced computer science — plus mathematical
  preparation (linear algebra and a probability/multivariable pathway including Stat 110).
  Source: csadvising.seas.harvard.edu (confirmed_current).
- Harvard Extension School offers an online **Artificial Intelligence Graduate Certificate** of four
  courses: foundations of AI; advanced NLP and machine learning; deep learning and computer vision;
  AI ethics, governance and law. Source: extension.harvard.edu (confirmed_current). This is Extension,
  not Harvard College, and it is a certificate, not a bachelor's degree in AI engineering.
- **No** Harvard College bachelor's degree named "Artificial Intelligence Engineering" was found.
- Individual course numbers mentioned in the specification (CS 20/50/51/61/1200/1810/1870/1650,
  MATH 21a/21b/22a, STAT 110, APMTH 120, CSCI E-25/E-89/E-104/E-222, APCOMP 215, ECE 50/152/155/156)
  were **not** individually re-verified against the live catalogue in this build. They are stored as
  candidate mappings with status `likely_not_verified` and are displayed that way.

## Depth layering instead of repetition
A recurring concept (e.g. linear regression) appears once per depth layer — practical, statistical,
mathematical, theoretical, case, implementation — rather than being retaught identically.
