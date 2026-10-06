import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph } from "@/content";
import { owned, type SubmissionDoc, type StudyEventDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, SourceCategoryChip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LearnIndexPage() {
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const submissions = await owned<SubmissionDoc>(session, "submissions").find({});
  const opened = await owned<StudyEventDoc>(session, "study_events").find({ kind: "lesson_opened" });
  const attemptedLessons = new Set(submissions.filter((s) => s.correct).map((s) => s.lessonId));
  const openedLessons = new Set(opened.map((e) => e.lessonId).filter(Boolean) as string[]);

  const unlocked = (prereqs: string[]) => prereqs.every((p) => attemptedLessons.has(p));
  const authored = graph.lessons.filter((l) => l.contentStatus === "authored");
  const nextUp = graph.lessons.find((l) => unlocked(l.prerequisites) && !attemptedLessons.has(l.id));

  return (
    <>
      <PageHeader
        title="Learn"
        lede={`${graph.lessons.length} lessons. ${authored.length} are fully written; the rest are seeded as topic outlines and say so on the page.`}
      >
        <div className="flex gap-2">
          <Link href="/learn/english" className="btn btn-sm">Technical English</Link>
          {nextUp && <Link href={`/learn/${nextUp.id}`} className="btn btn-primary btn-sm">Next: {nextUp.title.slice(0, 30)}</Link>}
        </div>
      </PageHeader>
      <PageBody>
        <Card className="mb-5">
          <CardHead title="How to read the lesson list" />
          <div className="card-pad grid gap-3 text-sm text-ink-2 sm:grid-cols-3">
            <p><Chip tone="positive">Authored</Chip> <span className="mt-1 block">Written lesson blocks: why, concept, worked example, pitfalls, transfer.</span></p>
            <p><Chip tone="caution">Outline only</Chip> <span className="mt-1 block">Topic list, objectives, mastery criteria and prerequisites are real; the prose is not written yet.</span></p>
            <p><Chip>Locked</Chip> <span className="mt-1 block">A prerequisite lesson has no passed attempt yet. You can still open it; the warning stays visible.</span></p>
          </div>
        </Card>

        {graph.stages.map((stage) => {
          const lessons = graph.lessons.filter((l) => l.stageId === stage.id);
          if (lessons.length === 0) return null;
          return (
            <section key={stage.id} className="mb-6">
              <h2 className="text-sm font-semibold tracking-tight">
                <span className="text-ink-3">Stage {stage.order} — </span>
                {stage.title}
              </h2>
              <Card className="mt-2">
                <ul className="divide-y divide-[var(--line)]">
                  {lessons.map((l) => {
                    const locked = !unlocked(l.prerequisites);
                    return (
                      <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <Link href={`/learn/${l.id}`} className="text-sm font-medium underline-offset-2 hover:underline">
                            {l.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-ink-3">
                            {l.learningObjectives[0] ?? l.topics.slice(0, 4).join(" · ")}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                          {attemptedLessons.has(l.id) && <Chip tone="positive">Passed an attempt</Chip>}
                          {!attemptedLessons.has(l.id) && openedLessons.has(l.id) && <Chip>Opened</Chip>}
                          {locked && <Chip tone="caution">Prerequisites unmet</Chip>}
                          <SourceCategoryChip category={l.sourceCategory} />
                          {l.contentStatus === "outline_only" ? <Chip tone="caution">Outline only</Chip> : <Chip tone="positive">Authored</Chip>}
                          <Chip>{l.estimatedEffortMinutes} min</Chip>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          );
        })}
      </PageBody>
    </>
  );
}
