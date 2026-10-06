# Environment variables
| Name | Required | Scope | Purpose |
|---|---|---|---|
| DATABASE_URL | yes | server | PostgreSQL connection string |
| PUTER_AUTH_TOKEN | no | server | Enables the AI Mentor via Puter's OpenAI-compatible endpoint (create at puter.com dashboard). Without it the mentor shows a truthful unavailable state. |
| PUTER_MODEL_NAME | no | server | Pro model id (default deepseek/deepseek-v4-pro) |
| PUTER_FAST_MODEL_NAME | no | server | Flash model id (default deepseek/deepseek-v4-flash) |
Variables listed in the specification but unused here (MONGODB_URI, AUTH_SECRET, GITHUB_CLIENT_*, BLOB_READ_WRITE_TOKEN, SEARCH_API_KEY, CRON_SECRET) are not required because the corresponding integrations are not configured on this deployment; add them only when enabling those integrations.
