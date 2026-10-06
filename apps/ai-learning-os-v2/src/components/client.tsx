"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Map, BookOpen, FlaskConical, FolderGit2, RotateCcw, Network, Briefcase, Handshake, Microscope, MessageSquare, FileBadge, Settings as SettingsIcon, Languages, Menu, X, ShieldCheck, Inbox, Mic, Send, Loader2,
} from "lucide-react";

async function post<T = Record<string, unknown>>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string; code?: string }> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.issues?.join(" ") || j.error || `Request failed (${r.status})`, code: j.code };
    return { ok: true, data: j as T };
  } catch { return { ok: false, error: "Network error — check your connection and retry." }; }
}

function ErrorNote({ msg, code }: { msg: string | null; code?: string }) {
  if (!msg) return null;
  return <p role="alert" className={`mt-2 rounded-md border px-3 py-2 text-sm ${code === "provider_unavailable" ? "border-warn/40 text-warn" : "border-bad/40 text-bad"}`}>{msg}</p>;
}

const NAV = [
  ["/dashboard", "Dashboard", LayoutDashboard], ["/curriculum", "Curriculum", Map], ["/learn", "Learn", BookOpen], ["/practice", "Practice Lab", FlaskConical],
  ["/projects", "Projects", FolderGit2], ["/review", "Review", RotateCcw], ["/skills", "Skills", Network], ["/career", "Career", Briefcase],
  ["/freelance", "Freelance", Handshake], ["/research", "Research", Microscope], ["/english", "English", Languages], ["/mentor", "AI Mentor", MessageSquare],
  ["/portfolio", "Portfolio", FileBadge], ["/settings", "Settings", SettingsIcon],
] as const;

export function AppNav({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const links = (
    <nav aria-label="Primary" className="flex flex-col gap-0.5">
      {NAV.map(([href, label, Icon]) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm ${active ? "bg-accent-soft text-accent font-medium" : "text-muted hover:bg-sunken hover:text-ink"}`}>
            <Icon size={16} aria-hidden /> {label}
          </Link>
        );
      })}
      {isAdmin && <Link href="/admin" className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm ${path.startsWith("/admin") ? "bg-accent-soft text-accent" : "text-muted hover:bg-sunken"}`}><ShieldCheck size={16} aria-hidden /> Admin</Link>}
    </nav>
  );
  const footer = (
    <div className="mt-auto border-t border-line pt-3 text-xs text-muted">
      <div className="truncate">{name}</div>
      <button className="mt-1 underline" onClick={async () => { await post("/api/auth/logout", {}); router.push("/login"); router.refresh(); }}>Sign out</button>
    </div>
  );
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-2.5 lg:hidden">
        <span className="text-sm font-semibold">IHLS</span>
        <button className="btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={16} /> : <Menu size={16} />}</button>
      </header>
      {open && <div className="fixed inset-0 z-20 bg-bg/95 p-4 pt-16 lg:hidden flex flex-col">{links}{footer}</div>}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 flex-col border-r border-line bg-surface p-3">
        <Link href="/dashboard" className="mb-4 px-2.5 pt-1">
          <div className="text-sm font-semibold tracking-tight">IHLS</div>
          <div className="text-[11px] leading-tight text-muted">AI Engineering Learning OS</div>
        </Link>
        {links}{footer}
      </aside>
    </>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setErr(null);
      const f = new FormData(e.currentTarget);
      const r = await post(`/api/auth/${mode}`, Object.fromEntries(f));
      setBusy(false);
      if (!r.ok) return setErr(r.error);
      router.push(mode === "register" ? "/diagnostic" : "/dashboard"); router.refresh();
    }}>
      {mode === "register" && <label className="block text-sm">Name<input name="name" required className="input mt-1" autoComplete="name" /></label>}
      <label className="block text-sm">Email<input name="email" type="email" required className="input mt-1" autoComplete="email" /></label>
      <label className="block text-sm">Password<input name="password" type="password" required minLength={mode === "register" ? 8 : 1} className="input mt-1" autoComplete={mode === "register" ? "new-password" : "current-password"} /></label>
      <ErrorNote msg={err} />
      <button className="btn btn-primary w-full justify-center" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
    </form>
  );
}

const STATES = [["deep", "I’m focused"], ["drift", "I’m drifting"], ["fog", "Starting feels hard"], ["overload", "There is too much at once"]] as const;
export function StateSelector({ current, plans }: { current: string; plans: Record<string, string> }) {
  const [s, setS] = useState(current);
  const router = useRouter();
  return (
    <div>
      <p className="text-sm font-medium">How does studying feel right now?</p>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Study state">
        {STATES.map(([v, l]) => (
          <button key={v} role="radio" aria-checked={s === v} className={`btn ${s === v ? "!border-accent !bg-accent-soft text-accent" : ""}`}
            onClick={async () => { setS(v); await post("/api/me", { op: "settings", data: { studyState: v } }); router.refresh(); }}>{l}</button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">{plans[s]}</p>
    </div>
  );
}

export function LaterCapture({ items }: { items: { id: number; text: string; done: boolean }[] }) {
  const [text, setText] = useState("");
  const router = useRouter();
  return (
    <div>
      <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!text.trim()) return; await post("/api/me", { op: "later", text }); setText(""); router.refresh(); }}>
        <label className="sr-only" htmlFor="later">Park a distracting thought for later</label>
        <input id="later" className="input" placeholder="A thought pulling you away? Park it here." value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn" aria-label="Save to Later"><Inbox size={16} /></button>
      </form>
      {items.length > 0 && <ul className="mt-2 space-y-1">{items.map((i) => (
        <li key={i.id} className="flex items-center gap-2 text-sm"><input type="checkbox" aria-label={`Mark "${i.text}" done`} checked={i.done} onChange={async () => { await post("/api/me", { op: "laterToggle", id: i.id }); router.refresh(); }} /><span className={i.done ? "line-through text-muted" : ""}>{i.text}</span></li>
      ))}</ul>}
    </div>
  );
}

export function SeenMarker({ nodeId }: { nodeId: string }) {
  useEffect(() => { void post("/api/learn", { op: "seen", nodeId }); }, [nodeId]);
  return null;
}

type Item = { id: string; prompt: string; stage: string; difficulty: string; taskType: string; keyPoints: string[]; nodeTitle?: string };
const HELP = [["none", "No help"], ["hint", "Hint"], ["guidance", "Guidance"], ["reminder", "Concept reminder"], ["worked_example", "Worked example"], ["full_explanation", "Full explanation"]] as const;
const ERRS = [["concept", "Concept"], ["recall", "Recall"], ["selection", "Selection"], ["execution", "Execution"], ["transfer", "Transfer"], ["attention", "Attention"], ["load", "Load"]] as const;

export function PracticeBox({ item, state }: { item: Item; state: string }) {
  const [phase, setPhase] = useState<"attempt" | "assess" | "done">("attempt");
  const [resp, setResp] = useState("");
  const [checked, setChecked] = useState<boolean[]>(item.keyPoints.map(() => false));
  const [help, setHelp] = useState("none");
  const [errType, setErrType] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; level: number; nextReviewDays: number; modelAnswer: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const covered = checked.filter(Boolean).length;
  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="chip capitalize">{item.stage}</span><span className="chip">Level {item.difficulty}</span><span className="chip">{item.taskType.replace(/_/g, " ")}</span>
        {item.nodeTitle && <span className="text-muted">{item.nodeTitle}</span>}
      </div>
      <p className="mt-2 text-[15px]">{item.prompt}</p>
      {phase === "attempt" && (
        <>
          <label className="sr-only" htmlFor={`a-${item.id}`}>Your attempt</label>
          <textarea id={`a-${item.id}`} className="input mt-3 min-h-28 font-mono text-sm" placeholder="Your attempt — from memory, before looking anything up." value={resp} onChange={(e) => setResp(e.target.value)} />
          <div className="mt-2 flex items-center gap-2">
            <button className="btn btn-primary" disabled={resp.trim().length < 3} onClick={() => setPhase("assess")}>Submit attempt</button>
            <span className="text-xs text-muted">The checklist appears only after you attempt.</span>
          </div>
        </>
      )}
      {phase === "assess" && (
        <div className="mt-3 space-y-3">
          <fieldset><legend className="text-sm font-medium">Which of these did your answer actually cover?</legend>
            <ul className="mt-1 space-y-1">{item.keyPoints.map((k, i) => (
              <li key={i}><label className="flex gap-2 text-sm"><input type="checkbox" checked={checked[i]} onChange={() => setChecked(checked.map((c, j) => (j === i ? !c : c)))} />{k}</label></li>
            ))}</ul>
          </fieldset>
          <label className="block text-sm">Help used during this attempt
            <select className="input mt-1" value={help} onChange={(e) => setHelp(e.target.value)}>{HELP.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </label>
          {covered < item.keyPoints.length && (
            <label className="block text-sm">What best describes the gap?
              <select className="input mt-1" value={errType ?? ""} onChange={(e) => setErrType(e.target.value || null)}><option value="">Not sure</option>{ERRS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
          )}
          <ErrorNote msg={err} />
          <button className="btn btn-primary" onClick={async () => {
            setErr(null);
            const r = await post<{ score: number; level: number; nextReviewDays: number; modelAnswer: string }>("/api/learn", { op: "attempt", itemId: item.id, response: resp, helpLevel: help, covered, errorType: errType, studyState: state });
            if (!r.ok) return setErr(r.error);
            setResult(r.data); setPhase("done"); router.refresh();
          }}>Record result</button>
        </div>
      )}
      {phase === "done" && result && (
        <div className="mt-3 rounded-md bg-sunken p-3 text-sm">
          <p><strong>{Math.round(result.score * 100)}%</strong> of key points covered{help !== "none" ? " (assisted — counts less toward independent mastery)" : ""}. Next review in about {result.nextReviewDays} day{result.nextReviewDays === 1 ? "" : "s"}.</p>
          <p className="mt-2 text-muted">Reference answer: {result.modelAnswer}</p>
          {result.score < 0.6 && <p className="mt-2">Not there yet — that’s information, not a verdict. Re-read the relevant part, then try a new problem rather than re-reading this one.</p>}
          <button className="btn mt-2" onClick={() => { setPhase("attempt"); setResp(""); setChecked(item.keyPoints.map(() => false)); setHelp("none"); setResult(null); }}>Try again later</button>
        </div>
      )}
    </div>
  );
}

const ACTIONS = [["hint", "Give me a hint"], ["check", "Check my reasoning"], ["explain", "Explain"], ["simplify", "Simplify"], ["example", "Give an example"], ["challenge", "Challenge me"], ["arabic", "Arabic explanation"], ["b1b2", "B1–B2 English"], ["oral", "Ask me verbally"], ["project", "Connect to project"], ["write", "Tell me what to write"]] as const;

export function MentorPanel({ nodeId, compact = false }: { nodeId: string | null; compact?: boolean }) {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ role: string; content: string; meta?: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ msg: string; code?: string } | null>(null);
  async function run(action: string) {
    setBusy(true); setErr(null);
    const r = await post<{ content: string; specialist: string; model: string | null }>("/api/learn", { op: "mentor", action, nodeId, input });
    setBusy(false);
    if (!r.ok) return setErr({ msg: r.error, code: r.code });
    setLog((l) => [...l, ...(input ? [{ role: "you", content: input }] : [{ role: "you", content: `[${action}]` }]), { role: "mentor", content: r.data.content, meta: `${r.data.specialist}${r.data.model ? " · " + r.data.model : ""}` }]);
    setInput("");
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">{(compact ? ACTIONS.slice(0, 6) : ACTIONS).map(([a, l]) => <button key={a} className="btn !py-1 !text-xs" disabled={busy} onClick={() => run(a)}>{l}</button>)}</div>
      <label className="sr-only" htmlFor={`m-${nodeId}`}>Message to mentor</label>
      <textarea id={`m-${nodeId}`} className="input min-h-20 text-sm" placeholder="Paste your attempt or ask a question. For hints and checks, include your attempt." value={input} onChange={(e) => setInput(e.target.value)} />
      <button className="btn btn-primary self-start" disabled={busy || !input.trim()} onClick={() => run("chat")}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send</button>
      {err && <ErrorNote msg={err.msg} code={err.code} />}
      <div className="space-y-2" aria-live="polite">{log.map((m, i) => (
        <div key={i} className={`rounded-md p-3 text-sm ${m.role === "mentor" ? "bg-sunken" : "border border-line"}`}>
          <div className="mb-1 text-[11px] uppercase tracking-wide text-muted">{m.role === "mentor" ? m.meta : "You"}</div>
          <div className="whitespace-pre-wrap prose-ihls">{m.content}</div>
        </div>
      ))}</div>
    </div>
  );
}

type S = Record<string, unknown> & { theme: string; uiLanguage: string; contentMode: string; vocabAssist: boolean; englishTraining: boolean; density: string; textSize: string; reducedMotion: boolean; hintPolicy: string; targetRoles: string[] };
export function SettingsForm({ data }: { data: S }) {
  const [s, setS] = useState(data);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const sel = (k: keyof S, label: string, opts: [string, string][]) => (
    <label className="block text-sm">{label}<select className="input mt-1" value={String(s[k])} onChange={(e) => setS({ ...s, [k]: e.target.value })}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
  );
  const chk = (k: keyof S, label: string) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(s[k])} onChange={(e) => setS({ ...s, [k]: e.target.checked })} />{label}</label>;
  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); const r = await post("/api/me", { op: "settings", data: { theme: s.theme, uiLanguage: s.uiLanguage, contentMode: s.contentMode, vocabAssist: s.vocabAssist, englishTraining: s.englishTraining, density: s.density, textSize: s.textSize, reducedMotion: s.reducedMotion, hintPolicy: s.hintPolicy, targetRoles: s.targetRoles } }); setMsg(r.ok ? "Saved." : r.error); router.refresh(); }}>
      {sel("theme", "Theme", [["system", "System"], ["light", "Light"], ["dark", "Dark"]])}
      {sel("uiLanguage", "Interface language", [["en", "English"], ["ar", "Arabic (mentor & explanations)"]])}
      {sel("contentMode", "Content mode", [["standard", "Standard Technical English"], ["b1b2", "B1–B2 English"], ["arabic", "Arabic"]])}
      {sel("hintPolicy", "Mentor hint policy", [["attempt_first", "Attempt first (recommended)"], ["on_request", "Hints on request"]])}
      {sel("textSize", "Text size", [["base", "Default"], ["lg", "Large"]])}
      {sel("density", "Reading density", [["comfortable", "Comfortable"], ["compact", "Compact"]])}
      <div className="space-y-2">{chk("vocabAssist", "Vocabulary assistance on technical terms")}{chk("englishTraining", "English Training Mode")}{chk("reducedMotion", "Reduce motion")}</div>
      <fieldset className="text-sm"><legend className="font-medium">Career targets</legend>
        {[["navisoft", "Navisoft-style AI Engineer"], ["nuwave", "NUWAVE-style Production AI Engineer"]].map(([v, l]) => (
          <label key={v} className="mt-1 flex items-center gap-2"><input type="checkbox" checked={s.targetRoles.includes(v)} onChange={(e) => setS({ ...s, targetRoles: e.target.checked ? [...s.targetRoles, v] : s.targetRoles.filter((x) => x !== v) })} />{l}</label>
        ))}
      </fieldset>
      <div className="sm:col-span-2 flex items-center gap-3"><button className="btn btn-primary">Save settings</button>{msg && <span className="text-sm text-muted" role="status">{msg}</span>}</div>
    </form>
  );
}

export function DiagnosticForm({ groups }: { groups: { module: string; units: { id: string; title: string }[] }[] }) {
  const [known, setKnown] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">{groups.map((g) => (
        <fieldset key={g.module} className="card p-4"><legend className="px-1 text-sm font-medium">{g.module}</legend>
          {g.units.map((u) => <label key={u.id} className="mt-1 flex gap-2 text-sm"><input type="checkbox" checked={known.includes(u.id)} onChange={(e) => setKnown(e.target.checked ? [...known, u.id] : known.filter((k) => k !== u.id))} />{u.title}</label>)}
        </fieldset>
      ))}</div>
      <ErrorNote msg={err} />
      <button className="btn btn-primary mt-4" onClick={async () => { const r = await post("/api/learn", { op: "diagnostic", known }); if (!r.ok) return setErr(r.error); router.push("/dashboard"); router.refresh(); }}>Finish diagnostic</button>
    </div>
  );
}

const LINK_LABELS: [string, string][] = [["repository", "Repository"], ["codespace", "Codespace"], ["colab", "Colab"], ["kaggle", "Kaggle"], ["dataset", "Dataset"], ["deployment", "Deployment"], ["apiDocs", "API Docs"], ["report", "Report"], ["demo", "Demo"]];
export function ProjectEditor({ id, links, milestones, done, status }: { id: number; links: Record<string, string>; milestones: string[]; done: number[]; status: string }) {
  const [l, setL] = useState(links);
  const [d, setD] = useState(done);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const save = async (extra: Record<string, unknown> = {}) => { const r = await post("/api/me", { op: "projectUpdate", id, links: l, milestonesDone: d, ...extra }); setMsg(r.ok ? "Saved." : r.error); router.refresh(); };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section><h2 className="font-medium">Milestones (Definition of Done)</h2>
        <ul className="mt-2 space-y-1">{milestones.map((m, i) => <li key={i}><label className="flex gap-2 text-sm"><input type="checkbox" checked={d.includes(i)} onChange={(e) => setD(e.target.checked ? [...d, i] : d.filter((x) => x !== i))} />{m}</label></li>)}</ul>
      </section>
      <section><h2 className="font-medium">Environment & evidence links</h2>
        <div className="mt-2 grid gap-2">{LINK_LABELS.map(([k, label]) => <label key={k} className="text-sm">{label}<input className="input mt-0.5" placeholder="https://" value={l[k] ?? ""} onChange={(e) => setL({ ...l, [k]: e.target.value })} /></label>)}</div>
      </section>
      <div className="md:col-span-2 flex flex-wrap items-center gap-2">
        <button className="btn btn-primary" onClick={() => save()}>Save project</button>
        {status !== "completed" && <button className="btn" onClick={() => save({ status: "completed" })}>Mark completed</button>}
        {msg && <span role="status" className="text-sm text-muted">{msg}</span>}
      </div>
    </div>
  );
}

const TIERS = ["Practice Only", "Skill Evidence", "Technical Artifact", "Portfolio Project", "Professional Evidence", "Signature Project"];
export function EvidenceForm({ projects, skills, defaultProject }: { projects: { id: number; title: string }[]; skills: { id: string; name: string }[]; defaultProject?: number }) {
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault(); setErr(null);
      const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
      const r = await post("/api/me", { op: "evidence", userProjectId: f.project ? Number(f.project) : null, skillId: f.skill || null, kind: f.kind, url: f.url, description: f.description, cvTier: f.cvTier });
      if (!r.ok) return setErr(r.error);
      (e.target as HTMLFormElement).reset(); router.refresh();
    }}>
      <label className="text-sm">Project<select name="project" className="input mt-1" defaultValue={defaultProject ?? ""}><option value="">— none —</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
      <label className="text-sm">Skill demonstrated<select name="skill" className="input mt-1"><option value="">— none —</option>{skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="text-sm">Kind<select name="kind" className="input mt-1">{["repository", "commit", "pull_request", "deployment", "report", "test_suite", "model_card", "design_doc", "oral_defense", "other"].map((k) => <option key={k} value={k}>{k.replace("_", " ")}</option>)}</select></label>
      <label className="text-sm">Evidence tier<select name="cvTier" className="input mt-1">{TIERS.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label className="text-sm sm:col-span-2">Link (https)<input name="url" className="input mt-1" placeholder="https://github.com/you/repo/pull/12" /></label>
      <label className="text-sm sm:col-span-2">What does this prove?<textarea name="description" required minLength={10} className="input mt-1" placeholder="e.g. PR adding stratified CV and a PR-AUC report; recall at 1% FPR measured on held-out set." /></label>
      <div className="sm:col-span-2"><ErrorNote msg={err} /><button className="btn btn-primary">Record evidence</button></div>
    </form>
  );
}

type SR = { start(): void; stop(): void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
export function SpeakingBox({ prompt, activity, dimension }: { prompt: string; activity: string; dimension: string }) {
  const [text, setText] = useState("");
  const [rec, setRec] = useState(false);
  const [supported, setSupported] = useState(false);
  const [fb, setFb] = useState<string | null>(null);
  const [err, setErr] = useState<{ msg: string; code?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<SR | null>(null);
  useEffect(() => { const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }; setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition)); }, []);
  const toggle = () => {
    if (rec) { ref.current?.stop(); return; }
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const C = w.SpeechRecognition || w.webkitSpeechRecognition; if (!C) return;
    const r = new C(); r.lang = "en-US"; r.interimResults = false; r.continuous = true;
    r.onresult = (e) => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + " "; setText(t.trim()); };
    r.onend = () => setRec(false); r.onerror = () => setRec(false);
    ref.current = r; r.start(); setRec(true);
  };
  return (
    <div className="card p-4">
      <div className="text-xs text-muted">{dimension} · {activity}</div>
      <p className="mt-1">{prompt}</p>
      <div className="mt-2 flex gap-2">
        {supported ? <button className="btn" onClick={toggle} aria-pressed={rec}><Mic size={14} /> {rec ? "Stop recording" : "Speak (browser transcription)"}</button> : <span className="text-xs text-muted">Speech recognition isn’t available in this browser — type your answer instead.</span>}
      </div>
      <label className="sr-only" htmlFor={`sp-${activity}`}>Answer</label>
      <textarea id={`sp-${activity}`} className="input mt-2 min-h-24 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Your spoken transcript or typed answer" />
      <p className="mt-1 text-[11px] text-muted">Transcription is done by your browser. No pronunciation score is produced — the technology here can’t measure it reliably.</p>
      <div className="mt-2 flex gap-2">
        <button className="btn btn-primary" disabled={busy || text.trim().length < 3} onClick={async () => {
          setBusy(true); setErr(null);
          const r = await post<{ content: string }>("/api/learn", { op: "mentor", action: "english_feedback", nodeId: null, input: `Prompt: ${prompt}\nAnswer: ${text}` });
          const feedback = r.ok ? r.data.content : null;
          if (!r.ok) setErr({ msg: r.error + " Your answer is still saved.", code: r.code });
          setFb(feedback);
          await post("/api/me", { op: "english", activity, dimension, prompt, response: text, feedback });
          setBusy(false);
        }}>{busy ? "Saving…" : "Save & get feedback"}</button>
      </div>
      {err && <ErrorNote msg={err.msg} code={err.code} />}
      {fb && <div className="mt-3 whitespace-pre-wrap rounded-md bg-sunken p-3 text-sm">{fb}</div>}
    </div>
  );
}

const DISCOVERY: [string, RegExp][] = [["Users", /user|who will/i], ["Goals", /goal|success|problem|why/i], ["Data", /data|document|source/i], ["Integrations", /integrat|system|crm|api/i], ["Security", /secur|access|permission/i], ["Privacy", /privacy|personal|gdpr|pii/i], ["Volume", /volume|how many|traffic|scale/i], ["Latency", /latency|fast|response time/i], ["Evaluation", /evaluat|measure|accura|metric/i], ["Deployment", /deploy|host|cloud/i], ["Budget", /budget|cost|price/i], ["Maintenance", /maint|support|update/i]];
export function FreelanceSim() {
  const [asked, setAsked] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ who: string; text: string }[]>([{ who: "client", text: "Hi! I run a mid-size online furniture store. I need an AI chatbot. Can you build it?" }]);
  const [err, setErr] = useState<{ msg: string; code?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warn">Simulation — fictional client</p>
        <div className="space-y-2" aria-live="polite">{log.map((m, i) => <div key={i} className={`rounded-md p-3 text-sm whitespace-pre-wrap ${m.who === "client" ? "bg-sunken" : "border border-line"}`}><span className="text-[11px] uppercase text-muted">{m.who === "client" ? "Client" : "You"}</span><div>{m.text}</div></div>)}</div>
        <form className="mt-3 flex gap-2" onSubmit={async (e) => {
          e.preventDefault(); if (!input.trim()) return; setBusy(true); setErr(null);
          const newAsked = DISCOVERY.filter(([, re]) => re.test(input)).map(([k]) => k);
          setAsked((a) => [...new Set([...a, ...newAsked])]);
          const transcript = [...log, { who: "you", text: input }].map((m) => `${m.who}: ${m.text}`).join("\n");
          const r = await post<{ content: string }>("/api/learn", { op: "mentor", action: "freelance_client", nodeId: null, input: transcript });
          setBusy(false);
          setLog((l) => [...l, { who: "you", text: input }, ...(r.ok ? [{ who: "client", text: r.data.content }] : [])]);
          if (!r.ok) setErr({ msg: r.error, code: r.code });
          setInput("");
        }}>
          <label className="sr-only" htmlFor="fq">Your question to the client</label>
          <input id="fq" className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a discovery question…" />
          <button className="btn btn-primary" disabled={busy}>Ask</button>
        </form>
        {err && <ErrorNote msg={err.msg} code={err.code} />}
      </div>
      <aside className="card p-4 h-fit"><h2 className="text-sm font-medium">Discovery coverage</h2>
        <p className="text-xs text-muted">Detected from your own questions (keyword-based, approximate).</p>
        <ul className="mt-2 space-y-1 text-sm">{DISCOVERY.map(([k]) => <li key={k} className={asked.includes(k) ? "text-ok" : "text-muted"}>{asked.includes(k) ? "✓" : "○"} {k}</li>)}</ul>
      </aside>
    </div>
  );
}
