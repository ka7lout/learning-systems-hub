"use client";
import { useState } from "react";
import { saveLessonProgressAction, submitAttemptAction } from "@/lib/actions";

type Q = {
  id: string;
  questionText: string;
  answer: string | null;
  solution: string | null;
  sourceLabel: string;
  conceptId: string | null;
  difficulty: string;
} | null;

export default function LessonView({
  lessonId,
  initialStatus,
  initialMastery,
  question,
}: {
  lessonId: string;
  initialStatus: string;
  initialMastery: number;
  question: Q;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [mastery, setMastery] = useState(initialMastery);
  const [busy, setBusy] = useState(false);

  const [recall, setRecall] = useState("");
  const [recallDone, setRecallDone] = useState(false);

  const [revealed, setRevealed] = useState(false);
  const [attempted, setAttempted] = useState<null | boolean>(null);

  async function markInProgress() {
    setBusy(true);
    await saveLessonProgressAction({ lessonId, masteryLevel: Math.max(1, mastery), completed: false });
    setStatus("in_progress");
    setBusy(false);
  }
  async function markComplete() {
    setBusy(true);
    await saveLessonProgressAction({ lessonId, masteryLevel: 5, completed: true });
    setStatus("completed");
    setMastery(5);
    setBusy(false);
  }
  async function recordRecall(understood: boolean) {
    setRecallDone(true);
    await saveLessonProgressAction({
      lessonId,
      masteryLevel: understood ? 4 : 2,
      completed: status === "completed",
    });
    setMastery(understood ? 4 : 2);
  }
  async function recordAttempt(correct: boolean) {
    if (!question) return;
    setAttempted(correct);
    await submitAttemptAction({
      questionId: question.id,
      studentAnswer: correct ? "(self-reported correct)" : "(self-reported incorrect)",
      correct,
      timeMs: 0,
      conceptId: question.conceptId,
      mistakeType: correct ? null : "conceptual",
    });
    setRevealed(true);
  }

  return (
    <div className="space-y-6">
      {/* actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        {status !== "completed" ? (
          <>
            <button className="btn btn-ghost" disabled={busy} onClick={markInProgress}>
              Mark in progress
            </button>
            <button className="btn btn-primary" disabled={busy} onClick={markComplete}>
              Mark complete
            </button>
          </>
        ) : (
          <span className="rounded bg-emerald-500/15 px-3 py-1.5 text-sm text-emerald-300">
            Completed · mastery level {mastery}/7
          </span>
        )}
      </div>

      {/* RETRIEVAL */}
      <section className="surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide brand">Retrieve</h3>
        <p className="muted mt-1 text-sm">
          Close the explanation above. In your own words, write what this concept means. Then judge
          yourself honestly.
        </p>
        <textarea
          className="mt-3"
          rows={3}
          value={recall}
          onChange={(e) => setRecall(e.target.value)}
          placeholder="I would explain it as…"
        />
        {!recallDone ? (
          <div className="mt-3 flex gap-2">
            <button
              className="btn btn-primary"
              disabled={!recall.trim()}
              onClick={() => recordRecall(true)}
            >
              I could explain it
            </button>
            <button
              className="btn btn-ghost"
              disabled={!recall.trim()}
              onClick={() => recordRecall(false)}
            >
              I struggled
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-emerald-300">
            Recorded. Retrieval is the most effective study step — come back to it in your review.
          </p>
        )}
      </section>

      {/* PRACTICE */}
      <section className="surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide brand">Practice</h3>
        {!question ? (
          <p className="muted mt-2 text-sm">
            No practice question has been generated for this concept yet. Visit the Practice arena for
            more.
          </p>
        ) : (
          <div className="mt-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-[#13243a] px-2 py-0.5 text-[10px] brand">
                {question.sourceLabel}
              </span>
              <span className="muted text-xs">{question.difficulty}</span>
            </div>
            <p className="text-sm text-slate-100">{question.questionText}</p>
            {!attempted ? (
              <div className="mt-3 flex gap-2">
                <button className="btn btn-primary" onClick={() => recordAttempt(true)}>
                  I solved it correctly
                </button>
                <button className="btn btn-ghost" onClick={() => recordAttempt(false)}>
                  I made a mistake / need to see
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-sm">
                <p className={attempted ? "text-emerald-300" : "text-red-300"}>
                  {attempted ? "Marked correct." : "Marked incorrect — recorded as a mistake."}
                </p>
                {question.answer && (
                  <p className="muted">
                    <b className="text-slate-200">Answer:</b> {question.answer}
                  </p>
                )}
                {question.solution && (
                  <p className="muted">
                    <b className="text-slate-200">Solution:</b> {question.solution}
                  </p>
                )}
              </div>
            )}
            {!revealed && attempted === null && (
              <button className="btn btn-ghost mt-3 text-sm" onClick={() => setRevealed(true)}>
                Reveal answer
              </button>
            )}
            {revealed && attempted === null && (
              <div className="mt-3 space-y-2 text-sm">
                {question.answer && (
                  <p className="muted">
                    <b className="text-slate-200">Answer:</b> {question.answer}
                  </p>
                )}
                {question.solution && (
                  <p className="muted">
                    <b className="text-slate-200">Solution:</b> {question.solution}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
