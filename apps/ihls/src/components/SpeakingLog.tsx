"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveSpeakingAction } from "@/app/actions/study";
import { useRun } from "@/components/dashboard-widgets";

/**
 * Speaking practice is logged by the student, with their own transcript and
 * self-rating. No audio is uploaded and no fluency level is inferred (§159).
 */
export function SpeakingLog({ activities }: { activities: { id: string; label: string; prompt: string }[] }) {
  const { run, pending, error } = useRun();
  const [activityId, setActivityId] = useState(activities[0]?.id ?? "");
  const [transcript, setTranscript] = useState("");
  const [minutes, setMinutes] = useState("2");
  const [selfRating, setSelfRating] = useState("3");
  const [saved, setSaved] = useState(false);

  const activity = activities.find((a) => a.id === activityId);

  return (
    <div className="space-y-3">
      <div>
        <label className="label" htmlFor="activity">Activity</label>
        <select id="activity" className="select" value={activityId} onChange={(e) => setActivityId(e.target.value)}>
          {activities.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
        {activity && <p className="mt-1.5 text-sm text-ink-2">{activity.prompt}</p>}
      </div>
      <div>
        <label className="label" htmlFor="transcript">What you said, written down afterwards</label>
        <textarea
          id="transcript"
          className="textarea"
          rows={5}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setSaved(false);
          }}
          placeholder="Speak first, then write what you actually said — including the parts where you got stuck."
          maxLength={10000}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="minutes">Minutes spoken</label>
          <input id="minutes" className="input" type="number" min={0} max={120} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="rating">How it went, in your judgement</label>
          <select id="rating" className="select" value={selfRating} onChange={(e) => setSelfRating(e.target.value)}>
            <option value="1">1 — I could not keep going</option>
            <option value="2">2 — Frequent stalls</option>
            <option value="3">3 — Got through it</option>
            <option value="4">4 — Mostly fluent</option>
            <option value="5">5 — Fluent and precise</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="btn btn-primary"
          disabled={pending || !transcript.trim()}
          onClick={() =>
            run(
              () =>
                saveSpeakingAction({
                  activityId,
                  transcript,
                  durationSeconds: Math.round(Number(minutes || 0) * 60),
                  selfRating,
                }),
              () => {
                setTranscript("");
                setSaved(true);
              },
            )
          }
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Log attempt
        </button>
        {saved && <span className="text-xs" style={{ color: "var(--positive)" }}>Logged.</span>}
        {error && <span className="text-xs" style={{ color: "var(--critical)" }}>{error}</span>}
      </div>
    </div>
  );
}
