import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projectEvidence, projects } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
const evidenceInput = z.object({
  evidenceType: z.enum(["repository", "commit", "pull_request", "deployment", "report", "test_report", "presentation"]),
  label: z.string().trim().min(2).max(120),
  url: z.string().url().max(2048).refine((value) => ["https:", "http:"].includes(new URL(value).protocol)).optional(),
  notes: z.string().max(2000).default(""),
}).strict();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const [owned] = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, id), eq(projects.ownerId, actor.id))).limit(1);
  if (!owned) return Response.json({ error: "not_found" }, { status: 404 });
  const evidence = await db.select().from(projectEvidence).where(and(eq(projectEvidence.projectId, id), eq(projectEvidence.ownerId, actor.id)));
  return Response.json({ evidence });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const [owned] = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, id), eq(projects.ownerId, actor.id))).limit(1);
  if (!owned) return Response.json({ error: "not_found" }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = evidenceInput.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  const [evidence] = await db.insert(projectEvidence).values({
    id: randomUUID(), ownerId: actor.id, projectId: id, evidenceType: parsed.data.evidenceType,
    label: parsed.data.label, url: parsed.data.url ?? null, notes: parsed.data.notes,
  }).returning();
  return Response.json({ evidence }, { status: 201 });
}
