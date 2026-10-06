"use client";

import { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";

type Specialist = { id: string; label: string; description: string };

const QUICK_ACTIONS: { label: string; specialist: string; help: string; template: string }[] = [
  { label: "Explain", specialist: "lead_mentor", help: "full_explanation", template: "Explain this concept as a reference explanation." },
  { label: "Give me a hint", specialist: "socratic_tutor", help: "hint", template: "I am stuck. Give me the smallest useful hint — not the answer." },
  { label: "Check my reasoning", specialist: "socratic_tutor", help: "guidance", template: "Check the reasoning in my attempt and point at the first wrong step only." },
  { label: "Simplify", specialist: "lead_mentor", help: "concept_reminder", template: "Simplify the surrounding language but keep the technical terms." },
  { label: "Give an example", specialist: "lead_mentor", help: "worked_example", template: "Give one small worked example." },
  { label: "Challenge me", specialist: "examiner", help: "none", template: "Set me a harder transfer problem on this node. Do not reveal the answer." },
  { label: "Arabic explanation", specialist: "lead_mentor", help: "concept_reminder", template: "اشرح لي الفكرة بالعربية مع الحفاظ على المصطلحات الإنجليزية." },
  { label: "Ask me verbally", specialist: "english_coach", help: "none", template: "Give me one spoken-answer question in English about this node and tell me what a strong answer contains." },
  { label: "Connect to my project", specialist: "project_supervisor", help: "guidance", template: "Connect this node to my active project and name the next concrete deliverable." },
  { label: "Tell me what to write", specialist: "study_coach", help: "guidance", template: "Tell me exactly what belongs in my notebook for this node, and what does not." },
];

export function MentorPanel({
  lessonId,
  specialists,
  providerConfigured,
  englishMode,
  learningState,
}: {
  lessonId: string | null;
  specialists: Specialist[];
  providerConfigured: boolean;
  englishMode: string;
  learningState: string;
}) {
  const [specialist, setSpecialist] = useState("lead_mentor");
  const [helpLevel, setHelpLevel] = useState("hint");
  const [question, setQuestion] = useState("");
  const [attempt, setAttempt] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<{ status: string; content: string; meta?: string } | null>(null);

  async function ask(q: string, spec = specialist, help = helpLevel) {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, specialist: spec, helpLevel: help, question: q, attempt, englishMode, learningState }),
      });
      const data = (await res.json()) as { status: string; content: string; meta?: string };
      setAnswer(data);
    } catch {
      setAnswer({
        status: "error",
        content: "The request to the mentor service failed. Nothing was generated — this is a real failure state, not a simulated answer.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="surface p-4" aria-label="AI mentor">
      <h2 className="text-sm font-medium flex items-center gap-2">
        <MessageSquare size={15} aria-hidden /> AI Mentor Council
      </h2>

      {!providerConfigured ? (
        <p className="text-[11px] mt-2 leading-relaxed" style={{ color: "var(--warn)" }}>
          No AI provider credential is configured in this environment. The mentor will return the stored
          human-authored scaffolding for this node and say so plainly rather than fabricating a model answer.
        </p>
      ) : null}

      <label className="block mt-3">
        <span className="text-xs muted">Specialist</span>
        <select className="field mt-1" value={specialist} onChange={(e) => setSpecialist(e.target.value)}>
          {specialists.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <p className="text-[11px] muted mt-1">{specialists.find((s) => s.id === specialist)?.description}</p>

      <label className="block mt-3">
        <span className="text-xs muted">Maximum help level</span>
        <select className="field mt-1" value={helpLevel} onChange={(e) => setHelpLevel(e.target.value)}>
          {["none", "hint", "guidance", "concept_reminder", "worked_example", "full_explanation"].map((h) => (
            <option key={h} value={h}>
              {h.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="block mt-3">
        <span className="text-xs muted">Your attempt so far (optional but expected)</span>
        <textarea
          className="field mt-1"
          rows={3}
          value={attempt}
          onChange={(e) => setAttempt(e.target.value)}
          placeholder="Paste what you tried. The Socratic Tutor asks for this before explaining."
        />
      </label>

      <label className="block mt-3">
        <span className="text-xs muted">Your question</span>
        <textarea className="field mt-1" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
      </label>

      <button type="button" className="btn btn-primary mt-3" disabled={loading} onClick={() => ask(question)}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : null} Ask the mentor
      </button>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            className="btn"
            disabled={loading}
            onClick={() => {
              setSpecialist(a.specialist);
              setHelpLevel(a.help);
              setQuestion(a.template);
              void ask(a.template, a.specialist, a.help);
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {answer ? (
        <div className="mt-4 surface p-3" style={{ background: "var(--surface-2)" }}>
          <p className="text-[11px] muted mb-1.5">
            {answer.status === "ok" ? answer.meta ?? "mentor response" : `status: ${answer.status}`}
          </p>
          <p className="prose-block text-[13px] whitespace-pre-wrap">{answer.content}</p>
        </div>
      ) : null}
    </aside>
  );
}
