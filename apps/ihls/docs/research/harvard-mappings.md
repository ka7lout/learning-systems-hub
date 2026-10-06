# Harvard mappings

_Generated from `src/content/harvard.ts` by `npm run export:research`. Do not edit by hand._

A mapping points this curriculum at a documented Harvard offering. It is **not** a claim of equivalence, accreditation or affiliation.

## Reality check

**Question.** Does Harvard offer a standalone bachelor's degree in Artificial Intelligence Engineering?

**Answer.** Not found on Harvard's official undergraduate CS advising pages during this verification pass. Harvard College offers a Computer Science concentration (basic / honors / joint / MBB tracks) whose requirements include an Artificial Intelligence tag for the honors and MBB plans. Separately, Harvard Extension School offers an online Artificial Intelligence Graduate Certificate and a Data Science and Artificial Intelligence master's degree (ALM in Extension Studies).

**Status.** `confirmed_current` — checked 2026-10-05.

**Evidence.**

- src-harvard-cs-requirements
- src-harvard-ext-ai-cert
- src-harvard-ext-dsai-degree

**Caveat.** Absence of evidence on these pages is not proof of absence across all of Harvard. The claim is scoped to the pages retrieved on 2026-10-05 and must be re-verified before any external use.

## Gap and overlap matrix

| Area | Original curriculum | What the Harvard material adds | Decision | Status |
| --- | --- | --- | --- | --- |
| Programming | Module 1 Python Programming (Python-only) | CS50 adds C, memory, pointers, compilation; CS51 adds abstraction/design; CS61 adds machine organization | Add a C + systems layer alongside Python. Python depth is unchanged. | `design_decision` |
| Algorithms & theory | Linear/binary search, bubble sort, recursion inside Module 1 session 4 | CS1200 (algorithms, computability, complexity), CS1240 (data structures & algorithms), CS1210 (theory) | Add a dedicated algorithms + complexity course. Original items stay where they are and are revisited (spiral, §101). | `design_decision` |
| Mathematics | Module 2: linear algebra, calculus/optimization, statistics, probability (5 sessions) | Dedicated linear algebra course, STAT 110 probability, CS1280 convex optimization | Keep Module 2 intact as the spine; add depth courses afterwards rather than replacing it. | `design_decision` |
| Machine learning | Module 6 (12 sessions, applied scikit-learn) | CS1810 Machine Learning, CS1820 AI, CS1840 Reinforcement Learning | Original applied ML first, theory layer second (§41 layered depth). | `design_decision` |
| Data systems | Module 5 SQL, scraping, ETL | CS1650 Data Systems (indexing, concurrency, recovery) | Keep BeautifulSoup/Regex/Selenium/ETL; add systems-level database internals as ADVANCED. | `design_decision` |
| Excel & Power BI | Module 4 (4 sessions) | No Harvard equivalent found in the CS concentration | Preserved as an explicit Industry/business analytics layer, labelled Original Curriculum. Not deleted (§69). | `design_decision` |
| MLOps / production AI | Module 8 (FastAPI, Streamlit, Docker, CI/CD) | AC215 Advanced Practical Data Science, MLOps | Original tools kept; full lifecycle (§136) added as an Industry Extension course. | `design_decision` |
| LLMs / RAG / agents | Module 7 session 6 (Transformers, RAG, vector DBs, agents) | Extension 'Foundations of Large Language Models'; CS1870 NLP | Original topics preserved; RAG/GraphRAG/agents expanded into their own Industry Extension courses (§137, §138). | `design_decision` |

## Mapped offerings

| identifier | title | offering body | status | informs | verified |
| --- | --- | --- | --- | --- | --- |
| CS50 | Introduction to Computer Science | Harvard College | `confirmed_current` | c-cs-foundations, c-python, c-databases | 2026-10-05 |
| CS20 | Discrete Mathematics for Computer Science | Harvard College | `confirmed_current` | c-cs-foundations, c-math-foundations | 2026-10-05 |
| CS51 | Abstraction and Design in Computation | Harvard College | `confirmed_current` | c-python, c-software-engineering | 2026-10-05 |
| CS61 | Systems Programming and Machine Organization | Harvard College | `confirmed_current` | c-cs-foundations | 2026-10-05 |
| CS1200 (formerly CS120) | Introduction to Algorithms, Computability, and Complexity | Harvard College | `confirmed_current` | c-cs-foundations | 2026-10-05 |
| CS1240 (formerly CS124) | Data Structures and Algorithms | Harvard College | `confirmed_current` | c-cs-foundations | 2026-10-05 |
| CS1210 (formerly CS121) | Introduction to Theoretical Computer Science | Harvard College | `confirmed_current` | c-cs-foundations | 2026-10-05 |
| STAT 110 | Probability (satisfies the CS concentration probability requirement) | Harvard College | `confirmed_current` | c-math-foundations, c-statistics | 2026-10-05 |
| MATH 21B / MATH 22A / AM 22A | Linear algebra options satisfying the CS concentration requirement | Harvard College | `confirmed_current` | c-math-foundations | 2026-10-05 |
| CS1280 / AM122 (formerly CS128) | Convex Optimization and Applications in Machine Learning | Harvard College | `confirmed_current` | c-math-foundations, c-ml | 2026-10-05 |
| CS1810 (formerly CS181) | Machine Learning | Harvard College | `confirmed_current` | c-ml | 2026-10-05 |
| CS1820 (formerly CS182) | Artificial Intelligence | Harvard College | `confirmed_current` | c-ml, c-agents | 2026-10-05 |
| CS1840 (formerly CS184) | Reinforcement learning | Harvard College | `confirmed_current` | c-research | 2026-10-05 |
| CS1870 (formerly CS187) | Introduction to Computational Linguistics and Natural-language Processing | Harvard College | `confirmed_current` | c-deep-learning, c-llm | 2026-10-05 |
| CS1090A/B (formerly CS109A/B), also STAT109A/B, AC209A/B | Data Science 1 & 2 | Harvard College | `confirmed_current` | c-data-analysis, c-statistics | 2026-10-05 |
| CS1650 (formerly CS165) | Data Systems | Harvard College | `confirmed_current` | c-databases, c-data-engineering | 2026-10-05 |
| CS1050 (formerly CS105) | Privacy and Technology | Harvard College | `confirmed_current` | c-responsible-ai | 2026-10-05 |
| CS1410 / ECE141 and CS1411 / ECE146 | Computing Hardware; Computer Architecture | Harvard SEAS | `confirmed_current` | c-cs-foundations | 2026-10-05 |
| AC215 | Topics in Applied Computation: Advanced Practical Data Science, MLOps | Harvard SEAS | `confirmed_current` | c-mlops, c-cloud | 2026-10-05 |
| AI Graduate Certificate (Harvard Extension School) | Four online courses: foundations of AI; advanced NLP and ML; deep learning and computer vision; AI ethics, governance and law | Harvard Extension | `confirmed_current` | c-ml, c-deep-learning, c-llm, c-responsible-ai | 2026-10-05 |
| ALM in Extension Studies — Data Science and Artificial Intelligence | Harvard Extension master's degree (12 courses, 11 online + one 3-week on-campus) | Harvard Extension | `confirmed_current` | c-data-engineering, c-llm, c-responsible-ai, c-research | 2026-10-05 |
| CSCI E-222 | Foundations of Large Language Models (identifier unconfirmed) | Harvard Extension | `likely_not_verified` | c-llm | 2026-10-05 |
| CSCI E-25 / CSCI E-89 / CSCI E-104 | Extension computer-vision / deep-learning identifiers (unconfirmed) | Harvard Extension | `likely_not_verified` | c-deep-learning | 2026-10-05 |
| APCOMP 215 | Advanced Practical Data Science / MLOps (cross-listing unconfirmed) | Harvard SEAS | `likely_not_verified` | c-mlops | 2026-10-05 |
| MATH 55A | Listed only as one option satisfying linear algebra — not recommended here | Harvard College | `confirmed_current` | c-math-foundations | 2026-10-05 |
| ECE50 / ECE152 / ECE155 / ECE156 | ECE identifiers discussed in §38 (unconfirmed) | Harvard SEAS | `not_found` | c-cs-foundations | 2026-10-05 |

### Evidence per mapping

- **CS50 — Introduction to Computer Science** (source `src-cs50-fall-2026-syllabus`): Fall 2026 syllabus: ten problem sets, three quizzes, eleven sections, final project; weeks cover Scratch, C, Arrays, Algorithms, Memory, Data Structures, Python, SQL, HTML/CSS/JS, Flask. Tagged corecs + programming1 on the CS concentration tags page.
- **CS20 — Discrete Mathematics for Computer Science** (source `src-harvard-cs-tags`): Listed with tags corecs, formalreasoning, discretemath on the official CS concentration course tags page.
- **CS51 — Abstraction and Design in Computation** (source `src-harvard-cs-tags`): Listed with tags corecs, programming2.
- **CS61 — Systems Programming and Machine Organization** (source `src-harvard-cs-tags`): Listed with tags corecs, programming2, systems.
- **CS1200 (formerly CS120) — Introduction to Algorithms, Computability, and Complexity** (source `src-harvard-cs-tags`): Listed with tags corecs, formalreasoning, complimitations, algorithms, advancedcs. Renumbering from CS120 confirmed on the same page.
- **CS1240 (formerly CS124) — Data Structures and Algorithms** (source `src-harvard-cs-tags`): Listed with tags corecs, formalreasoning, algorithms, intermediatealgorithms, advancedcs.
- **CS1210 (formerly CS121) — Introduction to Theoretical Computer Science** (source `src-harvard-cs-tags`): Listed with tags corecs, formalreasoning, complimitations, advancedcs.
- **STAT 110 — Probability (satisfies the CS concentration probability requirement)** (source `src-harvard-cs-requirements`): Requirements page: 'Probability: One course in probability. Satisfied by Statistics 110, Engineering Sciences 150, Mathematics 154, or a more advanced course.'
- **MATH 21B / MATH 22A / AM 22A — Linear algebra options satisfying the CS concentration requirement** (source `src-harvard-cs-requirements`): Requirements page: 'Linear algebra: One course in linear algebra. Satisfied by Applied Mathematics 22a, Mathematics 21b, Mathematics 22a, Mathematics 23a, Mathematics 25a, Mathematics 55a, or a more advanced course.'
- **CS1280 / AM122 (formerly CS128) — Convex Optimization and Applications in Machine Learning** (source `src-harvard-cs-tags`): Listed with tags corecs, formalreasoning, advancedcs.
- **CS1810 (formerly CS181) — Machine Learning** (source `src-harvard-cs-tags`): Listed with tags corecs, computationandtheworld, ai, advancedcs.
- **CS1820 (formerly CS182) — Artificial Intelligence** (source `src-harvard-cs-tags`): Listed with tags corecs, computationandtheworld, ai, advancedcs.
- **CS1840 (formerly CS184) — Reinforcement learning** (source `src-harvard-cs-tags`): Listed with tags corecs, computationandtheworld, ai, advancedcs.
- **CS1870 (formerly CS187) — Introduction to Computational Linguistics and Natural-language Processing** (source `src-harvard-cs-tags`): Listed with tags corecs, computationandtheworld, ai, advancedcs. Confirms the identifier discussed in §38.
- **CS1090A/B (formerly CS109A/B), also STAT109A/B, AC209A/B — Data Science 1 & 2** (source `src-harvard-cs-tags`): Both listed on the tags page. CS1090A note: 'Also advancedcs if approved on a plan of study before 2025-02-01' — i.e. the advanced tag was removed for 2025 and later plans.
- **CS1650 (formerly CS165) — Data Systems** (source `src-harvard-cs-tags`): Listed with tags corecs, programming2, systems, advancedcs.
- **CS1050 (formerly CS105) — Privacy and Technology** (source `src-harvard-cs-tags`): Listed with tags corecs, advancedcs.
- **CS1410 / ECE141 and CS1411 / ECE146 — Computing Hardware; Computer Architecture** (source `src-harvard-cs-tags`): Both listed with systems + advancedcs tags, cross-listed with ECE numbers.
- **AC215 — Topics in Applied Computation: Advanced Practical Data Science, MLOps** (source `src-harvard-cs-tags`): Listed with tags corecs, advancedcs on the CS concentration tags page.
- **AI Graduate Certificate (Harvard Extension School) — Four online courses: foundations of AI; advanced NLP and ML; deep learning and computer vision; AI ethics, governance and law** (source `src-harvard-ext-ai-cert`): Program page lists exactly those four categories, a B-grade minimum in each course, a three-year completion window, and no formal application.
- **ALM in Extension Studies — Data Science and Artificial Intelligence — Harvard Extension master's degree (12 courses, 11 online + one 3-week on-campus)** (source `src-harvard-ext-dsai-degree`): Program page lists example core courses (Data Mining; Dynamic Modeling and Forecasting in Big Data; Ethics, Governance and Laws of Data Science, AI and Creative Systems; Introduction to NLP; Data Engineering for Analytics) and electives including Deep Learning and Foundations of Large Language Models. Admission via CSCI 101 and CSCI 106.
- **CSCI E-222 — Foundations of Large Language Models (identifier unconfirmed)** (source `src-harvard-ext-dsai-degree`): A course titled 'Foundations of Large Language Models' appears as an example elective on the DSAI master's page, but the CSCI E-222 number was not shown there and was not confirmed in the course catalog during this pass.
- **CSCI E-25 / CSCI E-89 / CSCI E-104 — Extension computer-vision / deep-learning identifiers (unconfirmed)** (source `src-harvard-ext-ai-cert`): Not located on the retrieved Extension pages. The certificate page states that course options vary by term and must be checked in the DCE Course Search platform.
- **APCOMP 215 — Advanced Practical Data Science / MLOps (cross-listing unconfirmed)** (source `src-harvard-cs-tags`): AC215 with the title 'Topics in Applied Computation: Advanced Practical Data Science, MLOps' is confirmed on the tags page; the APCOMP 215 form of the identifier was not shown there.
- **MATH 55A — Listed only as one option satisfying linear algebra — not recommended here** (source `src-harvard-cs-requirements`): Appears in the official list of courses satisfying the linear algebra requirement.
- **ECE50 / ECE152 / ECE155 / ECE156 — ECE identifiers discussed in §38 (unconfirmed)** (source `src-harvard-cs-tags`): Not present on the CS concentration tags page. The confirmed hardware-adjacent cross-listings there are CS1410/ECE141, CS1411/ECE146 and CS1480/ECE148. The SEAS ECE catalog was not retrieved in this pass.

