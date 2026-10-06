import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { AuthError } from "@/lib/auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, code = "bad_request") {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new HttpError("Invalid JSON body", 400);
  }
  const r = schema.safeParse(json);
  if (!r.success) throw new HttpError(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 422);
  return r.data;
}

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Wrap a route handler with uniform error handling and a request id. */
export function handler(fn: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    const requestId = crypto.randomUUID();
    try {
      const res = await fn(req, ctx);
      res.headers.set("x-request-id", requestId);
      return res;
    } catch (e) {
      if (e instanceof AuthError || e instanceof HttpError) return fail(e.message, e.status, e.status === 401 ? "unauthenticated" : e.status === 403 ? "forbidden" : "error");
      console.error(`[${requestId}]`, e instanceof Error ? e.message : e);
      return fail("Unexpected server error", 500, "internal");
    }
  };
}
