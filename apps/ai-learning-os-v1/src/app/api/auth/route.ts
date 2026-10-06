import { z } from "zod";
import { handler, ok, fail, parseBody } from "@/lib/http";
import { authenticate, createSession, destroySession, rateLimit, registerUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";

const schema = z.discriminatedUnion("intent", [
  z.object({ intent: z.literal("register"), email: z.string().email().max(200), password: z.string().min(8).max(200), name: z.string().min(1).max(100) }),
  z.object({ intent: z.literal("login"), email: z.string().email().max(200), password: z.string().min(1).max(200) }),
  z.object({ intent: z.literal("logout") }),
]);

export const POST = handler(async (req) => {
  const body = await parseBody(req, schema);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (body.intent === "logout") {
    await destroySession();
    return ok({ loggedOut: true });
  }
  if (!rateLimit(`auth:${ip}`, 20, 10 * 60 * 1000)) return fail("Too many attempts. Try again in a few minutes.", 429, "rate_limited");
  await ensureSeeded();
  const user = body.intent === "register" ? await registerUser(body) : await authenticate(body.email, body.password);
  await createSession(user.id);
  return ok({ id: user.id, name: user.name, role: user.role });
});
