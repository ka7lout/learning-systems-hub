import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph } from "@/content";
import { owned, type EvidenceDoc, type ProjectSubmissionDoc } from "@/lib/dal";
import { cvEligibleEvidence } from "@/lib/engines/career";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, EmptyState } from "@/components/ui";
import { EvidenceManager } from "@/components/project-widgets";

export const dynamic = "force-dynamic";

const CV_LADDER = [
  "Practice Only",
  "Skill Evidence",
  "Technical Artifact",
  "Portfolio Project",
  "Professional Evidence",
  "Signature Project",
] as const;

export default async function PortfolioPage() {
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const evidence = await owned<EvidenceDoc>(session, "project_evidence").find({}, { sort: { createdAt: -1 } });
  const submissions = await owned<ProjectSubmissionDoc>(session, "project_submissions").find({});
  const cvItems = await cvEligibleEvidence(session);

  const byClass = new Map<string, typeof cvItems>();
  for (const item of cvItems) byClass.set(item.cvClass, [...(byClass.get(item.cvClass) ?? []), item]);

  return (
    <>
      <PageHeader
        title="Portfolio"
        lede="Evidence, and what it is allowed to claim. Nothing appears as a CV bullet until something real backs it."
      >
        <Chip>{evidence.length} evidence items</Chip>
      </PageHeader>

      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <Card>
              <CardHead title="CV-eligible evidence" hint="§166 — verified items with a link or a substantive description." />
              {cvItems.length === 0 ? (
                <EmptyState
                  title="Nothing is CV-eligible yet"
                  body="An item becomes CV-eligible when it has been verified and points at something concrete: a repository, a deployment, a report or a measured result. Unverified evidence stays in the list below until it is checked."
                  action={<Link href="/projects" className="btn btn-sm">Start a project</Link>}
                />
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {CV_LADDER.filter((c) => byClass.has(c)).map((cls) => (
                    <div key={cls} className="px-5 py-3">
                      <p className="h-section">{cls}</p>
                      <ul className="mt-1.5 space-y-2">
                        {byClass.get(cls)!.map((i) => (
                          <li key={i.evidenceId}>
                            <p className="text-sm font-medium">{i.title}</p>
                            {i.url && (
                              <a href={i.url} target="_blank" rel="noreferrer noopener" className="block truncate text-xs underline underline-offset-2">{i.url}</a>
                            )}
                            <p className="text-sm text-ink-2">{i.description}</p>
                            {i.skills.length > 0 && <p className="mt-0.5 text-xs text-ink-3">Skills: {i.skills.join(", ")}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <CardHead title="All recorded evidence" hint="Add items that are not tied to a single project here." />
              <div className="card-pad">
                <EvidenceManager
                  skills={graph.skills.map((s) => ({ id: s.id, title: s.title }))}
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
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHead title="Project status" />
              {submissions.length === 0 ? (
                <EmptyState title="No projects started" body="Project status appears here once you begin one from the ladder." />
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {submissions.map((s) => {
                    const spec = graph.projects.find((p) => p.id === s.projectId);
                    return (
                      <li key={s._id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                        <Link href={`/projects/${s.projectId}`} className="text-sm underline-offset-2 hover:underline">
                          {spec?.title ?? s.projectId}
                        </Link>
                        <Chip tone={s.status === "reviewed" ? "positive" : s.status === "in_progress" ? "accent" : "neutral"}>
                          {s.status.replace(/_/g, " ")}
                        </Chip>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <CardHead title="Rules this page enforces" />
              <ul className="list-disc space-y-1.5 px-9 py-4 text-sm text-ink-2">
                <li>A tutorial you followed is practice, not a portfolio project.</li>
                <li>A model&rsquo;s accuracy is only reported with the dataset, split and date it came from.</li>
                <li>&ldquo;Deployed&rdquo; means a URL someone else can open, not a notebook that ran once.</li>
                <li>Nothing is marked verified automatically. Verification is a human act.</li>
                <li>No achievement, client, review or metric is ever generated for you.</li>
              </ul>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
