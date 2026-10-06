# Environment

`.env.example` contains names only. Never hardcode values.

| Variable | Required | Scope | Purpose |
|---|---|---|---|
| DATABASE_URL | yes | server | PostgreSQL connection string used by Drizzle |
| PUTER_AUTH_TOKEN | optional | server | Future verified Puter provider credential |
| PUTER_MODEL_NAME | optional | server | Provider model name; default documented by deployment config |
| AUTH_SECRET | required in production | server | Mature auth/session provider secret |
| GITHUB_CLIENT_ID | optional | server | Authorized GitHub integration |
| GITHUB_CLIENT_SECRET | optional | server | Authorized GitHub integration |
| BLOB_READ_WRITE_TOKEN | optional | server | Object storage for large artifacts |
| SEARCH_API_KEY | optional | server | Lawful search provider for source research |
| CRON_SECRET | optional | server | Authenticated scheduled jobs |

No value belongs in public client code or logs. Add only provider variables required by a verified integration.
