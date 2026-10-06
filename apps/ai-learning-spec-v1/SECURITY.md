# Security

## Identity and authorization

- Passwords are hashed with scrypt (random 16-byte salt, 64-byte key, constant-time comparison).
- Sessions are opaque 256-bit random tokens stored server-side with an expiry, delivered in an
  `httpOnly`, `sameSite=lax`, `secure`-in-production cookie.
- `getCurrentUser()` in `src/lib/auth.ts` is the **only** source of identity. Every user-scoped query in
  `src/lib/data.ts` and every mutation in `src/app/api/*` filters by that server-derived `userId`.
- No endpoint accepts a client-supplied `userId` / `ownerId`. Project and evidence mutations resolve the
  owning row by `(userId, projectKey)` before writing, which closes the broken-object-level-authorization
  class that this curriculum also teaches in `ie-security-l1`.

## Input and output

- Every route handler validates its body with Zod (discriminated unions where an action field is used) and
  returns `422` with issue messages on failure. Unknown JSON is rejected before any database access.
- URLs supplied by the learner are validated as URLs and stored, never fetched server-side, which avoids
  SSRF through evidence links.
- There is **no arbitrary code execution**. The platform tracks project briefs, milestones and evidence;
  training and inference workloads run in GitHub Codespaces, Colab, Kaggle or locally.

## LLM security

Instruction hierarchy enforced in `src/lib/ai.ts`:

```
system policy > application policy > user request > retrieved curriculum evidence > any other quoted text
```

Retrieved lesson content is injected as clearly labelled data with an explicit statement that quoted text
cannot issue instructions. Only the current curriculum node, the learner's recent attempt outcomes and
their presentation settings are sent — never other learners' data, never credentials.

## Failure behaviour

- A missing or failing AI provider produces an explicit error state plus a clearly labelled *rule-based*
  protocol. The system never presents a fallback as a model response and never fabricates an answer.
- Provider errors are recorded as `system_notice` messages so the learner can see what actually happened.

## Secrets

- Secrets are read only from `process.env` in server-only modules (`import "server-only"` guards
  `src/lib/auth.ts`, `src/lib/ai.ts`, `src/lib/data.ts`, `src/lib/engine.ts`, `src/db/seed.ts`).
- No secret is prefixed `NEXT_PUBLIC_`, committed, logged or rendered. `.env.example` contains names only.

## Auditing

`audit_logs` records sign-up, sign-in, failed sign-in, project start and evidence creation. Private mentor
conversation bodies are stored for the owning learner only and are not emitted to logs.

## Known limitations

- Rate limiting is not yet implemented at the edge; AI and auth endpoints should be rate-limited by the
  hosting platform or a middleware layer before public exposure.
- Email verification and password reset flows are not implemented.
- These gaps are stated rather than hidden; they are release blockers for a public multi-tenant launch.
