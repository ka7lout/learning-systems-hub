"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { openLessonAction, saveNoteAction } from "@/app/actions/study";
import { useRun } from "@/components/dashboard-widgets";

/** Records that the lesson was opened. Sets contentSeen only — never a mastery level. */
export function MarkOpened({ lessonId }: { lessonId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    void openLessonAction({ lessonId });
  }, [lessonId]);
  return null;
}

export function NotebookEditor({
  lessonId,
  kind,
  initial,
  prompts,
}: {
  lessonId: string;
  kind: "must_write" | "recommended" | "free";
  initial: string;
  prompts: string[];
}) {
  const { run, pending, error } = useRun();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      {prompts.length > 0 && (
        <ul className="mb-2 list-disc space-y-0.5 pl-5 text-sm text-ink-2">
          {prompts.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      <textarea
        className="textarea"
        rows={kind === "must_write" ? 7 : 4}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder="Write it in your own words. Copying the text back does not count."
        aria-label="Notebook entry"
        maxLength={20000}
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          className="btn btn-sm"
          disabled={pending || !value.trim()}
          onClick={() => run(() => saveNoteAction({ lessonId, kind, content: value }), () => setSaved(true))}
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
        </button>
        {saved && <span className="text-xs" style={{ color: "var(--positive)" }}>Saved to your notebook.</span>}
        {error && <span className="text-xs" style={{ color: "var(--critical)" }}>{error}</span>}
      </div>
    </div>
  );
}
