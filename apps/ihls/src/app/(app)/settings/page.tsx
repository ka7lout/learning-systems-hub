import { pageSession } from "@/lib/auth/page-session";
import { getSettings, owned, type StudyEventDoc, type SubmissionDoc } from "@/lib/dal";
import { buildCurriculumGraph } from "@/content";
import { describeStorage } from "@/lib/db";
import { permissionsFor } from "@/lib/auth/rbac";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip } from "@/components/ui";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await pageSession();
  const settings = await getSettings(session);
  const graph = buildCurriculumGraph();
  const storage = describeStorage();
  const submissions = await owned<SubmissionDoc>(session, "submissions").count({});
  const events = await owned<StudyEventDoc>(session, "study_events").count({});
  const permissions = [...permissionsFor(session.roles)];

  return (
    <>
      <PageHeader title="Settings" lede="Preferences, your account, and exactly what this deployment stores." />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <SettingsForm
            initial={{
              theme: settings.theme,
              language: settings.language,
              englishMode: settings.englishMode,
              vocabularyAssist: settings.vocabularyAssist,
              englishTraining: settings.englishTraining,
              reducedMotion: settings.reducedMotion,
              textSize: settings.textSize,
              readingDensity: settings.readingDensity,
              hintPolicy: settings.hintPolicy,
              careerTargets: settings.careerTargets,
              notifications: settings.notifications,
            }}
            roles={graph.roles.map((r) => ({ id: r.id, title: `${r.title} — ${r.referenceEmployer}` }))}
          />

          <div className="space-y-5">
            <Card>
              <CardHead title="Account" />
              <div className="card-pad space-y-1.5 text-sm">
                <p><span className="text-ink-3">Name:</span> {session.name}</p>
                <p><span className="text-ink-3">Email:</span> {session.email}</p>
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="text-ink-3">Roles:</span>
                  {session.roles.map((r) => <Chip key={r}>{r.replace(/_/g, " ")}</Chip>)}
                </p>
                <details className="pt-1">
                  <summary className="cursor-pointer text-xs text-ink-3">{permissions.length} permissions</summary>
                  <ul className="mt-1 list-disc pl-4 text-xs text-ink-2">
                    {permissions.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </details>
              </div>
            </Card>

            <Card>
              <CardHead title="Your data" hint="Everything below is scoped to your account by the server." />
              <div className="card-pad space-y-1.5 text-sm text-ink-2">
                <p>{submissions} recorded attempts · {events} study events.</p>
                <p>
                  Stored in <strong className="text-ink">{storage.label}</strong>.
                  {storage.kind === "file"
                    ? " This deployment has no MongoDB connection string configured, so data is written to a local JSON store. It persists, but it is not the production database."
                    : " MongoDB is configured for this deployment."}
                </p>
                <p className="text-xs text-ink-3">
                  No student can read another student&rsquo;s records: every query is scoped with an owner id derived from your session
                  cookie, never from anything the browser sends.
                </p>
              </div>
            </Card>

            <Card>
              <CardHead title="Accessibility" />
              <ul className="list-disc space-y-1 px-9 py-4 text-sm text-ink-2">
                <li>Full keyboard navigation with a visible focus ring, and a skip link on every page.</li>
                <li>Motion respects both this setting and your operating system&rsquo;s reduced-motion preference.</li>
                <li>Colour is never the only signal — status is always written out as well.</li>
                <li>Body text uses the system font stack at a size you control.</li>
              </ul>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
