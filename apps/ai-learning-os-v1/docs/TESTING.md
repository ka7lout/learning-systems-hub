# Testing
`tests/content.test.ts`: original-curriculum preservation, 21 projects, graph build + acyclicity, per-lesson practice/transfer/notebook/mastery criteria, role→skill integrity, password hashing, state profiles.
`tests/isolation.test.ts` (requires DATABASE_URL): cross-owner project access denied, owner-scoped mastery, assisted-performance discount, career gap for a fresh user. Test users are created with `.test` emails and deleted afterwards.
Run: `npx tsx --test tests/*.test.ts`. Also: `npx next typegen`, `tsc --noEmit`, `next build`.
