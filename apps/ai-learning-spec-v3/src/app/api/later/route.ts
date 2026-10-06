import { db } from "@/db";
import { laterItems } from "@/db/schema";
import { DEMO_LEARNER_ID } from "@/lib/seed";
import { z } from "zod";

const laterSchema = z.object({ label: z.string().min(2).max(180) });

export async function POST(request: Request) {
  const parsed = laterSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ ok: false, message: "Write a short reminder first." }, { status: 400 });
  await db.insert(laterItems).values({ id: `later-${crypto.randomUUID()}`, learnerId: DEMO_LEARNER_ID, label: parsed.data.label });
  return Response.json({ ok: true, label: parsed.data.label });
}
