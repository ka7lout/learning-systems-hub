# Environment Variables

All secret values are server-only and must be configured in Vercel environment settings or a secure local `.env.local`. `.env.example` contains names with empty values only.

| Name | Required? | Scope | Purpose / notes |
|---|---|---|---|
| `DATABASE_URL` | Required | Server | PostgreSQL connection string for Drizzle and Better Auth. Restrict database privileges and keep private. |
| `AUTH_SECRET` | Required in production | Server | Long random secret for Better Auth session signing/encryption. Generate via a secure password manager or `openssl rand -base64 32`; rotate deliberately. |
| `PUTER_AUTH_TOKEN` | Optional until AI enabled | Server only | Puter-compatible server credential; never expose to the browser. Without it, the Mentor accurately reports provider unavailable. |
| `PUTER_MODEL_NAME` | Optional | Server | Model identifier. Default is the documented product choice `deepseek/deepseek-v4-pro`; confirm model availability before rollout. |
| `GITHUB_CLIENT_ID` | Optional, integration not enabled | Server | Reserved for future GitHub OAuth. |
| `GITHUB_CLIENT_SECRET` | Optional, integration not enabled | Server | Reserved for future GitHub OAuth. |
| `BLOB_READ_WRITE_TOKEN` | Optional, storage not enabled | Server | Reserved for approved object storage. |
| `SEARCH_API_KEY` | Optional, search integration not enabled | Server | Reserved for an approved web-search provider. |
| `CRON_SECRET` | Optional, no cron route enabled | Server | Reserved for authenticated scheduled jobs. |

Never prefix secrets with `NEXT_PUBLIC_`. Do not print environment values in logs or documentation. No external provider integration should claim success when its environment is absent.
