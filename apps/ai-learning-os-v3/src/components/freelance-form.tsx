"use client";

import { useActionState } from "react";
import { submitFreelanceRun, type ActionResult } from "@/app/actions";
import { ResultNote, SubmitButton } from "@/components/ui";

export function FreelanceForm({
  simulationId,
  requiredQuestions,
  deliverables,
}: {
  simulationId: string;
  requiredQuestions: string[];
  deliverables: string[];
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(submitFreelanceRun, null);

  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="simulationId" value={simulationId} />
      <fieldset>
        <legend className="text-xs muted mb-1.5">
          Tick only the questions you actually asked before quoting
        </legend>
        <div className="space-y-1.5">
          {requiredQuestions.map((q) => (
            <label key={q} className="flex items-start gap-2 text-[13px]">
              <input type="checkbox" name="questions" value={q} className="mt-1" />
              <span>{q}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-xs muted">
          Scope statement — include explicit exclusions, acceptance criteria and assumptions
        </span>
        <textarea name="scopeDraft" className="field mt-1" rows={7} required minLength={20} />
      </label>

      <p className="text-[11px] muted">Deliverables expected: {deliverables.join(" · ")}</p>
      <SubmitButton>Submit discovery and scope</SubmitButton>
      <ResultNote result={state} />
    </form>
  );
}
