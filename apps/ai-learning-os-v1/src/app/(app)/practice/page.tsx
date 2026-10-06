import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes, practiceItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getMasteryMap } from "@/lib/engine";
import { Empty, PageHeader } from "@/components/ui";
import { PracticeBlock } from "@/components/PracticeBlock";

/** Interleaved practice: items drawn across every started lesson so the learner must first decide which tool applies. */
export default async function PracticeLab() {
  const user = await requireUser();
  const mastery = await getMasteryMap(user.id);
  const ids = [...mastery.keys()];
  if (!ids.length) return <div className="mx-auto max-w-4xl"><PageHeader title="Practice Lab" /><Empty title="Nothing to interleave yet" body="Open at least one lesson. Once two or more lessons are started, the lab mixes their items so you practise selecting the method, not just applying it." href="/curriculum" cta="Open curriculum" /></div>;
  const [items, nodes] = await Promise.all([
    db.select().from(practiceItems).where(inArray(practiceItems.nodeId, ids)),
    db.select({ id: curriculumNodes.id, title: curriculumNodes.title }).from(curriculumNodes).where(inArray(curriculumNodes.id, ids)),
  ]);
  const titles = new Map(nodes.map((n) => [n.id, n.title]));
  // Deterministic interleave: round-robin across lessons, weakest lesson first.
  const order = [...ids].sort((a, b) => (mastery.get(a)?.level ?? 0) - (mastery.get(b)?.level ?? 0));
  const buckets = order.map((id) => items.filter((i) => i.nodeId === id).sort((a, b) => a.difficulty.localeCompare(b.difficulty)));
  const mixed: typeof items = [];
  for (let r = 0; r < 6; r++) for (const b of buckets) if (b[r]) mixed.push(b[r]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Practice Lab" lead={`Interleaved items from ${ids.length} started lesson(s), weakest first. Multiple-choice is deliberately absent: you explain, predict, debug, choose, derive and transfer.`} />
      <PracticeBlock title="Interleaved block" items={mixed.map((i) => ({ id: i.id, nodeId: i.nodeId, nodeTitle: titles.get(i.nodeId), type: i.type, difficulty: i.difficulty, prompt: i.prompt, rubric: i.rubric, reference: i.reference, isTransfer: i.isTransfer }))} />
    </div>
  );
}
