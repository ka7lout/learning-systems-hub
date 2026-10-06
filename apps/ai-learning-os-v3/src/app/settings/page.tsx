import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUser } from "@/lib/auth";
import { providerConfigured, resolveProvider } from "@/lib/ai";
import { LEARNING_STATES } from "@/lib/learning";
import { PageHeader, Shell } from "@/components/shell";
import { PrefToggle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/");
  const store = await cookies();
  const get = (k: string, d: string) => store.get(k)?.value ?? d;
  const provider = resolveProvider("pro");

  return (
    <Shell user={user} active="/settings">
      <PageHeader
        title="Settings"
        lead="Presentation, language and accessibility preferences. They change how material is delivered; they never change the learning principles behind it."
      />

      <section className="surface p-4">
        <h2 className="text-sm font-medium mb-1">Appearance and accessibility</h2>
        <PrefToggle
          prefKey="ihls_theme"
          label="Theme"
          current={get("ihls_theme", "light")}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
        <PrefToggle
          prefKey="ihls_motion"
          label="Motion"
          current={get("ihls_motion", "full")}
          options={[
            { value: "full", label: "Standard" },
            { value: "reduced", label: "Reduced" },
          ]}
        />
        <PrefToggle
          prefKey="ihls_text"
          label="Text size"
          current={get("ihls_text", "normal")}
          options={[
            { value: "normal", label: "Normal" },
            { value: "large", label: "Large" },
          ]}
        />
        <PrefToggle
          prefKey="ihls_density"
          label="Reading density"
          current={get("ihls_density", "normal")}
          options={[
            { value: "normal", label: "Comfortable" },
            { value: "compact", label: "Compact" },
          ]}
        />
      </section>

      <section className="surface p-4 mt-5">
        <h2 className="text-sm font-medium mb-1">Language</h2>
        <PrefToggle
          prefKey="ihls_english"
          label="Content mode"
          current={get("ihls_english", "standard")}
          options={[
            { value: "standard", label: "Standard technical English" },
            { value: "b1b2", label: "B1–B2 English" },
            { value: "arabic", label: "Arabic + English terms" },
          ]}
        />
        <PrefToggle
          prefKey="ihls_vocab"
          label="Vocabulary assistance in lessons"
          current={get("ihls_vocab", "on")}
          options={[
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ]}
        />
        <p className="muted text-[11px] mt-3 leading-relaxed">
          Simplified modes change the surrounding language only. Canonical technical terms stay in English so
          that your professional vocabulary keeps growing.
        </p>
      </section>

      <section className="surface p-4 mt-5">
        <h2 className="text-sm font-medium">Study states</h2>
        <p className="muted text-[11px] mt-1 mb-3 leading-relaxed">
          Select your state from the bar at the top of every page. These are operational delivery modes, not
          diagnoses — this system never labels you with a medical or psychological condition.
        </p>
        <ul className="space-y-2 text-[13px]">
          {LEARNING_STATES.map((s) => (
            <li key={s.id}>
              <span className="tag">{s.label}</span>{" "}
              <span className="muted leading-relaxed">{s.guidance}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface p-4 mt-5">
        <h2 className="text-sm font-medium">AI provider status</h2>
        <p className="muted text-xs mt-2 leading-relaxed">
          {providerConfigured()
            ? `Configured: ${provider?.name} · reasoning model ${provider?.model}. Credentials are read server-side only and are never exposed to the browser.`
            : "No provider credential is present (PUTER_AUTH_TOKEN or OPENAI_API_KEY). The mentor returns stored human-authored scaffolding and a truthful unavailability notice instead of a fabricated answer. Everything else in the product continues to work."}
        </p>
      </section>

      <section className="surface p-4 mt-5">
        <h2 className="text-sm font-medium">Your data</h2>
        <p className="muted text-xs mt-2 leading-relaxed">
          Signed in as {user.name} ({user.email}), role {user.role}. Every record you create is scoped to a
          server-derived user id; the application never accepts an owner id supplied by the browser. No
          learner can read another learner&apos;s attempts, mastery, projects, evidence, mentor threads,
          English responses or career targets.
        </p>
      </section>
    </Shell>
  );
}
