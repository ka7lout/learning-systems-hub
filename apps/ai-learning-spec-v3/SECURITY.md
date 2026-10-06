# Security

## Current controls

- Server-derived learner ID; no client-supplied owner ID is accepted by mutations.
- Zod input validation and bounded request lengths.
- No secrets in source code or public client bundles.
- Mentor content is treated as user input; retrieved content must remain lower priority than application policy.
- No arbitrary Python, shell, Node, or remote code execution.
- UI states distinguish provider availability from successful external inference.
- External source URLs are rendered with `rel="noreferrer"`.

## Required before production

1. Add a mature auth/session provider compatible with this Next.js version.
2. Derive a real authenticated user ID in a server-only data access layer.
3. Add role-based authorization for admin, editor, reviewer, support, research, and career roles.
4. Add rate limits for AI, source ingestion, uploads, and expensive analysis.
5. Add request IDs, audit logs, secret redaction, security alerts, and backup/recovery procedures.
6. Add safe upload validation/scanning and SSRF protection for source ingestion.
7. Run OWASP API Security Top 10 regression tests, especially object-level authorization and resource exhaustion.

Reference: OWASP API Security Top 10 2023, W3C WCAG 2.2, and Next.js authentication guidance in the research dossier.
