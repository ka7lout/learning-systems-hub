import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, desc } from "drizzle-orm";
import { requireUser, getUserSettings } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, Badge, SectionTitle } from "@/components/ui";
import { getLesson } from "@/content/curriculum";
import { LEARNING_STATES, type LearningState } from "@/content/types";
import { db } from "@/db";
import { lessonProgress, mentorMessages } from "@/db/schema";
import { markContentSeen, submitCheckpoint, sendMentorMessageAction } from "@/app/actions";
import { GRADE_LABELS } from "@/lib/scheduler";

const PRIORITY_TONES: Record<string, "neutral" | "navy" | "good" | "warn" | "bad"> = {
  core: "navy",
  support: "neutral",
  advanced: "good",
  specialization: "good",
  industry_extension: "warn",
  research: "neutral",
};

function GradeSelect({ name }: { name: string }) {
  return (
    <select name={name} required defaultValue="" className="rounded-lg border border-line bg-card px-2 py-1.5 text-[13px]">
      <option value="" disabled>
        Honest self-grade…
      </option>
      {GRADE_LABELS.map((g) => (
        <option key={g.grade} value={g.grade}>
          {g.grade} — {g.label}: {g.hint}
        </option>
      ))}
    </select>
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}) {
  const { moduleSlug, lessonSlug } = await params;
  const found = getLesson(moduleSlug, lessonSlug);
  if (!found) notFound();
  const { module: mod, lesson } = found;

  const user = await requireUser();
  const settings = await getUserSettings(user.id);
  const state = (settings?.learningState ?? "deep") as LearningState;

  const progressRows = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonSlug, lesson.slug)))
    .limit(1);
  const progress = progressRows[0];

  const lessonMentor = await db
    .select()
    .from(mentorMessages)
    .where(and(eq(mentorMessages.userId, user.id), eq(mentorMessages.lessonSlug, lesson.slug)))
    .orderBy(desc(mentorMessages.createdAt))
    .limit(6);

  const nextLesson = mod.lessons.find((l) => l.order === lesson.order + 1);
  const recallPrompt = `Close the source. From memory: explain the core ideas of "${lesson.title}" — what each major topic is, why it exists, and one example or failure mode.`;

  return (
    <PageShell path="/curriculum">
      <nav className="text-[12.5px] text-ink-faint" aria-label="Breadcrumb">
        <Link href="/curriculum" className="hover:text-accent">Curriculum</Link> /{" "}
        <Link href={`/curriculum/${mod.slug}`} className="hover:text-accent">{mod.title}</Link> / {lesson.title}
      </nav>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{lesson.title}</h1>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone={progress?.contentSeenAt ? "good" : "neutral"}>{progress?.contentSeenAt ? "Content studied" : "Not studied yet"}</Badge>
        <Badge tone={progress?.practiceCompletedAt ? "good" : "neutral"}>{progress?.practiceCompletedAt ? "Recall ✓" : "Recall pending"}</Badge>
        <Badge tone={progress?.transferCompletedAt ? "good" : "neutral"}>{progress?.transferCompletedAt ? "Transfer ✓" : "Transfer pending"}</Badge>
      </div>

      {/* State-adapted session plan */}
      <Card className="mt-5 border-l-4 border-l-accent">
        <p className="text-[13px] font-semibold text-ink">
          Session plan for your current state — “{LEARNING_STATES[state].label}”
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{LEARNING_STATES[state].guidance}</p>
        {state === "overload" && (
          <p className="mt-1 text-[13px] text-ink-soft">
            For this lesson: take only the first objective and the first two topics now; defer the transfer task to your next session.
          </p>
        )}
        {state === "fog" && (
          <p className="mt-1 text-[13px] text-ink-soft">
            Low-friction start: answer one auto-generated retrieval question from a topic you already know, then enter this lesson.
          </p>
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* WHY + objectives */}
          <Card>
            <SectionTitle>Why this matters</SectionTitle>
            <p className="text-[14px] leading-relaxed text-ink-soft">{lesson.why}</p>
            <h3 className="mt-4 text-[13.5px] font-semibold text-ink">Learning objectives</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13.5px] text-ink-soft">
              {lesson.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </Card>

          {/* Topics */}
          <Card>
            <SectionTitle sub="Every original topic preserved. Priority labels classify — they never delete.">
              Topics in this lesson
            </SectionTitle>
            <ul className="flex flex-wrap gap-2">
              {lesson.topics.map((topic) => (
                <li key={topic.slug}>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink">
                    {topic.name}
                    <Badge tone={PRIORITY_TONES[topic.priority]}>{topic.priority.replace("_", " ")}</Badge>
                  </span>
                </li>
              ))}
            </ul>
            {!progress?.contentSeenAt && (
              <form action={markContentSeen.bind(null, mod.slug, lesson.slug)} className="mt-4">
                <button className="rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] font-medium text-ink hover:border-ink-faint">
                  I have studied this content (external materials / notes)
                </button>
                <p className="mt-1 text-[12px] text-ink-faint">
                  Marking content as seen is tracked separately from competence — it unlocks nothing by itself.
                </p>
              </form>
            )}
          </Card>

          {/* Recall checkpoint */}
          <Card>
            <SectionTitle sub="Retrieval practice: write from memory, then grade yourself honestly. Passing this seeds every topic above into your spaced-review queue.">
              Mastery checkpoint — free recall
            </SectionTitle>
            <p className="rounded-lg bg-surface px-3 py-2 text-[13.5px] text-ink-soft">{recallPrompt}</p>
            <form action={submitCheckpoint} className="mt-3 space-y-3">
              <input type="hidden" name="moduleSlug" value={mod.slug} />
              <input type="hidden" name="lessonSlug" value={lesson.slug} />
              <input type="hidden" name="kind" value="recall" />
              <input type="hidden" name="prompt" value={recallPrompt} />
              <label htmlFor="recall-answer" className="sr-only">Your recall attempt</label>
              <textarea
                id="recall-answer"
                name="answer"
                required
                rows={6}
                placeholder="Write from memory. Re-reading first defeats the purpose."
                className="w-full rounded-lg border border-line px-3 py-2 text-[13.5px]"
              />
              <div className="flex flex-wrap items-center gap-3">
                <GradeSelect name="selfGrade" />
                <button className="rounded-lg bg-navy px-4 py-2 text-[13.5px] font-medium text-white hover:bg-navy-deep">
                  Submit recall attempt
                </button>
              </div>
            </form>
          </Card>

          {/* Transfer */}
          <Card>
            <SectionTitle sub="A concept counts only when it works outside the original example.">
              Transfer task — {lesson.transfer.title}
            </SectionTitle>
            <p className="rounded-lg bg-surface px-3 py-2 text-[13.5px] leading-relaxed text-ink-soft">
              {lesson.transfer.prompt}
            </p>
            <form action={submitCheckpoint} className="mt-3 space-y-3">
              <input type="hidden" name="moduleSlug" value={mod.slug} />
              <input type="hidden" name="lessonSlug" value={lesson.slug} />
              <input type="hidden" name="kind" value="transfer" />
              <input type="hidden" name="prompt" value={lesson.transfer.prompt.slice(0, 2000)} />
              <label htmlFor="transfer-answer" className="sr-only">Your transfer solution</label>
              <textarea
                id="transfer-answer"
                name="answer"
                required
                rows={6}
                placeholder="Your solution and reasoning. Paste code or write the plan — defend your decisions."
                className="w-full rounded-lg border border-line px-3 py-2 text-[13.5px]"
              />
              <div className="flex flex-wrap items-center gap-3">
                <GradeSelect name="selfGrade" />
                <button className="rounded-lg bg-navy px-4 py-2 text-[13.5px] font-medium text-white hover:bg-navy-deep">
                  Submit transfer attempt
                </button>
              </div>
            </form>
          </Card>

          {/* Case study, when the lesson has one */}
          {lesson.caseStudy && (
            <Card>
              <SectionTitle sub="Incomplete information, trade-offs, consequences — defend a decision with evidence.">
                Case — {lesson.caseStudy.title}
              </SectionTitle>
              <p className="rounded-lg bg-surface px-3 py-2 text-[13.5px] leading-relaxed text-ink-soft">
                {lesson.caseStudy.prompt}
              </p>
              <form action={submitCheckpoint} className="mt-3 space-y-3">
                <input type="hidden" name="moduleSlug" value={mod.slug} />
                <input type="hidden" name="lessonSlug" value={lesson.slug} />
                <input type="hidden" name="kind" value="case" />
                <input type="hidden" name="prompt" value={lesson.caseStudy.prompt.slice(0, 2000)} />
                <label htmlFor="case-answer" className="sr-only">Your case decision</label>
                <textarea
                  id="case-answer"
                  name="answer"
                  required
                  rows={5}
                  className="w-full rounded-lg border border-line px-3 py-2 text-[13.5px]"
                  placeholder="Your decision, the trade-offs you weighed, and the evidence behind it."
                />
                <div className="flex flex-wrap items-center gap-3">
                  <GradeSelect name="selfGrade" />
                  <button className="rounded-lg bg-navy px-4 py-2 text-[13.5px] font-medium text-white hover:bg-navy-deep">
                    Submit case decision
                  </button>
                </div>
              </form>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Notebook guidance */}
          <Card>
            <SectionTitle sub="Write by hand. Never copy the whole lesson.">Notebook guidance</SectionTitle>
            <h3 className="text-[12.5px] font-semibold uppercase tracking-wide text-bad">Must write</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] text-ink-soft">
              {lesson.notebook.mustWrite.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <h3 className="mt-3 text-[12.5px] font-semibold uppercase tracking-wide text-warn">Recommended</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] text-ink-soft">
              {lesson.notebook.recommended.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <h3 className="mt-3 text-[12.5px] font-semibold uppercase tracking-wide text-ink-faint">Optional</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] text-ink-soft">
              {lesson.notebook.optional.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </Card>

          {/* Mentor panel */}
          <Card>
            <SectionTitle sub="The mentor expects your attempt first. It will not do your thinking for you.">
              AI Mentor
            </SectionTitle>
            <form action={sendMentorMessageAction} className="space-y-2">
              <input type="hidden" name="lessonSlug" value={lesson.slug} />
              <input type="hidden" name="moduleSlug" value={mod.slug} />
              <label htmlFor="mentor-msg" className="sr-only">Ask the mentor</label>
              <textarea
                id="mentor-msg"
                name="message"
                required
                rows={3}
                maxLength={4000}
                placeholder='Show your attempt, then ask. e.g., "My attempt: … — check my reasoning" or "Give me a hint, not the answer."'
                className="w-full rounded-lg border border-line px-3 py-2 text-[13px]"
              />
              <button className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink hover:border-ink-faint">
                Send to mentor
              </button>
            </form>
            {lessonMentor.length > 0 && (
              <div className="mt-3 space-y-2">
                {[...lessonMentor].reverse().map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                      m.role === "user" ? "bg-accent-soft text-ink" : "bg-surface text-ink-soft"
                    }`}
                  >
                    <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                      {m.role === "user" ? "You" : m.provider === "socratic-fallback" ? "Guide (rule-based)" : "Mentor"}
                    </p>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/mentor" className="mt-3 inline-block text-[12.5px] font-medium text-accent hover:underline">
              Full mentor conversation →
            </Link>
          </Card>

          {nextLesson && (
            <Card>
              <p className="text-[13px] text-ink-soft">Next in this module</p>
              <Link
                href={`/learn/${mod.slug}/${nextLesson.slug}`}
                className="mt-1 block text-[14px] font-semibold text-navy hover:underline"
              >
                {nextLesson.order}. {nextLesson.title} →
              </Link>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}
