"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, readState, type LearningState } from "@/lib/client";

export type PracticeItemView = { id: string; nodeId: string; nodeTitle?: string; type: string; difficulty: string; prompt: string; rubric: string[]; reference: string; isTransfer: boolean };

const HELP = [
  { v: "none", label: "No help" },
  { v: "hint", label: "Hint" },
  { v: "guidance", label: "Guidance" },
  { v: "concept_reminder", label: "Concept reminder" },
  { v: "worked_example", label: "Worked example" },
  { v: "full_explanation", label: "Full explanation" },
];
const ERRORS = [
  { v: "", label: "No error / not sure" },
  { v: "concept", label: "Concept — I did not understand it" },
  { v: "recall", label: "Recall — I knew it but forgot" },
  { v: "selection", label: "Selection — I chose the wrong tool" },
  { v: "execution", label: "Execution — right plan, wrong steps" },
  { v: "transfer", label: "Transfer — new context broke it" },
  { v: "attention", label: "Attention — I lost focus" },
  { v: "load", label: "Load — too much at once" },
];
const PROFILE: Record<LearningState, { n: number; max: string; note: string }> = {
  deep: { n: 4, max: "F", note: "Focused: a full block. We continue while quality stays high." },
  drift: { n: 1, max: "D", note: "Drifting: one question, one attempt, feedback, then decide." },
  fog: { n: 2, max: "C", note: "Starting feels hard: easy recall first, then one step up." },
  overload: { n: 1, max: "B", note: "Too much at once: one easy item, worked example available." },
};
const ORDER = ["A", "B", "C", "D", "E", "F"];

export function PracticeBlock({ items, isReview, title }: { items: PracticeItemView[]; isReview?: boolean; title?: string }) {
  const router = useRouter();
  const [state, setState] = useState<LearningState>("deep");
  const [idx, setIdx] = useState(0);
  const [response, setResponse] = useState("");
  const [help, setHelp] = useState("none");
  const [revealed, setRevealed] = useState(false);
  const [selfScore, setSelfScore] = useState<number | null>(null);
  const [errorType, setErrorType] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; msg?: string; level?: number }>({ kind: "idle" });
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setState(readState());
    sync();
    window.addEventListener("ihl-state-change", sync);
    return () => window.removeEventListener("ihl-state-change", sync);
  }, []);

  const profile = PROFILE[state];
  const block = useMemo(() => {
    const allowed = items.filter((i) => ORDER.indexOf(i.difficulty) <= ORDER.indexOf(profile.max) && !done.includes(i.id));
    const sorted = [...allowed].sort((a, b) => ORDER.indexOf(a.difficulty) - ORDER.indexOf(b.difficulty));
    return sorted.slice(0, profile.n);
  }, [items, profile, done]);
  const item = block[Math.min(idx, block.length - 1)];

  async function submit() {
    if (!item || selfScore === null || response.trim().length === 0) return;
    setStatus({ kind: "saving" });
    const r = await api<{ mastery: { level: number } }>("/api/practice", { intent: "attempt", itemId: item.id, response, selfScore, helpLevel: help, learningState: state, isReview: Boolean(isReview), errorType: errorType || null });
    if (!r.ok) return setStatus({ kind: "error", msg: r.error.message });
    setStatus({ kind: "saved", level: r.data.mastery.level });
  }
  function next() {
    if (item) setDone((d) => [...d, item.id]);
    setIdx(0);
    setResponse(""); setHelp("none"); setRevealed(false); setSelfScore(null); setErrorType(""); setStatus({ kind: "idle" });
    router.refresh();
  }

  if (!items.length) return <div className="card p-5 text-sm text-muted">No practice items for this block yet.</div>;
  if (!item) return (
    <div className="card p-5">
      <div className="font-semibold">Block complete</div>
      <p className="mt-1 text-sm text-muted">{done.length} item(s) recorded. The review scheduler has set the next retrieval date. Consider a short break or move to transfer/project work.</p>
      <button className="btn mt-3" onClick={() => setDone([])}>Start another block</button>
    </div>
  );

  return (
    <section className="card p-5" aria-label={title ?? "Practice"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">{title ?? (isReview ? "Spaced review" : "Practice")}</div>
        <div className="text-xs text-muted">{profile.note}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="badge">{item.type.replace(/_/g, " ")}</span>
        <span className="badge">Level {item.difficulty}</span>
        {item.isTransfer && <span className="badge !bg-accent-soft !text-accent-strong">transfer</span>}
        {item.nodeTitle && <span className="badge">{item.nodeTitle}</span>}
        <span className="badge">{Math.min(idx + 1, block.length)} / {block.length}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{item.prompt}</p>

      <label className="mt-4 block text-sm font-medium" htmlFor={`resp-${item.id}`}>Your attempt (close your sources first)</label>
      <textarea id={`resp-${item.id}`} value={response} onChange={(e) => setResponse(e.target.value)} rows={6} className="input mt-1 resize-y font-mono text-sm" placeholder="Write your reasoning, calculation, code or decision here…" maxLength={20000} />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Help you used
          <select value={help} onChange={(e) => setHelp(e.target.value)} className="input mt-1">{HELP.map((h) => <option key={h.v} value={h.v}>{h.label}</option>)}</select>
        </label>
        <label className="text-sm">If you missed something, what kind of error?
          <select value={errorType} onChange={(e) => setErrorType(e.target.value)} className="input mt-1">{ERRORS.map((h) => <option key={h.v} value={h.v}>{h.label}</option>)}</select>
        </label>
      </div>

      <div className="mt-4">
        {!revealed ? (
          <button className="btn" onClick={() => setRevealed(true)} disabled={response.trim().length < 10}>Show rubric {item.reference ? "and reference" : ""} (after a real attempt)</button>
        ) : (
          <div className="rounded-lg border border-border bg-surface-2 p-3 text-sm">
            <div className="font-medium">A strong answer includes</div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">{item.rubric.map((r) => <li key={r}>{r}</li>)}</ul>
            {item.reference && <><div className="mt-2 font-medium">Reference</div><pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{item.reference}</pre></>}
            <div className="mt-3 font-medium">Honest self-score against the rubric</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {[["0", "Blank / wrong"], ["1", "Partial"], ["2", "Mostly"], ["3", "Complete"]].map(([v, l]) => (
                <button key={v} onClick={() => setSelfScore(Number(v))} className={`btn !py-1 text-xs ${selfScore === Number(v) ? "!border-accent !bg-accent-soft" : ""}`}>{v} — {l}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status.kind !== "saved" ? (
          <button className="btn btn-primary" onClick={submit} disabled={!revealed || selfScore === null || status.kind === "saving"}>{status.kind === "saving" ? "Saving…" : "Record attempt"}</button>
        ) : (
          <>
            <span className="rounded-md bg-ok-soft px-3 py-1.5 text-sm text-ok">Recorded. Mastery now: L{status.level}. Next review scheduled.</span>
            <button className="btn" onClick={next}>Next</button>
          </>
        )}
        {status.kind === "error" && <span role="alert" className="text-sm text-danger">{status.msg}</span>}
      </div>
    </section>
  );
}
