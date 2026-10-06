# Architecture

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) | Server components by default; mutations are server actions. |
| Language | TypeScript, `strict` | `tsc --noEmit` is part of `npm run verify`. |
| Styling | Tailwind CSS 3 with CSS-variable design tokens | No component library, no icon set beyond Lucide. |
| Data | `DatabaseDriver` abstraction with two implementations | MongoDB when `MONGODB_URI` is set, otherwise a local JSON file store. |
| Auth | First-party sessions: scrypt password hashing, random opaque tokens | No third-party auth dependency; no hand-rolled crypto primitives. |
| AI | `AIProvider` interface, `PuterProvider` implementation | Server-side only; returns a truthful failure when unconfigured. |

## Storage: the honest version

MongoDB is the intended source of truth and `src/lib/db/mongo-driver.ts` implements it fully,
including index creation (unique `users.email`, unique `sessions.token`, a TTL index on
`sessions.expiresAt`, an `ownerId` index on all 21 owner-scoped collections, a compound
`{ownerId, dueAt}` index on `review_items`, and `{at: -1}` on `audit_logs`).

**No MongoDB server is available in the sandbox this was built in.** Rather than claim a database
connection that does not exist, the data layer selects a file-backed driver when `MONGODB_URI` is
absent: JSON documents under `DATA_DIR` (default `.data/`), with a per-collection promise lock and
atomic temp-file-plus-rename writes. The Settings and Admin pages both display which driver is live.

Switching to MongoDB is a configuration change, not a code change:

```bash
MONGODB_URI="mongodb+srv://…" npm run seed   # creates indexes as part of the seed
```

## Module map

```
src/
  content/        the curriculum as data — single source of truth, no database required to read it
  lib/
    db/           driver.ts (interface) · file-driver.ts · mongo-driver.ts · index.ts (selection)
    auth/         password.ts (scrypt) · session.ts (cookie + hashed token) · rbac.ts · page-session.ts
    dal.ts        owned() — every student-scoped read and write, with document types
    engines/      mastery · review · tasks · career
    ai/           provider.ts (AIProvider, PuterProvider, model router) · mentor.ts (council, context)
    api.ts        action() wrapper: auth → authz → validate → rate limit → execute → audit
  app/
    (auth)/       login, register
    (app)/        the thirteen navigation routes, plus /admin
    api/          /api/mentor, /api/health
    actions/      auth.ts, study.ts — all mutations
  components/     shell, design-system primitives, and the client widgets for each surface
```

## Request path for a mutation

1. A client component calls a server action in `src/app/actions/study.ts`.
2. The action delegates to `action()` in `src/lib/api.ts`, which:
   - resolves the session from the signed cookie (401 if absent),
   - checks an RBAC permission when the action declares one (403 if denied),
   - rate-limits per user per action name (429 with a retry hint),
   - validates the payload with a Zod schema (field-level errors returned),
   - runs the handler, and writes an audit entry for allow, deny and error alike.
3. The handler uses `owned(session, collection)`, which injects `ownerId` from the **session** into
   every filter and document. There is no code path in the data layer that accepts an `ownerId`
   from a caller; a crafted request cannot reach another student's data. A test asserts this.

## Multi-tenant isolation

- 21 collections are owner-scoped. `owned()` throws if asked to scope anything else.
- Shared, read-only curriculum collections are accessed through `col()` and contain no student data.
- Audit entries record the action name and outcome only — never answers, never secrets.

## Authentication

- Passwords: `scrypt`, N = 2¹⁷, r = 8, p = 1, 64-byte key, per-user random salt, stored as
  `scrypt$N$r$p$salt$hash`, compared with `timingSafeEqual`. Minimum length 12; length is the rule,
  not a symbol-soup policy.
- Sessions: 32 random bytes, base64url, sent as an `httpOnly`, `SameSite=Lax`, `Secure`-in-production
  cookie. **Only the SHA-256 hash is stored**, so a database leak does not yield usable sessions.
  Fourteen-day expiry, enforced in the query and by a TTL index.
- The first registered account receives the `admin` role; subsequent accounts are students.

## RBAC

Seven roles — student, admin, content_editor, reviewer, support, research_editor, career_editor —
mapped to ten permissions. `can()` and `requirePermission()` are the only entry points; the admin
console checks `admin:read`.

## AI integration

- `AIProvider` is an interface. `PuterProvider` posts to `${PUTER_BASE_URL}/drivers/call` with the
  `puter-chat-completion` interface and routes between the pro and flash models by task.
- Without `PUTER_AUTH_TOKEN` the provider returns `{ status: "provider_unavailable" }`. The UI shows
  that state. **No fallback text is ever generated to disguise a failure.**
- `runMentor()` assembles a scoped context: the current lesson or task, at most two relevant authored
  blocks, the student's own mastery, up to three unresolved errors, and their language preferences.
  Failures are persisted as failed messages so the thread history stays truthful.
- The mentor never executes code and has no tools. There are no recursive agent loops.

## Code execution

Student code is never executed on the server. This removes remote-code-execution risk entirely and
means the system cannot claim to have tested anyone's work. The Practice Lab says so, and directs
heavier workloads to Codespaces, Colab or Kaggle.

## Secrets

Nine environment variables, listed by name with empty values in `.env.example`:
`MONGODB_URI`, `PUTER_AUTH_TOKEN`, `PUTER_MODEL_NAME`, `AUTH_SECRET`, `GITHUB_CLIENT_ID`,
`GITHUB_CLIENT_SECRET`, `BLOB_READ_WRITE_TOKEN`, `SEARCH_API_KEY`, `CRON_SECRET`.
No secret is ever prefixed `NEXT_PUBLIC_`; a test scans the whole repository for credential patterns
and for `NEXT_PUBLIC_` names containing `TOKEN`, `SECRET`, `KEY`, `PASSWORD` or `URI`.

## Security headers

Set in `next.config.ts`: `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `Permissions-Policy` denying camera and geolocation, and
`Content-Security-Policy: frame-ancestors` restricting embedding. (`frame-ancestors` is used instead
of `X-Frame-Options` so the development preview can embed the app while production stays locked.)

## Not built

Stated plainly rather than stubbed:

- GitHub OAuth. The environment variables are reserved and the health endpoint reports it as
  unconfigured. There is no half-working button.
- Object storage uploads. Evidence is captured as links and text.
- A search provider. The abstraction point exists; no implementation is wired.
- Email. Notifications are in-app only.
