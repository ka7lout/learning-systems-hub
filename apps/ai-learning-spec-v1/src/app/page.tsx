import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/client";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { ensureReady } from "@/lib/data";
import { ALL_COURSES, ALL_LESSONS, buildAllItems } from "@/db/seed";
import { PROJECTS, SKILLS } from "@/content/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  await ensureReady();

  const counts = {
    courses: ALL_COURSES.length,
    lessons: ALL_LESSONS.length,
    items: buildAllItems().length,
    projects: PROJECTS.length,
    skills: SKILLS.length,
  };

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.25fr_minmax(320px,0.75fr)] lg:items-start lg:py-20">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Ismaili Harvard AI Engineering
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          A learning system for AI engineering — built around evidence, not completion badges.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          The original eight-module curriculum is preserved in full and layered with Harvard-informed academic depth,
          industry engineering practice, security, technical English, career mapping and research work. Every topic sits
          in a prerequisite graph, every claim about an external source carries a verification status, and every skill
          requires demonstrated evidence before it counts.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Courses", counts.courses],
            ["Lessons", counts.lessons],
            ["Practice items", counts.items],
            ["Projects", counts.projects],
            ["Skills", counts.skills],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg border border-line bg-surface p-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            <span className="font-medium text-ink">Honest framing.</span> This is a Harvard-informed self-study
            curriculum. It is not affiliated with Harvard University and completing it earns no Harvard credential.
            Harvard College and Harvard Extension School material are kept in separate, labelled layers, and course
            claims that were not re-verified against an official page during this build are marked as such.
          </p>
          <p>
            <span className="font-medium text-ink">No fabricated progress.</span> Analytics are generated only from
            events you actually produce. When an AI provider is unavailable, the mentor says so instead of inventing an
            answer.
          </p>
          <p>
            <Link href="/sources" className="text-accentink underline underline-offset-4">
              Inspect the source register
            </Link>{" "}
            before signing up if you want to see how claims are tracked.
          </p>
        </div>
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold text-ink">Start studying</h2>
        <p className="mb-4 mt-1 text-xs leading-relaxed text-muted">
          Your account is isolated: progress, attempts, projects, evidence and mentor conversations are scoped to your
          session-derived identity and are never readable by another account.
        </p>
        <AuthForm />
      </Card>
    </div>
  );
}
