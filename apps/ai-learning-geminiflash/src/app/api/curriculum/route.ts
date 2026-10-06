import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { curriculumNodes, userProgress } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
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

    const progressMap = new Map<string, typeof userProgress.$inferSelect>();
    for (const p of progressRows) {
      progressMap.set(p.nodeId, p);
    }

    const enrichedNodes = nodes.map((node) => {
      const prog = progressMap.get(node.id);
      return {
        ...node,
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
      };
    });

    return NextResponse.json({
      success: true,
      nodes: enrichedNodes,
      totalCount: enrichedNodes.length,
      stages: [
        { id: "foundations", title: "1. Computer Science & Python Foundations" },
        { id: "mathematics", title: "2. Linear Algebra, Calculus & Statistics" },
        { id: "data_systems", title: "3. Data Wrangling, SQL & Data Engineering" },
        { id: "machine_learning", title: "4. Classical Machine Learning" },
        { id: "deep_learning", title: "5. Deep Learning & Computer Vision" },
        { id: "modern_ai", title: "6. Modern AI, Transformers, RAG & Agents" },
        { id: "ai_systems", title: "7. Production MLOps & Scalable Systems" }
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load curriculum" },
      { status: 500 }
    );
  }
}
