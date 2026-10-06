# Research & Verification Dossier

**Research snapshot:** 2026-09-29 (implementation research pass)  
**Product label:** Harvard-informed self-study system; not a Harvard course, enrollment, or credential.  
**Database implementation constraint:** PostgreSQL + Drizzle ORM, as required by the hosting project. This intentionally supersedes the MongoDB preference in the product brief.

## Source-status vocabulary

- `confirmed_current`: present on a current official source/catalog page at the snapshot date. A listed course is not necessarily offered every term.
- `confirmed_historical`: reliable official/archival source establishes a past course or requirement, not its present availability.
- `likely_not_verified`: plausible, but primary evidence did not establish it.
- `not_found`: not found in the official sources checked; not proof that it cannot exist under another name.
- `design_decision`: product choice, not an externally established academic fact.
- `research_hypothesis`: a testable proposition, not a proven result.

## A. Harvard reality check

| Claim | Status | Evidence and limitation |
|---|---|---|
| Harvard College has a Computer Science concentration with basic, honors, joint, and MBB plans. The current basic plan calls for nine CS core courses plus mathematical preparation (11–14 total courses); the honors plan calls for eleven CS core courses plus math (13–16 total). | `confirmed_current` | Harvard CS Concentration Requirements, https://csadvising.seas.harvard.edu/concentration/requirements/ (accessed 2026-09-29). Requirements are a College concentration structure, not this self-study curriculum. |
| The CS structure explicitly includes Programming 1/2, Formal Reasoning (including discrete math, algorithms and computational limitations), Systems, Computation and the World, and Advanced CS. | `confirmed_current` | Same official requirements page. Course tags page: https://csadvising.seas.harvard.edu/concentration/courses/tags/. |
| No Harvard College undergraduate degree titled “Artificial Intelligence Engineering” was found in the official concentration materials checked. | `not_found` | The public CS requirements describe a CS concentration; no exact-title AI Engineering degree appeared in the official pages checked. This is carefully phrased as “not found,” not a claim that no related option exists. |
| Current catalog identifiers use renumbered courses: CS 1810 Machine Learning (formerly CS 181), CS 1820 Artificial Intelligence (formerly CS 182), CS 1840 Reinforcement Learning (formerly CS 184), and CS 1870 Introduction to Computational Linguistics and Natural-language Processing (formerly CS 187). | `confirmed_current` | Harvard CS course tags https://csadvising.seas.harvard.edu/concentration/courses/tags/ lists current tagged courses and prior numbers. Term offering and public syllabus availability vary. |
| Harvard CS 1810 was listed for Spring 2026. The official catalog description names supervised learning, ensembles/boosting, neural nets, SVMs, kernels, clustering, MLE, graphical models, HMMs, inference and computational learning theory; it expects multivariable calculus, linear algebra, probability and complexity theory, and non-trivial Python programs. | `confirmed_current` | My.Harvard official catalog: https://beta.my.harvard.edu/course/COMPSCI1810/2026-Spring/001. The 2026 Spring catalog entry is term-specific. It does not itself disclose all weekly problem-set details or grading weights. |
| Harvard CS50 College Fall 2026 is an introductory course, not the entire CS concentration. It uses lectures, sections, office hours, ten problem sets, three quizzes and a final project. The Fall 2026 syllabus lists 45% quizzes, 35% problem sets, 10% final project and 10% attendance. | `confirmed_current` | https://cs50.harvard.edu/college/2026/fall/syllabus/ (accessed 2026-09-29). The same syllabus’s AI rules are course-specific: allowed CS50 AI tools, not other AI coding assistants for assessed work. Do not apply that policy to other Harvard courses or this self-study product. |
| The CS50 syllabus describes staff-led sections, optional office hours, problem-set check-ins, project proposal/status/implementation milestones, and assessments integrating material across weeks. | `confirmed_current` | Same official CS50 College Fall 2026 syllabus. The self-study product can adapt the instructional pattern but is not claiming to reproduce Harvard staff or official grading. |
| Harvard College statistics offerings include STAT 110 Introduction to Probability; CS concentration materials cite Statistics 110 as a probability option. | `confirmed_current` | Harvard Statistics course list, https://statistics.fas.harvard.edu/statistics-courses (search result listed tentative Spring/Fall 2026; direct fetch was unavailable during this pass); Harvard CS requirements corroborate STAT 110. Term schedule is tentative and must be refreshed. |
| Harvard's current CS course-tag page lists AM 220 Geometric Methods for Machine Learning, CS 1280 Convex Optimization and Applications in Machine Learning, CS 1410 Computing Hardware, CS 1411 Computer Architecture, CS 1430 Computer Networks, CS 1450 Networking at Scale, CS 1610 Operating Systems, and CS 1810/1820/1840/1870. | `confirmed_current` | https://csadvising.seas.harvard.edu/concentration/courses/tags/ (accessed 2026-09-29). A course’s appearance in a tag list does not guarantee an upcoming section or that a syllabus is public. |
| Harvard Extension School’s online Artificial Intelligence Graduate Certificate requires four graduate-credit courses: one foundation, one advanced NLP/ML, one deep learning/computer vision, and one AI ethics/governance/law category. Offerings vary by term; Python and STAT 100-equivalent preparation is recommended. | `confirmed_current` | https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/ (accessed 2026-09-29). Category pathways are verified; exact course selection depends on current term and catalog. Extension is separate from Harvard College. |
| Harvard Extension School’s Data Science and Artificial Intelligence ALM is a 12-course / 48-credit graduate program: CSCI 101 and CSCI 106 admissions courses, four core courses, four electives, an on-campus precapstone, and a capstone. It is mostly online, with the three-week precapstone on campus. | `confirmed_current` | Official requirements: https://extension.harvard.edu/academics/programs/data-science-artificial-intelligence-graduate-program/data-science-artificial-intelligence-degree-requirements/ (accessed 2026-09-29). Program requirements and admissions details can change; the self-study path does not award credit. |
| Harvard Extension’s MATH E-142 Mathematics for AI/ML includes linear algebra, analytic geometry, vector calculus, optimization and probability, with applications including regression, dimensionality reduction, Gaussian mixtures and SVMs. | `confirmed_current` | Harvard Division of Continuing Education Course Browser: https://coursebrowser.dce.harvard.edu/course/mathematics-for-artificial-intelligence-and-machine-learning/ (catalog page accessed via official-source search; term offering must be rechecked). |
| Harvard Extension CSCI E-82 Advanced Machine Learning, Data Mining, and Artificial Intelligence was listed for Fall 2026; described as theory plus hands-on industry problems, including deep learning, clustering, dimensionality reduction, recommender systems and other topics, with Python prerequisites. | `confirmed_current` | Official DCE Course Browser: https://coursebrowser.dce.harvard.edu/course/advanced-machine-learning-data-mining-and-artificial-intelligence/ (Fall 2026 term listing in search results, accessed 2026-09-29). Course is Extension, not College. |
| Advanced Practical Data Science / MLOps course family is current in Harvard Applied Computation materials; course tags list AC215 and My.Harvard lists APCOMP 215 in Fall 2026. | `confirmed_current` | https://seas.harvard.edu/applied-computation/courses and https://beta.my.harvard.edu/course/APCOMP215/2026-Fall/001. The course page describes end-to-end AI workflows, RAG, LLMs/agents, deployment and monitoring, but the catalog entry does not supply a complete syllabus in this research pass. Historical course numbers (AC295/CS2871r) should not be presented as current. |
| A Harvard Extension “Foundations of Large Language Models” course at CSCI E-222, and exact prior candidate identifiers CSCI E-25/E-89/E-104, were not confirmed by an official current course page in this pass. | `likely_not_verified` | Do not seed these identifiers as current Harvard offerings. General LLM concepts remain in the Industry/Research Extension spine. |

## B. Learning-science foundation and boundaries

| Principle | Evidence status | Product interpretation |
|---|---|---|
| Retrieval practice and distributed/spaced practice have a substantial research base. | `confirmed_current` (research evidence; accessed 2026-09-29) | Implement short-answer recall and scheduled reviews across time. Avoid equating rereading or lesson completion with mastery. Evidence base: Dunlosky et al. (2013), https://doi.org/10.1177/1529100612453266; Cepeda et al. (2006), https://pubmed.ncbi.nlm.nih.gov/16719566/; Agarwal, Nunes & Blunt review, https://pmc.ncbi.nlm.nih.gov/articles/PMC5780548/. |
| Interleaving, elaboration/self-explanation, concrete examples and dual coding can help under some conditions; effects depend on task and context. | `confirmed_current` (research evidence; not a universal guarantee) | Use only where it serves discrimination, explanation or multiple representations. The six-strategy review also discusses domain limits and open questions. |
| A single fixed “best” spacing interval, 25/50-minute study block, or sensory environment works for everyone. | `not_found` | Avoid hard-coded schedules. The spacing literature reports that useful lags depend on retention interval and material; time-flexible study and state selection are design choices, not medical interventions. |
| IHLS Deep/Drift/Fog/Overload labels improve outcomes for every learner or diagnose ADHD/OCD/medical conditions. | `research_hypothesis` | Treat these as voluntary, non-diagnostic interaction preferences. Do not collect diagnoses or infer health conditions. Test effectiveness with consent, minimum data, delayed retention and transfer outcomes. |
| Requiring an attempt before a hint can reduce overreliance on AI. | `research_hypothesis` | Default to a student attempt for problem-solving tasks, while honoring explicit reference/lecture requests. Record assistance level and separate assisted from independent evidence. |

## C. Product and engineering evidence

- Next.js recommends a mature authentication library, separating authentication/session/authorization, placing secure checks near the data source, and using a data-access layer with minimal DTOs. Route handlers/server actions are public endpoints and need their own authorization checks. **Status:** `confirmed_current`. Source: https://nextjs.org/docs/app/guides/authentication (accessed 2026-09-29).
- Better Auth documents the Next.js App Router handler and a Drizzle adapter with PostgreSQL provider `pg`. **Status:** `confirmed_current`. Sources: https://better-auth.com/docs/integrations/next and https://better-auth.com/docs/adapters/drizzle (accessed 2026-09-29).
- OWASP API Security Top 10 (2023) includes broken object-level authorization, broken authentication, broken object-property authorization, unrestricted resource consumption, SSRF and unsafe API consumption. **Status:** `confirmed_current` (the OWASP 2023 edition remains the reference checked here). Source: https://owasp.org/API-Security/editions/2023/en/0x11-t10/.
- Puter documents `puter.ai.chat()` and OpenAI-compatible server access to `https://api.puter.com/puterai/openai/v1/`; its own service/model availability can change. Do not claim live AI works if the server token/provider fails. Keep calls behind a provider abstraction and return an explicit unavailable state. **Status:** `confirmed_current` for documented interface, not for this deployment’s credentials/availability. Sources: https://docs.puter.com/AI/chat/ and https://developer.puter.com/ai/deepseek/.
- AWS Well-Architected ML Lens recommends repeatable end-to-end ML pipelines, versioned code/data/config/model artifacts, CI/CD, monitoring, governance and rollback. This supports the production lifecycle spine, not a claim that all employers require a specific AWS service. **Status:** `confirmed_current`. Source: https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/mlops04-bp01.html.

## D. Job-market evidence policy

The Navisoft-style and Nuwave-style competency lists are encoded as **learner-supplied target-role blueprints**, not verified current openings or generic market requirements. This research pass did not establish current first-party job-posting text, region, seniority, compensation, or availability for either named reference. Career screens must label the blueprints accordingly and show no “current openings” count. A future dated market snapshot must use lawfully accessible first-party company career pages or permitted feeds and retain source URL, date, region, seniority, and confidence. Until then, no market statistics or employment promise is displayed.

Cross-role curriculum targets (Python, SQL, testing, API/system design, model evaluation, data pipelines, deployment, monitoring, security, communication) are an **Industry Extension design set** informed by AWS production lifecycle documentation and role blueprints supplied by the learner—not a statistical analysis of all 2026 job descriptions.

## E. Curriculum integration architecture

1. Preserve all eight Original Curriculum modules and every named topic. Session-count reconciliation is stored as a note and flexible session mapping, not content deletion.
2. Add Harvard College references as a separately labeled mapping layer. Current tags and verified 2026 term entries take precedence; older numbers appear only as historical aliases.
3. Add Harvard Extension certificate/ALM course structures separately. Do not merge credentials, admissions requirements, course numbering or academic policies with College.
4. Add Industry Extension topics (software engineering, C, systems, cloud, data engineering, security, deployment, interview/freelance and technical English), classified as practical extensions, not Harvard content.
5. Represent prerequisites as a directed graph; validate identifiers and acyclicity before publication. Make parallel math/programming/data branches explicit.
6. Each substantial lesson uses `Why → example/guided work → independent attempt → feedback → recall → transfer → case/build where appropriate → scheduled review`. This is an IHLS design, not a universal Harvard class template.
7. Mastery derives from persistent evidence (recall, transfer, project, debugging, delayed retrieval, independent performance), not view/completion events alone.
8. State adaptation is a human-selected presentation preference, not diagnosis. Preserve reduced-motion and sensory settings; never infer ADHD/OCD/illness.

## F. Evidence and iteration plan

The learning loop combines research-supported study techniques (retrieval and spacing) with product hypotheses (state adaptation, tiny-task initiation, hint-first AI, task-aware vocabulary). The latter require validation. Log only necessary, consented learning events. Compare independent immediate, delayed and transfer performance across pre-registered or otherwise clearly specified studies; report uncertainty, attrition and subgroup differences. Do not advertise causal benefit from dashboard analytics or an uncontrolled pilot.

## Sources (primary / research)

1. Harvard CS concentration requirements — https://csadvising.seas.harvard.edu/concentration/requirements/
2. Harvard CS course tags — https://csadvising.seas.harvard.edu/concentration/courses/tags/
3. Harvard CS50 College Fall 2026 syllabus — https://cs50.harvard.edu/college/2026/fall/syllabus/
4. Harvard My.Harvard CS1810 Spring 2026 — https://beta.my.harvard.edu/course/COMPSCI1810/2026-Spring/001
5. Harvard Statistics courses — https://statistics.fas.harvard.edu/statistics-courses
6. Harvard DCE AI Graduate Certificate — https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/
7. Harvard DCE Data Science and AI ALM requirements — https://extension.harvard.edu/academics/programs/data-science-artificial-intelligence-graduate-program/data-science-artificial-intelligence-degree-requirements/
8. Harvard DCE Mathematics for AI and ML — https://coursebrowser.dce.harvard.edu/course/mathematics-for-artificial-intelligence-and-machine-learning/
9. Harvard DCE advanced ML/Data Mining/AI — https://coursebrowser.dce.harvard.edu/course/advanced-machine-learning-data-mining-and-artificial-intelligence/
10. Harvard Applied Computation courses — https://seas.harvard.edu/applied-computation/courses
11. Next.js authentication guide — https://nextjs.org/docs/app/guides/authentication
12. Better Auth Next.js integration — https://better-auth.com/docs/integrations/next
13. Better Auth Drizzle adapter — https://better-auth.com/docs/adapters/drizzle
14. OWASP API Security Top 10 2023 — https://owasp.org/API-Security/editions/2023/en/0x11-t10/
15. Puter chat docs — https://docs.puter.com/AI/chat/
16. AWS Well-Architected ML Lens, MLOps — https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/mlops04-bp01.html
17. Dunlosky et al. (2013) — https://doi.org/10.1177/1529100612453266
18. Cepeda et al. (2006) — https://pubmed.ncbi.nlm.nih.gov/16719566/
19. Agarwal, Nunes & Blunt, “Teaching the science of learning” — https://pmc.ncbi.nlm.nih.gov/articles/PMC5780548/
