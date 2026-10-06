# Security

## Identity and sessions
- scrypt password hashing with a per-user random salt and constant-time comparison (`src/lib/password.ts`).
- Opaque 256-bit random session tokens stored server-side in `sessions`, delivered in an httpOnly,
  SameSite=Lax cookie that is `secure` in production. No cryptographic session format is hand-rolled.
- `getUser()` is the only way the application learns who is calling. Expiry is enforced in the query.

## Authorization (OWASP API1: BOLA)
- `ownerId` is always derived from the session. A client-supplied `userId` is never trusted; where one
  appeared in a form it is ignored.
- Every learner-owned read, update and delete is scoped: `WHERE id = ? AND user_id = <session user>`.
- Unowned objects return "not found" rather than "forbidden", avoiding an existence oracle.
- `scripts/test.ts` contains a cross-tenant regression test: user B cannot read or mutate user A's
  project, evidence, mastery or review rows.

## Input and output
- Every mutation is validated with Zod (`src/app/actions.ts`, `src/app/api/mentor/route.ts`): bounded
  string lengths, enum constraints, URL validation for all evidence links.
- Responses return only the fields the caller owns; no bulk record dumps are sent to the model.

## Resource consumption
- In-memory token buckets rate-limit sign-up, sign-in, practice submission and mentor calls.
- Mentor requests carry a 45-second abort timeout.

## AI-specific controls
- Explicit instruction hierarchy: system policy → application policy → user request → retrieved evidence
  → untrusted document text. Learner-supplied content is delimited and labelled as data.
- Mentor context uses an allowlist of fields from ownership-scoped queries only.
- Anti-compulsion guardrail: an identical question repeated within 20 minutes without new evidence is
  answered with a redirect to application/transfer work rather than another reassurance pass.
- Provider failure is reported truthfully; the system never presents stored scaffolding as a model answer.

## Execution safety
- No arbitrary learner code is executed on the server. Heavy work runs in GitHub Codespaces, locally,
  Colab or Kaggle; the platform owns briefs, evidence and review.

## Secrets
- Read exclusively via `process.env` in server modules marked `server-only`. No `NEXT_PUBLIC_` secret
  exists. `.env.example` contains names with empty values.

## Audit
`audit_logs` records authentication events, failed sign-ins, practice submissions, project updates and
evidence changes, and mentor provider outcomes. Secrets and full conversation bodies are not logged.
