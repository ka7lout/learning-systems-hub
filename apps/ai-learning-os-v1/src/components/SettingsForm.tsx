"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

type S = { theme: string; language: string; englishMode: string; vocabularyAssist: boolean; englishTraining: boolean; hintPolicy: string; reducedMotion: boolean; textSize: string; readingDensity: string; targetRoleSlug: string | null; defaultLearningState: string };

function applyLocal(s: Partial<S>) {
  if (s.theme) { localStorage.setItem("ihl-theme", s.theme); const d = s.theme === "dark" || (s.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.classList.toggle("dark", d); }
  if (s.textSize) { localStorage.setItem("ihl-text", s.textSize); document.documentElement.classList.toggle("text-large", s.textSize === "large"); }
  if (s.reducedMotion !== undefined) { localStorage.setItem("ihl-motion", s.reducedMotion ? "reduce" : "normal"); document.documentElement.classList.toggle("reduce-motion", s.reducedMotion); }
}

export function SettingsForm({ initial, roles }: { initial: S; roles: { slug: string; title: string }[] }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  async function update(patch: Partial<S>) {
    const next = { ...s, ...patch };
    setS(next);
    applyLocal(patch);
    const r = await api("/api/activities", { intent: "settings", ...patch });
    setMsg(r.ok ? "Saved" : r.error.message);
    if (r.ok) router.refresh();
  }
  const Radio = ({ k, opts }: { k: keyof S; opts: { v: string; l: string }[] }) => (
    <div className="flex flex-wrap gap-1.5">{opts.map((o) => <button key={o.v} onClick={() => update({ [k]: o.v } as Partial<S>)} className={`btn !py-1 text-xs ${s[k] === o.v ? "!border-accent !bg-accent-soft" : ""}`}>{o.l}</button>)}</div>
  );
  const Toggle = ({ k, l }: { k: keyof S; l: string }) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(s[k])} onChange={(e) => update({ [k]: e.target.checked } as Partial<S>)} />{l}</label>;

  return (
    <div className="space-y-4">
      <section className="card p-5 space-y-3"><h2 className="text-sm font-semibold">Appearance & accessibility</h2>
        <div><div className="mb-1 text-xs text-muted">Theme</div><Radio k="theme" opts={[{ v: "light", l: "Light" }, { v: "dark", l: "Dark" }, { v: "system", l: "System" }]} /></div>
        <div><div className="mb-1 text-xs text-muted">Text size</div><Radio k="textSize" opts={[{ v: "normal", l: "Normal" }, { v: "large", l: "Large" }]} /></div>
        <div><div className="mb-1 text-xs text-muted">Reading density</div><Radio k="readingDensity" opts={[{ v: "comfortable", l: "Comfortable" }, { v: "compact", l: "Compact" }]} /></div>
        <Toggle k="reducedMotion" l="Reduce motion" />
      </section>
      <section className="card p-5 space-y-3"><h2 className="text-sm font-semibold">Language & English</h2>
        <div><div className="mb-1 text-xs text-muted">Interface language (lesson content is authored in English; Arabic explanations are available from the Mentor)</div><Radio k="language" opts={[{ v: "en", l: "English" }, { v: "ar", l: "Arabic" }]} /></div>
        <div><div className="mb-1 text-xs text-muted">Content mode</div><Radio k="englishMode" opts={[{ v: "standard", l: "Standard Technical English" }, { v: "b1b2", l: "B1–B2 mode" }]} /></div>
        <Toggle k="vocabularyAssist" l="Vocabulary assistance (hover glosses on advanced terms)" />
        <Toggle k="englishTraining" l="English training mode (adds speaking/writing tasks to recommendations)" />
      </section>
      <section className="card p-5 space-y-3"><h2 className="text-sm font-semibold">Learning & AI</h2>
        <div><div className="mb-1 text-xs text-muted">Default study state when a session starts</div><Radio k="defaultLearningState" opts={[{ v: "deep", l: "Focused" }, { v: "drift", l: "Drifting" }, { v: "fog", l: "Starting feels hard" }, { v: "overload", l: "Too much at once" }]} /></div>
        <div><div className="mb-1 text-xs text-muted">Hint policy</div><Radio k="hintPolicy" opts={[{ v: "attempt_first", l: "Attempt first (recommended)" }, { v: "open", l: "Open explanations" }]} /></div>
        <div><div className="mb-1 text-xs text-muted">Target role</div><TargetRolePicker roles={roles} current={s.targetRoleSlug} onChange={(v) => setS({ ...s, targetRoleSlug: v })} /></div>
      </section>
      <section className="card p-5"><h2 className="text-sm font-semibold">Privacy & connected accounts</h2><p className="mt-1 text-sm text-muted">All progress, projects, evidence and mentor conversations are scoped to your account on the server. GitHub OAuth linking is not configured on this deployment; attach repository and PR URLs manually on each project. Nothing is shared publicly.</p></section>
      {msg && <p className="text-xs text-muted">{msg}</p>}
    </div>
  );
}

export function TargetRolePicker({ roles, current, onChange }: { roles: { slug: string; title: string }[]; current: string | null; onChange?: (v: string | null) => void }) {
  const router = useRouter();
  const [v, setV] = useState(current ?? "");
  return (
    <select value={v} className="input mt-1 max-w-md" onChange={async (e) => { const val = e.target.value || null; setV(e.target.value); onChange?.(val); await api("/api/activities", { intent: "settings", targetRoleSlug: val }); router.refresh(); }}>
      <option value="">No target role selected</option>
      {roles.map((r) => <option key={r.slug} value={r.slug}>{r.title}</option>)}
    </select>
  );
}
