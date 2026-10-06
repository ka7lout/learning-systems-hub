import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { getSettings, owned, type LaterItemDoc, type StudyEventDoc, type SubmissionDoc, type TaskDoc } from "@/lib/dal";
import { buildCurriculumGraph } from "@/content";
import { LEARNING_STATES } from "@/content/learning-science";
import { computeSkillMastery } from "@/lib/engines/mastery";
import { dueReviews, reviewForecast } from "@/lib/engines/review";
import { aiDependencyAudit } from "@/lib/ai/mentor";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, EmptyState, MasteryChip, Meter } from "@/components/ui";
import { CaptureBox, RefreshTasks, StatePicker, TaskControls } from "@/components/dashboard-widgets";

export const dynamic = "force-dynamic";

const REASON_LABEL: Record<string, string> = {
  prerequisite: "Prerequisite",
  skill_gap: "Skill gap",
  project: "Project",
  review: "Review",
  career: "Career",
  interview: "Interview",
  research: "Research",
  client_communication: "Client communication",
  evidence: "Evidence",
};

export default async function DashboardPage() {
  const session = await pageSession();
  const settings = await getSettings(session);
  const graph = buildCurriculumGraph();

  const tasks = (await owned<TaskDoc>(session, "tasks").find({}, { sort: { createdAt: -1 }, limit: 40 })).filter(
    (t) => t.state === "suggested" || t.state === "active",
  );
  const due = await dueReviews(session, 50);
  const forecast = await reviewForecast(session, 14);
  const later = (await owned<LaterItemDoc>(session, "later_items").find({ handled: false }, { sort: { createdAt: -1 }, limit: 10 }));
  const events = await owned<StudyEventDoc>(session, "study_events").find({ kind: "lesson_opened" }, { sort: { createdAt: -1 }, limit: 1 });
  const submissions = await owned<SubmissionDoc>(session, "submissions").find({});
  const mastery = await computeSkillMastery(session, graph.skills.map((s) => s.id));
  const audit = await aiDependencyAudit(session);

  const counts = { unknown: 0, exposed: 0, developing: 0, competent: 0, independent: 0 } as Record<string, number>;
  for (const m of mastery.values()) counts[m.level] = (counts[m.level] ?? 0) + 1;
  const startedSkills = graph.skills.length - counts.unknown;

  const lastLesson = events[0]?.lessonId ? graph.lessons.find((l) => l.id === events[0].lessonId) : undefined;
  const firstLesson = graph.lessons.find((l) => l.prerequisites.length === 0);
  const continueLesson = lastLesson ?? firstLesson;
  const state = LEARNING_STATES.find((s) => s.id === settings.learningState) ?? LEARNING_STATES[0];
  const maxForecast = Math.max(1, ...forecast.map((f) => f.count));

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.name.split(" ")[0]}`}
        lede="This page answers one question: what is worth doing right now, and why."
      >
        <div className="flex gap-2">
          <Link href="/review" className="btn btn-sm">{due.length} due for review</Link>
          {continueLesson && <Link href={`/learn/${continueLesson.id}`} className="btn btn-primary btn-sm">Continue: {continueLesson.title.slice(0, 32)}</Link>}
        </div>
      </PageHeader>

      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            <Card>
              <CardHead title="Next actions" hint="Each task states why it exists. Nothing here is generated to fill space." action={<RefreshTasks />} />
              {tasks.length === 0 ? (
                <EmptyState
                  title="No tasks yet"
                  body="Tasks are generated from your own data: overdue reviews, weak prerequisites, active projects and gaps against your target role. Press Recompute, or open a lesson to give the engine something to work with."
                />
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {tasks.map((t) => (
                    <li key={t._id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip tone="accent">{REASON_LABEL[t.reasonKind] ?? t.reasonKind}</Chip>
                          <Chip>{t.estimatedMinutes} min</Chip>
                        </div>
                        <p className="mt-1.5 text-sm font-medium">{t.title}</p>
                        <p className="mt-0.5 text-sm text-ink-2">{t.description}</p>
                        <p className="mt-1 text-xs text-ink-3">Why: {t.reasonText}</p>
                        <Link
                          href={
                            t.targetKind === "assessment"
                              ? `/practice/${t.targetId}`
                              : t.targetKind === "project"
                                ? `/projects/${t.targetId}`
                                : t.targetKind === "lesson"
                                  ? `/learn/${t.targetId}`
                                  : "/dashboard"
                          }
                          className="mt-2 inline-block text-xs underline underline-offset-2"
                        >
                          Open
                        </Link>
                      </div>
                      <TaskControls taskId={t._id} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHead title="Where you actually are" hint="Completion, competence and evidence are separate measures (§218)." />
              <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
                <div>
                  <p className="h-section">Completion</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {new Set(submissions.map((s) => s.lessonId)).size}
                    <span className="text-base font-normal text-ink-3">/{graph.lessons.length}</span>
                  </p>
                  <p className="text-xs text-ink-3">lessons with at least one attempt</p>
                </div>
                <div>
                  <p className="h-section">Competence</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {counts.competent + counts.independent}
                    <span className="text-base font-normal text-ink-3">/{graph.skills.length}</span>
                  </p>
                  <p className="text-xs text-ink-3">skills at competent or above</p>
                </div>
                <div>
                  <p className="h-section">Evidence</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{counts.independent}</p>
                  <p className="text-xs text-ink-3">skills independently demonstrated</p>
                </div>
              </div>
              <div className="border-t border-line px-5 py-4">
                {startedSkills === 0 ? (
                  <p className="text-sm text-ink-3">No skill has evidence yet. Attempt one task and this becomes real data.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(["exposed", "developing", "competent", "independent"] as const).map((l) => (
                      <span key={l} className="flex items-center gap-1.5">
                        <MasteryChip level={l} />
                        <span className="text-sm tabular-nums text-ink-2">{counts[l]}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHead title="Review load, next 14 days" hint="Scheduled from your own recorded attempts." />
              {forecast.every((f) => f.count === 0) ? (
                <EmptyState title="Nothing scheduled" body="Review items appear after your first judged attempt. The schedule then expands as you pass items." />
              ) : (
                <div className="flex items-end gap-1.5 px-5 py-5" role="img" aria-label={`Review forecast: ${forecast.map((f) => `${f.date}: ${f.count}`).join(", ")}`}>
                  {forecast.map((f) => (
                    <div key={f.date} className="flex-1 text-center">
                      <div
                        className="mx-auto w-full rounded-sm"
                        style={{ height: `${8 + (f.count / maxForecast) * 56}px`, background: f.count ? "var(--accent)" : "var(--surface-3)" }}
                      />
                      <span className="mt-1 block text-[0.65rem] text-ink-3">{new Date(f.date).getDate()}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <div className="card-pad">
                <StatePicker current={settings.learningState} />
                <div className="mt-4 rounded-lg border border-line p-3 text-xs text-ink-2">
                  <p className="font-medium text-ink">{state.humanLabel} — current adaptation</p>
                  <p className="mt-1">
                    Task size {state.adaptation.taskSizeMinutes} min · {state.adaptation.simultaneousConcepts} concepts at a time ·{" "}
                    {state.adaptation.scaffolding} scaffolding
                  </p>
                  <ul className="mt-2 list-disc space-y-0.5 pl-4">
                    {state.guidance.map((g) => <li key={g}>{g}</li>)}
                  </ul>
                </div>
              </div>
            </Card>

            <Card>
              <CardHead title="Park it" hint="Write the distraction down, finish the task, deal with it after." />
              <div className="card-pad">
                <CaptureBox items={later.map((l) => ({ _id: l._id, text: l.text }))} />
              </div>
            </Card>

            <Card>
              <CardHead title="AI dependency" hint="Measured from the help level you recorded on each attempt." />
              <div className="card-pad">
                {audit.total === 0 ? (
                  <p className="text-sm text-ink-3">No attempts recorded yet, so there is nothing to measure.</p>
                ) : (
                  <>
                    <Meter value={audit.unaidedRate ?? 0} label="Unaided or hint-level first attempts" />
                    <p className="mt-2 text-sm text-ink-2">{audit.verdict}</p>
                    <p className="mt-1 text-xs text-ink-3">{audit.total} attempts recorded.</p>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <CardHead title="Ten questions you should always be able to answer" hint="§239" />
              <ol className="list-decimal space-y-1 px-8 py-4 text-sm text-ink-2">
                <li>What am I learning now?</li>
                <li>Why does it matter?</li>
                <li>What should I do right now?</li>
                <li>What should I write down?</li>
                <li>How will I know I understood it?</li>
                <li>What happens if I fail the check?</li>
                <li>What comes next?</li>
                <li>Where is this used in a real job?</li>
                <li>What evidence will I have afterwards?</li>
                <li>What should I review later?</li>
              </ol>
              <p className="px-5 pb-4 text-xs text-ink-3">
                Every lesson page answers all ten. If one is missing there, it is a defect, not a design choice.
              </p>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
