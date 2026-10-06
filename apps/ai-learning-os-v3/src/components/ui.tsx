"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { captureLater, setLearningState, setPreference, type ActionResult } from "@/app/actions";

export function SubmitButton({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: "primary" | "plain";
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={variant === "primary" ? "btn btn-primary" : "btn"} disabled={pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

export function ResultNote({ result }: { result: ActionResult | null }) {
  if (!result?.message) return null;
  return (
    <p
      role="status"
      className="text-xs mt-2"
      style={{ color: result.ok ? "var(--ok)" : "var(--warn)" }}
    >
      {result.message}
    </p>
  );
}

const STATES = [
  { id: "deep", label: "I'm focused" },
  { id: "drift", label: "I'm drifting" },
  { id: "fog", label: "Starting feels hard" },
  { id: "overload", label: "Too much at once" },
];

export function StatePicker({ current }: { current: string }) {
  const [pending, setPending] = useState(false);
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="How does studying feel right now?">
      {STATES.map((s) => {
        const active = s.id === current;
        return (
          <button
            key={s.id}
            type="button"
            disabled={pending}
            aria-pressed={active}
            onClick={async () => {
              setPending(true);
              await setLearningState(s.id);
              setPending(false);
            }}
            className="btn"
            style={
              active
                ? { borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)" }
                : undefined
            }
          >
            {active ? <Check size={13} /> : null}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export function PrefToggle({
  prefKey,
  options,
  current,
  label,
}: {
  prefKey: string;
  options: { value: string; label: string }[];
  current: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid var(--line)" }}>
      <span className="text-sm">{label}</span>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="btn"
            aria-pressed={o.value === current}
            style={
              o.value === current
                ? { borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)" }
                : undefined
            }
            onClick={() => setPreference(prefKey, o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LaterCapture() {
  const [state, action] = useActionState<ActionResult | null, FormData>(captureLater, null);
  return (
    <form action={action} className="flex gap-2">
      <input
        name="text"
        className="field"
        placeholder="Park a distracting thought (e.g. 'check the GPU pricing page')"
        aria-label="Park a distracting thought"
        maxLength={300}
      />
      <SubmitButton variant="plain">Park it</SubmitButton>
      <ResultNote result={state} />
    </form>
  );
}

export function Disclosure({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="surface p-3">
      <summary className="text-sm font-medium cursor-pointer">{summary}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
