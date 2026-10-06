import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { speakingSubmissions } from "@/db/schema";
import { ensureDbInitialized } from "@/lib/db-init";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      promptType = "concept_defense",
      promptText,
      transcript,
      nodeId
    } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ success: false, error: "Transcript is required" }, { status: 400 });
    }

    const lower = transcript.toLowerCase();

    // Evaluate fluency, technical precision, and terminology
    let fluencyScore = 85;
    let terminologyScore = 80;
    let clarityScore = 85;

    // Check for essential technical keywords
    if (lower.includes("invariant") || lower.includes("trade-off") || lower.includes("gradient") || lower.includes("matrix") || lower.includes("encapsulation") || lower.includes("variance")) {
      terminologyScore = 95;
    }

    if (transcript.split(" ").length < 15) {
      fluencyScore = 65;
      clarityScore = 70;
    }

    const totalAverage = Math.round((fluencyScore + terminologyScore + clarityScore) / 3);

    const feedback = `Viva Evaluation: ${
      totalAverage >= 85 
        ? "Excellent spoken technical explanation. Strong command of terminology, clear sentence structure, and confident defense of architectural trade-offs."
        : "Good attempt. Practice incorporating more precise terminology (e.g. 'asymptotic complexity', 'regularization', 'homoscedasticity') rather than informal phrases."
    }`;

    const submissionId = `spk-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.insert(speakingSubmissions).values({
      id: submissionId,
      userId: user.id,
      nodeId: nodeId || null,
      promptType,
      promptText: promptText || "Oral Technical Defense",
      transcript,
      fluencyScore,
      terminologyScore,
      clarityScore,
      feedback
    });

    return NextResponse.json({
      success: true,
      submissionId,
      scores: {
        overallScore: totalAverage,
        fluencyScore,
        terminologyScore,
        clarityScore
      },
      feedback
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to evaluate oral submission" },
      { status: 500 }
    );
  }
}
