import Link from "next/link";
import { db } from "@/db";
import { curriculumStages, courses, modules, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sourceCategoryColor } from "@/lib/utils";
import { ChevronRight, BookOpen, Clock, FolderKanban } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
  const stages = await db.select().from(curriculumStages).orderBy(curriculumStages.order);
  const allCourses = await db.select().from(courses).orderBy(courses.order);
  const allModules = await db.select().from(modules).orderBy(modules.order);
  const allProjects = await db.select().from(projects).orderBy(projects.order);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-3xl">
          The complete curriculum spine: {stages.length} stages, {allCourses.length} mapped courses, {allModules.length} modules, and {allProjects.length} projects. Content is preserved exactly from your original curriculum and mapped to verified Harvard College, Harvard Extension, Industry, and Research layers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: "Original Curriculum", color: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300" },
          { label: "Harvard College", color: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300" },
          { label: "Harvard Extension", color: "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200" },
          { label: "Industry Extension", color: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300" },
          { label: "Research Extension", color: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-300" },
        ].map((c) => (
          <span key={c.label} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${c.color}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {c.label}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const stageCourses = allCourses.filter((c) => c.stageId === stage.id);
          return (
            <div key={stage.id} id={stage.slug} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[rgb(var(--border))] flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-navy-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {stage.stageNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight">{stage.title}</h2>
                  <p className="text-sm text-[rgb(var(--text-muted))]">{stage.description}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-xs text-[rgb(var(--text-subtle))] uppercase tracking-wider">Estimated</div>
                  <div className="text-sm font-medium">{stage.estimatedWeeks} weeks</div>
                </div>
              </div>
              <div className="divide-y divide-[rgb(var(--border))]">
                {stageCourses.length === 0 && (
                  <div className="px-5 py-4 text-sm text-[rgb(var(--text-subtle))] italic">
                    Courses for this stage are being organized...
                  </div>
                )}
                {stageCourses.map((course) => {
                  const courseModules = allModules.filter((m) => m.courseId === course.id);
                  return (
                    <div key={course.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-[15px]">{course.title}</h3>
                            {course.code && <span className="font-mono text-[11px] text-[rgb(var(--text-subtle))] bg-[rgb(var(--surface-alt))] px-1.5 py-0.5 rounded">{course.code}</span>}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sourceCategoryColor(course.sourceCategory)}`}>
                              {course.sourceCategory}
                            </span>
                            <span className="text-[11px] text-[rgb(var(--text-subtle))] flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.estimatedEffortHours}h
                            </span>
                            <span className="text-[11px] text-[rgb(var(--text-subtle))] flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {courseModules.length} modules
                            </span>
                            {course.harvardMapping?.courseCode && (
                              <span className="text-[11px] text-[rgb(var(--text-subtle))]">
                                Maps to: {course.harvardMapping.courseCode}
                              </span>
                            )}
                          </div>
                          {course.description && (
                            <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed mb-3 line-clamp-2">{course.description}</p>
                          )}
                          {course.prerequisites && course.prerequisites.length > 0 && (
                            <div className="text-[11px] text-[rgb(var(--text-subtle))] mb-2">
                              <span className="font-medium">Prerequisites:</span> {course.prerequisites.join(", ")}
                            </div>
                          )}
                          {courseModules.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {courseModules.map((m) => {
                                const firstLesson = `${m.slug}-lesson`;
                                return (
                                  <Link
                                    key={m.id}
                                    href={`/learn/${firstLesson}`}
                                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-[rgb(var(--surface-alt))] hover:bg-navy-50 dark:hover:bg-navy-950/60 hover:text-navy-700 dark:hover:text-navy-300 transition"
                                  >
                                    {m.title}
                                    <ChevronRight className="h-3 w-3" />
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/learn/${courseModules[0]?.slug ? courseModules[0].slug + "-lesson" : ""}`}
                          className="shrink-0 text-sm text-navy-600 dark:text-navy-400 hover:underline font-medium"
                        >
                          Start
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FolderKanban className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-lg">Project ladder</h2>
        </div>
        <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
          All {allProjects.length} original projects are preserved, organized by difficulty level.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {allProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projects#${p.slug}`}
              className="p-3 rounded-lg border border-[rgb(var(--border))] hover:border-navy-400 transition text-sm flex items-start justify-between gap-2"
            >
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-[11px] text-[rgb(var(--text-subtle))] mt-0.5">Level {p.projectLevel} · {p.sourceCategory}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[rgb(var(--text-subtle))] shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
