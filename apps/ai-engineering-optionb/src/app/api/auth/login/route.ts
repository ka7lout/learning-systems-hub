import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME, signUpOrIn } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const { email, name } = parsed.data;
    const { sessionId, isNew, userId } = await signUpOrIn(email, name);
    const response = NextResponse.json({ ok: true, isNew, userId });
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
