"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { col } from "@/lib/db";
import { hashPassword, validatePassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, type Role, type UserDoc } from "@/lib/auth/session";
import { audit, newId } from "@/lib/dal";
import { rateLimit } from "@/lib/api";

const credentials = z.object({
  email: z.string().email("Enter a valid email address.").max(200),
  password: z.string().min(1, "Password is required.").max(400),
  name: z.string().min(1).max(80).optional(),
});

export type AuthState = { error?: string; issues?: string[] } | undefined;

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { error: "Check the form.", issues: parsed.error.issues.map((i) => i.message) };

  const policyError = validatePassword(parsed.data.password);
  if (policyError) return { error: policyError };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit({ key: `register:${ip}`, limit: 5, windowMs: 15 * 60_000 }).ok) {
    return { error: "Too many registration attempts. Try again later." };
  }

  const users = col<UserDoc>("users");
  const existing = await users.findOne({ email: parsed.data.email });
  if (existing) return { error: "An account with that email already exists." };

  // The first account becomes the administrator; later accounts are students (§191).
  const isFirst = (await users.count({})) === 0;
  const roles: Role[] = isFirst ? ["admin", "student"] : ["student"];

  const user: UserDoc = {
    _id: newId("usr"),
    email: parsed.data.email,
    name: parsed.data.name ?? parsed.data.email.split("@")[0],
    passwordHash: await hashPassword(parsed.data.password),
    roles,
    createdAt: new Date().toISOString(),
  };
  await users.insertOne(user);
  await audit({ actorId: user._id, action: "auth.register", outcome: "allow" });
  await createSession(user._id, h.get("user-agent") ?? undefined);
  redirect("/dashboard");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: "Enter your email and password." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit({ key: `login:${ip}`, limit: 10, windowMs: 10 * 60_000 }).ok) {
    return { error: "Too many sign-in attempts. Try again later." };
  }

  const users = col<UserDoc>("users");
  const user = await users.findOne({ email: parsed.data.email });
  // Constant-ish response regardless of whether the account exists.
  const ok = user ? await verifyPassword(parsed.data.password, user.passwordHash) : await verifyPassword(parsed.data.password, "scrypt$131072$8$1$AAAA$AAAA");
  if (!user || !ok) {
    await audit({ actorId: null, action: "auth.login", outcome: "deny", meta: { email_hash: parsed.data.email.length } });
    return { error: "Email or password is incorrect." };
  }

  await users.updateOne({ _id: user._id }, { lastLoginAt: new Date().toISOString() });
  await audit({ actorId: user._id, action: "auth.login", outcome: "allow" });
  await createSession(user._id, h.get("user-agent") ?? undefined);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
