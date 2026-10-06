import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { col } from "@/lib/db";

/**
 * §189, §190, §193 — authentication, session management and authorisation are
 * separate concerns. The session cookie holds an opaque random token; only its
 * SHA-256 hash is stored, so a database read cannot be replayed as a login.
 * The user id is always derived on the server. A client-supplied ownerId is
 * never trusted anywhere in this codebase.
 */

export const SESSION_COOKIE = "ihls_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

export type Role = "student" | "admin" | "content_editor" | "reviewer" | "support" | "research_editor" | "career_editor";

export interface UserDoc {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  roles: Role[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface SessionDoc {
  _id: string;
  tokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  userAgent?: string;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  roles: Role[];
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, userAgent?: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await col<SessionDoc>("sessions").insertOne({
    _id: `ses_${randomBytes(12).toString("hex")}`,
    tokenHash: hashToken(token),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    userAgent: userAgent?.slice(0, 200),
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await col<SessionDoc>("sessions").deleteMany({ tokenHash: hashToken(token) });
  jar.delete(SESSION_COOKIE);
}

/** Returns the authenticated session or null. Never throws for anonymous users. */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await col<SessionDoc>("sessions").findOne({ tokenHash: hashToken(token) });
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await col<SessionDoc>("sessions").deleteMany({ _id: session._id });
    return null;
  }
  const user = await col<UserDoc>("users").findOne({ _id: session.userId });
  if (!user) return null;
  return { userId: user._id, email: user.email, name: user.name, roles: user.roles };
}

/** Use in any server path that must not run for anonymous callers. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    const error = new Error("UNAUTHENTICATED") as Error & { status?: number };
    error.status = 401;
    throw error;
  }
  return session;
}
