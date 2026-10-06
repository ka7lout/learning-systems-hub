import Link from "next/link";
import { db } from "@/db";
import { careerRoles } from "@/db/schema";
import {
  Briefcase,
  Target,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CareerPage() {
  const roles = await db.select().from(careerRoles);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Career</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-3xl">
          Target blueprints are stored as dated snapshots. The platform maps your evidence to role requirements.
          It will never promise a job, but it will tell you which specific requirements lack evidence.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-200">
          <strong>Readiness ≠ job offer.</strong> We compute evidence-coverage against role requirements.
          The system will never say "you will definitely get hired." It says: "You have evidence for X% of
          the hard requirements listed in this role snapshot."
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map((role) => {
          const hard = (role.requirementsHard as string[]) || [];
          const pref = (role.requirementsPreferred as string[]) || [];
          return (
            <div key={role.id} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-lg tracking-tight leading-tight">{role.title}</h2>
                  <div className="text-sm text-[rgb(var(--text-muted))]">{role.company}</div>
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-1 rounded bg-navy-100 dark:bg-navy-900/60 text-navy-700 dark:text-navy-300 shrink-0">
                  {role.roleType}
                </span>
              </div>
              <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed mb-4 line-clamp-3">{role.description}</p>

              {role.seniority && (
                <div className="text-xs text-[rgb(var(--text-subtle))] mb-3">Seniority: {role.seniority}</div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))] mb-2">
                    <Target className="h-3.5 w-3.5" /> Hard requirements ({hard.length})
                  </div>
                  <ul className="space-y-1">
                    {hard.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-[rgb(var(--text-muted))]">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {pref.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))] mb-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Preferred ({pref.length})
                    </div>
                    <ul className="space-y-1">
                      {pref.slice(0, 8).map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-[rgb(var(--text-subtle))]">•</span>
                          <span className="text-[rgb(var(--text-muted))]">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-[rgb(var(--border))]">
                <div className="text-[11px] text-[rgb(var(--text-subtle))]">
                  {role.sourceUrl ? "Source captured" : "Blueprint"} · {role.snapshotDate ? new Date(role.snapshotDate).toLocaleDateString() : "n/d"}
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/skills" className="text-xs font-medium text-navy-600 dark:text-navy-400 hover:underline">
                    Skill gaps
                  </Link>
                  {role.sourceUrl && (
                    <a href={role.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] inline-flex items-center gap-1">
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-5 w-5 text-navy-600 dark:text-navy-400" />
          <h2 className="font-semibold">How readiness is calculated</h2>
        </div>
        <ol className="list-decimal pl-5 text-sm text-[rgb(var(--text-muted))] space-y-1 leading-relaxed">
          <li>For every hard requirement, we look for verified evidence: completed projects, code review, independent assessments, oral defense.</li>
          <li>Watching lectures or reading alone is <strong>not</strong> evidence.</li>
          <li>Help-assisted performance is tracked separately from independent performance.</li>
          <li>Professional readiness leans heavily on independent evidence and portfolio artifacts.</li>
        </ol>
      </div>
    </div>
  );
}
