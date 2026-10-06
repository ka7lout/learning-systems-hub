import Link from "next/link";
import { requireUser, getUserSettings } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, Badge, SectionTitle, STATUS_LABELS } from "@/components/ui";
import { getRoleGap } from "@/lib/learner";
import { TARGET_ROLES } from "@/content/roles";
import { PROJECTS } from "@/content/projects";

const GAP_TONES: Record<string, "bad" | "warn" | "navy" | "good"> = {
  missing: "bad",
  developing: "warn",
  competent: "navy",
  independent: "good",
};

export default async function CareerPage() {
  const user = await requireUser();
  const settings = await getUserSettings(user.id);
  const { role, entries } = await getRoleGap(user.id, settings?.targetRole ?? TARGET_ROLES[0].slug);

  const hard = entries.filter((e) => e.kind === "hard");
  const preferred = entries.filter((e) => e.kind !== "hard");
  const hardMet = hard.filter((e) => e.status === "competent" || e.status === "independent").length;
  const gaps = entries.filter((e) => e.status === "missing" || e.status === "developing");

  return (
    <PageShell path="/career">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Career gap analysis</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-ink-soft">
        Evidence-driven comparison between your skill graph and an encoded reference role. This
        page never promises employment — it reports which readiness-rubric requirements your
        recorded evidence currently supports. Change your target role in Settings.
      </p>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-ink">{role.title}</h2>
          <Badge tone="warn">{STATUS_LABELS[role.status]}</Badge>
        </div>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink-soft">{role.summary}</p>
        <p className="mt-2 text-[12.5px] text-ink-faint">
          {role.blueprint}{" "}
          {role.sourceUrl && (
            <a href={role.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-accent hover:underline">
              Reference posting ↗
            </a>
          )}{" "}
          — reference role only; verify current availability, location, and seniority before acting on it.
        </p>
        <p className="mt-3 text-[13.5px] text-ink-soft">
          Hard requirements at Competent or above:{" "}
          <span className="font-semibold text-ink">{hardMet} / {hard.length}</span>
        </p>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle sub="Must-have skills for this role.">Hard requirements</SectionTitle>
          <div className="space-y-2">
            {hard.map((e) => (
              <Card key={e.skillSlug} className="py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-medium text-ink">{e.skillName}</p>
                    {e.note && <p className="text-[12.5px] text-ink-faint">{e.note}</p>}
                  </div>
                  <div className="text-right">
                    <Badge tone={GAP_TONES[e.status]}>{e.status}</Badge>
                    <p className="mt-0.5 text-[12px] text-ink-faint">L{e.level} · indep. L{e.independentLevel}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle sub="Preferred and familiarity-level expectations.">Preferred requirements</SectionTitle>
          <div className="space-y-2">
            {preferred.map((e) => (
              <Card key={e.skillSlug} className="py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-medium text-ink">{e.skillName}</p>
                    <p className="text-[12.5px] text-ink-faint">{e.kind}{e.note ? ` — ${e.note}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <Badge tone={GAP_TONES[e.status]}>{e.status}</Badge>
                    <p className="mt-0.5 text-[12px] text-ink-faint">L{e.level} · indep. L{e.independentLevel}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <SectionTitle sub="">{""}</SectionTitle>
          <Card>
            <SectionTitle sub="Projects from the catalog that close your current gaps.">Recommended next evidence</SectionTitle>
            {gaps.length === 0 ? (
              <p className="text-[13.5px] text-ink-soft">
                No open gaps at the developing/missing level for this role's mapped skills. Push
                remaining skills to “independently demonstrated” via projects.
              </p>
            ) : (
              <ul className="space-y-2 text-[13.5px] text-ink-soft">
                {gaps.slice(0, 5).map((g) => {
                  const proj = PROJECTS.find((p) => p.skills.includes(g.skillSlug));
                  return (
                    <li key={g.skillSlug}>
                      <span className="font-medium text-ink">{g.skillName}</span> ({g.status}) →{" "}
                      {proj ? (
                        <Link href={`/projects/${proj.slug}`} className="font-medium text-accent hover:underline">
                          {proj.title}
                        </Link>
                      ) : (
                        "study its lessons in the curriculum, then attach project evidence"
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
