# Architecture

## Product boundary

IHLS is the infrastructure for a Harvard-mapped, self-directed AI engineering pathway. Harvard College, Harvard Extension, Original Curriculum, Industry Extension, and Research Extension remain distinct source categories.

## Runtime

- Next.js App Router with server-rendered data loading.
- React client workspace for interaction.
- PostgreSQL accessed only through Drizzle ORM.
- Zod validates API payloads.
- Lucide provides the open-source icon system.

## Flow

```text
Server page → Drizzle data layer → persisted learner/curriculum/evidence
Client workspace → validated API route → ownership-scoped mutation → truthful UI feedback
Mentor request → bounded orchestrator boundary → structured scaffold or verified provider adapter
```

## Deliberate constraints

No arbitrary student code executes on the server. The project system links to GitHub, Codespaces, Colab, Kaggle, deployments, and reports rather than pretending Vercel is an ML cluster. Large artifacts belong in object storage in a future deployment; metadata remains in the relational model.

## Current release scope

The current build is a single local learner workspace to make the core learning loop usable without inventing account data. Production auth, multi-tenant sessions, GitHub OAuth, object storage, and a verified Puter server contract are documented as integration boundaries rather than faked.
