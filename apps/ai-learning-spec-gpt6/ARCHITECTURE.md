# Architecture

## System boundaries

- **Next.js App Router** renders the learning workspace and serves authenticated route handlers.
- **Better Auth** owns identity, email/password credentials and sessions. Authorization uses the server-derived session user ID.
- **Drizzle/PostgreSQL** is the persistence layer. This follows the platform mandate; it replaces the requested MongoDB storage design.
- **Curriculum seed** turns the original outline, sourced Harvard mappings and clearly labeled extension topics into typed, versioned nodes.
- **Learning services** write assessment events, mastery evidence and review schedules. Content viewed is not mastery.
- **Mentor orchestrator** builds a small context from the active lesson and permitted learner evidence; a replaceable server-side provider adapter handles inference.
- **Object storage / GitHub / cloud compute** are future integrations. Repositories are the preferred code source; this application never runs arbitrary student code.

## Request flow

```text
Browser
  -> Next.js route handler / server component
  -> Better Auth session check
  -> Zod input validation
  -> owner-scoped service/data-access query
  -> Drizzle ORM
  -> PostgreSQL
```

Shared read-only curriculum/source records are not learner-owned. All learner events, profiles, AI conversations, review items, projects and evidence use `ownerId` derived from the authenticated session. Client-supplied owner IDs are not accepted.

## Curriculum graph

A curriculum node stores `id`, parent, type, title, primary source category, level, prerequisites/corequisites, objectives, skills, effort, mastery criteria, assessments, project references, source links, version and last verification. The seed validates every dependency reference and detects cycles before insertion. Content version history and editor workflow are documented design requirements, not yet a full CMS.

## Product surfaces

Dashboard (next useful task), Curriculum, Learn, Practice Lab, Projects, Review, Skills, Career, Freelance, Research, AI Mentor, Portfolio and Settings. Empty-state and provider-unavailable states are real; no seeded learner outcomes are shown.

## Degraded behavior

Core curriculum reading and persisted learning records do not depend on the LLM provider. If provider credentials or service are unavailable, the UI reports this and offers ordinary practice. No model success is fabricated.
