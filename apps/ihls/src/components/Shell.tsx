"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Network,
  BookOpen,
  FlaskConical,
  FolderGit2,
  RotateCcw,
  Target,
  Briefcase,
  Handshake,
  Microscope,
  MessagesSquare,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";

/** §207 — the thirteen primary destinations, in the specified order. */
export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/curriculum", label: "Curriculum", icon: Network },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice Lab", icon: FlaskConical },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/skills", label: "Skills", icon: Target },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/freelance", label: "Freelance", icon: Handshake },
  { href: "/research", label: "Research", icon: Microscope },
  { href: "/mentor", label: "AI Mentor", icon: MessagesSquare },
  { href: "/portfolio", label: "Portfolio", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Shell({
  children,
  userName,
  isAdmin,
  logout,
}: {
  children: React.ReactNode;
  userName: string;
  isAdmin: boolean;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Primary" className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[0.875rem] transition-colors"
            style={
              active
                ? { background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 600 }
                : { color: "var(--ink-2)" }
            }
          >
            <Icon size={16} strokeWidth={1.9} aria-hidden />
            {label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          onClick={() => setOpen(false)}
          className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[0.875rem]"
          style={pathname.startsWith("/admin") ? { background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 600 } : { color: "var(--ink-2)" }}
        >
          <ShieldCheck size={16} strokeWidth={1.9} aria-hidden />
          Admin
        </Link>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[236px_1fr]">
      <header className="flex items-center justify-between border-b border-line bg-[var(--surface-2)] px-4 py-2.5 lg:hidden">
        <span className="text-sm font-semibold">Learning OS</span>
        <button className="btn btn-sm" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav">
          {open ? <X size={16} /> : <Menu size={16} />}
          <span className="sr-only">Menu</span>
        </button>
      </header>

      {open && (
        <div id="mobile-nav" className="border-b border-line bg-[var(--surface-2)] p-3 lg:hidden">
          {nav}
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen flex-col justify-between border-r border-line bg-[var(--surface-2)] p-3 lg:flex">
        <div>
          <div className="px-2.5 py-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Ismaili Harvard</p>
            <p className="text-sm font-semibold tracking-tight">AI Engineering OS</p>
          </div>
          {nav}
        </div>
        <div className="border-t border-line pt-3">
          <p className="truncate px-2.5 text-xs text-ink-3">Signed in as {userName}</p>
          <form action={logout}>
            <button type="submit" className="mt-1.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[0.875rem] text-ink-2 hover:bg-[var(--surface-3)]">
              <LogOut size={16} strokeWidth={1.9} aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <main id="main" className="min-w-0 scroll-thin">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, lede, children }: { title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <div className="border-b border-line bg-[var(--surface-2)] px-5 py-5 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.35rem] font-semibold tracking-tight">{title}</h1>
          {lede && <p className="mt-1 max-w-2xl text-sm text-ink-2">{lede}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8 lg:py-8">{children}</div>;
}
