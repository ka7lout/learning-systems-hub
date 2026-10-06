"use client";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export async function api<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = (await res.json().catch(() => null)) as ApiResult<T> | null;
    if (!json) return { ok: false, error: { code: "bad_response", message: `Server returned ${res.status}` } };
    return json;
  } catch (e) {
    return { ok: false, error: { code: "network", message: e instanceof Error ? e.message : "Network error" } };
  }
}

export type LearningState = "deep" | "drift" | "fog" | "overload";
export const STATE_KEY = "ihl-state";
export function readState(): LearningState {
  if (typeof window === "undefined") return "deep";
  const v = window.localStorage.getItem(STATE_KEY);
  return v === "drift" || v === "fog" || v === "overload" ? v : "deep";
}
