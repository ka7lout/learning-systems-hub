import { AppShell } from "@/components/shell";
import { Badge, Bar, Card, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getEvidenceFor, getMasteryFor, getSkills } from "@/lib/data";
import { MASTERY_LEVELS } from "@/lib/engine";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const user = await requirePage();
  const [skills, mastery, evidence] = await Promise.all([
    getSkills(),
    getMasteryFor(user.id),
    getEvidenceFor(user.id),
  ]);
  const byKey = new Map(mastery.map((m) => [m.skillKey, m]));
  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Skill graph"
        title="Competence model"
        description="Levels come only from recorded evidence: attempts with rubric self-assessment, delayed retrieval, and completed projects. Viewing content changes nothing here."
      />

      <Card className="mb-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Mastery ladder</h2>
        <ol className="grid gap-1 text-xs text-muted sm:grid-cols-2">
          {MASTERY_LEVELS.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">
          {evidence.length} project evidence artifact{evidence.length === 1 ? "" : "s"} recorded. Levels 8 and 9 require
          project evidence, so they cannot be reached through practice alone.
        </p>
      </Card>

      <div className="space-y-8">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{category}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {skills
                .filter((s) => s.category === category)
                .map((skill) => {
                  const m = byKey.get(skill.key);
                  const level = m?.level ?? 0;
                  return (
                    <Card key={skill.key} className="p-4">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-ink">{skill.title}</p>
                          <p className="text-xs text-muted">{skill.description}</p>
                        </div>
                        <Badge tone={level >= 6 ? "good" : level >= 3 ? "warn" : "neutral"}>L{level}</Badge>
                      </div>
                      {m ? (
                        <div className="mt-3 space-y-1.5">
                          <Bar value={m.recall} label={`recall ${Math.round(m.recall * 100)}%`} />
                          <Bar value={m.application} label={`apply ${Math.round(m.application * 100)}%`} />
                          <Bar value={m.transfer} label={`transfer ${Math.round(m.transfer * 100)}%`} />
                          <p className="text-[11px] text-muted">
                            {m.evidenceCount} attempt{m.evidenceCount === 1 ? "" : "s"} · {m.independentEvidence} independent
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted">No evidence recorded.</p>
                      )}
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-muted">
                        {skill.kind === "tool" ? "tool knowledge" : "discipline knowledge"}
                      </p>
                    </Card>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
