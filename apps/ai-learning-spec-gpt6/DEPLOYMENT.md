# Deployment

## Target

Vercel App Router deployment with a managed PostgreSQL provider, secure environment settings, and no arbitrary student-code execution. Use `DATABASE_URL` from platform-managed secrets. Use a least-privilege database role and test database TLS/network restrictions.

## First deployment

1. Provision PostgreSQL and back it up.
2. Configure the environment variables listed in `ENVIRONMENT.md` in each Vercel environment. Set a high-entropy `AUTH_SECRET` in production.
3. Apply a reviewed Drizzle migration/schema update (`npx drizzle-kit push` only for controlled initial bootstrap, not as an unreviewed destructive production workflow).
4. Deploy, create a real account, verify session, owner-scoped progress write/read, and `/api/health`.
5. Test provider-unavailable behavior. Only enable AI once the Puter credential/model contract is verified.
6. Configure backup retention, monitoring, incident response, secret rotation and rollback.

## Degraded mode and recovery

Core curriculum reading and existing progress should remain available during AI outages. Provider failure returns an explicit retryable state. Back up PostgreSQL before schema changes, rehearse restore, and retain deployment history. Object storage/GitHub integrations require their own retention and permission policies before enabling.

## Status honesty

No cloud deployment, real production traffic, independent audit, model reliability, student outcome, or backup restoration is claimed by this documentation. Validate each capability in the target environment.
