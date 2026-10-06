"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, RefreshCw, X } from "lucide-react";
import type { ActionResult } from "@/lib/api";
import {
  captureLaterAction,
  refreshTasksAction,
  resolveLaterAction,
  setLearningStateAction,
  setTaskStateAction,
} from "@/app/actions/study";

export function useRun() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = <T,>(fn: () => Promise<ActionResult<T>>, onOk?: (data: T) => void) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.ok) {
        onOk?.(res.data);
        router.refresh();
      } else {
        setError(res.issues?.length ? `${res.message} ${res.issues.join("; ")}` : res.message);
      }
    });
  };
  return { run, pending, error, setError };
}

/** §145–146 — a question about the session, not about the person. No scores, no labels. */
export function StatePicker({ current }: { current: "deep" | "drift" | "fog" | "overload" }) {
  const { run, pending, error } = useRun();
  const options = [
    { id: "deep", label: "I'm focused" },
    { id: "drift", label: "I'm drifting" },
    { id: "fog", label: "Starting feels hard" },
    { id: "overload", label: "There is too much at once" },
  ] as const;

  return (
    <div>
      <p className="text-sm font-medium">How does studying feel right now?</p>
      <p className="mt-0.5 text-xs text-ink-3">This changes task size and how much scaffolding you get. It is not stored as a judgement about you.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            className="btn btn-sm"
            disabled={pending}
            aria-pressed={current === o.id}
            style={current === o.id ? { background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)" } : undefined}
            onClick={() => run(() => setLearningStateAction({ state: o.id }))}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs" style={{ color: "var(--critical)" }}>{error}</p>}
    </div>
  );
}

export function RefreshTasks() {
  const { run, pending } = useRun();
  return (
    <button className="btn btn-sm" disabled={pending} onClick={() => run(() => refreshTasksAction())}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
      Recompute
    </button>
  );
}

export function TaskControls({ taskId }: { taskId: string }) {
  const { run, pending } = useRun();
  return (
    <div className="flex shrink-0 gap-1.5">
      <button className="btn btn-sm" disabled={pending} onClick={() => run(() => setTaskStateAction({ taskId, state: "done" }))} title="Mark done">
        <Check size={14} /> Done
      </button>
      <button className="btn btn-sm" disabled={pending} onClick={() => run(() => setTaskStateAction({ taskId, state: "dismissed" }))} title="Dismiss">
        <X size={14} />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  );
}

/** §147 — capture a distraction in one line and return to the task. */
export function CaptureBox({ items }: { items: { _id: string; text: string }[] }) {
  const { run, pending, error } = useRun();
  const [text, setText] = useState("");
  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          run(() => captureLaterAction({ text: text.trim() }), () => setText(""));
        }}
      >
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Park a thought and keep going…"
          aria-label="Capture for later"
          maxLength={500}
        />
        <button className="btn" type="submit" disabled={pending || !text.trim()}>
          <Plus size={14} /> Park
        </button>
      </form>
      {error && <p className="mt-2 text-xs" style={{ color: "var(--critical)" }}>{error}</p>}
      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((i) => (
            <li key={i._id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-ink-2">{i.text}</span>
              <button className="btn btn-sm" disabled={pending} onClick={() => run(() => resolveLaterAction({ id: i._id }))}>
                <Check size={13} /> Handled
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
