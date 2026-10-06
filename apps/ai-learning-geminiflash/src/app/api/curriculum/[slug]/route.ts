import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { curriculumNodes, learningBlocks, userProgress } from "@/db/schema";
import { eq, or, and, asc } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await ensureDbInitialized();
    const { slug } = await context.params;
    const user = await getCurrentUser();

    const nodeRows = await db
      .select()
      .from(curriculumNodes)
      .where(or(eq(curriculumNodes.slug, slug), eq(curriculumNodes.id, slug)))
      .limit(1);

    const node = nodeRows[0];
    if (!node) {
      return NextResponse.json({ success: false, error: "Curriculum node not found" }, { status: 404 });
    }

    const blocks = await db
      .select()
      .from(learningBlocks)
      .where(eq(learningBlocks.nodeId, node.id))
      .orderBy(asc(learningBlocks.orderIndex));

    const progressRows = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, user.id), eq(userProgress.nodeId, node.id)))
      .limit(1);

    const prog = progressRows[0];

    return NextResponse.json({
      success: true,
      node,
      blocks,
      userProgress: prog ? {
        status: prog.status,
        completionPct: prog.completionPct,
        masteryLevel: prog.masteryLevel,
        completedBlocks: prog.completedBlocks
      } : {
        status: "available",
        completionPct: 0,
        masteryLevel: 0,
        completedBlocks: []
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load node details" },
      { status: 500 }
    );
  }
}
