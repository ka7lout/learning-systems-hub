"use client";

import { useActionState, useState } from "react";
import { Lightbulb } from "lucide-react";
import { submitAttempt, type ActionResult } from "@/app/actions";
import { ResultNote, SubmitButton } from "@/components/ui";

export type PracticeItem = {
  id: string;
  type: string;
  difficulty: string;
  phase: string;
  prompt: string;
  context: string | null;
  hints: string[];
  expectedPoints: string[];
  referenceAnswer: string;
};

const HELP_LEVELS = [
  { id: "none", label: "No help" },
  { id: "hint", label: "Hint" },
  { id: "guidance", label: "Guidance" },
  { id: "concept_reminder", label: "Concept reminder" },
  { id: "worked_example", label: "Worked example" },
  { id: "full_explanation", label: "Full explanation" },
];

const ERROR_TYPES = [
  { id: "none", label: "No error" },
  { id: "concept", label: "Concept — I did not understand it" },
  { id: "recall", label: "Recall — I knew it but forgot" },
  { id: "selection", label: "Selection — I chose the wrong tool" },
  { id: "execution", label: "Execution — right plan, wrong execution" },
  { id: "transfer", label: "Transfer — new form defeated me" },
  { id: "attention", label: "Attention — I lost focus" },
  { id: "load", label: "Load — the task was too large" },
];

const PHASE_TAG: Record<string, string> = {
  recall: "tag",
  application: "tag-accent",
  transfer: "tag-warn",
};

export function PracticeBlock({ items }: { items: PracticeItem[] }) {
  if (items.length === 0) {
    return (
      <div className="surface p-4">
        <p className="text-[13px]">No practice item matches your current study state.</p>
        <p className="muted text-xs mt-1.5 leading-relaxed">
          In <em>drifting</em>, <em>starting feels hard</em> or <em>too much at once</em>, harder items are
          withheld deliberately. Switch your state at the top of the page when you are ready for them.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <PracticeCard key={item.id} item={item} index={i + 1} />
      ))}
    </div>
  );
}

function PracticeCard({ item, index }: { item: PracticeItem; index: number }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(submitAttempt, null);
  const [attempted, setAttempted] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [response, setResponse] = useState("");

  const canReveal = attempted && response.trim().length >= 15;

  return (
    <article className="surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs muted tabular-nums">{index}.</span>
        <span className="tag">{item.type.replace(/_/g, " ")}</span>
        <span className={PHASE_TAG[item.phase] ?? "tag"}>{item.phase}</span>
        <span className="tag">difficulty {item.difficulty}</span>
      </div>

      <p className="prose-block mt-3 text-sm">{item.prompt}</p>
      {item.context ? <pre className="code mt-3">{item.context}</pre> : null}

      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="itemId" value={item.id} />
        <label className="block">
          <span className="text-xs muted">Your attempt (required before the answer unlocks)</span>
          <textarea
            name="response"
            className="field mt-1"
            rows={5}
            required
            minLength={1}
            maxLength={8000}
            value={response}
            onChange={(e) => {
              setResponse(e.target.value);
              if (e.target.value.trim().length > 0) setAttempted(true);
            }}
            placeholder="Write your reasoning, not just the final answer."
          />
        </label>

        <div className="flex flex-wrap gap-2 items-center">
          {hintsShown < item.hints.length ? (
            <button type="button" className="btn" onClick={() => setHintsShown((h) => h + 1)}>
              <Lightbulb size={13} /> Show a hint ({item.hints.length - hintsShown} left)
            </button>
          ) : null}
          <button
            type="button"
            className="btn"
            disabled={!canReveal}
            onClick={() => setRevealed(true)}
            title={canReveal ? undefined : "Write at least a short attempt first"}
          >
            Reveal reference answer
          </button>
        </div>

        {hintsShown > 0 ? (
          <ul className="text-xs muted space-y-1 pl-4 list-disc">
            {item.hints.slice(0, hintsShown).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : null}

        {revealed ? (
          <div className="surface p-3" style={{ background: "var(--surface-2)" }}>
            <p className="text-xs font-medium">Reference answer</p>
            <p className="prose-block text-[13px] mt-1.5 whitespace-pre-wrap">{item.referenceAnswer}</p>
            {item.expectedPoints.length > 0 ? (
              <>
                <p className="text-xs font-medium mt-3">Points a correct answer must contain</p>
                <ul className="text-xs muted mt-1 space-y-1 list-disc pl-4">
                  {item.expectedPoints.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs muted">How did it go?</span>
            <select name="outcome" className="field mt-1" defaultValue="partial">
              <option value="solid">Solid — unaided and correct</option>
              <option value="partial">Partial — incomplete or shaky</option>
              <option value="missed">Missed — I could not do it</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs muted">Help used</span>
            <select name="helpLevel" className="field mt-1" defaultValue={hintsShown > 0 ? "hint" : "none"}>
              {HELP_LEVELS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs muted">Error type</span>
            <select name="errorType" className="field mt-1" defaultValue="none">
              {ERROR_TYPES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <SubmitButton>Record attempt</SubmitButton>
        <ResultNote result={state} />
        <p className="text-[11px] muted">
          Help level is stored with the attempt. Independent performance and assisted performance are counted
          separately, and only independent evidence raises readiness.
        </p>
      </form>
    </article>
  );
}
