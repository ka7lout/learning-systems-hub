import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getMasteryMap, getPrereqMap, CORE_THRESHOLD } from "@/lib/engine";
import { MasteryBadge, PageHeader, SourceBadge } from "@/components/ui";

export default async function CurriculumPage() {
  const user = await requireUser();
  const [nodes, mastery, prereqs] = await Promise.all([
    db.select().from(curriculumNodes).where(inArray(curriculumNodes.type, ["stage", "module", "lesson"])).orderBy(asc(curriculumNodes.position)),
    getMasteryMap(user.id),
    getPrereqMap(),
  ]);
  const stages = nodes.filter((n) => n.type === "stage");
  const byParent = (id: string) => nodes.filter((n) => n.parentId === id);
  const ready = (id: string) => (prereqs.get(id) ?? []).every((p) => (mastery.get(p)?.level ?? 0) >= CORE_THRESHOLD);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Curriculum" lead="A prerequisite graph organised into 22 stages. Every original module and topic is preserved and labelled; Harvard, industry and research layers are additive and carry verification status." />
      <div className="mb-4 flex flex-wrap gap-1.5 text-xs"><SourceBadge s="original" /><SourceBadge s="harvard_college" /><SourceBadge s="harvard_extension" /><SourceBadge s="industry" /><SourceBadge s="research" /></div>
      <div className="space-y-6">
        {stages.map((s) => {
          const children = byParent(s.id);
          if (!children.length) return null;
          return (
            <section key={s.id} className="card p-5">
              <h2 className="font-semibold">{s.position}. {s.title}</h2>
              <p className="text-xs text-muted">{s.summary}</p>
              <div className="mt-3 space-y-3">
                {children.map((c) =>
                  c.type === "module" ? (
                    <div key={c.id} className="rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{c.title}</span><SourceBadge s={c.sourceCategory} /><span className="text-xs text-muted">{c.summary}</span></div>
                      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {byParent(c.id).map((l) => <LessonRow key={l.id} l={l} level={mastery.get(l.id)?.level} ready={ready(l.id)} />)}
                      </ul>
                    </div>
                  ) : (
                    <ul key={c.id} className="grid gap-1.5 sm:grid-cols-2"><LessonRow l={c} level={mastery.get(c.id)?.level} ready={ready(c.id)} /></ul>
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function LessonRow({ l, level, ready }: { l: typeof curriculumNodes.$inferSelect; level: number | undefined; ready: boolean }) {
  return (
    <li>
      <Link href={`/learn/${l.id}`} className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-2">
        <span>
          <span className="font-medium">{l.title}</span>
          <span className="mt-0.5 flex flex-wrap gap-1"><SourceBadge s={l.sourceCategory} /><span className="badge">{l.priority}</span>{!ready && <span className="badge !bg-warn-soft !text-warn">prerequisites pending</span>}</span>
        </span>
        <MasteryBadge level={level} />
      </Link>
    </li>
  );
}
