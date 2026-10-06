import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { projects, userProjects } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();

    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.ladderLevel), asc(projects.catalogIndex));

    const userSubmissions = await db
      .select()
      .from(userProjects)
      .where(eq(userProjects.userId, user.id));

    const subMap = new Map<string, typeof userProjects.$inferSelect>();
    for (const sub of userSubmissions) {
      subMap.set(sub.projectId, sub);
    }

    const enriched = allProjects.map((p) => {
      const userSub = subMap.get(p.id);
      return {
        ...p,
        userSubmission: userSub ? {
          status: userSub.status,
          evidenceLevel: userSub.evidenceLevel,
          githubRepo: userSub.githubRepo,
          deploymentUrl: userSub.deploymentUrl,
          evaluationScore: userSub.evaluationScore,
          evaluatorFeedback: userSub.evaluatorFeedback,
          isPortfolioVisible: userSub.isPortfolioVisible,
          completedAt: userSub.completedAt
        } : {
          status: "not_started",
          evidenceLevel: "practice",
          githubRepo: null,
          deploymentUrl: null,
          evaluationScore: null,
          evaluatorFeedback: null,
          isPortfolioVisible: false,
          completedAt: null
        }
      };
    });

    return NextResponse.json({
      success: true,
      projects: enriched,
      totalCount: enriched.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load projects" },
      { status: 500 }
    );
  }
}
