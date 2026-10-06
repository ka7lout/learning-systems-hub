import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHead({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-3">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-ink-3">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "positive" | "caution" | "critical" }) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: {},
    accent: { background: "var(--accent-soft)", borderColor: "var(--accent-soft)", color: "var(--accent)" },
    positive: { color: "var(--positive)", borderColor: "var(--positive)" },
    caution: { color: "var(--caution)", borderColor: "var(--caution)" },
    critical: { color: "var(--critical)", borderColor: "var(--critical)" },
  };
  return (
    <span className="chip" style={styles[tone]}>
      {children}
    </span>
  );
}

const VERIFICATION_TONE: Record<string, "positive" | "caution" | "critical" | "neutral" | "accent"> = {
  confirmed_current: "positive",
  confirmed_historical: "neutral",
  likely_not_verified: "caution",
  not_found: "critical",
  design_decision: "accent",
  research_hypothesis: "accent",
};

const VERIFICATION_LABEL: Record<string, string> = {
  confirmed_current: "Confirmed current",
  confirmed_historical: "Confirmed historical",
  likely_not_verified: "Not verified",
  not_found: "Not found",
  design_decision: "Design decision",
  research_hypothesis: "Research hypothesis",
};

export function VerificationChip({ status }: { status: string }) {
  return <Chip tone={VERIFICATION_TONE[status] ?? "neutral"}>{VERIFICATION_LABEL[status] ?? status}</Chip>;
}

const MASTERY_TONE: Record<string, "neutral" | "caution" | "accent" | "positive"> = {
  unknown: "neutral",
  exposed: "neutral",
  developing: "caution",
  competent: "accent",
  independent: "positive",
};

const MASTERY_LABEL: Record<string, string> = {
  unknown: "Not started",
  exposed: "Content seen",
  developing: "Developing",
  competent: "Competent",
  independent: "Independently demonstrated",
};

export function MasteryChip({ level }: { level: string }) {
  return <Chip tone={MASTERY_TONE[level] ?? "neutral"}>{MASTERY_LABEL[level] ?? level}</Chip>;
}

export function SourceCategoryChip({ category }: { category: string }) {
  const tone = category === "Original Curriculum" ? "accent" : category.startsWith("Harvard") ? "neutral" : "neutral";
  return <Chip tone={tone}>{category}</Chip>;
}

/**
 * §216 — truthful empty states. Every one says what is missing and what action
 * would fill it. None of them imply hidden data or fake progress.
 */
export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-3">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, body, retry }: { title: string; body: string; retry?: React.ReactNode }) {
  return (
    <div role="alert" className="rounded border px-4 py-3 text-sm" style={{ borderColor: "var(--critical)", color: "var(--critical)" }}>
      <p className="font-medium">{title}</p>
      <p className="mt-0.5 opacity-90">{body}</p>
      {retry && <div className="mt-2">{retry}</div>}
    </div>
  );
}

export function Meter({ value, max = 1, label }: { value: number; max?: number; label?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div>
      {label && <div className="mb-1 flex justify-between text-xs text-ink-3"><span>{label}</span><span>{Math.round(pct)}%</span></div>}
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
      </div>
    </div>
  );
}

/**
 * Minimal, dependency-free renderer for authored lesson bodies.
 * Supports: four-space code blocks, pipe tables, bullet lists, **bold**, `code`.
 * Deliberately small — the content is the product, not the markdown engine.
 */
export function Prose({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const inline = (s: string): React.ReactNode[] => {
    const out: React.ReactNode[] = [];
    const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) {
      if (m.index > last) out.push(s.slice(last, m.index));
      const token = m[0];
      if (token.startsWith("**")) out.push(<strong key={`b${key++}`}>{token.slice(2, -2)}</strong>);
      else
        out.push(
          <code key={`c${key++}`} className="rounded px-1 py-0.5 text-[0.85em]" style={{ background: "var(--surface-3)" }}>
            {token.slice(1, -1)}
          </code>,
        );
      last = m.index + token.length;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^ {4}/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && (/^ {4}/.test(lines[i]) || !lines[i].trim())) {
        if (!lines[i].trim() && !/^ {4}/.test(lines[i + 1] ?? "")) break;
        buf.push(lines[i].replace(/^ {4}/, ""));
        i++;
      }
      nodes.push(<pre key={key++}><code>{buf.join("\n").replace(/\n+$/, "")}</code></pre>);
      continue;
    }
    if (line.trimStart().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^-{2,}$/.test(c) || c === "")) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      nodes.push(
        <table key={key++}>
          <thead><tr>{head.map((h, n) => <th key={n}>{inline(h)}</th>)}</tr></thead>
          <tbody>{body.map((r, n) => <tr key={n}>{r.map((c, m2) => <td key={m2}>{inline(c)}</td>)}</tr>)}</tbody>
        </table>,
      );
      continue;
    }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
        i++;
      }
      const List = ordered ? "ol" : "ul";
      nodes.push(
        React.createElement(
          List,
          { key: key++, className: `mb-3 space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"}` },
          items.map((it, n) => <li key={n}>{inline(it)}</li>),
        ),
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^ {4}/.test(lines[i]) && !lines[i].trimStart().startsWith("|") && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    nodes.push(<p key={key++}>{inline(para.join(" "))}</p>);
  }

  return <div className="prose-lesson">{nodes}</div>;
}
