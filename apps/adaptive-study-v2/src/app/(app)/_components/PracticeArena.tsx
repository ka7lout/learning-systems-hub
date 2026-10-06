"use client";
import { useMemo, useState } from "react";
import { submitAttemptAction } from "@/lib/actions";

export type PQ = {
  id: string;
  questionText: string;
  answer: string | null;
  solution: string | null;
  sourceLabel: string;
  difficulty: string;
  skill: string | null;
  courseId: string;
};
type Course = { id: string; code: string; title: string };

const DIFFS = ["easy", "normal", "hard", "boss", "recovery"];

export default function PracticeArena({
  questions,
  courses,
}: {
  questions: PQ[];
  courses: Course[];
}) {
  const [courseId, setCourseId] = useState("all");
  const [diff, setDiff] = useState("all");
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(
    () =>
      questions.filter(
        (q) =>
          (courseId === "all" || q.courseId === courseId) &&
          (diff === "all" || q.difficulty === diff),
      ),
    [questions, courseId, diff],
  );

  const q = list[index];

  function reset() {
    setAnswered(null);
  }
  async function answer(correct: boolean) {
    if (!q) return;
    setBusy(true);
    reset();
    await submitAttemptAction({
      questionId: q.id,
      studentAnswer: correct ? "(self-reported correct)" : "(self-reported incorrect)",
      correct,
      timeMs: 0,
      conceptId: null,
      mistakeType: correct ? null : "conceptual",
    });
    setAnswered(correct);
    setBusy(false);
  }
  function next() {
    reset();
    setIndex((i) => (i + 1) % Math.max(1, list.length));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setIndex(0); reset(); }} className="w-auto">
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </select>
        <select value={diff} onChange={(e) => { setDiff(e.target.value); setIndex(0); reset(); }} className="w-auto">
          <option value="all">All difficulties</option>
          {DIFFS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span className="muted self-center text-sm">
          {list.length} question{list.length === 1 ? "" : "s"}
        </span>
      </div>

      {!q ? (
        <p className="surface-2 p-4 text-sm muted">
          No practice questions match this filter. The question bank is generated from your
          curriculum; add more by studying lessons or importing source material.
        </p>
      ) : (
        <div className="surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-[#13243a] px-2 py-0.5 text-[10px] brand">{q.sourceLabel}</span>
            <span className="rounded bg-[#13243a] px-2 py-0.5 text-[10px] muted">{q.difficulty}</span>
            {q.skill && <span className="muted text-xs">{q.skill}</span>}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{q.questionText}</p>

          {answered === null && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn btn-primary" disabled={busy} onClick={() => answer(true)}>
                I solved it correctly
              </button>
              <button className="btn btn-ghost" disabled={busy} onClick={() => answer(false)}>
                I made a mistake / reveal
              </button>
            </div>
          )}

          {answered !== null && (
            <div className="mt-4 space-y-3">
              <p className={answered ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
                {answered ? "Recorded as correct." : "Recorded as a mistake for review."}
              </p>
              {q.answer && (
                <p className="text-sm">
                  <b className="muted">Answer:</b> <span className="text-slate-100">{q.answer}</span>
                </p>
              )}
              {q.solution && (
                <p className="text-sm">
                  <b className="muted">Solution:</b>{" "}
                  <span className="text-slate-100 whitespace-pre-wrap">{q.solution}</span>
                </p>
              )}
              <button className="btn btn-primary" onClick={next}>
                Next question →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
