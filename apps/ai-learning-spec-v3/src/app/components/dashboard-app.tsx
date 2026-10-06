"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Code2,
  Database,
  FileCheck2,
  FolderGit2,
  Gauge,
  GitBranch,
  Globe2,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Moon,
  Network,
  PanelLeft,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TerminalSquare,
  UserRound,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { DashboardData } from "@/lib/data";

type View = "dashboard" | "learn" | "practice" | "curriculum" | "projects" | "review" | "skills" | "career" | "freelance" | "research" | "english" | "mentor" | "settings";
type LearningState = "deep" | "drift" | "fog" | "overload";

type NavItem = { id: View; label: string; icon: LucideIcon };

const primaryNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "curriculum", label: "Curriculum", icon: Network },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "practice", label: "Practice Lab", icon: TerminalSquare },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "review", label: "Review", icon: Clock3 },
];
const growthNav: NavItem[] = [
  { id: "skills", label: "Skills", icon: Gauge },
  { id: "career", label: "Career", icon: BriefcaseBusiness },
  { id: "freelance", label: "Freelance", icon: Target },
  { id: "research", label: "Research", icon: FileCheck2 },
  { id: "english", label: "Technical English", icon: Globe2 },
];

const states: Array<{ id: LearningState; title: string; detail: string }> = [
  { id: "deep", title: "I’m focused", detail: "Keep the thread; no forced timer." },
  { id: "drift", title: "I’m drifting", detail: "Shrink to one concept and one try." },
  { id: "fog", title: "Starting feels hard", detail: "Begin with a low-friction recall." },
  { id: "overload", title: "Too much at once", detail: "Reduce elements and add scaffolding." },
];

const sourceLabels: Record<string, string> = {
  "Original Curriculum": "Original",
  "Harvard College": "Harvard College",
  "Harvard Extension": "Harvard Extension",
  "Industry Extension": "Industry",
  "Research Extension": "Research",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function stateDescription(state: LearningState) {
  return states.find((item) => item.id === state)?.detail ?? states[0].detail;
}

function sourceBadgeClass(source: string) {
  if (source === "Harvard College") return "badge blue";
  if (source === "Research Extension") return "badge amber";
  if (source === "Industry Extension") return "badge green";
  return "badge";
}

export default function DashboardApp({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [view, setView] = useState<View>("dashboard");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [attempt, setAttempt] = useState("");
  const [feedback, setFeedback] = useState<{ score: number; message: string; independent: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mentorPrompt, setMentorPrompt] = useState("");
  const [mentorReply, setMentorReply] = useState("Start with your attempt. I’ll help you inspect the reasoning before showing more.");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [laterInput, setLaterInput] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const learnerState = data.learner.learningState as LearningState;
  const activeNode = data.activeNode;
  const activeMastery = data.activeMastery;

  async function chooseState(nextState: LearningState) {
    const response = await fetch("/api/learning/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: nextState }) });
    const result = await response.json() as { ok: boolean; message?: string };
    if (!result.ok) return setToast(result.message ?? "Could not save that state.");
    setData((current) => ({ ...current, learner: { ...current.learner, learningState: nextState } }));
    setToast(`Study shape adjusted: ${states.find((item) => item.id === nextState)?.title}.`);
  }

  async function submitPractice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeNode || attempt.trim().length < 3) return;
    setSubmitting(true);
    setFeedback(null);
    const response = await fetch("/api/practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nodeId: activeNode.id, response: attempt, taskType: "explain_own_words", helpLevel: "no_help" }) });
    const result = await response.json() as { ok: boolean; score?: number; feedback?: string; independent?: boolean; message?: string };
    setSubmitting(false);
    if (!result.ok) return setToast(result.message ?? "The attempt was not saved.");
    setFeedback({ score: result.score ?? 0, message: result.feedback ?? "Attempt saved.", independent: Boolean(result.independent) });
    setAttempt("");
    setToast("Attempt saved. A later review will revisit this concept.");
  }

  async function askMentor(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (mentorPrompt.trim().length < 2) return;
    setMentorLoading(true);
    const response = await fetch("/api/mentor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: mentorPrompt, helpLevel: "hint", context: activeNode?.title }) });
    const result = await response.json() as { ok: boolean; message?: string; note?: string };
    setMentorLoading(false);
    setMentorReply(result.ok ? `${result.message ?? "No response."}${result.note ? `\n\n${result.note}` : ""}` : result.message ?? "Mentor unavailable.");
  }

  async function captureLater(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (laterInput.trim().length < 2) return;
    const response = await fetch("/api/later", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: laterInput }) });
    const result = await response.json() as { ok: boolean; message?: string };
    if (!result.ok) return setToast(result.message ?? "Could not capture that reminder.");
    setLaterInput("");
    setToast("Captured in Later. You can return without holding the thought in working memory.");
  }

  function navigate(nextView: View) {
    setView(nextView);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <div className="brand-mark">IH</div>
          <div><div className="brand-name">IHLS</div><span className="brand-sub">Learning OS</span></div>
        </div>
        <nav className="nav-group">
          <div className="nav-label">Workspace</div>
          {primaryNav.map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={navigate} />)}
        </nav>
        <nav className="nav-group" style={{ marginTop: 24 }}>
          <div className="nav-label">Evidence & growth</div>
          {growthNav.map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={navigate} />)}
        </nav>
        <div className="sidebar-bottom">
          <button className={`nav-item ${view === "settings" ? "active" : ""}`} onClick={() => navigate("settings")}><Settings2 className="nav-icon" /> Settings</button>
          <div className="profile-chip" style={{ marginTop: 17 }}><div className="avatar">IS</div><div><div className="profile-name">{data.learner.name}</div><div className="profile-role">{data.learner.targetRole}</div></div></div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">{view === "dashboard" ? "Good work compounds quietly." : viewLabel(view)}</div>
          <div className="topbar-actions">
            <button className="icon-button mobile-only" aria-label="Open navigation" onClick={() => setMenuOpen((open) => !open)}><PanelLeft className="button-icon" /></button>
            <button className="icon-button" aria-label="Toggle theme" onClick={() => setDark((value) => !value)}>{dark ? <Sun className="button-icon" /> : <Moon className="button-icon" />}</button>
            <button className="icon-button" aria-label="Notifications"><Bell className="button-icon" /></button>
            <button className="primary-button" onClick={() => navigate("learn")}><Play className="button-icon" /> Continue</button>
          </div>
        </header>
        {menuOpen && <div className="mobile-menu" style={{ position: "fixed", zIndex: 20, top: 60, left: 12, right: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 8, boxShadow: "var(--shadow)" }}>{[...primaryNav, ...growthNav].map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={navigate} />)}</div>}

        <main className="content">
          {view === "dashboard" && <DashboardView data={data} learnerState={learnerState} onNavigate={navigate} onChooseState={chooseState} onCaptureLater={captureLater} laterInput={laterInput} setLaterInput={setLaterInput} />}
          {view === "curriculum" && <CurriculumView data={data} onNavigate={navigate} />}
          {(view === "learn" || view === "practice") && <LearningWorkspace data={data} feedback={feedback} attempt={attempt} setAttempt={setAttempt} submitting={submitting} onSubmit={submitPractice} mentorPrompt={mentorPrompt} setMentorPrompt={setMentorPrompt} mentorReply={mentorReply} mentorLoading={mentorLoading} onAskMentor={askMentor} onNavigate={navigate} practiceOnly={view === "practice"} />}
          {view === "projects" && <ProjectsView data={data} />}
          {view === "review" && <ReviewView data={data} onNavigate={navigate} />}
          {view === "skills" && <SkillsView data={data} />}
          {view === "career" && <CareerView data={data} />}
          {view === "freelance" && <FreelanceView />}
          {view === "research" && <ResearchView data={data} />}
          {view === "english" && <EnglishView data={data} />}
          {view === "mentor" && <MentorView mentorPrompt={mentorPrompt} setMentorPrompt={setMentorPrompt} mentorReply={mentorReply} mentorLoading={mentorLoading} onAskMentor={askMentor} />}
          {view === "settings" && <SettingsView data={data} dark={dark} setDark={setDark} onChooseState={chooseState} />}
        </main>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: (id: View) => void }) {
  const Icon = item.icon;
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={() => onClick(item.id)}><Icon className="nav-icon" /> {item.label}</button>;
}

function viewLabel(view: View) {
  const all = [...primaryNav, ...growthNav, { id: "settings" as View, label: "Settings", icon: Settings2 }];
  return all.find((item) => item.id === view)?.label ?? "Workspace";
}

function DashboardView({ data, learnerState, onNavigate, onChooseState, onCaptureLater, laterInput, setLaterInput }: { data: DashboardData; learnerState: LearningState; onNavigate: (view: View) => void; onChooseState: (state: LearningState) => void; onCaptureLater: (event: FormEvent<HTMLFormElement>) => void; laterInput: string; setLaterInput: (value: string) => void }) {
  const node = data.activeNode;
  const mastery = data.activeMastery;
  return <>
    <section className="hero">
      <div><div className="eyebrow">Tuesday · adaptive study plan</div><h1 className="page-title">Build durable AI<br className="mobile-only" /> engineering competence.</h1><p className="page-subtitle">A calm workspace for understanding, transfer, implementation, and evidence—not a streak counter.</p></div>
      <div className="hero-actions"><button className="outline-button" onClick={() => onNavigate("curriculum")}><Network className="button-icon" /> View learning map</button><button className="primary-button" onClick={() => onNavigate("learn")}><Play className="button-icon" /> Start next task</button></div>
    </section>
    <section className="metric-grid" aria-label="Learning snapshot">
      <MetricCard icon={Target} label="Current objective" value="Python · trace" note="Independent attempt next" />
      <MetricCard icon={Clock3} label="Review queue" value={`${data.stats.dueReviewCount} due`} note="Retrieval, not rereading" />
      <MetricCard icon={FolderGit2} label="Active build" value="EDA capstone" note="Level 2 · data analysis" />
      <MetricCard icon={FileCheck2} label="Evidence" value={`${data.stats.skillEvidenceCount} signals`} note="Persisted from submissions" />
    </section>
    <div className="layout-grid">
      <div className="stack">
        <section className="task-card">
          <div className="task-meta"><span className="badge blue">NEXT BEST TASK</span><span className="badge">{node ? sourceLabels[node.sourceCategory] : "Curriculum"}</span><span className="badge">{stateDescription(learnerState)}</span></div>
          <h2 className="task-title">{data.dueReviews[0]?.prompt ?? "Trace a small program before you run it."}</h2>
          <p className="task-description">Practice first. Your current path is anchored in <strong>{node?.title ?? "Python Programming"}</strong>, then it will reconnect to data work through deliberate transfer.</p>
          <div className="reason"><Lightbulb className="button-icon" /><span><strong>Why this task?</strong> It is due for review and targets independent reasoning before the next implementation step.</span></div>
          <div className="progress"><span style={{ width: `${Math.min(100, mastery?.completion ?? 0)}%` }} /></div>
          <div className="task-footer"><span className="task-footer-meta">{mastery?.completion ?? 0}% content seen · {mastery?.recall ?? 0}% last recall signal · evidence is still developing</span><button className="primary-button" onClick={() => onNavigate("learn")}>Open workspace <ArrowRight className="button-icon" /></button></div>
        </section>
        <section className="panel"><div className="panel-header"><div><h2 className="panel-title">Review, then reconnect</h2><p className="panel-kicker">Due items use varied retrieval tasks. The queue is small on purpose.</p></div><button className="section-link" onClick={() => onNavigate("review")}>Open review →</button></div>{data.reviews.slice(0, 3).map((review) => <ReviewRow key={review.id} review={review} />)}</section>
        <section className="panel"><div className="panel-header"><div><h2 className="panel-title">Current build</h2><p className="panel-kicker">Projects are evidence, not decoration.</p></div><button className="section-link" onClick={() => onNavigate("projects")}>Project ladder →</button></div><ProjectRow project={data.activeProject} /></section>
      </div>
      <div className="stack">
        <section className="panel"><div className="panel-header"><div><h2 className="panel-title">How does studying feel?</h2><p className="panel-kicker">Choose a shape, not a diagnosis.</p></div><Waves className="button-icon" style={{ color: "var(--blue)" }} /></div><div className="state-grid">{states.map((state) => <button key={state.id} className={`state-button ${learnerState === state.id ? "active" : ""}`} onClick={() => onChooseState(state.id)}><span className="state-name">{state.title}</span><span className="state-detail">{state.detail}</span></button>)}</div><div className="state-note"><CircleHelp className="button-icon" /><span>The process stays stable. Task size, support, and transitions change with your current state.</span></div></section>
        <section className="panel"><div className="panel-header"><div><h2 className="panel-title">Skills with evidence</h2><p className="panel-kicker">No mastery from watch time alone.</p></div><button className="section-link" onClick={() => onNavigate("skills")}>Skill graph →</button></div>{data.skills.slice(0, 5).map((skill) => <SkillRow key={skill.id} skill={skill} />)}</section>
        <section className="panel"><div className="panel-header"><div><h2 className="panel-title">Distraction capture</h2><p className="panel-kicker">Put the thought somewhere safe, then return.</p></div><Plus className="button-icon" style={{ color: "var(--blue)" }} /></div><form onSubmit={onCaptureLater} style={{ display: "flex", gap: 8 }}><input value={laterInput} onChange={(event) => setLaterInput(event.target.value)} placeholder="Capture for later…" aria-label="Capture a thought for later" style={{ minWidth: 0, flex: 1, border: "1px solid var(--line)", borderRadius: 8, padding: "0 11px", minHeight: 36, background: "var(--surface-subtle)", color: "var(--ink)", fontSize: 12 }} /><button className="soft-button" type="submit">Capture</button></form></section>
      </div>
    </div>
  </>;
}

function MetricCard({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return <div className="metric-card"><div className="metric-label"><span>{label}</span><Icon className="button-icon" style={{ color: "var(--blue)" }} /></div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></div>;
}

function ReviewRow({ review }: { review: DashboardData["reviews"][number] }) {
  return <div className="review-row"><div><p className="review-prompt">{review.prompt}</p><div className="review-type">{review.taskType.replaceAll("_", " ")} · {review.status === "due" ? "ready now" : "scheduled"}</div></div><div className={`review-date ${review.status === "due" ? "" : ""}`}>{review.status === "due" ? "Due now" : formatDate(review.dueAt)}</div></div>;
}

function ProjectRow({ project }: { project: DashboardData["activeProject"] }) {
  if (!project) return <div className="empty-state">No active project yet. The ladder will appear when a project is persisted.</div>;
  return <div className="project-row"><div><p className="project-title">{project.title}</p><div className="project-meta">Level {project.level} · {project.category} · {project.status === "active" ? "In progress" : "Not started"}</div></div><div className="project-level" aria-label={`Project level ${project.level}`}>{Array.from({ length: 10 }, (_, index) => <i key={index} className={index < project.level ? "on" : ""} />)}</div></div>;
}

function SkillRow({ skill }: { skill: DashboardData["skills"][number] }) {
  const active = skill.evidenceCount > 0;
  return <div className="skill-row"><div><div className="skill-name"><span>{skill.name}</span><span className="skill-status">{active ? "evidence captured" : "developing"}</span></div><div className="progress skill-progress"><span style={{ width: active ? "58%" : "14%", background: active ? "var(--teal)" : "var(--line-strong)" }} /></div></div><div className="skill-score">{skill.evidenceCount}</div></div>;
}

function CurriculumView({ data, onNavigate }: { data: DashboardData; onNavigate: (view: View) => void }) {
  return <><PageIntro eyebrow="Curriculum graph" title="A map, not a playlist." subtitle="Original Curriculum is preserved. Harvard College, Harvard Extension, industry, and research layers are mapped without being collapsed into one claim." action={<button className="primary-button" onClick={() => onNavigate("learn")}><Play className="button-icon" /> Begin current node</button>} /><div className="panel"><div className="panel-header"><div><h2 className="panel-title">Prerequisite spine</h2><p className="panel-kicker">The visible order is a navigational spine; parallel work is allowed where prerequisites permit it.</p></div><span className="badge green">{data.stats.moduleCount} nodes persisted</span></div><div className="module-list">{data.nodes.map((node, index) => <div className="module-item" key={node.id}><div className="module-number">{String(index + 1).padStart(2, "0")}</div><div><h3 className="module-title">{node.title}</h3><p className="module-description">{node.description}</p></div><div className="module-source"><span className={sourceBadgeClass(node.sourceCategory)}>{sourceLabels[node.sourceCategory]}</span><span className="topic-count">{node.topics.length} topics · {node.estimatedHours}h</span></div></div>)}</div></div></>;
}

function LearningWorkspace({ data, feedback, attempt, setAttempt, submitting, onSubmit, mentorPrompt, setMentorPrompt, mentorReply, mentorLoading, onAskMentor, onNavigate, practiceOnly }: { data: DashboardData; feedback: { score: number; message: string; independent: boolean } | null; attempt: string; setAttempt: (value: string) => void; submitting: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; mentorPrompt: string; setMentorPrompt: (value: string) => void; mentorReply: string; mentorLoading: boolean; onAskMentor: (event?: FormEvent<HTMLFormElement>) => void; onNavigate: (view: View) => void; practiceOnly: boolean }) {
  const node = data.activeNode;
  return <><section className="learning-header"><div><div className="breadcrumb"><span>Curriculum</span><ChevronRight className="button-icon" /><strong>{node?.title ?? "Current node"}</strong></div><div className="eyebrow">{practiceOnly ? "Practice lab" : "Learning workspace"}</div><h1 className="page-title">{node?.title ?? "Python Programming"}</h1><p className="page-subtitle">{node?.description ?? "A persisted learning node."}</p></div><div className="hero-actions"><button className="outline-button" onClick={() => onNavigate("curriculum")}><ArrowLeft className="button-icon" /> Back to map</button><span className="badge blue">State-adaptive · {data.learner.learningState}</span></div></section><div className="workspace-grid"><article className="lesson-card"><div className="task-meta"><span className={sourceBadgeClass(node?.sourceCategory ?? "Original Curriculum")}>{sourceLabels[node?.sourceCategory ?? "Original Curriculum"]}</span><span className="badge">Why → attempt → recall → transfer</span></div><h2>Trace before you run.</h2><p>AI engineers need to read behavior, not just produce code. Start with a tiny control-flow problem, predict the output, and explain which branch changes the execution path.</p><h3>Why this matters</h3><p>Code tracing builds a bridge between syntax and execution. It also gives you a low-cost way to find a misconception before it becomes a debugging session.</p><h3>Learning objectives</h3><ul className="objective-list">{(node?.objectives ?? ["Explain the current concept in your own words", "Solve a small problem without answer-first assistance", "Transfer the idea to a new constraint"]).map((objective) => <li key={objective}><Check className="button-icon" />{objective}</li>)}</ul><div className="note-box" style={{ marginTop: 23 }}><h4>Notebook guidance</h4><p><span className="notebook-label">MUST WRITE</span> the concept in your own words, one trace table or structure, one common mistake, and when to use it.</p><p><span className="notebook-label">RECOMMENDED</span> a small example you can reconstruct later.</p><p><span className="notebook-label">OPTIONAL</span> reference syntax. Do not transcribe the lesson.</p></div><div className="practice-box"><div className="task-meta"><span className="badge amber">INDEPENDENT ATTEMPT</span><span className="badge">Explain in own words</span></div><p className="practice-prompt">What is one reliable way to trace a loop that contains both <code>continue</code> and <code>break</code>? Give a small example and name one edge case.</p><form onSubmit={onSubmit}><textarea className="response-box" value={attempt} onChange={(event) => setAttempt(event.target.value)} placeholder="Write your reasoning. A partial attempt is useful evidence…" aria-label="Your practice response" /><div className="practice-actions"><span className="small-help">No help used · this attempt will update recall and transfer evidence.</span><button className="primary-button" disabled={submitting || attempt.trim().length < 3} type="submit">{submitting ? "Saving…" : "Submit attempt"}<Send className="button-icon" /></button></div></form>{feedback && <div className="reason" style={{ marginBottom: 0, marginTop: 15 }}><Check className="button-icon" style={{ color: "var(--teal)" }} /><span><strong>Attempt saved · {feedback.score}/100</strong><br />{feedback.message} {feedback.independent ? "Independent evidence recorded." : "Assisted evidence recorded."}</span></div>}</div></article><aside className="stack"><MentorView mentorPrompt={mentorPrompt} setMentorPrompt={setMentorPrompt} mentorReply={mentorReply} mentorLoading={mentorLoading} onAskMentor={onAskMentor} /><section className="panel"><div className="panel-header"><div><h2 className="panel-title">Evidence ladder</h2><p className="panel-kicker">Completion is not competence.</p></div><ClipboardCheck className="button-icon" style={{ color: "var(--blue)" }} /></div><EvidenceLine label="Content seen" value={`${data.activeMastery?.completion ?? 0}%`} /><EvidenceLine label="Recall" value={`${data.activeMastery?.recall ?? 0}%`} /><EvidenceLine label="Transfer" value={`${data.activeMastery?.transfer ?? 0}%`} /><EvidenceLine label="Implementation" value={`${data.activeMastery?.implementation ?? 0}%`} /><div className="empty-state" style={{ marginTop: 15, padding: 12 }}>Next: delayed retrieval will be scheduled from the attempt result.</div></section></aside></div></>;
}

function EvidenceLine({ label, value }: { label: string; value: string }) { return <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 12 }}><span style={{ color: "var(--muted)" }}>{label}</span><strong style={{ color: "var(--navy)" }}>{value}</strong></div>; }

function MentorView({ mentorPrompt, setMentorPrompt, mentorReply, mentorLoading, onAskMentor }: { mentorPrompt: string; setMentorPrompt: (value: string) => void; mentorReply: string; mentorLoading: boolean; onAskMentor: (event?: FormEvent<HTMLFormElement>) => void }) {
  return <section className="mentor-card"><div className="panel-header"><div style={{ display: "flex", gap: 10 }}><div className="mentor-mark"><Bot className="button-icon" /></div><div><h2 className="panel-title">Lead Mentor</h2><p className="panel-kicker">Socratic by default · bounded specialist routing</p></div></div><span className="badge" style={{ background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.75)" }}>Hint first</span></div><div className="mentor-response" style={{ whiteSpace: "pre-line" }}>{mentorReply}</div><form onSubmit={(event) => onAskMentor(event)}><textarea className="mentor-input" value={mentorPrompt} onChange={(event) => setMentorPrompt(event.target.value)} placeholder="Share your attempt, error, or question…" aria-label="Ask the Lead Mentor" /><div className="mentor-actions"><span className="small-help" style={{ color: "rgba(255,255,255,.54)" }}>The mentor will not replace an attempt by default.</span><button className="soft-button" type="submit" disabled={mentorLoading}>{mentorLoading ? "Thinking…" : "Ask for a hint"}<Send className="button-icon" /></button></div></form><p className="provider-note">Provider status: structured coaching is available. External Puter inference is not enabled unless PUTER_AUTH_TOKEN is configured; no provider success is simulated.</p></section>;
}

function ProjectsView({ data }: { data: DashboardData }) {
  return <><PageIntro eyebrow="Project ladder" title="Build proof, not demos." subtitle="Every project asks for a problem, constraints, provenance, tests, evaluation, failures, and a truthful portfolio record." action={<span className="badge green">{data.projects.filter((project) => project.status === "active").length} active build</span>} /><div className="projects-grid">{data.projects.map((project) => <article className="project-card" key={project.id}><div className="task-meta"><span className="badge blue">LEVEL {project.level}</span><span className="badge">{project.category}</span></div><h3 style={{ marginTop: 13 }}>{project.title}</h3><p>{project.description}</p><div className="tag-list"><span className="tag">Source policy</span><span className="tag">Failure analysis</span><span className="tag">Evidence</span></div></article>)}</div></>;
}

function ReviewView({ data, onNavigate }: { data: DashboardData; onNavigate: (view: View) => void }) {
  return <><PageIntro eyebrow="Retrieval queue" title="Remember by doing." subtitle="Spacing is adaptive: difficulty, importance, failure, and delayed performance shape the next review." action={<span className="badge amber">{data.stats.dueReviewCount} due now</span>} /><div className="layout-grid"><section className="panel"><div className="panel-header"><div><h2 className="panel-title">Your review items</h2><p className="panel-kicker">A mix of recall, explanation, prediction, and transfer.</p></div><button className="primary-button" onClick={() => onNavigate("practice")}><Play className="button-icon" /> Practice due</button></div>{data.reviews.map((review) => <ReviewRow key={review.id} review={review} />)}</section><section className="panel"><div className="panel-header"><div><h2 className="panel-title">The logic</h2><p className="panel-kicker">No one-size-fits-all interval is treated as law.</p></div><Activity className="button-icon" style={{ color: "var(--blue)" }} /></div><EvidenceLine label="Next review" value="Based on performance" /><EvidenceLine label="Task variety" value="Not flashcards only" /><EvidenceLine label="Transfer" value="Required for core nodes" /><div className="empty-state" style={{ marginTop: 15 }}>A review that feels effortful can still be useful. If prerequisites are missing, the next action backs up instead of simply increasing difficulty.</div></section></div></>;
}

function SkillsView({ data }: { data: DashboardData }) {
  return <><PageIntro eyebrow="Skill graph" title="Evidence has a shape." subtitle="A skill is developing until independent assessment, debugging, project, or delayed evidence supports a stronger claim." action={<span className="badge">{data.skills.length} skill nodes</span>} /><div className="panel"><div className="skill-row" style={{ borderTop: 0, paddingTop: 0, paddingBottom: 15 }}><div className="skill-name"><span><strong>Skill</strong></span><span><strong>Evidence state</strong></span></div><div className="skill-score">Count</div></div>{data.skills.map((skill) => <SkillRow key={skill.id} skill={skill} />)}</div></>;
}

function CareerView({ data }: { data: DashboardData }) {
  return <><PageIntro eyebrow="Career engine" title="Translate learning into evidence." subtitle="Reference roles are snapshots, not promises. Gaps become tasks, projects, interview evidence, and communication practice." action={<span className="badge amber">Dated role snapshots</span>} /><div className="career-grid">{data.roles.map((role) => <article className="career-card" key={role.id}><div className="task-meta"><span className="badge blue">{role.track}</span><span className="badge amber">{role.sourceStatus.replaceAll("_", " ")}</span></div><h3 style={{ marginTop: 13 }}>{role.title}</h3><p>{role.description}</p><div className="tag-list">{role.requirements.slice(0, 9).map((requirement) => <span className="tag" key={requirement}>{requirement}</span>)}</div><div className="source-meta" style={{ marginTop: 14 }}>Snapshot {formatDate(role.snapshotDate)} · requirements are not verified as a guarantee</div></article>)}</div><section className="panel" style={{ marginTop: 16 }}><div className="panel-header"><div><h2 className="panel-title">Readiness contract</h2><p className="panel-kicker">The product may say evidence is demonstrated; it never says employment is guaranteed.</p></div><ShieldCheck className="button-icon" style={{ color: "var(--teal)" }} /></div><div className="empty-state">Current recommendation: strengthen SQL/data systems, production observability, and independent English defense through the next project checkpoint.</div></section></>;
}

function FreelanceView() {
  return <><PageIntro eyebrow="Freelance lab" title="Scope before you build." subtitle="Simulations are labeled simulations. The goal is to ask better questions, define acceptance criteria, and protect the relationship." action={<span className="badge blue">Simulation</span>} /><div className="layout-grid"><section className="panel"><div className="panel-header"><div><h2 className="panel-title">Client brief</h2><p className="panel-kicker">“I need an AI chatbot.”</p></div><BriefcaseBusiness className="button-icon" style={{ color: "var(--blue)" }} /></div><div className="empty-state">Before proposing a solution, ask about users, goal, source data, integrations, privacy, expected volume, latency, evaluation, deployment, budget, and maintenance. Do not promise an agent before the workflow is understood.</div><div className="tag-list" style={{ marginTop: 14 }}>{["Discovery", "Scope", "Acceptance criteria", "Risk", "Estimate", "Change request"].map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></section><section className="panel"><div className="panel-header"><div><h2 className="panel-title">Professional output</h2><p className="panel-kicker">A simulation only becomes evidence when the reasoning is submitted and reviewed.</p></div><ClipboardCheck className="button-icon" style={{ color: "var(--blue)" }} /></div><div className="empty-state">No simulation submission yet. Start by writing five discovery questions and a one-paragraph scope boundary.</div></section></div></>;
}

function ResearchView({ data }: { data: DashboardData }) {
  return <><PageIntro eyebrow="Research extension" title="Make claims testable." subtitle="Research mode moves from reproduction to ablation to extension. Hypotheses are stored as hypotheses, never as proven outcomes." action={<span className="badge amber">Evidence-aware</span>} /><div className="panel"><div className="panel-header"><div><h2 className="panel-title">Research hypotheses</h2><p className="panel-kicker">Design decisions that need measurement.</p></div><Sparkles className="button-icon" style={{ color: "var(--amber)" }} /></div><div className="review-row"><div><p className="review-prompt">Requiring an initial attempt before a full explanation may preserve independent performance.</p><div className="review-type">research hypothesis · requires comparison and delayed transfer test</div></div><span className="badge amber">Speculative</span></div><div className="review-row"><div><p className="review-prompt">Transfer checks may improve generalization beyond recall-only practice.</p><div className="review-type">research hypothesis · measure novel-problem performance</div></div><span className="badge amber">Speculative</span></div></div><div className="panel" style={{ marginTop: 16 }}><div className="panel-header"><div><h2 className="panel-title">Verified source register</h2><p className="panel-kicker">Current versus historical status is preserved.</p></div><FileCheck2 className="button-icon" style={{ color: "var(--teal)" }} /></div><div className="sources-grid">{data.sources.map((source) => <SourceCard key={source.id} source={source} />)}</div></div></>;
}

function SourceCard({ source }: { source: DashboardData["sources"][number] }) {
  return <article className="source-row"><div className="source-title">{source.title}</div><div className="source-meta">{source.publisher} · {source.verificationStatus.replaceAll("_", " ")}</div><p className="source-note">{source.notes}</p><a className="source-link" href={source.url} target="_blank" rel="noreferrer">{source.url}</a></article>;
}

function EnglishView({ data }: { data: DashboardData }) {
  return <><PageIntro eyebrow="Technical English" title="Use the discipline as the classroom." subtitle="Vocabulary is one dimension. Reading, writing, speaking, interaction, and professional defense are separate evidence streams." action={<span className="badge green">Standard Technical English</span>} /><div className="layout-grid"><section className="panel"><div className="panel-header"><div><h2 className="panel-title">Working vocabulary</h2><p className="panel-kicker">Canonical terms stay visible; surrounding language can be simplified.</p></div><BookOpen className="button-icon" style={{ color: "var(--blue)" }} /></div>{data.sources.length > 0 && <div className="empty-state">Read one source paragraph aloud, define one term in your own words, then use it in a project explanation. Speaking metrics are not invented when browser speech is unavailable.</div>}<div style={{ marginTop: 14 }}>{["observability", "idempotency", "generalization", "orchestration", "calibration", "reproducibility"].map((term) => <div className="review-row" key={term}><div><p className="review-prompt">{term}</p><div className="review-type">Definition · example sentence · project connection</div></div><span className="badge">Explain</span></div>)}</div></section><section className="panel"><div className="panel-header"><div><h2 className="panel-title">Speaking lab</h2><p className="panel-kicker">Browser speech can be added when available; no invented pronunciation score.</p></div><Waves className="button-icon" style={{ color: "var(--teal)" }} /></div><div className="empty-state">Prompt: “Explain why a model with 96% accuracy may still be unsafe.” Record an answer locally or type it here. The target is a clear claim, metric choice, failure mode, and next test.</div><button className="outline-button" style={{ marginTop: 14 }}><Play className="button-icon" /> Start speaking prompt</button></section></div></>;
}

function SettingsView({ data, dark, setDark, onChooseState }: { data: DashboardData; dark: boolean; setDark: (value: boolean) => void; onChooseState: (state: LearningState) => void }) {
  return <><PageIntro eyebrow="Preferences" title="Make the environment fit the work." subtitle="These are delivery preferences, not diagnoses or fixed learning styles." action={<span className="badge">Persisted profile</span>} /><div className="layout-grid"><section className="panel"><div className="panel-header"><div><h2 className="panel-title">Interface</h2><p className="panel-kicker">Keep the surface quiet enough to think.</p></div><Settings2 className="button-icon" style={{ color: "var(--blue)" }} /></div><div className="review-row"><div><p className="review-prompt">Theme</p><div className="review-type">Light / dark surfaces with reduced motion support</div></div><button className="soft-button" onClick={() => setDark(!dark)}>{dark ? "Dark" : "Light"}</button></div><div className="review-row"><div><p className="review-prompt">Content mode</p><div className="review-type">Standard Technical English · vocabulary assistance available</div></div><span className="badge blue">English</span></div><div className="review-row"><div><p className="review-prompt">AI help policy</p><div className="review-type">Hint first · initial attempt requested · full explanation on request</div></div><span className="badge green">Active</span></div></section><section className="panel"><div className="panel-header"><div><h2 className="panel-title">Study shape</h2><p className="panel-kicker">Set today’s operating mode without assigning a medical label.</p></div><Waves className="button-icon" style={{ color: "var(--blue)" }} /></div>{states.map((state) => <button key={state.id} className={`state-button ${data.learner.learningState === state.id ? "active" : ""}`} style={{ width: "100%", marginBottom: 8 }} onClick={() => onChooseState(state.id)}><span className="state-name">{state.title}</span><span className="state-detail">{state.detail}</span></button>)}</section></div></>;
}

function PageIntro({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <section className="hero"><div><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action && <div className="hero-actions">{action}</div>}</section>;
}
