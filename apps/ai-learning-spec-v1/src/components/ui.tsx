import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "li";
}) {
  return (
    <Tag className={`rounded-lg border border-line bg-surface ${className}`}>{children}</Tag>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const TONES: Record<string, string> = {
  neutral: "border-line bg-surfacemuted text-muted",
  accent: "border-transparent bg-accentsoft text-accentink",
  good: "border-transparent bg-accentsoft text-good",
  warn: "border-transparent bg-accentsoft text-warn",
  bad: "border-transparent bg-accentsoft text-bad",
};

export function Badge({
  children,
  tone = "neutral",
  title,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES | string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${TONES[tone] ?? TONES.neutral}`}
    >
      {children}
    </span>
  );
}

export function SourceBadge({ status }: { status: string }) {
  const map: Record<string, { tone: string; label: string; title: string }> = {
    confirmed_current: { tone: "good", label: "verified current", title: "Checked against a primary source during this build." },
    confirmed_historical: { tone: "warn", label: "historical", title: "Confirmed, but from a past term or archived page." },
    likely_not_verified: { tone: "warn", label: "not re-verified", title: "Plausible but NOT re-checked against the official source in this build." },
    not_found: { tone: "bad", label: "not found", title: "No supporting primary source was found." },
    design_decision: { tone: "neutral", label: "design decision", title: "An internal instructional design decision, not an external claim." },
    research_hypothesis: { tone: "neutral", label: "hypothesis", title: "A testable hypothesis, not an established finding." },
  };
  const entry = map[status] ?? map.likely_not_verified;
  return (
    <Badge tone={entry.tone} title={entry.title}>
      {entry.label}
    </Badge>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-linestrong bg-surface p-8 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-md border border-line bg-surfacemuted px-3 py-1.5 text-sm font-medium text-ink hover:border-linestrong"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-snug text-muted">{hint}</p> : null}
    </div>
  );
}

export function Bar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surfacemuted">
        <div className="h-full rounded-full bg-accentink" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted">{label ?? `${pct}%`}</span>
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="prose-block text-sm leading-relaxed text-ink">{children}</div>;
}

export function BodyText({ text }: { text: string }) {
  const segments = text.split("\n\n");
  return (
    <>
      {segments.map((segment, i) => {
        const isCode = segment.split("\n").every((line) => line.startsWith("    ") || line.trim() === "");
        if (isCode) {
          return (
            <pre
              key={i}
              className="my-3 overflow-x-auto rounded-md border border-line bg-surfacemuted p-3 text-[12.5px] leading-relaxed text-ink"
            >
              <code>{segment.replace(/^ {4}/gm, "")}</code>
            </pre>
          );
        }
        return (
          <p key={i} className="mb-3 text-sm leading-relaxed text-ink last:mb-0">
            {segment}
          </p>
        );
      })}
    </>
  );
}
