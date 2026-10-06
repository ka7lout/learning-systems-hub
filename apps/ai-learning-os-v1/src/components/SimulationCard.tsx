"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export function SimulationCard({ sim, attempts }: { sim: { key: string; type: string; title: string; prompt: string; rubric: string[] }; attempts: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [checks, setChecks] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSpeaking = sim.type === "english_speaking" || sim.type === "interview";

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-center gap-1.5"><span className="font-medium">{sim.title}</span><span className="badge">{sim.type.replace(/_/g, " ")}</span>{attempts > 0 && <span className="badge">{attempts} attempt(s)</span>}{sim.type.startsWith("freelance") || sim.type === "incident" ? <span className="badge !bg-warn-soft !text-warn">simulation</span> : null}</div>
      {!open ? <button className="btn mt-2" onClick={() => setOpen(true)}>Open</button> : (
        <div className="mt-3 space-y-3 text-sm">
          <p className="whitespace-pre-wrap leading-relaxed">{sim.prompt}</p>
          {isSpeaking && <p className="rounded-md bg-accent-soft px-3 py-2 text-xs text-accent-strong">Speak your answer aloud first (use your device's recorder if you want to listen back), then write what you said. This platform does not invent pronunciation scores; it records your explanation and your honest rubric check.</p>}
          <label className="block">Your response<textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={8} className="input mt-1 font-mono text-xs" maxLength={20000} /></label>
          <div><div className="font-medium">Rubric — check what your response actually contains</div><ul className="mt-1 space-y-1">{sim.rubric.map((r) => <li key={r}><label className="flex items-start gap-2 text-xs"><input type="checkbox" className="mt-0.5" checked={checks[r] === 1} onChange={(e) => setChecks({ ...checks, [r]: e.target.checked ? 1 : 0 })} disabled={response.trim().length < 20} />{r}</label></li>)}</ul></div>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary" disabled={busy || response.trim().length < 20} onClick={async () => { setBusy(true); const r = await api<{ rubricMet: number; rubricTotal: number }>("/api/activities", { intent: "activity", activityKey: sim.key, response, selfAssessment: Object.fromEntries(sim.rubric.map((x) => [x, checks[x] ?? 0])) }); setBusy(false); if (!r.ok) return setStatus(r.error.message); setStatus(`Recorded: ${r.data.rubricMet}/${r.data.rubricTotal} rubric items. ${r.data.rubricMet / r.data.rubricTotal >= 0.75 ? "Skill evidence created." : "Below 75% — no skill evidence created; revise and retry."}`); router.refresh(); }}>Record</button>
            {status && <span className="text-xs text-muted">{status}</span>}
          </div>
        </div>
      )}
    </li>
  );
}
