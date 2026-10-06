import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { projects, projectsCatalog, projectEvidence } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  const owned = await db.select({ id: projects.id, title: projects.title, catalogId: projects.catalogId, repositoryUrl: projects.repositoryUrl, demoUrl: projects.demoUrl, reportUrl: projects.reportUrl, status: projects.status })
    .from(projects).where(and(eq(projects.ownerId, actor.id), inArray(projects.status, ["completed", "deployed", "reviewed"])));
  const rows = await Promise.all(owned.map(async (project) => {
    const evidence = await db.select({ id: projectEvidence.id, evidenceType: projectEvidence.evidenceType, label: projectEvidence.label, url: projectEvidence.url })
      .from(projectEvidence).where(and(eq(projectEvidence.ownerId, actor.id), eq(projectEvidence.projectId, project.id)));
    return { ...project, evidence, eligible: evidence.length > 0 || Boolean(project.repositoryUrl || project.demoUrl || project.reportUrl) };
  }));
  const catalog = await db.select({ id: projectsCatalog.id, title: projectsCatalog.title }).from(projectsCatalog);
  return Response.json({ candidates: rows, catalogIdeasNotCompleted: catalog.length });
}
