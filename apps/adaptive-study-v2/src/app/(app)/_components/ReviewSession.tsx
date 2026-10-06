"use client";
import { useState } from "react";
import { completeReviewAction } from "@/lib/actions";

type Item = {
  id: string;
  conceptTitle: string | null;
  confidence: number;
  lastReviewed: string | null;
  nextReview: string | null;
};

export default function ReviewSession({ items }: { items: Item[] }) {
  const [idx, setIdx] = useState(0);
  const [recall, setRecall] = useState("");
  const [showEval, setShowEval] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const item = items[idx];

  async function submit(score: number) {
    if (!item) return;
    setBusy(true);
    await completeReviewAction({ reviewId: item.id, score });
    setBusy(false);
    if (idx + 1 >= items.length) {
      setDone(true);
    } else {
      setIdx(idx + 1);
      setRecall("");
      setShowEval(false);
    }
  }

  if (done || items.length === 0) {
    return (
      <div className="surface p-6 text-center">
        <h2 className="text-lg font-semibold">Review queue cleared</h2>
        <p className="muted mt-2 text-sm">
          Every due concept has been reviewed. New reviews will appear here on their scheduled date.
        </p>
      </div>
    );
  }

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between text-xs muted">
        <span>
          Review {idx + 1} of {items.length}
        </span>
        <span>Confidence: {item.confidence}/7</span>
      </div>
      <h2 className="mt-3 text-xl font-semibold">{item.conceptTitle ?? "Concept"}</h2>
      <p className="muted mt-1 text-sm">
        Close your eyes. Write what you remember about this concept — definition, formula, one example.
      </p>
      <textarea
        className="mt-3"
        rows={4}
        value={recall}
        onChange={(e) => setRecall(e.target.value)}
        placeholder="I remember…"
      />
      {!showEval ? (
        <button className="btn btn-primary mt-3" disabled={!recall.trim()} onClick={() => setShowEval(true)}>
          I&apos;ve recalled — judge myself
        </button>
      ) : (
        <div className="mt-4">
          <p className="text-sm muted">How well did you recall it?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                className="btn btn-ghost px-4"
                disabled={busy}
                onClick={() => submit(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="muted mt-2 text-xs">
            5 = effortless · 3 = with effort · 0 = could not recall. This adjusts the next review date.
          </p>
        </div>
      )}
    </div>
  );
}
