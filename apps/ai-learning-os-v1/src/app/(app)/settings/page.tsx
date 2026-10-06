import { eq } from "drizzle-orm";
import { db } from "@/db";
import { careerRoles, settings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const [[s], roles] = await Promise.all([db.select().from(settings).where(eq(settings.ownerId, user.id)).limit(1), db.select({ slug: careerRoles.slug, title: careerRoles.title }).from(careerRoles)]);
  const initial = s ?? { theme: "system", language: "en", englishMode: "standard", vocabularyAssist: true, englishTraining: false, hintPolicy: "attempt_first", reducedMotion: false, textSize: "normal", readingDensity: "comfortable", targetRoleSlug: null, defaultLearningState: "deep" };
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" lead={`Signed in as ${user.email} (${user.role}).`} />
      <SettingsForm initial={initial} roles={roles} />
    </div>
  );
}
