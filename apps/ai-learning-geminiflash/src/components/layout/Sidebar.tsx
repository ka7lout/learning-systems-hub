"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  BookOpen,
  Code2,
  FolderGit2,
  RotateCw,
  Cpu,
  Briefcase,
  TrendingUp,
  FlaskConical,
  BrainCircuit,
  Award,
  FileCheck2,
  Settings,
  ChevronRight
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/curriculum", label: "Curriculum Graph", icon: Network },
    { href: "/practice", label: "Practice Lab", icon: Code2 },
    { href: "/projects", label: "Project Catalog (21+)", icon: FolderGit2, badge: "22" },
    { href: "/review", label: "Spaced Review", icon: RotateCw, badge: "Due" },
    { href: "/skills", label: "Skills Matrix", icon: Cpu },
    { href: "/career", label: "Career & CV Engine", icon: Briefcase },
    { href: "/freelance", label: "Freelance Hub", icon: TrendingUp },
    { href: "/research", label: "Research Lab", icon: FlaskConical },
    { href: "/council", label: "Mentor Council", icon: BrainCircuit },
    { href: "/portfolio", label: "Portfolio Evidence", icon: Award },
    { href: "/dossiers", label: "Research Dossiers", icon: FileCheck2 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950/80 border-r border-slate-800/80 hidden md:flex flex-col text-slate-300">
      <div className="p-4 flex-1 overflow-y-auto space-y-1">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
          OPERATING SYSTEM
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"} transition-colors`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : item.badge === "Due"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile Snippet */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white">Ismaili Scholar</div>
            <div className="text-[11px] text-slate-500 font-mono">Role: AI Engineer Track</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
        </div>
      </div>
    </aside>
  );
}
