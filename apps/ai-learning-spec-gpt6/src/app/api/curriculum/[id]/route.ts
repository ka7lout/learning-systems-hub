import { eq } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes } from "@/db/schema";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureCurriculumSeeded();
  const { id } = await context.params;
  const [node] = await db.select().from(curriculumNodes).where(eq(curriculumNodes.id, id)).limit(1);
  if (!node) return Response.json({ error: "not_found" }, { status: 404 });
  const children = await db.select({ id: curriculumNodes.id, kind: curriculumNodes.kind, title: curriculumNodes.title, description: curriculumNodes.description, why: curriculumNodes.why, content: curriculumNodes.content, prerequisites: curriculumNodes.prerequisites, sourceCategory: curriculumNodes.sourceCategory, level: curriculumNodes.level, sources: curriculumNodes.sources, learningObjectives: curriculumNodes.learningObjectives })
    .from(curriculumNodes).where(eq(curriculumNodes.parentId, id));
  return Response.json({ node, children });
}
