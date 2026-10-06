import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/shell";
import { LaterCapture, StateSelector } from "@/components/client";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/ui";
import { requirePage } from "@/lib/page";
import {
  getCurrentState,
  getEvidenceFor,
  getLaterItems,
  getProgressFor,
  getUserProjects,
} from "@/lib/data";
import { STATE_PLAYBOOK, dependencyAudit, dueReviewCount, nextBestTasks, recentAttempts, type LearningState } from "@/lib/engine";
import { ALL_LESSONS } from "@/db/seed";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requirePage();
  const state = await getCurrentState(user.id);
  const currentState = (state?.state ?? "deep") as LearningState;

  const [tasks, due, progress, attempts, projects, evidence, later, audit] = await Promise.all([
    nextBestTasks(user.id, currentState),
    dueReviewCount(user.id),
    getProgressFor(user.id),
    recentAttempts(user.id, 6),
    getUserProjects(user.id),
    getEvidenceFor(user.id),
    getLaterItems(user.id),
    dependencyAudit(user.id),
  ]);

  const demonstrated = progress.filter((p) => p.status === "demonstrated").length;
  const playbook = STATE_PLAYBOOK[currentState];

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Dashboard"
        title={`What should you do now, ${user.name.split(" ")[0]}?`}
        description="Recommendations are produced from your real attempt history, due retrieval schedule, project state and selected target role. Nothing here is simulated."
      />

      <Card className="mb-6 p-5">
        <h2 className="text-sm font-semibold text-ink">How does studying feel right now?</h2>
        <p className="mb-3 mt-1 text-xs text-muted">
          This changes task size and scaffolding only. It is not a diagnosis of anything.
        </p>
        <StateSelector current={currentState} />
        <p className="mt-3 rounded-md border border-line bg-surfacemuted p-3 text-sm leading-relaxed text-ink">
          <span className="font-medium">{playbook.label}:</span> {playbook.guidance}
        </p>
      </Card>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Next best actions</h2>
        {tasks.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Open the curriculum and start the first lesson. Recommendations appear once there is real history to reason about."
            actionHref="/curriculum"
            actionLabel="Open the curriculum"
          />
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <Card as="li" key={`${task.kind}-${task.title}`} className="p-4">
                <Link href={task.href} className="group flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Badge tone="accent">{task.kind}</Badge>
                      <span className="text-xs text-muted">{task.estimatedMinutes} min</span>
                    </div>
                    <p className="text-sm font-medium text-ink">{task.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">Why this: {task.reason}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted group-hover:text-ink" aria-hidden />
                </Link>
              </Card>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Retrieval due" value={String(due)} hint="Items whose scheduled recall date has passed" />
        <Stat
          label="Lessons demonstrated"
          value={`${demonstrated}/${ALL_LESSONS.length}`}
          hint="Demonstrated = recall and transfer evidence, not pages viewed"
        />
        <Stat label="Projects started" value={String(projects.length)} hint={`${evidence.length} evidence artifacts recorded`} />
        <Stat
          label="Independent attempts"
          value={audit.total === 0 ? "—" : `${audit.independent}/${audit.total}`}
          hint={
            audit.independentPassRate === null
              ? "No independent attempts recorded yet"
              : `${Math.round(audit.independentPassRate * 100)}% pass rate without substantial help`
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Recent attempts</h2>
          {attempts.length === 0 ? (
            <p className="text-sm text-muted">No attempts recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {attempts.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 border-b border-line pb-2 last:border-0">
                  <div>
                    <p className="text-ink">{a.lessonTitle}</p>
                    <p className="text-xs text-muted">
                      {a.outcome}
                      {a.errorClass ? ` · ${a.errorClass} error` : ""} · help: {a.helpLevel.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Badge tone={a.outcome === "correct" ? "good" : a.outcome === "partial" ? "warn" : "bad"}>
                    {a.independent ? "independent" : "assisted"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-ink">Later</h2>
          <p className="mb-3 text-xs text-muted">
            Park the distraction externally instead of arguing with it, then return to the task.
          </p>
          <LaterCapture items={later} />
        </Card>
      </div>
    </AppShell>
  );
}
