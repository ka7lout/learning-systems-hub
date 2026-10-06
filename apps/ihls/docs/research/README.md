# Research dossier

Retrieval pass: **2026-10-05**. Everything in this folder describes what was actually read on that
date, by whom, and how confident the record is. Nothing here is written from memory.

## Files

| File | Contents |
| --- | --- |
| `source-register.md` | Generated. Every source record with URL, publisher, retrieval date, status and the extract read from the page. |
| `harvard-mappings.md` | Generated. The Harvard reality check, the gap/overlap matrix and all 26 mapped offerings with their evidence. |
| `harvard-college.md` | Narrative findings for Harvard College / SEAS. |
| `harvard-extension.md` | Narrative findings for the Extension School. |
| `job-market.md` | What could and could not be verified about the AI engineering job market. |
| `learning-science.md` | The evidence behind the method, graded by strength. |
| `conflicts.md` | Source conflicts, recorded rather than resolved. |

Regenerate the two generated files with:

```bash
npm run export:research
```

## Status model

These six statuses are used everywhere in the system and are never collapsed into
"verified / unverified":

| Status | Meaning |
| --- | --- |
| `confirmed_current` | The page was fetched on the retrieval date and the statement appears on it. |
| `confirmed_historical` | The statement was true for a stated past term or version and may no longer hold. |
| `likely_not_verified` | Recorded, plausible, but the primary source was not reached in this pass. Not evidence. |
| `not_found` | A search was performed and no supporting primary source was located. A real result. |
| `design_decision` | A choice made by this project. Not a fact about the world. |
| `research_hypothesis` | A testable claim the system assumes but has not demonstrated. |

## Rules that governed this pass

1. Official pages only for course and programme claims. Blogs, forums and course-aggregator sites
   are not sufficient evidence for what an institution offers.
2. Harvard College and Harvard Extension School are different institutions with different
   admissions, credentials and catalogues. They are never merged in a claim.
3. CS50 is one course. It is not the Computer Science concentration, and completing it is not
   completing a degree requirement set.
4. A course listing is time-stamped evidence. "Offered in Fall 2026" is a different claim from
   "offered".
5. Where sources disagree, the disagreement is recorded (see `conflicts.md`). It is not resolved by
   picking the more convenient page.
6. No figure is reported without the publication that produced it. Where a number is quoted by an
   institution but originates elsewhere, the chain is stated and the record stays
   `likely_not_verified` until the originating publication itself is read.
