import { Microscope, FileText, FlaskConical, GitBranch } from "lucide-react";

export const dynamic = "force-dynamic";

const PHASES = [
  { step: 1, title: "Foundation", body: "Learn the field. Work through core courses and papers." },
  { step: 2, title: "Reproduction", body: "Reproduce a known result from a paper before trying to extend it." },
  { step: 3, title: "Ablation", body: "Change one component and measure the impact. Isolate contributions." },
  { step: 4, title: "Extension", body: "Improve or modify the method with a clear hypothesis." },
  { step: 5, title: "Research Question", body: "Formulate a falsifiable question worth answering." },
  { step: 6, title: "Experiment", body: "Design controlled experiments with baselines." },
  { step: 7, title: "Analysis", body: "Quantitative + qualitative analysis. Subgroup analysis. Failure analysis." },
  { step: 8, title: "Write-up", body: "Scientific report: problem, related work, method, experiments, limitations." },
  { step: 9, title: "Review", body: "Open yourself to critique from the AI mentor and eventually humans." },
  { step: 10, title: "Replication", body: "Can another person reproduce it from your repository and description?" },
];

export default function ResearchPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Research Engineering</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-2xl">
          The research path trains you to read, reproduce, ablate, extend, and eventually produce scientific work —
          with the same rigor demanded by real publication.
        </p>
      </div>

      <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-5 w-5 text-violet-600" />
          <h2 className="font-semibold">Research ladder</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PHASES.map((p) => (
            <div key={p.step} className="flex gap-3 p-3 rounded-lg border border-[rgb(var(--border))]">
              <div className="h-7 w-7 shrink-0 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center text-sm font-bold">
                {p.step}
              </div>
              <div>
                <div className="font-semibold text-sm">{p.title}</div>
                <div className="text-xs text-[rgb(var(--text-muted))] leading-relaxed mt-0.5">{p.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card icon={<FileText className="h-5 w-5 text-navy-600" />} title="Paper reading protocol" body="Claim identification, methodology, evidence, limitations, and what you need to reproduce it." />
        <Card icon={<FlaskConical className="h-5 w-5 text-emerald-600" />} title="Experimental design" body="Threats to validity, baselines, ablations, statistical reasoning, reproducibility." />
      </div>
    </div>
  );
}

function Card({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed">{body}</p>
    </div>
  );
}
