"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ToolsProvider,
  FocusTimerButton,
  ParkingLotButton,
  ScratchpadButton,
} from "./StudyTools";
import { signOutAction } from "@/lib/actions";

type User = { id: string; email: string; displayName: string | null };
type Stats = { xp: number; level: number; streak: number; reviewDue: number };

const NAV = [
  { href: "/", label: "Today", icon: "◉" },
  { href: "/courses", label: "Courses", icon: "▤" },
  { href: "/practice", label: "Practice", icon: "✦" },
  { href: "/review", label: "Review", icon: "↻" },
  { href: "/planner", label: "Plan", icon: "☰" },
  { href: "/progress", label: "Progress", icon: "◈" },
  { href: "/materials", label: "Materials", icon: "❒" },
  { href: "/mistakes", label: "Mistakes", icon: "!" },
  { href: "/notes", label: "Notes", icon: "✎" },
  { href: "/admin/source-audit", label: "Source audit", icon: "❖" },
  { href: "/admin/data-health", label: "Data health", icon: "⚙" },
];

const MOBILE_NAV = [
  { href: "/", label: "Today" },
  { href: "/courses", label: "Courses" },
  { href: "/practice", label: "Practice" },
  { href: "/review", label: "Review" },
  { href: "/planner", label: "Plan" },
];

export default function Shell({
  user,
  stats,
  children,
}: {
  user: User;
  stats: Stats;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <ToolsProvider>
      <div className="flex min-h-screen">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-[#1a2238] bg-[#0c1222] p-4 lg:flex">
          <div className="px-2 pb-4">
            <p className="text-xs uppercase tracking-[0.18em] brand">IUG Study OS</p>
            <p className="mt-1 text-xs muted">Adaptive Learning</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive(n.href)
                    ? "bg-[#1a2238] text-white"
                    : "text-slate-300 hover:bg-[#141b30]"
                }`}
              >
                <span className="w-4 text-center text-brand">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="pt-2">
            <button className="btn btn-ghost w-full text-sm">Sign out</button>
          </form>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#1a2238] bg-[#0b1020]/90 px-4 py-3 backdrop-blur">
            <Link href="/" className="font-semibold lg:hidden">
              IUG <span className="brand">Study OS</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <span className="surface-2 px-3 py-1 text-xs" title="Experience level">
                Lv {stats.level}
              </span>
              <span className="surface-2 px-3 py-1 text-xs" title="Total XP from real activity">
                {stats.xp} XP
              </span>
              <span className="surface-2 px-3 py-1 text-xs" title="Consecutive study days">
                🔥 {stats.streak}d
              </span>
              {stats.reviewDue > 0 && (
                <span className="surface-2 px-3 py-1 text-xs brand">
                  {stats.reviewDue} review{stats.reviewDue > 1 ? "s" : ""} due
                </span>
              )}
              <ParkingLotButton />
              <FocusTimerButton />
              <ScratchpadButton />
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 lg:pb-6">
            {children}
          </main>
        </div>

        {/* Bottom nav (mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-[#1a2238] bg-[#0c1222] lg:hidden">
          {MOBILE_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                isActive(n.href) ? "brand" : "text-slate-400"
              }`}
            >
              <span className="text-base">{n.href === "/" ? "◉" : n.href === "/courses" ? "▤" : n.href === "/practice" ? "✦" : n.href === "/review" ? "↻" : "☰"}</span>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </ToolsProvider>
  );
}
