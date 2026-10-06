# Ismaili Harvard AI Engineering Learning OS

A learning system for AI engineering: a prerequisite-ordered curriculum graph, a mastery engine that
advances on evidence rather than on pages read, spaced review, a project ladder with an evidence
trail, per-requirement career mapping, and a technical-English layer.

Not affiliated with or endorsed by Harvard University. Harvard references are **mappings** to
publicly documented offerings, each carrying the date it was retrieved and whether it was verified.

## Run it

```bash
npm install
cp .env.example .env.local     # optional; the app runs with no variables set
npm run seed                   # loads the curriculum into the data store
npm run dev                    # http://localhost:3000
```

The first account you register becomes the administrator.

With no environment variables the app is fully usable: curriculum, lessons, practice, review,
projects, skills, career, portfolio and settings all work against a local JSON data store. The AI
mentor reports itself unavailable instead of inventing answers.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on `0.0.0.0:3000`. |
| `npm run build` / `npm start` | Production build and server. |
| `npm run seed` | Validates the curriculum graph and seeds it. Refuses to run on an invalid graph. |
| `npm run validate:content` | Graph validation plus an independent re-count of the original curriculum's 293 topics. |
| `npm run test` | Vitest: content integrity, tenant isolation, mastery, review, career, tasks, passwords, secret scanning. |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` / ESLint. |
| `npm run smoke` | End-to-end request check of every route against a running server. |
| `npm run export:research` | Regenerates the generated files in `docs/research/`. |
| `npm run verify` | typecheck → lint → content validation → tests. |

## Environment

All optional; each one unlocks a capability and its absence is reported truthfully in-app at
`/admin` and `/api/health`.

| Variable | Effect when set |
| --- | --- |
| `MONGODB_URI` | Uses MongoDB instead of the local JSON store; `npm run seed` creates the indexes. |
| `PUTER_AUTH_TOKEN`, `PUTER_MODEL_NAME`, `PUTER_BASE_URL` | Enables the AI mentor. |
| `AUTH_SECRET` | Reserved for signed artefacts beyond the session cookie. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Reserved; OAuth is not implemented. |
| `BLOB_READ_WRITE_TOKEN` | Reserved; file upload is not implemented. |
| `SEARCH_API_KEY` | Reserved; no search provider is wired. |
| `CRON_SECRET` | Reserved for scheduled jobs. |

Never prefix any of these with `NEXT_PUBLIC_`. A test fails the build if you do.

## What is in the box

- **22 stages · 22 courses · 67 lessons · 579 topics · 45 assessment items · 52 skills · 21 projects
  · 2 career roles · 15 sources · 26 Harvard mappings · 20 technical-English terms.**
- The original curriculum — 8 modules, 67 sessions, **293 topics** — preserved verbatim. A test
  fails if a single topic goes missing.
- 14 lessons are fully authored. The other 53 are honest outlines and say so on the page.

## Documentation

- `docs/architecture.md` — stack, data layer, request path, isolation, security, and what was
  deliberately not built.
- `docs/research/` — the source dossier: register, Harvard mappings, narrative findings, and
  recorded source conflicts.
- `docs/audit.md` — the production audit against the specification's final checklist.

## Principles this codebase enforces mechanically

1. Missing data produces a truthful empty state, never a plausible placeholder.
2. Reading never advances mastery past "content seen".
3. Nothing is marked verified automatically; verification is a human act.
4. A provider failure is shown as a failure.
5. No student can reach another student's data: `ownerId` is always server-derived.
