import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph, HARVARD_GAP_MATRIX, HARVARD_REALITY_CHECK, ORIGINAL_MODULES, ORIGINAL_TOPIC_COUNT } from "@/content";
import { owned, type SubmissionDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, SourceCategoryChip, VerificationChip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const submissions = await owned<SubmissionDoc>(session, "submissions").find({});
  const attempted = new Set(submissions.map((s) => s.lessonId));

  const originalLessonCount = graph.lessons.filter((l) => l.sourceCategory === "Original Curriculum").length;

  return (
    <>
      <PageHeader
        title="Curriculum"
        lede="One graph, built from labelled sources. Every node names where it came from; nothing is called a Harvard course unless a retrieved source says so."
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHead title="What this curriculum is" />
            <div className="card-pad space-y-3 text-sm text-ink-2">
              <p>
                The original curriculum is the spine: <strong className="text-ink">{ORIGINAL_MODULES.length} modules</strong>,{" "}
                <strong className="text-ink">{ORIGINAL_MODULES.reduce((n, m) => n + m.sessions.length, 0)} sessions</strong> and{" "}
                <strong className="text-ink">{ORIGINAL_TOPIC_COUNT} topics</strong>, preserved exactly as written. Nothing was deleted
                because Harvard does not teach it, and nothing was added to the original list to make it look more impressive.
              </p>
              <p>
                Around that spine sit four labelled extensions. Harvard College and Harvard Extension nodes exist only where a public
                page was retrieved and recorded. Industry and research nodes are explicitly marked as additions that the original
                curriculum did not contain.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(["Original Curriculum", "Harvard College", "Harvard Extension", "Industry Extension", "Research Extension"] as const).map((c) => (
                  <span key={c} className="flex items-center gap-1.5">
                    <SourceCategoryChip category={c} />
                    <span className="text-xs tabular-nums text-ink-3">{graph.lessons.filter((l) => l.sourceCategory === c).length}</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-ink-3">
                {originalLessonCount} of {graph.lessons.length} lessons carry the Original Curriculum label as their single primary source.
              </p>
            </div>
          </Card>

          <Card>
            <CardHead title="Harvard reality check" hint="Re-verified from official pages on 2026-10-05." />
            <div className="card-pad space-y-2 text-sm text-ink-2">
              <VerificationChip status={HARVARD_REALITY_CHECK.status} />
              <p className="font-medium text-ink">{HARVARD_REALITY_CHECK.question}</p>
              <p>{HARVARD_REALITY_CHECK.answer}</p>
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-ink-3">
                {HARVARD_REALITY_CHECK.evidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
              <p className="text-xs text-ink-3">{HARVARD_REALITY_CHECK.caveat} Checked {HARVARD_REALITY_CHECK.checkedAt}.</p>
              <Link href="/research#sources" className="inline-block text-xs underline underline-offset-2">
                See the source records
              </Link>
            </div>
          </Card>
        </div>

        <h2 className="mt-8 text-sm font-semibold tracking-tight">The 22-stage spine</h2>
        <p className="mt-1 text-sm text-ink-2">Ordered by prerequisite, not by the order topics appear in a syllabus.</p>

        <ol className="mt-4 space-y-3">
          {graph.stages.map((stage) => {
            const courses = graph.courses.filter((c) => c.stageId === stage.id);
            const lessons = graph.lessons.filter((l) => l.stageId === stage.id);
            const touched = lessons.filter((l) => attempted.has(l.id)).length;
            return (
              <li key={stage.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-3">
                    <div>
                      <p className="text-xs text-ink-3">Stage {stage.order}</p>
                      <h3 className="text-sm font-semibold tracking-tight">{stage.title}</h3>
                      <p className="mt-0.5 max-w-2xl text-sm text-ink-2">{stage.summary}</p>
                    </div>
                    <Chip>{touched}/{lessons.length} lessons attempted</Chip>
                  </div>
                  <ul className="divide-y divide-[var(--line)]">
                    {courses.map((course) => {
                      const courseLessons = graph.lessons.filter((l) => l.courseId === course.id);
                      return (
                        <li key={course.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <Link href={`/curriculum/${course.id}`} className="text-sm font-medium underline-offset-2 hover:underline">
                              {course.title}
                            </Link>
                            <p className="mt-0.5 max-w-xl text-xs text-ink-2">{course.summary}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                            <SourceCategoryChip category={course.sourceCategory} />
                            <Chip>{course.importance.replace("_", " ").toLowerCase()}</Chip>
                            <Chip>{courseLessons.length} lessons</Chip>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </li>
            );
          })}
        </ol>

        <h2 id="gaps" className="mt-10 text-sm font-semibold tracking-tight">Gap and overlap analysis</h2>
        <p className="mt-1 text-sm text-ink-2">
          Where the original curriculum and the retrieved Harvard material agree, differ, or leave something uncovered.
        </p>
        <Card className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-2.5 font-semibold">Area</th>
                <th className="px-4 py-2.5 font-semibold">Original curriculum</th>
                <th className="px-4 py-2.5 font-semibold">What the Harvard material adds</th>
                <th className="px-4 py-2.5 font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody>
              {HARVARD_GAP_MATRIX.map((row) => (
                <tr key={row.area} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-2.5 font-medium">{row.area}</td>
                  <td className="px-4 py-2.5 text-ink-2">{row.original}</td>
                  <td className="px-4 py-2.5 text-ink-2">{row.harvardAdds}</td>
                  <td className="px-4 py-2.5 text-ink-2">{row.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <h2 className="mt-10 text-sm font-semibold tracking-tight">Harvard mappings</h2>
        <p className="mt-1 text-sm text-ink-2">
          A mapping is a pointer to a documented offering, not a claim that this curriculum is equivalent to it.
        </p>
        <Card className="mt-3">
          <ul className="divide-y divide-[var(--line)]">
            {graph.harvardMappings.map((m) => (
              <li key={m.id} className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{m.identifier}</span>
                  <span className="text-sm text-ink-2">{m.title}</span>
                  <Chip>{m.offeringBody}</Chip>
                  <VerificationChip status={m.verificationStatus} />
                </div>
                <p className="mt-1 text-xs text-ink-2">{m.evidence}</p>
                <p className="mt-0.5 text-xs text-ink-3">Informs: {m.mapsToCourses.join(", ") || "—"} · verified {m.lastVerified}</p>
              </li>
            ))}
          </ul>
        </Card>
      </PageBody>
    </>
  );
}
