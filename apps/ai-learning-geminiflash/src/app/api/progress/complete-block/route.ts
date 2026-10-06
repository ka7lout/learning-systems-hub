import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { userProgress, masteryRecords, reviewItems, curriculumNodes, learningBlocks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { computeMasteryLevel } from "@/lib/learning-science/mastery-evaluator";
import { calculateNextReview } from "@/lib/learning-science/spaced-repetition";
import { ensureDbInitialized } from "@/lib/db-init";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      nodeId,
      blockId,
      taskType = "problem_set",
      understandingScore = 8,
      recallScore = 8,
      explanationScore = 7,
      problemSolvingScore = 8,
      transferScore = 7,
      helpLevelUsed = "no_help",
      isIndependent = true,
      feedback = "Demonstrated independent competence"
    } = body;

    if (!nodeId || !blockId) {
      return NextResponse.json({ success: false, error: "nodeId and blockId are required" }, { status: 400 });
    }

    // 1. Fetch total blocks for this node
    const allBlocks = await db
      .select({ id: learningBlocks.id })
      .from(learningBlocks)
      .where(eq(learningBlocks.nodeId, nodeId));

    const totalBlocksCount = allBlocks.length || 1;

    // 2. Fetch existing progress
    const progressRows = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, user.id), eq(userProgress.nodeId, nodeId)))
      .limit(1);

    const existingProg = progressRows[0];
    const completedSet = new Set<string>((existingProg?.completedBlocks as string[]) || []);
    completedSet.add(blockId);
    const updatedCompletedArray = Array.from(completedSet);

    const completionPct = Math.min(100, Math.round((updatedCompletedArray.length / totalBlocksCount) * 100));

    // 3. Compute Mastery Level
    const masteryCalc = computeMasteryLevel({
      understandingScore,
      recallScore,
      explanationScore,
      problemSolvingScore,
      transferScore,
      projectScore: 7,
      helpLevelUsed,
      isIndependent
    });

    const status = completionPct >= 100 && masteryCalc.level >= 6 ? "mastered" : completionPct >= 100 ? "completed" : "in_progress";

    if (existingProg) {
      await db
        .update(userProgress)
        .set({
          status,
          completionPct,
          masteryLevel: Math.max(existingProg.masteryLevel, masteryCalc.level),
          completedBlocks: updatedCompletedArray,
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userProgress.id, existingProg.id));
    } else {
      await db.insert(userProgress).values({
        id: `prog-${user.id}-${nodeId}`,
        userId: user.id,
        nodeId,
        status,
        completionPct,
        masteryLevel: masteryCalc.level,
        completedBlocks: updatedCompletedArray
      });
    }

    // 4. Record Mastery Evidence
    await db.insert(masteryRecords).values({
      id: `mast-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: user.id,
      nodeId,
      taskType,
      understandingScore,
      recallScore,
      explanationScore,
      problemSolvingScore,
      transferScore,
      helpLevelUsed,
      isIndependent,
      feedback
    });

    // 5. Schedule Spaced Review Item
    const nodeRows = await db.select().from(curriculumNodes).where(eq(curriculumNodes.id, nodeId)).limit(1);
    const node = nodeRows[0];
    if (node) {
      const reviewCalc = calculateNextReview({
        grade: Math.round(transferScore / 2),
        repetitions: 1,
        previousInterval: 1,
        previousEaseFactor: 2.5,
        failureCount: 0,
        transferScore
      });

      await db.insert(reviewItems).values({
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: user.id,
        nodeId,
        concept: node.title,
        prompt: `Recall the core invariant and failure mode of '${node.title}'. What is the primary engineering trade-off?`,
        idealAnswer: (node.mustWriteNotes as string[])?.[0] || "Key theoretical invariant and trade-off.",
        activityType: "free_recall",
        nextReviewDate: reviewCalc.nextReviewDate,
        intervalDays: reviewCalc.intervalDays,
        repetitions: reviewCalc.repetitions,
        easeFactor: reviewCalc.easeFactor
      });
    }

    return NextResponse.json({
      success: true,
      completionPct,
      masteryLevel: masteryCalc.level,
      masteryLabel: masteryCalc.label,
      completedBlocksCount: updatedCompletedArray.length,
      totalBlocksCount
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to record block completion" },
      { status: 500 }
    );
  }
}
