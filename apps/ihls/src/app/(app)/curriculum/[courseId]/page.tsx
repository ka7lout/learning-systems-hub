import Link from "next/link";
import { notFound } from "next/navigation";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph } from "@/content";
import { computeSkillMastery } from "@/lib/engines/mastery";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, MasteryChip, SourceCategoryChip, VerificationChip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const course = graph.courses.find((c) => c.id === courseId);
  if (!course) notFound();

  const stage = graph.stages.find((s) => s.id === course.stageId);
  const lessons = graph.lessons.filter((l) => l.courseId === course.id);
  const skillIds = [...new Set(lessons.flatMap((l) => l.skills))];
  const mastery = await computeSkillMastery(session, skillIds);
  const mappings = graph.harvardMappings.filter((m) => m.mapsToCourses.includes(course.id));
  const sources = graph.sources.filter((s) => (course.sources ?? []).includes(s.sourceId));

  return (
    <>
      <PageHeader title={course.title} lede={course.summary}>
        <div className="flex flex-wrap gap-2">
          <SourceCategoryChip category={course.sourceCategory} />
          <Chip>{course.importance.replace(/_/g, " ").toLowerCase()}</Chip>
          {stage && <Chip>Stage {stage.order}</Chip>}
        </div>
      </PageHeader>
      <PageBody>
        {course.note && (
          <div className="mb-5 rounded-lg border border-line bg-[var(--surface-2)] px-4 py-3 text-sm text-ink-2">{course.note}</div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <Card>
            <CardHead
              title={`${lessons.length} lessons`}
              hint={course.originalSessionCount ? `${course.originalSessionCount} original sessions preserved in this course.` : undefined}
            />
            <ul className="divide-y divide-[var(--line)]">
              {lessons.map((l) => (
                <li key={l.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/learn/${l.id}`} className="text-sm font-medium underline-offset-2 hover:underline">
                      {l.originalSession ? `Session ${l.originalSession}. ` : ""}
                      {l.title}
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <Chip>{l.estimatedEffortMinutes} min</Chip>
                      {l.contentStatus === "outline_only" ? <Chip tone="caution">Outline only</Chip> : <Chip tone="positive">Authored</Chip>}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-ink-2">{l.topics.slice(0, 8).join(" · ")}{l.topics.length > 8 ? ` · +${l.topics.length - 8} more` : ""}</p>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHead title="Skills developed here" />
              {skillIds.length === 0 ? (
                <p className="card-pad text-sm text-ink-3">No skills are attached to this course yet.</p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {skillIds.map((id) => {
                    const skill = graph.skills.find((s) => s.id === id);
                    if (!skill) return null;
                    return (
                      <li key={id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                        <Link href={`/skills#${skill.id}`} className="text-sm underline-offset-2 hover:underline">{skill.title}</Link>
                        <MasteryChip level={mastery.get(id)?.level ?? "unknown"} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <CardHead title="Harvard mappings" hint="Pointers to documented offerings, not equivalence." />
              {mappings.length === 0 ? (
                <p className="card-pad text-sm text-ink-3">
                  No Harvard offering was mapped to this course. That is a recorded result, not a missing lookup.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {mappings.map((m) => (
                    <li key={m.id} className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{m.identifier}</span>
                        <VerificationChip status={m.verificationStatus} />
                      </div>
                      <p className="text-sm text-ink-2">{m.title}</p>
                      <p className="mt-1 text-xs text-ink-3">{m.evidence}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {sources.length > 0 && (
              <Card>
                <CardHead title="Sources" />
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
          </div>
        </div>
      </PageBody>
    </>
  );
}
