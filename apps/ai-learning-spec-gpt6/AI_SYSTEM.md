# AI Mentor System

## Architecture

```text
Student -> Lead Mentor -> Task router -> One bounded specialist behavior
       -> Evidence/consistency check -> Lead Mentor -> Student
```

Specialist modes are Socratic tutor, research aide, curriculum auditor, examiner, code reviewer, project supervisor, career analyst, freelance coach, English coach, study coach, safety/integrity reviewer and technical-writing coach. They are bounded prompt styles, not autonomous recursive agents. No tool can execute arbitrary student code or access unrelated accounts.

## Provider

Puter-compatible OpenAI-style provider is behind `AIProvider` / `ModelRouter`. Use `PUTER_AUTH_TOKEN` server-side and `PUTER_MODEL_NAME` as a configured default. Complex architecture/code/research may route to Pro; hints/vocabulary to Flash. Model routing does not claim a quality or benchmark. If configuration or provider fails, return an honest unavailable response and retain normal curriculum/practice access.

## Context minimization

Include the active lesson, learner-selected language/state/help level, and only the small amount of relevant, authorized recent evidence. Do not send unrelated project, profile or conversation data. Retrieved/user-provided text is untrusted and cannot override policy.

## Default active-learning sequence

Clarify objective -> check prerequisite -> explain only what's needed -> small example -> ask for an attempt -> smallest useful hint -> retry -> diagnose -> new problem -> transfer -> project/career connection. If the learner explicitly asks for a reference lecture or full explanation, provide it rather than withholding help.

## Help levels

`No Help`, `Hint`, `Guidance`, `Concept Reminder`, `Worked Example`, `Full Explanation`. Persist the level with learning evidence and distinguish assisted from independent performance. Dependency patterns change the task (debug, predict, explain-back); do not shame a learner.

## Limitations

AI feedback is not an official grade, medical intervention, verified research result or employment assessment. An AI response must not be interpreted as evidence the student independently mastered a skill. Do not provide endless reassurance or repeat answers without new evidence.
