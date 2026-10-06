import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction, setLearningStateAction } from "@/app/actions";
import { LEARNING_STATES, type LearningState } from "@/content/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/review", label: "Review" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/career", label: "Career" },
  { href: "/mentor", label: "AI Mentor" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  children,
  userName,
  learningState,
  currentPath,
}: {
  children: ReactNode;
  userName: string;
  learningState: string;
  currentPath: string;
}) {
  const state = (["deep", "drift", "fog", "overload"].includes(learningState)
    ? learningState
    : "deep") as LearningState;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/dashboard" className="shrink-0 text-sm font-semibold tracking-wide">
            IH · AI Engineering Learning OS
          </Link>
          <nav aria-label="Primary" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto md:order-2 md:w-auto md:flex-1">
            {NAV.map((item) => {
              const active = currentPath.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                    active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="order-2 ml-auto flex items-center gap-3 md:order-3">
            <span className="hidden text-[13px] text-white/70 sm:inline">{userName}</span>
            <form action={logoutAction}>
              <button className="rounded-md border border-white/25 px-2.5 py-1 text-[13px] text-white/85 hover:bg-white/10">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Learning-state bar: human language, no internal scores (spec §146) */}
      <div className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2">
          <span className="text-[13px] text-ink-soft">How does studying feel right now?</span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(LEARNING_STATES) as LearningState[]).map((key) => (
              <form key={key} action={setLearningStateAction}>
                <input type="hidden" name="learningState" value={key} />
                <input type="hidden" name="path" value={currentPath} />
                <button
                  className={`rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors ${
                    state === key
                      ? "border-accent bg-accent-soft text-navy"
                      : "border-line bg-card text-ink-soft hover:border-ink-faint"
                  }`}
                  aria-pressed={state === key}
                >
                  {LEARNING_STATES[key].label}
                </button>
              </form>
            ))}
          </div>
          <p className="w-full text-[12px] text-ink-faint md:ml-auto md:w-auto md:max-w-md md:truncate" title={LEARNING_STATES[state].guidance}>
            {LEARNING_STATES[state].guidance}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-line py-6">
        <p className="mx-auto max-w-6xl px-4 text-[12px] leading-relaxed text-ink-faint">
          Harvard-informed, Harvard-mapped <em>self-study</em> curriculum. This platform is not
          affiliated with, endorsed by, or a credential from Harvard University. Mastery claims
          here are generated only from your own recorded evidence.
        </p>
      </footer>
    </div>
  );
}
