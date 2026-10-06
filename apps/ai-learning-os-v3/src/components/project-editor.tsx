"use client";

import { useActionState, useTransition } from "react";
import { addEvidence, startProject, updateProject, type ActionResult } from "@/app/actions";
import { ResultNote, SubmitButton } from "@/components/ui";

export function StartProjectButton({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="btn" disabled={pending} onClick={() => start(() => void startProject(projectId))}>
      Start this project
    </button>
  );
}

export function ProjectEditor({
  userProjectId,
  status,
  repoUrl,
  demoUrl,
  datasetUrl,
  notes,
  definitionOfDone,
  completedChecks,
}: {
  userProjectId: number;
  status: string;
  repoUrl: string | null;
  demoUrl: string | null;
  datasetUrl: string | null;
  notes: string | null;
  definitionOfDone: string[];
  completedChecks: string[];
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(updateProject, null);
  const [evState, evAction] = useActionState<ActionResult | null, FormData>(addEvidence, null);

  return (
    <div className="mt-4 space-y-5">
      <form action={action} className="space-y-3">
        <input type="hidden" name="userProjectId" value={userProjectId} />
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs muted">Status</span>
            <select name="status" className="field mt-1" defaultValue={status}>
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="review">In review</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs muted">Repository URL (source of truth for code)</span>
            <input name="repoUrl" className="field mt-1" defaultValue={repoUrl ?? ""} placeholder="https://github.com/…" />
          </label>
          <label className="block">
            <span className="text-xs muted">Deployment / demo URL</span>
            <input name="demoUrl" className="field mt-1" defaultValue={demoUrl ?? ""} placeholder="https://…" />
          </label>
          <label className="block">
            <span className="text-xs muted">Dataset URL (provenance)</span>
            <input name="datasetUrl" className="field mt-1" defaultValue={datasetUrl ?? ""} placeholder="https://…" />
          </label>
        </div>

        <fieldset>
          <legend className="text-xs muted mb-1.5">Definition of done — tick only what is genuinely true</legend>
          <div className="space-y-1.5">
            {definitionOfDone.map((d) => (
              <label key={d} className="flex items-start gap-2 text-[13px]">
                <input type="checkbox" name="checks" value={d} defaultChecked={completedChecks.includes(d)} className="mt-1" />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-xs muted">Engineering notes (decisions, rejected alternatives, failures)</span>
          <textarea name="notes" className="field mt-1" rows={4} defaultValue={notes ?? ""} />
        </label>

        <SubmitButton>Save project state</SubmitButton>
        <ResultNote result={state} />
      </form>

      <form action={evAction} className="surface p-3 space-y-2.5" style={{ background: "var(--surface-2)" }}>
        <p className="text-xs font-medium">Attach evidence</p>
        <input type="hidden" name="userProjectId" value={userProjectId} />
        <div className="grid sm:grid-cols-3 gap-2.5">
          <label className="block">
            <span className="text-xs muted">Kind</span>
            <select name="kind" className="field mt-1">
              {["repository", "commit", "pull_request", "deployment", "report", "demo", "dataset", "test_run"].map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs muted">URL (optional)</span>
            <input name="url" className="field mt-1" placeholder="https://…" />
          </label>
        </div>
        <label className="block">
          <span className="text-xs muted">What does this evidence actually show?</span>
          <input name="description" className="field mt-1" minLength={5} maxLength={1000} required />
        </label>
        <SubmitButton variant="plain">Record evidence</SubmitButton>
        <ResultNote result={evState} />
      </form>
    </div>
  );
}
