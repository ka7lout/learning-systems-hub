"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { addErrorAction, resolveErrorAction, submitAttemptAction, type AttemptOutcome } from "@/app/actions/study";
import { useRun } from "@/components/dashboard-widgets";
import { Prose } from "@/components/ui";

const HELP_LEVELS = ["No Help", "Hint", "Guidance", "Concept Reminder", "Worked Example", "Full Explanation"] as const;

export function AttemptForm({
  assessmentId,
  evaluation,
  rubric,
  expectedPoints,
  choices,
}: {
  assessmentId: string;
  evaluation: "auto" | "mentor" | "self";
  rubric: string[];
  expectedPoints: string[];
  choices?: string[];
}) {
  const { run, pending, error } = useRun();
  const [answer, setAnswer] = useState("");
  const [helpLevel, setHelpLevel] = useState<string>("No Help");
  const [selfRating, setSelfRating] = useState<string>("");
  const [outcome, setOutcome] = useState<AttemptOutcome | null>(null);
  const [revealed, setRevealed] = useState(false);
  const startedAt = useState(() => Date.now())[0];

  return (
    <div>
      {choices && choices.length > 0 ? (
        <fieldset>
          <legend className="label">Choose one</legend>
          <div className="space-y-1.5">
            {choices.map((c, i) => (
              <label key={c} className="flex items-start gap-2 text-sm">
                <input type="radio" name="choice" value={i} checked={answer === String(i)} onChange={() => setAnswer(String(i))} className="mt-1" />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <div>
          <label className="label" htmlFor="answer">Your answer</label>
          <textarea
            id="answer"
            className="textarea"
            rows={9}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write it out before you look at anything else. A partial attempt is worth more than a perfect copy."
            maxLength={20000}
          />
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="help">How much help did you use?</label>
          <select id="help" className="select" value={helpLevel} onChange={(e) => setHelpLevel(e.target.value)}>
            {HELP_LEVELS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <p className="mt-1 text-xs text-ink-3">This is weighted into mastery. Recording it honestly is what makes the number mean anything.</p>
        </div>
        {evaluation !== "auto" && (
          <div>
            <label className="label" htmlFor="self">Self-assessment against the rubric</label>
            <select id="self" className="select" value={selfRating} onChange={(e) => setSelfRating(e.target.value)}>
              <option value="">Leave unjudged</option>
              <option value="1">1 — I could not do it</option>
              <option value="2">2 — Major gaps</option>
              <option value="3">3 — Partly right</option>
              <option value="4">4 — Right, with hesitation</option>
              <option value="5">5 — Right and fluent</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="btn btn-primary"
          disabled={pending || !answer.trim()}
          onClick={() =>
            run(
              () =>
                submitAttemptAction({
                  assessmentId,
                  answer,
                  helpLevel,
                  selfRating: selfRating || undefined,
                  durationSeconds: Math.round((Date.now() - startedAt) / 1000),
                }),
              (data) => setOutcome(data),
            )
          }
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Submit attempt
        </button>
        <button className="btn" onClick={() => setRevealed((v) => !v)} disabled={!answer.trim() && !outcome}>
          {revealed ? "Hide the rubric" : "Show the rubric"}
        </button>
        <span className="text-xs text-ink-3">The rubric unlocks once you have written something.</span>
      </div>

      {error && <p className="mt-3 text-sm" style={{ color: "var(--critical)" }}>{error}</p>}

      {outcome && (
        <div className="mt-4 rounded-lg border border-line p-4">
          <p className="text-sm font-medium">
            {outcome.correct === true ? "Recorded as correct" : outcome.correct === false ? "Recorded as not yet correct" : "Recorded without a judgement"}
          </p>
          <div className="mt-1 text-sm text-ink-2"><Prose text={outcome.feedback} /></div>
          {outcome.nextReviewAt && (
            <p className="mt-1 text-xs text-ink-3">Scheduled for review on {new Date(outcome.nextReviewAt).toLocaleDateString()}.</p>
          )}
          {outcome.correct === null && (
            <p className="mt-1 text-xs text-ink-3">
              No judgement was invented. Compare with the rubric and record a self-assessment, or ask the mentor to check it.
            </p>
          )}
        </div>
      )}

      {(revealed || outcome) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-line p-4">
            <p className="h-section">Rubric</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-2">
              {rubric.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="h-section">Points a complete answer contains</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-2">
              {expectedPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorNotebook({
  entries,
  errorTypes,
  lessonOptions,
}: {
  entries: { _id: string; errorType: string; description: string; correction: string; resolved: boolean; lessonId?: string }[];
  errorTypes: readonly string[];
  lessonOptions: { id: string; title: string }[];
}) {
  const { run, pending, error } = useRun();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ errorType: errorTypes[0] ?? "", lessonId: "", description: "", correction: "" });

  const unresolved = entries.filter((e) => !e.resolved);
  const resolved = entries.filter((e) => e.resolved);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-2">
          {entries.length === 0
            ? "Nothing logged yet. The notebook is for errors you actually made, not for a list of things to avoid."
            : `${unresolved.length} open · ${resolved.length} corrected`}
        </p>
        <button className="btn btn-sm" onClick={() => setOpen((v) => !v)}>{open ? "Cancel" : "Log an error"}</button>
      </div>

      {open && (
        <div className="mt-3 space-y-3 rounded-lg border border-line p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="etype">Type</label>
              <select id="etype" className="select" value={form.errorType} onChange={(e) => setForm({ ...form, errorType: e.target.value })}>
                {errorTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="elesson">Lesson (optional)</label>
              <select id="elesson" className="select" value={form.lessonId} onChange={(e) => setForm({ ...form, lessonId: e.target.value })}>
                <option value="">—</option>
                {lessonOptions.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="edesc">What went wrong</label>
            <textarea id="edesc" className="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
          </div>
          <div>
            <label className="label" htmlFor="ecorr">The correction, in your own words</label>
            <textarea id="ecorr" className="textarea" rows={3} value={form.correction} onChange={(e) => setForm({ ...form, correction: e.target.value })} maxLength={2000} />
          </div>
          <button
            className="btn btn-primary"
            disabled={pending || !form.description.trim() || !form.correction.trim()}
            onClick={() =>
              run(
                () => addErrorAction({ ...form, lessonId: form.lessonId || undefined, skillIds: [] }),
                () => {
                  setForm({ errorType: errorTypes[0] ?? "", lessonId: "", description: "", correction: "" });
                  setOpen(false);
                },
              )
            }
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save entry
          </button>
          {error && <p className="text-xs" style={{ color: "var(--critical)" }}>{error}</p>}
        </div>
      )}

      {entries.length > 0 && (
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {[...unresolved, ...resolved].map((e) => (
            <li key={e._id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-xs font-semibold text-ink-3">{e.errorType}{e.resolved ? " · corrected" : ""}</p>
                <p className="mt-0.5 text-sm">{e.description}</p>
                <p className="mt-0.5 text-sm text-ink-2">→ {e.correction}</p>
              </div>
              {!e.resolved && (
                <button className="btn btn-sm shrink-0" disabled={pending} onClick={() => run(() => resolveErrorAction({ id: e._id }))}>
                  <Check size={13} /> Corrected
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
