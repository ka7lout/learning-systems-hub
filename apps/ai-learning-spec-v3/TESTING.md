# Testing

## Current checks

- Next.js type generation
- strict TypeScript compilation
- production build
- PostgreSQL health route
- schema push

## Required test layers

- unit tests for schedule, mastery, scoring, state adaptation, and source validation;
- database integration tests for ownership and upsert behavior;
- API tests for Zod validation, rate limits, provider failure, and error semantics;
- authorization regression tests proving student A cannot retrieve student B data;
- AI adapter tests with deterministic provider fixtures;
- curriculum graph cycle and completeness validation;
- Playwright E2E for sign-in, diagnostic, lesson, mentor, practice, review, project evidence, career, English, and portfolio flows;
- accessibility and security regression tests.

Fixtures must be labeled test-only and never surface as student achievements.
