import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/client";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  return (
    <div>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 btn">Skip to content</a>
      <AppNav name={u.name} isAdmin={u.role === "admin"} />
      <main id="main" className="lg:pl-56"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">{children}</div></main>
    </div>
  );
}
