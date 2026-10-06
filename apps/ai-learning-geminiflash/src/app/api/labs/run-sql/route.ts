import { NextRequest, NextResponse } from "next/server";
import { executeSQLPlayground } from "@/lib/labs/sql-runner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, database = "sales" } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ success: false, error: "SQL query string is required" }, { status: 400 });
    }

    const result = executeSQLPlayground(query, database);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "SQL execution failed" },
      { status: 500 }
    );
  }
}
