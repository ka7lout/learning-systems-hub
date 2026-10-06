import { AppShell } from "@/components/shell";
import { MentorPanel } from "@/components/client";
import { Card, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getOrCreateThread, getThreadMessages } from "@/lib/data";
import { SPECIALISTS, providerStatus } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function MentorPage() {
  const user = await requirePage();
  const thread = await getOrCreateThread(user.id, null);
  const messages = await getThreadMessages(user.id, thread.id);
  const status = providerStatus();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Mentor council"
        title="AI Mentor"
        description="One lead mentor routes to specialists. The default teaching mode asks for your attempt first and gives the smallest useful hint, because answer-first assistance removes the part of the work that produces learning."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <Card className="p-5">
          <MentorPanel
            specialists={SPECIALISTS.map((s) => ({ key: s.key, label: s.label, description: s.description }))}
            initialMessages={messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              specialist: m.specialist,
              provider: m.provider,
            }))}
            providerConfigured={status.available}
          />
        </Card>

        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="mb-2 text-sm font-semibold text-ink">Provider status</h2>
            {status.available ? (
              <p className="text-sm text-ink">
                Configured provider{status.configured.length > 1 ? "s" : ""}: {status.configured.join(", ")}.
              </p>
            ) : (
              <p className="text-sm text-muted">
                No AI provider is configured. The mentor will return a truthful unavailable state rather than generating
                an answer. Set <code className="text-xs">PUTER_AUTH_TOKEN</code>, <code className="text-xs">OPENAI_API_KEY</code>{" "}
                or <code className="text-xs">ANTHROPIC_API_KEY</code> on the server to enable it.
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              Routing: heavier reasoning uses the pro tier; vocabulary and short coaching use the fast tier.
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 text-sm font-semibold text-ink">Guardrails</h2>
            <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted">
              <li>Attempt required before a full solution in practice mode.</li>
              <li>Retrieved and quoted content is treated as data and can never issue instructions.</li>
              <li>No invented Harvard courses, job requirements, metrics or sources.</li>
              <li>Repeated identical verification requests are redirected to a test instead of re-reassurance.</li>
              <li>Help level is recorded so assisted and independent performance stay separable.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
