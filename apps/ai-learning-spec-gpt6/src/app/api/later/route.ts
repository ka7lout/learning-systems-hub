import { randomUUID } from "node:crypto";
import { and, asc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { laterItems } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
const laterSchema = z.object({ label: z.string().trim().min(1).max(240), sourceContext: z.enum(["study", "project", "general"]).default("study") }).strict();

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  const items = await db.select({ id: laterItems.id, label: laterItems.label, sourceContext: laterItems.sourceContext, capturedAt: laterItems.capturedAt })
    .from(laterItems).where(and(eq(laterItems.ownerId, actor.id), isNull(laterItems.resolvedAt))).orderBy(asc(laterItems.capturedAt)).limit(50);
  return Response.json({ items });
}

export async function POST(request: Request) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = laterSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  const [item] = await db.insert(laterItems).values({ id: randomUUID(), ownerId: actor.id, ...parsed.data }).returning({ id: laterItems.id, label: laterItems.label, capturedAt: laterItems.capturedAt });
  return Response.json({ item }, { status: 201 });
}
