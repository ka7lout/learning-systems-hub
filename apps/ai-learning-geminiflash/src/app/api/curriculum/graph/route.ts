import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { curriculumNodes, userProgress } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();

    const nodes = await db
      .select()
      .from(curriculumNodes)
      .orderBy(asc(curriculumNodes.orderIndex));

    const progressRows = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, user.id));

    const progressMap = new Map<string, number>();
    for (const p of progressRows) {
      progressMap.set(p.nodeId, p.masteryLevel);
    }

    const graphNodes = nodes.map((node) => ({
      id: node.id,
      slug: node.slug,
      title: node.title,
      stage: node.stage,
      level: node.level,
      sourceCategory: node.sourceCategory,
      orderIndex: node.orderIndex,
      prerequisites: node.prerequisites as string[],
      masteryLevel: progressMap.get(node.id) || 0,
      skills: (node.skills as string[]) || []
    }));

    const edges: Array<{ source: string; target: string; type: "prerequisite" | "corequisite" }> = [];
    for (const node of nodes) {
      const prereqs = (node.prerequisites as string[]) || [];
      for (const prereqId of prereqs) {
        edges.push({
          source: prereqId,
          target: node.id,
          type: "prerequisite"
        });
      }
    }

    return NextResponse.json({
      success: true,
      nodes: graphNodes,
      edges,
      totalNodes: graphNodes.length,
      totalEdges: edges.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load curriculum graph" },
      { status: 500 }
    );
  }
}
