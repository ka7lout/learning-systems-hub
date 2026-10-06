import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, getSettings } from "@/lib/auth";
import { nextBestTask, dueReviews, recentErrors, careerReport } from "@/lib/dal";
import { db } from "@/db";
import { userProjects, projectCatalog, laterItems, attempts } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { PageHeader, Section, Empty } from "@/components/ui";
import { StateSelector, LaterCapture } from "@/components/client";
import { STATE_COPY, ERROR_LABELS, sessionAdvice, type StudyState, type ErrorType } from "@/lib/learning";

export default async function Dashboard() {
  const u = await requireUser();
  const { data: s, diagnosticDone } = await getSettings(u.id);
  if (!diagnosticDone) redirect("/diagnostic");
  const [task, revs, errs, active, later, career, recent] = await Promise.all([
    nextBestTask(u.id), dueReviews(u.id), recentErrors(u.id),
    db.select({ id: userProjects.id, title: projectCatalog.title, done: userProjects.milestonesDone, total: projectCatalog.milestones }).from(userProjects).innerJoin(projectCatalog, eq(projectCatalog.id, userProjects.catalogId)).where(and(eq(userProjects.ownerId, u.id), eq(userProjects.status, "active"))).orderBy(desc(userProjects.createdAt)).limit(1),
    db.select().from(laterItems).where(eq(laterItems.ownerId, u.id)).orderBy(desc(laterItems.createdAt)).limit(5),
    careerReport(u.id),
    db.select({ score: attempts.score }).from(attempts).where(eq(attempts.ownerId, u.id)).orderBy(desc(attempts.createdAt)).limit(5),
  ]);
  const due = revs.filter((r) => r.dueAt <= new Date());
  const plans = Object.fromEntries(Object.entries(STATE_COPY).map(([k, v]) => [k, v.plan]));
  const advice = sessionAdvice(recent.map((r) => r.score).reverse(), s.studyState as StudyState);
  const target = career.find((c) => s.targetRoles.includes(c.id));
  const gap = target?.tasks[0];
  const lastErr = errs.find((e) => e.errorType);
  return (
    <>
      <PageHeader title={`What should you do now, ${u.name.split(" ")[0]}?`} />
      <div className="card mb-6 p-5"><StateSelector current={s.studyState} plans={plans} /></div>
      {advice && <p className="mb-6 rounded-md border border-line bg-surface p-3 text-sm" role="status">{advice}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 md:col-span-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Next best task</div>
          {task ? (<>
            <h2 className="mt-1 text-xl font-semibold">{task.kind === "review" ? "Review: " : task.kind === "continue" ? "Continue: " : "Start: "}{task.title}</h2>
            <p className="mt-1 text-sm text-muted">Why this task? {task.reason}</p>
            <Link href={`/learn/${task.nodeId}`} className="btn btn-primary mt-3">Open</Link>
          </>) : <p className="mt-1 text-sm text-muted">Every unit whose prerequisites are ready has been started. Use Review and Projects to deepen evidence.</p>}
        </div>
        <div className="card p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Due review</div>
          {due.length ? <ul className="mt-2 space-y-1 text-sm">{due.slice(0, 4).map((r) => <li key={r.nodeId}><Link className="text-accent hover:underline" href={`/learn/${r.nodeId}#practice`}>{r.title}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted">Nothing due. {revs.length ? `Next: ${revs[0].title} on ${revs[0].dueAt.toLocaleDateString()}.` : "Reviews appear after your first practice attempt."}</p>}
        </div>
        <div className="card p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Active project</div>
          {active[0] ? <><Link href={`/projects/${active[0].id}`} className="mt-1 block font-medium text-accent hover:underline">{active[0].title}</Link><p className="text-sm text-muted">{active[0].done.length} of {active[0].total.length} milestones done</p></> : <p className="mt-2 text-sm text-muted">No active project. <Link href="/projects" className="text-accent underline">Choose one</Link>.</p>}
        </div>
        <div className="card p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Critical skill gap</div>
          {gap ? <p className="mt-2 text-sm">{target!.name} requires <strong>{gap.skill}</strong> — not yet independently demonstrated. <Link className="text-accent underline" href={`/learn/${gap.nodeId}`}>{gap.title}</Link></p> : <p className="mt-2 text-sm text-muted">Set a career target in Settings to see role gaps.</p>}
        </div>
        <div className="card p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Mentor suggestion</div>
          {lastErr ? <p className="mt-2 text-sm">Your last recorded gap was a <strong>{ERROR_LABELS[lastErr.errorType as ErrorType]?.split(" —")[0] ?? lastErr.errorType}</strong> error. <Link className="text-accent underline" href={`/learn/${lastErr.nodeId}`}>Ask the mentor for a targeted problem</Link>.</p> : <p className="mt-2 text-sm text-muted">No errors recorded yet. Errors you log become the mentor’s guide for what to practise.</p>}
        </div>
      </div>
      <Section title="Later" aside={<span className="text-xs text-muted">Externalize distractions so they don’t steal the task</span>}>
        <div className="card p-4"><LaterCapture items={later} /></div>
      </Section>
      {errs.length === 0 && <Empty>Your activity history is empty. Analytics will appear here only from your real attempts.</Empty>}
    </>
  );
}
