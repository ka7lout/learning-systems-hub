import "server-only";
import { z } from "zod";
import { getSession, requireSession, type Session } from "@/lib/auth/session";
import { audit } from "@/lib/dal";
import { can, type Permission } from "@/lib/auth/rbac";

/**
 * §192 — every server action and route handler declares authentication,
 * authorisation, an input schema, rate limits, error behaviour and logging.
 * This module is the single place those are applied so none can be forgotten.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimit {
  key: string;
  limit: number;
  windowMs: number;
}

export function rateLimit({ key, limit, windowMs }: RateLimit): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (bucket.count >= limit) return { ok: false, retryAfterMs: bucket.resetAt - now };
  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: "unauthenticated" | "forbidden" | "invalid" | "rate_limited" | "not_found" | "provider_unavailable" | "error"; message: string; issues?: string[] };

export interface ActionOptions<S extends z.ZodTypeAny> {
  name: string;
  schema: S;
  permission?: Permission;
  limit?: { limit: number; windowMs: number };
}

/**
 * Wraps a mutation: authenticate → authorise → validate → rate limit → execute → audit.
 * The handler only ever receives a server-derived session and validated input.
 */
export async function action<S extends z.ZodTypeAny, O>(
  options: ActionOptions<S>,
  input: unknown,
  handler: (session: Session, input: z.output<S>) => Promise<O>,
): Promise<ActionResult<O>> {
  let session: Session;
  try {
    session = await requireSession();
  } catch {
    await audit({ actorId: null, action: options.name, outcome: "deny", meta: { reason: "unauthenticated" } });
    return { ok: false, code: "unauthenticated", message: "You need to sign in to do that." };
  }

  if (options.permission && !can(session, options.permission)) {
    await audit({ actorId: session.userId, action: options.name, outcome: "deny", meta: { reason: "forbidden" } });
    return { ok: false, code: "forbidden", message: "Your role does not allow this action." };
  }

  const limits = options.limit ?? { limit: 120, windowMs: 60_000 };
  const rl = rateLimit({ key: `${options.name}:${session.userId}`, ...limits });
  if (!rl.ok) {
    await audit({ actorId: session.userId, action: options.name, outcome: "deny", meta: { reason: "rate_limited" } });
    return { ok: false, code: "rate_limited", message: `Too many requests. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.` };
  }

  const parsed = options.schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid",
      message: "That input is not valid.",
      issues: parsed.error.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`),
    };
  }

  try {
    const data = await handler(session, parsed.data);
    await audit({ actorId: session.userId, action: options.name, outcome: "allow" });
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected failure";
    await audit({ actorId: session.userId, action: options.name, outcome: "error", meta: { message } });
    // Error text is deliberately generic to the client; detail stays in the audit log (§192).
    return { ok: false, code: "error", message: "That action failed. Nothing was saved." };
  }
}

/** For read paths in server components. */
export async function currentSession(): Promise<Session | null> {
  return getSession();
}
