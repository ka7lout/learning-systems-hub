import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, Badge, SOURCE_LABELS } from "@/components/ui";
import { MODULES } from "@/content/curriculum";
import { getProgressMap } from "@/lib/learner";

export default async function CurriculumPage() {
  const user = await requireUser();
  const progress = await getProgressMap(user.id);

  return (
    <PageShell path="/curriculum">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Master Curriculum</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-ink-soft">
        The complete Original Curriculum (Modules 1–8, every topic preserved) organized as a
        prerequisite graph, with additive Harvard-mapped layers labeled by verification status.
        Classification is never deletion: industry tools like Excel, Power BI, Selenium, FastAPI,
        Streamlit, and Docker remain first-class, labeled honestly.
      </p>

      <div className="mt-6 space-y-4">
        {MODULES.map((mod) => {
          const done = mod.lessons.filter((l) => progress.get(l.slug)?.practiceCompletedAt).length;
          const transferred = mod.lessons.filter((l) => progress.get(l.slug)?.transferCompletedAt).length;
          return (
            <Card key={mod.slug}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/curriculum/${mod.slug}`} className="text-[16px] font-semibold text-ink hover:text-navy">
                      {mod.title}
                    </Link>
                    <Badge tone={SOURCE_LABELS[mod.sourceCategory].tone}>
                      {SOURCE_LABELS[mod.sourceCategory].label}
                    </Badge>
                    <Badge>{mod.sessions} sessions</Badge>
                  </div>
                  <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">{mod.summary}</p>
                  {mod.prerequisites.length > 0 && (
                    <p className="mt-1.5 text-[12.5px] text-ink-faint">
                      Prerequisites: {mod.prerequisites.map((p) => MODULES.find((m) => m.slug === p)?.title ?? p).join(" · ")}
                      {mod.parallelWith?.length
                        ? ` — can run in parallel with ${mod.parallelWith.map((p) => MODULES.find((m) => m.slug === p)?.title ?? p).join(", ")}`
                        : ""}
                    </p>
                  )}
                  {mod.prerequisites.length === 0 && mod.parallelWith?.length ? (
                    <p className="mt-1.5 text-[12.5px] text-ink-faint">
                      No prerequisites — can run in parallel with{" "}
                      {mod.parallelWith.map((p) => MODULES.find((m) => m.slug === p)?.title ?? p).join(", ")}.
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right text-[12.5px] text-ink-soft">
                  <p>
                    <span className="font-semibold text-ink">{done}</span> / {mod.lessons.length} recall checkpoints
                  </p>
                  <p>
                    <span className="font-semibold text-ink">{transferred}</span> / {mod.lessons.length} transfer tasks
                  </p>
                  <Link href={`/curriculum/${mod.slug}`} className="mt-1 inline-block font-medium text-accent hover:underline">
                    Open module →
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
