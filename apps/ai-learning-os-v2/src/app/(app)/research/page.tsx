import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageHeader, Section, Status } from "@/components/ui";

const PATH = ["Foundation — learn the field", "Reproduction — reproduce a known result", "Ablation — change one component and measure", "Extension — modify the method", "Research question — formulate it", "Experiment — control variables", "Analysis — quantitative + qualitative", "Write-up — scientific report", "Review — critique by rubric/others", "Replication — can someone else reproduce it?"];
const HYP = [
  ["H1", "State-adaptive learning may outperform a fixed study protocol on long-term retention and/or sustainability."],
  ["H2", "Adaptive task size and scaffolding may reduce overload and improve persistence without reducing transfer."],
  ["H3", "Retrieval + transfer + case-based application may improve transfer to novel problems beyond retrieval alone."],
  ["H4", "AI tutoring that requires an initial attempt may produce greater independent performance than answer-first assistance."],
  ["H5", "Externalizing executive-function demands may reduce initiation friction among learners with attention/executive difficulties."],
  ["H6", "Guardrails against repeated reassurance may reduce unproductive checking without reducing legitimate accuracy checks."],
];
const EVIDENCE = [
  ["Retrieval practice (practice testing)", "Strong", "Dunlosky et al. 2013; WWC 2007"],
  ["Spaced / distributed practice", "Strong", "Cepeda et al. 2006; Dunlosky et al. 2013"],
  ["Worked examples alternated with problems", "Moderate", "WWC 2007"],
  ["Interleaving of problem types", "Moderate", "Dunlosky et al. 2013 (moderate utility)"],
  ["Learning styles matching", "Not supported", "Not used in this system"],
  ["Deep / Drift / Fog / Overload state adaptation", "Speculative", "IHLS design decision — hypothesis H1/H2"],
];

export default async function Research() {
  await requireUser();
  return (
    <>
      <PageHeader title="Research" lead="Two tracks: your own research engineering path, and the IHLS method itself treated as a set of testable hypotheses — not proven facts." />
      <Section title="Research engineering path"><ol className="card list-decimal space-y-1 p-5 pl-10 text-sm">{PATH.map((p) => <li key={p}>{p}</li>)}</ol><p className="mt-2 text-sm">Start with <Link className="text-accent underline" href="/learn/rx-research">Research Engineering: Reading, Reproduction, Ablation</Link>, then the Level 10 project.</p></Section>
      <Section title="Evidence levels for IHLS components">
        <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs text-muted"><tr><th className="p-3">Component</th><th className="p-3">Evidence</th><th className="p-3">Basis</th></tr></thead><tbody className="divide-y divide-line">{EVIDENCE.map(([a, b, c]) => <tr key={a}><td className="p-3">{a}</td><td className="p-3">{b}</td><td className="p-3 text-muted">{c}</td></tr>)}</tbody></table></div>
      </Section>
      <Section title="IHLS research hypotheses">
        <ul className="space-y-2">{HYP.map(([k, v]) => <li key={k} className="card p-3 text-sm"><strong>{k}</strong> <Status s="research_hypothesis" /><p className="mt-1">{v}</p></li>)}</ul>
        <p className="mt-3 text-xs text-muted">Testing these requires preregistration, comparison conditions, delayed retention and transfer tests, and ethical safeguards. No claim of superiority is made.</p>
      </Section>
    </>
  );
}
