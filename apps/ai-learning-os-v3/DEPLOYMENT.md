# Deployment

Target: Vercel (or any Node host) with managed PostgreSQL.

1. Create the database and set `DATABASE_URL`.
2. Optionally set AI provider variables (`PUTER_AUTH_TOKEN` or `OPENAI_API_KEY`). Without them the
   product runs with a truthful degraded mentor.
3. `npx drizzle-kit push` to apply the schema.
4. `npx tsx --env-file=.env src/db/seed.ts` to seed the curriculum (content tables only; learner data
   is never touched).
5. `npm run build && npm run start`.
6. Verify `/api/health`: database reachability, content counts and the real AI provider status.

## Operational notes
- Sessions are database-backed; expiry is enforced in the query, and `DELETE` on a user cascades.
- Rate limiting is in-process. On multi-instance deployments move the buckets to a shared store.
- Degraded mode: provider outages never block curriculum reading, practice, review or project work.
- Backups: rely on the managed database's point-in-time recovery. The curriculum is reproducible from
  the seed script, so a restore only needs to recover learner-owned tables.
