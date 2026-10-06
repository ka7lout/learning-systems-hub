import { UserCircle, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PortfolioPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-2xl">
          Your portfolio is built from verified evidence: completed projects, deployed artifacts, code, reports.
          CV bullets only appear when they trace back to real evidence. The system will not invent impact.
        </p>
      </div>

      <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-10 text-center">
        <UserCircle className="h-10 w-10 text-[rgb(var(--text-subtle))] mx-auto mb-3 opacity-50" />
        <h2 className="font-semibold text-lg mb-1">No verified portfolio items yet</h2>
        <p className="text-sm text-[rgb(var(--text-muted))] max-w-md mx-auto leading-relaxed">
          Complete a project with a GitHub repository, documented evaluation, and a write-up. When you submit it,
          the project supervisor will mark CV eligibility. Your portfolio will fill from real evidence, not course
          completion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoBlock title="Artifact classes" body="Practice Only → Skill Evidence → Technical Artifact → Portfolio Project → Professional Evidence → Signature Project." />
        <InfoBlock title="CV rule" body="Every bullet on your generated CV must map to a repo, commit, deployed system, report, or metric source. No invented impact, no fake numbers." />
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-4">
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed">{body}</p>
    </div>
  );
}
