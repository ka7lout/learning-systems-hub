import { sql } from "drizzle-orm";
import { db } from "@/db";
import { assessmentItems, courses, lessons, projects } from "@/db/schema";
import { providerConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    const [[c], [l], [i], [p]] = await Promise.all([
      db.select({ n: sql<number>`count(*)::int` }).from(courses),
      db.select({ n: sql<number>`count(*)::int` }).from(lessons),
      db.select({ n: sql<number>`count(*)::int` }).from(assessmentItems),
      db.select({ n: sql<number>`count(*)::int` }).from(projects),
    ]);
    return Response.json({
      ok: true,
      database: "reachable",
      content: { courses: c?.n ?? 0, lessons: l?.n ?? 0, assessmentItems: i?.n ?? 0, projects: p?.n ?? 0 },
      // Truthful degraded-mode reporting: the product works without the AI layer.
      aiProvider: providerConfigured() ? "configured" : "not_configured",
    });
  } catch {
    return Response.json({ ok: false, database: "unreachable" }, { status: 500 });
  }
}
