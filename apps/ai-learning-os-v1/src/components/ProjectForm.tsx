"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export function StartProjectButton({ catalogId }: { catalogId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button className="btn btn-primary" disabled={busy} onClick={async () => { setBusy(true); const r = await api<{ id: string }>("/api/projects", { intent: "create", catalogId }); setBusy(false); if (!r.ok) return setErr(r.error.message); router.push(`/projects/${r.data.id}`); }}>{busy ? "Creating…" : "Start project"}</button>
      {err && <p role="alert" className="mt-1 text-xs text-danger">{err}</p>}
    </div>
  );
}

type Proj = { id: string; status: string; repoUrl: string | null; codespaceUrl: string | null; colabUrl: string | null; kaggleUrl: string | null; datasetUrl: string | null; datasetLicense: string | null; deploymentUrl: string | null; reportUrl: string | null; notes: string | null; checklist: Record<string, boolean> };

export function ProjectEditor({ project, dod }: { project: Proj; dod: string[] }) {
  const router = useRouter();
  const [p, setP] = useState(project);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(patch: Partial<Proj>) {
    setBusy(true);
    const next = { ...p, ...patch };
    setP(next);
    const r = await api("/api/projects", { intent: "update", id: p.id, ...patch });
    setBusy(false);
    setMsg(r.ok ? "Saved" : r.error.message);
    if (r.ok) router.refresh();
  }
  const fields: { k: keyof Proj; label: string }[] = [
    { k: "repoUrl", label: "Repository (GitHub)" }, { k: "codespaceUrl", label: "Codespace" }, { k: "colabUrl", label: "Colab" }, { k: "kaggleUrl", label: "Kaggle" }, { k: "datasetUrl", label: "Dataset" }, { k: "deploymentUrl", label: "Deployment" }, { k: "reportUrl", label: "Report / API docs / Demo" },
  ];
  const doneCount = dod.filter((d) => p.checklist[d]).length;

  return (
    <div className="space-y-4">
      <section className="card p-5">
        <h2 className="text-sm font-semibold">Status</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">{["planned", "in_progress", "in_review", "done"].map((s) => <button key={s} disabled={busy || (s === "done" && doneCount < dod.length)} onClick={() => save({ status: s })} className={`btn !py-1 text-xs ${p.status === s ? "!border-accent !bg-accent-soft" : ""}`} title={s === "done" && doneCount < dod.length ? "Complete the Definition of Done first" : undefined}>{s.replace("_", " ")}</button>)}</div>
        <p className="mt-2 text-xs text-muted">“Done” unlocks only when every Definition-of-Done item is checked ({doneCount}/{dod.length}).</p>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold">Environment links</h2>
        <form className="mt-2 grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const patch: Record<string, string> = {}; for (const f of fields) patch[f.k] = String(fd.get(f.k) ?? ""); patch.datasetLicense = String(fd.get("datasetLicense") ?? ""); patch.notes = String(fd.get("notes") ?? ""); save(patch as Partial<Proj>); }}>
          {fields.map((f) => <label key={f.k} className="text-xs">{f.label}<input name={f.k} defaultValue={(p[f.k] as string | null) ?? ""} type="url" placeholder="https://…" className="input mt-1" /></label>)}
          <label className="text-xs">Dataset license / terms<input name="datasetLicense" defaultValue={p.datasetLicense ?? ""} className="input mt-1" maxLength={200} placeholder="e.g., CC BY 4.0; retrieved 2026-10-05" /></label>
          <label className="text-xs sm:col-span-2">Notes (provenance, schema, known limitations, bias/leakage risks)<textarea name="notes" defaultValue={p.notes ?? ""} rows={4} className="input mt-1" maxLength={5000} /></label>
          <div className="sm:col-span-2 flex items-center gap-2"><button className="btn btn-primary" disabled={busy}>Save</button>{msg && <span className="text-xs text-muted">{msg}</span>}</div>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold">Definition of Done</h2>
        <ul className="mt-2 space-y-1.5">{dod.map((d) => <li key={d}><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={Boolean(p.checklist[d])} onChange={(e) => save({ checklist: { ...p.checklist, [d]: e.target.checked } })} className="mt-1" />{d}</label></li>)}</ul>
      </section>

      <EvidenceForm projectId={p.id} />
    </div>
  );
}

function EvidenceForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <section className="card p-5">
      <h2 className="text-sm font-semibold">Attach evidence</h2>
      <p className="text-xs text-muted">Evidence creates skill records and portfolio items. Only real artifacts — commits, PRs, deployments, reports, metrics with a source.</p>
      <form className="mt-2 grid gap-3 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form); setBusy(true); const r = await api("/api/projects", { intent: "evidence", id: projectId, kind: fd.get("kind"), url: String(fd.get("url") ?? "") || undefined, description: fd.get("description"), evidenceClass: fd.get("evidenceClass") }); setBusy(false); setMsg(r.ok ? "Evidence recorded" : r.error.message); if (r.ok) { form.reset(); router.refresh(); } }}>
        <label className="text-xs">Kind<select name="kind" className="input mt-1">{["commit", "pull_request", "deployment", "report", "metric", "demo", "test_run", "model_card"].map((k) => <option key={k} value={k}>{k.replace("_", " ")}</option>)}</select></label>
        <label className="text-xs">Classification<select name="evidenceClass" className="input mt-1" defaultValue="skill_evidence">{["practice_only", "skill_evidence", "technical_artifact", "portfolio_project", "professional_evidence", "signature_project"].map((k) => <option key={k} value={k}>{k.replace(/_/g, " ")}</option>)}</select></label>
        <label className="text-xs sm:col-span-2">URL (optional)<input name="url" type="url" className="input mt-1" placeholder="https://github.com/…/pull/12" /></label>
        <label className="text-xs sm:col-span-2">Description (what it proves, with the metric source if any)<textarea name="description" required minLength={3} rows={2} className="input mt-1" maxLength={2000} /></label>
        <div className="sm:col-span-2 flex items-center gap-2"><button className="btn btn-primary" disabled={busy}>Record evidence</button>{msg && <span className="text-xs text-muted">{msg}</span>}</div>
      </form>
    </section>
  );
}
