import { z } from "zod";

export type ProviderMessage = { role: "system" | "user" | "assistant"; content: string };
export type ProviderResult = { provider: "puter"; model: string; content: string; latencyMs: number };
export type ModelTier = "fast" | "reasoning";

const responseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.union([z.string(), z.array(z.unknown())]) }) })).min(1),
});

export class AIProviderError extends Error {
  constructor(readonly code: "not_configured" | "provider_failed" | "invalid_response", message: string) {
    super(message);
    this.name = "AIProviderError";
  }
}

export interface AIProvider {
  chat(messages: ProviderMessage[], tier: ModelTier): Promise<ProviderResult>;
}

export class PuterAIProvider implements AIProvider {
  async chat(messages: ProviderMessage[], tier: ModelTier): Promise<ProviderResult> {
    const token = process.env.PUTER_AUTH_TOKEN;
    if (!token) throw new AIProviderError("not_configured", "The AI provider is not configured.");
    const model = tier === "fast"
      ? "deepseek/deepseek-v4-flash"
      : (process.env.PUTER_MODEL_NAME?.trim() || "deepseek/deepseek-v4-pro");
    const started = Date.now();
    let response: Response;
    try {
      response = await fetch("https://api.puter.com/puterai/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, max_tokens: 1100, temperature: 0.35, stream: false }),
        signal: AbortSignal.timeout(45_000),
        cache: "no-store",
      });
    } catch {
      throw new AIProviderError("provider_failed", "The AI provider could not be reached.");
    }
    if (!response.ok) throw new AIProviderError("provider_failed", `The AI provider returned an error (${response.status}).`);
    let raw: unknown;
    try { raw = await response.json(); } catch { throw new AIProviderError("invalid_response", "The AI provider returned an unreadable response."); }
    const parsed = responseSchema.safeParse(raw);
    if (!parsed.success) throw new AIProviderError("invalid_response", "The AI provider response did not match the expected format.");
    const rawContent = parsed.data.choices[0]?.message.content;
    const content = typeof rawContent === "string"
      ? rawContent
      : rawContent.map((part) => typeof part === "object" && part !== null && "text" in part && typeof part.text === "string" ? part.text : "").join("").trim();
    if (!content) throw new AIProviderError("invalid_response", "The AI provider returned no text response.");
    return { provider: "puter", model, content, latencyMs: Date.now() - started };
  }
}

export const aiProvider: AIProvider = new PuterAIProvider();
