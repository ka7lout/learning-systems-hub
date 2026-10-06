import { db } from "@/db";
import { projects } from "@/db/schema";
import { projectLevelLabel, sourceCategoryColor } from "@/lib/utils";
import { FolderKanban, ExternalLink, CheckCircle2, GitBranch, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const allProjects = await db.select().from(projects).orderBy(projects.projectLevel, projects.order);

  const byLevel: Record<number, typeof allProjects> = {};
  for (const p of allProjects) {
    if (!byLevel[p.projectLevel]) byLevel[p.projectLevel] = [];
    byLevel[p.projectLevel].push(p);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-3xl">
          All {allProjects.length} projects from the original curriculum, organized on a 10-level ladder from Python
          engineering to research. Each project is an evidence artifact: completed projects become portfolio items
          only when supported by real code, evaluation, and failure analysis.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-200">
          <strong className="font-semibold">Definition of done:</strong> Working code is not enough. A serious project needs documented evaluation,
          failure analysis, at least one public repo, and a short write-up to become CV-eligible.
        </div>
      </div>

      {Object.entries(byLevel).map(([level, projs]) => (
        <section key={level} id={`level-${level}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-navy-600 text-white flex items-center justify-center text-sm font-bold">
              {level}
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{projectLevelLabel(Number(level))}</h2>
            <span className="text-sm text-[rgb(var(--text-subtle))]">{(projs as any[]).length} projects</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(projs as any[]).map((p) => (
              <div key={p.id} id={p.slug} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-4 hover:border-navy-400 dark:hover:border-navy-500 transition group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[15px] leading-tight">{p.title}</h3>
                  {p.isFlagship && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800 shrink-0">
                      FLAGSHIP
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sourceCategoryColor(p.sourceCategory)}`}>
                    {p.sourceCategory}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed mb-3 line-clamp-3">
                  {p.shortDescription}
                </p>
                {p.requiredTechnologies && (p.requiredTechnologies as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(p.requiredTechnologies as string[]).slice(0, 6).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[rgb(var(--surface-alt))] text-[rgb(var(--text-muted))] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {p.milestones && Array.isArray(p.milestones) && (
                  <div className="text-[11px] text-[rgb(var(--text-subtle))] mb-3">
                    {(p.milestones as any[]).length} milestones
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs mt-auto pt-3 border-t border-[rgb(var(--border))]">
                  <span className="inline-flex items-center gap-1 text-[rgb(var(--text-subtle))]">
                    <GitBranch className="h-3.5 w-3.5" /> GitHub required
                  </span>
                  <span className="inline-flex items-center gap-1 text-[rgb(var(--text-subtle))]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Rubric
                  </span>
                  <span className="inline-flex items-center gap-1 text-[rgb(var(--text-subtle))] ml-auto">
                    <ExternalLink className="h-3.5 w-3.5" /> Start
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
