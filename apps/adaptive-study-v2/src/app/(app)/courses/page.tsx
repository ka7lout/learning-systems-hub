import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCourses, getCourseLessons, getUserLessonProgressMap } from "@/lib/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [courses, progressMap] = await Promise.all([
    getCourses(),
    getUserLessonProgressMap(user.id),
  ]);

  const coursesWithStats = await Promise.all(
    courses.map(async (c) => {
      const lessons = await getCourseLessons(c.id);
      const completed = lessons.filter((l) => progressMap[l.id]?.status === "completed").length;
      return { course: c, total: lessons.length, completed };
    }),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Courses</h1>
        <p className="muted mt-1 text-sm">
          Your enrolled courses. Progress reflects only lessons you have actually completed.
        </p>
      </div>

      {coursesWithStats.length === 0 ? (
        <p className="surface-2 p-4 text-sm muted">
          No courses have been imported yet. Source ingestion could not verify any course list from
          your Google Drive in this environment.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coursesWithStats.map(({ course, total, completed }) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="surface p-5 transition hover:border-[#2c3a63]"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: course.color }}
                />
                <span className="text-xs uppercase tracking-wide muted">{course.code}</span>
                <span className="ml-auto rounded bg-[#13243a] px-2 py-0.5 text-[10px] brand">
                  {course.verificationStatus}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-semibold">{course.title}</h2>
              {course.referenceText && (
                <p className="muted mt-1 text-xs">Ref: {course.referenceText}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="muted">
                  {total === 0 ? "No lessons seeded" : `${completed}/${total} lessons`}
                </span>
                {total > 0 && (
                  <span className="surface-2 px-2 py-0.5 text-xs">
                    {Math.round((completed / total) * 100)}%
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
