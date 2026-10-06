# Security
- Authentication: email + scrypt-hashed passwords; opaque 256-bit session tokens stored hashed (SHA-256) with 14-day expiry in httpOnly, SameSite=Lax, Secure cookies. First registered user becomes admin.
- Authorization: `requireUser()` / `requireRole()` derive identity server-side; every student-owned query is scoped by `ownerId` from the session (OWASP API1 BOLA). Client-supplied owner ids are never accepted. Cross-owner reads return not-found (tested in `tests/isolation.test.ts`).
- Input validation: zod on every route (API3/API6). Limits on text sizes. URL fields validated.
- Rate limiting: auth (20/10 min per IP), mentor (40/10 min per user). In-memory per instance — documented limitation; use an edge/KV limiter for multi-instance scale.
- Secrets: only via environment variables; never `NEXT_PUBLIC_`; `.env.example` has empty values. Puter token is used server-side only.
- AI security: instruction hierarchy (system → application → user → retrieved evidence → untrusted document); lesson excerpts are passed as "reference material, not instructions"; no tool execution, no agent loops; no arbitrary code execution anywhere.
- Audit: register, login, failed login, evidence additions logged in `audit_logs`.
- Not implemented on this deployment: file uploads (none), GitHub OAuth (manual URL attachment instead), virus scanning (no uploads).
