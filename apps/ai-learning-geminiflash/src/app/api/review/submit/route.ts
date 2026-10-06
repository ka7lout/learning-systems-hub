import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { reviewItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { calculateNextReview } from "@/lib/learning-science/spaced-repetition";
import { ensureDbInitialized } from "@/lib/db-init";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();
    const body = await req.json();

    const { reviewId, grade = 4, transferScore = 8 } = body;

    if (!reviewId) {
      return NextResponse.json({ success: false, error: "reviewId is required" }, { status: 400 });
    }

    const reviewRows = await db
      .select()
      .from(reviewItems)
      .where(and(eq(reviewItems.id, reviewId), eq(reviewItems.userId, user.id)))
      .limit(1);

    const item = reviewRows[0];
    if (!item) {
      return NextResponse.json({ success: false, error: "Review item not found" }, { status: 404 });
    }

    const nextCalc = calculateNextReview({
      grade,
      repetitions: item.repetitions,
      previousInterval: item.intervalDays,
      previousEaseFactor: item.easeFactor,
      failureCount: item.failureCount,
      transferScore
    });

    await db
      .update(reviewItems)
      .set({
        nextReviewDate: nextCalc.nextReviewDate,
        intervalDays: nextCalc.intervalDays,
        repetitions: nextCalc.repetitions,
        easeFactor: nextCalc.easeFactor,
        failureCount: nextCalc.failureCount,
        lastReviewedAt: new Date()
      })
      .where(eq(reviewItems.id, item.id));

    return NextResponse.json({
      success: true,
      nextReviewDate: nextCalc.nextReviewDate,
      intervalDays: nextCalc.intervalDays,
      easeFactor: nextCalc.easeFactor
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to record review response" },
      { status: 500 }
    );
  }
}
