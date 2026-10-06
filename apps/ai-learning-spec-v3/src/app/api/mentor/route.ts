import { z } from "zod";

const mentorSchema = z.object({
  message: z.string().min(2).max(4000),
  helpLevel: z.enum(["hint", "guidance", "concept_reminder", "worked_example", "full_explanation"]).default("hint"),
  context: z.string().max(500).optional(),
});

function structuredCoach(message: string, helpLevel: string) {
  const lower = message.toLowerCase();
  if (lower.includes("loop") || lower.includes("continue") || lower.includes("break")) {
    return helpLevel === "worked_example"
      ? "Use a trace table with columns for iteration, condition, output, and the exact point where control changes. First predict the row before running anything."
      : "Hint: trace one iteration at a time. Mark the first condition that becomes false, then mark whether `continue` skips the rest of the body or `break` exits the loop."
  }
  if (lower.includes("gradient") || lower.includes("derivative")) {
    return "Start with the objective, not the optimizer. Ask: which direction increases the loss, and what sign should the update use to reduce it? Write one scalar example before generalizing to a vector."
  }
  if (lower.includes("sql") || lower.includes("query")) {
    return "Before changing the query, state the grain of each table and the expected row count after every JOIN. A surprising count is evidence, not noise."
  }
  return "I can help you reason through this. Write your current attempt, name the assumption you are least sure about, and include one example or error. I’ll respond with the smallest useful next step instead of replacing your thinking."
}

export async function POST(request: Request) {
  const parsed = mentorSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ ok: false, message: "Tell the mentor what you tried first." }, { status: 400 });

  const providerConfigured = Boolean(process.env.PUTER_AUTH_TOKEN);
  if (!providerConfigured) {
    return Response.json({ ok: true, provider: "structured-coach", configured: false, message: structuredCoach(parsed.data.message, parsed.data.helpLevel), note: "Puter is not configured in this environment, so this is a bounded learning scaffold rather than a model-generated answer." });
  }

  return Response.json({ ok: true, provider: "puter-ready", configured: true, message: structuredCoach(parsed.data.message, parsed.data.helpLevel), note: "Provider routing is isolated here; add the verified Puter server contract before enabling external inference." });
}
