import Link from "next/link";
import { notFound } from "next/navigation";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph } from "@/content";
import { MENTOR_ACTIONS } from "@/lib/ai/mentor";
import { owned, type SubmissionDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, Prose } from "@/components/ui";
import { AttemptForm } from "@/components/practice-widgets";
import { MentorPanel } from "@/components/MentorPanel";

export const dynamic = "force-dynamic";

export default async function AssessmentPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = await params;
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const item = graph.assessments.find((a) => a.id === assessmentId);
  if (!item) notFound();

  const lesson = graph.lessons.find((l) => l.id === item.lessonId);
  const attempts = await owned<SubmissionDoc>(session, "submissions").find({ assessmentId: item.id }, { sort: { createdAt: -1 }, limit: 10 });

  return (
    <>
      <PageHeader
        title={item.type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
        lede={lesson ? `From: ${lesson.title}` : undefined}
      >
        <div className="flex flex-wrap gap-2">
          <Chip>tier {item.tier}</Chip>
          <Chip>difficulty {item.difficulty}/5</Chip>
          <Chip>{item.estimatedMinutes} min</Chip>
          <Chip tone={item.evaluation === "auto" ? "accent" : "neutral"}>
            {item.evaluation === "auto" ? "auto-checked" : item.evaluation === "mentor" ? "mentor-reviewed" : "self-assessed"}
          </Chip>
        </div>
      </PageHeader>

      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            <Card>
              <CardHead title="The task" />
              <div className="card-pad">
                {item.context && (
                  <div className="mb-3 rounded-lg border border-line p-3 text-sm text-ink-2">
                    <Prose text={item.context} />
                  </div>
                )}
                <Prose text={item.prompt} />
              </div>
            </Card>

            <Card>
              <CardHead title="Your attempt" hint="Write first. Reveal the rubric after." />
              <div className="card-pad">
                <AttemptForm
                  assessmentId={item.id}
                  evaluation={item.evaluation}
                  rubric={item.rubric}
                  expectedPoints={item.expectedPoints}
                  choices={item.choices}
                />
              </div>
            </Card>

            {attempts.length > 0 && (
              <Card>
                <CardHead title="Your history on this item" />
                <ul className="divide-y divide-[var(--line)]">
                  {attempts.map((a) => (
                    <li key={a._id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-ink-3">{new Date(a.createdAt).toLocaleString()} · {a.helpLevel}</span>
                        {a.correct === true ? <Chip tone="positive">pass</Chip> : a.correct === false ? <Chip tone="caution">retry</Chip> : <Chip>unjudged</Chip>}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-ink-2">{a.answer.slice(0, 600)}{a.answer.length > 600 ? "…" : ""}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            <Card>
              <CardHead title="Ask the mentor" hint="It can see this task but will not hand you the answer." />
              <MentorPanel
                actions={MENTOR_ACTIONS.map((a) => ({ id: a.id, label: a.label, helpLevel: a.helpLevel }))}
                lessonId={item.lessonId}
                assessmentId={item.id}
                providerConfigured={Boolean(process.env.PUTER_AUTH_TOKEN)}
                compact
              />
            </Card>

            <Card>
              <CardHead title="Skills checked" />
              <ul className="divide-y divide-[var(--line)]">
                {item.skillIds.map((id) => {
                  const skill = graph.skills.find((s) => s.id === id);
                  return (
                    <li key={id} className="px-5 py-2.5 text-sm">
                      <Link href={`/skills#${id}`} className="underline-offset-2 hover:underline">{skill?.title ?? id}</Link>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {lesson && (
              <Card>
                <CardHead title="If you are stuck" />
                <div className="card-pad text-sm text-ink-2">
                  <p>Failing a check is information, not a verdict. The recovery path is fixed:</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5">
                    <li>Say out loud which step you could not do.</li>
                    <li>Re-read only that part of <Link href={`/learn/${lesson.id}`} className="underline underline-offset-2">{lesson.title}</Link>.</li>
                    <li>Ask the mentor for a hint — not an explanation.</li>
                    <li>Attempt again and log the error in the notebook.</li>
                  </ol>
                </div>
              </Card>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
