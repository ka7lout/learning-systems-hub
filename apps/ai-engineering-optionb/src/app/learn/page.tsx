import Link from "next/link";
import { db } from "@/db";
import { lessons, modules, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sourceCategoryColor } from "@/lib/utils";
import { ChevronRight, BookOpen, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const allLessons = await db
    .select({
      lesson: lessons,
      module: modules,
      course: courses,
    })
    .from(lessons)
    .leftJoin(modules, eq(modules.id, lessons.moduleId))
    .leftJoin(courses, eq(courses.id, lessons.courseId))
    .orderBy(courses.order, modules.order, lessons.order);

  // Group by course
  const byCourse: Record<string, { course: any; lessons: any[] }> = {};
  for (const row of allLessons) {
    const cId = row.course?.id || "uncategorized";
    if (!byCourse[cId]) byCourse[cId] = { course: row.course, lessons: [] };
    byCourse[cId].lessons.push({ lesson: row.lesson, module: row.module });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1">All lessons and modules. Open any lesson to start learning with the IHLS protocol.</p>
      </div>

      <div className="space-y-4">
        {Object.values(byCourse).map(({ course, lessons: ls }) => (
          <div key={course?.id} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[rgb(var(--border))] flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{course?.title || "Uncategorized"}</h2>
                  {course?.code && <span className="font-mono text-[11px] text-[rgb(var(--text-subtle))]">{course.code}</span>}
                </div>
                {course && (
                  <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${sourceCategoryColor(course.sourceCategory)}`}>
                    {course.sourceCategory}
                  </span>
                )}
              </div>
              <div className="text-xs text-[rgb(var(--text-subtle))]">{ls.length} lessons</div>
            </div>
            <div className="divide-y divide-[rgb(var(--border))]">
              {ls.map(({ lesson, module: mod }) => (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.slug}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[rgb(var(--surface-alt))] transition"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{lesson.title}</div>
                    <div className="flex items-center gap-2 text-[11px] text-[rgb(var(--text-subtle))] mt-0.5">
                      {mod && <span>{mod.title}</span>}
                      {lesson.estimatedMinutes && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.estimatedMinutes}min</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[rgb(var(--text-subtle))] shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
