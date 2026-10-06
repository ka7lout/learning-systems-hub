import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDbCounts, getSourceInventoryStats, safe } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DataHealthPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const connRes = await safe(() => db.execute(sql`select 1`));
  const countsRes = await safe(() => getDbCounts());
  const srcRes = await safe(() => getSourceInventoryStats());

  const connected = connRes.ok;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Data health</h1>
        <p className="muted mt-1 text-sm">
          Live status of the database backing this study OS. All numbers are read directly from the
          database.
        </p>
      </div>

      <section className="surface p-4">
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
          />
          <span className="font-medium">
            {connected ? "DATABASE CONNECTED" : "DATABASE ERROR"}
          </span>
          <span className="muted text-xs">
            (local PostgreSQL via DATABASE_URL — the external Supabase project was not reachable from
            this environment)
          </span>
        </div>
        {!connected && (
          <p className="mt-3 text-sm text-red-300">
            Unable to load database state: {connRes.error}
          </p>
        )}
      </section>

      {countsRes.ok && (
        <section className="surface p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide muted">Table row counts</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(countsRes.data).map(([name, count]) => (
              <div key={name} className="surface-2 p-3">
                <p className="text-lg font-semibold">{count}</p>
                <p className="muted text-xs mt-1">{name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {srcRes.ok && (
        <section className="surface p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide muted">Ingestion</h3>
          <p className="muted mt-2 text-sm">
            Source documents ingested: <b className="text-slate-100">{srcRes.data.total}</b>
          </p>
          <p className="muted mt-1 text-xs">
            Last ingestion: not recorded (no source was reachable in this environment).
          </p>
        </section>
      )}
    </div>
  );
}
