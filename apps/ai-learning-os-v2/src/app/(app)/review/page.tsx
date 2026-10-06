import { requireUser, getSettings } from "@/lib/auth";
import { dueReviews } from "@/lib/dal";
import { db } from "@/db";
import { practiceItems } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { PageHeader, Section, Empty } from "@/components/ui";
import { PracticeBox } from "@/components/client";

export default async function Review() {
  const u = await requireUser();
  const [revs, { data: s }] = await Promise.all([dueReviews(u.id), getSettings(u.id)]);
  const now = new Date();
  const due = revs.filter((r) => r.dueAt <= now);
  const upcoming = revs.filter((r) => r.dueAt > now);
  const items = due.length ? await db.select().from(practiceItems).where(inArray(practiceItems.nodeId, due.map((d) => d.nodeId))) : [];
  // Vary activity type: alternate recall and transfer across due units instead of only term-definition cards.
  const tasks = due.map((d, idx) => {
    const forNode = items.filter((i) => i.nodeId === d.nodeId);
    const pref = idx % 2 === 0 ? "recall" : "transfer";
    return { d, item: forNode.find((i) => i.stage === pref) ?? forNode[0] };
  }).filter((t) => t.item);
  return (
    <>
      <PageHeader title="Review" lead="Delayed retrieval. Intervals grow when you succeed (more when you succeed on transfer) and shrink after misses. Answer from memory before looking anything up." />
      <Section title={`Due now (${tasks.length})`}>
        {tasks.length ? <div className="space-y-4">{tasks.map(({ d, item }) => <PracticeBox key={d.nodeId} item={{ ...item!, nodeTitle: d.title }} state={s.studyState} />)}</div> : <Empty>Nothing is due. Reviews are scheduled automatically after each practice attempt.</Empty>}
      </Section>
      <Section title="Upcoming">
        {upcoming.length ? <ul className="card divide-y divide-line text-sm">{upcoming.map((r) => <li key={r.nodeId} className="flex justify-between p-3"><span>{r.title}</span><span className="text-muted">{r.dueAt.toLocaleDateString()}</span></li>)}</ul> : <p className="text-sm text-muted">No upcoming reviews.</p>}
      </Section>
    </>
  );
}
