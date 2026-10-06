import Link from "next/link";
import { AppShell } from "@/components/shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getProjectCatalog, getUserProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

const LADDER = [
  "Python engineering",
  "Data analysis",
  "SQL / data pipeline",
  "Classical ML",
  "Deep learning",
  "CV / NLP",
  "LLM / RAG",
  "Agents",
  "Production AI",
  "Research",
];

export default async function ProjectsPage() {
  const user = await requirePage();
  const [catalog, mine] = await Promise.all([getProjectCatalog(), getUserProjects(user.id)]);
  const mineByKey = new Map(mine.map((m) => [m.projectKey, m]));

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Project ladder"
        title="Projects are the proof"
        description="The original 21-project catalogue is preserved and extended with agentic, production and research levels. Every project carries a data policy: real public data with recorded provenance, or an explicit synthetic label."
      />

      <Card className="mb-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Ladder</h2>
        <ol className="grid gap-1 text-xs text-muted sm:grid-cols-2 lg:grid-cols-5">
          {LADDER.map((l, i) => (
            <li key={l}>
              <span className="font-medium text-ink">L{i + 1}</span> {l}
            </li>
          ))}
        </ol>
      </Card>

      <div className="space-y-3">
        {catalog.map((project) => {
          const state = mineByKey.get(project.key);
          return (
            <Card key={project.key} className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="accent">L{project.ladderLevel}</Badge>
                <Badge>{project.sourceCategory}</Badge>
                <Badge>{project.evidenceClass}</Badge>
                {state ? <Badge tone={state.status === "done" ? "good" : "warn"}>{state.status.replace("_", " ")}</Badge> : null}
              </div>
              <Link href={`/projects/${project.key}`} className="text-sm font-semibold text-ink hover:underline">
                {project.title}
              </Link>
              <p className="mt-1 text-sm leading-relaxed text-muted">{project.brief}</p>
              <p className="mt-2 text-xs text-muted">
                <span className="font-medium text-ink">Data policy:</span> {project.dataPolicy}
              </p>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
