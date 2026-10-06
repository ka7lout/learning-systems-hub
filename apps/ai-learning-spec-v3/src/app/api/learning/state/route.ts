import { db } from "@/db";
import { learners } from "@/db/schema";
import { DEMO_LEARNER_ID } from "@/lib/seed";
import { z } from "zod";
import { eq } from "drizzle-orm";

const stateSchema = z.object({
  state: z.enum(["deep", "drift", "fog", "overload"]),
});

export async function POST(request: Request) {
  try {
    const parsed = stateSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ ok: false, message: "Choose a valid learning state." }, { status: 400 });
    await db.update(learners).set({ learningState: parsed.data.state, updatedAt: new Date() }).where(eq(learners.id, DEMO_LEARNER_ID));
    return Response.json({ ok: true, state: parsed.data.state });
  } catch {
    return Response.json({ ok: false, message: "Could not save the learning state. Try again." }, { status: 500 });
  }
}
