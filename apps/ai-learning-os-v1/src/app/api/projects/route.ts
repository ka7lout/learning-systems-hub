import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { handler, ok, fail, parseBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { userProjects, projectEvidence, projectCatalog, skillEvidence, auditLogs } from "@/db/schema";

const url = z.string().url().max(500).or(z.literal("")).optional();

const schema = z.discriminatedUnion("intent", [
  z.object({ intent: z.literal("create"), catalogId: z.string().min(1).max(200) }),
  z.object({
    intent: z.literal("update"),
    id: z.string().uuid(),
    status: z.enum(["planned", "in_progress", "in_review", "done"]).optional(),
    repoUrl: url, codespaceUrl: url, colabUrl: url, kaggleUrl: url, datasetUrl: url, deploymentUrl: url, reportUrl: url,
    datasetLicense: z.string().max(200).optional(),
    notes: z.string().max(5000).optional(),
    checklist: z.record(z.string(), z.boolean()).optional(),
  }),
  z.object({
    intent: z.literal("evidence"),
    id: z.string().uuid(),
    kind: z.enum(["commit", "pull_request", "deployment", "report", "metric", "demo", "test_run", "model_card"]),
    url: z.string().url().max(500).optional(),
    description: z.string().min(3).max(2000),
    evidenceClass: z.enum(["practice_only", "skill_evidence", "technical_artifact", "portfolio_project", "professional_evidence", "signature_project"]).default("skill_evidence"),
  }),
]);

export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await parseBody(req, schema);

  if (body.intent === "create") {
    const [cat] = await db.select().from(projectCatalog).where(eq(projectCatalog.id, body.catalogId)).limit(1);
    if (!cat) return fail("Project not found", 404, "not_found");
    const [p] = await db.insert(userProjects).values({ ownerId: user.id, catalogId: cat.id }).returning();
    return ok({ id: p.id });
  }

  // Ownership-scoped lookup: a project that belongs to another student is indistinguishable from a missing one.
  const [proj] = await db.select().from(userProjects).where(and(eq(userProjects.id, body.id), eq(userProjects.ownerId, user.id))).limit(1);
  if (!proj) return fail("Project not found", 404, "not_found");

  if (body.intent === "update") {
    const { intent: _i, id: _id, ...rest } = body;
    void _i; void _id;
    const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined).map(([k, v]) => [k, v === "" ? null : v]));
    await db.update(userProjects).set({ ...clean, updatedAt: new Date() }).where(and(eq(userProjects.id, proj.id), eq(userProjects.ownerId, user.id)));
    return ok({ updated: true });
  }

  const [ev] = await db.insert(projectEvidence).values({ ownerId: user.id, userProjectId: proj.id, kind: body.kind, url: body.url ?? null, description: body.description, evidenceClass: body.evidenceClass }).returning();
  const [cat] = await db.select().from(projectCatalog).where(eq(projectCatalog.id, proj.catalogId)).limit(1);
  const strength = body.evidenceClass === "practice_only" ? 1 : ["deployment", "pull_request", "test_run"].includes(body.kind) ? 3 : 2;
  if (cat && body.evidenceClass !== "practice_only") {
    await db.insert(skillEvidence).values(cat.skillIds.map((s) => ({ ownerId: user.id, skillId: s, sourceType: body.kind === "deployment" ? "deployed_artifact" : "project", refId: ev.id, strength, independent: true, note: `${cat.title}: ${body.kind}` })));
  }
  await db.insert(auditLogs).values({ userId: user.id, action: "project.evidence_added", meta: { projectId: proj.id, kind: body.kind } });
  return ok({ id: ev.id });
});
