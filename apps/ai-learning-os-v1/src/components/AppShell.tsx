"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Map, BookOpen, FlaskConical, FolderGit2, RotateCcw, Network, Briefcase, Handshake, Microscope, MessageSquare, Award, Settings, ShieldCheck, LogOut } from "lucide-react";
import { api, readState, STATE_KEY, type LearningState } from "@/lib/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/curriculum", label: "Curriculum", icon: Map },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice Lab", icon: FlaskConical },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/skills", label: "Skills", icon: Network },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/freelance", label: "Freelance", icon: Handshake },
  { href: "/research", label: "Research", icon: Microscope },
  { href: "/mentor", label: "AI Mentor", icon: MessageSquare },
  { href: "/portfolio", label: "Portfolio", icon: Award },
  { href: "/settings", label: "Settings", icon: Settings },
];

const STATES: { v: LearningState; label: string }[] = [
  { v: "deep", label: "I’m focused" },
  { v: "drift", label: "I’m drifting" },
  { v: "fog", label: "Starting feels hard" },
  { v: "overload", label: "Too much at once" },
];

export function AppShell({ user, later, children }: { user: { name: string; role: string }; later: { id: string; text: string }[]; children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [state, setState] = useState<LearningState>("deep");
  const [laterText, setLaterText] = useState("");
  const [items, setItems] = useState(later);
  useEffect(() => setState(readState()), []);
  useEffect(() => setItems(later), [later]);

  async function changeState(v: LearningState) {
    setState(v);
    localStorage.setItem(STATE_KEY, v);
    window.dispatchEvent(new Event("ihl-state-change"));
    await api("/api/practice", { intent: "state", state: v });
  }
  async function addLater(e: React.FormEvent) {
    e.preventDefault();
    if (!laterText.trim()) return;
    const r = await api<{ id: string; text: string }>("/api/activities", { intent: "later_add", text: laterText.trim() });
    if (r.ok) setItems((x) => [...x, { id: r.data.id, text: r.data.text }]);
    setLaterText("");
  }
  async function doneLater(id: string) {
    setItems((x) => x.filter((i) => i.id !== id));
    await api("/api/activities", { intent: "later_done", id, done: true });
  }
  async function logout() {
    await api("/api/auth", { intent: "logout" });
    router.push("/login");
    router.refresh();
  }

  const nav = user.role === "admin" ? [...NAV, { href: "/admin", label: "Admin", icon: ShieldCheck }] : NAV;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface px-3 py-5 lg:flex">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2 text-sm font-semibold"><span className="h-6 w-6 rounded bg-accent" aria-hidden />IHL Learning OS</Link>
        <nav aria-label="Primary" className="flex-1 space-y-0.5">
          {nav.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm ${active ? "bg-accent-soft font-medium text-accent-strong" : "text-ink hover:bg-surface-2"}`}>
                <Icon size={16} aria-hidden /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-border pt-3">
          <div className="truncate px-2 text-xs text-muted">{user.name}</div>
          <button onClick={logout} className="mt-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2"><LogOut size={14} aria-hidden /> Sign out</button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
            <span className="text-xs text-muted">How does studying feel right now?</span>
            <div role="radiogroup" aria-label="Study state" className="flex flex-wrap gap-1">
              {STATES.map((s) => (
                <button key={s.v} role="radio" aria-checked={state === s.v} onClick={() => changeState(s.v)} className={`rounded-full border px-2.5 py-1 text-xs ${state === s.v ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-muted hover:bg-surface-2"}`}>{s.label}</button>
              ))}
            </div>
            <form onSubmit={addLater} className="ml-auto flex items-center gap-1">
              <label htmlFor="later" className="sr-only">Capture a distraction for later</label>
              <input id="later" value={laterText} onChange={(e) => setLaterText(e.target.value)} placeholder="Later: capture a distraction…" className="input !w-48 !py-1 text-xs" maxLength={300} />
              <button className="btn !py-1 text-xs">Later</button>
            </form>
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-1.5 sm:px-6">
              {items.map((i) => (
                <button key={i.id} onClick={() => doneLater(i.id)} title="Mark done" className="badge hover:bg-ok-soft">{i.text} ✓</button>
              ))}
            </div>
          )}
        </header>
        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-8">{children}</main>
        <nav aria-label="Primary mobile" className="fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t border-border bg-surface lg:hidden">
          {nav.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`flex min-w-[4.5rem] flex-col items-center gap-0.5 px-2 py-2 text-[10px] ${active ? "text-accent" : "text-muted"}`}>
                <Icon size={18} aria-hidden />{n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
