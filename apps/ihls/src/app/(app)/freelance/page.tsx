import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph } from "@/content";
import { owned, type EvidenceDoc, type ProjectSubmissionDoc, type SpeakingAttemptDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function FreelancePage() {
  const session = await pageSession();
  const graph = buildCurriculumGraph();
  const evidence = await owned<EvidenceDoc>(session, "project_evidence").find({});
  const projects = await owned<ProjectSubmissionDoc>(session, "project_submissions").find({});
  const speaking = await owned<SpeakingAttemptDoc>(session, "speaking_attempts").find({});

  const deployed = projects.filter((p) => Boolean(p.links.deployment));
  const withRepo = projects.filter((p) => Boolean(p.links.repository));
  const reports = evidence.filter((e) => e.kind === "report");
  const verified = evidence.filter((e) => e.verified);

  const gates = [
    {
      label: "A finished project someone else can run",
      met: withRepo.length > 0,
      detail: withRepo.length > 0 ? `${withRepo.length} project${withRepo.length === 1 ? "" : "s"} with a repository link.` : "No project has a repository link recorded yet.",
      action: { href: "/projects", text: "Open the project ladder" },
    },
    {
      label: "Something deployed and reachable",
      met: deployed.length > 0,
      detail: deployed.length > 0 ? `${deployed.length} deployment link recorded.` : "No deployment link recorded.",
      action: { href: "/projects", text: "Add a deployment link" },
    },
    {
      label: "A written report of a real result",
      met: reports.length > 0,
      detail: reports.length > 0 ? `${reports.length} report recorded as evidence.` : "No report evidence recorded.",
      action: { href: "/portfolio", text: "Record a report" },
    },
    {
      label: "Evidence that survives checking",
      met: verified.length > 0,
      detail: verified.length > 0 ? `${verified.length} verified item${verified.length === 1 ? "" : "s"}.` : "Nothing has been verified yet. Verification requires a human review, so this stays false until that happens.",
      action: { href: "/portfolio", text: "Review your evidence" },
    },
    {
      label: "You can explain your work out loud in English",
      met: speaking.length > 0,
      detail: speaking.length > 0 ? `${speaking.length} recorded speaking attempt${speaking.length === 1 ? "" : "s"}.` : "No speaking practice recorded.",
      action: { href: "/learn/english", text: "Practise explaining" },
    },
  ];

  const metCount = gates.filter((g) => g.met).length;
  const clientFacingProjects = graph.projects.filter((p) => p.cvClass === "Portfolio Project" || p.cvClass === "Signature Project");

  return (
    <>
      <PageHeader
        title="Freelance"
        lede="Preparation for paid work, built only from what you have actually produced. This page does not connect to any marketplace and shows no jobs, rates or client data."
      >
        <Chip tone={metCount === gates.length ? "positive" : "caution"}>{metCount}/{gates.length} readiness gates met</Chip>
      </PageHeader>

      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <Card>
              <CardHead title="Readiness gates" hint="Computed from your own records. Nothing here is assumed." />
              <ul className="divide-y divide-[var(--line)]">
                {gates.map((g) => (
                  <li key={g.label} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{g.label}</p>
                      <p className="mt-0.5 text-sm text-ink-2">{g.detail}</p>
                      {!g.met && (
                        <Link href={g.action.href} className="mt-1 inline-block text-xs underline underline-offset-2">{g.action.text}</Link>
                      )}
                    </div>
                    <Chip tone={g.met ? "positive" : "neutral"}>{g.met ? "met" : "not met"}</Chip>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHead title="Scope and communication practice" hint="Rehearsal, not real client work." />
              <div className="card-pad space-y-3 text-sm text-ink-2">
                <p>
                  The hardest part of early freelance work is not the model — it is agreeing what will be delivered. Practise these as
                  written exercises and have the mentor review them with the freelance-coach action:
                </p>
                <ol className="list-decimal space-y-1.5 pl-5">
                  <li>Turn a vague request into three concrete deliverables with acceptance criteria.</li>
                  <li>Write the questions you must ask before quoting: data access, volume, latency, who signs off.</li>
                  <li>State what you will <em>not</em> do in this engagement, in one short paragraph.</li>
                  <li>Describe a failure case honestly to a non-technical client, with the mitigation.</li>
                  <li>Write the handover: how they run it, what breaks it, what maintenance costs.</li>
                </ol>
                <p className="text-xs text-ink-3">
                  These exercises are generated from the specification&rsquo;s freelance competencies. They are practice artefacts and must
                  never be presented to anyone as completed client engagements.
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHead title="What this page cannot tell you" hint="Stated plainly." />
              <div className="card-pad space-y-2 text-sm text-ink-2">
                <p>No marketplace API is connected, so there are no live jobs, no bid data and no demand figures here.</p>
                <p>No rate guidance is shown, because any number would be invented. Rates depend on your market, niche and evidence.</p>
                <p>No client reviews, testimonials or earnings exist in this system, and none will be fabricated to make the page look complete.</p>
              </div>
            </Card>

            <Card>
              <CardHead title="Projects that read as client-grade" hint="By CV class, from the ladder." />
              <ul className="divide-y divide-[var(--line)]">
                {clientFacingProjects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <Link href={`/projects/${p.id}`} className="text-sm underline-offset-2 hover:underline">{p.title}</Link>
                    <Chip>{p.cvClass}</Chip>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
