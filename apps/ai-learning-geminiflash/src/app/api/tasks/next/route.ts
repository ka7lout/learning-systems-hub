import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { tasks, userProgress, curriculumNodes, reviewItems } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();

    // 1. Check for pending tasks in database
    const pendingTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .orderBy(desc(tasks.priority), asc(tasks.createdAt));

    // 2. Fetch current learning progress
    const activeProgress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, user.id))
      .orderBy(desc(userProgress.lastAccessedAt))
      .limit(1);

    const activeNodeId = activeProgress[0]?.nodeId || "m1-s1-fundamentals";
    const nodeRows = await db.select().from(curriculumNodes).where(eq(curriculumNodes.id, activeNodeId)).limit(1);
    const currentNode = nodeRows[0];

    const nextTask = pendingTasks[0] || {
      id: "tsk-default-next",
      title: currentNode ? `Advance in ${currentNode.title}` : "Master Python Fundamentals & Control Flow",
      description: "Work through the next pedagogical learning block: solve the active problem set and transfer challenge.",
      category: "curriculum",
      reasonType: "prerequisite_gap",
      reasonExplanation: "Required prerequisite for algorithms, numerical computing, and deep learning pipelines.",
      priority: "high",
      difficulty: "intermediate",
      nodeId: activeNodeId
    };

    return NextResponse.json({
      success: true,
      nextTask,
      totalPending: pendingTasks.length,
      userState: user.statePreference
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load next best task" },
      { status: 500 }
    );
  }
}
