import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const COOKIE_NAME = "ih_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const rows = await db
      .select({
        user: users,
        sessionExpires: sessions.expiresAt,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.id, token))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    if (!row.user) return null;
    if (row.sessionExpires && new Date(row.sessionExpires) < new Date()) return null;
    return {
      id: row.user.id,
      email: row.user.email,
      name: row.user.name,
      role: row.user.role,
    };
  } catch (e) {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const id = randomUUID();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  await db.insert(sessions).values({
    id,
    userId,
    expiresAt: expires,
  });
  return id;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    try { await db.delete(sessions).where(eq(sessions.id, token)); } catch (e) {}
  }
}

export async function ensureUserProfile(userId: string) {
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(userProfiles).values({ userId });
  }
}

export async function signUpOrIn(email: string, name?: string): Promise<{ sessionId: string; userId: string; isNew: boolean }> {
  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  let userId: string;
  let isNew = false;
  if (existing.length === 0) {
    const [u] = await db.insert(users).values({
      email: email.toLowerCase(),
      name: name || email.split("@")[0],
      role: "student",
    }).returning({ id: users.id });
    userId = u.id;
    isNew = true;
    await ensureUserProfile(userId);
  } else {
    userId = existing[0].id;
    if (name && !existing[0].name) {
      await db.update(users).set({ name }).where(eq(users.id, userId));
    }
  }
  const sessionId = await createSession(userId);
  return { sessionId, userId, isNew };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
