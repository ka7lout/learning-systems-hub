# AI system

## Council

One lead mentor plus specialists: Socratic Tutor, Examiner, Code Reviewer, Project Supervisor, Career
Analyst, Freelance Coach, English Coach, Study Coach, Research Specialist, Integrity Reviewer. The learner
selects the specialist; there is no recursive, uncontrolled agent loop and no tool execution.

```
Student → route handler (authz + validation) → context assembly (curriculum node, recent outcomes, settings)
        → policy stack → provider abstraction → persisted message → student
```

## Provider abstraction

`src/lib/ai.ts` is the only place a provider is called. Supported: Puter (`PUTER_AUTH_TOKEN`,
`PUTER_MODEL_NAME`, default `deepseek/deepseek-v4-pro`, fast tier `deepseek/deepseek-v4-flash`), OpenAI and
Anthropic. Routing: heavier reasoning (tutoring, code review, project supervision, research) uses the pro
tier; English coaching and study coaching use the fast tier.

## Guardrails

1. **Attempt first.** In practice mode the mentor asks for the learner's attempt and gives the smallest
   useful hint before any full explanation. `attemptMade` is sent explicitly.
2. **Help levels.** `no_help | hint | guidance | concept_reminder | worked_example | full_explanation` are
   recorded on every practice attempt, so assisted and independent performance never merge.
3. **Dependency audit.** The dashboard and portfolio report independent attempt counts and independent pass
   rate; professional readiness relies on independent evidence.
4. **Anti-compulsion.** Repeated identical verification requests are redirected to a test or an application
   task rather than answered with more reassurance. This is an instructional design decision, not therapy.
5. **No fabrication.** The policy forbids inventing Harvard courses, job requirements, metrics, results or
   sources, and forbids claiming any Harvard credential.
6. **Instruction hierarchy.** Retrieved lesson content is labelled data and cannot override policy.

## Failure behaviour

If no provider is configured, or a provider errors, the API returns `503` with an explicit reason, the UI
shows the failure verbatim, and a clearly labelled **rule-based study protocol** (derived from the lesson's
own notebook guidance and practice items) is offered. It is never styled or stored as a model response.
