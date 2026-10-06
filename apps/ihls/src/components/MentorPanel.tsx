"use client";

import { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Prose } from "@/components/ui";

export interface MentorAction {
  id: string;
  label: string;
  helpLevel: string;
}

type Msg = {
  role: "student" | "mentor";
  content: string;
  status?: "ok" | "provider_unavailable" | "error";
  note?: string;
  specialist?: string;
  helpLevel?: string;
};

/**
 * Mentor conversation surface. A failed provider call is displayed as a failure,
 * never replaced with a canned answer (§216, §242).
 */
export function MentorPanel({
  actions,
  lessonId,
  assessmentId,
  providerConfigured,
  compact = false,
  initialThreadId,
  initialMessages = [],
}: {
  actions: MentorAction[];
  lessonId?: string;
  assessmentId?: string;
  providerConfigured: boolean;
  compact?: boolean;
  initialThreadId?: string;
  initialMessages?: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [action, setAction] = useState(actions[0]?.id ?? "explain");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadId = useRef<string | undefined>(initialThreadId);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setBusy(true);
    setError(null);
    setMessages((m) => [...m, { role: "student", content: question }]);
    setInput("");
    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentQuestion: question, action, lessonId, assessmentId, threadId: threadId.current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "The mentor request failed.");
        setBusy(false);
        return;
      }
      threadId.current = data.threadId;
      setMessages((m) => [
        ...m,
        {
          role: "mentor",
          content: data.content ?? "",
          status: data.status,
          note: data.message,
          specialist: data.specialist,
          helpLevel: data.helpLevel,
        },
      ]);
    } catch {
      setError("The mentor could not be reached. Your question was not answered.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col">
      {!providerConfigured && (
        <div className="border-b border-line px-5 py-3 text-sm" style={{ color: "var(--caution)" }}>
          The AI provider is not configured on this deployment (no <code>PUTER_AUTH_TOKEN</code>). Requests will return a truthful
          failure rather than an invented answer. Everything else on this page works.
        </div>
      )}

      <div className={`space-y-4 overflow-y-auto px-5 py-4 scroll-thin ${compact ? "max-h-[22rem]" : "min-h-[16rem]"}`}>
        {messages.length === 0 && (
          <p className="text-sm text-ink-3">
            Ask about the thing you are stuck on. The mentor starts with the smallest useful hint — choose a different action below if
            you want more.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i}>
            {m.role === "student" ? (
              <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--surface-3)" }}>
                <p className="mb-0.5 text-xs font-semibold text-ink-3">You</p>
                {m.content}
              </div>
            ) : m.status === "ok" ? (
              <div className="text-sm">
                <p className="mb-1 text-xs font-semibold text-ink-3">
                  {m.specialist}
                  {m.helpLevel ? ` · help level: ${m.helpLevel}` : ""}
                </p>
                <Prose text={m.content} />
              </div>
            ) : (
              <div role="alert" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--critical)", color: "var(--critical)" }}>
                <p className="font-medium">{m.status === "provider_unavailable" ? "AI provider unavailable" : "Mentor request failed"}</p>
                <p className="mt-0.5">{m.note ?? "No answer was produced. Nothing was generated to fill the gap."}</p>
              </div>
            )}
          </div>
        ))}
        {busy && (
          <p className="flex items-center gap-2 text-sm text-ink-3">
            <Loader2 size={14} className="animate-spin" /> Thinking…
          </p>
        )}
      </div>

      <form onSubmit={send} className="border-t border-line px-5 py-3">
        <label className="label" htmlFor="mentor-action">Action</label>
        <select id="mentor-action" className="select" value={action} onChange={(e) => setAction(e.target.value)}>
          {actions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label} — {a.helpLevel}
            </option>
          ))}
        </select>
        <div className="mt-2 flex gap-2">
          <textarea
            className="textarea"
            rows={compact ? 2 : 3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            placeholder="What exactly is blocking you?"
            aria-label="Your question"
            maxLength={4000}
          />
          <button type="submit" className="btn btn-primary self-end" disabled={busy || !input.trim()}>
            <Send size={14} /> Ask
          </button>
        </div>
        {error && <p className="mt-2 text-xs" style={{ color: "var(--critical)" }}>{error}</p>}
      </form>
    </div>
  );
}
