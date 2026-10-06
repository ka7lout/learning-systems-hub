import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { db } from "@/db";
import { laterItems } from "@/db/schema";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await ensureSeeded();
  const later = await db.select().from(laterItems).where(eq(laterItems.ownerId, user.id)).orderBy(laterItems.createdAt);
  return <AppShell user={user} later={later.filter((l) => !l.done).map((l) => ({ id: l.id, text: l.text }))}>{children}</AppShell>;
}
