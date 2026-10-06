import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes, reviewItems } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  const now = new Date();
  const [due, upcoming] = await Promise.all([
    db.select({ id: reviewItems.id, nodeId: reviewItems.nodeId, dueAt: reviewItems.dueAt, intervalDays: reviewItems.intervalDays, activityType: reviewItems.activityType, title: curriculumNodes.title, why: curriculumNodes.why })
      .from(reviewItems).innerJoin(curriculumNodes, eq(reviewItems.nodeId, curriculumNodes.id))
      .where(and(eq(reviewItems.ownerId, actor.id), eq(reviewItems.status, "due"), lte(reviewItems.dueAt, now))).orderBy(asc(reviewItems.dueAt)).limit(30),
    db.select({ id: reviewItems.id, nodeId: reviewItems.nodeId, dueAt: reviewItems.dueAt, intervalDays: reviewItems.intervalDays, activityType: reviewItems.activityType, title: curriculumNodes.title })
      .from(reviewItems).innerJoin(curriculumNodes, eq(reviewItems.nodeId, curriculumNodes.id))
      .where(and(eq(reviewItems.ownerId, actor.id), eq(reviewItems.status, "due"), gte(reviewItems.dueAt, now))).orderBy(asc(reviewItems.dueAt)).limit(30),
  ]);
  return Response.json({ due, upcoming, message: due.length === 0 ? "No reviews are due yet. A review appears after a scored practice attempt." : null });
}
