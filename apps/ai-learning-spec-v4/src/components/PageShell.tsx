import type { ReactNode } from "react";
import { requireUser, getUserSettings } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export async function PageShell({ path, children }: { path: string; children: ReactNode }) {
  const user = await requireUser();
  const s = await getUserSettings(user.id);
  return (
    <AppShell userName={user.name} learningState={s?.learningState ?? "deep"} currentPath={path}>
      {children}
    </AppShell>
  );
}
