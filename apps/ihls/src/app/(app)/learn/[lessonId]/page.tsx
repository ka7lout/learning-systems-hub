import Link from "next/link";
import { notFound } from "next/navigation";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph } from "@/content";
import { MENTOR_ACTIONS } from "@/lib/ai/mentor";
import { computeSkillMastery } from "@/lib/engines/mastery";
import { owned, type NoteDoc, type SubmissionDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, EmptyState, MasteryChip, Prose, SourceCategoryChip, VerificationChip } from "@/components/ui";
import { MarkOpened, NotebookEditor } from "@/components/lesson-widgets";
import { MentorPanel } from "@/components/MentorPanel";

export const dynamic = "force-dynamic";

const BLOCK_LABEL: Record<string, string> = {
  why: "Why this exists",
  concept: "Concept",
  mental_model: "Mental model",
  math: "The mathematics",
  worked_example: "Worked example",
  code: "Code",
  pitfall: "Common failure",
  transfer: "Transfer",
  case: "Case",
  checkpoint: "Checkpoint",
  engineering_note: "Engineering note",
};

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const lesson = graph.lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const course = graph.courses.find((c) => c.id === lesson.courseId);
  const assessments = graph.assessments.filter((a) => a.lessonId === lesson.id);
  const mastery = await computeSkillMastery(session, lesson.skills);
  const notes = await owned<NoteDoc>(session, "notes").find({ lessonId: lesson.id });
  const submissions = await owned<SubmissionDoc>(session, "submissions").find({ lessonId: lesson.id });
  const projects = graph.projects.filter((p) => lesson.projects.includes(p.id));
  const roles = graph.roles.filter((r) => lesson.careerRoles.includes(r.id));
  const sources = graph.sources.filter((s) => lesson.sources.includes(s.sourceId));
  const prereqs = lesson.prerequisites.map((p) => graph.lessons.find((l) => l.id === p)).filter(Boolean);
  const nextLessons = graph.lessons.filter((l) => l.prerequisites.includes(lesson.id)).slice(0, 4);
  const noteFor = (kind: NoteDoc["kind"]) => notes.find((n) => n.kind === kind)?.content ?? "";

  return (
    <>
      <MarkOpened lessonId={lesson.id} />
      <PageHeader title={lesson.title} lede={course ? `${course.title} · ${lesson.estimatedEffortMinutes} minutes of focused work` : undefined}>
        <div className="flex flex-wrap gap-2">
          <SourceCategoryChip category={lesson.sourceCategory} />
          <Chip>{lesson.importance.replace(/_/g, " ").toLowerCase()}</Chip>
          <Chip>Level {lesson.level}</Chip>
        </div>
      </PageHeader>

      <PageBody>
        {lesson.contentStatus === "outline_only" && (
          <div className="mb-5 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--caution)", color: "var(--caution)" }}>
            <p className="font-medium">This lesson is an outline, not a written lesson.</p>
            <p className="mt-0.5">
              The topics, objectives, prerequisites and mastery criteria below are real and come from the curriculum. The explanatory
              prose has not been authored yet. Use the topic list with the mentor and your own sources rather than assuming something
              is missing from your understanding.
            </p>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
          <div className="space-y-5">
            <Card>
              <CardHead title="What you are learning and why" />
              <div className="card-pad space-y-4">
                <div>
                  <p className="h-section">Objectives</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                    {lesson.learningObjectives.map((o) => <li key={o}>{o}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="h-section">Topics covered ({lesson.topics.length})</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {lesson.topics.map((t) => <Chip key={t}>{t}</Chip>)}
                  </div>
                  {lesson.sourceCategory === "Original Curriculum" && (
                    <p className="mt-2 text-xs text-ink-3">Preserved verbatim from the original curriculum.</p>
                  )}
                </div>
                <div>
                  <p className="h-section">How you will know you understood it</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                    {lesson.masteryCriteria.map((m) => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              </div>
            </Card>

            {lesson.blocks.map((b) => (
              <Card key={b.id}>
                <CardHead title={b.title} hint={BLOCK_LABEL[b.kind] ?? b.kind} />
                <div className="card-pad">
                  <Prose text={b.body} />
                </div>
              </Card>
            ))}

            <Card>
              <CardHead title="Notebook" hint="§144 — what to write by hand, what is optional." />
              <div className="card-pad space-y-5">
                <div>
                  <p className="h-section" style={{ color: "var(--accent)" }}>Must write</p>
                  <div className="mt-2">
                    <NotebookEditor lessonId={lesson.id} kind="must_write" initial={noteFor("must_write")} prompts={lesson.notebook.mustWrite} />
                  </div>
                </div>
                <div>
                  <p className="h-section">Recommended</p>
                  <div className="mt-2">
                    <NotebookEditor lessonId={lesson.id} kind="recommended" initial={noteFor("recommended")} prompts={lesson.notebook.recommended} />
                  </div>
                </div>
                {lesson.notebook.optional.length > 0 && (
                  <div>
                    <p className="h-section">Optional</p>
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-ink-3">
                      {lesson.notebook.optional.map((o) => <li key={o}>{o}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHead
                title="Checks for this lesson"
                hint={assessments.length ? "Recall → application → transfer." : undefined}
              />
              {assessments.length === 0 ? (
                <EmptyState
                  title="No checks written for this lesson yet"
                  body="Assessment items exist for the authored lessons. Rather than show you a generated quiz, this says plainly that none has been written. Use the mastery criteria above and ask the mentor to examine you."
                />
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {assessments.map((a) => {
                    const attempts = submissions.filter((s) => s.assessmentId === a.id);
                    const passed = attempts.some((s) => s.correct === true);
                    return (
                      <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <Link href={`/practice/${a.id}`} className="text-sm font-medium underline-offset-2 hover:underline">
                            {a.prompt.slice(0, 110)}{a.prompt.length > 110 ? "…" : ""}
                          </Link>
                          <p className="mt-0.5 text-xs text-ink-3">
                            {a.type.replace(/_/g, " ")} · tier {a.tier} · difficulty {a.difficulty}/5 · {a.estimatedMinutes} min ·{" "}
                            {a.evaluation === "auto" ? "checked automatically" : a.evaluation === "mentor" ? "mentor-reviewed" : "self-assessed against a rubric"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {passed ? <Chip tone="positive">Passed</Chip> : attempts.length ? <Chip tone="caution">{attempts.length} attempts</Chip> : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHead title="Ask the mentor" hint="Scoped to this lesson and your own record." />
              <MentorPanel
                actions={MENTOR_ACTIONS.map((a) => ({ id: a.id, label: a.label, helpLevel: a.helpLevel }))}
                lessonId={lesson.id}
                providerConfigured={Boolean(process.env.PUTER_AUTH_TOKEN)}
                compact
              />
            </Card>

            <Card>
              <CardHead title="Prerequisites" />
              {prereqs.length === 0 ? (
                <p className="card-pad text-sm text-ink-3">None. This is an entry point into the graph.</p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {prereqs.map((p) => (
                    <li key={p!.id} className="px-5 py-2.5 text-sm">
                      <Link href={`/learn/${p!.id}`} className="underline-offset-2 hover:underline">{p!.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHead title="Skills this builds" />
              <ul className="divide-y divide-[var(--line)]">
                {lesson.skills.map((id) => {
                  const skill = graph.skills.find((s) => s.id === id);
                  if (!skill) return null;
                  return (
                    <li key={id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <Link href={`/skills#${id}`} className="text-sm underline-offset-2 hover:underline">{skill.title}</Link>
                      <MasteryChip level={mastery.get(id)?.level ?? "unknown"} />
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card>
              <CardHead title="Where this is used" hint="Projects and roles that depend on it." />
              <div className="card-pad space-y-3 text-sm">
                {projects.length > 0 ? (
                  <div>
                    <p className="h-section">Projects</p>
                    <ul className="mt-1 space-y-1">
                      {projects.map((p) => (
                        <li key={p.id}>
                          <Link href={`/projects/${p.id}`} className="underline-offset-2 hover:underline">{p.title}</Link>
                          <span className="text-ink-3"> · ladder level {p.ladderLevel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-ink-3">No project in the ladder depends on this lesson yet.</p>
                )}
                {roles.length > 0 && (
                  <div>
                    <p className="h-section">Roles referencing these skills</p>
                    <ul className="mt-1 space-y-1">
                      {roles.map((r) => (
                        <li key={r.id}>
                          <Link href={`/career#${r.id}`} className="underline-offset-2 hover:underline">{r.title}</Link>
                          <span className="text-ink-3"> · {r.referenceEmployer}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            {sources.length > 0 && (
              <Card>
                <CardHead title="Sources for this lesson" />
                <ul className="divide-y divide-[var(--line)]">
                  {sources.map((s) => (
                    <li key={s.sourceId} className="px-5 py-3">
                      <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-sm underline underline-offset-2">{s.title}</a>
                      <p className="mt-0.5 text-xs text-ink-3">{s.publisher} · retrieved {s.accessedAt}</p>
                      <div className="mt-1"><VerificationChip status={s.verificationStatus} /></div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {nextLessons.length > 0 && (
              <Card>
                <CardHead title="What comes next" />
                <ul className="divide-y divide-[var(--line)]">
                  {nextLessons.map((n) => (
                    <li key={n.id} className="px-5 py-2.5 text-sm">
                      <Link href={`/learn/${n.id}`} className="underline-offset-2 hover:underline">{n.title}</Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
