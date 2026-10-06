import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph, MASTERY_LEVELS, PROGRESS_DIMENSIONS } from "@/content";
import { computeSkillMastery } from "@/lib/engines/mastery";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, MasteryChip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const mastery = await computeSkillMastery(session, graph.skills.map((s) => s.id));

  const families = [...new Set(graph.skills.map((s) => s.family))];
  const counts: Record<string, number> = { unknown: 0, exposed: 0, developing: 0, competent: 0, independent: 0 };
  for (const m of mastery.values()) counts[m.level] += 1;

  return (
    <>
      <PageHeader
        title="Skills"
        lede={`${graph.skills.length} skills, each with its own evidence. A skill moves up only when the evidence for it exists — reading never moves it past "content seen".`}
      />
      <PageBody>
        <Card className="mb-5">
          <CardHead title="What each level means" />
          <ul className="divide-y divide-[var(--line)]">
            {MASTERY_LEVELS.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <MasteryChip level={l.id} />
                  <span className="text-sm text-ink-2">{l.meaning}</span>
                </div>
                <span className="text-sm tabular-nums text-ink-3">{counts[l.id]} skills</span>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-3">
            Tracked dimensions: {PROGRESS_DIMENSIONS.join(" · ")}.
          </p>
        </Card>

        {families.map((family) => (
          <section key={family} className="mb-6">
            <h2 className="text-sm font-semibold tracking-tight">{family}</h2>
            <Card className="mt-2">
              <ul className="divide-y divide-[var(--line)]">
                {graph.skills
                  .filter((s) => s.family === family)
                  .map((skill) => {
                    const m = mastery.get(skill.id);
                    const lessons = graph.lessons.filter((l) => l.skills.includes(skill.id));
                    return (
                      <li key={skill.id} id={skill.id} className="px-5 py-3.5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{skill.title}</p>
                            <p className="mt-0.5 max-w-2xl text-sm text-ink-2">{skill.description}</p>
                          </div>
                          <MasteryChip level={m?.level ?? "unknown"} />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                          {m && m.attempts > 0 ? (
                            <>
                              <Chip>{m.attempts} attempts</Chip>
                              <Chip>{m.unaidedPasses} unaided passes</Chip>
                              <Chip>{m.transferPasses} transfer passes</Chip>
                              <Chip>{m.components.implementation} implementation artefacts</Chip>
                              <Chip>{m.components.debugging} corrected errors</Chip>
                              <Chip>{m.evidenceCount} evidence items</Chip>
                            </>
                          ) : (
                            <span className="text-ink-3">No attempts recorded against this skill yet.</span>
                          )}
                        </div>

                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-ink-3">Prerequisites, lessons, interview questions</summary>
                          <div className="mt-2 grid gap-3 text-sm sm:grid-cols-3">
                            <div>
                              <p className="h-section">Depends on</p>
                              {skill.dependsOn.length === 0 ? (
                                <p className="mt-1 text-xs text-ink-3">Nothing — entry-level skill.</p>
                              ) : (
                                <ul className="mt-1 space-y-0.5 text-xs">
                                  {skill.dependsOn.map((d) => (
                                    <li key={d}>
                                      <a href={`#${d}`} className="underline underline-offset-2">{graph.skills.find((s) => s.id === d)?.title ?? d}</a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div>
                              <p className="h-section">Taught in</p>
                              <ul className="mt-1 space-y-0.5 text-xs">
                                {lessons.slice(0, 6).map((l) => (
                                  <li key={l.id}>
                                    <Link href={`/learn/${l.id}`} className="underline underline-offset-2">{l.title}</Link>
                                  </li>
                                ))}
                                {lessons.length === 0 && <li className="text-ink-3">No lesson teaches this yet.</li>}
                              </ul>
                            </div>
                            <div>
                              <p className="h-section">Interview questions</p>
                              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink-2">
                                {skill.interviewQuestions.map((q) => <li key={q}>{q}</li>)}
                              </ul>
                            </div>
                          </div>
                        </details>
                      </li>
                    );
                  })}
              </ul>
            </Card>
          </section>
        ))}
      </PageBody>
    </>
  );
}
