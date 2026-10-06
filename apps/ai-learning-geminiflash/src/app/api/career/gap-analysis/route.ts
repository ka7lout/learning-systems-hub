import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { analyzeCareerSkillGap } from "@/lib/career/gap-analyzer";
import { CANONICAL_CAREER_ROLES } from "@/data/career-roles";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();
    const searchParams = req.nextUrl.searchParams;
    const targetRoleId = searchParams.get("roleId") || user.targetRoleId || "navisoft_ai_engineer";

    const analysis = analyzeCareerSkillGap(targetRoleId);

    return NextResponse.json({
      success: true,
      analysis,
      availableRoles: CANONICAL_CAREER_ROLES.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        seniority: r.seniority,
        archetype: r.archetype
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to compute career gap analysis" },
      { status: 500 }
    );
  }
}
