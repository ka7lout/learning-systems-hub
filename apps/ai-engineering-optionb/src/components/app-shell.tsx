"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { LoginForm } from "./login-form";

type User = { id: string; email: string; name: string | null; role: string } | null;

export function AppShell({ children, user: initialUser }: { children: ReactNode; user: User }) {
  const [user, setUser] = useState<User>(initialUser);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Re-check on client if no SSR user (e.g., after navigation)
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.user) setUser(data.user);
        });
    }
  }, [initialUser, pathname]);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
    router.push("/");
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex min-h-screen bg-[rgb(var(--background))]">
      <Sidebar userEmail={user.email} userName={user.name || undefined} onSignOut={handleSignOut} />
      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
