"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  Lightbulb,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

type Context = { type: string; slug: string; title: string };

const QUICK_PROMPTS = [
  { label: "Give me a hint", text: "Give me a small hint on this topic, not the full answer." },
  { label: "Why does this matter?", text: "Why does this matter for me as an AI engineer? Be specific." },
  { label: "I'm stuck", text: "I'm stuck. Start by asking me what I've already tried." },
  { label: "Give me a tiny example", text: "Give me a minimal worked example for this concept." },
  { label: "Test me", text: "Ask me one question about this to test my understanding. Don't show the answer yet." },
];

const STATE_OPTIONS = [
  { value: "deep", label: "I'm focused" },
  { value: "drift", label: "I'm drifting" },
  { value: "fog", label: "Starting feels hard" },
  { value: "overload", label: "Too much at once" },
];

export function MentorPanel({ initialContext }: { initialContext?: Context }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: initialContext
        ? `Hi. I'm your Lead Mentor. You're looking at **${initialContext.title}**. Before I explain anything, what do you currently understand? Or try one of the quick prompts below. I will usually ask for your attempt before I give you a full answer.`
        : `Hi. I'm your Lead Mentor. Tell me what you're working on. You can also ask for a hint, an example, or for me to test you. I will not do your work for you.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState("deep");
  const [error, setError] = useState<string | null>(null);
  const [specialist, setSpecialist] = useState("lead_mentor");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(customText?: string) {
    const text = (customText ?? input).trim();
    if (!text || loading) return;
    setError(null);

    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          threadId,
          specialist,
          learningState: state,
          contextType: initialContext?.type,
          contextSlug: initialContext?.slug,
        }),
      });
      if (!res.ok) {
        throw new Error(`Mentor returned ${res.status}`);
      }
      const data = await res.json();
      if (data.threadId) setThreadId(data.threadId);
      setMessages((m) => [...m, { role: "assistant", content: data.content }]);
    } catch (e: any) {
      setError(e.message || "Mentor is unavailable. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl flex flex-col h-full min-h-[600px] xl:min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-navy-600 flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-tight">AI Mentor</div>
            <div className="text-[11px] text-[rgb(var(--text-subtle))]">Socratic · attempt-first · evidence-based</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={specialist}
              onChange={(e) => setSpecialist(e.target.value)}
              className="appearance-none bg-[rgb(var(--surface-alt))] border border-[rgb(var(--border))] rounded-md text-xs px-2 py-1 pr-7 cursor-pointer focus:outline-none focus:border-navy-500"
            >
              <option value="lead_mentor">Lead Mentor</option>
              <option value="socratic_tutor">Socratic Tutor</option>
              <option value="code_reviewer">Code Reviewer</option>
              <option value="examiner">Examiner</option>
              <option value="project_supervisor">Project Supervisor</option>
              <option value="career_analyst">Career Analyst</option>
              <option value="study_coach">Study Coach</option>
              <option value="english_coach">English Coach</option>
              <option value="research_specialist">Research Specialist</option>
            </select>
            <ChevronDown className="h-3 w-3 text-[rgb(var(--text-subtle))] pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="appearance-none bg-[rgb(var(--surface-alt))] border border-[rgb(var(--border))] rounded-md text-xs px-2 py-1 pr-7 cursor-pointer focus:outline-none focus:border-navy-500"
              title="How studying feels right now"
            >
              {STATE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 text-[rgb(var(--text-subtle))] pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "assistant" && (
              <div className="h-7 w-7 rounded-full bg-navy-100 dark:bg-navy-900 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-navy-700 dark:text-navy-300" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap break-words",
                m.role === "user"
                  ? "bg-navy-600 text-white rounded-br-sm"
                  : "bg-[rgb(var(--surface-alt))] text-[rgb(var(--text))] rounded-bl-sm"
              )}
              dangerouslySetInnerHTML={{
                __html: m.content
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                  .replace(/`([^`]+)`/g, "<code class=\"font-mono text-[0.85em] bg-black/10 dark:bg-white/10 px-1 rounded\">$1</code>"),
              }}
            />
            {m.role === "user" && (
              <div className="h-7 w-7 rounded-full bg-[rgb(var(--surface-alt))] flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="h-7 w-7 rounded-full bg-navy-100 dark:bg-navy-900 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-navy-700 dark:text-navy-300" />
            </div>
            <div className="bg-[rgb(var(--surface-alt))] rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[rgb(var(--text-subtle))]" />
              <span className="text-xs text-[rgb(var(--text-subtle))]">Thinking…</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex gap-2 justify-start">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-1" />
            <div className="text-xs text-red-600 dark:text-red-400">{error}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => send(p.text)}
              disabled={loading}
              className="text-[11px] px-2 py-1 rounded-md border border-[rgb(var(--border))] hover:bg-[rgb(var(--surface-alt))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition disabled:opacity-50"
            >
              <Lightbulb className="h-3 w-3 inline mr-1 -mt-0.5" />
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[rgb(var(--border))]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything, or paste your attempt…"
            rows={2}
            disabled={loading}
            className="flex-1 resize-none rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 text-sm focus:outline-none focus:border-navy-500 disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="h-9 w-9 shrink-0 rounded-lg bg-navy-600 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-[rgb(var(--text-subtle))] mt-1.5 px-1">
          Shift+Enter for newline. The mentor will ask for your attempt before giving full solutions.
        </p>
      </div>
    </div>
  );
}
