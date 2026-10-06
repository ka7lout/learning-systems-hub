"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { recordEnglishAttempt, type ActionResult } from "@/app/actions";
import { ResultNote, SubmitButton } from "@/components/ui";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export function EnglishActivityForm({
  dimensions,
  activities,
}: {
  dimensions: string[];
  activities: { dimension: string; activity: string; prompt: string }[];
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(recordEnglishAttempt, null);
  const [selected, setSelected] = useState(activities[0]!);
  const [response, setResponse] = useState("");
  const [recording, setRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognition = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    setSpeechSupported(true);
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += `${e.results[i]![0]!.transcript} `;
      setResponse(text.trim());
    };
    r.onerror = () => setRecording(false);
    r.onend = () => setRecording(false);
    recognition.current = r;
  }, []);

  return (
    <form action={action} className="surface p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs muted">Activity</span>
          <select
            className="field mt-1"
            value={selected.activity}
            onChange={(e) => setSelected(activities.find((a) => a.activity === e.target.value) ?? activities[0]!)}
          >
            {activities.map((a) => (
              <option key={a.activity} value={a.activity}>
                {a.activity}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs muted">Dimension</span>
          <select name="dimension" className="field mt-1" value={selected.dimension} onChange={() => undefined}>
            {dimensions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="activity" value={selected.activity} />
      <input type="hidden" name="prompt" value={selected.prompt} />

      <p className="prose-block text-[13px]">{selected.prompt}</p>

      <label className="block">
        <span className="text-xs muted">Your response (typed, or transcribed from speech)</span>
        <textarea
          name="response"
          className="field mt-1"
          rows={5}
          required
          minLength={10}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-2 items-end">
        {speechSupported ? (
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (!recognition.current) return;
              if (recording) {
                recognition.current.stop();
                setRecording(false);
              } else {
                setResponse("");
                recognition.current.start();
                setRecording(true);
              }
            }}
          >
            {recording ? <Square size={13} /> : <Mic size={13} />}
            {recording ? "Stop dictation" : "Speak the answer"}
          </button>
        ) : (
          <span className="text-[11px] muted max-w-xs leading-relaxed">
            Browser speech recognition is unavailable here, so speaking answers must be typed or transcribed.
            No pronunciation score is invented from unavailable technology.
          </span>
        )}
        <label className="block">
          <span className="text-xs muted">Self-rating (1–5)</span>
          <select name="selfRating" className="field mt-1" defaultValue="3">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton>Record attempt</SubmitButton>
      </div>
      <ResultNote result={state} />
    </form>
  );
}
