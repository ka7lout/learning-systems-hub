// Local session-based authentication on the PostgreSQL database.
// (The external Supabase project referenced in the brief was not reachable
//  from this environment, so auth is implemented against the local DB.)
import { cookies } from "next/headers";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { users, sessions, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "study_os_session";
const SESSION_TTL_DAYS = 30;

function scryptHash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16);
    scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else resolve(`${salt.toString("hex")}:${derived.toString("hex")}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [saltHex, hashHex] = stored.split(":");
    if (!saltHex || !hashHex) return resolve(false);
    const salt = Buffer.from(saltHex, "hex");
    scrypt(password, salt, 64, (err, derived) => {
      if (err) return resolve(false);
      try {
        resolve(timingSafeEqual(Buffer.from(hashHex, "hex"), derived));
      } catch {
        resolve(false);
      }
    });
  });
}

export type AuthUser = { id: string; email: string; displayName: string | null };

export async function registerUser(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthUser> {
  const passwordHash = await scryptHash(password);
  const [user] = await db
    .insert(users)
    .values({ email: email.toLowerCase().trim(), passwordHash, displayName })
    .returning({ id: users.id, email: users.email, displayName: users.displayName });
  // create default settings row
  await db.insert(userSettings).values({ userId: user.id }).onConflictDoNothing();
  return user;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, displayName: user.displayName };
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await db.insert(sessions).values({ userId, token, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [session] = await db
    .select({ userId: sessions.userId, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
  const [user] = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  return user ?? null;
}
