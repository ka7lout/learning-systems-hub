import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { requireUser, getUserSettings } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, SectionTitle, Badge, EmptyState } from "@/components/ui";
import {
  getNextTask,
  getDueReviewCount,
  getActiveProjects,
  getRoleGap,
  getProgressMap,
} from "@/lib/learner";
import { db } from "@/db";
import { laterItems } from "@/db/schema";
import { addLaterAction, toggleLaterAction } from "@/app/actions";
import { MODULES } from "@/content/curriculum";

export default async function DashboardPage() {
  const user = await requireUser();
  const settings = await getUserSettings(user.id);
  const [nextTask, dueCount, projects, progress] = await Promise.all([
    getNextTask(user.id),
    getDueReviewCount(user.id),
    getActiveProjects(user.id),
    getProgressMap(user.id),
  ]);
  const { role, entries } = await getRoleGap(
    user.id,
    settings?.targetRole ?? "nuwave-production-ai-engineer"
  );
  const later = await db
    .select()
    .from(laterItems)
    .where(and(eq(laterItems.userId, user.id), eq(laterItems.done, false)))
    .limit(8);

  const hardGaps = entries.filter((e) => e.kind === "hard" && e.status === "missing");
  const active = projects.filter((p) => p.status === "active" || p.status === "submitted");
  const practiced = [...progress.values()].filter((p) => p.practiceCompletedAt).length;
  const transferred = [...progress.values()].filter((p) => p.transferCompletedAt).length;
  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <PageShell path="/dashboard">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">What should I do now?</h1>
      <p className="mt-1 text-[14px] text-ink-soft">
        One next best action, chosen from your real state — reviews due, prerequisite path, and evidence gaps.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Next best task */}
        <Card className="lg:col-span-2 border-l-4 border-l-accent">
          <div className="flex items-center gap-2">
            <Badge tone="navy">{nextTask.kind === "review" ? "Due review" : nextTask.kind === "learn" ? "Learn" : nextTask.kind === "transfer" ? "Transfer" : "Project"}</Badge>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-ink">{nextTask.title}</h2>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            <span className="font-medium text-ink">Why this task:</span> {nextTask.why}
          </p>
          <Link
            href={nextTask.href}
            className="mt-4 inline-block rounded-lg bg-navy px-4 py-2 text-[13.5px] font-medium text-white hover:bg-navy-deep"
          >
            Go →
          </Link>
        </Card>

        {/* Honest status numbers from real events only */}
        <Card>
          <SectionTitle sub="Computed only from your recorded work.">Your real state</SectionTitle>
          <ul className="space-y-2 text-[13.5px] text-ink-soft">
            <li className="flex justify-between">
              <span>Recall checkpoints passed</span>
              <span className="font-semibold text-ink">{practiced} / {totalLessons}</span>
            </li>
            <li className="flex justify-between">
              <span>Transfer tasks demonstrated</span>
              <span className="font-semibold text-ink">{transferred} / {totalLessons}</span>
            </li>
            <li className="flex justify-between">
              <span>Reviews due now</span>
              <span className="font-semibold text-ink">{dueCount}</span>
            </li>
            <li className="flex justify-between">
              <span>Active projects</span>
              <span className="font-semibold text-ink">{active.length}</span>
            </li>
            <li className="flex justify-between">
              <span>Hard-requirement gaps ({role.title.split("·")[0].trim()})</span>
              <span className="font-semibold text-ink">{hardGaps.length}</span>
            </li>
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Active projects */}
        <Card>
          <SectionTitle sub="Projects convert knowledge into portfolio evidence.">Active projects</SectionTitle>
          {active.length === 0 ? (
            <EmptyState
              title="No active project yet"
              body="Pick a project from the 10-level ladder when your current module's checkpoints are done. Nothing is pre-filled here — this list reflects only what you actually start."
            />
          ) : (
            <ul className="space-y-2">
              {active.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.projectSlug}`}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 hover:border-ink-faint"
                  >
                    <span className="text-[14px] font-medium text-ink">{p.spec?.title ?? p.projectSlug}</span>
                    <Badge tone={p.status === "submitted" ? "warn" : "navy"}>{p.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Distraction capture */}
        <Card>
          <SectionTitle sub="A thought pulling you away? Park it here and return to the task. Review the list after your session.">
            Later — distraction capture
          </SectionTitle>
          <form action={addLaterAction} className="flex gap-2">
            <label htmlFor="later-text" className="sr-only">
              Capture a distraction
            </label>
            <input
              id="later-text"
              name="text"
              required
              maxLength={500}
              placeholder="e.g., check that video about transformers"
              className="w-full rounded-lg border border-line px-3 py-2 text-[13.5px]"
            />
            <button className="shrink-0 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink hover:border-ink-faint">
              Park it
            </button>
          </form>
          {later.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {later.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2">
                  <span className="text-[13.5px] text-ink-soft">{item.text}</span>
                  <form action={toggleLaterAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="text-[12.5px] font-medium text-accent hover:underline">Done</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
