import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { curriculum, masteryMap } from "@/lib/dal";
import { db } from "@/db";
import { mappings, sources } from "@/db/schema";
import { PageHeader, Section, Status } from "@/components/ui";
import { LEVEL_LABELS } from "@/lib/learning";

export default async function Curriculum() {
  const u = await requireUser();
  const [all, m, maps, srcs] = await Promise.all([curriculum(), masteryMap(u.id), db.select().from(mappings), db.select().from(sources)]);
  const mods = all.filter((n) => n.type === "module");
  const title = new Map(all.map((n) => [n.id, n.title]));
  return (
    <>
      <PageHeader title="Curriculum map" lead="Harvard-informed, not Harvard-affiliated. Every unit declares one source category. Original Curriculum items are preserved in full; other layers are additive. Prerequisites form a validated acyclic graph." />
      {mods.map((mod) => {
        const units = all.filter((n) => n.parentId === mod.id);
        return (
          <Section key={mod.id} title={mod.title} aside={<span className="chip">{mod.sourceCategory}{mod.sessions ? ` · ${mod.sessions} sessions` : ""}</span>}>
            {mod.why && <p className="-mt-1 mb-3 text-xs text-muted">{mod.why}</p>}
            <div className="card divide-y divide-line">
              {units.map((n) => {
                const lvl = m.get(n.id)?.level ?? 0;
                return (
                  <div key={n.id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto]">
                    <div>
                      <Link href={`/learn/${n.id}`} className="font-medium hover:text-accent">{n.title}</Link>
                      <div className="mt-1 flex flex-wrap gap-1.5"><span className="chip">{n.tier}</span><span className="chip">{n.level}</span>{n.sourceCategory !== mod.sourceCategory && <span className="chip">{n.sourceCategory}</span>}</div>
                      <p className="mt-2 text-xs text-muted">{n.topics.join(" · ")}</p>
                      {n.prerequisites.length > 0 && <p className="mt-1 text-xs text-muted">Requires: {n.prerequisites.map((p) => title.get(p)).join(", ")}</p>}
                    </div>
                    <div className="text-xs text-muted md:text-right">L{lvl} · {LEVEL_LABELS[lvl]}</div>
                  </div>
                );
              })}
            </div>
          </Section>
        );
      })}
      <Section title="Harvard mapping (original topics → Harvard)">
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted"><tr><th className="p-3">Original unit</th><th className="p-3">Kept?</th><th className="p-3">Harvard source</th><th className="p-3">Match</th><th className="p-3">What Harvard adds</th><th className="p-3">Status</th></tr></thead>
            <tbody className="divide-y divide-line">{maps.map((x) => (
              <tr key={x.id}><td className="p-3">{title.get(x.nodeId)}</td><td className="p-3">YES</td><td className="p-3">{x.course}<div className="text-xs text-muted">{x.institution}</div></td><td className="p-3">{x.match}</td><td className="p-3">{x.adds}</td><td className="p-3"><Status s={x.status} /></td></tr>
            ))}</tbody>
          </table>
        </div>
      </Section>
      <Section title="Sources">
        <ul className="space-y-2 text-sm">{srcs.map((s) => (
          <li key={s.id} className="card p-3"><a href={s.url} className="font-medium text-accent hover:underline" target="_blank" rel="noreferrer">{s.title}</a> <Status s={s.verificationStatus} /><div className="text-xs text-muted">{s.publisher} · {s.term} {s.notes ? `— ${s.notes}` : ""}</div></li>
        ))}</ul>
      </Section>
    </>
  );
}
