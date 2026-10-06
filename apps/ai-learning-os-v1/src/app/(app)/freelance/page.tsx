import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { activityAttempts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { SimulationCard } from "@/components/SimulationCard";
import { SIMULATIONS } from "@/content/catalog";

const PIPELINE = ["Niche selection", "Service selection", "Value proposition", "Client discovery", "Requirements", "Scope", "Acceptance criteria", "Estimate", "Proposal", "Negotiation", "Change request", "Implementation", "Revision", "Delivery", "Maintenance", "Support", "Case study creation"];

export default async function FreelancePage() {
  const user = await requireUser();
  const attempts = await db.select({ key: activityAttempts.activityKey, c: sql<number>`count(*)::int` }).from(activityAttempts).where(eq(activityAttempts.ownerId, user.id)).groupBy(activityAttempts.activityKey);
  const counts = new Map(attempts.map((a) => [a.key, a.c]));
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Freelance" lead="Simulated clients only, always labelled as simulation. The skill is converting “I need an AI chatbot” into users, goals, data, integrations, security, privacy, volume, latency, evaluation, deployment, budget and maintenance." />
      <section className="card p-5"><h2 className="text-sm font-semibold">Pipeline you are training</h2><div className="mt-2 flex flex-wrap gap-1.5">{PIPELINE.map((p) => <span key={p} className="badge">{p}</span>)}</div></section>
      <h2 className="mt-6 mb-2 text-sm font-semibold">Simulations</h2>
      <ul className="space-y-2">{SIMULATIONS.filter((s) => s.type === "freelance_discovery").map((s) => <SimulationCard key={s.key} sim={s} attempts={counts.get(s.key) ?? 0} />)}</ul>
      <p className="mt-6 text-xs text-muted">No real clients, earnings or reviews are shown because none exist in this account. Case studies are created from your completed projects on the Portfolio page.</p>
    </div>
  );
}
