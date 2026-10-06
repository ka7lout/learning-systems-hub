import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { ensureReady } from "@/lib/data";

export async function requirePage(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  await ensureReady();
  return user;
}
