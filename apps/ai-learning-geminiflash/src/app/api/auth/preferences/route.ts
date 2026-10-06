import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const { statePreference, englishMode, targetRoleId } = body;

    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date()
    };

    if (statePreference) updates.statePreference = statePreference;
    if (englishMode) updates.englishMode = englishMode;
    if (targetRoleId) updates.targetRoleId = targetRoleId;

    await db.update(users).set(updates).where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: {
        statePreference: statePreference || user.statePreference,
        englishMode: englishMode || user.englishMode,
        targetRoleId: targetRoleId || user.targetRoleId
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update preferences" },
      { status: 500 }
    );
  }
}
