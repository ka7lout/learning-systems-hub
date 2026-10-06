import "server-only";

/**
 * AI PROVIDER ABSTRACTION (§200, §201).
 *
 * Puter is the initial provider. Nothing else in the codebase calls it directly.
 * When no token is configured the provider reports `provider_unavailable` and
 * the UI shows a truthful failure state — it never fabricates a mentor reply
 * (§216, §242 "Do not ship fake success states").
 */

export type ModelTier = "pro" | "flash";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type ProviderResult =
  | { status: "ok"; text: string; model: string; latencyMs: number }
  | { status: "provider_unavailable"; reason: string }
  | { status: "error"; reason: string; model?: string };

export interface AIProvider {
  readonly name: string;
  readonly configured: boolean;
  chat(messages: ChatMessage[], tier: ModelTier, signal?: AbortSignal): Promise<ProviderResult>;
}

const MODELS: Record<ModelTier, string> = {
  pro: process.env.PUTER_MODEL_NAME || "deepseek/deepseek-v4-pro",
  flash: process.env.PUTER_FAST_MODEL_NAME || "deepseek/deepseek-v4-flash",
};

class PuterProvider implements AIProvider {
  readonly name = "puter";
  get configured(): boolean {
    return Boolean(process.env.PUTER_AUTH_TOKEN);
  }

  async chat(messages: ChatMessage[], tier: ModelTier, signal?: AbortSignal): Promise<ProviderResult> {
    const token = process.env.PUTER_AUTH_TOKEN;
    const model = MODELS[tier];
    if (!token) {
      return {
        status: "provider_unavailable",
        reason: "PUTER_AUTH_TOKEN is not configured on the server. The mentor cannot answer until a provider is connected.",
      };
    }
    const base = process.env.PUTER_BASE_URL || "https://api.puter.com";
    const started = Date.now();
    try {
      const res = await fetch(`${base}/drivers/call`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver: "openai-completion",
          method: "complete",
          args: { messages, model },
        }),
        signal,
      });
      if (!res.ok) {
        return { status: "error", reason: `Provider responded ${res.status}`, model };
      }
      const data = (await res.json()) as { result?: { message?: { content?: unknown } }; error?: { message?: string } };
      if (data.error) return { status: "error", reason: data.error.message ?? "Unknown provider error", model };
      const content = data.result?.message?.content;
      const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c) => (c as { text?: string }).text ?? "").join("") : "";
      if (!text) return { status: "error", reason: "Provider returned an empty completion", model };
      return { status: "ok", text, model, latencyMs: Date.now() - started };
    } catch (err) {
      return { status: "error", reason: err instanceof Error ? err.message : "Network failure", model };
    }
  }
}

let provider: AIProvider | null = null;
export function getProvider(): AIProvider {
  if (!provider) provider = new PuterProvider();
  return provider;
}

/** §201 — routing policy, kept in one place so it can be audited and replaced. */
export function routeModel(task: string): ModelTier {
  const pro = [
    "socratic",
    "examiner",
    "code_reviewer",
    "project_supervisor",
    "research_specialist",
    "curriculum_auditor",
    "system_design",
    "architecture",
    "math",
  ];
  return pro.includes(task) ? "pro" : "flash";
}
