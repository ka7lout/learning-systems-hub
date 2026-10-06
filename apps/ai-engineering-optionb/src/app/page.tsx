import Link from "next/link";
import { db } from "@/db";
import { curriculumStages, courses, projects, skills, masteryRecords } from "@/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { sourceCategoryColor, projectLevelLabel, masteryLabel } from "@/lib/utils";
import {
  ChevronRight,
  BookOpen,
  FlaskConical,
  FolderKanban,
  RotateCcw,
  Brain,
  Target,
  CheckCircle2,
  Clock,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getSessionUser();
  if (!user) return null; // handled by AppShell

  const stages = await db.select().from(curriculumStages).orderBy(curriculumStages.order);
  const allCourses = await db.select().from(courses).orderBy(courses.order);
  const allProjects = await db.select().from(projects).orderBy(projects.order);
  const allSkills = await db.select().from(skills).orderBy(skills.order);

  // First stage with first course = recommended starting point
  const firstStage = stages[0];
  const starterCourse = allCourses.find((c) => c.stageId === firstStage?.id);

  const coreCourses = allCourses.filter((c) => c.sourceCategory === "Original Curriculum" || c.sourceCategory?.includes("Harvard College"));
  const flagshipProjects = allProjects.filter((p) => p.isFlagship).slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-[rgb(var(--text-muted))] mt-1">
            What should I do right now?
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-full px-4 py-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[rgb(var(--text-muted))]">State:</span>
          <span className="font-medium capitalize">Deep</span>
        </div>
      </div>

      {/* Primary action card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-600 to-navy-800 text-white p-6 lg:p-8 shadow-lg shadow-navy-600/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-navy-100 text-sm font-medium mb-2">
              <Target className="h-4 w-4" />
              Next best step
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              {starterCourse ? `Start with ${starterCourse.title}` : "Begin your curriculum"}
            </h2>
            <p className="text-navy-100/90 text-sm leading-relaxed max-w-xl">
              Your curriculum starts with mathematical and programming foundations running in parallel.
              Start with Python or Linear Algebra depending on your background, but the recommended
              first stop is the Programming Foundations pathway, since the AI Mentor can adapt difficulty.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/curriculum"
                className="inline-flex items-center gap-1.5 bg-white text-navy-800 hover:bg-navy-50 px-4 py-2 rounded-lg font-medium text-sm transition"
              >
                Open curriculum <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/mentor"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg font-medium text-sm transition"
              >
                Ask mentor
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-2 min-w-[200px]">
            <Stat dark label="Stages" value={String(stages.length)} Icon={GraduationCap} />
            <Stat dark label="Courses" value={String(allCourses.length)} Icon={BookOpen} />
            <Stat dark label="Projects" value={String(allProjects.length)} Icon={FolderKanban} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Stages" value={String(stages.length)} sub={`${stages.length} total`} Icon={GraduationCap} />
        <Stat label="Courses" value={String(allCourses.length)} sub="across all sources" Icon={BookOpen} />
        <Stat label="Projects" value={String(allProjects.length)} sub="original catalog" Icon={FolderKanban} />
        <Stat label="Skills" value={String(allSkills.length)} sub="in taxonomy" Icon={Brain} />
      </div>

      {/* Grid of sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Continue learning */}
        <Card
          title="Continue where you left off"
          icon={<BookOpen className="h-5 w-5 text-navy-600 dark:text-navy-400" />}
          href="/learn"
        >
          <div className="space-y-2">
            {allCourses.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-[rgb(var(--surface-alt))] transition">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sourceCategoryColor(c.sourceCategory)}`}>
                      {c.sourceCategory}
                    </span>
                    {c.code && <span className="text-[10px] text-[rgb(var(--text-subtle))] font-mono">{c.code}</span>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[rgb(var(--text-subtle))] shrink-0" />
              </div>
            ))}
          </div>
        </Card>

        {/* Review queue */}
        <Card
          title="Review queue"
          icon={<RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          href="/review"
        >
          <div className="py-6 text-center text-sm text-[rgb(var(--text-subtle))]">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>No review items scheduled yet.</p>
            <p className="text-xs mt-1">As you complete lessons and practice, spaced review items will appear here.</p>
          </div>
        </Card>

        {/* Projects */}
        <Card
          title="Flagship projects"
          icon={<FlaskConical className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          href="/projects"
        >
          <div className="space-y-2">
            {flagshipProjects.map((p) => (
              <Link key={p.id} href={`/projects#${p.slug}`} className="flex items-start justify-between gap-2 p-2.5 rounded-lg hover:bg-[rgb(var(--surface-alt))] transition">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-[11px] text-[rgb(var(--text-subtle))] mt-0.5">
                    Level {p.projectLevel} · {projectLevelLabel(p.projectLevel)}
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Curriculum at a glance */}
      <Card title="Curriculum spine" icon={<GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {stages.map((s) => (
            <Link
              key={s.id}
              href={`/curriculum#${s.slug}`}
              className="flex items-center justify-between p-3 rounded-lg border border-[rgb(var(--border))] hover:border-navy-400 dark:hover:border-navy-500 hover:bg-[rgb(var(--surface-alt))] transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-md bg-navy-50 dark:bg-navy-950/60 text-navy-700 dark:text-navy-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.stageNumber}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-[11px] text-[rgb(var(--text-subtle))]">~{s.estimatedWeeks} weeks · {s.priority}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[rgb(var(--text-subtle))] group-hover:text-navy-500 transition shrink-0" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub, Icon, dark = false }: { label: string; value: string; sub?: string; Icon: any; dark?: boolean }) {
  return (
    <div className={dark
      ? "flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10"
      : "flex items-center gap-3 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl px-4 py-3"
    }>
      <div className={dark
        ? "h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0"
        : "h-9 w-9 rounded-lg bg-navy-50 dark:bg-navy-950/60 flex items-center justify-center shrink-0"
      }>
        <Icon className={dark ? "h-4.5 w-4.5 text-white" : "h-4.5 w-4.5 text-navy-600 dark:text-navy-400"} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className={dark ? "text-[11px] text-white/70 uppercase tracking-wider font-medium" : "text-[11px] text-[rgb(var(--text-subtle))] uppercase tracking-wider font-medium"}>{label}</div>
        <div className={dark ? "text-lg font-bold text-white leading-tight" : "text-xl font-bold leading-tight tracking-tight"}>{value}</div>
        {sub && <div className={dark ? "text-[11px] text-white/60" : "text-[11px] text-[rgb(var(--text-subtle))]"}>{sub}</div>}
      </div>
    </div>
  );
}

function Card({ title, icon, children, href }: { title: string; icon: React.ReactNode; children: React.ReactNode; href?: string }) {
  const Wrapper: any = href ? Link : "div";
  return (
    <Wrapper href={href} className={href ? "block bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5 hover:border-navy-400 dark:hover:border-navy-500 transition" : "block bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5"}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-[15px] tracking-tight">{title}</h3>
      </div>
      {children}
    </Wrapper>
  );
}
