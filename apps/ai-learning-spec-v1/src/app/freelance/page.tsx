import { AppShell } from "@/components/shell";
import { FreelanceSim } from "@/components/client";
import { Card, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getFreelanceScenarios } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function FreelancePage() {
  const user = await requirePage();
  const scenarios = await getFreelanceScenarios();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Freelance engine"
        title="Discovery, scope and acceptance criteria"
        description="Most freelance failures are scoping failures. Every client below is explicitly a simulation; nothing here represents a real client, a real contract or real earnings."
      />

      <div className="space-y-8">
        {scenarios.map((scenario) => (
          <Card key={scenario.key} className="p-5">
            <h2 className="mb-3 text-base font-semibold text-ink">{scenario.title}</h2>
            <FreelanceSim
              scenario={{
                key: scenario.key,
                title: scenario.title,
                clientMessage: scenario.clientMessage,
                requiredQuestions: scenario.requiredQuestions,
                deliverableRubric: scenario.deliverableRubric,
              }}
            />
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
