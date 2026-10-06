import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { sourceInventory } from "@/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select()
    .from(sourceInventory)
    .orderBy(desc(sourceInventory.processedAt));
  const total = rows.length;
  const byStatus = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Materials library</h1>
        <p className="muted mt-1 text-sm">
          Every item keeps its source. Nothing here is fabricated — unavailable sources are shown as
          unavailable.
        </p>
      </div>

      <section className="surface p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="surface-2 px-3 py-1">Files found: {total}</span>
          {Object.entries(byStatus).map(([s, n]) => (
            <span key={s} className="surface-2 px-3 py-1">
              {s}: {n}
            </span>
          ))}
        </div>
      </section>

      {total === 0 ? (
        <p className="surface-2 p-4 text-sm muted">
          No source files were ingested. The external Google Drive folder supplied in the brief could
          not be accessed from this environment, so no files were processed, failed, or flagged for OCR.
          When the source becomes reachable, ingestion will record each file with its real status here.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-100">{r.filename ?? "(unnamed source)"}</span>
                <span className="rounded bg-[#13243a] px-2 py-0.5 text-[10px] brand">{r.status}</span>
              </div>
              {r.path && <p className="muted text-xs mt-1">Path: {r.path}</p>}
              {r.purpose && <p className="muted text-xs mt-1">{r.purpose}</p>}
              {r.sourceUrl && (
                <a href={r.sourceUrl} className="brand text-xs hover:underline" target="_blank" rel="noreferrer">
                  Open source
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
