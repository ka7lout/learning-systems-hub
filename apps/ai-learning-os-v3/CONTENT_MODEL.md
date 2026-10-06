# Content model

## Source categories (exactly one primary per node)
`Original Curriculum` · `Harvard College` · `Harvard Extension` · `Industry Extension` · `Research Extension`.
The system is never described as "the Harvard curriculum".

## Verification statuses (never collapsed)
`confirmed_current` · `confirmed_historical` · `likely_not_verified` · `not_found` · `design_decision` ·
`research_hypothesis`. Displayed on `/sources` with their meanings.

## Node shape
Course: id, stage, title, sourceCategory, level, priority (CORE/SUPPORT/ADVANCED/SPECIALIZATION/
INDUSTRY/RESEARCH), why, summary, estimatedHours, prerequisites, topics (verbatim), objectives,
masteryCriteria, skills, harvardMapping[candidate, institution, verification, adds, note], sourceRefs,
version, lastVerified.

Lesson: why, objectives, blocks (prose | math | code | worked | pitfall | case), notebook
{must, recommended, optional}, concepts, skills, sourceCategory, sourceRefs, estimatedMinutes, version.

Assessment item: type (20+), difficulty A–F, phase (recall | application | transfer), prompt, context,
expectedPoints, hints, referenceAnswer, skills.

## Publication validation (`src/db/seed.ts`)
Seeding fails if a prerequisite is unknown, a prerequisite cycle exists, mastery criteria or objectives
are missing, a lesson has no MUST WRITE guidance, a lesson has no assessment items, a lesson has no
transfer item, a skill or source reference is unknown, a project lacks a definition of done or a data
source decision, or a lesson id is duplicated.

## Classification is never deletion
Low-priority original topics (Excel, Power BI, Selenium, VBA-adjacent tooling) remain in the graph,
explicitly labelled as industry/business extensions rather than Harvard core.
