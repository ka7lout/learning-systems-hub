import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { ArrowRight, CircleAlert, Clock } from "lucide-react";
import { db } from "@/db";
import { attempts, laterItems, masteryRecords, reviewItems, userProjects } from "@/db/schema";
import { getUser } from "@/lib/auth";
import {
  dependencyProfile,
  errorProfile,
  LEARNING_STATES,
  nextBestTasks,
  type LearningState,
} from "@/lib/learning";
import { PageHeader, Shell } from "@/components/shell";
import { LaterCapture } from "@/components/ui";
import { ResolveLaterButton } from "@/components/later-list";

export const dynamic = "force-dynamic";

const ERROR_LABELS: Record<string, string> = {
  concept: "Concept not understood",
  recall: "Known but forgotten",
  selection: "Wrong tool chosen",
  execution: "Right plan, wrong execution",
  transfer: "Worked on the taught form, failed on a new one",
  attention: "Attention slipped",
  load: "Task larger than current capacity",
  none: "No error recorded",
};

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const store = await cookies();
  const state = (store.get("ihls_state")?.value ?? "deep") as LearningState;
  const stateInfo = LEARNING_STATES.find((s) => s.id === state)!;

  const [tasks, dep, errors, dueCount, attemptStats, parked, activeProjects, mastered] = await Promise.all([
    nextBestTasks(user.id, state),
    dependencyProfile(user.id),
    errorProfile(user.id),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(reviewItems)
      .where(and(eq(reviewItems.userId, user.id), lte(reviewItems.dueAt, new Date()))),
    db.select({ n: sql<number>`count(*)::int` }).from(attempts).where(eq(attempts.userId, user.id)),
    db
      .select()
      .from(laterItems)
      .where(and(eq(laterItems.userId, user.id), eq(laterItems.resolved, false)))
      .orderBy(desc(laterItems.createdAt))
      .limit(5),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(userProjects)
      .where(and(eq(userProjects.userId, user.id), eq(userProjects.status, "in_progress"))),
    db
      .select()
      .from(masteryRecords)
      .where(and(eq(masteryRecords.userId, user.id), eq(masteryRecords.nodeType, "lesson")))
      .orderBy(desc(masteryRecords.level))
      .limit(5),
  ]);

  const totalAttempts = attemptStats[0]?.n ?? 0;

  return (
    <Shell user={user} active="/dashboard">
      <PageHeader
        title={`What should you do now, ${user.name.split(" ")[0]}?`}
        lead={stateInfo.guidance}
      />

      <section className="space-y-2.5">
        {tasks.map((t) => (
          <Link key={t.href + t.title} href={t.href} className="surface p-4 flex items-start gap-3 group">
            <span className="tag tag-accent mt-0.5">{t.kind}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium">{t.title}</span>
              <span className="block text-xs muted mt-1 leading-relaxed">
                <strong className="font-medium">Why this task: </strong>
                {t.reason}
              </span>
            </span>
            <ArrowRight size={15} className="muted mt-1 shrink-0" aria-hidden />
          </Link>
        ))}
        {tasks.length === 0 ? (
          <div className="surface p-5">
            <p className="text-sm">No task could be justified right now.</p>
            <p className="muted text-xs mt-1.5">
              The engine only produces a task when it builds knowledge, verifies mastery, trains transfer,
              creates evidence or closes a career gap. Open the{" "}
              <Link href="/curriculum" className="underline">
                curriculum
              </Link>{" "}
              to choose a node yourself.
            </p>
          </div>
        ) : null}
      </section>

      <section className="grid sm:grid-cols-3 gap-3 mt-7">
        {[
          ["Reviews due now", dueCount[0]?.n ?? 0, "/review"],
          ["Recorded attempts", totalAttempts, "/skills"],
          ["Projects in progress", activeProjects[0]?.n ?? 0, "/projects"],
        ].map(([label, value, href]) => (
          <Link key={label as string} href={href as string} className="surface px-4 py-3">
            <p className="text-[11px] muted">{label as string}</p>
            <p className="text-xl font-semibold tabular-nums mt-0.5">{value as number}</p>
          </Link>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-5 mt-7">
        <div className="surface p-4">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <CircleAlert size={15} aria-hidden /> AI dependency audit
          </h2>
          {totalAttempts === 0 ? (
            <p className="muted text-xs mt-2 leading-relaxed">
              No attempts recorded yet. This panel compares your assisted performance with your independent
              performance; it stays empty until there is real data.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5 text-xs">
              <Row
                label="Independent attempts"
                value={`${dep?.independent ?? 0} of ${dep?.total ?? 0}`}
                ratio={(dep?.total ?? 0) > 0 ? (dep?.independent ?? 0) / (dep?.total ?? 1) : 0}
              />
              <Row
                label="Independent mean score"
                value={(dep?.independentAvg ?? 0).toFixed(2)}
                ratio={dep?.independentAvg ?? 0}
              />
              <Row
                label="Assisted mean score"
                value={(dep?.assistedAvg ?? 0).toFixed(2)}
                ratio={dep?.assistedAvg ?? 0}
              />
              <p className="muted leading-relaxed pt-1">
                Professional readiness is judged on independent evidence. Assisted work still counts as
                learning — it just does not count as proof.
              </p>
            </div>
          )}
        </div>

        <div className="surface p-4">
          <h2 className="text-sm font-medium">Error notebook</h2>
          {errors.length === 0 ? (
            <p className="muted text-xs mt-2 leading-relaxed">
              Empty until you classify an error during practice. Errors are data for the plan, not a verdict
              about you.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-xs">
              {errors.map((e) => (
                <li key={e.errorType} className="flex justify-between gap-3">
                  <span>{ERROR_LABELS[e.errorType] ?? e.errorType}</span>
                  <span className="muted tabular-nums">{e.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="surface p-4 mt-5">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Clock size={15} aria-hidden /> Distraction capture
        </h2>
        <p className="muted text-xs mt-1 mb-3 leading-relaxed">
          Externalise the thought instead of fighting it. It is stored here and stops competing for working
          memory.
        </p>
        <LaterCapture />
        {parked.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {parked.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-xs">
                <span>{p.text}</span>
                <ResolveLaterButton id={p.id} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {mastered.length > 0 ? (
        <section className="surface p-4 mt-5">
          <h2 className="text-sm font-medium">Strongest nodes by evidence</h2>
          <ul className="mt-3 space-y-1.5 text-xs">
            {mastered.map((m) => (
              <li key={m.nodeId} className="flex justify-between gap-3">
                <Link href={`/learn/${m.nodeId}`} className="underline underline-offset-2">
                  {m.nodeId}
                </Link>
                <span className="muted">
                  L{m.level} · transfer {m.transfer.toFixed(2)} · independence {m.independence.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Shell>
  );
}

function Row({ label, value, ratio }: { label: string; value: string; ratio: number }) {
  return (
    <div>
      <div className="flex justify-between gap-3">
        <span className="muted">{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="bar mt-1">
        <span style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }} />
      </div>
    </div>
  );
}
