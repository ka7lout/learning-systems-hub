import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { HttpError, apiUser, rateLimit, type SessionUser } from "./auth";
import { ProviderUnavailableError } from "./ai";
import { randomUUID } from "node:crypto";

export function route<T>(schema: ZodType<T> | null, fn: (body: T, user: SessionUser, req: Request) => Promise<unknown>, opts: { limit?: [number, number] } = {}) {
  return async (req: Request) => {
    const requestId = randomUUID();
    try {
      const user = await apiUser();
      if (opts.limit && !(await rateLimit(`${new URL(req.url).pathname}:${user.id}`, opts.limit[0], opts.limit[1]))) throw new HttpError(429, "Too many requests. Please wait a moment.");
      const raw = schema ? await req.json().catch(() => { throw new HttpError(400, "Invalid JSON"); }) : null;
      const body = schema ? schema.parse(raw) : (null as T);
      const out = await fn(body, user, req);
      return NextResponse.json(out ?? { ok: true });
    } catch (e) { return errorResponse(e, requestId); }
  };
}

export function errorResponse(e: unknown, requestId: string) {
  if (e instanceof HttpError) return NextResponse.json({ error: e.message, requestId }, { status: e.status });
  if (e instanceof ZodError) return NextResponse.json({ error: "Validation failed", issues: e.issues.map((i) => i.message), requestId }, { status: 422 });
  if (e instanceof ProviderUnavailableError) return NextResponse.json({ error: e.message, code: "provider_unavailable", requestId }, { status: 503 });
  console.error(JSON.stringify({ requestId, error: e instanceof Error ? e.message : "unknown" }));
  return NextResponse.json({ error: "Something went wrong. Please retry.", requestId }, { status: 500 });
}
