import { NextResponse } from "next/server";
import { ensureDbInitialized } from "@/lib/db-init";
import { pool } from "@/db";

export async function GET() {
  try {
    await ensureDbInitialized();
    const dbTest = await pool.query("SELECT 1 as live;");
    const isLive = dbTest.rows[0]?.live === 1;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      system: "Ismaili Harvard AI Engineering Learning OS",
      ihlsActive: true,
      database: isLive ? "connected" : "degraded",
      models: {
        pro: process.env.PUTER_MODEL_NAME || "deepseek/deepseek-v4-pro",
        flash: "deepseek/deepseek-v4-flash"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Database initialization check failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
