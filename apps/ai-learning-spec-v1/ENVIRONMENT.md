# Environment variables

All variables are read **server-side only**. None is prefixed `NEXT_PUBLIC_`; no secret reaches the
browser bundle. `.env.example` contains names with empty values only.

| Name | Required | Scope | Purpose | Notes |
|---|---|---|---|---|
| `DATABASE_URL` | yes | server | PostgreSQL connection string used by Drizzle (`src/db/index.ts`) | Provided by the platform. Rotate through the host, never commit. |
| `PUTER_AUTH_TOKEN` | no | server | Puter AI provider token | Enables the mentor. Without any provider the mentor returns a truthful unavailable state. |
| `PUTER_MODEL_NAME` | no | server | Pro-tier model id | Defaults to `deepseek/deepseek-v4-pro`. |
| `PUTER_FAST_MODEL_NAME` | no | server | Fast-tier model id | Defaults to `deepseek/deepseek-v4-flash`. |
| `PUTER_API_URL` | no | server | Override the Puter driver endpoint | The default endpoint shape was not verified in this build; a failure surfaces as a truthful provider error. |
| `OPENAI_API_KEY` | no | server | Alternative provider | Takes precedence when set. |
| `OPENAI_MODEL` | no | server | Pro-tier OpenAI model | Defaults to `gpt-4o`. |
| `ANTHROPIC_API_KEY` | no | server | Alternative provider | Used when OpenAI is absent. |
| `ANTHROPIC_MODEL` | no | server | Pro-tier Anthropic model | Defaults to a Sonnet model id. |
| `SEARCH_API_KEY` | no | server | Reserved for the web-research service | Research ingestion is not enabled in this build; the source register is curated and dated instead. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | no | server | Reserved for GitHub account linking | Not enabled; repository links are recorded manually as evidence. |
| `BLOB_READ_WRITE_TOKEN` | no | server | Reserved for object storage of large artifacts | Not enabled; artifacts are referenced by URL. |
| `CRON_SECRET` | no | server | Reserved for scheduled jobs | Not enabled. |

Variables marked "reserved" are documented because the specification requires them, and are deliberately
**not** faked: the corresponding features are absent rather than simulated.
