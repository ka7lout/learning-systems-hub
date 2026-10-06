import { requireUser, getSettings } from "@/lib/auth";
import { masteryMap } from "@/lib/dal";
import { db } from "@/db";
import { practiceItems } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { PageHeader, Empty } from "@/components/ui";
import { PracticeBox } from "@/components/client";
import { STATE_COPY, type StudyState } from "@/lib/learning";

function seeded(str: string) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)) >>> 0) / 4294967296; }

export default async function PracticeLab() {
  const u = await requireUser();
  const [{ data: s }, m] = await Promise.all([getSettings(u.id), masteryMap(u.id)]);
  const started = [...m.values()].filter((r) => r.contentSeen).map((r) => r.nodeId);
  const state = s.studyState as StudyState;
  const max = STATE_COPY[state].maxConcepts + 1;
  if (started.length < 2) return (<><PageHeader title="Practice Lab" /><Empty action={{ href: "/learn", label: "Go to your next unit" }}>Interleaved practice mixes problems from different units so you must decide which tool applies. It unlocks once you’ve opened at least two units.</Empty></>);
  const items = await db.select().from(practiceItems).where(inArray(practiceItems.nodeId, started));
  const pool = items.filter((i) => i.stage !== "recall");
  const rnd = seeded(u.id + new Date().toDateString());
  const mixed = pool.map((i) => ({ i, k: rnd() })).sort((a, b) => a.k - b.k).map((x) => x.i);
  const picked: typeof mixed = []; const usedNodes = new Set<string>();
  for (const it of mixed) { if (picked.length >= max) break; if (!usedNodes.has(it.nodeId)) { picked.push(it); usedNodes.add(it.nodeId); } }
  return (
    <>
      <PageHeader title="Practice Lab — interleaved set" lead="Problems from different units, unlabelled on purpose. First decide which concept or tool applies, then solve. Today’s set is fixed for the day and sized to your current study state." />
      <div className="space-y-4">{picked.map((it) => <PracticeBox key={it.id} item={it} state={state} />)}</div>
    </>
  );
}
