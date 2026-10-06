import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { freelanceRuns, freelanceSimulations } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { PageHeader, Shell } from "@/components/shell";
import { FreelanceForm } from "@/components/freelance-form";
import { Disclosure } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function FreelancePage() {
  const user = await getUser();
  if (!user) redirect("/");

  const [sims, runs] = await Promise.all([
    db.select().from(freelanceSimulations),
    db
      .select()
      .from(freelanceRuns)
      .where(eq(freelanceRuns.userId, user.id))
      .orderBy(desc(freelanceRuns.createdAt))
      .limit(10),
  ]);

  const runsBySim = new Map<string, typeof runs>();
  for (const r of runs) {
    const list = runsBySim.get(r.simulationId) ?? [];
    list.push(r);
    runsBySim.set(r.simulationId, list);
  }

  return (
    <Shell user={user} active="/freelance">
      <PageHeader
        title="Freelancing practice"
        lead="Most freelance failures are scope failures. These are clearly labelled simulations — there is no real client, no real money and no fabricated review. The measured outcome is discovery coverage before you quote."
      />

      <div className="space-y-5">
        {sims.map((sim) => {
          const myRuns = runsBySim.get(sim.id) ?? [];
          return (
            <section key={sim.id} className="surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">{sim.title}</h2>
                <span className="tag tag-warn">SIMULATION</span>
                <span className="tag">{sim.stage.replace(/_/g, " ")}</span>
              </div>
              <p className="prose-block text-[13px] mt-2">{sim.clientBrief}</p>

              <FreelanceForm
                simulationId={sim.id}
                requiredQuestions={sim.requiredQuestions}
                deliverables={sim.deliverables}
              />

              {myRuns.length > 0 ? (
                <div className="mt-4">
                  <Disclosure summary={`Your attempts (${myRuns.length}) and the hidden constraints`}>
                    <ul className="text-xs space-y-2">
                      {myRuns.map((r) => (
                        <li key={r.id}>
                          <span className={r.coverage >= 0.75 ? "tag tag-ok" : "tag tag-warn"}>
                            coverage {(r.coverage * 100).toFixed(0)}%
                          </span>{" "}
                          <span className="muted">{new Date(r.createdAt).toLocaleString()}</span>
                          <p className="prose-block text-[12px] mt-1 whitespace-pre-wrap">{r.scopeDraft}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <p className="text-xs font-medium">
                        What the client did not tell you (revealed after your attempt)
                      </p>
                      <ul className="text-xs muted mt-1 space-y-1">
                        {sim.hiddenConstraints.map((c) => (
                          <li key={c}>· {c}</li>
                        ))}
                      </ul>
                    </div>
                  </Disclosure>
                </div>
              ) : (
                <p className="text-[11px] muted mt-3">
                  The hidden constraints unlock after your first attempt — reading them first would remove the
                  entire learning value of discovery.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
