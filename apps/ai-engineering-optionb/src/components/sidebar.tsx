"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FlaskConical,
  FolderKanban,
  RotateCcw,
  BarChart3,
  Briefcase,
  HandCoins,
  Microscope,
  Bot,
  UserCircle,
  Settings,
  Library,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, section: "main" },
  { href: "/curriculum", label: "Curriculum", icon: Library, section: "main" },
  { href: "/learn", label: "Learn", icon: BookOpen, section: "main" },
  { href: "/practice", label: "Practice Lab", icon: FlaskConical, section: "main" },
  { href: "/projects", label: "Projects", icon: FolderKanban, section: "main" },
  { href: "/review", label: "Review", icon: RotateCcw, section: "main" },
  { href: "/skills", label: "Skills", icon: BarChart3, section: "main" },
  { href: "/career", label: "Career", icon: Briefcase, section: "growth" },
  { href: "/freelance", label: "Freelance", icon: HandCoins, section: "growth" },
  { href: "/research", label: "Research", icon: Microscope, section: "growth" },
  { href: "/mentor", label: "AI Mentor", icon: Bot, section: "growth" },
  { href: "/portfolio", label: "Portfolio", icon: UserCircle, section: "you" },
  { href: "/settings", label: "Settings", icon: Settings, section: "you" },
];

export function Sidebar({ userEmail, userName, onSignOut }: { userEmail?: string; userName?: string; onSignOut?: () => void }) {
  const pathname = usePathname();
  const mainNav = nav.filter((n) => n.section === "main");
  const growthNav = nav.filter((n) => n.section === "growth");
  const youNav = nav.filter((n) => n.section === "you");

  return (
    <aside className="h-screen w-64 shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))] flex flex-col sticky top-0">
      <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border))]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-navy-600 dark:bg-navy-500 flex items-center justify-center shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-[15px] tracking-tight">IH AI Engineering</span>
            <span className="text-[11px] text-[rgb(var(--text-subtle))]">Harvard-informed · IHLS</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <NavGroup label="Learning" items={mainNav} pathname={pathname} />
        <NavGroup label="Growth" items={growthNav} pathname={pathname} />
        <NavGroup label="You" items={youNav} pathname={pathname} />
      </nav>
      {userEmail && (
        <div className="border-t border-[rgb(var(--border))] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-navy-100 dark:bg-navy-900 flex items-center justify-center text-navy-700 dark:text-navy-300 font-semibold text-sm">
              {(userName || userEmail)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="text-sm font-medium truncate">{userName || "Student"}</div>
              <div className="text-xs text-[rgb(var(--text-subtle))] truncate">{userEmail}</div>
            </div>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full text-xs px-3 py-1.5 rounded-md border border-[rgb(var(--border))] hover:bg-[rgb(var(--surface-alt))] text-[rgb(var(--text-muted))] transition"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

function NavGroup({ label, items, pathname }: { label: string; items: typeof nav; pathname: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--text-subtle))] px-2 mb-2">{label}</div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-navy-50 dark:bg-navy-950/60 text-navy-700 dark:text-navy-200 font-medium"
                  : "text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-alt))] hover:text-[rgb(var(--text))]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
