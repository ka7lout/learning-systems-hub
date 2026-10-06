"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { gradeReviewAction } from "@/app/actions/study";
import { useRun } from "@/components/dashboard-widgets";
import { Chip, Prose } from "@/components/ui";

export interface ReviewCard {
  assessmentId: string;
  lessonId: string;
  lessonTitle: string;
  prompt: string;
  rubric: string[];
  expectedPoints: string[];
  dueAt: string;
  reps: number;
  lapses: number;
}

/**
 * One card at a time. The answer stays hidden until the student commits to an
 * attempt — showing it first turns retrieval practice into re-reading.
 */
export function ReviewRunner({ cards }: { cards: ReviewCard[] }) {
  const { run, pending, error } = useRun();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [helpUsed, setHelpUsed] = useState(false);
  const [done, setDone] = useState<string[]>([]);

  const remaining = cards.filter((c) => !done.includes(c.assessmentId));
  const card = remaining[Math.min(index, Math.max(0, remaining.length - 1))];

  if (!card) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm font-medium">Review queue is clear.</p>
        <p className="mt-1 text-sm text-ink-3">Nothing else is due right now. The next items appear on their scheduled dates.</p>
      </div>
    );
  }

  const grade = (passed: boolean) => {
    run(
      () => gradeReviewAction({ assessmentId: card.assessmentId, passed, helpUsed }),
      () => {
        setDone((d) => [...d, card.assessmentId]);
        setRevealed(false);
        setHelpUsed(false);
        setIndex(0);
      },
    );
  };

  return (
    <div className="card-pad">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-3">
          {remaining.length} due · due since {new Date(card.dueAt).toLocaleDateString()} · {card.reps} reps · {card.lapses} lapses
        </p>
        <Link href={`/learn/${card.lessonId}`} className="text-xs underline underline-offset-2">{card.lessonTitle}</Link>
      </div>

      <div className="mt-3">
        <Prose text={card.prompt} />
      </div>

      {!revealed ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" onClick={() => setRevealed(true)}>I have answered — show the rubric</button>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" checked={helpUsed} onChange={(e) => setHelpUsed(e.target.checked)} />
            I needed help
          </label>
          <span className="text-xs text-ink-3">Answer aloud or in your notebook first. Looking before answering does not count.</span>
        </div>
      ) : (
        <div className="mt-4">
          <div className="rounded-lg border border-line p-4">
            <p className="h-section">A complete answer contains</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-2">
              {card.expectedPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
            {card.rubric.length > 0 && (
              <>
                <p className="h-section mt-3">Rubric</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-2">
                  {card.rubric.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className="btn" disabled={pending} onClick={() => grade(false)}>
              {pending ? <Loader2 size={14} className="animate-spin" /> : null} I missed it
            </button>
            <button className="btn btn-primary" disabled={pending} onClick={() => grade(true)}>
              {pending ? <Loader2 size={14} className="animate-spin" /> : null} I had it
            </button>
            {helpUsed && <Chip tone="caution">help used — shorter interval</Chip>}
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm" style={{ color: "var(--critical)" }}>{error}</p>}
    </div>
  );
}
