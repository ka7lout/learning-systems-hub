import { redirect } from "next/navigation";
import { pageSession } from "@/lib/auth/page-session";
import { can } from "@/lib/auth/rbac";
import { col, describeStorage, COLLECTIONS } from "@/lib/db";
import { buildCurriculumGraph, validateGraph, CONTENT_VERSION, ORIGINAL_MODULES, ORIGINAL_TOPIC_COUNT } from "@/content";
import type { AuditLogDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await pageSession();
  if (!can(session, "admin:read")) redirect("/dashboard");

  const graph = buildCurriculumGraph();
  const validation = validateGraph(graph);
  const storage = describeStorage();
  const logs = await col<AuditLogDoc>("audit_logs").find({}, { sort: { at: -1 }, limit: 40 });
  const userCount = await col<{ _id: string }>("users").count({});

  const capabilities = [
    { name: "AI mentor (Puter)", env: "PUTER_AUTH_TOKEN", on: Boolean(process.env.PUTER_AUTH_TOKEN) },
    { name: "MongoDB", env: "MONGODB_URI", on: Boolean(process.env.MONGODB_URI) },
    { name: "GitHub OAuth", env: "GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET", on: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) },
    { name: "Object storage", env: "BLOB_READ_WRITE_TOKEN", on: Boolean(process.env.BLOB_READ_WRITE_TOKEN) },
    { name: "Search provider", env: "SEARCH_API_KEY", on: Boolean(process.env.SEARCH_API_KEY) },
  ];

  const counts = await Promise.all(
    COLLECTIONS.map(async (name) => ({ name, count: await col<{ _id: string }>(name).count({}) })),
  );

  return (
    <>
      <PageHeader title="Admin" lede="Content integrity, configuration truth and the audit trail." >
        <Chip>content v{CONTENT_VERSION}</Chip>
      </PageHeader>
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHead title="Content validation" hint="Re-run live on every page load." />
            <div className="card-pad">
              <p className="text-sm">
                {validation.ok ? (
                  <span style={{ color: "var(--positive)" }}>Graph is valid: acyclic, no dangling references.</span>
                ) : (
                  <span style={{ color: "var(--critical)" }}>Graph has {validation.errors.length} errors.</span>
                )}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {Object.entries(validation.stats).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-line py-1">
                    <dt className="text-ink-2">{k}</dt>
                    <dd className="tabular-nums">{String(v)}</dd>
                  </div>
                ))}
              </dl>
              {validation.errors.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm" style={{ color: "var(--critical)" }}>
                  {validation.errors.map((e) => <li key={e}>{e}</li>)}
                </ul>
              )}
              {validation.warnings.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm" style={{ color: "var(--caution)" }}>
                  {validation.warnings.map((w) => <li key={w}>{w}</li>)}
                </ul>
              )}
            </div>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHead title="Configuration" hint="What is actually configured on this deployment." />
              <ul className="divide-y divide-[var(--line)]">
                {capabilities.map((c) => (
                  <li key={c.name} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <div>
                      <p className="text-sm">{c.name}</p>
                      <p className="text-xs text-ink-3">{c.env}</p>
                    </div>
                    <Chip tone={c.on ? "positive" : "caution"}>{c.on ? "configured" : "not configured"}</Chip>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line px-5 py-3 text-xs text-ink-3">
                Storage in use: {storage.label}. Secrets are read from the environment only; no value is ever rendered here.
              </p>
            </Card>

            <Card>
              <CardHead title="Original curriculum integrity" hint="§37 — nothing deleted." />
              <div className="card-pad text-sm text-ink-2">
                <p>
                  {ORIGINAL_MODULES.length} modules · {ORIGINAL_MODULES.reduce((n, m) => n + m.sessions.length, 0)} sessions ·{" "}
                  <strong className="text-ink">{ORIGINAL_TOPIC_COUNT}</strong> topics declared.
                </p>
                <p className="mt-1">
                  Topics present in the built graph: <strong className="text-ink">{validation.stats.topics as number}</strong> across all
                  sources, of which the original modules must contribute {ORIGINAL_TOPIC_COUNT}.
                </p>
                <p className="mt-1 text-xs text-ink-3">The seed script refuses to run if this check fails.</p>
              </div>
            </Card>
          </div>
        </div>

        <h2 className="mt-8 text-sm font-semibold tracking-tight">Collections</h2>
        <Card className="mt-3">
          <ul className="grid gap-x-6 px-5 py-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {counts.map((c) => (
              <li key={c.name} className="flex justify-between border-b border-line py-1">
                <span className="text-ink-2">{c.name}</span>
                <span className="tabular-nums">{c.count}</span>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-3">{userCount} registered account{userCount === 1 ? "" : "s"}.</p>
        </Card>

        <h2 className="mt-8 text-sm font-semibold tracking-tight">Audit log</h2>
        <p className="mt-1 text-sm text-ink-2">Actions only — never answer content, never secrets.</p>
        <Card className="mt-3">
          {logs.length === 0 ? (
            <p className="card-pad text-sm text-ink-3">No entries yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {logs.map((l) => (
                <li key={l._id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2 text-sm">
                  <span className="font-mono text-xs text-ink-3">{new Date(l.at).toLocaleString()}</span>
                  <span className="flex-1 px-3">{l.action}</span>
                  <Chip tone={l.outcome === "allow" ? "positive" : l.outcome === "deny" ? "caution" : "critical"}>{l.outcome}</Chip>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </PageBody>
    </>
  );
}
