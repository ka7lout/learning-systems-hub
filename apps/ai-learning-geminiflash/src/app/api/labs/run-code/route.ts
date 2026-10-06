import { NextRequest, NextResponse } from "next/server";
import { executePythonCodeSafely } from "@/lib/labs/code-runner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, language = "python", testCases } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Code is required" }, { status: 400 });
    }

    const result = executePythonCodeSafely({ code, language, testCases });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Execution failed" },
      { status: 500 }
    );
  }
}
