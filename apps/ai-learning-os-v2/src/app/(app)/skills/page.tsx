import { requireUser } from "@/lib/auth";
import { skillStatus } from "@/lib/dal";
import { PageHeader, Section } from "@/components/ui";

const BAND_STYLE: Record<string, string> = { "not started": "text-muted", developing: "text-warn", competent: "text-accent", "independently demonstrated": "text-ok" };

export default async function Skills() {
  const u = await requireUser();
  const all = await skillStatus(u.id);
  const areas = [...new Set(all.map((s) => s.area))];
  return (
    <>
      <PageHeader title="Skill graph" lead="Each skill links to curriculum units and evidence. Bands come only from your attempts (best unit level) and recorded evidence — never from content viewed." />
      {areas.map((a) => (
        <Section key={a} title={a}>
          <div className="card overflow-x-auto"><table className="w-full text-sm">
            <thead className="text-left text-xs text-muted"><tr><th className="p-3">Skill</th><th className="p-3">Band</th><th className="p-3">Units</th><th className="p-3">Evidence</th></tr></thead>
            <tbody className="divide-y divide-line">{all.filter((s) => s.area === a).map((s) => (
              <tr key={s.id}><td className="p-3">{s.name}</td><td className={`p-3 ${BAND_STYLE[s.band]}`}>{s.band}</td><td className="p-3 text-muted">{s.nodeIds.length}</td><td className="p-3">{s.evidenceCount}</td></tr>
            ))}</tbody>
          </table></div>
        </Section>
      ))}
    </>
  );
}
