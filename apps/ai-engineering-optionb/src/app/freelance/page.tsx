import Link from "next/link";
import { db } from "@/db";
import { freelanceServices } from "@/db/schema";
import { HandCoins, MessageSquare, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FreelancePage() {
  const services = await db.select().from(freelanceServices);
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Freelancing</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-2xl">
          Train the non-engineering side of AI work: niche selection, client discovery, scoping, proposals,
          change requests, delivery, and case studies. Simulations are always labeled simulations.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
          Simulations are labeled. The system does not invent real clients or real invoices. When you move to real
          client work, attach real evidence: proposals, contracts, deliverables, and case studies.
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Service catalog</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((s) => (
            <div key={s.id} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-4">
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <div className="text-xs text-[rgb(var(--text-subtle))] uppercase tracking-wider mb-2">{s.niche}</div>
              <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed mb-3">{s.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {(s.skills as string[]).slice(0, 5).map((sk) => (
                  <span key={sk} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[rgb(var(--surface-alt))] text-[rgb(var(--text-muted))]">{sk}</span>
                ))}
              </div>
              <button className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 dark:text-navy-400 hover:underline">
                <MessageSquare className="h-3.5 w-3.5" /> Run simulation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
