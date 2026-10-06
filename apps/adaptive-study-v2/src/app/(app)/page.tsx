import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserStats,
  getNextTask,
  getReviewQueue,
  getNextLesson,
  getWeakConcepts,
  getAssessmentsAll,
  getCourses,
  getConceptTitle,
} from "@/lib/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const userId = user.id;

  const [statsRes, task, due, next, weak, assessments, courses] = await Promise.all([
    getUserStats(userId),
    getNextTask(userId),
    getReviewQueue(userId, 3),
    getNextLesson(userId),
    getWeakConcepts(userId),
    getAssessmentsAll(),
    getCourses(),
  ]);

  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const dueTitles = await Promise.all(due.map((d) => getConceptTitle(d.conceptId)));

  const startHref =
    task.type === "diagnostic"
      ? "/diagnostic"
      : task.type === "review"
        ? "/review"
        : task.type === "lesson"
          ? `/learn/${task.lessonId}`
          : task.type === "practice"
            ? "/practice"
            : "/courses";

  const todayTasks: { label: string; href: string }[] = [];
  due.forEach((d, i) => {
    todayTasks.push({ label: `Review: ${dueTitles[i] ?? "a concept"}`, href: "/review" });
  });
  if (next) {
    todayTasks.push({ label: `Learn: ${next.lesson.title}`, href: `/learn/${next.lesson.id}` });
  }
  todayTasks.push({ label: "Optional: practice problems", href: "/practice" });

  const upcoming = assessments
    .map((a) => ({ ...a, course: courseMap.get(a.courseId) }))
    .filter((a) => a.course)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <p className="muted text-sm">Welcome back{user.displayName ? `, ${user.displayName}` : ""}.</p>
        <h1 className="mt-1 text-2xl font-semibold">Your next step</h1>
      </div>

      {/* PRIMARY ACTION */}
      <section className="surface p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] brand">Do this now</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight">{task.title}</h2>
        <p className="muted mt-2 max-w-2xl">{task.subtitle}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={startHref} className="btn btn-primary px-6 py-3 text-base">
            Start
          </Link>
          <Link href="/planner" className="btn btn-ghost">
            Today&apos;s plan
          </Link>
          <Link href="/review" className="btn btn-ghost">
            Review queue
          </Link>
        </div>
      </section>

      {/* PROVISIONAL NOTICE — truthful about data provenance */}
      <section className="surface-2 px-4 py-3 text-sm muted">
        Curriculum shown here is <b className="text-slate-200">PROVISIONAL</b>: it was seeded from the
        brief you supplied, not yet verified against your actual Google Drive source. Source audit
        and data health reflect what could and could not be ingested.
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* TODAY */}
        <section className="surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide muted">Today</h3>
          {todayTasks.length === 0 ? (
            <p className="muted mt-3 text-sm">No tasks scheduled yet.</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {todayTasks.map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-xs brand">{i === 0 ? "NOW" : i === 1 ? "THEN" : "•"}</span>
                  <Link href={t.href} className="text-sm text-slate-200 hover:underline">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* WEAK SPOTS */}
        <section className="surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide muted">Weak spots</h3>
          {weak.length === 0 ? (
            <p className="muted mt-3 text-sm">
              No mistakes recorded yet. Weak concepts will appear here once you practise.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {weak.slice(0, 5).map((w) => (
                <li key={w.conceptId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">{w.title}</span>
                  <span className="surface-2 px-2 py-0.5 text-xs brand">{w.errors} mistakes</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* UPCOMING ASSESSMENTS */}
      <section className="surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide muted">Upcoming assessments</h3>
        {upcoming.length === 0 ? (
          <p className="muted mt-3 text-sm">
            No assessment dates are available. Add them once verified from your source material.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {upcoming.map((a) => (
              <div key={a.id} className="surface-2 p-3">
                <p className="text-sm font-medium text-slate-100">{a.title}</p>
                <p className="muted text-xs mt-1">
                  {a.course?.code} · {a.type}
                </p>
                <p className="muted text-xs mt-1">
                  {a.examDate
                    ? `Date: ${a.examDate}`
                    : "Exam date: Not available"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ACTUAL PROGRESS */}
      <section className="surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide muted">Actual progress</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Level" value={String(statsRes.level)} />
          <Stat label="Total XP" value={String(statsRes.xp)} />
          <Stat label="Streak" value={`${statsRes.streak} d`} />
          <Stat label="Lessons done" value={String(statsRes.completedLessons)} />
          <Stat label="Study time" value={`${statsRes.studyMinutes} min`} />
          <Stat label="Reviews due" value={String(statsRes.reviewDue)} />
          <Stat label="Mistakes" value={String(statsRes.mistakes)} />
          <Stat label="Attempts" value={String(statsRes.attempts)} />
        </div>
        <p className="muted mt-3 text-xs">
          Every number above is computed from your real database records. A value of 0 means no
          recorded activity yet — not a hidden score.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-2 p-3">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="muted text-xs mt-1">{label}</p>
    </div>
  );
}
