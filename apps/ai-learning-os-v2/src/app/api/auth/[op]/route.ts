import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registerUser, verifyPassword, createSession, destroySession, rateLimit, audit, HttpError } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

const Register = z.object({ email: z.string().email().max(200), name: z.string().trim().min(1).max(80), password: z.string().min(8, "Password must be at least 8 characters").max(200) });
const Login = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });

export async function POST(req: Request, ctx: { params: Promise<{ op: string }> }) {
  const { op } = await ctx.params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  try {
    if (op === "logout") { await destroySession(); return NextResponse.json({ ok: true }); }
    if (!(await rateLimit(`auth:${ip}`, 20, 600))) throw new HttpError(429, "Too many attempts. Try again in a few minutes.");
    const body = await req.json().catch(() => ({}));
    if (op === "register") {
      const b = Register.parse(body);
      const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, b.email.toLowerCase())).limit(1);
      if (exists.length) throw new HttpError(409, "An account with this email already exists.");
      const id = await registerUser(b.email, b.name, b.password);
      await createSession(id);
      return NextResponse.json({ ok: true });
    }
    if (op === "login") {
      const b = Login.parse(body);
      const [u] = await db.select().from(users).where(eq(users.email, b.email.toLowerCase())).limit(1);
      if (!u || !(await verifyPassword(b.password, u.passwordHash))) { await audit(null, "auth.login_failed", { ip }); throw new HttpError(401, "Email or password is incorrect."); }
      await createSession(u.id);
      await audit(u.id, "auth.login");
      return NextResponse.json({ ok: true });
    }
    throw new HttpError(404, "Not found");
  } catch (e) { return errorResponse(e, crypto.randomUUID()); }
}
