# AI system

## Provider abstraction
`resolveProvider(tier)` returns Puter (preferred) or an OpenAI-compatible fallback. Two tiers:
`pro` for reasoning-heavy work (explanation, review, examination, project supervision, career analysis)
and `flash` for short interactions (vocabulary, study coaching, integrity checks). No call site in the
application talks to a vendor directly.

## Mentor council
Lead Mentor plus Socratic Tutor, Examiner, Code Reviewer, Project Supervisor, Career Analyst, English
Coach, Study Coach and Integrity Reviewer. Flow: student → lead/selected specialist → context assembly →
single provider call → stored message. There is no recursive agent loop.

## Context assembly (allowlist, ownership-scoped)
Current node title/why/objectives/concepts, course prerequisites, the node's item prompts (never the
reference answers), the learner's weakest skill levels, their last eight attempt outcomes with help level
and error type, due review labels, and active project ids. Nothing else is sent.

## Instruction hierarchy
1. System policy 2. Application policy 3. User request 4. Retrieved evidence 5. Untrusted document text.
Learner-supplied attempts and questions are delimited (`<<<ATTEMPT … >>>`) and labelled as data. Document
text can never change policy or grant tool access.

## Pedagogical behaviour
Default is attempt-first: the Socratic Tutor asks for an attempt before explaining, and the practice UI
locks the reference answer until something has been written. Help levels (none → hint → guidance →
concept reminder → worked example → full explanation) are selectable, sent as a ceiling, and recorded
with every attempt so independent and assisted performance stay separable.

## Guardrails
- Anti-compulsion: the same question twice in 20 minutes without new evidence is refused with a redirect
  to application/transfer work.
- Rate limit: 20 mentor requests per user per minute.
- No fabricated certainty: the system prompt forbids inventing course numbers, syllabi, grading weights,
  job requirements, metrics or achievements.

## Degraded mode
With no provider credential, the mentor returns the stored human-authored scaffolding for the node —
objectives, MUST WRITE items and the item hints — under an explicit banner saying the provider is
unavailable and that this is not a generated answer. Provider errors return HTTP 502 with the reason.
Curriculum, practice, review, projects, skills, career, English and portfolio all keep working.
