# AI engineering job market — what was and was not verified

Retrieved 2026-10-05.

## Summary

Very little about the job market was verifiable to primary-source standard in this pass. That is the
finding, and the product reflects it: **both career roles in the system carry
`likely_not_verified` on every requirement**, and the career page says so on screen.

## What the system does hold

Two role definitions, taken from the specification's own recorded postings:

| id | title | reference employer | requirements | status |
| --- | --- | --- | --- | --- |
| `role-navisoft` | Data / AI engineering role A | Navisoft | 25 | `likely_not_verified` |
| `role-nuwave` | AI engineering role B | NuWave | 31 | `likely_not_verified` |

Role A requirement skills, as recorded: TensorFlow, PyTorch, NLP, statistical modelling, R, SAS,
SQL, Hadoop, Spark, ETL/Talend, AWS, generative AI, Bash, VBA, Java, C, data mining, cloud
deployment.

Role B requirement skills, as recorded: Python, TypeScript, AWS/Azure, serverless, containers, RAG,
GraphRAG, vector search, graph databases, LangGraph/LangChain, agent and multi-agent orchestration,
Microsoft Graph/Teams/Entra ID, Terraform/OpenTofu, observability, ISO/IEC 42001, incident response.

Each requirement is stored as its own record with its own skill mapping, so the career engine can
report "no evidence / learning / practised / demonstrated" per requirement rather than producing a
single readiness score that would hide which 25 of 31 items are missing.

## What was attempted and failed

- **Upwork in-demand skills 2026 press release** — fetched; the first chunk returned navigation
  chrome only and no figures were extracted. **Nothing from it is cited.** A citation would have
  been fabrication.
- **BLS occupational projections** — not fetched directly in this pass. The +34% figure that appears
  on a Harvard Extension page is recorded as a second-hand attribution only.

## Rules the product enforces as a result

1. No salary figures anywhere. None were verified, so none are shown.
2. No "jobs available" or demand counts. No marketplace API is connected.
3. No claim that a student is "job ready". Readiness is reported per requirement, with the evidence
   that supports it.
4. Role postings are dated and labelled. A posting is a snapshot of one employer's wish list at one
   moment, not a description of the profession.
