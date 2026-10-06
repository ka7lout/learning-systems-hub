import { requireUser, getSettings } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { SettingsForm } from "@/components/client";

export default async function SettingsPage() {
  const u = await requireUser();
  const { data } = await getSettings(u.id);
  return (
    <>
      <PageHeader title="Settings" lead="Your preferences change how content and the mentor are presented — not what counts as mastery." />
      <div className="card p-5"><SettingsForm data={data} /></div>
      <p className="mt-4 text-xs text-muted">Privacy: your attempts, projects, evidence and mentor conversations are scoped to your account. Mentor requests send only the current unit, your mastery level and recent error types — not your full history. GitHub account linking is not enabled on this deployment; add repository links on each project instead.</p>
    </>
  );
}
