import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { assessmentItems, courses, lessons, projects, skills, sources } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  const [[c], [l], [i], [p], [s], [src]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(courses),
    db.select({ n: sql<number>`count(*)::int` }).from(lessons),
    db.select({ n: sql<number>`count(*)::int` }).from(assessmentItems),
    db.select({ n: sql<number>`count(*)::int` }).from(projects),
    db.select({ n: sql<number>`count(*)::int` }).from(skills),
    db.select({ n: sql<number>`count(*)::int` }).from(sources),
  ]);

  const stats = [
    ["Courses in the graph", c?.n ?? 0],
    ["Authored lessons", l?.n ?? 0],
    ["Assessment items", i?.n ?? 0],
    ["Catalogued projects", p?.n ?? 0],
    ["Skill nodes", s?.n ?? 0],
    ["Recorded sources", src?.n ?? 0],
  ] as const;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-14 lg:py-20 grid lg:grid-cols-[1.25fr_1fr] gap-12">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase muted mb-3">
            Harvard-informed · self-study · evidence-driven
          </p>
          <h1 className="text-[2rem] lg:text-[2.6rem] font-semibold tracking-tight leading-[1.1]">
            Ismaili Harvard AI&nbsp;Engineering Learning OS
          </h1>
          <p className="muted mt-4 leading-relaxed max-w-xl">
            A complete AI engineering pathway: the original eight-module curriculum preserved item by item,
            layered with Harvard-informed academic depth, industry extensions and a research track — delivered
            through an operating model built on retrieval, spacing, interleaving, transfer, cases, projects and
            adaptive task sizing.
          </p>

          <div className="surface p-4 mt-7">
            <h2 className="text-sm font-medium">What this is not</h2>
            <ul className="mt-2 space-y-1.5 text-[13px] muted leading-relaxed">
              <li>· Not a Harvard degree, Harvard enrolment or Harvard credit. It is a Harvard-mapped self-study pathway.</li>
              <li>· Not a flashcard app. Recall is one of twenty task types; transfer evidence is required for mastery.</li>
              <li>· Not a progress-bar simulator. Completion, competence and evidence are tracked separately.</li>
              <li>· Not a source of invented facts. Unverified course identifiers are labelled as unverified.</li>
            </ul>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-7">
            {stats.map(([label, value]) => (
              <div key={label} className="surface px-3 py-2.5">
                <dt className="text-[11px] muted">{label}</dt>
                <dd className="text-lg font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[11px] muted mt-3">
            Counts are read live from the seeded database, not written by hand.
          </p>
        </div>

        <div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
