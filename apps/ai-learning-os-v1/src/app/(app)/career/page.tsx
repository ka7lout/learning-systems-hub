import { eq, sql, and } from "drizzle-orm";
import { db } from "@/db";
import { activityAttempts, careerRoles, settings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { careerGap } from "@/lib/engine";
import { PageHeader, StatusBadge } from "@/components/ui";
import { SimulationCard } from "@/components/SimulationCard";
import { TargetRolePicker } from "@/components/SettingsForm";
import { SIMULATIONS } from "@/content/catalog";

export default async function CareerPage() {
  const user = await requireUser();
  const [roles, [prefs], attempts] = await Promise.all([
    db.select().from(careerRoles),
    db.select().from(settings).where(eq(settings.ownerId, user.id)).limit(1),
    db.select({ key: activityAttempts.activityKey, c: sql<number>`count(*)::int` }).from(activityAttempts).where(and(eq(activityAttempts.ownerId, user.id))).groupBy(activityAttempts.activityKey),
  ]);
  const target = prefs?.targetRoleSlug ?? roles[0]?.slug;
  const gap = target ? await careerGap(user.id, target) : null;
  const counts = new Map(attempts.map((a) => [a.key, a.c]));
  const sims = SIMULATIONS.filter((s) => s.type === "interview" || s.type === "system_design" || s.type === "incident");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Career" lead="Target role → current requirements → skill taxonomy → your evidence → gap → learning task → project → interview evidence → readiness. The platform never says you will be hired; it says which rubric items you have demonstrated." />
      <section className="card p-5">
        <h2 className="text-sm font-semibold">Target role</h2>
        <TargetRolePicker roles={roles.map((r) => ({ slug: r.slug, title: r.title }))} current={target ?? null} />
        {gap && (
          <div className="mt-4 text-sm">
            <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{gap.role.title}</span><StatusBadge s={gap.role.verificationStatus} /></div>
            <p className="mt-1 text-muted">{gap.role.summary}</p>
            <p className="mt-1 text-xs text-muted">Employer: {gap.role.employer} · Seniority: {gap.role.seniority} · Location: {gap.role.location} · <a className="text-accent underline" href={gap.role.sourceUrl} target="_blank" rel="noreferrer">source</a>. Requirements are encoded from the student-supplied blueprint; verify the live posting before applying.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border p-3"><div className="text-xs text-muted">Hard requirements</div><div className="text-xl font-semibold">{gap.summary.hardTotal}</div></div>
              <div className="rounded-md border border-border p-3"><div className="text-xs text-muted">With any evidence</div><div className="text-xl font-semibold">{gap.summary.hardWithEvidence}</div></div>
              <div className="rounded-md border border-border p-3"><div className="text-xs text-muted">Competent or demonstrated</div><div className="text-xl font-semibold">{gap.summary.hardDemonstrated}</div></div>
            </div>
          </div>
        )}
      </section>

      {gap && (
        <section className="card mt-4 p-5">
          <h2 className="text-sm font-semibold">Gap report</h2>
          <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-xs text-muted"><th className="py-1 pr-3">Skill</th><th className="py-1 pr-3">Requirement</th><th className="py-1 pr-3">Status</th><th className="py-1">Evidence</th></tr></thead><tbody>
            {gap.requirements.map((r) => <tr key={r.skillId} className="border-t border-border"><td className="py-1.5 pr-3">{r.skillName}<span className="ml-1 text-xs text-muted">{r.category}</span></td><td className="py-1.5 pr-3"><span className="badge">{r.requirementType}</span></td><td className="py-1.5 pr-3"><span className={`badge ${r.status === "demonstrated" ? "!bg-ok-soft !text-ok" : r.status === "competent" ? "!bg-accent-soft !text-accent-strong" : r.status === "missing" ? "!bg-warn-soft !text-warn" : ""}`}>{r.status}</span></td><td className="py-1.5 text-xs text-muted">{r.evidenceCount ? `${r.evidenceCount} item(s), ${r.independentCount} independent` : "none"}</td></tr>)}
          </tbody></table></div>
        </section>
      )}

      <h2 className="mt-8 mb-2 text-sm font-semibold">Interview, system-design and incident simulations</h2>
      <ul className="space-y-2">{sims.map((s) => <SimulationCard key={s.key} sim={s} attempts={counts.get(s.key) ?? 0} />)}</ul>
    </div>
  );
}
