# Learning science — mechanisms and how strongly they are supported

Every mechanism the system uses is labelled with an evidence strength. The labels live in
`src/content/learning-science.ts` and are rendered to the student on the Research page, so the
product cannot quietly present a design decision as a research finding.

| Mechanism | Strength | How it is used |
| --- | --- | --- |
| Retrieval practice (testing effect) | strong | The mastery engine advances on retrieval, not on reading. |
| Distributed practice (spacing) | strong | Drives the review queue and the 14-day forecast. |
| Worked examples with fading support | strong | Implemented as the six help levels. |
| Interleaving | moderate | Applied to related-but-confusable items in the review runner only. |
| Elaborative interrogation / self-explanation | moderate | "Explain why" and "explain in your own words" task types. |
| Transfer through varied context | moderate | Transfer is measured separately, never assumed from application. |
| Case method | moderate | Case-decision task type. |
| State-adaptive task sizing | emerging | A design decision informed by cognitive load theory; listed as hypothesis H3. |
| Learning Yield metric | emerging | An internal construct. Explicitly not a psychometric measure. |
| Learning styles matching | speculative | **Not used.** The evidence does not support matching instruction to a declared style. |

## Things this system deliberately does not do

- It does not ask for or infer a "learning style".
- It does not diagnose attention, and it has no "ADHD mode". The four study states are descriptions
  of a session — focused, drifting, hard to start, too much at once — and they change task size and
  scaffolding only. No score is stored against the person, and no state is ever shown back as a
  judgement.
- It does not report a single percentage for learning. Completion, competence and evidence are three
  separate numbers because they fail in different ways.
- It does not treat a passed multiple-choice item as understanding. Multiple choice is a minor
  component of 23 active task types.

## Help levels and why they are weighted

| Help level | Weight in mastery |
| --- | --- |
| No Help | 1.00 |
| Hint | 0.80 |
| Guidance | 0.60 |
| Concept Reminder | 0.50 |
| Worked Example | 0.25 |
| Full Explanation | 0.10 |

A correct answer produced after a full explanation is evidence that the explanation was
comprehensible; it is weak evidence that the student can perform the task. The weights encode that
difference, and an assisted pass also earns a shorter review interval.

## Open hypotheses

H1–H6 in `src/content/learning-science.ts` state what this design assumes but has not demonstrated,
including whether retrieval-heavy sessions beat reading-heavy ones of equal length for this learner,
and whether lower help levels on first attempts predict better delayed independent performance. They
are presented to the student as hypotheses, and no result is claimed for any of them.
