import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const current = await getCurrentSession();
  if (!current?.user?.id) return null;
  return { id: current.user.id, name: current.user.name, email: current.user.email };
}
