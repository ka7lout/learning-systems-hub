import "server-only";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type ModelTier = "pro" | "flash";

export type AIResult =
  | { ok: true; content: string; model: string; latencyMs: number }
  | { ok: false; code: "not_configured" | "provider_error" | "timeout" | "rate_limited"; message: string; model: string };

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  chat(messages: ChatMessage[], opts: { tier: ModelTier; maxTokens?: number; temperature?: number }): Promise<AIResult>;
}

const PUTER_ENDPOINT = "https://api.puter.com/puterai/openai/v1/chat/completions";

/** Model router: Pro for deep reasoning, Flash for low-latency interactions. */
export function routeModel(tier: ModelTier) {
  const pro = process.env.PUTER_MODEL_NAME || "deepseek/deepseek-v4-pro";
  const flash = process.env.PUTER_FAST_MODEL_NAME || "deepseek/deepseek-v4-flash";
  return tier === "pro" ? pro : flash;
}

class PuterProvider implements AIProvider {
  readonly name = "puter";
  isConfigured() {
    return Boolean(process.env.PUTER_AUTH_TOKEN);
  }
  async chat(messages: ChatMessage[], opts: { tier: ModelTier; maxTokens?: number; temperature?: number }): Promise<AIResult> {
    const model = routeModel(opts.tier);
    const token = process.env.PUTER_AUTH_TOKEN;
    if (!token) return { ok: false, code: "not_configured", message: "AI provider is not configured (PUTER_AUTH_TOKEN missing).", model };
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      const res = await fetch(PUTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ model, messages, max_tokens: opts.maxTokens ?? 1200, temperature: opts.temperature ?? 0.4 }),
        signal: controller.signal,
      });
      if (res.status === 429) return { ok: false, code: "rate_limited", message: "AI provider rate limit reached. Try again shortly.", model };
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, code: "provider_error", message: `AI provider returned ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`, model };
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) return { ok: false, code: "provider_error", message: "AI provider returned an empty response.", model };
      return { ok: true, content, model, latencyMs: Date.now() - started };
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      return { ok: false, code: aborted ? "timeout" : "provider_error", message: aborted ? "AI provider timed out." : `AI provider request failed: ${e instanceof Error ? e.message : "unknown error"}`, model };
    } finally {
      clearTimeout(timer);
    }
  }
}

let provider: AIProvider | null = null;
export function getAIProvider(): AIProvider {
  if (!provider) provider = new PuterProvider();
  return provider;
}
