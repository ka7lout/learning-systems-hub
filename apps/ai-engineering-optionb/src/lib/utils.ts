import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  return d.toLocaleDateString();
}

export function masteryLabel(level: number): string {
  const labels = [
    "Not yet encountered",
    "Recognize",
    "Recall",
    "Explain",
    "Use",
    "Choose when to use",
    "Transfer",
    "Integrate",
    "Build",
    "Teach",
  ];
  return labels[Math.min(level, labels.length - 1)];
}

export function masteryColor(level: number): string {
  if (level <= 1) return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
  if (level <= 3) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  if (level <= 5) return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
  if (level <= 7) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
  return "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300";
}

export function projectLevelLabel(level: number): string {
  const labels = [
    "", "Python", "Data Analysis", "SQL/Pipeline", "Classical ML",
    "Deep Learning", "CV/NLP", "LLM/RAG", "Agents", "Production AI", "Research"
  ];
  return labels[level] || `Level ${level}`;
}

export function sourceCategoryColor(cat: string): string {
  switch (cat) {
    case "Original Curriculum": return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "Harvard College": return "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
    case "Harvard Extension": return "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200 border-red-200 dark:border-red-900";
    case "Industry Extension": return "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "Research Extension": return "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    default: return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
}
