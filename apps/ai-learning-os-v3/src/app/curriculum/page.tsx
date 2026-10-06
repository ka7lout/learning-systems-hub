import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, masteryRecords, stages } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { PageHeader, Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

const SOURCE_TAG: Record<string, string> = {
  "Original Curriculum": "tag-accent",
  "Harvard College": "tag",
  "Harvard Extension": "tag",
  "Industry Extension": "tag-warn",
  "Research Extension": "tag",
};

export default async function CurriculumPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const [stageRows, courseRows, lessonRows, mastery] = await Promise.all([
    db.select().from(stages).orderBy(asc(stages.position)),
    db.select().from(courses).orderBy(asc(courses.position)),
    db.select({ id: lessons.id, courseId: lessons.courseId }).from(lessons),
    db.select().from(masteryRecords).where(eq(masteryRecords.userId, user.id)),
  ]);

  const lessonCount = new Map<string, number>();
  for (const l of lessonRows) lessonCount.set(l.courseId, (lessonCount.get(l.courseId) ?? 0) + 1);
  const masteredLessons = new Set(
    mastery.filter((m) => m.nodeType === "lesson" && m.level >= 5).map((m) => m.nodeId),
  );

  return (
    <Shell user={user} active="/curriculum">
      <PageHeader
        title="Curriculum graph"
        lead="Twenty-two stages ordered by prerequisite, not by convenience. Every node declares exactly one primary source category, and Harvard mappings are stored as candidates with an explicit verification status — never as a claim of enrolment or credit."
      />

      <div className="flex flex-wrap gap-2 mb-6 text-[11px]">
        {Object.keys(SOURCE_TAG).map((k) => (
          <span key={k} className={SOURCE_TAG[k]}>
            {k}
          </span>
        ))}
      </div>

      <div className="space-y-7">
        {stageRows.map((stage) => {
          const stageCourses = courseRows.filter((c) => c.stageId === stage.id);
          return (
            <section key={stage.id}>
              <h2 className="text-sm font-semibold">
                <span className="muted tabular-nums mr-2">
                  {String(stage.position).padStart(2, "0")}
                </span>
                {stage.title}
              </h2>
              <p className="muted text-xs mt-1 leading-relaxed max-w-3xl">{stage.summary}</p>

              {stageCourses.length === 0 ? (
                <p className="text-[11px] muted mt-2 italic">
                  No course node is authored for this stage yet — this is a truthful empty state, not a
                  placeholder lesson.
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {stageCourses.map((c) => {
                    const n = lessonCount.get(c.id) ?? 0;
                    return (
                      <li key={c.id}>
                        <Link href={`/curriculum/${c.id}`} className="surface p-4 block">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">{c.title}</span>
                            <span className={SOURCE_TAG[c.sourceCategory] ?? "tag"}>{c.sourceCategory}</span>
                            <span className="tag">{c.priority}</span>
                            <span className="tag">{c.level}</span>
                          </div>
                          <p className="muted text-xs mt-2 leading-relaxed">{c.summary}</p>
                          <p className="text-[11px] muted mt-2">
                            {c.topics.length} preserved topics · ~{c.estimatedHours}h ·{" "}
                            {n > 0 ? `${n} authored lesson${n === 1 ? "" : "s"}` : "lessons not yet authored"}
                            {c.prerequisites.length > 0
                              ? ` · requires ${c.prerequisites.length} prior course${c.prerequisites.length === 1 ? "" : "s"}`
                              : " · no prerequisites"}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <p className="text-[11px] muted mt-8 leading-relaxed">
        {masteredLessons.size} lesson node(s) currently sit at mastery level 5 or above for your account.
        Course-level completion is deliberately not shown as a single percentage: completion, competence and
        evidence are different claims.
      </p>
    </Shell>
  );
}
