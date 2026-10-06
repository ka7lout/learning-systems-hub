import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(14,23,38,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-ink">{children}</h2>
      {sub ? <p className="mt-0.5 text-[13.5px] text-ink-soft">{sub}</p> : null}
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  neutral: "bg-surface text-ink-soft border-line",
  navy: "bg-accent-soft text-navy border-transparent",
  good: "bg-good-soft text-good border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  bad: "bg-bad-soft text-bad border-transparent",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof BADGE_STYLES }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium ${BADGE_STYLES[tone]}`}>
      {children}
    </span>
  );
}

export const SOURCE_LABELS: Record<string, { label: string; tone: "neutral" | "navy" | "good" | "warn" | "bad" }> = {
  original: { label: "Original Curriculum", tone: "navy" },
  harvard_college: { label: "Harvard College layer", tone: "good" },
  harvard_extension: { label: "Harvard Extension layer", tone: "good" },
  industry: { label: "Industry Extension", tone: "warn" },
  research: { label: "Research Extension", tone: "neutral" },
};

export const STATUS_LABELS: Record<string, string> = {
  confirmed_current: "Confirmed current",
  confirmed_historical: "Confirmed historical",
  likely_not_verified: "Likely — not verified",
  not_found: "Not found",
  design_decision: "Design decision",
  research_hypothesis: "Research hypothesis",
};

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-card px-6 py-10 text-center">
      <p className="text-[15px] font-medium text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[13.5px] text-ink-soft">{body}</p>
    </div>
  );
}
