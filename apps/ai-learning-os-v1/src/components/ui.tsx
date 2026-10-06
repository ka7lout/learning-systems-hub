import Link from "next/link";
import type { ReactNode } from "react";
import { MASTERY_LABELS } from "@/lib/engine";

export const SOURCE_LABEL: Record<string, string> = { original: "Original Curriculum", harvard_college: "Harvard College", harvard_extension: "Harvard Extension", industry: "Industry Extension", research: "Research Extension" };
export const STATUS_LABEL: Record<string, string> = { confirmed_current: "Confirmed current", confirmed_historical: "Confirmed historical", likely_not_verified: "Likely — not verified", not_found: "Not found", design_decision: "Design decision", research_hypothesis: "Research hypothesis" };

export function SourceBadge({ s }: { s: string }) {
  const cls = s === "original" ? "!bg-accent-soft !text-accent-strong" : s.startsWith("harvard") ? "!bg-ok-soft !text-ok" : s === "research" ? "!bg-warn-soft !text-warn" : "";
  return <span className={`badge ${cls}`}>{SOURCE_LABEL[s] ?? s}</span>;
}

export function StatusBadge({ s }: { s: string }) {
  const cls = s === "confirmed_current" ? "!bg-ok-soft !text-ok" : s === "likely_not_verified" ? "!bg-warn-soft !text-warn" : s === "not_found" ? "!bg-danger-soft !text-danger" : "";
  return <span className={`badge ${cls}`}>{STATUS_LABEL[s] ?? s}</span>;
}

export function MasteryBadge({ level }: { level: number | undefined }) {
  const l = level ?? 0;
  const cls = l >= 6 ? "!bg-ok-soft !text-ok" : l >= 4 ? "!bg-accent-soft !text-accent-strong" : l >= 1 ? "" : "opacity-70";
  return <span className={`badge ${cls}`} title={`Mastery level L${l}`}>L{l} · {MASTERY_LABELS[l]}</span>;
}

export function PageHeader({ title, lead, action }: { title: string; lead?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {lead && <p className="mt-1 max-w-2xl text-sm text-muted">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, body, href, cta }: { title: string; body: string; href?: string; cta?: string }) {
  return (
    <div className="card p-6 text-center">
      <div className="font-medium">{title}</div>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{body}</p>
      {href && cta && <Link href={href} className="btn btn-primary mt-4">{cta}</Link>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}
