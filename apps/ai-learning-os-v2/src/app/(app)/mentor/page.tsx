import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { aiMessages } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { PageHeader, Section } from "@/components/ui";
import { MentorPanel } from "@/components/client";

export default async function Mentor() {
  const u = await requireUser();
  const hist = await db.select().from(aiMessages).where(and(eq(aiMessages.ownerId, u.id), isNull(aiMessages.nodeId))).orderBy(desc(aiMessages.createdAt)).limit(10);
  const configured = !!process.env.PUTER_AUTH_TOKEN;
  return (
    <>
      <PageHeader title="AI Mentor" lead="One Lead Mentor routes each request to a specialist (Socratic Tutor, Examiner, Project Supervisor, English Coach, Study Coach, Freelance Coach, Integrity Reviewer). It scaffolds your thinking; it doesn’t replace it." />
      {!configured && <p className="mb-6 rounded-md border border-warn/40 p-3 text-sm text-warn" role="status">The AI provider isn’t configured on this deployment (PUTER_AUTH_TOKEN is missing). Requests will fail truthfully. Curriculum, practice, review, projects and evidence work without it.</p>}
      <div className="card p-5"><MentorPanel nodeId={null} /></div>
      {hist.length > 0 && <Section title="Recent general conversation"><ul className="mt-4 space-y-2">{hist.reverse().map((m) => <li key={m.id} className={`rounded-md p-3 text-sm whitespace-pre-wrap ${m.role === "assistant" ? "bg-sunken" : "border border-line"}`}><div className="text-[11px] uppercase text-muted">{m.role === "assistant" ? m.specialist : "You"}</div>{m.content}</li>)}</ul></Section>}
    </>
  );
}
