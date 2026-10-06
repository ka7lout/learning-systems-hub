import Link from "next/link";
import { AppShell } from "@/components/shell";
import { Badge, Card, PageHeader, SourceBadge } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getCourseTitles, getProgressFor, getTracksWithCourses } from "@/lib/data";

export const dynamic = "force-dynamic";

const CATEGORY_TONE: Record<string, string> = {
  "Original Curriculum": "accent",
  "Harvard College": "neutral",
  "Harvard Extension": "neutral",
  "Industry Extension": "neutral",
  "Research Extension": "neutral",
};

export default async function CurriculumPage() {
  const user = await requirePage();
  const [tracks, progress, titles] = await Promise.all([
    getTracksWithCourses(),
    getProgressFor(user.id),
    getCourseTitles(),
  ]);
  const statusByLesson = new Map(progress.map((p) => [p.lessonKey, p.status]));

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Curriculum graph"
        title="The 22-area spine, with every original topic preserved"
        description="Courses are labelled by source layer and carry a verification status. Harvard College and Harvard Extension are separate layers and are never presented as the same thing. Prerequisites are edges in a cycle-checked graph, not a flat list."
      />

      <div className="mb-6 flex flex-wrap gap-2 text-xs text-muted">
        {Object.keys(CATEGORY_TONE).map((c) => (
          <Badge key={c} tone={CATEGORY_TONE[c]}>
            {c}
          </Badge>
        ))}
      </div>

      <div className="space-y-8">
        {tracks.map((track) => (
          <section key={track.key}>
            <h2 className="text-base font-semibold text-ink">{track.title}</h2>
            <p className="mb-3 text-sm text-muted">{track.summary}</p>
            {track.courses.length === 0 ? (
              <p className="rounded-md border border-dashed border-line p-3 text-xs text-muted">
                No course nodes are attached to this area yet. This is a truthful empty state, not a placeholder lesson.
              </p>
            ) : (
              <div className="space-y-3">
                {track.courses.map((course) => (
                  <Card key={course.key} className="p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone={CATEGORY_TONE[course.sourceCategory] ?? "neutral"}>{course.sourceCategory}</Badge>
                      <Badge>{course.level}</Badge>
                      <SourceBadge status={course.verificationStatus} />
                      <span className="text-xs text-muted">{course.weeklyWorkload}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink">{course.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{course.summary}</p>
                    {course.prerequisites.length > 0 ? (
                      <p className="mt-2 text-xs text-muted">
                        Prerequisites: {course.prerequisites.map((p) => titles.get(p) ?? p).join(" · ")}
                      </p>
                    ) : null}
                    {course.lessons.length > 0 ? (
                      <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                        {course.lessons.map((lesson) => {
                          const status = statusByLesson.get(lesson.key);
                          return (
                            <li key={lesson.key}>
                              <Link
                                href={`/learn/${lesson.key}`}
                                className="flex items-center justify-between gap-2 rounded border border-line px-3 py-2 text-sm text-ink hover:border-linestrong"
                              >
                                <span className="truncate">{lesson.title}</span>
                                {status ? (
                                  <Badge tone={status === "demonstrated" ? "good" : "warn"}>{status}</Badge>
                                ) : null}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="mt-3 text-xs text-muted">
                        Course node defined with objectives, workload and mastery criteria; lesson content for this node
                        is not written yet.
                      </p>
                    )}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-muted">Objectives and mastery criteria</summary>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Objectives</p>
                          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink">
                            {course.learningObjectives.map((o) => (
                              <li key={o}>{o}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mastery criteria</p>
                          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink">
                            {course.masteryCriteria.map((m) => (
                              <li key={m}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </details>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </AppShell>
  );
}
