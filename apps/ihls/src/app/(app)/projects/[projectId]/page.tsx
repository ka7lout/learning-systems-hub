import Link from "next/link";
import { notFound } from "next/navigation";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph } from "@/content";
import { owned, type EvidenceDoc, type ProjectSubmissionDoc } from "@/lib/dal";
import { computeSkillMastery } from "@/lib/engines/mastery";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, MasteryChip, SourceCategoryChip, VerificationChip } from "@/components/ui";
import { EvidenceManager, ProjectTracker } from "@/components/project-widgets";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const project = graph.projects.find((p) => p.id === projectId);
  if (!project) notFound();

  const state = await owned<ProjectSubmissionDoc>(session, "project_submissions").findOne({ projectId: project.id });
  const evidence = await owned<EvidenceDoc>(session, "project_evidence").find({ projectId: project.id });
  const mastery = await computeSkillMastery(session, project.skills);
  const lessons = graph.lessons.filter((l) => l.projects.includes(project.id));
  const roles = graph.roles.filter((r) => project.careerRoles.includes(r.id));

  return (
    <>
      <PageHeader title={project.title} lede={project.problem}>
        <div className="flex flex-wrap gap-2">
          <SourceCategoryChip category={project.sourceCategory} />
          <Chip>Ladder level {project.ladderLevel}</Chip>
          <Chip>{project.ladderTrack}</Chip>
          <Chip tone="accent">{project.cvClass}</Chip>
        </div>
      </PageHeader>

      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            <Card>
              <CardHead title="Requirements" />
              <ul className="list-disc space-y-1 px-9 py-4 text-sm">
                {project.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Card>

            <Card>
              <CardHead title="Acceptance criteria" hint="What makes this finished rather than abandoned." />
              <ul className="list-disc space-y-1 px-9 py-4 text-sm">
                {project.acceptanceCriteria.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Card>

            <Card>
              <CardHead title="Your progress" hint="Stored against your account only." />
              <div className="card-pad">
                <ProjectTracker
                  projectId={project.id}
                  milestones={project.milestones}
                  initial={{
                    status: state?.status ?? "not_started",
                    summary: state?.summary ?? "",
                    links: state?.links ?? {},
                    dodChecked: state?.dodChecked ?? [],
                  }}
                />
              </div>
            </Card>

            <Card>
              <CardHead title="Evidence from this project" hint="§166 — every CV claim points at something real." />
              <div className="card-pad">
                <EvidenceManager
                  projectId={project.id}
                  skills={project.skills.map((id) => ({ id, title: graph.skills.find((s) => s.id === id)?.title ?? id }))}
                  items={evidence.map((e) => ({
                    _id: e._id,
                    kind: e.kind,
                    title: e.title,
                    url: e.url,
                    description: e.description,
                    verified: e.verified,
                    skillIds: e.skillIds,
                  }))}
                />
                <p className="mt-3 text-xs text-ink-3">Expected for this project: {project.evidenceExpected.join(" · ")}</p>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHead title="Data policy" hint="§172 — real, documented data only." />
              <div className="card-pad space-y-3 text-sm">
                <div>
                  <p className="h-section">Recommended sources</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {project.dataPolicy.recommendedSources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">{s.name}</a>
                        <div className="mt-0.5"><VerificationChip status={s.verificationStatus} /></div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="h-section">You must record</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink-2">
                    {project.dataPolicy.mustRecord.map((m) => <li key={m}>{m}</li>)}
                  </ul>
                </div>
                <p className="text-xs text-ink-3">
                  {project.dataPolicy.syntheticAllowed
                    ? "Synthetic data is allowed here, and must be labelled as synthetic wherever results are reported."
                    : "Synthetic data is not acceptable for this project. Results must come from the real dataset."}
                </p>
              </div>
            </Card>

            <Card>
              <CardHead title="Skills this exercises" />
              <ul className="divide-y divide-[var(--line)]">
                {project.skills.map((id) => (
                  <li key={id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <Link href={`/skills#${id}`} className="text-sm underline-offset-2 hover:underline">
                      {graph.skills.find((s) => s.id === id)?.title ?? id}
                    </Link>
                    <MasteryChip level={mastery.get(id)?.level ?? "unknown"} />
                  </li>
                ))}
              </ul>
            </Card>

            {lessons.length > 0 && (
              <Card>
                <CardHead title="Lessons that prepare you" />
                <ul className="divide-y divide-[var(--line)]">
                  {lessons.map((l) => (
                    <li key={l.id} className="px-5 py-2.5 text-sm">
                      <Link href={`/learn/${l.id}`} className="underline-offset-2 hover:underline">{l.title}</Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {roles.length > 0 && (
              <Card>
                <CardHead title="Roles this supports" />
                <ul className="divide-y divide-[var(--line)]">
                  {roles.map((r) => (
                    <li key={r.id} className="px-5 py-2.5 text-sm">
                      <Link href={`/career#${r.id}`} className="underline-offset-2 hover:underline">{r.title}</Link>
                      <span className="text-ink-3"> · {r.referenceEmployer}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
