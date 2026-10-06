import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash, randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@/db";
import { users, sessions, settings, auditLogs, rateLimits, type Settings } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";

const scrypt = promisify(_scrypt) as (p: string, s: Buffer, k: number) => Promise<Buffer>;
const COOKIE = "ihls_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 14;

export const DEFAULT_SETTINGS: Settings = { theme: "system", uiLanguage: "en", contentMode: "standard", vocabAssist: true, englishTraining: false, density: "comfortable", textSize: "base", reducedMotion: false, hintPolicy: "attempt_first", targetRoles: ["nuwave"], studyState: "deep" };

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}
export async function verifyPassword(pw: string, stored: string) {
  const [, s, k] = stored.split("$");
  if (!s || !k) return false;
  const key = await scrypt(pw, Buffer.from(s, "hex"), 64);
  const expected = Buffer.from(k, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}
const sha = (t: string) => createHash("sha256").update(t).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await db.insert(sessions).values({ id: sha(token), userId, expiresAt: new Date(Date.now() + TTL_MS) });
  const proto = (await headers()).get("x-forwarded-proto");
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: proto === "https", path: "/", maxAge: TTL_MS / 1000 });
}
export async function destroySession() {
  const c = await cookies();
  const t = c.get(COOKIE)?.value;
  if (t) await db.delete(sessions).where(eq(sessions.id, sha(t)));
  c.delete(COOKIE);
}

export type SessionUser = { id: string; email: string; name: string; role: string };
export async function getUser(): Promise<SessionUser | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  const rows = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role }).from(sessions).innerJoin(users, eq(users.id, sessions.userId)).where(and(eq(sessions.id, sha(t)), gt(sessions.expiresAt, new Date()))).limit(1);
  return rows[0] ?? null;
}
export async function requireUser() {
  const u = await getUser();
  if (!u) redirect("/login");
  return u;
}
export class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
export async function apiUser() {
  const u = await getUser();
  if (!u) throw new HttpError(401, "Not signed in");
  return u;
}

export async function registerUser(email: string, name: string, password: string) {
  const id = randomUUID();
  const first = await db.execute(sql`select count(*)::int as c from users`);
  const role = Number((first.rows[0] as { c: number }).c) === 0 ? "admin" : "student";
  await db.insert(users).values({ id, email: email.toLowerCase(), name, passwordHash: await hashPassword(password), role });
  await db.insert(settings).values({ userId: id, data: DEFAULT_SETTINGS });
  await audit(id, "auth.register", { role });
  return id;
}

export async function getSettings(userId: string) {
  const r = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  return { data: { ...DEFAULT_SETTINGS, ...(r[0]?.data ?? {}) }, diagnosticDone: r[0]?.diagnosticDone ?? false };
}

export async function audit(userId: string | null, action: string, meta?: Record<string, unknown>) {
  await db.insert(auditLogs).values({ userId, action, meta: meta ?? null });
}

/** Fixed-window rate limiter persisted in Postgres. Returns false when limited. */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSec * 1000);
  const r = await db.execute(sql`
    insert into rate_limits (key, count, window_start) values (${key}, 1, ${now})
    on conflict (key) do update set
      count = case when rate_limits.window_start < ${cutoff} then 1 else rate_limits.count + 1 end,
      window_start = case when rate_limits.window_start < ${cutoff} then ${now} else rate_limits.window_start end
    returning count`);
  void rateLimits;
  return Number((r.rows[0] as { count: number }).count) <= limit;
}
