# Testing
- Unit and content tests: `node --experimental-strip-types --no-warnings --test tests/core.test.mjs` (spacing, mastery, guardrails, CV eligibility, graph validation, original-curriculum preservation).
- E2E and authorization smoke: start the server, then `BASE=http://localhost:3000 bash tests/e2e-smoke.sh`.
- Typecheck: `npx tsc --noEmit`; build: `npm run build`.
