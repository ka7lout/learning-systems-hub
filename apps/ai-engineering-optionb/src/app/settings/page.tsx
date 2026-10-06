"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Monitor, Globe, Type, Sparkles, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [language, setLanguage] = useState("en");
  const [englishMode, setEnglishMode] = useState("standard");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [textSize, setTextSize] = useState("medium");

  useEffect(() => {
    const saved = localStorage.getItem("ih-theme");
    if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved);
    const rm = localStorage.getItem("ih-reduced-motion");
    if (rm === "1") setReducedMotion(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("ih-theme", theme);
    let effective = theme;
    if (theme === "system") {
      effective = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.classList.toggle("dark", effective === "dark");
    document.documentElement.classList.toggle("light", effective === "light");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("ih-reduced-motion", reducedMotion ? "1" : "0");
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);
  }, [reducedMotion]);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1">Personalize your learning environment. Settings are stored locally in your browser.</p>
      </div>

      <Section icon={<Monitor className="h-5 w-5 text-navy-600 dark:text-navy-400" />} title="Appearance">
        <Row label="Theme">
          <div className="inline-flex rounded-lg border border-[rgb(var(--border))] p-0.5 bg-[rgb(var(--surface-alt))]">
            {[
              { v: "light" as const, icon: <Sun className="h-4 w-4" />, label: "Light" },
              { v: "dark" as const, icon: <Moon className="h-4 w-4" />, label: "Dark" },
              { v: "system" as const, icon: <Monitor className="h-4 w-4" />, label: "System" },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setTheme(opt.v)}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition",
                  theme === opt.v
                    ? "bg-[rgb(var(--surface))] shadow-sm font-medium"
                    : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                )}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Reduced motion" description="Disables non-essential animations and transitions.">
          <Toggle value={reducedMotion} onChange={setReducedMotion} />
        </Row>
        <Row label="Text size" description="Adjusts interface text size. Lesson content uses your browser's zoom.">
          <div className="inline-flex rounded-lg border border-[rgb(var(--border))] p-0.5 bg-[rgb(var(--surface-alt))]">
            {["small", "medium", "large"].map((s) => (
              <button
                key={s}
                onClick={() => setTextSize(s)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md transition capitalize",
                  textSize === s
                    ? "bg-[rgb(var(--surface))] shadow-sm font-medium"
                    : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section icon={<Globe className="h-5 w-5 text-navy-600 dark:text-navy-400" />} title="Language & English mode">
        <Row label="Site language">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-1.5 text-sm"
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic) — interface only, technical terms remain English</option>
          </select>
        </Row>
        <Row label="Technical English" description="Standard uses authentic technical vocabulary. B1-B2 keeps canonical terms but simplifies surrounding language.">
          <div className="inline-flex rounded-lg border border-[rgb(var(--border))] p-0.5 bg-[rgb(var(--surface-alt))]">
            {[
              { v: "standard", label: "Standard Technical English" },
              { v: "b1b2", label: "B1-B2" },
              { v: "vocab", label: "Vocabulary Assist" },
              { v: "training", label: "English Training Mode" },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setEnglishMode(opt.v)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md transition",
                  englishMode === opt.v
                    ? "bg-[rgb(var(--surface))] shadow-sm font-medium"
                    : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section icon={<Sparkles className="h-5 w-5 text-navy-600 dark:text-navy-400" />} title="Learning preferences">
        <Row label="Default learning state" description="Used as the starting point for mentor conversations. You can change any time.">
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "deep", label: "Focused (Deep)" },
              { v: "drift", label: "Drifting" },
              { v: "fog", label: "Starting is hard (Fog)" },
              { v: "overload", label: "Too much at once" },
            ].map((s) => (
              <button key={s.v} className="text-xs px-2.5 py-1 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--surface))] hover:border-navy-400 transition">
                {s.label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section icon={<Shield className="h-5 w-5 text-navy-600 dark:text-navy-400" />} title="Privacy & security">
        <div className="text-sm text-[rgb(var(--text-muted))] leading-relaxed space-y-2">
          <p>All your progress, submissions, and mentor conversations are isolated to your account. Other students can never access your data.</p>
          <p>Secrets (API keys, database URIs) are stored server-side only and never exposed to the client bundle.</p>
          <p>The AI mentor follows a strict instruction hierarchy: system policy → application policy → your request → retrieved evidence. Retrieved document text can never override core safety instructions.</p>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[rgb(var(--border))] flex items-center gap-2">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-[rgb(var(--border))]">
        {children}
      </div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 flex items-start justify-between gap-6 flex-wrap sm:flex-nowrap">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-[rgb(var(--text-subtle))] mt-0.5 max-w-md leading-relaxed">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "h-6 w-11 rounded-full transition-colors relative",
        value ? "bg-navy-600" : "bg-[rgb(var(--border))]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          value ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
