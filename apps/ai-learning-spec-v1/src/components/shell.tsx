import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookOpen,
  Briefcase,
  Compass,
  FlaskConical,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  Languages,
  Library,
  MessageSquare,
  RotateCcw,
  Settings,
  Target,
} from "lucide-react";
import { SignOutButton, ThemeToggle } from "@/components/client";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/curriculum", label: "Curriculum", icon: Compass },
  { href: "/practice", label: "Practice Lab", icon: FlaskConical },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/skills", label: "Skills", icon: Target },
  { href: "/career", label: "Career", icon: GraduationCap },
  { href: "/freelance", label: "Freelance", icon: Handshake },
  { href: "/english", label: "English", icon: Languages },
  { href: "/mentor", label: "AI Mentor", icon: MessageSquare },
  { href: "/portfolio", label: "Portfolio", icon: BookOpen },
  { href: "/sources", label: "Sources", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-line bg-surface lg:min-h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <Link href="/dashboard" className="block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Ismaili Harvard</p>
            <p className="text-sm font-semibold leading-tight text-ink">AI Engineering Learning OS</p>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:overflow-visible lg:pb-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-surfacemuted hover:text-ink"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-line px-4 py-3 lg:block">
          <p className="truncate text-sm font-medium text-ink">{user.name}</p>
          <p className="mb-2 truncate text-xs text-muted">{user.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 px-4 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
