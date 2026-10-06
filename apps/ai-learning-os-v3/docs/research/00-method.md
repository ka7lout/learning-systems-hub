# Research dossier — method

## Procedure followed
1. Primary sources first: official Harvard program and advising pages for structure claims.
2. Record for each source: URL, title, publisher, type, retrieval date, verification status, notes.
3. Never upgrade a status without a retrieval. Anything not fetched in this build stays
   `likely_not_verified`, including identifiers that are probably correct.
4. Separate Harvard College from Harvard Extension School in every statement.
5. Encode uncertainty in the data model, not in prose that the UI can quietly drop.

## Scope limits of this build (stated honestly)
- Two Harvard pages were retrieved and verified. Per-course syllabi, weekly schedules, problem-set
  structures and grading weights were not retrieved, so none are encoded.
- Job postings were not scraped; role blueprints come from the specification text and are labelled.
- Learning-science claims rest on well-known published reviews, cited with their publication years and
  marked historical rather than "current".

## Consequence for the product
Course pages render the mapping table with each candidate's verification status. `/sources` explains
what each status means. The mentor's system policy forbids inventing course numbers, syllabi or
grading weights, and the seed script fails if a node references an unknown source id.
