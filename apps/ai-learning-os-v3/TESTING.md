# Testing

`npx tsx --env-file=.env scripts/test.ts` — 72 checks across three layers.

## Unit
- `attemptScore`: help level penalises the recorded score; a miss stays zero.
- `masteryLevel`: recall alone cannot exceed L3; L8 requires project evidence; L9 requires delayed retention.
- `nextInterval`: a miss shortens the interval and increments lapses; success grows it; important items
  return sooner; intervals are bounded.
- Password hashing: correct password verifies, wrong password rejected, hash is salted.

## Content validation
- All seeded courses present; original Modules 1–8 preserved with spot-checks on specific topics
  (`Magic Methods`, `QLoRA`, `Pose Estimation`, `DAX Formulas`, `Selenium`, `Streamlit for ML apps`, …).
- All 21 original projects present by title, plus the ladder reaching level 10.
- Every lesson has MUST WRITE notebook guidance and at least one transfer-phase item.
- Multiple-choice is under 20% of assessment items; at least 10 distinct active task types exist.
- Source verification statuses are not collapsed, and unverified Harvard identifiers are labelled.

## Authorization / security regression
- User B cannot read user A's project by id, cannot mutate it (scoped update affects zero rows), and
  sees no evidence, mastery or review rows belonging to A.
- Test users are prefixed `test+…@example.invalid` and deleted; cascade deletion is verified.

Validation also runs `npx next typegen`, `tsc --noEmit` and `next build` with zero errors.

## Not yet automated
Browser-level E2E (Playwright) is not wired in this environment. The critical flows were exercised
manually: sign up → dashboard recommendation → lesson → attempt → mastery update → review scheduling →
grade review → project start → evidence → skills → career gap → English activity → portfolio.
