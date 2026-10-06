import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { projectCatalog, userProjects } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { PageHeader, Section, Empty } from "@/components/ui";
import { StartProject } from "./start";

const LADDER = ["", "Python engineering", "Data analysis", "SQL / data pipeline", "Classical ML", "Deep learning", "CV / NLP", "LLM / RAG", "Agents", "Production AI", "Research"];

export default async function Projects() {
  const u = await requireUser();
  await ensureSeed();
  const [cat, mine] = await Promise.all([db.select().from(projectCatalog).orderBy(asc(projectCatalog.ladderLevel), asc(projectCatalog.id)), db.select().from(userProjects).where(eq(userProjects.ownerId, u.id))]);
  const title = new Map(cat.map((c) => [c.id, c]));
  return (
    <>
      <PageHeader title="Projects" lead="The proof layer. Code lives in your GitHub repository; run heavy workloads in Codespaces, Colab, Kaggle or locally. This site tracks the brief, milestones and evidence — it does not execute your code." />
      <Section title="My projects">
        {mine.length ? <ul className="card divide-y divide-line">{mine.map((p) => { const c = title.get(p.catalogId)!; return (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-4"><Link className="font-medium hover:text-accent" href={`/projects/${p.id}`}>{c.title}</Link><span className="text-xs text-muted">{p.status} · {p.milestonesDone.length}/{c.milestones.length} milestones</span></li>); })}</ul>
          : <Empty>You haven’t started a project yet. Pick one from the ladder below — ideally one whose units you’ve begun.</Empty>}
      </Section>
      {LADDER.slice(1).map((name, i) => {
        const lvl = i + 1; const ps = cat.filter((c) => c.ladderLevel === lvl);
        if (!ps.length) return null;
        return (
          <Section key={lvl} title={`Level ${lvl} · ${name}`}>
            <div className="grid gap-3 md:grid-cols-2">{ps.map((p) => (
              <div key={p.id} className="card flex flex-col p-4">
                <div className="flex items-start justify-between gap-2"><h3 className="font-medium">{p.title}</h3><span className="chip shrink-0">{p.origin}</span></div>
                <p className="mt-1 text-sm text-muted">{p.dataGuidance}</p>
                <div className="mt-auto pt-3"><StartProject id={p.id} /></div>
              </div>
            ))}</div>
          </Section>
        );
      })}
    </>
  );
}
