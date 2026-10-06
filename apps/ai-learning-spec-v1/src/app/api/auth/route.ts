import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { ensureReady } from "@/lib/data";

export const dynamic = "force-dynamic";

const signupSchema = z.object({
  action: z.literal("signup"),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(10).max(200),
});

const loginSchema = z.object({
  action: z.literal("login"),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

const logoutSchema = z.object({ action: z.literal("logout") });

const bodySchema = z.discriminatedUnion("action", [signupSchema, loginSchema, logoutSchema]);

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 422 },
    );
  }
  const body = parsed.data;

  if (body.action === "logout") {
    await destroySession();
    return Response.json({ ok: true });
  }

  await ensureReady();

  if (body.action === "signup") {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1);
    if (existing.length > 0) {
      return Response.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    const passwordHash = await hashPassword(body.password);
    const [created] = await db
      .insert(users)
      .values({
        email: body.email,
        name: body.name,
        passwordHash,
        settings: { contentMode: "standard", uiLanguage: "en", hintPolicy: "attempt_first", vocabAssist: true },
      })
      .returning({ id: users.id });
    await createSession(created.id);
    await db.insert(auditLogs).values({ userId: created.id, action: "auth.signup", meta: {} });
    return Response.json({ ok: true });
  }

  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    await db.insert(auditLogs).values({ action: "auth.login_failed", meta: { email: body.email } });
    return Response.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  await createSession(user.id);
  await db.insert(auditLogs).values({ userId: user.id, action: "auth.login", meta: {} });
  return Response.json({ ok: true });
}
