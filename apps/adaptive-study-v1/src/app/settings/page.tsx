import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const userSettings = await db.select().from(settings)
    .where(eq(settings.userId, "default-user"))
    .limit(1);

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="md:ml-64 pt-16 md:pt-0">
        <SettingsView initialSettings={userSettings[0] || null} />
      </div>
    </main>
  );
}
