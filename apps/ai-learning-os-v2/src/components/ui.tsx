import Link from "next/link";

export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{lead && <p className="mt-1 max-w-2xl text-sm text-muted">{lead}</p>}</div>
      {children}
    </header>
  );
}
export function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between gap-2"><h2 className="text-base font-semibold">{title}</h2>{aside}</div>
      {children}
    </section>
  );
}
export function Empty({ children, action }: { children: React.ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-lg border border-dashed border-line p-5 text-sm text-muted">
      {children}
      {action && <div className="mt-3"><Link className="btn" href={action.href}>{action.label}</Link></div>}
    </div>
  );
}
const STATUS_STYLE: Record<string, string> = { confirmed_current: "text-ok", confirmed_historical: "text-accent", likely_not_verified: "text-warn", not_found: "text-bad", design_decision: "text-muted", research_hypothesis: "text-muted" };
export function Status({ s }: { s: string }) {
  return <span className={`chip ${STATUS_STYLE[s] ?? ""}`}>{s.replace(/_/g, " ")}</span>;
}
export function Bar({ value, label }: { value: number; label: string }) {
  return (
    <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={label} className="h-1.5 w-full rounded-full bg-sunken">
      <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
    </div>
  );
}
