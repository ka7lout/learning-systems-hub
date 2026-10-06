import { and, asc, isNull, inArray } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes } from "@/db/schema";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensureCurriculumSeeded();
  const nodes = await db.select({
    id: curriculumNodes.id,
    parentId: curriculumNodes.parentId,
    kind: curriculumNodes.kind,
    title: curriculumNodes.title,
    sourceCategory: curriculumNodes.sourceCategory,
    level: curriculumNodes.level,
    stage: curriculumNodes.stage,
    description: curriculumNodes.description,
    why: curriculumNodes.why,
    prerequisites: curriculumNodes.prerequisites,
    content: curriculumNodes.content,
    lastVerified: curriculumNodes.lastVerified,
  }).from(curriculumNodes)
    .where(and(isNull(curriculumNodes.parentId), inArray(curriculumNodes.kind, ["module", "extension", "course_reference", "learning_science_configuration"])))
    .orderBy(asc(curriculumNodes.stage), asc(curriculumNodes.title));
  return Response.json({ nodes });
}
