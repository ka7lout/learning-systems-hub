# Environment variables
| Name | Required | Scope | Purpose |
|---|---|---|---|
| DATABASE_URL | yes | server | PostgreSQL connection string |
| PUTER_AUTH_TOKEN | optional | server | Enables the AI Mentor (puter.com/dashboard → Create token). Never prefix with NEXT_PUBLIC_. |
| PUTER_MODEL_NAME | optional | server | Pro model, default `deepseek/deepseek-v4-pro` |
| PUTER_FAST_MODEL_NAME | optional | server | Flash model, default `deepseek/deepseek-v4-flash` |
Spec variables not used yet (MONGODB_URI, AUTH_SECRET, GITHUB_CLIENT_*, BLOB_READ_WRITE_TOKEN, SEARCH_API_KEY, CRON_SECRET) belong to integrations that aren't implemented, so they are deliberately left out.
