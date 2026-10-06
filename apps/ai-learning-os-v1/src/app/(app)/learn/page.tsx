import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getMasteryMap, recommendNext } from "@/lib/engine";
import { Empty, MasteryBadge, PageHeader, SourceBadge } from "@/components/ui";

export default async function LearnIndex() {
  const user = await requireUser();
  const [mastery, recs] = await Promise.all([getMasteryMap(user.id), recommendNext(user.id)]);
  const startedIds = [...mastery.keys()];
  const started = startedIds.length ? await db.select().from(curriculumNodes).where(inArray(curriculumNodes.id, startedIds)) : [];
  const lessons = started.filter((n) => n.type === "lesson").sort((a, b) => (mastery.get(a.id)?.updatedAt.getTime() ?? 0) < (mastery.get(b.id)?.updatedAt.getTime() ?? 0) ? 1 : -1);
  const rec = recs.find((r) => r.kind === "lesson" || r.kind === "practice");
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Learn" lead="Lessons you have opened, ordered by recency, and the next recommended block." />
      {rec && <Link href={rec.href} className="card mb-6 block border-accent/40 p-5 hover:bg-surface-2"><div className="text-xs font-semibold uppercase tracking-wide text-accent">Recommended next</div><div className="mt-1 font-semibold">{rec.title}</div><div className="mt-1 text-xs text-muted">{rec.why.join(" · ")}</div></Link>}
      {lessons.length === 0 ? <Empty title="No lessons opened yet" body="Start from the curriculum. Python Fundamentals and Linear Algebra are the two entry points with no prerequisites." href="/curriculum" cta="Open curriculum" /> : (
        <ul className="space-y-2">{lessons.map((l) => <li key={l.id}><Link href={`/learn/${l.id}`} className="card flex items-center justify-between gap-3 p-4 hover:bg-surface-2"><span><span className="font-medium">{l.title}</span><span className="ml-2"><SourceBadge s={l.sourceCategory} /></span></span><MasteryBadge level={mastery.get(l.id)?.level} /></Link></li>)}</ul>
      )}
    </div>
  );
}
