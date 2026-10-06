import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph, PROJECT_LADDER } from "@/content";
import { owned, type ProjectSubmissionDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, SourceCategoryChip } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
  reviewed: "Reviewed",
};

export default async function ProjectsPage() {
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const mine = await owned<ProjectSubmissionDoc>(session, "project_submissions").find({});
  const byProject = new Map(mine.map((p) => [p.projectId, p]));

  return (
    <>
      <PageHeader
        title="Projects"
        lede="Ten ladder levels. Each project states its data policy, its definition of done and what kind of CV evidence it produces."
      >
        <Chip>{graph.projects.length} projects</Chip>
      </PageHeader>
      <PageBody>
        <div className="space-y-5">
          {PROJECT_LADDER.map((rung) => {
            const projects = graph.projects.filter((p) => p.ladderLevel === rung.level);
            return (
              <Card key={rung.level}>
                <CardHead title={`Level ${rung.level} — ${rung.track}`} action={<Chip>{projects.length}</Chip>} />
                {projects.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-ink-3">
                    No project in the original curriculum sits at this level. Rather than invent one to fill the gap, the level is shown
                    empty — building it out is a known piece of future work.
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--line)]">
                    {projects.map((p) => {
                      const state = byProject.get(p.id);
                      return (
                        <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
                          <div className="min-w-0">
                            <Link href={`/projects/${p.id}`} className="text-sm font-medium underline-offset-2 hover:underline">
                              {p.title}
                            </Link>
                            <p className="mt-0.5 max-w-2xl text-sm text-ink-2">{p.problem}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              <SourceCategoryChip category={p.sourceCategory} />
                              <Chip>{p.cvClass}</Chip>
                              <Chip>{p.milestones.length} milestones</Chip>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {state ? (
                              <Chip tone={state.status === "reviewed" ? "positive" : state.status === "in_progress" ? "accent" : "neutral"}>
                                {STATUS_LABEL[state.status]}
                                {state.dodChecked.length > 0 ? ` · ${state.dodChecked.length}/${p.milestones.length}` : ""}
                              </Chip>
                            ) : (
                              <Chip>Not started</Chip>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="mt-6">
          <CardHead title="What counts as evidence" hint="§165 — the CV ladder." />
          <ul className="divide-y divide-[var(--line)] text-sm">
            {[
              ["Practice Only", "Exercises and tutorials. Useful for learning; never listed as professional work."],
              ["Skill Evidence", "A small artefact that shows one specific skill works."],
              ["Technical Artifact", "A complete, runnable piece of work with a README and reproducible steps."],
              ["Portfolio Project", "An end-to-end project with a real dataset, documented limitations and results."],
              ["Professional Evidence", "Work delivered for someone else, or reviewed by someone else."],
              ["Signature Project", "The one project that defines your profile and survives detailed questioning."],
            ].map(([k, v]) => (
              <li key={k} className="flex flex-wrap items-baseline gap-3 px-5 py-2.5">
                <span className="w-44 shrink-0 font-medium">{k}</span>
                <span className="text-ink-2">{v}</span>
              </li>
            ))}
          </ul>
        </Card>
      </PageBody>
    </>
  );
}
