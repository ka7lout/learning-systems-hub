import { NextResponse } from "next/server";
import { db } from "@/db";
import { englishTerms } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const terms = await db.select().from(englishTerms).orderBy(asc(englishTerms.term));
    return NextResponse.json({
      success: true,
      terms,
      totalCount: terms.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load vocabulary" },
      { status: 500 }
    );
  }
}
