import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { userProjects, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateEvidenceBackedCVBullets } from "@/lib/career/cv-generator";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();

    const userSubs = await db
      .select({
        projectTitle: projects.title,
        githubRepo: userProjects.githubRepo,
        deploymentUrl: userProjects.deploymentUrl,
        evaluationScore: userProjects.evaluationScore
      })
      .from(userProjects)
      .innerJoin(projects, eq(userProjects.projectId, projects.id))
      .where(eq(userProjects.userId, user.id));

    const formattedProjects = userSubs.map((s) => ({
      projectTitle: s.projectTitle,
      githubRepo: s.githubRepo || undefined,
      deploymentUrl: s.deploymentUrl || undefined,
      evaluationScore: s.evaluationScore || undefined
    }));

    const bullets = generateEvidenceBackedCVBullets(formattedProjects);

    return NextResponse.json({
      success: true,
      bullets,
      totalEvidenceCount: bullets.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate CV bullets" },
      { status: 500 }
    );
  }
}
