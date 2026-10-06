"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveSettingsAction } from "@/app/actions/study";
import { useRun } from "@/components/dashboard-widgets";

export interface SettingsValues {
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
  englishMode: "standard" | "b1b2";
  vocabularyAssist: boolean;
  englishTraining: boolean;
  reducedMotion: boolean;
  textSize: "normal" | "large" | "xlarge";
  readingDensity: "comfortable" | "compact";
  hintPolicy: "minimal" | "balanced" | "generous";
  careerTargets: string[];
  notifications: boolean;
}

/** Appearance preferences are applied to the document immediately and persisted server-side. */
function applyLocal(v: SettingsValues) {
  const root = document.documentElement;
  const dark = v.theme === "dark" || (v.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.setAttribute("data-text-size", v.textSize);
  root.setAttribute("data-density", v.readingDensity);
  root.setAttribute("data-reduced-motion", String(v.reducedMotion));
  localStorage.setItem("ihls.prefs", JSON.stringify({ theme: v.theme, textSize: v.textSize, readingDensity: v.readingDensity, reducedMotion: v.reducedMotion }));
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-3.5 last:border-0">
      <div className="max-w-md">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-3">{hint}</p>}
      </div>
      <div className="w-56 shrink-0">{children}</div>
    </div>
  );
}

export function SettingsForm({ initial, roles }: { initial: SettingsValues; roles: { id: string; title: string }[] }) {
  const { run, pending, error } = useRun();
  const [v, setV] = useState<SettingsValues>(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyLocal(v);
  }, [v]);

  const set = <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) => {
    setV((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  return (
    <div>
      <div className="card">
        <Row label="Theme" hint="Light is a cool off-white; dark is a deep charcoal-navy. Both are tuned for long reading.">
          <select className="select" value={v.theme} onChange={(e) => set("theme", e.target.value as SettingsValues["theme"])}>
            <option value="system">Match system</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Row>
        <Row label="Text size">
          <select className="select" value={v.textSize} onChange={(e) => set("textSize", e.target.value as SettingsValues["textSize"])}>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra large</option>
          </select>
        </Row>
        <Row label="Reading density">
          <select className="select" value={v.readingDensity} onChange={(e) => set("readingDensity", e.target.value as SettingsValues["readingDensity"])}>
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </Row>
        <Row label="Reduce motion" hint="Also honoured automatically when your system asks for reduced motion.">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.reducedMotion} onChange={(e) => set("reducedMotion", e.target.checked)} />
            Reduce animation
          </label>
        </Row>
      </div>

      <div className="card mt-5">
        <Row label="Interface language" hint="Arabic affects mentor replies when you choose the Arabic action; the interface itself remains in English for now.">
          <select className="select" value={v.language} onChange={(e) => set("language", e.target.value as SettingsValues["language"])}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </Row>
        <Row label="English mode" hint="B1–B2 simplifies the sentences around a term. Technical terms are never simplified.">
          <select className="select" value={v.englishMode} onChange={(e) => set("englishMode", e.target.value as SettingsValues["englishMode"])}>
            <option value="standard">Standard technical English</option>
            <option value="b1b2">Simplified B1–B2</option>
          </select>
        </Row>
        <Row label="Vocabulary assistance" hint="Show the plain-English and Arabic gloss for canonical terms.">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.vocabularyAssist} onChange={(e) => set("vocabularyAssist", e.target.checked)} />
            Enabled
          </label>
        </Row>
        <Row label="English training" hint="Adds explicit language work to study sessions, including speaking tasks.">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.englishTraining} onChange={(e) => set("englishTraining", e.target.checked)} />
            Enabled
          </label>
        </Row>
      </div>

      <div className="card mt-5">
        <Row label="Hint policy" hint="Minimal means the mentor gives the smallest hint first. Generous does not mean it will solve the problem.">
          <select className="select" value={v.hintPolicy} onChange={(e) => set("hintPolicy", e.target.value as SettingsValues["hintPolicy"])}>
            <option value="minimal">Minimal</option>
            <option value="balanced">Balanced</option>
            <option value="generous">Generous</option>
          </select>
        </Row>
        <Row label="Target roles" hint="Used to generate career-gap tasks. Only roles with a recorded source are listed.">
          <div className="space-y-1">
            {roles.map((r) => (
              <label key={r.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={v.careerTargets.includes(r.id)}
                  onChange={() =>
                    set("careerTargets", v.careerTargets.includes(r.id) ? v.careerTargets.filter((x) => x !== r.id) : [...v.careerTargets, r.id])
                  }
                />
                <span>{r.title}</span>
              </label>
            ))}
          </div>
        </Row>
        <Row label="Notifications" hint="In-app only. No email is sent by this deployment.">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.notifications} onChange={(e) => set("notifications", e.target.checked)} />
            Enabled
          </label>
        </Row>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button className="btn btn-primary" disabled={pending} onClick={() => run(() => saveSettingsAction(v), () => setSaved(true))}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save settings
        </button>
        {saved && <span className="text-xs" style={{ color: "var(--positive)" }}>Saved.</span>}
        {error && <span className="text-xs" style={{ color: "var(--critical)" }}>{error}</span>}
      </div>
    </div>
  );
}
