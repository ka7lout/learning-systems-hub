import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { activityAttempts, englishTerms, sources } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatusBadge } from "@/components/ui";
import { SimulationCard } from "@/components/SimulationCard";
import { SIMULATIONS } from "@/content/catalog";

const HYPOTHESES = [
  { id: "H1", text: "State-adaptive learning may outperform a fixed study protocol on long-term retention and/or sustainability.", evidence: "Speculative — hypothesis to test" },
  { id: "H2", text: "Adaptive task size and scaffolding may reduce overload and improve persistence without reducing transfer.", evidence: "Emerging — cognitive-load literature supports segmentation; adaptive sizing untested here" },
  { id: "H3", text: "Retrieval + transfer + case-based application may improve transfer beyond retrieval alone.", evidence: "Moderate — practice testing has strong evidence; transfer gains are less consistently shown" },
  { id: "H4", text: "AI tutoring that requires an initial attempt may yield greater independent performance than answer-first assistance.", evidence: "Speculative — plausible from generation-effect findings; needs a controlled comparison" },
  { id: "H5", text: "Externalising executive-function demands plus environment design may reduce initiation friction among learners with attention difficulties.", evidence: "Emerging — consistent with self-regulated-learning work; not a clinical claim" },
  { id: "H6", text: "Guardrails against unnecessary reassurance may reduce unproductive verification without reducing legitimate accuracy checks.", evidence: "Speculative — educational design decision, not a treatment" },
];
const EVIDENCE_LEVELS = [
  { k: "Strong", items: ["Practice testing (retrieval) and distributed practice — Dunlosky et al. 2013; Cepeda et al. 2006"] },
  { k: "Moderate", items: ["Interleaving for discrimination between problem types", "Worked examples with fading for novices"] },
  { k: "Emerging", items: ["Case-based reasoning for transfer in technical domains", "Self-explanation prompts in programming"] },
  { k: "Speculative", items: ["State-adaptive session shaping (IHLS)", "Attempt-first AI tutoring gates"] },
];

export default async function ResearchPage() {
  const user = await requireUser();
  const [srcs, attempts, terms] = await Promise.all([
    db.select().from(sources).orderBy(asc(sources.publisher), asc(sources.title)),
    db.select({ key: activityAttempts.activityKey, c: sql<number>`count(*)::int` }).from(activityAttempts).where(eq(activityAttempts.ownerId, user.id)).groupBy(activityAttempts.activityKey),
    db.select().from(englishTerms).orderBy(asc(englishTerms.term)),
  ]);
  const counts = new Map(attempts.map((a) => [a.key, a.c]));
  const sims = SIMULATIONS.filter((s) => s.type === "research_critique" || s.type.startsWith("english"));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Research" lead="Research engineering path, the learning-science hypotheses behind IHLS with their evidence levels, the source registry with verification status, and the Technical English lab." />
      <section className="card p-5">
        <h2 className="text-sm font-semibold">Research ladder</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">{["Foundation", "Reproduction", "Ablation", "Extension", "Research question", "Experiment", "Analysis", "Write-up", "Review", "Replication"].map((s, i) => <span key={s} className="badge">{i + 1}. {s}</span>)}</div>
        <p className="mt-2 text-sm text-muted">Start with <Link href="/learn/research-engineering" className="text-accent underline">Research Engineering</Link>, then the <Link href="/projects" className="text-accent underline">Research Reproduction project</Link>.</p>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="text-sm font-semibold">IHLS research hypotheses (not established facts)</h2>
        <ul className="mt-2 space-y-2 text-sm">{HYPOTHESES.map((h) => <li key={h.id}><span className="font-medium">{h.id}.</span> {h.text}<div className="text-xs text-muted">Evidence level: {h.evidence}</div></li>)}</ul>
        <h3 className="mt-4 text-sm font-semibold">Evidence levels used by this system</h3>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">{EVIDENCE_LEVELS.map((e) => <div key={e.k} className="rounded-md border border-border p-3 text-xs"><div className="font-semibold">{e.k}</div><ul className="mt-1 list-disc pl-4 text-muted">{e.items.map((i) => <li key={i}>{i}</li>)}</ul></div>)}</div>
        <p className="mt-3 text-xs text-muted">Learning Effectiveness Lab: this account's immediate vs delayed vs transfer performance is computed from your recorded attempts only (see Dashboard). No cohort statistics are shown because no cohort data exists.</p>
      </section>

      <h2 className="mt-8 mb-2 text-sm font-semibold">Technical English lab & research critique</h2>
      <ul className="space-y-2">{sims.map((s) => <SimulationCard key={s.key} sim={s} attempts={counts.get(s.key) ?? 0} />)}</ul>

      <section className="card mt-6 p-5">
        <h2 className="text-sm font-semibold">Technical vocabulary ({terms.length})</h2>
        <p className="text-xs text-muted">Standard Technical English terms with a B1–B2 gloss, Arabic meaning and an example. These appear as hover glosses in lessons when Vocabulary Assistance is on. Vocabulary count is never used to assign a CEFR level.</p>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">{terms.map((t) => <div key={t.term} className="rounded-md border border-border p-2 text-xs"><dt className="font-semibold">{t.term} <span className="font-normal text-muted">· {t.arabic}</span></dt><dd className="text-muted">{t.simpleDefinition}<div className="mt-0.5 italic">“{t.example}”</div></dd></div>)}</dl>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="text-sm font-semibold">Source registry ({srcs.length})</h2>
        <p className="text-xs text-muted">Every external claim in this system traces to one of these records. “Likely — not verified” means the URL was listed but not retrieved during the build session; nothing from such a source is presented as fact.</p>
        <ul className="mt-2 space-y-1.5 text-xs">{srcs.map((s) => <li key={s.id} className="border-t border-border pt-1.5"><a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-accent underline">{s.title}</a> — {s.publisher} · {s.sourceType} <StatusBadge s={s.verificationStatus} />{s.accessedAt && <span className="text-muted"> · retrieved {s.accessedAt.toISOString().slice(0, 10)}</span>}<div className="text-muted">{s.notes}</div></li>)}</ul>
      </section>
    </div>
  );
}
