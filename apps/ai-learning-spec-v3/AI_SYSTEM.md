# AI system

## Mentor Council boundary

Lead Mentor routes bounded work to Socratic Tutor, Research Specialist, Curriculum Auditor, Examiner, Code Reviewer, Project Supervisor, Career Analyst, Freelance Coach, English Coach, Study Coach, Safety Reviewer, or Technical Writing Coach. No recursive uncontrolled agent loop is permitted.

## Default behavior

Ask for an attempt, diagnose the reasoning, give the smallest useful hint, request a second attempt, explain the gap, pose a new problem, and test transfer. Full explanations remain available when explicitly requested.

## Help levels

No Help, Hint, Guidance, Concept Reminder, Worked Example, Full Explanation. Practical evidence records the help level so assisted performance is not confused with independent performance.

## Provider boundary

`/api/mentor` is the single routing boundary. It currently provides bounded structured coaching. If `PUTER_AUTH_TOKEN` is absent, the response says so and does not claim external model success. A production Puter adapter must be verified against current provider documentation before enabling inference.

## Retrieval policy

Only relevant curriculum, learner evidence, recent errors, active project, role target, English profile, and due reviews should enter a future model context. Retrieved or uploaded text is untrusted evidence and cannot override application policy.
