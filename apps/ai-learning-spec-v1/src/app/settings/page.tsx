import { AppShell } from "@/components/shell";
import { SettingsForm } from "@/components/client";
import { Card, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getRoles } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requirePage();
  const roles = await getRoles();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Settings"
        title="Study, language and privacy preferences"
        description="Language and scaffolding settings change how content is presented. They never change what counts as evidence."
      />

      <Card className="mb-6 p-5">
        <SettingsForm
          settings={(user.settings ?? {}) as Record<string, unknown>}
          roles={roles.map((r) => ({ key: r.key, title: r.title }))}
        />
      </Card>

      <Card className="p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Your data</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
          <li>Account identity is derived from a server-side session; the client never supplies its own user id.</li>
          <li>
            Attempts, projects, evidence, English activity and mentor conversations are scoped to your account and are
            not readable by other accounts.
          </li>
          <li>Mentor requests send only the current curriculum node, your recent attempt outcomes and your settings.</li>
          <li>Theme preference is stored locally in your browser, not on the server.</li>
        </ul>
      </Card>
    </AppShell>
  );
}
