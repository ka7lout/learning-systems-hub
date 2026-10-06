import Link from "next/link";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import {
  Boxes,
  BrainCircuit,
  Briefcase,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  Languages,
  LogOut,
  Rotate3d,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "@/app/actions";
import type { SessionUser } from "@/lib/auth";
import { StatePicker } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/curriculum", label: "Curriculum", icon: GraduationCap },
  { href: "/review", label: "Review", icon: Rotate3d },
  { href: "/projects", label: "Projects", icon: Boxes },
  { href: "/skills", label: "Skills", icon: BrainCircuit },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/freelance", label: "Freelance", icon: Handshake },
  { href: "/english", label: "English", icon: Languages },
  { href: "/portfolio", label: "Portfolio", icon: FileCheck2 },
  { href: "/sources", label: "Sources", icon: ShieldCheck },
  { href: "/research", label: "Research", icon: FlaskConical },
  { href: "/settings", label: "Settings", icon: Settings },
];

export async function Shell({
  user,
  children,
  active,
}: {
  user: SessionUser;
  children: ReactNode;
  active: string;
}) {
  const store = await cookies();
  const state = store.get("ihls_state")?.value ?? "deep";

  return (
    <div className="min-h-screen lg:flex">
      <a href="#main" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <header
        className="lg:w-60 lg:shrink-0 lg:min-h-screen"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--line)" }}
      >
        <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
          <Link href="/dashboard" className="block">
            <span className="text-[13px] font-semibold tracking-tight">Ismaili Harvard</span>
            <span className="block text-[11px] muted">AI Engineering Learning OS</span>
          </Link>
        </div>
        <nav className="p-2 flex lg:block gap-1 overflow-x-auto" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon }) => {
            const isActive = active === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] whitespace-nowrap"
                style={
                  isActive
                    ? { background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 500 }
                    : { color: "var(--muted)" }
                }
              >
                <Icon size={15} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 mt-auto hidden lg:block">
          <p className="text-[11px] muted mb-1">{user.name}</p>
          <form action={signOut}>
            <button type="submit" className="btn w-full justify-center">
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex-1 min-w-0">
        <div
          className="px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 justify-between"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs muted">How does studying feel right now?</span>
            <StatePicker current={state} />
          </div>
          <form action={signOut} className="lg:hidden">
            <button type="submit" className="btn">
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </div>
        <main id="main" className="p-5 lg:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-7">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {lead ? <p className="muted text-sm mt-1.5 max-w-3xl leading-relaxed">{lead}</p> : null}
      {children}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="muted text-xs mt-1.5 max-w-md mx-auto leading-relaxed">{body}</p>
    </div>
  );
}
