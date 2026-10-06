import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { FREELANCE_SCENARIOS, gradeFreelanceProposal } from "@/lib/career/freelance-engine";
import { db } from "@/db";
import { freelanceSimulations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    return NextResponse.json({
      success: true,
      scenarios: FREELANCE_SCENARIOS
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load freelance scenarios" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();
    const body = await req.json();

    const { scenarioSlug, proposalMarkdown, scopeOfWork, estimatedBudget } = body;

    if (!scenarioSlug || !proposalMarkdown) {
      return NextResponse.json({ success: false, error: "scenarioSlug and proposalMarkdown are required" }, { status: 400 });
    }

    const evaluation = gradeFreelanceProposal(proposalMarkdown, scenarioSlug);

    const simulationId = `sim-${user.id}-${scenarioSlug}`;
    const existing = await db
      .select()
      .from(freelanceSimulations)
      .where(and(eq(freelanceSimulations.userId, user.id), eq(freelanceSimulations.scenarioSlug, scenarioSlug)))
      .limit(1);

    if (existing[0]) {
      await db
        .update(freelanceSimulations)
        .set({
          proposalMarkdown,
          scopeOfWork: scopeOfWork || null,
          estimatedBudget: estimatedBudget || null,
          status: evaluation.score >= 80 ? "accepted" : "revision_requested",
          score: evaluation.score,
          coachFeedback: evaluation.feedback,
          updatedAt: new Date()
        })
        .where(eq(freelanceSimulations.id, existing[0].id));
    } else {
      await db.insert(freelanceSimulations).values({
        id: simulationId,
        userId: user.id,
        scenarioSlug,
        clientName: "Enterprise Client",
        clientBrief: "Client simulation request",
        proposalMarkdown,
        scopeOfWork: scopeOfWork || null,
        estimatedBudget: estimatedBudget || null,
        status: evaluation.score >= 80 ? "accepted" : "revision_requested",
        score: evaluation.score,
        coachFeedback: evaluation.feedback
      });
    }

    return NextResponse.json({
      success: true,
      evaluation
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to evaluate freelance proposal" },
      { status: 500 }
    );
  }
}
