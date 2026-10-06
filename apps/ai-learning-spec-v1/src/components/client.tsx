"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Mic,
  MicOff,
  MoonStar,
  Send,
  Sun,
} from "lucide-react";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, data };
}

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accentink focus:outline-none";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accentsoft dark:text-accentink";
const subtleButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-line bg-surfacemuted px-3 py-1.5 text-sm font-medium text-ink hover:border-linestrong disabled:opacity-50";

function Notice({ kind, children }: { kind: "error" | "info" | "ok"; children: React.ReactNode }) {
  const tone =
    kind === "error" ? "border-bad/40 text-bad" : kind === "ok" ? "border-good/40 text-good" : "border-line text-muted";
  return (
    <div className={`flex gap-2 rounded-md border bg-surfacemuted p-3 text-sm ${tone}`}>
      {kind === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : null}
      <div className="whitespace-pre-wrap leading-relaxed">{children}</div>
    </div>
  );
}

/* --------------------------------- auth --------------------------------- */

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { ok, data } = await post("/api/auth", { action: mode, ...form });
    setBusy(false);
    if (!ok) {
      const issues = Array.isArray(data.issues) ? (data.issues as string[]).join(", ") : null;
      setError((data.error as string) ?? issues ?? "Request failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-1 rounded-md border border-line bg-surfacemuted p-1 text-sm">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded px-3 py-1.5 font-medium ${mode === m ? "bg-surface text-ink" : "text-muted"}`}
          >
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>
      {mode === "signup" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Name</span>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
          />
        </label>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Email</span>
        <input
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Password</span>
        <input
          type="password"
          className={inputClass}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={mode === "signup" ? 10 : 1}
        />
        {mode === "signup" ? <span className="mt-1 block text-xs text-muted">Minimum 10 characters.</span> : null}
      </label>
      {error ? <Notice kind="error">{error}</Notice> : null}
      <button className={`${buttonClass} w-full`} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {mode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-xs text-muted hover:text-ink"
      onClick={async () => {
        await post("/api/auth", { action: "logout" });
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}

/* ------------------------------ theme toggle ----------------------------- */

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="rounded-md border border-line p-1.5 text-muted hover:text-ink"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("ihls-theme", next ? "dark" : "light");
      }}
    >
      {dark ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
}

/* ----------------------------- study state ------------------------------ */

const STATES = [
  { key: "deep", label: "I'm focused" },
  { key: "drift", label: "I'm drifting" },
  { key: "fog", label: "Starting feels hard" },
  { key: "overload", label: "Too much at once" },
] as const;

export function StateSelector({ current }: { current: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap gap-2">
      {STATES.map((s) => (
        <button
          key={s.key}
          type="button"
          disabled={busy !== null}
          onClick={async () => {
            setBusy(s.key);
            await post("/api/activity", { action: "state", state: s.key });
            setBusy(null);
            router.refresh();
          }}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            current === s.key ? "border-accentink bg-accentsoft text-accentink" : "border-line bg-surface text-muted hover:text-ink"
          }`}
        >
          {busy === s.key ? "…" : s.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------- distraction capture -------------------------- */

export function LaterCapture({ items }: { items: { id: number; text: string; done: boolean }[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const open = items.filter((i) => !i.done);
  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setBusy(true);
          await post("/api/activity", { action: "later_add", text });
          setText("");
          setBusy(false);
          router.refresh();
        }}
      >
        <input
          className={inputClass}
          placeholder="Park the thought and return to the task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className={subtleButton} disabled={busy}>
          Later
        </button>
      </form>
      {open.length === 0 ? (
        <p className="text-xs text-muted">Nothing parked.</p>
      ) : (
        <ul className="space-y-1">
          {open.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 text-sm text-ink">
              <span className="truncate">{item.text}</span>
              <button
                type="button"
                className="shrink-0 text-xs text-muted hover:text-ink"
                onClick={async () => {
                  await post("/api/activity", { action: "later_done", id: item.id });
                  router.refresh();
                }}
              >
                clear
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------- practice -------------------------------- */

const HELP_LEVELS = [
  { key: "no_help", label: "No help" },
  { key: "hint", label: "Hint" },
  { key: "guidance", label: "Guidance" },
  { key: "concept_reminder", label: "Concept reminder" },
  { key: "worked_example", label: "Worked example" },
  { key: "full_explanation", label: "Full explanation" },
] as const;

const ERROR_CLASSES = [
  { key: "concept", label: "Concept" },
  { key: "recall", label: "Recall" },
  { key: "selection", label: "Selection" },
  { key: "execution", label: "Execution" },
  { key: "transfer", label: "Transfer" },
  { key: "attention", label: "Attention" },
  { key: "load", label: "Load" },
] as const;

export type PracticeItemData = {
  key: string;
  type: string;
  stage: string;
  difficulty: string;
  prompt: string;
  context: string | null;
  rubric: string[];
};

export function PracticeItem({ item }: { item: PracticeItemData }) {
  const router = useRouter();
  const [response, setResponse] = useState("");
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(item.rubric.map(() => false));
  const [helpLevel, setHelpLevel] = useState<string>("no_help");
  const [errorClass, setErrorClass] = useState<string>("");
  const [result, setResult] = useState<{ score: number; outcome: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted">
        <span className="rounded border border-line px-1.5 py-0.5">{item.type.replace(/_/g, " ")}</span>
        <span className="rounded border border-line px-1.5 py-0.5">{item.stage}</span>
        <span className="rounded border border-line px-1.5 py-0.5">level {item.difficulty}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{item.prompt}</p>
      {item.context ? (
        <pre className="overflow-x-auto rounded-md border border-line bg-surfacemuted p-3 text-[12.5px] leading-relaxed">
          <code>{item.context}</code>
        </pre>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Your attempt</span>
        <textarea
          className={`${inputClass} min-h-28 font-mono text-[13px]`}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your reasoning before revealing the rubric."
        />
      </label>

      {!submittedAttempt ? (
        <button
          type="button"
          className={subtleButton}
          disabled={response.trim().length < 10}
          onClick={() => setSubmittedAttempt(true)}
        >
          Lock attempt and show the rubric
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md border border-line bg-surfacemuted p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Self-assess honestly against each criterion
            </p>
            <ul className="space-y-2">
              {item.rubric.map((line, i) => (
                <li key={line} className="flex items-start gap-2 text-sm text-ink">
                  <input
                    id={`${item.key}-r${i}`}
                    type="checkbox"
                    className="mt-1"
                    checked={checks[i] ?? false}
                    onChange={(e) => {
                      const next = [...checks];
                      next[i] = e.target.checked;
                      setChecks(next);
                    }}
                  />
                  <label htmlFor={`${item.key}-r${i}`} className="leading-snug">
                    {line}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Help used</span>
              <select className={inputClass} value={helpLevel} onChange={(e) => setHelpLevel(e.target.value)}>
                {HELP_LEVELS.map((h) => (
                  <option key={h.key} value={h.key}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">If you missed something, which kind of error?</span>
              <select className={inputClass} value={errorClass} onChange={(e) => setErrorClass(e.target.value)}>
                <option value="">Not applicable</option>
                {ERROR_CLASSES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <Notice kind="error">{error}</Notice> : null}
          {result ? (
            <Notice kind={result.outcome === "incorrect" ? "error" : "ok"}>
              Recorded: {result.outcome} ({Math.round(result.score * 100)}% of rubric met). A retrieval slot for this item
              has been scheduled; the interval shortens when the outcome is weak.
            </Notice>
          ) : (
            <button
              type="button"
              className={buttonClass}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                const { ok, data } = await post("/api/attempts", {
                  itemKey: item.key,
                  responseText: response,
                  helpLevel,
                  rubricChecks: checks,
                  errorClass: errorClass || null,
                });
                setBusy(false);
                if (!ok) {
                  setError((data.error as string) ?? "Could not record this attempt.");
                  return;
                }
                const res = data.result as { score: number; outcome: string };
                setResult(res);
                router.refresh();
              }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Record attempt
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- mentor ---------------------------------- */

export type MentorMessage = {
  id: number;
  role: string;
  content: string;
  specialist: string | null;
  provider: string | null;
};

export function MentorPanel({
  specialists,
  lessonKey,
  initialMessages,
  providerConfigured,
  compact = false,
}: {
  specialists: { key: string; label: string; description: string }[];
  lessonKey?: string | null;
  initialMessages: MentorMessage[];
  providerConfigured: boolean;
  compact?: boolean;
}) {
  const [messages, setMessages] = useState<MentorMessage[]>(initialMessages);
  const [message, setMessage] = useState("");
  const [specialist, setSpecialist] = useState(specialists[0]?.key ?? "lead_mentor");
  const [attemptMade, setAttemptMade] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<{ error: string; fallback: string } | null>(null);

  const active = useMemo(() => specialists.find((s) => s.key === specialist), [specialist, specialists]);

  async function send(text: string) {
    if (!text.trim()) return;
    setBusy(true);
    setFailure(null);
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: text, specialist, provider: null }]);
    setMessage("");
    const { ok, data } = await post("/api/mentor", { message: text, specialist, lessonKey: lessonKey ?? null, attemptMade });
    setBusy(false);
    if (ok) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "mentor",
          content: data.content as string,
          specialist,
          provider: data.provider as string,
        },
      ]);
      return;
    }
    setFailure({
      error: (data.error as string) ?? "The mentor could not respond.",
      fallback: (data.fallback as string) ?? "",
    });
  }

  const quick = [
    "Explain this to me",
    "Give me a hint",
    "Check my reasoning",
    "Simplify it (B1-B2)",
    "Give an example",
    "Challenge me",
    "Explain in Arabic",
    "Tell me what to write in my notebook",
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      {!providerConfigured ? (
        <Notice kind="info">
          No AI provider is configured in this deployment. The mentor will not fabricate answers — it returns a truthful
          unavailable state and a rule-based study protocol generated from the curriculum data instead.
        </Notice>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Mentor council</span>
          <select className={inputClass} value={specialist} onChange={(e) => setSpecialist(e.target.value)}>
            {specialists.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-muted">
          <input type="checkbox" checked={attemptMade} onChange={(e) => setAttemptMade(e.target.checked)} />
          I already attempted it
        </label>
      </div>
      {active ? <p className="text-xs text-muted">{active.description}</p> : null}

      <div
        className={`flex-1 space-y-3 overflow-y-auto rounded-md border border-line bg-surfacemuted p-3 ${
          compact ? "max-h-80" : "min-h-64"
        }`}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing yet. The default teaching mode asks for your attempt first and gives the smallest useful hint.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <p className="mb-1 text-[11px] uppercase tracking-wide text-muted">
                {m.role === "user" ? "You" : m.role === "mentor" ? `Mentor · ${m.provider ?? ""}` : "System notice"}
              </p>
              <div
                className={`whitespace-pre-wrap rounded-md border p-3 leading-relaxed ${
                  m.role === "user"
                    ? "border-line bg-surface text-ink"
                    : m.role === "mentor"
                      ? "border-accentink/30 bg-surface text-ink"
                      : "border-bad/30 bg-surface text-muted"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {failure ? (
          <div className="space-y-2">
            <Notice kind="error">{failure.error}</Notice>
            {failure.fallback ? <Notice kind="info">{failure.fallback}</Notice> : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quick.map((q) => (
          <button key={q} type="button" className="rounded border border-line px-2 py-1 text-xs text-muted hover:text-ink" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(message);
        }}
      >
        <input className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask the mentor…" />
        <button className={buttonClass} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------- projects -------------------------------- */

export function ProjectWorkspace({
  projectKey,
  started,
  milestones,
  definitionOfDone,
  state,
}: {
  projectKey: string;
  started: boolean;
  milestones: string[];
  definitionOfDone: string[];
  state: {
    status: string;
    repoUrl: string | null;
    demoUrl: string | null;
    datasetUrl: string | null;
    reportUrl: string | null;
    notes: string;
    milestoneState: Record<string, boolean>;
    dodState: Record<string, boolean>;
  } | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    status: state?.status ?? "in_progress",
    repoUrl: state?.repoUrl ?? "",
    demoUrl: state?.demoUrl ?? "",
    datasetUrl: state?.datasetUrl ?? "",
    reportUrl: state?.reportUrl ?? "",
    notes: state?.notes ?? "",
  });
  const [milestoneState, setMilestoneState] = useState<Record<string, boolean>>(state?.milestoneState ?? {});
  const [dodState, setDodState] = useState<Record<string, boolean>>(state?.dodState ?? {});
  const [evidence, setEvidence] = useState({ kind: "repo", url: "", description: "" });

  if (!started) {
    return (
      <button
        type="button"
        className={buttonClass}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await post("/api/projects", { action: "start", projectKey });
          setBusy(false);
          router.refresh();
        }}
      >
        Start this project
      </button>
    );
  }

  async function save() {
    setBusy(true);
    setError(null);
    const { ok, data } = await post("/api/projects", {
      action: "update",
      projectKey,
      ...form,
      milestoneState,
      dodState,
    });
    setBusy(false);
    if (!ok) setError((data.error as string) ?? "Could not save.");
    else router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-ink">Milestones</p>
          {milestones.map((m) => (
            <label key={m} className="flex items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="mt-1"
                checked={milestoneState[m] ?? false}
                onChange={(e) => setMilestoneState({ ...milestoneState, [m]: e.target.checked })}
              />
              <span>{m}</span>
            </label>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-ink">Definition of done</p>
          {definitionOfDone.map((d) => (
            <label key={d} className="flex items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="mt-1"
                checked={dodState[d] ?? false}
                onChange={(e) => setDodState({ ...dodState, [d]: e.target.checked })}
              />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(
          [
            ["repoUrl", "Repository URL"],
            ["demoUrl", "Demo / deployment URL"],
            ["datasetUrl", "Dataset source URL"],
            ["reportUrl", "Report / model card URL"],
          ] as const
        ).map(([field, label]) => (
          <label key={field} className="block text-sm">
            <span className="mb-1 block font-medium text-ink">{label}</span>
            <input
              className={inputClass}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder="https://"
            />
          </label>
        ))}
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-ink">Working notes (decisions, data provenance, failures)</span>
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Status</span>
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {["planned", "in_progress", "in_review", "done", "abandoned"].map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <Notice kind="error">{error}</Notice> : null}
      <button type="button" className={buttonClass} onClick={save} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save project state
      </button>

      <div className="space-y-3 rounded-lg border border-line bg-surfacemuted p-4">
        <p className="text-sm font-semibold text-ink">Record evidence</p>
        <p className="text-xs text-muted">
          Evidence is what the career engine and CV engine are allowed to cite. Nothing is generated without it.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <select className={inputClass} value={evidence.kind} onChange={(e) => setEvidence({ ...evidence, kind: e.target.value })}>
            {[
              "repo",
              "commit",
              "pr",
              "deployment",
              "report",
              "model_card",
              "test_suite",
              "oral_defense",
              "incident_report",
              "dataset_audit",
            ].map((k) => (
              <option key={k} value={k}>
                {k.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="https:// (optional)"
            value={evidence.url}
            onChange={(e) => setEvidence({ ...evidence, url: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="What exactly does this prove?"
            value={evidence.description}
            onChange={(e) => setEvidence({ ...evidence, description: e.target.value })}
          />
        </div>
        <button
          type="button"
          className={subtleButton}
          disabled={busy || evidence.description.trim().length < 5}
          onClick={async () => {
            setBusy(true);
            setError(null);
            const { ok, data } = await post("/api/projects", { action: "evidence", projectKey, ...evidence });
            setBusy(false);
            if (!ok) setError((data.error as string) ?? "Could not add evidence.");
            else {
              setEvidence({ kind: "repo", url: "", description: "" });
              router.refresh();
            }
          }}
        >
          Add evidence
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- english -------------------------------- */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
};

export function EnglishLab({
  prompts,
}: {
  prompts: { key: string; dimension: string; activity: string; prompt: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(prompts[0]);
  const [response, setResponse] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function toggleSpeech() {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) text += `${event.results[i][0].transcript} `;
      setResponse(text.trim());
    };
    recognition.onend = () => setListening(false);
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Activity</span>
        <select
          className={inputClass}
          value={selected.key}
          onChange={(e) => {
            setSelected(prompts.find((p) => p.key === e.target.value) ?? prompts[0]);
            setSaved(false);
          }}
        >
          {prompts.map((p) => (
            <option key={p.key} value={p.key}>
              {p.dimension} — {p.activity}
            </option>
          ))}
        </select>
      </label>
      <p className="rounded-md border border-line bg-surfacemuted p-3 text-sm leading-relaxed text-ink">{selected.prompt}</p>
      <textarea
        className={`${inputClass} min-h-36`}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write or dictate your answer in English…"
      />
      <div className="flex flex-wrap items-center gap-2">
        {supported ? (
          <button type="button" className={subtleButton} onClick={toggleSpeech}>
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? "Stop dictation" : "Speak instead"}
          </button>
        ) : (
          <span className="text-xs text-muted">
            Speech recognition is not available in this browser, so the written fallback is used. No pronunciation score is
            produced, because this system cannot measure it reliably.
          </span>
        )}
        <button
          type="button"
          className={buttonClass}
          disabled={busy || response.trim().length < 10}
          onClick={async () => {
            setBusy(true);
            await post("/api/activity", {
              action: "english",
              dimension: selected.dimension,
              activity: selected.activity,
              response,
              mode: listening ? "speech" : "text",
              promptKey: selected.key,
            });
            setBusy(false);
            setSaved(true);
            setResponse("");
            router.refresh();
          }}
        >
          Record activity
        </button>
        {saved ? <span className="text-xs text-good">Saved.</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------- freelance -------------------------------- */

export function FreelanceSim({
  scenario,
}: {
  scenario: { key: string; title: string; clientMessage: string; requiredQuestions: string[]; deliverableRubric: string[] };
}) {
  const [questions, setQuestions] = useState<string[]>([""]);
  const [proposal, setProposal] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    coverage: number;
    covered: string[];
    missed: string[];
    hiddenConstraints: string[];
  } | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-line bg-surfacemuted p-4">
        <p className="mb-1 text-[11px] uppercase tracking-wide text-muted">Simulated client — not a real client</p>
        <p className="text-sm leading-relaxed text-ink">{scenario.clientMessage}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">Your discovery questions (before quoting anything)</p>
        {questions.map((q, i) => (
          <input
            key={i}
            className={inputClass}
            value={q}
            placeholder={`Question ${i + 1}`}
            onChange={(e) => {
              const next = [...questions];
              next[i] = e.target.value;
              setQuestions(next);
            }}
          />
        ))}
        <button type="button" className={subtleButton} onClick={() => setQuestions([...questions, ""])}>
          Add question
        </button>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Scope and acceptance criteria</span>
        <textarea
          className={`${inputClass} min-h-32`}
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder="Deliverables, exclusions, testable acceptance criteria, change-request process…"
        />
      </label>

      <button
        type="button"
        className={buttonClass}
        disabled={busy || questions.filter((q) => q.trim()).length === 0}
        onClick={async () => {
          setBusy(true);
          const { ok, data } = await post("/api/activity", {
            action: "freelance",
            scenarioKey: scenario.key,
            questionsAsked: questions.filter((q) => q.trim()),
            proposal,
          });
          setBusy(false);
          if (ok) {
            setResult({
              coverage: data.coverage as number,
              covered: data.covered as string[],
              missed: data.missed as string[],
              hiddenConstraints: data.hiddenConstraints as string[],
            });
          }
        }}
      >
        Submit discovery
      </button>

      {result ? (
        <div className="space-y-3 rounded-md border border-line bg-surfacemuted p-4 text-sm">
          <p className="font-medium text-ink">Discovery coverage: {Math.round(result.coverage * 100)}%</p>
          {result.missed.length > 0 ? (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-muted">Questions you did not ask</p>
              <ul className="list-disc space-y-1 pl-5 text-ink">
                {result.missed.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-good">You covered every required discovery area.</p>
          )}
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted">Constraints the client did not volunteer</p>
            <ul className="list-disc space-y-1 pl-5 text-ink">
              {result.hiddenConstraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted">Rubric for your proposal</p>
            <ul className="list-disc space-y-1 pl-5 text-ink">
              {scenario.deliverableRubric.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------- settings -------------------------------- */

export function SettingsForm({
  settings,
  roles,
}: {
  settings: Record<string, unknown>;
  roles: { key: string; title: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    contentMode: (settings.contentMode as string) ?? "standard",
    uiLanguage: (settings.uiLanguage as string) ?? "en",
    vocabAssist: (settings.vocabAssist as boolean) ?? true,
    reducedMotion: (settings.reducedMotion as boolean) ?? false,
    readingDensity: (settings.readingDensity as string) ?? "comfortable",
    hintPolicy: (settings.hintPolicy as string) ?? "attempt_first",
    targetRoleKey: (settings.targetRoleKey as string) ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Content mode</span>
          <select className={inputClass} value={form.contentMode} onChange={(e) => setForm({ ...form, contentMode: e.target.value })}>
            <option value="standard">Standard Technical English</option>
            <option value="b1b2">B1-B2 English (terms preserved)</option>
            <option value="arabic">Arabic explanation where available</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Interface language</span>
          <select className={inputClass} value={form.uiLanguage} onChange={(e) => setForm({ ...form, uiLanguage: e.target.value })}>
            <option value="en">English</option>
            <option value="ar">العربية (content-level)</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Mentor hint policy</span>
          <select className={inputClass} value={form.hintPolicy} onChange={(e) => setForm({ ...form, hintPolicy: e.target.value })}>
            <option value="attempt_first">Require my attempt first (recommended)</option>
            <option value="open">Answer directly when I ask</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Reading density</span>
          <select
            className={inputClass}
            value={form.readingDensity}
            onChange={(e) => setForm({ ...form, readingDensity: e.target.value })}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-ink">Target role</span>
          <select
            className={inputClass}
            value={form.targetRoleKey}
            onChange={(e) => setForm({ ...form, targetRoleKey: e.target.value })}
          >
            <option value="">No target role selected</option>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.vocabAssist} onChange={(e) => setForm({ ...form, vocabAssist: e.target.checked })} />
          Vocabulary assistance
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.reducedMotion}
            onChange={(e) => setForm({ ...form, reducedMotion: e.target.checked })}
          />
          Reduce motion
        </label>
      </div>
      <button
        type="button"
        className={buttonClass}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await post("/api/activity", {
            action: "settings",
            ...form,
            targetRoleKey: form.targetRoleKey || null,
          });
          setBusy(false);
          setSaved(true);
          router.refresh();
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save settings
      </button>
      {saved ? <p className="text-xs text-good">Settings saved.</p> : null}
    </div>
  );
}
