import { requireUser } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, Badge, SectionTitle } from "@/components/ui";
import { getSkillStatuses } from "@/lib/learner";
import { MASTERY_LEVELS } from "@/content/types";

const AREA_LABELS: Record<string, string> = {
  programming: "Programming",
  mathematics: "Mathematics",
  data: "Data",
  machine_learning: "Machine Learning",
  deep_learning: "Deep Learning",
  llm: "NLP / LLMs",
  engineering: "Engineering",
  cloud_mlops: "Cloud & MLOps",
  communication: "Communication",
  research: "Research",
};

const GATE_TONES: Record<string, "neutral" | "navy" | "warn" | "good"> = {
  none: "neutral",
  developing: "warn",
  competent: "navy",
  independent: "good",
};

export default async function SkillsPage() {
  const user = await requireUser();
  const skills = await getSkillStatuses(user.id);
  const areas = [...new Set(skills.map((s) => s.area))];

  return (
    <PageShell path="/skills">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Skill graph</h1>
      <p className="mt-1 max-w-3xl text-[14px] text-ink-soft">
        Levels are computed only from recorded evidence — recall checkpoints, transfer tasks, and
        completed projects. Independent (non-assisted) evidence is tracked separately because
        professional readiness rests on what you can do alone.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {areas.map((area) => (
            <section key={area}>
              <SectionTitle>{AREA_LABELS[area] ?? area}</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                {skills
                  .filter((s) => s.area === area)
                  .map((s) => (
                    <Card key={s.slug}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-semibold text-ink">{s.name}</p>
                        <Badge tone={GATE_TONES[s.gate]}>
                          {s.gate === "none" ? "no evidence" : s.gate}
                        </Badge>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface" role="img" aria-label={`Level ${s.level} of 9`}>
                        <div className="h-full rounded-full bg-navy" style={{ width: `${(s.level / 9) * 100}%` }} />
                      </div>
                      <p className="mt-1.5 text-[12.5px] text-ink-soft">
                        L{s.level} — {MASTERY_LEVELS[s.level]?.label}
                        {s.evidenceCount > 0
                          ? ` · ${s.evidenceCount} evidence record(s) · independent L${s.independentLevel}`
                          : " · complete checkpoints and projects to build evidence"}
                      </p>
                    </Card>
                  ))}
              </div>
            </section>
          ))}
        </div>

        <Card className="self-start">
          <SectionTitle sub="Mastery is a ladder, not a checkbox.">The L0–L9 mastery scale</SectionTitle>
          <ol className="space-y-1.5 text-[13px] text-ink-soft">
            {MASTERY_LEVELS.map((l) => (
              <li key={l.level}>
                <span className="font-semibold text-ink">L{l.level}</span> — {l.label}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12.5px] text-ink-faint">
            Gates (design decisions): Developing ≥ L2 · Competent ≥ L4 · Independently demonstrated
            ≥ L6 from non-assisted evidence.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
