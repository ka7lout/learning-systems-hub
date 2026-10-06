import { and, asc, count, eq, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes, learnerProfiles, learningEvents, masteryRecords, projects, reviewItems } from "@/db/schema";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  await ensureCurriculumSeeded();
  await db.insert(learnerProfiles).values({ ownerId: actor.id }).onConflictDoNothing();
  const now = new Date();
  const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.ownerId, actor.id)).limit(1);
  const modules = await db.select({ id: curriculumNodes.id, title: curriculumNodes.title, stage: curriculumNodes.stage, description: curriculumNodes.description, sourceCategory: curriculumNodes.sourceCategory, level: curriculumNodes.level, prerequisites: curriculumNodes.prerequisites })
    .from(curriculumNodes)
    .where(and(isNull(curriculumNodes.parentId), eq(curriculumNodes.kind, "module")));
  const [eventCount] = await db.select({ value: count() }).from(learningEvents).where(eq(learningEvents.ownerId, actor.id));
  const [projectCount] = await db.select({ value: count() }).from(projects).where(eq(projects.ownerId, actor.id));
  const dueReviews = await db.select({ id: reviewItems.id, nodeId: reviewItems.nodeId, dueAt: reviewItems.dueAt, activityType: reviewItems.activityType, title: curriculumNodes.title })
    .from(reviewItems)
    .innerJoin(curriculumNodes, eq(reviewItems.nodeId, curriculumNodes.id))
    .where(and(eq(reviewItems.ownerId, actor.id), lte(reviewItems.dueAt, now), eq(reviewItems.status, "due")))
    .orderBy(asc(reviewItems.dueAt)).limit(5);
  const currentProjects = await db.select({ id: projects.id, title: projects.title, status: projects.status, updatedAt: projects.updatedAt })
    .from(projects).where(eq(projects.ownerId, actor.id)).orderBy(asc(projects.updatedAt)).limit(3);
  const mastery = await db.select({ nodeId: masteryRecords.nodeId, completion: masteryRecords.completion }).from(masteryRecords).where(eq(masteryRecords.ownerId, actor.id));
  const [firstLesson] = await db.select({ id: curriculumNodes.id, title: curriculumNodes.title, why: curriculumNodes.why, description: curriculumNodes.description })
    .from(curriculumNodes).where(eq(curriculumNodes.id, "python-programming-u1-t1")).limit(1);

  return Response.json({
    profile,
    modules,
    currentTask: firstLesson ? { ...firstLesson, reason: dueReviews.length ? "A review is due: strengthen retention before adding more new material." : "A foundational first lesson starts the Python path; continue only as the work remains useful." } : null,
    dueReviews,
    activeProjects: currentProjects,
    evidenceCount: eventCount.value,
    projectCount: projectCount.value,
    mastery,
    generatedAt: now.toISOString(),
  });
}
