"use client";

import { useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { addEvidenceAction, deleteEvidenceAction, saveProjectAction } from "@/app/actions/study";
import { useRun } from "@/components/dashboard-widgets";
import { Chip } from "@/components/ui";

export interface ProjectState {
  status: "not_started" | "in_progress" | "submitted" | "reviewed";
  summary: string;
  links: { repository?: string; deployment?: string; report?: string; dataset?: string };
  dodChecked: string[];
}

export function ProjectTracker({
  projectId,
  milestones,
  initial,
}: {
  projectId: string;
  milestones: { id: string; title: string; definitionOfDone: string[] }[];
  initial: ProjectState;
}) {
  const { run, pending, error } = useRun();
  const [state, setState] = useState<ProjectState>(initial);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) =>
    setState((s) => ({ ...s, dodChecked: s.dodChecked.includes(id) ? s.dodChecked.filter((x) => x !== id) : [...s.dodChecked, id] }));

  const save = () =>
    run(
      () =>
        saveProjectAction({
          projectId,
          status: state.status,
          summary: state.summary,
          repository: state.links.repository ?? "",
          deployment: state.links.deployment ?? "",
          report: state.links.report ?? "",
          dataset: state.links.dataset ?? "",
          dodChecked: state.dodChecked,
        }),
      () => setSaved(true),
    );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select
            id="status"
            className="select"
            value={state.status}
            onChange={(e) => {
              setState({ ...state, status: e.target.value as ProjectState["status"] });
              setSaved(false);
            }}
          >
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="submitted">Submitted for review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="repo">Repository URL</label>
          <input
            id="repo"
            className="input"
            placeholder="https://github.com/…"
            value={state.links.repository ?? ""}
            onChange={(e) => {
              setState({ ...state, links: { ...state.links, repository: e.target.value } });
              setSaved(false);
            }}
          />
        </div>
        <div>
          <label className="label" htmlFor="deploy">Deployment URL</label>
          <input
            id="deploy"
            className="input"
            placeholder="https://…"
            value={state.links.deployment ?? ""}
            onChange={(e) => {
              setState({ ...state, links: { ...state.links, deployment: e.target.value } });
              setSaved(false);
            }}
          />
        </div>
        <div>
          <label className="label" htmlFor="report">Report URL</label>
          <input
            id="report"
            className="input"
            placeholder="https://…"
            value={state.links.report ?? ""}
            onChange={(e) => {
              setState({ ...state, links: { ...state.links, report: e.target.value } });
              setSaved(false);
            }}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="summary">What you actually built and what you learned</label>
        <textarea
          id="summary"
          className="textarea"
          rows={4}
          value={state.summary}
          onChange={(e) => {
            setState({ ...state, summary: e.target.value });
            setSaved(false);
          }}
          maxLength={5000}
          placeholder="Describe the real result, including what did not work. This text is yours; nothing is written for you."
        />
      </div>

      <div>
        <p className="h-section">Milestones</p>
        <ul className="mt-2 space-y-2">
          {milestones.map((m) => (
            <li key={m.id} className="rounded-lg border border-line p-3">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={state.dodChecked.includes(m.id)}
                  onChange={() => {
                    toggle(m.id);
                    setSaved(false);
                  }}
                />
                <span>
                  <span className="text-sm font-medium">{m.title}</span>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink-2">
                    {m.definitionOfDone.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={save} disabled={pending}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save progress
        </button>
        {saved && <span className="text-xs" style={{ color: "var(--positive)" }}>Saved.</span>}
        {error && <span className="text-xs" style={{ color: "var(--critical)" }}>{error}</span>}
      </div>
    </div>
  );
}

const EVIDENCE_KINDS = ["repository", "commit", "pull_request", "deployment", "report", "dataset", "metric", "review", "oral", "other"] as const;

export function EvidenceManager({
  projectId,
  skills,
  items,
}: {
  projectId?: string;
  skills: { id: string; title: string }[];
  items: { _id: string; kind: string; title: string; url?: string; description: string; verified: boolean; skillIds: string[] }[];
}) {
  const { run, pending, error } = useRun();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: "repository", title: "", url: "", description: "", skillIds: [] as string[] });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-2">
          {items.length === 0 ? "No evidence recorded yet." : `${items.length} item${items.length === 1 ? "" : "s"}`}
        </p>
        <button className="btn btn-sm" onClick={() => setOpen((v) => !v)}>{open ? "Cancel" : "Add evidence"}</button>
      </div>

      {open && (
        <div className="mt-3 space-y-3 rounded-lg border border-line p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ekind">Kind</label>
              <select id="ekind" className="select" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                {EVIDENCE_KINDS.map((k) => <option key={k} value={k}>{k.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="etitle">Title</label>
              <input id="etitle" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={160} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="eurl">URL (optional)</label>
            <input id="eurl" className="input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
          </div>
          <div>
            <label className="label" htmlFor="edesc2">What it shows</label>
            <textarea id="edesc2" className="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
          </div>
          <div>
            <p className="label">Skills it evidences</p>
            <div className="max-h-40 overflow-y-auto rounded border border-line p-2 scroll-thin">
              {skills.map((s) => (
                <label key={s.id} className="flex items-center gap-2 py-0.5 text-sm">
                  <input
                    type="checkbox"
                    checked={form.skillIds.includes(s.id)}
                    onChange={() =>
                      setForm({ ...form, skillIds: form.skillIds.includes(s.id) ? form.skillIds.filter((x) => x !== s.id) : [...form.skillIds, s.id] })
                    }
                  />
                  {s.title}
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-3">
            New evidence is recorded as unverified. Only a human review or a deterministic check can mark it verified — the system will
            not do that for you.
          </p>
          <button
            className="btn btn-primary"
            disabled={pending || !form.title.trim()}
            onClick={() =>
              run(
                () => addEvidenceAction({ ...form, projectId, url: form.url || "" }),
                () => {
                  setForm({ kind: "repository", title: "", url: "", description: "", skillIds: [] });
                  setOpen(false);
                },
              )
            }
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Record evidence
          </button>
          {error && <p className="text-xs" style={{ color: "var(--critical)" }}>{error}</p>}
        </div>
      )}

      {items.length > 0 && (
        <ul className="mt-3 divide-y divide-[var(--line)]">
          {items.map((i) => (
            <li key={i._id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip>{i.kind.replace(/_/g, " ")}</Chip>
                  {i.verified ? <Chip tone="positive">verified</Chip> : <Chip tone="caution">unverified</Chip>}
                </div>
                <p className="mt-1 text-sm font-medium">{i.title}</p>
                {i.url && (
                  <a href={i.url} target="_blank" rel="noreferrer noopener" className="block truncate text-xs underline underline-offset-2">
                    {i.url}
                  </a>
                )}
                {i.description && <p className="mt-0.5 text-sm text-ink-2">{i.description}</p>}
              </div>
              <button className="btn btn-sm shrink-0" disabled={pending} onClick={() => run(() => deleteEvidenceAction({ id: i._id }))} aria-label="Delete evidence">
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
