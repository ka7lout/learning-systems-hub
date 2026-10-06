import { z } from "zod";
import { eq } from "drizzle-orm";
import { learnerProfiles } from "@/db/schema";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";

export const runtime = "nodejs";
const profileInput = z.object({
  learningState: z.enum(["deep", "drift", "fog", "overload"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["en", "ar"]).optional(),
  contentMode: z.enum(["standard", "b1-b2", "english-training"]).optional(),
  vocabularyAssist: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  textScale: z.enum(["default", "large", "largest"]).optional(),
  availableMinutes: z.number().int().min(5).max(180).optional(),
  targetRoleIds: z.array(z.enum(["navisoft-style-ai-engineer", "nuwave-style-production-ai-engineer"])).max(2).optional(),
}).strict();

export async function GET() {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  await ensureCurriculumSeeded();
  await db.insert(learnerProfiles).values({ ownerId: actor.id }).onConflictDoNothing();
  const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.ownerId, actor.id)).limit(1);
  return Response.json({ profile });
}

export async function PATCH(request: Request) {
  const actor = await requireUser();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });
  let parsed: unknown;
  try { parsed = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const validation = profileInput.safeParse(parsed);
  if (!validation.success) return Response.json({ error: "invalid_input", issues: validation.error.flatten() }, { status: 400 });
  if (Object.keys(validation.data).length === 0) return Response.json({ error: "empty_update" }, { status: 400 });
  await db.insert(learnerProfiles).values({ ownerId: actor.id }).onConflictDoNothing();
  const [profile] = await db.update(learnerProfiles)
    .set({ ...validation.data, updatedAt: new Date() })
    .where(eq(learnerProfiles.ownerId, actor.id))
    .returning();
  return Response.json({ profile });
}
