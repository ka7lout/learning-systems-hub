import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { laterItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();

    const items = await db
      .select()
      .from(laterItems)
      .where(eq(laterItems.userId, user.id))
      .orderBy(desc(laterItems.createdAt));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load later items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();
    const body = await req.json();

    const { title, note } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const newItem = {
      id: `later-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: user.id,
      title: title.trim(),
      note: note ? note.trim() : null,
      status: "saved"
    };

    await db.insert(laterItems).values(newItem);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save distraction capture item" },
      { status: 500 }
    );
  }
}
