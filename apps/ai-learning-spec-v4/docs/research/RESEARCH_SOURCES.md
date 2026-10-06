# Research Dossier — Source Status Log

Retrieval pass performed during the build session (2026). Statuses follow the
source-status model: `confirmed_current`, `confirmed_historical`,
`likely_not_verified`, `not_found`, `design_decision`, `research_hypothesis`.

## Verified during this session

| Claim | Source | Status |
|---|---|---|
| CS50 (COMPSCI 50) is current at Harvard College; C → Python → SQL → web; problem sets + final project | cs50.harvard.edu/college/2025/fall/syllabus (retrieved 2026) + beta.my.harvard.edu COMPSCI50 | confirmed_current |
| Harvard Extension AI Graduate Certificate exists: 4 online courses — 1 foundations of AI, 1 advanced NLP/ML, 1 deep learning & CV, 1 AI ethics/governance/law | extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate (retrieved 2026) | confirmed_current |
| Harvard has no standalone "AI Engineering" bachelor's degree by that exact name | Not found in retrieved official pages; consistent with prior verification in the specification | not_found (re-check each term) |

## Encoded with honest non-verified status

- Course identifiers CS51, CS181/CS1810, MATH 21A/B, STAT 110 (current term),
  APMTH 120, CS1280, CS1650, CSCI E-25/E-89/E-104/E-222 → `likely_not_verified`
  or `confirmed_historical` in `src/content/curriculum.ts`. Harvard renumbers
  and reschedules courses; re-verify against the official catalog before
  relying on any identifier.
- Target roles (Navisoft-style, NUWAVE-style) → student-supplied blueprints,
  `likely_not_verified` as live postings; encoded as reference roles only.

## Learning-science grounding (design basis, cited in the specification)

- Retrieval practice & spaced practice: Dunlosky et al. 2013 (doi:10.1177/1529100612453266);
  Cepeda et al. 2006; IES/WWC "Organizing Instruction and Study" practice guide — strong evidence.
- Interleaving, worked examples/fading, case-based transfer — moderate-to-strong evidence
  per the same guides.
- State-adaptive delivery (Deep/Drift/Fog/Overload), AI attempt-first tutoring,
  anti-reassurance guardrails → `research_hypothesis` / `design_decision`; the product
  treats them as testable design choices, never as proven facts.

## Rules enforced in product

- No invented Harvard content; every mapping carries a status badge in the UI.
- No fake analytics: all student-facing numbers derive from persisted events.
- AI provider failures surface as truthful degraded states, never simulated success.
