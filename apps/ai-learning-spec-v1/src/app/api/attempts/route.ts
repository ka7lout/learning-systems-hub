import { z } from "zod";
import { UnauthorizedError, requireUser } from "@/lib/auth";
import { HELP_LEVELS, recordAttempt } from "@/lib/engine";
import { ensureReady } from "@/lib/data";

export const dynamic = "force-dynamic";

const schema = z.object({
  itemKey: z.string().min(1).max(120),
  responseText: z.string().max(20000),
  helpLevel: z.enum(HELP_LEVELS),
  rubricChecks: z.array(z.boolean()).max(20),
  errorClass: z
    .enum(["concept", "recall", "selection", "execution", "transfer", "attention", "load"])
    .nullable()
    .optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await ensureReady();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 422 });
    }
    const result = await recordAttempt({ userId: user.id, ...parsed.data });
    return Response.json({ ok: true, result });
  } catch (error) {
    if (error instanceof UnauthorizedError) return Response.json({ error: "Sign in required" }, { status: 401 });
    return Response.json({ error: "Could not record attempt" }, { status: 500 });
  }
}
