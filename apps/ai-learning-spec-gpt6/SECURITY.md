# Security

## Identity and access

- Better Auth is used for sign-up, sign-in, session management and sign-out; no custom password/session cryptography is implemented.
- Read and mutation routes must call the server-side session helper and derive `ownerId` from the authenticated session.
- Every learner-owned table is queried by the authenticated owner. UI hiding is not authorization.
- Shared curriculum is read-only to learner routes. No public content-publishing or role-elevation endpoint exists.
- Sensitive values belong in server-side environment variables, never `NEXT_PUBLIC_*`.

## API controls

All mutation inputs require schema validation, bounded string sizes, allowed enum values, resource ownership checks and explicit response fields. AI input is length-limited and requests are rate-limited using persisted per-user runs. External provider failures are surfaced without exposing credentials or full stack traces.

## AI / retrieval controls

Student text and any later imported source are untrusted. Retrieved documents never override application instructions. Provider context is scoped to the current lesson and relevant, minimal mastery evidence. The current mentor has no code-execution or arbitrary network tools. Model output is displayed as text, not executed HTML or code.

## File / code safety

No arbitrary Python, shell, Node or container execution runs on the Vercel server. Large ML work is directed to a student-controlled local environment, Codespaces, Colab or Kaggle. File upload/object storage is not enabled in this release; never imply scanning or safety checks that do not exist.

## Operational controls

Use TLS, secure cookies in production, rate limits, least-privilege database credentials, secret rotation, dependency updates, backups, audit review and provider timeouts in deployment. Do not log secrets, raw credentials or private conversations by default. Provider/model identifiers and error classes may be logged without content.

## Threat model checklist

Review OWASP API Security 2023 risks: object-level authorization, authentication, object-property authorization, resource consumption, function-level access control, sensitive workflows, SSRF, configuration, inventory and unsafe external API consumption. Add cross-account tests for every new owner-scoped resource. Source: https://owasp.org/API-Security/editions/2023/en/0x11-t10/.

## Remaining release work

This starter has not been independently penetration tested. Add automated authorization, abuse, CSRF, session, prompt injection, dependency and deployment-configuration tests before a public launch. Do not describe it as audited or certified.
