import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { generateMentorResponse } from "@/lib/ai/provider";
import { db } from "@/db";
import { aiConversations, aiMessages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      message,
      personaId = "lead_mentor",
      nodeId,
      conversationId: existingConvId,
      helpLevel = "no_help",
      untrustedContent
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    // 1. Get or create conversation thread
    let conversationId = existingConvId;
    if (!conversationId) {
      conversationId = `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await db.insert(aiConversations).values({
        id: conversationId,
        userId: user.id,
        nodeId: nodeId || null,
        specialistPersona: personaId,
        threadTitle: message.slice(0, 48) + "..."
      });
    }

    // 2. Persist user message
    const userMsgId = `msg-usr-${Date.now()}`;
    await db.insert(aiMessages).values({
      id: userMsgId,
      conversationId,
      sender: "user",
      persona: "student",
      content: message,
      helpLevel
    });

    // 3. Generate Mentor response
    const aiResponse = await generateMentorResponse({
      personaId,
      userMessage: message,
      currentNodeId: nodeId,
      studentState: user.statePreference,
      helpLevel,
      untrustedContent
    });

    // 4. Persist Mentor response
    const mentorMsgId = `msg-mentor-${Date.now()}`;
    await db.insert(aiMessages).values({
      id: mentorMsgId,
      conversationId,
      sender: "mentor",
      persona: personaId,
      content: aiResponse.content,
      helpLevel,
      thoughtProcess: aiResponse.thoughtProcess || null
    });

    return NextResponse.json({
      success: true,
      conversationId,
      message: {
        id: mentorMsgId,
        sender: "mentor",
        persona: aiResponse.persona,
        content: aiResponse.content,
        modelUsed: aiResponse.modelUsed,
        providerStatus: aiResponse.providerStatus,
        helpLevel: aiResponse.helpLevelApplied,
        thoughtProcess: aiResponse.thoughtProcess
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to process mentor conversation" },
      { status: 500 }
    );
  }
}
