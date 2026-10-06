import { randomUUID } from "node:crypto";
import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { portfolioItems, projectEvidence, projects } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const portfolioInput = z.object({
  projectId: z.string().uuid(),
  artifactClass: z.enum(["practice_only", "skill_evidence", "technical_artifact", "portfolio_project", "professional_evidence", "signature_project"]),
  summary: z.string().trim().min(20).max(1200),
  publicUrl: z.string().url().max(2048).refine((value) => ["https:", "http:"].includes(new URL(value).protocol)).optional(),
}).strict();

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  const items = await db.select({
    id: portfolioItems.id, artifactClass: portfolioItems.artifactClass, summary: portfolioItems.summary, publicUrl: portfolioItems.publicUrl,
    verificationStatus: portfolioItems.verificationStatus, projectTitle: projects.title, projectStatus: projects.status,
    repositoryUrl: projects.repositoryUrl, demoUrl: projects.demoUrl,
  }).from(portfolioItems).innerJoin(projects, and(eq(portfolioItems.projectId, projects.id), eq(projects.ownerId, actor.id)))
    .where(eq(portfolioItems.ownerId, actor.id));
  const evidence = await db.select({ projectId: projectEvidence.projectId, evidenceType: projectEvidence.evidenceType, label: projectEvidence.label, url: projectEvidence.url })
    .from(projectEvidence).where(eq(projectEvidence.ownerId, actor.id));
  return Response.json({ items, evidence, empty: items.length === 0, message: items.length === 0 ? "No portfolio artifacts have been added yet. Project ideas are not presented as completed work." : null });
}

export async function POST(request: Request) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = portfolioInput.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  const [project] = await db.select({ id: projects.id, repositoryUrl: projects.repositoryUrl, demoUrl: projects.demoUrl, reportUrl: projects.reportUrl })
    .from(projects).where(and(eq(projects.id, parsed.data.projectId), eq(projects.ownerId, actor.id))).limit(1);
  if (!project) return Response.json({ error: "project_not_found" }, { status: 404 });
  const links = await db.select({ url: projectEvidence.url }).from(projectEvidence)
    .where(and(eq(projectEvidence.ownerId, actor.id), eq(projectEvidence.projectId, project.id), isNotNull(projectEvidence.url)));
  const allowedUrls = new Set([project.repositoryUrl, project.demoUrl, project.reportUrl, ...links.map((link) => link.url)].filter((url): url is string => Boolean(url)));
  const publicUrl = parsed.data.publicUrl ?? [...allowedUrls][0];
  if (!publicUrl || !allowedUrls.has(publicUrl)) {
    return Response.json({ error: "linked_artifact_required", message: "Attach an actual repository, report or demo URL to this project before adding a portfolio record." }, { status: 422 });
  }
  const [item] = await db.insert(portfolioItems).values({
    id: randomUUID(), ownerId: actor.id, projectId: project.id, artifactClass: parsed.data.artifactClass,
    summary: parsed.data.summary, publicUrl, verificationStatus: "student_submitted_unverified",
  }).returning({ id: portfolioItems.id, artifactClass: portfolioItems.artifactClass, summary: portfolioItems.summary, publicUrl: portfolioItems.publicUrl, verificationStatus: portfolioItems.verificationStatus });
  return Response.json({ item, note: "This artifact is student-submitted and has not been independently verified." }, { status: 201 });
}
