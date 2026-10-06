import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { aiThreads, curriculumNodes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { MentorPanel } from "@/components/MentorPanel";

export default async function MentorPage() {
  const user = await requireUser();
  const threads = await db.select({ id: aiThreads.id, title: aiThreads.title, nodeId: aiThreads.nodeId, createdAt: aiThreads.createdAt, nodeTitle: curriculumNodes.title }).from(aiThreads).leftJoin(curriculumNodes, eq(curriculumNodes.id, aiThreads.nodeId)).where(eq(aiThreads.ownerId, user.id)).orderBy(desc(aiThreads.createdAt)).limit(20);
  const configured = Boolean(process.env.PUTER_AUTH_TOKEN);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="AI Mentor" lead="Lead Mentor routes each request to a specialist (Socratic Tutor, Examiner, English Coach, Project Supervisor, Study Coach…). Deep reasoning uses the Pro model; quick hints use Flash. Lesson-specific conversations live inside each lesson." />
      {!configured && <p className="mb-4 rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">The AI provider is not configured on this deployment (PUTER_AUTH_TOKEN is missing). Requests will return a truthful failure. Lessons, practice, review, projects, skills and career analysis do not depend on it.</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <MentorPanel />
        <aside className="card p-4">
          <h2 className="text-sm font-semibold">Recent conversations</h2>
          {threads.length === 0 ? <p className="mt-1 text-xs text-muted">None yet.</p> : <ul className="mt-2 space-y-1.5 text-xs">{threads.map((t) => <li key={t.id}>{t.nodeId ? <Link href={`/learn/${t.nodeId}`} className="text-accent underline">{t.nodeTitle ?? t.title}</Link> : <span>{t.title}</span>}<div className="text-muted">{t.createdAt.toLocaleString()}</div></li>)}</ul>}
          <h3 className="mt-4 text-xs font-semibold">Guardrails in force</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted"><li>Attempt-first by default; full lectures on explicit request</li><li>No repeated reassurance without new evidence</li><li>Dependency detector switches to explain-back / prediction tasks</li><li>Retrieved text is data, never instructions</li><li>No medical or psychological diagnosis</li></ul>
        </aside>
      </div>
    </div>
  );
}
