import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectsCatalog } from "@/db/schema";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
const safeUrl = z.string().url().max(2048).refine((value) => {
  try { const protocol = new URL(value).protocol; return protocol === "https:" || protocol === "http:"; } catch { return false; }
});
const createInput = z.object({
  catalogId: z.string().min(1).max(120),
  repositoryUrl: safeUrl.optional(),
  demoUrl: safeUrl.optional(),
}).strict();

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  await ensureCurriculumSeeded();
  const catalog = await db.select().from(projectsCatalog).orderBy(asc(projectsCatalog.ladderLevel), asc(projectsCatalog.title));
  const ownProjects = await db.select({
    id: projects.id, catalogId: projects.catalogId, title: projects.title, status: projects.status,
    repositoryUrl: projects.repositoryUrl, demoUrl: projects.demoUrl, reportUrl: projects.reportUrl,
    problem: projects.problem, architecture: projects.architecture, limitations: projects.limitations,
    updatedAt: projects.updatedAt,
  }).from(projects).where(eq(projects.ownerId, actor.id)).orderBy(asc(projects.updatedAt));
  return Response.json({ catalog, projects: ownProjects });
}

export async function POST(request: Request) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  await ensureCurriculumSeeded();
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = createInput.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  const [catalog] = await db.select().from(projectsCatalog).where(eq(projectsCatalog.id, parsed.data.catalogId)).limit(1);
  if (!catalog) return Response.json({ error: "project_idea_not_found" }, { status: 404 });
  const [project] = await db.insert(projects).values({
    id: randomUUID(), ownerId: actor.id, catalogId: catalog.id, title: catalog.title, status: "planned",
    repositoryUrl: parsed.data.repositoryUrl ?? null, demoUrl: parsed.data.demoUrl ?? null,
  }).returning({ id: projects.id, title: projects.title, status: projects.status, catalogId: projects.catalogId });
  return Response.json({ project }, { status: 201 });
}
