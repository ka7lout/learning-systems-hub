import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, sessions, settings, auditLogs } from "@/db/schema";

export const SESSION_COOKIE = "ihl_session";
const SESSION_DAYS = 14;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionUser = { id: string; email: string; name: string; role: string };

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400 * 1000);
  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Server-derived identity. Never accept ownerId from the client. */
export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError("Authentication required", 401);
  return u;
}

export async function requireRole(roles: string[]): Promise<SessionUser> {
  const u = await requireUser();
  if (!roles.includes(u.role)) throw new AuthError("Permission denied", 403);
  return u;
}

export async function registerUser(input: { email: string; password: string; name: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) throw new AuthError("An account with this email already exists", 409);
  const [count] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  // First account on a fresh deployment becomes the administrator (documented in SECURITY.md).
  const role = (count?.c ?? 0) === 0 ? "admin" : "student";
  const [u] = await db.insert(users).values({ email, passwordHash: hashPassword(input.password), name: input.name.trim(), role }).returning();
  await db.insert(settings).values({ ownerId: u.id });
  await db.insert(auditLogs).values({ userId: u.id, action: "auth.register", meta: { role } });
  return u;
}

export async function authenticate(email: string, password: string) {
  const [u] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  if (!u || !verifyPassword(password, u.passwordHash)) {
    await db.insert(auditLogs).values({ userId: u?.id ?? null, action: "auth.login_failed", meta: {} });
    throw new AuthError("Invalid email or password", 401);
  }
  await db.insert(auditLogs).values({ userId: u.id, action: "auth.login", meta: {} });
  return u;
}

/* Simple in-memory rate limiter (per process). Adequate for a single Vercel function instance; documented as a limitation. */
const buckets = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}
