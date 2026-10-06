# Harvard College / SEAS — findings

Retrieved 2026-10-05 from official Harvard pages. Source ids refer to `source-register.md`.

## 1. There is no standalone "AI Engineering" bachelor's degree

**Status: `confirmed_current`.**

The Harvard CS concentration requirements page (`src-harvard-cs-requirements`) and the
concentration course-tag table (`src-harvard-cs-tags`) describe a **Computer Science**
concentration. Artificial intelligence appears as a *tag* applied to individual courses and as a
*requirement line* inside the Honors and Mind–Brain–Behavior plans. It is not a concentration, not
a degree, and not a named track on those pages.

This was re-verified in this pass rather than carried over from prior knowledge, because the claim
is load-bearing for the whole product: the system maps to Harvard material, it does not reproduce a
Harvard degree.

## 2. Structure of the concentration, as documented

From `src-harvard-cs-requirements`:

- Basic plan: 11–14 courses, 44–56 credits.
- Nine core CS courses on the basic plan; eleven on the Honors plan; eight for Joint and for
  Mind–Brain–Behavior.
- Programming 1 is satisfied by CS 32 or CS 50; Programming 2 by CS 51 or CS 61.
- Formal Reasoning: three courses. Discrete mathematics: one course (CS 20 or Applied Math 107),
  or placing out of it.
- One course each in Computational Limitations, Algorithms, Systems, and "Computation and the
  World".
- Advanced Computer Science (1000-level and above): four courses on the basic plan, five on
  Honors.
- A strict majority of core courses must carry Harvard CS numbers; at least five Harvard
  CS-numbered courses overall.
- Mathematical preparation: 2–5 courses, including linear algebra (AM 22a, Math 21b, 22a, 23a, 25a,
  55a or higher) and probability (Stat 110, ES 150, Math 154 or higher).
- A thesis is required for the Joint and MBB plans.

**An artificial intelligence course is required only on the Honors and MBB plans.** On the basic
plan a student can complete the concentration without an AI course. This is exactly the kind of
detail that a summary like "Harvard teaches AI" destroys.

## 3. CS50, specifically

From the Fall 2026 CS50 syllabus (`src-cs50-syllabus`), which is a term-specific document:

- Lectures Monday and Wednesday, 09:00–10:15, Science Center B.
- Default grading is SAT/UNS with the option to switch to a letter grade until the eleventh Monday
  of term; the course is not curved; two no-questions-asked absences are allowed.
- Week topics include arrays and strings with command-line arguments and cryptography (week 2),
  SQL with race conditions and injection (week 7), TCP/IP, DNS, HTTP and regular expressions
  (week 8), and Flask with routes, decorators, sessions and cookies (week 9).

CS50 is mapped in this curriculum as an **introductory programming and computer-systems reference
point**, not as evidence that a student has completed Harvard's CS concentration.

## 4. AI-tagged courses found in the tag table

`src-harvard-cs-tags` is the authoritative list of which courses carry which tag. AI-tagged entries
recorded in this pass include CS 1970 (AI Research Experiences) and AM 220 (Geometric Methods for
Machine Learning), alongside the mapped courses in `harvard-mappings.md`. Other notable entries read
from the same table:

- CS 32, CS 50 and CSCI S-111 are mutually exclusive for credit.
- CS 1710 (Visualization), CS 1060 (Software Engineering with Generative AI), CS 1066 (Build at the
  Speed of Thought), CS 85 (Introduction to Generative AI).
- AC 221 (Critical Thinking in Data Science), AM 121 (Optimization), AM 207 (Stochastic Methods).
- CS 10 / STAT 10 are marked "no longer offered".

## 5. What this means for the curriculum

The Harvard material is used in three ways and no others:

1. **Sequencing evidence** — the order in which an established programme introduces discrete
   mathematics, probability, algorithms and systems informed the 22-stage spine.
2. **Coverage checks** — topics in the original curriculum were checked against documented course
   descriptions to find gaps in both directions (see the gap matrix).
3. **Mapping** — individual courses are referenced as mappings with a verification status so that a
   student can go and read the primary page themselves.

Harvard material **never** replaces an item in the original curriculum, and no node in the product
is labelled "Harvard" unless a retrieved page supports it.
