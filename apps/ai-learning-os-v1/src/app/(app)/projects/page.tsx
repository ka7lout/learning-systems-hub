import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectCatalog, userProjects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getMasteryMap, CORE_THRESHOLD } from "@/lib/engine";
import { PageHeader, SourceBadge } from "@/components/ui";
import { StartProjectButton } from "@/components/ProjectForm";

export default async function ProjectsPage() {
  const user = await requireUser();
  const [catalog, mine, mastery] = await Promise.all([
    db.select().from(projectCatalog).orderBy(asc(projectCatalog.ladderLevel), asc(projectCatalog.title)),
    db.select().from(userProjects).where(eq(userProjects.ownerId, user.id)),
    getMasteryMap(user.id),
  ]);
  const mineByCatalog = new Map(mine.map((m) => [m.catalogId, m]));
  const levels = [...new Set(catalog.map((c) => c.ladderLevel))];
  const LADDER = ["", "Python engineering", "Data analysis", "SQL / data pipeline", "Classical ML", "Deep learning", "CV / NLP", "LLM / RAG", "Agents", "Production AI", "Research"];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Projects" lead="The proof layer. All 21 original projects plus ladder extensions. GitHub is the source of truth for code; this page holds the brief, data policy, definition of done, environment links and evidence." />
      {mine.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-muted">Your projects</h2>
          <ul className="grid gap-2 sm:grid-cols-2">{mine.map((m) => { const c = catalog.find((x) => x.id === m.catalogId)!; return <li key={m.id}><Link href={`/projects/${m.id}`} className="card flex items-center justify-between p-4 hover:bg-surface-2"><span className="font-medium">{c.title}</span><span className="badge">{m.status.replace("_", " ")}</span></Link></li>; })}</ul>
        </section>
      )}
      {levels.map((lv) => (
        <section key={lv} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold">Level {lv} · {LADDER[lv]}</h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {catalog.filter((c) => c.ladderLevel === lv).map((c) => {
              const ready = c.prerequisiteNodeIds.every((n) => (mastery.get(n)?.level ?? 0) >= CORE_THRESHOLD);
              const existing = mineByCatalog.get(c.id);
              return (
                <li key={c.id} className="card p-4">
                  <div className="flex flex-wrap items-center gap-1.5"><span className="font-medium">{c.title}</span><SourceBadge s={c.sourceCategory} /><span className="badge">{c.domain}</span>{!ready && <span className="badge !bg-warn-soft !text-warn">prerequisites pending</span>}</div>
                  <p className="mt-1 text-sm text-muted">{c.brief}</p>
                  <div className="mt-3">{existing ? <Link href={`/projects/${existing.id}`} className="btn">Open ({existing.status.replace("_", " ")})</Link> : <StartProjectButton catalogId={c.id} />}</div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
