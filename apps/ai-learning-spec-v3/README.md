# IHLS · AI Engineering Learning OS

A Harvard-informed, research-informed learning workspace for building independent AI engineering competence. The product separates content completion, competence evidence, and portfolio proof.

## What exists

- A persisted PostgreSQL/Drizzle curriculum graph preserving the original Modules 1–8 and 21 project briefs.
- Harvard College and Harvard Extension source mappings with current/historical/uncertain status labels.
- State-adaptive study controls: Deep, Drift, Fog, and Overload.
- Retrieval practice, transfer prompts, practice submissions, review scheduling, and evidence signals.
- A bounded Lead Mentor endpoint with a truthful provider-unavailable state when Puter is not configured.
- Project ladder, skill evidence, career gap framing, freelance simulation, research hypotheses, source register, and technical English surfaces.
- Accessible responsive light/dark UI with reduced-motion support.

## Run locally

```bash
npm install
npx drizzle-kit push
npm run dev
```

The first page request seeds a local learner workspace and canonical content when the learner record is absent. This is an explicit local starter workspace, not a claim of a real Harvard enrollment or a student achievement.

## Verification

```bash
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```

See `ARCHITECTURE.md`, `SECURITY.md`, `DATABASE.md`, and `docs/research/2026-04-research-dossier.md` before production deployment.
