import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { laterItems } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const [item] = await db.update(laterItems).set({ resolvedAt: new Date() })
    .where(and(eq(laterItems.id, id), eq(laterItems.ownerId, actor.id), isNull(laterItems.resolvedAt)))
    .returning({ id: laterItems.id, resolvedAt: laterItems.resolvedAt });
  if (!item) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json({ item });
}
