"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity, AlertCircle, ArrowRight, BookOpen, BriefcaseBusiness, Check, CheckCircle2,
  ChevronDown, ChevronRight, ClipboardList, Clock3, Code2, Compass, ExternalLink,
  FileText, FlaskConical, FolderKanban, GraduationCap, Lightbulb, ListChecks, LogOut,
  Menu, MessageCircle, MessagesSquare, NotebookPen, Plus, RefreshCw, Search, Send,
  Settings, ShieldCheck, Target, Users, X,
  type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type PageKey = "dashboard" | "curriculum" | "learn" | "practice" | "projects" | "review" | "skills" | "career" | "freelance" | "research" | "english" | "mentor" | "portfolio" | "settings";
type UserView = { name: string; email: string } | null;
type Profile = {
  learningState: "deep" | "drift" | "fog" | "overload";
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
  contentMode: "standard" | "b1-b2" | "english-training";
  vocabularyAssist: boolean;
  reducedMotion: boolean;
  textScale: "default" | "large" | "largest";
  targetRoleIds: string[];
  availableMinutes: number;
};
type CurriculumNode = {
  id: string; parentId: string | null; kind: string; title: string; sourceCategory: string; level: string; stage: string;
  description: string; why: string; prerequisites?: string[]; content?: Record<string, unknown>;
  learningObjectives?: string[]; sources?: Array<{ title: string; url: string; status?: string }>;
};
type Dashboard = {
  profile: Profile; modules: CurriculumNode[];
  currentTask: { id: string; title: string; why: string; description: string; reason: string } | null;
  dueReviews: Array<{ id: string; nodeId: string; title: string; dueAt: string; activityType: string }>;
  activeProjects: Array<{ id: string; title: string; status: string; updatedAt: string }>;
  evidenceCount: number; projectCount: number; mastery: Array<{ nodeId: string; completion: string }>;
};
type ApiChild = CurriculumNode;
type ProjectIdea = { id: string; title: string; category: string; ladderLevel: number; riskNote: string | null; brief: string };
type Project = { id: string; catalogId: string | null; title: string; status: string; repositoryUrl: string | null; demoUrl: string | null; reportUrl?: string | null; problem?: string; architecture?: string; limitations?: string };
type EvidenceItem = { id: string; evidenceType: string; label: string; url: string | null; notes?: string };
type LessonResult = { evaluation: { score: number | null; correct: boolean | null; feedback: string }; completion: string; independent: boolean; nextReviewAt: string | null; message: string };
type CareerRole = { id: string; title: string; sourceStatus: string; sourceNote: string; region: string | null; seniority: string | null; requirements: Array<{ skillName: string; requirementType: string; confidence: string }>; evidenceCount: number; mappedEvidenceCount: number; gapStatus: string };
type Term = { id: string; term: string; definition: string; arabicMeaning: string | null; example: string; topic: string };
type EnglishAttempt = { id: string; dimension: string; activity: string; response: string; feedback: string; createdAt: string };
type ReviewBundle = { due: Array<{ id: string; nodeId: string; dueAt: string; intervalDays: number; activityType: string; title: string; why?: string }>; upcoming: Array<{ id: string; nodeId: string; dueAt: string; intervalDays: number; activityType: string; title: string }>; message: string | null };
type ProjectsBundle = { catalog: ProjectIdea[]; projects: Project[] };
type LessonBundle = { node: CurriculumNode; children: ApiChild[] };
type MentorMessage = { role: "user" | "assistant"; content: string; saved?: boolean; error?: boolean };

const navItems: Array<{ id: PageKey; label: string; icon: LucideIcon; group?: string }> = [
  { id: "dashboard", label: "Dashboard", icon: Compass, group: "STUDY" },
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "learn", label: "Learn", icon: GraduationCap },
  { id: "practice", label: "Practice lab", icon: Code2 },
  { id: "review", label: "Review", icon: RefreshCw },
  { id: "projects", label: "Projects", icon: FolderKanban, group: "BUILD" },
  { id: "skills", label: "Skills", icon: Activity },
  { id: "portfolio", label: "Portfolio", icon: ClipboardList },
  { id: "career", label: "Career", icon: BriefcaseBusiness, group: "WORK" },
  { id: "freelance", label: "Freelance", icon: Users },
  { id: "english", label: "Technical English", icon: MessageCircle },
  { id: "research", label: "Research", icon: FlaskConical, group: "MENTOR" },
  { id: "mentor", label: "AI mentor", icon: MessagesSquare },
  { id: "settings", label: "Settings", icon: Settings, group: "ACCOUNT" },
];
const stateOptions: Array<{ id: Profile["learningState"]; title: string; sub: string; icon: LucideIcon }> = [
  { id: "deep", title: "I’m focused", sub: "Keep a connected flow", icon: Target },
  { id: "drift", title: "I’m drifting", sub: "One small question", icon: Compass },
  { id: "fog", title: "Starting feels hard", sub: "Begin with a familiar recall", icon: Lightbulb },
  { id: "overload", title: "There’s too much at once", sub: "Reduce the steps and scaffold", icon: ListChecks },
];
const originalOrder = ["python-programming", "math-statistics", "data-analysis-python", "excel-power-bi", "databases-data-engineering", "machine-learning", "deep-learning", "development-mlops"];
const learningHypotheses = [
  { title: "State-adaptive learning", status: "Research hypothesis", question: "May learner-selected task sizing improve retention or sustainability compared with a fixed protocol?", measure: "Immediate, delayed, transfer performance and voluntary friction ratings." },
  { title: "Attempt-first AI assistance", status: "Research hypothesis", question: "May trying before a full explanation support independent performance?", measure: "Independent delayed solve, transfer, calibration and help dependency." },
  { title: "Task size and scaffolding", status: "Research hypothesis", question: "Can lower-friction task decomposition help without reducing transfer?", measure: "Starting, completion quality, delayed transfer and learner-reported friction." },
  { title: "Retrieval + transfer + case", status: "Design hypothesis", question: "Do novel case decisions add transfer beyond retrieval alone for a given topic?", measure: "Delayed retention and performance on a novel case." },
];

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  try { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value)); }
  catch { return "Date not available"; }
}

function titleCase(value: string) { return value.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function asText(value: unknown, fallback = "") { return typeof value === "string" ? value : fallback; }
function asStringArray(value: unknown) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }

export function LearningApp({ user }: { user: UserView }) {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [roots, setRoots] = useState<CurriculumNode[]>([]);
  const [childrenByNode, setChildrenByNode] = useState<Record<string, ApiChild[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState<CurriculumNode | null>(null);
  const [lessonSources, setLessonSources] = useState<CurriculumNode[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [projectsData, setProjectsData] = useState<ProjectsBundle | null>(null);
  const [reviewData, setReviewData] = useState<ReviewBundle | null>(null);
  const [careerRoles, setCareerRoles] = useState<CareerRole[]>([]);
  const [skillData, setSkillData] = useState<{ skills: Array<{ id: string; title: string; category: string; sourceCategory: string; status: string; evidence: Array<{ evidenceSummary: string; independent: boolean }> }>; evidenceCount: number } | null>(null);
  const [portfolioData, setPortfolioData] = useState<{ items: Array<{ id: string; projectTitle: string; artifactClass: string; summary: string; publicUrl: string | null; verificationStatus: string }>; empty: boolean; message: string | null } | null>(null);
  const [englishData, setEnglishData] = useState<{ terms: Term[]; attempts: EnglishAttempt[]; message: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);
  const [laterText, setLaterText] = useState("");
  const [laterMessage, setLaterMessage] = useState("");
  const [studyKind, setStudyKind] = useState<"recall" | "practice" | "transfer">("practice");
  const [answer, setAnswer] = useState("");
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [mentorText, setMentorText] = useState("");
  const [mentorHelp, setMentorHelp] = useState("hint");
  const [mentorThreadId, setMentorThreadId] = useState<string | undefined>();
  const [mentorMessages, setMentorMessages] = useState<MentorMessage[]>([]);
  const [mentorBusy, setMentorBusy] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [evidenceProject, setEvidenceProject] = useState("");
  const [portfolioProjectId, setPortfolioProjectId] = useState("");
  const [portfolioSummary, setPortfolioSummary] = useState("");
  const [portfolioClass, setPortfolioClass] = useState("portfolio_project");
  const [portfolioMessage, setPortfolioMessage] = useState("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [englishResponse, setEnglishResponse] = useState("");
  const [englishSaveMessage, setEnglishSaveMessage] = useState("");
  const [freelanceResponse, setFreelanceResponse] = useState("");
  const [freelanceSaved, setFreelanceSaved] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  const loadWorkspace = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setPageError("");
    const [dash, curriculum, projectsResult, reviews, career, skillsResult, portfolio, english, profileResult] = await Promise.all([
      getJson<Dashboard>("/api/dashboard"),
      getJson<{ nodes: CurriculumNode[] }>("/api/curriculum"),
      getJson<ProjectsBundle>("/api/projects"),
      getJson<ReviewBundle>("/api/reviews"),
      getJson<{ roles: CareerRole[] }>("/api/career"),
      getJson<typeof skillData>("/api/skills"),
      getJson<typeof portfolioData>("/api/portfolio"),
      getJson<typeof englishData>("/api/english"),
      getJson<{ profile: Profile }>("/api/learning/profile"),
    ]);
    setDashboard(dash);
    setRoots(curriculum?.nodes ?? []);
    setProjectsData(projectsResult);
    setReviewData(reviews);
    setCareerRoles(career?.roles ?? []);
    setSkillData(skillsResult);
    setPortfolioData(portfolio);
    setEnglishData(english);
    setProfile(profileResult?.profile ?? dash?.profile ?? null);
    if (!dash || !curriculum) setPageError("Some workspace data could not be loaded. Retry when the database is available.");
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) void loadWorkspace(); }, [user, loadWorkspace]);

  const sortedOriginalModules = useMemo(() => {
    const items = roots.filter((node) => node.kind === "module");
    return [...items].sort((a, b) => originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id));
  }, [roots]);
  const extensionRoots = useMemo(() => roots.filter((node) => node.kind === "extension"), [roots]);
  const harvardRoots = useMemo(() => roots.filter((node) => node.kind === "course_reference"), [roots]);

  async function updateProfile(patch: Partial<Profile>) {
    const response = await fetch("/api/learning/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
    });
    const data = await response.json() as { profile?: Profile; error?: string };
    if (!response.ok || !data.profile) throw new Error(data.error ?? "Could not save this setting.");
    setProfile(data.profile);
    setDashboard((current) => current ? { ...current, profile: data.profile as Profile } : current);
    return data.profile;
  }

  async function toggleTree(node: CurriculumNode) {
    const isExpanded = Boolean(expanded[node.id]);
    setExpanded((current) => ({ ...current, [node.id]: !isExpanded }));
    if (!isExpanded && !childrenByNode[node.id]) {
      const result = await getJson<{ children: ApiChild[] }>(`/api/curriculum/${encodeURIComponent(node.id)}`);
      if (result) setChildrenByNode((current) => ({ ...current, [node.id]: result.children }));
    }
  }

  async function openLesson(nodeId: string, target: PageKey = "learn") {
    setLessonLoading(true);
    setLessonResult(null);
    setAnswer("");
    setStudyKind(target === "practice" ? "recall" : "practice");
    const result = await getJson<LessonBundle>(`/api/curriculum/${encodeURIComponent(nodeId)}`);
    if (result) {
      setActiveLesson(result.node);
      setLessonSources(result.children);
      setPage(target);
    } else {
      setPageError("This curriculum item could not be opened. Please retry.");
    }
    setLessonLoading(false);
  }

  async function submitAttempt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeLesson || !user) return;
    if (!answer.trim()) return;
    setSavingAttempt(true);
    setLessonResult(null);
    try {
      const response = await fetch("/api/learning/events", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: activeLesson.id, eventType: studyKind, answer, helpLevel: "no_help" }),
      });
      const data = await response.json() as LessonResult & { error?: string; message?: string };
      if (!response.ok) throw new Error(data.message ?? data.error ?? "Could not save your attempt.");
      setLessonResult(data);
      await loadWorkspace();
    } catch (error) {
      setLessonResult({ evaluation: { score: null, correct: null, feedback: error instanceof Error ? error.message : "Could not save this attempt." }, completion: "in_progress", independent: true, nextReviewAt: null, message: "Attempt was not confirmed as saved." });
    } finally { setSavingAttempt(false); }
  }

  async function saveLater(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/later", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: laterText, sourceContext: page === "learn" ? "study" : "general" }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setLaterMessage(data.error ?? "Could not save this note."); return; }
    setLaterText(""); setLaterMessage("Saved to Later. Return to the task when you are ready.");
  }

  async function sendMentor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = mentorText.trim();
    if (!text || mentorBusy) return;
    setMentorBusy(true);
    setMentorMessages((current) => [...current, { role: "user", content: text, saved: false }]);
    setMentorText("");
    try {
      const response = await fetch("/api/mentor", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, nodeId: activeLesson?.id, threadId: mentorThreadId, helpLevel: mentorHelp }),
      });
      const data = await response.json() as { threadId?: string; reply?: string; error?: string; message?: string };
      if (!response.ok) {
        setMentorMessages((current) => [...current, { role: "assistant", content: data.message ?? "The mentor provider is unavailable. Your attempt was not marked as mastery.", error: true }]);
        return;
      }
      if (data.threadId) setMentorThreadId(data.threadId);
      setMentorMessages((current) => [
        ...current.slice(0, -1).map((item) => item.role === "user" && item.content === text ? { ...item, saved: true } : item),
        { role: "assistant", content: data.reply ?? "The provider returned no usable answer.", saved: true },
      ]);
    } catch {
      setMentorMessages((current) => [...current, { role: "assistant", content: "The mentor provider could not be reached. Try the independent practice task or retry later.", error: true }]);
    } finally { setMentorBusy(false); }
  }

  async function startProject(catalogId: string) {
    const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ catalogId }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setPageError(data.error ?? "Could not create the project."); return; }
    await loadWorkspace();
  }

  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`/api/projects/${encodeURIComponent(evidenceProject)}/evidence`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evidenceType: "repository", label: evidenceLabel, ...(evidenceUrl ? { url: evidenceUrl } : {}) }),
    });
    if (!response.ok) { setPageError("Evidence was not saved. Use a valid HTTP(S) URL or leave the URL blank."); return; }
    setEvidenceLabel(""); setEvidenceUrl(""); setEvidenceProject("");
    setPageError("");
    await loadWorkspace();
  }

  async function createPortfolioItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPortfolioMessage("");
    const response = await fetch("/api/portfolio", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: portfolioProjectId, artifactClass: portfolioClass, summary: portfolioSummary }),
    });
    const data = await response.json() as { error?: string; message?: string; note?: string };
    if (!response.ok) { setPortfolioMessage(data.message ?? data.error ?? "The portfolio record was not saved."); return; }
    setPortfolioMessage(data.note ?? "Saved as student-submitted evidence.");
    setPortfolioProjectId(""); setPortfolioSummary("");
    const refreshed = await getJson<typeof portfolioData>("/api/portfolio");
    if (refreshed) setPortfolioData(refreshed);
  }

  async function saveEnglishAttempt(event: FormEvent<HTMLFormElement>, activity: string, dimension: string, responseText: string, clear: () => void) {
    event.preventDefault();
    const response = await fetch("/api/english", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dimension, activity, response: responseText }) });
    if (!response.ok) { setEnglishSaveMessage("This practice was not saved. Please retry."); return; }
    setEnglishSaveMessage("Saved. No CEFR level or pronunciation score was inferred.");
    clear();
    const refreshed = await getJson<typeof englishData>("/api/english");
    if (refreshed) setEnglishData(refreshed);
  }

  if (!user) return <PublicLanding />;

  const currentState = profile?.learningState ?? "deep";
  const activeNav = navItems.find((item) => item.id === page);
  const currentTitle = activeNav?.label ?? "Dashboard";
  const currentContent = (activeLesson?.content ?? {}) as Record<string, unknown>;
  const currentObjectives = activeLesson?.learningObjectives ?? [];
  const currentNotes = asStringArray(currentContent.mustWrite);
  const practicePrompt = studyKind === "recall"
    ? `Close the source. Explain ${activeLesson?.title ?? "the idea"} from memory in your own words.`
    : studyKind === "transfer"
      ? asText(currentContent.transfer, `Apply ${activeLesson?.title ?? "this idea"} in a changed context. State what changed and why your method still applies.`)
      : asText(currentContent.task, `Attempt one small independent task about ${activeLesson?.title ?? "this concept"}. Explain the important step.`);

  function renderCurriculumTree(node: CurriculumNode, depth = 0): React.ReactNode {
    const isExpandable = ["module", "extension", "unit"].includes(node.kind);
    const isOpen = Boolean(expanded[node.id]);
    const kids = childrenByNode[node.id] ?? [];
    const sourceStatus = (node.content as Record<string, unknown> | undefined)?.status;
    return <div className={`curriculum-tree-item depth-${Math.min(depth, 3)}`} key={node.id}>
      <div className={`tree-row ${node.kind === "course_reference" ? "tree-course" : ""}`}>
        {isExpandable ? <button className="tree-toggle" onClick={() => void toggleTree(node)} aria-expanded={isOpen} aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.title}`}>{isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button> : <span className="tree-spacer" />}
        <button className="tree-title" onClick={() => {
          if (node.kind === "lesson") void openLesson(node.id);
          else if (node.kind === "course_reference") { setActiveLesson(node); setPage("curriculum"); }
          else if (isExpandable) void toggleTree(node);
        }}>
          <span>{node.title}</span>
          <small>{node.kind === "course_reference" ? node.level : node.kind === "lesson" ? "LESSON" : node.kind === "unit" ? "UNIT" : node.level}</small>
        </button>
        {typeof sourceStatus === "string" && <span className={`source-status status-${sourceStatus}`}>{sourceStatus.replaceAll("_", " ")}</span>}
        {node.kind === "lesson" && <button className="tree-open" onClick={() => void openLesson(node.id)}>Study <ArrowRight size={13} /></button>}
      </div>
      {isOpen && <div className="tree-children">{kids.length ? kids.map((child) => renderCurriculumTree(child, depth + 1)) : <p className="tree-loading">Loading outline…</p>}</div>}
    </div>;
  }

  const stateBar = <div className="state-selector" role="group" aria-label="Choose how studying feels right now">
    {stateOptions.map((option) => <button key={option.id} onClick={() => void updateProfile({ learningState: option.id }).catch(() => setPageError("Could not save your study preference."))} className={`state-option ${currentState === option.id ? "selected" : ""}`} aria-pressed={currentState === option.id}>
      <option.icon size={16} /><span><strong>{option.title}</strong><small>{option.sub}</small></span>
    </button>)}
  </div>;

  function renderDashboard() {
    if (loading && !dashboard) return <div className="loading-panel"><RefreshCw className="spin" size={18} /> Loading your learning record…</div>;
    const task = dashboard?.currentTask;
    const nextReview = dashboard?.dueReviews?.[0];
    return <>
      <section className="welcome-row">
        <div><span className="eyebrow">YOUR LEARNING SPACE</span><h1>What should I do now?</h1><p>A clear next step, without turning learning into a timer or a score chase.</p></div>
        <button className="button button-quiet" onClick={() => setLaterOpen(true)}><Plus size={16} /> Capture for later</button>
      </section>
      <section className="panel state-panel"><div className="panel-heading"><div><h2>How does studying feel right now?</h2><p>Choose a presentation preference. This is not a diagnosis.</p></div><span className="soft-chip">State-adaptive</span></div>{stateBar}</section>
      {pageError && <div className="inline-error" role="alert"><AlertCircle size={16} />{pageError}<button onClick={() => void loadWorkspace()}>Retry</button></div>}
      <div className="dashboard-grid">
        <section className="panel next-task-panel">
          <div className="eyebrow"><span className="eyebrow-dot" /> NEXT USEFUL TASK</div>
          {nextReview ? <><div className="task-kicker"><RefreshCw size={15} /> Review is due</div><h2>{nextReview.title}</h2><p>Retrieval helps you check what remains available from memory. This review is linked to a recorded practice event.</p><button className="button button-primary" onClick={() => void openLesson(nextReview.nodeId, "practice")}>Start review <ArrowRight size={16} /></button></>
            : task ? <><div className="task-kicker"><BookOpen size={15} /> Foundations · Python</div><h2>{task.title}</h2><p>{task.why}</p><div className="task-meta"><span><Clock3 size={14} /> One concept</span><span><ShieldCheck size={14} /> Independent attempt</span></div><button className="button button-primary" onClick={() => void openLesson(task.id)}>Open lesson <ArrowRight size={16} /></button></>
            : <><h2>Curriculum is temporarily unavailable.</h2><p>No next task is recommended until the source data loads successfully.</p><button className="button button-secondary" onClick={() => void loadWorkspace()}>Try again</button></>}
          <div className="why-task"><Lightbulb size={16} /><span><strong>Why this task?</strong> {nextReview ? "A review is due from your own saved learning record." : "Python foundations unlock data analysis, machine learning and AI systems."}</span></div>
        </section>
        <aside className="side-stack">
          <section className="panel evidence-panel"><div className="eyebrow">YOUR EVIDENCE</div><h2>{dashboard?.evidenceCount ?? "—"}</h2><p>{dashboard?.evidenceCount ? "Saved learning attempts" : "No learning evidence yet"}</p><div className="divider" /><div className="evidence-foot"><span>Projects started</span><strong>{dashboard?.projectCount ?? "—"}</strong></div><p className="microcopy">Counts come from your account activity. Reading a lesson alone does not count as mastery.</p></section>
          <section className="panel project-panel"><div className="panel-heading compact"><h3>Project work</h3><button className="text-action" onClick={() => setPage("projects")}>Browse <ArrowRight size={13} /></button></div>{dashboard?.activeProjects.length ? dashboard.activeProjects.map((item) => <div className="compact-project" key={item.id}><FolderKanban size={16} /><span><strong>{item.title}</strong><small>{titleCase(item.status)}</small></span></div>) : <p className="empty-copy">No active project yet. Start one when its prerequisites are ready.</p>}</section>
        </aside>
      </div>
      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">A MAP, NOT A PLAYLIST</span><h2>Your curriculum spine</h2></div><button className="text-action" onClick={() => setPage("curriculum")}>View curriculum <ArrowRight size={14} /></button></div>
        <div className="module-preview-grid">{sortedOriginalModules.slice(0, 4).map((module, index) => <button className="module-preview" key={module.id} onClick={() => { setPage("curriculum"); void toggleTree(module); }}><span className="module-number">0{index + 1}</span><strong>{module.title}</strong><small>{module.stage} · {module.sourceCategory}</small><ArrowRight size={15} /></button>)}</div>
      </section>
      <section className="principle-strip"><div className="principle-icon"><Lightbulb size={18} /></div><div><strong>Keep the learning loop; adapt the delivery.</strong><p>Recall, feedback, practice and transfer remain. Task size and scaffolding change with your chosen state.</p></div><button className="text-action" onClick={() => setPage("research")}>See evidence & hypotheses <ArrowRight size={14} /></button></section>
    </>;
  }

  function renderCurriculum() {
    const details = activeLesson?.kind === "course_reference" ? activeLesson : null;
    return <>
      <section className="welcome-row"><div><span className="eyebrow">PREREQUISITES BEFORE PLAYLISTS</span><h1>Curriculum</h1><p>All original modules remain. Harvard College, Harvard Extension and industry additions stay visibly separate.</p></div><span className="soft-chip"><ShieldCheck size={14} /> Cycle-checked graph</span></section>
      <div className="curriculum-layout">
        <div className="panel curriculum-panel"><div className="panel-heading"><div><h2>Original curriculum</h2><p>8 preserved modules · every named topic retained</p></div><span className="source-pill source-original">Original</span></div>
          <div className="curriculum-tree">{sortedOriginalModules.map((node) => renderCurriculumTree(node))}</div>
        </div>
        <div className="curriculum-side">
          {details ? <section className="panel mapping-detail"><span className="source-pill">{details.sourceCategory}</span><h2>{details.title}</h2><p>{details.description}</p><div className="callout-note"><strong>Verification status</strong><p>{String((details.content as Record<string, unknown> | undefined)?.status ?? "Check the linked official source before planning a term.")}</p></div><div className="source-links">{details.sources?.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">Official source <ExternalLink size={13} /></a>)}</div><button className="button button-secondary" onClick={() => setActiveLesson(null)}>Close details</button></section>
            : <section className="panel"><span className="eyebrow">HARVARD COLLEGE</span><h2>Verified course mappings</h2><p>Current catalog/tag references. A current mapping is not a promise that the course runs every semester.</p><div className="curriculum-tree small-tree">{harvardRoots.slice(0, 9).map((node) => renderCurriculumTree(node))}</div><button className="button button-quiet full-width" onClick={() => setActiveLesson(null)}>Show all College references in the main outline</button></section>}
          <section className="panel"><span className="eyebrow">HARVARD EXTENSION</span><h2>A distinct graduate layer</h2><p>Certificate and ALM requirements are not Harvard College undergraduate CS. Term choices can change.</p>{harvardRoots.filter((node) => node.sourceCategory === "Harvard Extension").map((node) => <button className="reference-row" key={node.id} onClick={() => { setActiveLesson(node); }}><span><strong>{node.title}</strong><small>{node.level}</small></span><ArrowRight size={15} /></button>)}</section>
          <section className="panel"><span className="eyebrow">ADDITIVE EXTENSIONS</span><h2>Engineering and research spine</h2><div className="curriculum-tree small-tree">{extensionRoots.slice(0, 7).map((node) => renderCurriculumTree(node))}</div><p className="microcopy">Industry and research extensions are not relabeled as Harvard coursework.</p></section>
        </div>
      </div>
    </>;
  }

  function renderStudy() {
    if (lessonLoading && !activeLesson) return <div className="loading-panel"><RefreshCw className="spin" size={18} /> Opening lesson…</div>;
    if (!activeLesson) return <section className="panel blank-panel"><BookOpen size={24} /><h2>Choose a concept to study</h2><p>Start with the recommended lesson or open a lesson from the curriculum tree.</p><button className="button button-primary" onClick={() => dashboard?.currentTask && void openLesson(dashboard.currentTask.id)}>Open next task <ArrowRight size={15} /></button></section>;
    const mentalModel = asText(currentContent.mentalModel, activeLesson.description);
    const example = asText(currentContent.example, "Work through one example and explain what each step is doing.");
    return <>
      <div className="lesson-topline"><button className="back-link" onClick={() => setPage("curriculum")}><ArrowRight className="back-arrow" size={14} /> Curriculum</button><span className="source-pill source-original">{activeLesson.sourceCategory}</span><button className="text-action" onClick={() => setLaterOpen(true)}><Plus size={14} /> Capture a distraction</button></div>
      <div className="lesson-layout">
        <article className="lesson-main panel">
          <span className="eyebrow">{activeLesson.stage} · {activeLesson.level}</span>
          <h1>{activeLesson.title}</h1>
          <p className="lesson-intro">{mentalModel}</p>
          {activeLesson.why && <div className="why-block"><Lightbulb size={18} /><div><strong>Why this matters</strong><p>{activeLesson.why}</p></div></div>}
          {!!currentObjectives.length && <div className="objective-list"><h3>By the end, you should be able to</h3>{currentObjectives.map((objective) => <p key={objective}><Check size={15} />{objective}</p>)}</div>}
          <div className="lesson-example"><span className="eyebrow">SMALL EXAMPLE</span><p>{example}</p></div>
          <div className="practice-card">
            <div className="panel-heading"><div><span className="eyebrow">ACTIVE ATTEMPT</span><h2>Try it before the explanation</h2></div><span className="soft-chip">Independent first</span></div>
            <div className="attempt-tabs" role="tablist" aria-label="Learning activity">
              {(["recall", "practice", "transfer"] as const).map((kind) => <button key={kind} role="tab" aria-selected={studyKind === kind} className={studyKind === kind ? "active" : ""} onClick={() => { setStudyKind(kind); setAnswer(""); setLessonResult(null); }}>{titleCase(kind)}</button>)}
            </div>
            <p className="task-prompt">{practicePrompt}</p>
            {activeLesson.id === "python-programming-u1-t1" && studyKind === "practice" && <pre className="code-sample"><code>print(2 * 3 + 1)</code></pre>}
            {activeLesson.id === "python-programming-u1-t1" && studyKind === "transfer" && <pre className="code-sample"><code>print(2 * (3 + 1))</code></pre>}
            <form onSubmit={submitAttempt} className="attempt-form"><label htmlFor="attempt-answer">Your attempt</label><textarea id="attempt-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={studyKind === "practice" && activeLesson.id === "python-programming-u1-t1" ? "Predict the output, then explain the order…" : "Write your reasoning or solution…"} rows={4} maxLength={5000} required /><div className="attempt-footer"><span>Help level is recorded as “No Help” for this attempt.</span><button className="button button-primary" disabled={savingAttempt}>{savingAttempt ? "Saving…" : "Submit attempt"}<ArrowRight size={15} /></button></div></form>
            {lessonResult && <div className={`attempt-feedback ${lessonResult.evaluation.correct === true ? "feedback-correct" : lessonResult.evaluation.correct === false ? "feedback-review" : "feedback-neutral"}`} role="status"><div className="feedback-icon">{lessonResult.evaluation.correct === true ? <CheckCircle2 size={18} /> : <MessageCircle size={18} />}</div><div><strong>{lessonResult.evaluation.score === null ? "Attempt saved · not automatically graded" : lessonResult.evaluation.correct ? "Correct on this exercise" : "Needs another attempt"}</strong><p>{lessonResult.evaluation.feedback}</p>{lessonResult.nextReviewAt && <small>Next retrieval opportunity: {formatDate(lessonResult.nextReviewAt)}</small>}</div></div>}
          </div>
          <div className="notebook-guide"><div className="notebook-title"><NotebookPen size={17} /><strong>Notebook guidance</strong><span>Not a transcript</span></div><div className="note-columns"><div><small>MUST WRITE</small>{(currentNotes.length ? currentNotes : ["Core idea in your own words", "Essential rule or formula", "One worked example", "One common mistake", "Why and when to use it"]).map((item) => <p key={item}><Check size={13} />{item}</p>)}</div><div><small>OPTIONAL</small><p>Reference details you can look up later. Avoid copying the whole lesson.</p><p>Write one question you want to retrieve at a later review.</p></div></div></div>
          {!!lessonSources.length && <div className="lesson-sources"><h3>Next in this module</h3>{lessonSources.map((item) => <button key={item.id} className="next-topic" onClick={() => item.kind === "lesson" ? void openLesson(item.id) : void toggleTree(item)}>{item.title}<ArrowRight size={13} /></button>)}</div>}
        </article>
        <aside className="lesson-sidebar"><MentorPanel activeLesson={activeLesson} messages={mentorMessages} setMessages={setMentorMessages} text={mentorText} setText={setMentorText} help={mentorHelp} setHelp={setMentorHelp} busy={mentorBusy} submit={sendMentor} /></aside>
      </div>
    </>;
  }

  function renderPractice() {
    return <><section className="welcome-row"><div><span className="eyebrow">ATTEMPT · DIAGNOSE · RETRY</span><h1>Practice lab</h1><p>Code reading, debugging, recall and transfer—not a multiple-choice-only checkpoint.</p></div><span className="soft-chip">No remote code execution</span></section>
      <div className="practice-lab-grid"><section className="panel practice-feature"><div className="eyebrow">CURRENT FOUNDATION TASK</div><h2>{activeLesson?.title ?? dashboard?.currentTask?.title ?? "Python: predict before you run"}</h2><p>Build a mental trace first. Keep the source closed while you predict, then explain the intermediate step.</p><pre className="code-sample"><code>print(2 * 3 + 1)</code></pre><button className="button button-primary" onClick={() => activeLesson ? (setStudyKind("practice"), setPage("learn")) : dashboard?.currentTask && void openLesson(dashboard.currentTask.id)}>Open this attempt <ArrowRight size={15} /></button></section>
        <section className="panel practice-types"><span className="eyebrow">SUPPORTED TASK TYPES</span><h2>Evidence comes in different forms.</h2>{["Free recall", "Explain in your own words", "Predict output", "Debugging", "Choose a method", "Transfer case", "Project checkpoint", "Interview simulation"].map((task) => <div className="task-type-row" key={task}><Check size={14} /><span>{task}</span></div>)}<p className="microcopy">Open responses are not marked correct without a valid rubric or provider evaluation.</p></section></div>
    </>;
  }

  function renderProjects() {
    const ideas = projectsData?.catalog ?? [];
    const owned = projectsData?.projects ?? [];
    const filtered = ideas.filter((idea) => `${idea.title} ${idea.category}`.toLowerCase().includes(projectFilter.toLowerCase()));
    return <><section className="welcome-row"><div><span className="eyebrow">BUILD EVIDENCE, NOT A CHECKLIST</span><h1>Projects</h1><p>Original project ideas are preserved. An idea is not a completed project or portfolio claim.</p></div><span className="soft-chip">{ideas.length || "—"} catalog ideas</span></section>
      <section className="panel project-work"><div className="panel-heading"><div><h2>Your work</h2><p>Projects are saved to your account. Attach only artifacts that exist.</p></div></div>{owned.length ? <div className="owned-project-list">{owned.map((project) => <article className="owned-project" key={project.id}><div className="project-icon"><FolderKanban size={18} /></div><div className="owned-project-body"><div className="owned-title-row"><h3>{project.title}</h3><span className="soft-chip">{titleCase(project.status)}</span></div><p>Definition of done: requirements, tests, evaluation, failure analysis, documentation and evidence where relevant.</p>{project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer">Repository <ExternalLink size={13} /></a>}
            <form className="evidence-form" onSubmit={addEvidence}><input type="hidden" value={evidenceProject} readOnly />{evidenceProject === project.id ? <><input aria-label="Evidence label" value={evidenceLabel} onChange={(e) => setEvidenceLabel(e.target.value)} placeholder="Artifact label, e.g. repository" minLength={2} maxLength={120} required /><input aria-label="Evidence URL" type="url" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="https://… (optional)" /><button className="button button-secondary" type="submit">Save evidence</button><button className="button button-quiet" type="button" onClick={() => setEvidenceProject("")}>Cancel</button></> : <button className="text-action" type="button" onClick={() => setEvidenceProject(project.id)}><Plus size={13} /> Add an evidence link</button>}</form>
          </div></article>)}</div> : <div className="empty-panel"><FolderKanban size={22} /><strong>No projects started yet</strong><p>Choose a project idea below when its prerequisites make sense.</p></div>}</section>
      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">LEARNER-PROVIDED PROJECT CATALOG</span><h2>Choose a build</h2></div><label className="search-box"><Search size={15} /><input value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} placeholder="Filter project ideas" aria-label="Filter project ideas" /></label></div><div className="project-idea-grid">{filtered.map((idea) => <article className="project-idea" key={idea.id}><div className="idea-topline"><span className="idea-level">LEVEL {idea.ladderLevel}</span><span className="soft-chip">{idea.category}</span></div><h3>{idea.title}</h3><p>{idea.brief}</p>{idea.riskNote && <p className="risk-note"><ShieldCheck size={14} />{idea.riskNote}</p>}<button className="text-action" onClick={() => void startProject(idea.id)} disabled={owned.some((project) => project.catalogId === idea.id)}>{owned.some((project) => project.catalogId === idea.id) ? "Already in your work" : "Start project"}<ArrowRight size={14} /></button></article>)}</div></section>
    </>;
  }

  function renderReview() {
    const due = reviewData?.due ?? [];
    const upcoming = reviewData?.upcoming ?? [];
    return <><section className="welcome-row"><div><span className="eyebrow">DURABLE RETENTION</span><h1>Review</h1><p>Reviews are scheduled from your practice events and adapt when an answer is difficult or assisted.</p></div><span className="soft-chip">No flashcard-only loop</span></section>
      <div className="review-columns"><section className="panel"><div className="panel-heading"><div><h2>Due now</h2><p>Use retrieval, explanation or transfer—not rereading alone.</p></div><span className="review-count">{due.length}</span></div>{due.length ? due.map((item) => <article className="review-row" key={item.id}><div><strong>{item.title}</strong><p>{item.why ?? "Recall the concept and apply it to one short problem."}</p><small>{titleCase(item.activityType)} · due {formatDate(item.dueAt)}</small></div><button className="button button-primary" onClick={() => void openLesson(item.nodeId, "practice")}>Start <ArrowRight size={14} /></button></article>) : <div className="empty-panel"><CheckCircle2 size={22} /><strong>{reviewData?.message ?? "No review is due."}</strong><p>A scored practice attempt can create a future review. A blank queue is not a lost streak.</p><button className="button button-secondary" onClick={() => dashboard?.currentTask && void openLesson(dashboard.currentTask.id)}>Study a new concept</button></div>}</section>
        <section className="panel"><div className="panel-heading"><div><h2>Coming up</h2><p>Scheduled from your saved attempts.</p></div></div>{upcoming.length ? upcoming.map((item) => <div className="upcoming-review" key={item.id}><Clock3 size={15} /><span><strong>{item.title}</strong><small>{formatDate(item.dueAt)} · {item.intervalDays} day interval</small></span></div>) : <div className="empty-copy">No future review is scheduled yet. Your first scored attempt can seed one.</div>}</section></div>
    </>;
  }

  function renderSkills() {
    const records = skillData?.skills ?? [];
    const active = records.filter((item) => item.evidence.length > 0);
    return <><section className="welcome-row"><div><span className="eyebrow">COMPLETION ≠ COMPETENCE ≠ EVIDENCE</span><h1>Skills</h1><p>Skills become defensible through attempts, transfer, debugging and project artifacts—not time spent on a page.</p></div><span className="soft-chip">{active.length} with evidence · {records.length} mapped</span></section>
      {active.length === 0 ? <section className="panel empty-panel skill-empty"><Activity size={24} /><h2>No skill evidence recorded yet</h2><p>Your skill graph is present; it will stay honest until independent attempts and artifacts are saved.</p><button className="button button-primary" onClick={() => setPage("curriculum")}>Explore the graph <ArrowRight size={15} /></button></section> : <section className="panel"><div className="panel-heading"><div><h2>Evidence-linked skills</h2><p>Only saved account evidence appears here.</p></div></div><div className="skill-list">{active.map((skill) => <article className="skill-row" key={skill.id}><span className="skill-status"><CheckCircle2 size={17} /></span><div><strong>{skill.title}</strong><small>{skill.category} · {skill.sourceCategory}</small>{skill.evidence.map((item, i) => <p key={`${skill.id}-${i}`}>{item.evidenceSummary}{item.independent ? " · independent" : " · assisted"}</p>)}</div></article>)}</div></section>}
    </>;
  }

  function renderCareer() {
    return <><section className="welcome-row"><div><span className="eyebrow">EVIDENCE-DRIVEN CAREER WORK</span><h1>Career</h1><p>Map a target role to skills, then connect each gap to a learning task and proof.</p></div><span className="soft-chip">No employment promises</span></section>
      <div className="role-grid">{careerRoles.map((role) => <article className="panel role-card" key={role.id}><div className="role-head"><div className="role-icon"><BriefcaseBusiness size={18} /></div><span className="source-status status-design_decision">Learner blueprint</span></div><h2>{role.title}</h2><p>{role.sourceNote}</p><div className="role-meta"><span>Region: {role.region ?? "Not verified"}</span><span>Seniority: {role.seniority ?? "Not verified"}</span><span>Snapshot: {"Not a live posting"}</span></div><div className="role-gap-box"><strong>{role.gapStatus === "no_evidence_yet" ? "No evidence yet" : "Evidence review needed"}</strong><p>{role.mappedEvidenceCount} of {role.requirements.length} blueprint skills map to evidence records. A match is not a recruiter validation.</p></div><details className="requirements-details"><summary>Blueprint skills ({role.requirements.length})</summary><div className="requirement-chips">{role.requirements.map((item) => <span key={`${role.id}-${item.skillName}`}>{item.skillName}</span>)}</div></details><button className="button button-secondary" onClick={() => setPage("skills")}>Inspect skill evidence <ArrowRight size={14} /></button></article>)}</div>
      <section className="callout-note market-disclaimer"><ShieldCheck size={17} /><p><strong>Market data is not available.</strong> This workspace does not have a verified live job posting or current job-market snapshot. The two role lists are target profiles supplied in the product specification.</p></section>
    </>;
  }

  function renderFreelance() {
    const prompts = ["Who will use this chatbot, and what should it help them do?", "Which approved documents or systems can it access?", "What privacy, identity and access rules apply?", "How will quality, latency and cost be evaluated?", "Who will maintain it, and what is in or out of scope?"];
    return <><section className="welcome-row"><div><span className="eyebrow">SIMULATED CLIENT DISCOVERY</span><h1>Freelance practice</h1><p>Practice scoping a request before proposing an AI system.</p></div><span className="simulation-label">SIMULATION · NOT A REAL CLIENT</span></section>
      <div className="freelance-layout"><section className="panel simulation-card"><div className="simulation-client"><Users size={18} /><div><small>SIMULATED CLIENT</small><strong>“I need an AI chatbot.”</strong></div></div><p>Do not start by choosing an agent framework. Gather requirements and constraints first.</p><h3>Discovery questions to cover</h3>{prompts.map((prompt, index) => <div className="discovery-prompt" key={prompt}><span>0{index + 1}</span><p>{prompt}</p></div>)}<form onSubmit={(e) => void saveEnglishAttempt(e, "freelance client discovery simulation", "professional_communication", freelanceResponse, () => { setFreelanceResponse(""); setFreelanceSaved(true); })}><label htmlFor="freelance-answer">Your discovery plan</label><textarea id="freelance-answer" rows={6} maxLength={5000} value={freelanceResponse} onChange={(e) => setFreelanceResponse(e.target.value)} placeholder="Write what you would ask before estimating or promising a solution…" required /><button className="button button-primary" type="submit">Save practice response <ArrowRight size={15} /></button></form>{freelanceSaved && <p className="success-inline"><Check size={15} />Saved as simulated practice, not client work.</p>}</section><aside className="panel"><span className="eyebrow">DELIVERY FLOW</span><h2>From request to support</h2><ol className="numbered-list">{["Discovery", "Requirements", "Scope + acceptance criteria", "Estimate + proposal", "Implementation + tests", "Review + delivery", "Maintenance + case study"].map((step) => <li key={step}>{step}</li>)}</ol><p className="microcopy">No simulated revenue, clients, reviews or employment records are created.</p></aside></div>
    </>;
  }

  function renderResearch() {
    return <><section className="welcome-row"><div><span className="eyebrow">EVIDENCE · LIMITATIONS · HYPOTHESES</span><h1>Research</h1><p>IHLS uses research-informed study strategies; its adaptive and AI design claims remain testable hypotheses.</p></div><span className="soft-chip">No efficacy claims</span></section>
      <section className="research-caveat panel"><div className="research-symbol"><FlaskConical size={20} /></div><div><strong>Why Harvard is a reference, not a badge</strong><p>Harvard offers distinct College and Extension experiences with course-specific formats. The self-study adapts selected structures; it does not claim institutional equivalence, enrollment or credit.</p><a href="/docs/research/verification-dossier.md" target="_blank">Read the research dossier <ExternalLink size={13} /></a></div></section>
      <div className="hypothesis-grid">{learningHypotheses.map((item) => <article className="panel hypothesis-card" key={item.title}><span className="hypothesis-status">{item.status}</span><h2>{item.title}</h2><p>{item.question}</p><div className="hypothesis-measure"><small>MEASURE</small><p>{item.measure}</p></div></article>)}</div>
      <section className="panel evidence-levels"><div className="panel-heading"><div><span className="eyebrow">EVIDENCE BOUNDARIES</span><h2>What the method can and cannot claim</h2></div></div><div className="evidence-level-row"><span className="evidence-level strong">Strong research base</span><p>Retrieval practice and spacing have broad research support. Their implementation still needs feedback, appropriate tasks and context-aware intervals.</p></div><div className="evidence-level-row"><span className="evidence-level moderate">Context-dependent</span><p>Interleaving and examples can help with discrimination and explanation; effects depend on subject, prior familiarity and task design.</p></div><div className="evidence-level-row"><span className="evidence-level emerging">Research hypothesis</span><p>State-adaptive task sizing, attempt-first AI tutoring and distraction capture are product hypotheses, not established clinical or universal interventions.</p></div><p className="microcopy">No medical diagnosis, “best in the world” claim, or Nobel prediction is made.</p></section>
    </>;
  }

  function renderEnglish() {
    const terms = englishData?.terms ?? [];
    const attempts = englishData?.attempts ?? [];
    return <><section className="welcome-row"><div><span className="eyebrow">AUTHENTIC TECHNICAL ENGLISH</span><h1>English practice</h1><p>Learn professional communication through the same concepts you are building.</p></div><span className="soft-chip">No vocabulary-count proficiency claim</span></section>
      <div className="english-grid"><section className="panel"><div className="panel-heading"><div><h2>Technical vocabulary</h2><p>Canonical terms stay visible; simpler definitions support access.</p></div></div><div className="term-list">{terms.map((term) => <article className="term-row" key={term.id}><div><strong>{term.term}</strong>{term.arabicMeaning && <small>{term.arabicMeaning}</small>}</div><p>{term.definition}</p><em>{term.example}</em></article>)}</div></section>
        <section className="panel english-practice"><span className="eyebrow">WRITING LAB</span><h2>Explain a technical idea</h2><p>In 2–4 sentences, explain <strong>idempotency</strong> to a teammate and use the word in a realistic API example.</p><form onSubmit={(e) => void saveEnglishAttempt(e, "Explain idempotency in a technical context", "writing", englishResponse, () => setEnglishResponse(""))}><textarea rows={5} value={englishResponse} maxLength={5000} onChange={(e) => setEnglishResponse(e.target.value)} placeholder="Write in your own words…" required /><button className="button button-primary" type="submit">Save practice <ArrowRight size={15} /></button></form>{englishSaveMessage && <p className="microcopy" role="status">{englishSaveMessage}</p>}<div className="divider" /><h3>Your saved practice</h3>{attempts.length ? attempts.slice(0, 5).map((attempt) => <article className="english-attempt" key={attempt.id}><small>{titleCase(attempt.dimension)} · {formatDate(attempt.createdAt)}</small><p>{attempt.response}</p><small>{attempt.feedback}</small></article>) : <p className="empty-copy">No English practice saved yet. Speaking scores are not available until a supported, validated speech tool is connected.</p>}</section></div>
    </>;
  }

  function renderPortfolio() {
    const items = portfolioData?.items ?? [];
    const eligibleProjects = projectsData?.projects ?? [];
    return <><section className="welcome-row"><div><span className="eyebrow">REAL ARTIFACTS ONLY</span><h1>Portfolio</h1><p>A high-signal case study needs a problem, approach, evaluation, failures and verifiable artifacts.</p></div><span className="soft-chip">No invented achievements</span></section>
      {eligibleProjects.length > 0 && <section className="panel portfolio-create"><div className="panel-heading"><div><h2>Add an artifact-backed case study</h2><p>A real project link must already be attached. Records remain marked unverified until independently reviewed.</p></div></div><form className="portfolio-form" onSubmit={createPortfolioItem}><label>Project<select value={portfolioProjectId} onChange={(event) => setPortfolioProjectId(event.target.value)} required><option value="">Choose your project</option>{eligibleProjects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}</select></label><label>Artifact class<select value={portfolioClass} onChange={(event) => setPortfolioClass(event.target.value)}><option value="technical_artifact">Technical artifact</option><option value="portfolio_project">Portfolio project</option><option value="practice_only">Practice only</option><option value="skill_evidence">Skill evidence</option></select></label><label>Summary<textarea value={portfolioSummary} onChange={(event) => setPortfolioSummary(event.target.value)} minLength={20} maxLength={1200} rows={3} placeholder="Describe the problem, your approach, evaluation and limitations. Do not invent impact." required /></label><button className="button button-primary" type="submit">Add portfolio record <ArrowRight size={15} /></button></form>{portfolioMessage && <p className="microcopy" role="status">{portfolioMessage}</p>}</section>}
      {items.length ? <div className="portfolio-grid">{items.map((item) => <article className="panel portfolio-card" key={item.id}><span className="artifact-class">{titleCase(item.artifactClass)}</span><span className="portfolio-unverified">{titleCase(item.verificationStatus)}</span><h2>{item.projectTitle}</h2><p>{item.summary}</p>{item.publicUrl && <a href={item.publicUrl} target="_blank" rel="noreferrer">View artifact <ExternalLink size={13} /></a>}</article>)}</div> : <section className="panel empty-panel portfolio-empty"><FileText size={24} /><h2>No portfolio evidence yet</h2><p>Project ideas are not completed work. Start a project, attach a real repository/report/demo, and document limitations before presenting it.</p><button className="button button-primary" onClick={() => setPage("projects")}>Open projects <ArrowRight size={15} /></button></section>}
      <section className="panel portfolio-guide"><span className="eyebrow">CASE STUDY STANDARD</span><div className="guide-grid">{["Problem + constraints", "Architecture + data provenance", "Implementation + testing", "Evaluation + failures", "Security + limitations", "Repository + demo/report"].map((text) => <p key={text}><Check size={14} />{text}</p>)}</div></section>
    </>;
  }

  function renderSettings() {
    return <><section className="welcome-row"><div><span className="eyebrow">YOUR LEARNING ENVIRONMENT</span><h1>Settings</h1><p>Small preferences shape presentation; none are diagnoses or fixed learner types.</p></div></section>
      <div className="settings-grid"><section className="panel"><span className="eyebrow">STUDY PRESENTATION</span><label className="setting-row"><span><strong>Appearance</strong><small>Use light, dark or system appearance.</small></span><select aria-label="Appearance" value={profile?.theme ?? "system"} onChange={(e) => void updateProfile({ theme: e.target.value as Profile["theme"] }).catch(() => setSettingsMessage("Could not save this setting."))}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><h2>Current state</h2>{stateBar}<div className="divider"/><label className="setting-row"><span><strong>Available study time</strong><small>Used to suggest a task size, never as a timer rule.</small></span><select value={profile?.availableMinutes ?? 30} onChange={(e) => void updateProfile({ availableMinutes: Number(e.target.value) }).catch(() => setSettingsMessage("Could not save this setting."))}><option value="10">About 10 minutes</option><option value="30">About 30 minutes</option><option value="60">About 60 minutes</option><option value="90">About 90 minutes</option></select></label><label className="setting-row"><span><strong>Text size</strong><small>Adjust reading comfort.</small></span><select value={profile?.textScale ?? "default"} onChange={(e) => void updateProfile({ textScale: e.target.value as Profile["textScale"] }).catch(() => setSettingsMessage("Could not save this setting."))}><option value="default">Default</option><option value="large">Large</option><option value="largest">Largest</option></select></label><label className="setting-row"><span><strong>Vocabulary assistance</strong><small>Show simpler technical definitions when useful.</small></span><input type="checkbox" checked={profile?.vocabularyAssist ?? true} onChange={(e) => void updateProfile({ vocabularyAssist: e.target.checked }).catch(() => setSettingsMessage("Could not save this setting."))}/></label><label className="setting-row"><span><strong>Reduced motion</strong><small>Reduce optional motion and transitions.</small></span><input type="checkbox" checked={profile?.reducedMotion ?? false} onChange={(e) => void updateProfile({ reducedMotion: e.target.checked }).catch(() => setSettingsMessage("Could not save this setting."))}/></label><div className="divider"/><label className="setting-row"><span><strong>Language</strong><small>Choose the UI language preference.</small></span><select value={profile?.language ?? "en"} onChange={(e) => void updateProfile({ language: e.target.value as Profile["language"] }).catch(() => setSettingsMessage("Could not save this setting."))}><option value="en">English</option><option value="ar">Arabic explanation</option></select></label><label className="setting-row"><span><strong>English mode</strong><small>Keep technical terms authentic while adapting surrounding language.</small></span><select value={profile?.contentMode ?? "standard"} onChange={(e) => void updateProfile({ contentMode: e.target.value as Profile["contentMode"] }).catch(() => setSettingsMessage("Could not save this setting."))}><option value="standard">Standard Technical English</option><option value="b1-b2">B1–B2 support</option><option value="english-training">English training</option></select></label>
        {settingsMessage && <p className="form-error" role="alert">{settingsMessage}</p>}</section>
        <section className="panel"><span className="eyebrow">CAREER TARGETS</span><h2>Choose target blueprints</h2><p>These are references supplied in the curriculum brief, not verified live openings.</p>{careerRoles.map((role) => <label className="role-choice" key={role.id}><input type="checkbox" checked={profile?.targetRoleIds.includes(role.id) ?? false} onChange={(e) => {
            const current = profile?.targetRoleIds ?? [];
            const next = e.target.checked ? [...current, role.id] : current.filter((id) => id !== role.id);
            void updateProfile({ targetRoleIds: next }).catch(() => setSettingsMessage("Could not save your career target."));
          }}/><span><strong>{role.title}</strong><small>Learner-provided role blueprint</small></span></label>)}<div className="divider"/><h3>Account</h3><p>{user?.email ?? "Signed-in account"}</p><button className="button button-quiet" onClick={async () => { await authClient.signOut(); window.location.href = "/"; }}><LogOut size={15} /> Sign out</button><p className="microcopy">GitHub, file upload, cloud speech and object storage integrations are not enabled.</p></section></div>
    </>;
  }

  const pageContent = () => {
    switch (page) {
      case "dashboard": return renderDashboard();
      case "curriculum": return renderCurriculum();
      case "learn": return renderStudy();
      case "practice": return renderPractice();
      case "projects": return renderProjects();
      case "review": return renderReview();
      case "skills": return renderSkills();
      case "career": return renderCareer();
      case "freelance": return renderFreelance();
      case "research": return renderResearch();
      case "english": return renderEnglish();
      case "portfolio": return renderPortfolio();
      case "settings": return renderSettings();
      case "mentor": return <><section className="welcome-row"><div><span className="eyebrow">SCAFFOLD, NOT SUBSTITUTE</span><h1>AI Mentor</h1><p>Ask for a hint, check your reasoning or request a reference explanation.</p></div><span className="soft-chip">Provider status is real</span></section><div className="mentor-full"><MentorPanel activeLesson={activeLesson} messages={mentorMessages} setMessages={setMentorMessages} text={mentorText} setText={setMentorText} help={mentorHelp} setHelp={setMentorHelp} busy={mentorBusy} submit={sendMentor}/><section className="panel mentor-boundary"><ShieldCheck size={19}/><h2>Evidence and boundaries</h2><p>A mentor response is not an assessment result. Only separate independent attempts, transfer and project evidence can support skill readiness.</p><p>Provider credentials remain on the server. If unavailable, no AI answer is simulated.</p></section></div></>;
    }
  };

  return <div className={`app-shell theme-${profile?.theme ?? "system"} ${profile?.textScale === "large" ? "text-large" : profile?.textScale === "largest" ? "text-largest" : ""} ${profile?.reducedMotion ? "reduce-motion" : ""}`}>
    <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
      <Link href="/" className="brand-lockup" aria-label="IHLS workspace"><span className="brand-mark">i</span><span><strong>ihls</strong><small>learning system</small></span></Link>
      <div className="sidebar-user"><span className="avatar">{user.name.trim().charAt(0).toUpperCase() || "L"}</span><span><strong>{user.name}</strong><small>Personal workspace</small></span><ChevronDown size={14}/></div>
      <nav className="primary-nav" aria-label="Main navigation">{navItems.map((item) => <div key={item.id}>{item.group && <div className="nav-group-label">{item.group}</div>}<button className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); setMenuOpen(false); }} aria-current={page === item.id ? "page" : undefined}><item.icon size={17} strokeWidth={1.8}/><span>{item.label}</span>{item.id === "review" && (dashboard?.dueReviews.length ?? 0) > 0 && <span className="nav-count">{dashboard?.dueReviews.length}</span>}</button></div>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><Lightbulb size={15}/><p>Focus on what you can <strong>explain, solve and build</strong>.</p></div><button className="sidebar-signout" onClick={async () => { await authClient.signOut(); window.location.href = "/"; }}><LogOut size={15}/> Sign out</button></div>
    </aside>
    {menuOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    <div className="main-column">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation"><Menu size={18}/></button><span className="breadcrumbs">IHLS <ChevronRight size={13}/> {currentTitle}</span></div><div className="topbar-actions"><span className="workspace-indicator"><span/> Private workspace</span><button className="icon-button" aria-label="Search the curriculum" onClick={() => setPage("curriculum")}><Search size={17}/></button><button className="top-avatar" title={user.email} onClick={() => setPage("settings")}>{user.name.charAt(0).toUpperCase()}</button></div></header>
      <main className="workspace-content">
        {pageError && page !== "dashboard" && <div className="inline-error" role="alert"><AlertCircle size={16}/>{pageError}<button onClick={() => setPageError("")}>Dismiss</button></div>}
        {pageContent()}
        <footer className="app-footer"><span>Harvard-informed self-study · not a Harvard credential</span><span>Research snapshot · 29 Sep 2026</span><button onClick={() => setPage("settings")}>Privacy & settings</button></footer>
      </main>
    </div>
    {laterOpen && <div className="modal-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLaterOpen(false); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="later-title"><button className="modal-close" aria-label="Close" onClick={() => setLaterOpen(false)}><X size={17}/></button><span className="eyebrow">EXTERNALIZE, THEN RETURN</span><h2 id="later-title">Capture it for later</h2><p>Write the thought down without turning it into another open tab. Then return to the current task when ready.</p><form onSubmit={saveLater}><textarea value={laterText} onChange={(e) => setLaterText(e.target.value)} maxLength={240} rows={3} placeholder="A thought, question or thing to look up…" required/><button className="button button-primary" type="submit">Save for later <ArrowRight size={15}/></button></form>{laterMessage && <p className="microcopy" role="status">{laterMessage}</p>}</section></div>}
  </div>;
}

function MentorPanel({ activeLesson, messages, setMessages, text, setText, help, setHelp, busy, submit }: {
  activeLesson: CurriculumNode | null; messages: MentorMessage[]; setMessages: (value: MentorMessage[] | ((current: MentorMessage[]) => MentorMessage[])) => void;
  text: string; setText: (value: string) => void; help: string; setHelp: (value: string) => void; busy: boolean; submit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const actions = ["Explain", "Give me a hint", "Check my reasoning", "Give an example", "Challenge me", "What should I write?"];
  return <section className="mentor-panel panel"><div className="mentor-heading"><div className="mentor-avatar"><MessagesSquare size={17}/></div><div><strong>Lead Mentor</strong><small>Context-aware · attempt first</small></div><span className="mentor-live"><span/> Bounded</span></div>
    {activeLesson && <div className="mentor-context"><small>LESSON CONTEXT</small><strong>{activeLesson.title}</strong></div>}
    <div className="mentor-conversation" aria-live="polite">{messages.length === 0 ? <div className="mentor-welcome"><div className="mentor-welcome-icon"><Lightbulb size={18}/></div><strong>Let’s work through it.</strong><p>Show your attempt when you have one. I’ll start with the smallest useful hint unless you ask for a full explanation.</p></div> : messages.map((message, index) => <div className={`chat-message ${message.role} ${message.error ? "chat-error" : ""}`} key={`${index}-${message.content.slice(0, 12)}`}><small>{message.role === "user" ? "YOU" : "MENTOR"}{message.role === "user" && message.saved === false ? " · NOT YET SAVED" : ""}</small><p>{message.content}</p></div>)}{busy && <div className="chat-loading"><span/><span/><span/> Thinking…</div>}</div>
    <div className="mentor-quick-actions">{actions.map((action) => <button key={action} onClick={() => setText(text ? `${text} ${action.toLowerCase()}` : `${action}${activeLesson ? ` about ${activeLesson.title}` : ""}`)}>{action}</button>)}</div>
    <label className="help-level-label">Help level<select value={help} onChange={(event) => setHelp(event.target.value)}><option value="hint">Hint</option><option value="guidance">Guidance</option><option value="concept_reminder">Concept reminder</option><option value="worked_example">Worked example</option><option value="full_explanation">Full explanation</option></select></label>
    <form className="mentor-input" onSubmit={submit}><textarea value={text} onChange={(event) => setText(event.target.value)} rows={3} maxLength={3000} placeholder="Ask about the concept or share your reasoning…" aria-label="Message the mentor" required/><button className="mentor-send" type="submit" disabled={busy || !text.trim()} aria-label="Send mentor request"><Send size={16}/></button></form>
    <p className="mentor-disclaimer">AI feedback is not proof of independent mastery. Do not include secrets or sensitive personal information.</p>
  </section>;
}

function PublicLanding() {
  const pillars = [
    { icon: BookOpen, title: "A real curriculum graph", text: "Eight original modules preserved, with prerequisites and separate Harvard College and Extension mappings." },
    { icon: Activity, title: "Evidence over completion", text: "Recall, practice, transfer and project artifacts—not watch time or streaks." },
    { icon: FolderKanban, title: "Build what you can explain", text: "A preserved 21-idea project ladder with risk-aware, truthful evidence." },
  ];
  return <main className="public-page"><header className="public-header"><Link href="/" className="brand-lockup"><span className="brand-mark">i</span><span><strong>ihls</strong><small>learning system</small></span></Link><div className="public-auth"><Link href="/sign-in" className="button button-quiet">Sign in</Link><Link href="/sign-up" className="button button-primary">Create account <ArrowRight size={15}/></Link></div></header>
    <section className="public-hero"><div className="public-hero-copy"><span className="eyebrow"><span className="eyebrow-dot"/> THE ISMAILI HARVARD LEARNING SCIENCE</span><h1>Learn to build what you can <em>explain.</em></h1><p>A personal AI Engineering learning system: rigorous foundations, verified academic references, state-adaptive study, and real project evidence.</p><div className="public-actions"><Link href="/sign-up" className="button button-primary button-large">Start your learning record <ArrowRight size={16}/></Link><Link href="/sign-in" className="button button-secondary button-large">Sign in</Link></div><div className="truth-note"><ShieldCheck size={15}/><span>Harvard-informed self-study. Not Harvard enrollment, credit or a degree.</span></div></div>
      <div className="public-map" aria-label="Learning pathway overview"><div className="map-label">THE LEARNING PATH</div><div className="map-node active"><span className="map-index">01</span><div><strong>Foundations</strong><small>Python · Math · CS</small></div><CheckCircle2 size={17}/></div><div className="map-connector"/><div className="map-node"><span className="map-index">02</span><div><strong>Data & systems</strong><small>SQL · pipelines · software</small></div><span className="map-dot"/></div><div className="map-connector"/><div className="map-node"><span className="map-index">03</span><div><strong>Machine learning</strong><small>Reason · evaluate · transfer</small></div><span className="map-dot"/></div><div className="map-connector"/><div className="map-node"><span className="map-index">04</span><div><strong>Production AI</strong><small>LLMs · deployment · evidence</small></div><span className="map-dot"/></div><div className="map-map-footer"><span><span className="map-status-dot"/> Source verified</span><small>Course availability is term-specific</small></div></div>
    </section>
    <section className="public-facts"><div><strong>8</strong><span>original modules kept</span></div><div><strong>21</strong><span>original project ideas</span></div><div><strong>2</strong><span>Harvard layers, kept distinct</span></div><div><strong>0</strong><span>invented learner achievements</span></div></section>
    <section className="public-pillars"><div className="public-section-title"><span className="eyebrow">THE SYSTEM IS THE PRODUCT</span><h2>Built around independent competence.</h2></div><div className="pillar-grid">{pillars.map((item) => <article key={item.title} className="pillar-card"><span className="pillar-icon"><item.icon size={19}/></span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
    <section className="public-method"><div><span className="eyebrow">A HUMAN LEARNING LOOP</span><h2>Keep the learning principles. Adapt the delivery.</h2><p>Retrieval and spacing are supported by learning research. State-adaptive task sizing and attempt-first AI are clearly labeled as hypotheses to test, not proven outcomes.</p></div><div className="loop-sequence"><span>WHY</span><ArrowRight size={14}/><span>ATTEMPT</span><ArrowRight size={14}/><span>FEEDBACK</span><ArrowRight size={14}/><span>TRANSFER</span><ArrowRight size={14}/><span>BUILD</span></div></section>
    <footer className="public-footer"><span>IHLS · Research snapshot 29 Sep 2026</span><span>Course claims link to dated official sources.</span><Link href="/sign-up">Create a private learning account <ArrowRight size={13}/></Link></footer>
  </main>;
}
