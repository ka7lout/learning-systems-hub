"use client";
import { useEffect, useRef, useState } from "react";
import { api, readState, type LearningState } from "@/lib/client";

const ACTIONS: { a: string; label: string; needsText?: boolean }[] = [
  { a: "explain", label: "Explain" },
  { a: "hint", label: "Give me a hint", needsText: true },
  { a: "check_reasoning", label: "Check my reasoning", needsText: true },
  { a: "simplify", label: "Simplify" },
  { a: "example", label: "Give an example" },
  { a: "challenge", label: "Challenge me" },
  { a: "arabic", label: "Arabic explanation" },
  { a: "b1b2", label: "B1–B2 English" },
  { a: "oral", label: "Ask me verbally" },
  { a: "connect_project", label: "Connect to project" },
  { a: "what_to_write", label: "Tell me what to write" },
];

type Msg = { role: "user" | "assistant"; content: string; specialist?: string; error?: boolean };

export function MentorPanel({ nodeId, nodeTitle, compact, initialThread }: { nodeId?: string | null; nodeTitle?: string; compact?: boolean; initialThread?: { id: string; messages: Msg[] } }) {
  const [threadId, setThreadId] = useState<string | null>(initialThread?.id ?? null);
  const [msgs, setMsgs] = useState<Msg[]>(initialThread?.messages ?? []);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<LearningState>("deep");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setState(readState());
    sync();
    window.addEventListener("ihl-state-change", sync);
    return () => window.removeEventListener("ihl-state-change", sync);
  }, []);
  useEffect(() => endRef.current?.scrollIntoView({ block: "nearest" }), [msgs]);

  async function send(action: string, override?: string) {
    const message = (override ?? text).trim() || defaultMessage(action, nodeTitle);
    if (!message) return;
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: message }]);
    setText("");
    const r = await api<{ threadId: string; content: string; specialist: string }>("/api/mentor", { threadId, nodeId: nodeId ?? null, action, message, learningState: state });
    setBusy(false);
    if (!r.ok) {
      setMsgs((m) => [...m, { role: "assistant", content: r.error.code === "not_configured" ? "The AI Mentor is not available: the AI provider is not configured on this deployment (PUTER_AUTH_TOKEN). Lessons, practice, review and projects continue to work without it." : `Mentor request failed: ${r.error.message}`, error: true }]);
      return;
    }
    setThreadId(r.data.threadId);
    setMsgs((m) => [...m, { role: "assistant", content: r.data.content, specialist: r.data.specialist }]);
  }

  return (
    <section aria-label="AI Mentor" className={`card flex flex-col ${compact ? "" : "min-h-[28rem]"}`}>
      <div className="border-b border-border px-4 py-2.5">
        <div className="text-sm font-semibold">AI Mentor</div>
        <div className="text-xs text-muted">Attempt first. Hints before answers. Full explanations when you ask explicitly.</div>
      </div>
      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2">
        {ACTIONS.map((x) => (
          <button key={x.a} disabled={busy} onClick={() => send(x.a)} className="btn !py-1 text-xs">{x.label}</button>
        ))}
      </div>
      <div className={`flex-1 space-y-3 overflow-y-auto px-4 py-3 ${compact ? "max-h-72" : "max-h-[32rem]"}`}>
        {msgs.length === 0 && <p className="text-sm text-muted">No conversation yet. Write your attempt or question, then choose an action.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-6 bg-accent-soft" : m.error ? "mr-6 bg-danger-soft text-danger" : "mr-6 bg-surface-2"}`}>
            {m.specialist && <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{m.specialist}</div>}
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}
        {busy && <div className="mr-6 rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">Thinking…</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send("free"); }} className="flex gap-2 border-t border-border px-4 py-3">
        <label htmlFor={`mentor-input-${nodeId ?? "general"}`} className="sr-only">Your attempt or question</label>
        <textarea id={`mentor-input-${nodeId ?? "general"}`} value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Write your attempt, reasoning, or question…" className="input resize-y" maxLength={8000} />
        <button className="btn btn-primary self-end" disabled={busy || !text.trim()}>Send</button>
      </form>
    </section>
  );
}

function defaultMessage(action: string, title?: string) {
  const t = title ? ` for "${title}"` : "";
  switch (action) {
    case "explain": return `Give me a reference explanation${t}: intuition, precise idea, one worked example, one failure mode, where it is used.`;
    case "simplify": return `Simplify the core idea${t} without removing the real concept.`;
    case "example": return `Give me one small, concrete example${t}.`;
    case "challenge": return `Give me one harder transfer problem${t}.`;
    case "arabic": return `اشرح لي الفكرة الأساسية${title ? ` في "${title}"` : ""} بالعربية مع الإبقاء على المصطلحات الإنجليزية.`;
    case "b1b2": return `Explain the core idea${t} in B1–B2 English, keeping the technical terms.`;
    case "oral": return `Ask me one oral question${t} and wait for my answer.`;
    case "connect_project": return `Connect${t} to my active project or a project in the ladder with one evidence-producing task.`;
    case "what_to_write": return `Tell me exactly what to write in my notebook${t}.`;
    case "hint": return "";
    case "check_reasoning": return "";
    default: return "";
  }
}
