import { MentorPanel } from "@/components/mentor-panel";

export const dynamic = "force-dynamic";

export default function MentorPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Mentor</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-2xl">
          Your Lead Mentor with a council of specialists. The mentor follows IHLS principles: active learning,
          attempt-first, smallest useful hint, no substitution for your thinking. Switch specialists using the menu
          inside the panel.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <div className="space-y-3 text-sm">
          <InfoBox title="Lead Mentor" body="General coaching, curriculum navigation, conceptual explanations." />
          <InfoBox title="Socratic Tutor" body="Guides you through problems using questions rather than answers." />
          <InfoBox title="Code Reviewer" body="Reviews your code for correctness, clarity, and engineering quality." />
          <InfoBox title="Examiner" body="Asks questions without hints. Delivers grades with rubric-based feedback." />
          <InfoBox title="Project Supervisor" body="Scope, architecture, deliverables, and evidence critique." />
          <InfoBox title="Career Analyst" body="Maps evidence to real roles. Flags gaps. No false employment promises." />
          <InfoBox title="Study Coach" body="Adapts to your current state: deep, drift, fog, overload." />
          <InfoBox title="English Coach" body="Keeps technical vocabulary but can simplify wording; trains professional communication." />
          <InfoBox title="Research Specialist" body="Paper reading, experimental design, validity threats, scientific writing." />
        </div>
        <div className="h-[75vh] min-h-[600px]">
          <MentorPanel />
        </div>
      </div>
    </div>
  );
}

function InfoBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg p-3">
      <div className="font-semibold text-[13px] mb-0.5">{title}</div>
      <div className="text-[12px] text-[rgb(var(--text-muted))] leading-relaxed">{body}</div>
    </div>
  );
}
