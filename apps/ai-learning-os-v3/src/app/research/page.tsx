import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, projects } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { PageHeader, Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

const HYPOTHESES = [
  ["H1", "State-adaptive delivery may outperform a fixed study protocol on long-term retention and sustainability.", "Compare delayed retention and session persistence between adaptive and fixed task sizing."],
  ["H2", "Adaptive task size and scaffolding may reduce overload without reducing transfer.", "Measure transfer scores and abandonment rate across the four study states."],
  ["H3", "Retrieval plus transfer plus case application may improve transfer beyond retrieval alone.", "Compare transfer-phase scores for nodes practised with and without case items."],
  ["H4", "Requiring an initial attempt before full explanation may increase later independent performance.", "Compare independent score trajectories by help-level history."],
  ["H5", "Externalising executive-function demands may reduce initiation friction.", "Track session starts before and after distraction-capture usage."],
  ["H6", "Guardrails against unnecessary re-checking may reduce unproductive verification without reducing legitimate accuracy checks.", "Count repeated identical mentor questions and subsequent error rates."],
];

const EVIDENCE_LEVELS = [
  ["Strong", "Practice testing and distributed practice as high-utility techniques (Dunlosky et al. 2013; Cepeda et al. 2006).", "tag-ok"],
  ["Moderate", "Interleaving benefits for category/skill discrimination; worked-example fading for novices.", "tag"],
  ["Emerging", "AI tutoring effects on independent performance in self-study settings.", "tag-warn"],
  ["Speculative", "The specific IHLS state-adaptive composition as implemented here.", "tag-warn"],
];

export default async function ResearchPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const [course, researchProjects] = await Promise.all([
    db.select().from(courses).where(eq(courses.id, "research-engineering")).limit(1),
    db.select().from(projects).where(eq(projects.track, "Research")),
  ]);

  return (
    <Shell user={user} active="/research">
      <PageHeader
        title="Research engineering"
        lead="The path from consuming claims to testing them: read, reproduce, ablate, extend. The learning system itself is also treated as a research object — its novel components are labelled as hypotheses, not findings."
      />

      <section className="surface p-4">
        <h2 className="text-sm font-medium">Reproduction protocol</h2>
        <ol className="mt-2 space-y-1.5 text-[13px] muted list-decimal pl-4">
          <li>Extract the paper&apos;s falsifiable claim in one sentence.</li>
          <li>Identify the baseline it must beat and the metric it uses.</li>
          <li>Pin environment: seeds, dependency versions, hardware, dataset version.</li>
          <li>Reproduce the headline number and report the gap honestly.</li>
          <li>Design one ablation with a stated prediction before running it.</li>
          <li>Separate quantitative result from interpretation in the write-up.</li>
          <li>Publish what did not replicate — that section is the credibility of the report.</li>
        </ol>
      </section>

      {course[0] ? (
        <section className="surface p-4 mt-5">
          <h2 className="text-sm font-medium">{course[0].title}</h2>
          <p className="muted text-xs mt-1.5 leading-relaxed">{course[0].summary}</p>
          <Link href={`/curriculum/${course[0].id}`} className="btn mt-3">
            Open the course node
          </Link>
        </section>
      ) : null}

      <section className="mt-5">
        <h2 className="text-sm font-semibold mb-2">Research-track projects</h2>
        <ul className="space-y-2">
          {researchProjects.map((p) => (
            <li key={p.id} className="surface p-3.5">
              <p className="text-[13px] font-medium">
                L{p.ladderLevel} · {p.title}
              </p>
              <p className="muted text-xs mt-1.5 leading-relaxed">{p.problem}</p>
              <Link href="/projects" className="text-xs underline underline-offset-2 mt-2 inline-block">
                Open in projects
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Evidence levels used by this system</h2>
        <ul className="space-y-2">
          {EVIDENCE_LEVELS.map(([level, claim, tone]) => (
            <li key={level} className="surface p-3 flex flex-wrap gap-2 items-start">
              <span className={tone}>{level}</span>
              <span className="text-[13px] muted flex-1 min-w-[16rem] leading-relaxed">{claim}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Open hypotheses about this learning system</h2>
        <p className="muted text-xs mb-3 leading-relaxed">
          These are hypotheses, not proven facts, and this product does not claim to be the best learning
          method in the world. Each needs a design with comparison conditions, delayed testing and
          replication before any claim is made.
        </p>
        <ul className="space-y-2">
          {HYPOTHESES.map(([id, statement, test]) => (
            <li key={id} className="surface p-3.5">
              <p className="text-[13px]">
                <span className="tag mr-2">{id}</span>
                {statement}
              </p>
              <p className="muted text-[11px] mt-1.5">Proposed test: {test}</p>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
