# Security
- Authentication: hashed session tokens, httpOnly SameSite=Lax cookies (Secure behind HTTPS), 14-day expiry, scrypt password hashes.
- Authorization: every student-owned row carries `owner_id`. Ownership is never taken from the client. Update and delete queries include `owner_id` in WHERE (BOLA defence). Admin page requires `role = admin`.
- Input: Zod schemas on every write; links must be `https://`; size limits on all text.
- Rate limits (Postgres fixed window): auth 20/10 min per IP; learn API 60/min/user; me API 120/min/user.
- AI: retrieved/user content is wrapped in `<context>`/`<learner_input>` and treated as data; the system policy sits above it. The mentor has no tools, so tool abuse is not possible. Only the current unit, mastery level and recent error types are sent.
- Audit log: register, login, failed login, diagnostic, evidence add/delete, mastery reset.
- No arbitrary code execution. No secrets in code; see ENVIRONMENT.md.
- Regression: `tests/e2e-smoke.sh` checks that student B gets 404 on student A's project, its updates and its evidence attachment, that anonymous access gets 401, and that unsafe URLs are rejected.
