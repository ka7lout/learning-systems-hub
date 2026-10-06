"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { gradeReview, type ActionResult } from "@/app/actions";
import { ResultNote, SubmitButton } from "@/components/ui";

export function ReviewCard({
  id,
  label,
  lessonId,
  activityType,
  instruction,
  lapses,
  intervalDays,
  prompt,
}: {
  id: number;
  label: string;
  lessonId: string;
  activityType: string;
  instruction: string;
  lapses: number;
  intervalDays: number;
  prompt: string | null;
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(gradeReview, null);
  const [attempted, setAttempted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag tag-accent">{activityType.replace(/_/g, " ")}</span>
        {lapses > 0 ? <span className="tag tag-warn">{lapses} lapse(s)</span> : null}
        <span className="tag">interval {intervalDays.toFixed(1)}d</span>
      </div>
      <h2 className="text-sm font-medium mt-2">{label}</h2>
      <p className="muted text-xs mt-1.5 leading-relaxed">{instruction}</p>

      <textarea
        className="field mt-3"
        rows={4}
        placeholder="Retrieve from memory first. Typing it out is the point — do not open the lesson yet."
        onChange={(e) => setAttempted(e.target.value.trim().length > 10)}
      />

      {prompt ? (
        <button
          type="button"
          className="btn mt-2"
          disabled={!attempted}
          onClick={() => setRevealed(true)}
          title={attempted ? undefined : "Retrieve first"}
        >
          Show the original question
        </button>
      ) : null}
      {revealed && prompt ? <p className="prose-block text-[13px] mt-2 muted">{prompt}</p> : null}

      <form action={action} className="flex flex-wrap items-end gap-2 mt-3">
        <input type="hidden" name="reviewId" value={id} />
        <label className="block">
          <span className="text-xs muted">Result</span>
          <select name="outcome" className="field mt-1" defaultValue="partial">
            <option value="solid">Solid</option>
            <option value="partial">Partial</option>
            <option value="missed">Missed</option>
          </select>
        </label>
        <SubmitButton>Grade and reschedule</SubmitButton>
        <Link href={`/learn/${lessonId}`} className="btn">
          Open the node
        </Link>
      </form>
      <ResultNote result={state} />
    </article>
  );
}
