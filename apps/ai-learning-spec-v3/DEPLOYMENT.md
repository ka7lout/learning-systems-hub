# Deployment

Target: Vercel with a managed PostgreSQL provider compatible with `DATABASE_URL`.

Before production:

- configure secrets through the deployment secret manager, never the repository;
- run schema migrations in a controlled release step;
- add mature authentication and server-derived ownership;
- configure rate limiting, observability, backups, and provider outage behavior;
- keep source ingestion and object storage processing isolated;
- verify health, build, type generation, API authorization, and accessibility checks.

The current local demo seeds a single explicitly named workspace to keep the empty sandbox usable. Do not treat it as a production multi-tenant release.
