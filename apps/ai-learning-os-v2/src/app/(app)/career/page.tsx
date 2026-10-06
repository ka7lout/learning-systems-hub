import Link from "next/link";
import { requireUser, getSettings } from "@/lib/auth";
import { careerReport } from "@/lib/dal";
import { db } from "@/db";
import { englishAttempts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { PageHeader, Section, Status } from "@/components/ui";

export default async function Career() {
  const u = await requireUser();
  const [roles, { data: s }, [eng]] = await Promise.all([careerReport(u.id), getSettings(u.id), db.select({ c: sql<number>`count(*)::int` }).from(englishAttempts).where(eq(englishAttempts.ownerId, u.id))]);
  return (
    <>
      <PageHeader title="Career readiness" lead="Target role → requirements → your evidence → gap → task. Readiness means you have demonstrated the evidence this rubric asks for; it is never a hiring guarantee." />
      {roles.map((r) => (
        <Section key={r.id} title={r.name} aside={<span className="flex items-center gap-2">{s.targetRoles.includes(r.id) && <span className="chip !text-accent">target</span>}<Status s={r.status} /></span>}>
          <div className="card p-5">
            <p className="text-sm text-muted">{r.notes} Snapshot: {r.snapshotDate}. <a href={r.sourceUrl} className="text-accent underline" target="_blank" rel="noreferrer">Source listing</a></p>
            <p className="mt-3 text-sm"><strong>{r.metHard}</strong> of {r.hardRows.length} hard requirements independently demonstrated with evidence.</p>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div><h3 className="text-sm font-medium">Hard requirements</h3>
                <ul className="mt-2 space-y-1 text-sm">{r.hardRows.map((h) => <li key={h.id} className="flex justify-between gap-2"><span>{h.name}</span><span className={h.independent && h.evidence ? "text-ok" : h.independent ? "text-accent" : "text-muted"}>{h.independent ? (h.evidence ? "demonstrated + evidence" : "demonstrated, evidence missing") : h.band}</span></li>)}</ul>
              </div>
              <div>
                <h3 className="text-sm font-medium">Preferred</h3>
                <ul className="mt-2 space-y-1 text-sm">{r.preferredRows.map((h) => <li key={h.id} className="flex justify-between"><span>{h.name}</span><span className="text-muted">{h.band}</span></li>)}</ul>
                <h3 className="mt-4 text-sm font-medium">Recommended next tasks</h3>
                {r.tasks.length ? <ul className="mt-2 space-y-1 text-sm">{r.tasks.map((t) => <li key={t.nodeId}><Link className="text-accent hover:underline" href={`/learn/${t.nodeId}`}>{t.title}</Link> <span className="text-muted">→ {t.skill}</span></li>)}</ul> : <p className="mt-2 text-sm text-muted">No gaps detected by this rubric.</p>}
                <h3 className="mt-4 text-sm font-medium">Location / seniority</h3>
                <p className="text-sm text-muted">Not verified in this build — check the current listing before applying.</p>
                <h3 className="mt-4 text-sm font-medium">English readiness</h3>
                <p className="text-sm text-muted">{Number(eng.c)} English activities recorded. No CEFR level is inferred automatically.</p>
              </div>
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
