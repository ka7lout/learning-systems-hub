import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { projects, userProjects } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await ensureDbInitialized();
    const { slug } = await context.params;
    const user = await getCurrentUser();

    const projRows = await db
      .select()
      .from(projects)
      .where(or(eq(projects.slug, slug), eq(projects.id, slug)))
      .limit(1);

    const project = projRows[0];
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const subRows = await db
      .select()
      .from(userProjects)
      .where(and(eq(userProjects.userId, user.id), eq(userProjects.projectId, project.id)))
      .limit(1);

    const userSub = subRows[0];

    return NextResponse.json({
      success: true,
      project,
      userSubmission: userSub ? {
        status: userSub.status,
        evidenceLevel: userSub.evidenceLevel,
        githubRepo: userSub.githubRepo,
        colabUrl: userSub.colabUrl,
        deploymentUrl: userSub.deploymentUrl,
        reportMarkdown: userSub.reportMarkdown,
        evaluationScore: userSub.evaluationScore,
        evaluatorFeedback: userSub.evaluatorFeedback,
        isPortfolioVisible: userSub.isPortfolioVisible,
        completedAt: userSub.completedAt
      } : {
        status: "not_started",
        evidenceLevel: "practice",
        githubRepo: null,
        colabUrl: null,
        deploymentUrl: null,
        reportMarkdown: null,
        evaluationScore: null,
        evaluatorFeedback: null,
        isPortfolioVisible: false,
        completedAt: null
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load project details" },
      { status: 500 }
    );
  }
}
