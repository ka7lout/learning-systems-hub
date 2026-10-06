import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, projectCatalog, projectEvidence, userProjects } from "@/db/schema";
import { UnauthorizedError, requireUser } from "@/lib/auth";
import { ensureReady } from "@/lib/data";

export const dynamic = "force-dynamic";

const urlField = z.string().trim().url().max(500).or(z.literal("")).nullable().optional();

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), projectKey: z.string().min(1).max(120) }),
  z.object({
    action: z.literal("update"),
    projectKey: z.string().min(1).max(120),
    status: z.enum(["planned", "in_progress", "in_review", "done", "abandoned"]).optional(),
    repoUrl: urlField,
    demoUrl: urlField,
    datasetUrl: urlField,
    reportUrl: urlField,
    notes: z.string().max(10000).optional(),
    milestoneState: z.record(z.string(), z.boolean()).optional(),
    dodState: z.record(z.string(), z.boolean()).optional(),
  }),
  z.object({
    action: z.literal("evidence"),
    projectKey: z.string().min(1).max(120),
    kind: z.enum([
      "repo",
      "commit",
      "pr",
      "deployment",
      "report",
      "model_card",
      "test_suite",
      "oral_defense",
      "incident_report",
      "dataset_audit",
    ]),
    url: urlField,
    description: z.string().trim().min(5).max(2000),
  }),
]);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await ensureReady();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 422 });
    }
    const body = parsed.data;

    const [catalogRow] = await db
      .select()
      .from(projectCatalog)
      .where(eq(projectCatalog.key, body.projectKey))
      .limit(1);
    if (!catalogRow) return Response.json({ error: "Unknown project" }, { status: 404 });

    // Ownership is always derived from the session, never from the request body.
    const [existing] = await db
      .select()
      .from(userProjects)
      .where(and(eq(userProjects.userId, user.id), eq(userProjects.projectKey, body.projectKey)))
      .limit(1);

    if (body.action === "start") {
      if (existing) return Response.json({ ok: true, alreadyStarted: true });
      await db.insert(userProjects).values({
        userId: user.id,
        projectKey: body.projectKey,
        status: "in_progress",
      });
      await db.insert(auditLogs).values({ userId: user.id, action: "project.start", meta: { projectKey: body.projectKey } });
      return Response.json({ ok: true });
    }

    if (!existing) return Response.json({ error: "Start the project first" }, { status: 404 });

    if (body.action === "update") {
      await db
        .update(userProjects)
        .set({
          status: body.status ?? existing.status,
          repoUrl: body.repoUrl === undefined ? existing.repoUrl : body.repoUrl || null,
          demoUrl: body.demoUrl === undefined ? existing.demoUrl : body.demoUrl || null,
          datasetUrl: body.datasetUrl === undefined ? existing.datasetUrl : body.datasetUrl || null,
          reportUrl: body.reportUrl === undefined ? existing.reportUrl : body.reportUrl || null,
          notes: body.notes ?? existing.notes,
          milestoneState: body.milestoneState ?? existing.milestoneState,
          dodState: body.dodState ?? existing.dodState,
          updatedAt: new Date(),
        })
        .where(and(eq(userProjects.id, existing.id), eq(userProjects.userId, user.id)));
      return Response.json({ ok: true });
    }

    await db.insert(projectEvidence).values({
      userId: user.id,
      userProjectId: existing.id,
      kind: body.kind,
      url: body.url || null,
      description: body.description,
      skillKeys: catalogRow.skillKeys,
    });
    await db.insert(auditLogs).values({
      userId: user.id,
      action: "project.evidence",
      meta: { projectKey: body.projectKey, kind: body.kind },
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) return Response.json({ error: "Sign in required" }, { status: 401 });
    return Response.json({ error: "Project request failed" }, { status: 500 });
  }
}
