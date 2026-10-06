import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { reviewItems } from "@/db/schema";
import { eq, lte, asc } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();

    // Fetch review items due now or upcoming
    const dueReviews = await db
      .select()
      .from(reviewItems)
      .where(eq(reviewItems.userId, user.id))
      .orderBy(asc(reviewItems.nextReviewDate));

    return NextResponse.json({
      success: true,
      reviews: dueReviews,
      dueCount: dueReviews.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load review items" },
      { status: 500 }
    );
  }
}
