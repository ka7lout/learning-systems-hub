import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { lessons, modules, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sourceCategoryColor, projectLevelLabel } from "@/lib/utils";
import { MentorPanel } from "@/components/mentor-panel";
import {
  ChevronLeft,
  BookOpen,
  Target,
  PenTool,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await db
    .select({
      lesson: lessons,
      module: modules,
      course: courses,
    })
    .from(lessons)
    .leftJoin(modules, eq(modules.id, lessons.moduleId))
    .leftJoin(courses, eq(courses.id, lessons.courseId))
    .where(eq(lessons.slug, slug))
    .limit(1);
  const row = rows[0];
  if (!row) notFound();
  const { lesson, module: mod, course } = row;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-[rgb(var(--text-subtle))] mb-4">
        <Link href="/learn" className="hover:text-navy-600 dark:hover:text-navy-400 flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Learn
        </Link>
        {course && (
          <>
            <span>/</span>
            <span className="text-[rgb(var(--text-muted))]">{course.title}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Lesson content */}
        <div className="space-y-6 min-w-0">
          {/* Title block */}
          <header>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {course && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sourceCategoryColor(course.sourceCategory)}`}>
                  {course.sourceCategory}
                </span>
              )}
              {course?.harvardMapping?.courseCode && (
                <span className="text-[10px] font-mono bg-[rgb(var(--surface-alt))] px-1.5 py-0.5 rounded">
                  {course.harvardMapping.courseCode}
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{lesson.title}</h1>
            {mod && (
              <div className="text-sm text-[rgb(var(--text-muted))] mt-1 flex items-center gap-3 flex-wrap">
                <span>Module: {mod.title}</span>
                {lesson.estimatedMinutes && (
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lesson.estimatedMinutes} min</span>
                )}
              </div>
            )}
          </header>

          {/* Why this matters */}
          {lesson.whyThisMatters && (
            <div className="bg-navy-50 dark:bg-navy-950/40 border border-navy-200 dark:border-navy-900 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-navy-600 dark:text-navy-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-navy-900 dark:text-navy-100 mb-1">Why this matters</div>
                  <p className="text-sm text-navy-800 dark:text-navy-200 leading-relaxed">{lesson.whyThisMatters}</p>
                </div>
              </div>
            </div>
          )}

          {/* Learning objectives */}
          {lesson.learningObjectives && (lesson.learningObjectives as string[]).length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-navy-600 dark:text-navy-400" />
                <h2 className="font-semibold">Learning objectives</h2>
              </div>
              <ul className="space-y-1.5 text-sm text-[rgb(var(--text-muted))] pl-5 list-disc marker:text-navy-500">
                {(lesson.learningObjectives as string[]).map((o, i) => (
                  <li key={i} className="leading-relaxed">{o}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Main content */}
          <article className="lesson-content bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-6 lg:p-8">
            <div
              dangerouslySetInnerHTML={{
                __html: (lesson.content || "")
                  .replace(/^# (.+)$/gm, "<h1>$1</h1>")
                  .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                  .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                  .replace(/^- (.+)$/gm, "<li>$1</li>")
                  .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\n\n/g, "</p><p>")
                  .replace(/^- /gm, "")
                  .replace(/<\/li><li>/g, "</li><li>"),
              }}
            />
          </article>

          {/* Notebook guidance */}
          {lesson.mustWriteNotes && (lesson.mustWriteNotes as string[]).length > 0 && (
            <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <PenTool className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Must write (notebook)</div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mb-2">You don't need to copy the whole lesson. Write these down — in your own words where possible:</p>
                  <ul className="space-y-1 text-sm text-amber-900 dark:text-amber-200 pl-4 list-disc">
                    {(lesson.mustWriteNotes as string[]).map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Mastery checkpoint */}
          <section className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">Mastery checkpoint</div>
                <p className="text-sm text-emerald-800 dark:text-emerald-300/80 mb-2">You're ready to move on when you can:</p>
                <ul className="space-y-1 text-sm text-emerald-900 dark:text-emerald-200 pl-4 list-disc">
                  <li>Explain the key concepts from memory (closed notes)</li>
                  <li>Solve a direct-application problem</li>
                  <li>Choose the right tool for a small novel scenario</li>
                  <li>Identify at least one common failure mode</li>
                </ul>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/70 mt-3 italic">If you can't yet, that's useful information — not a failure. Revisit the specific sub-topic that's fuzzy, then continue.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Mentor panel */}
        <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
          <MentorPanel
            initialContext={{
              type: "lesson",
              slug: lesson.slug,
              title: lesson.title,
            }}
          />
        </aside>
      </div>
    </div>
  );
}
