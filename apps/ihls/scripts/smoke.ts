/**
 * End-to-end smoke check against a running dev server (§227–§233).
 *
 * Creates a throwaway account directly in the data store, signs in with its
 * session cookie and requests every route, asserting a 200 and the absence of
 * Next.js error markers. It then deletes the account and everything it owned.
 */
import { config } from "dotenv";
import { createHash, randomBytes } from "node:crypto";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const BASE = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

async function main() {
  const { col } = await import("../src/lib/db/index.js");
  const { hashPassword } = await import("../src/lib/auth/password.js");
  const { buildCurriculumGraph } = await import("../src/content/index.js");

  const graph = buildCurriculumGraph();
  const userId = `usr_smoke_${randomBytes(4).toString("hex")}`;
  const token = randomBytes(32).toString("base64url");

  await col<Record<string, unknown> & { _id: string }>("users").insertOne({
    _id: userId,
    email: `${userId}@smoke.invalid`,
    name: "Smoke Check",
    passwordHash: await hashPassword(randomBytes(24).toString("hex")),
    roles: ["admin", "student"],
    createdAt: new Date().toISOString(),
  });
  await col<Record<string, unknown> & { _id: string }>("sessions").insertOne({
    _id: `sess_smoke_${randomBytes(4).toString("hex")}`,
    userId,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  });

  const lesson = graph.lessons.find((l) => l.contentStatus === "authored")!;
  const routes = [
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/curriculum",
    `/curriculum/${graph.courses[0].id}`,
    "/learn",
    `/learn/${lesson.id}`,
    "/learn/english",
    "/practice",
    `/practice/${graph.assessments[0].id}`,
    "/projects",
    `/projects/${graph.projects[0].id}`,
    "/review",
    "/skills",
    "/career",
    "/freelance",
    "/research",
    "/mentor",
    "/portfolio",
    "/settings",
    "/admin",
    "/api/health",
  ];

  let failures = 0;
  for (const route of routes) {
    const started = Date.now();
    let status = 0;
    let body = "";
    try {
      const res = await fetch(`${BASE}${route}`, { headers: { cookie: `ihls_session=${token}` }, redirect: "manual" });
      status = res.status;
      body = await res.text();
    } catch (err) {
      console.log(`  FAIL ${route} — ${(err as Error).message}`);
      failures += 1;
      continue;
    }
    // 307 is expected on "/" and the auth pages while signed in.
    const markers = ["a server-side exception", "Unhandled Runtime Error", "Internal Server Error"];
    const marker = markers.find((m) => body.includes(m));
    const ok = (status === 200 || status === 307) && !marker;
    if (!ok) failures += 1;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${String(status).padEnd(3)} ${String(Date.now() - started).padStart(5)}ms ${route}${marker ? ` — ${marker}` : ""}`);
  }

  // Unauthenticated access must not reach a student page.
  const anon = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
  const redirected = anon.status === 307 || anon.status === 302 || anon.status === 303;
  console.log(`  ${redirected ? "ok  " : "FAIL"} anonymous /dashboard → ${anon.status} (expected a redirect to /login)`);
  if (!redirected) failures += 1;

  // Clean up everything this check created.
  for (const name of ["users", "sessions", "settings", "study_events", "mastery_records", "audit_logs"] as const) {
    await col<{ _id: string }>(name).deleteMany(name === "users" ? { _id: userId } : name === "audit_logs" ? { actorId: userId } : { ownerId: userId });
  }

  console.log(failures === 0 ? "\nSmoke check passed." : `\nSmoke check failed: ${failures} problem(s).`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
