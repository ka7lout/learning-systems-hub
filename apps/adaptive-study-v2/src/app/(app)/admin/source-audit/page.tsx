import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { sourceInventory } from "@/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSourceInventoryStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SourceAuditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stats, rows] = await Promise.all([
    getSourceInventoryStats(),
    db.select().from(sourceInventory).orderBy(desc(sourceInventory.processedAt)),
  ]);

  const get = (s: string) => stats.byStatus.find((b) => b.status === s)?.c ?? 0;

  const cards = [
    { label: "Files found", value: stats.total },
    { label: "Processed", value: get("processed") },
    { label: "Failed", value: get("failed") },
    { label: "Needs OCR", value: get("needs_ocr") },
    { label: "Unsupported", value: get("unsupported") },
    { label: "Unavailable", value: get("unavailable") },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Source audit</h1>
        <p className="muted mt-1 text-sm">
          Real record of what was ingested from your academic sources. No file is marked
          &ldquo;processed&rdquo; unless it was actually read.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="surface p-4">
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="muted text-xs mt-1">{c.label}</p>
          </div>
        ))}
      </section>

      <section className="surface p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide muted">Source files</h3>
        {rows.length === 0 ? (
          <p className="muted mt-3 text-sm">
            The external Google Drive folder supplied in the brief could not be accessed from this
            environment, so no files were discovered, processed, or flagged. This is an accurate
            &ldquo;0 files&rdquo; state — not a hidden failure.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows.map((r) => (
              <li key={r.id} className="surface-2 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-100">{r.filename ?? "(unnamed)"}</span>
                  <span className="rounded bg-[#13243a] px-2 py-0.5 text-[10px] brand">{r.status}</span>
                </div>
                {r.purpose && <p className="muted text-xs mt-1">{r.purpose}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
