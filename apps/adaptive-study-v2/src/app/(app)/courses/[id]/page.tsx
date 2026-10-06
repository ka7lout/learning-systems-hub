import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getCourse,
  getCourseConcepts,
  getCourseLessons,
  getCourseAssessments,
  getUserLessonProgressMap,
} from "@/lib/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [course, concepts, lessons, assessments, progressMap] = await Promise.all([
    getCourse(id),
    getCourseConcepts(id),
    getCourseLessons(id),
    getCourseAssessments(id),
    getUserLessonProgressMap(user.id),
  ]);

  if (!course) notFound();

  const completed = lessons.filter((l) => progressMap[l.id]?.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/courses" className="text-sm brand hover:underline">
          ← Courses
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: course.color }} />
          <span className="text-xs uppercase tracking-wide muted">{course.code}</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold">{course.title}</h1>
        {course.referenceText && (
          <p className="muted mt-1 text-sm">Reference: {course.referenceText}</p>
        )}
        <p className="muted mt-1 text-xs">
          Provenance: {course.provenance} · Verification: {course.verificationStatus}
        </p>
      </div>

      {/* progress */}
      <section className="surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="muted">
            {lessons.length === 0
              ? "No lessons have been generated from your source material yet."
              : `Lessons completed: ${completed}/${lessons.length}`}
          </span>
          {lessons.length > 0 && (
            <span className="surface-2 px-2 py-0.5 text-xs">
              {Math.round((completed / lessons.length) * 100)}%
            </span>
          )}
        </div>
      </section>

      {/* assessments */}
      <section className="surface p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide muted">Assessments</h3>
        {assessments.length === 0 ? (
          <p className="muted mt-2 text-sm">No assessment data available for this course.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {assessments.map((a) => (
              <li key={a.id} className="surface-2 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-100">{a.title}</span>
                  <span className="text-xs muted">{a.type}</span>
                </div>
                <p className="muted mt-1 text-xs">
                  {a.examDate ? `Date: ${a.examDate}` : "Exam date: Not available"}
                </p>
                <p className="muted mt-1 text-xs">
                  Weight: {a.weight ? `${a.weight}%` : "Not specified"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* lessons */}
      <section className="surface p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide muted">Lessons</h3>
        {lessons.length === 0 ? (
          <p className="muted mt-2 text-sm">
            No lessons have been generated from your source material yet.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[#1a2238]">
            {lessons.map((l) => {
              const p = progressMap[l.id];
              const status = p?.status ?? "not_started";
              return (
                <li key={l.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/learn/${l.id}`}
                      className="font-medium text-slate-100 hover:underline"
                    >
                      {l.title}
                    </Link>
                    <p className="muted text-xs mt-0.5">
                      Origin: {l.origin} · {l.verificationStatus}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      status === "completed"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : status === "in_progress"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-slate-600/20 text-slate-300"
                    }`}
                  >
                    {status === "completed"
                      ? "Done"
                      : status === "in_progress"
                        ? "In progress"
                        : "Not started"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
