# Environment variables

`.env.example` contains names only, never values. No secret is ever committed, logged, placed in a
client bundle or prefixed with `NEXT_PUBLIC_`.

| Name | Required | Scope | Purpose | How to obtain | Security notes |
|---|---|---|---|---|---|
| `DATABASE_URL` | yes | server | PostgreSQL connection (Drizzle ORM). | Managed database provider. | Grants full data access; rotate on exposure. |
| `AUTH_SECRET` | recommended | server | Reserved for signed-token features; session tokens are currently random 256-bit opaque values stored server-side. | `openssl rand -hex 32`. | Never expose. |
| `PUTER_AUTH_TOKEN` | optional | server | Primary AI provider credential. | Puter developer account. | Absence puts the mentor into truthful degraded mode. |
| `PUTER_MODEL_NAME` | optional | server | Reasoning-tier model (default `deepseek/deepseek-v4-pro`). | Provider docs. | Not a secret, still server-side. |
| `PUTER_FAST_MODEL_NAME` | optional | server | Low-latency tier (default `deepseek/deepseek-v4-flash`). | Provider docs. | — |
| `PUTER_BASE_URL` | optional | server | Override provider endpoint. | Provider docs. | — |
| `OPENAI_API_KEY` | optional | server | Fallback OpenAI-compatible provider. | Provider console. | Billing-sensitive. |
| `OPENAI_BASE_URL` / `OPENAI_MODEL` / `OPENAI_FAST_MODEL` | optional | server | Fallback routing configuration. | Provider docs. | — |
| `SEARCH_API_KEY` | optional | server | Web-research provider for source ingestion. | Search provider. | Rate-limited server-side. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | optional | server | GitHub account linking for repository evidence. | GitHub OAuth app. | Secret must stay server-side. |
| `BLOB_READ_WRITE_TOKEN` | optional | server | Object storage for large artefacts. | Storage provider. | Scope to least privilege. |
| `CRON_SECRET` | optional | server | Shared secret for scheduled jobs. | Self-generated. | Compare in constant time. |

The database schema and DATABASE_URL in this sandbox are provisioned by the platform. The AI provider
keys are intentionally absent here; the application reports this truthfully at `/api/health`, in
Settings and inside the mentor panel rather than simulating answers.
