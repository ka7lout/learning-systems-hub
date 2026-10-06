import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, Badge, SectionTitle, SOURCE_LABELS, STATUS_LABELS } from "@/components/ui";
import { getModule, MODULES } from "@/content/curriculum";
import { getProgressMap } from "@/lib/learner";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  if (!mod) notFound();
  const user = await requireUser();
  const progress = await getProgressMap(user.id);

  return (
    <PageShell path="/curriculum">
      <nav className="text-[12.5px] text-ink-faint" aria-label="Breadcrumb">
        <Link href="/curriculum" className="hover:text-accent">Curriculum</Link> / {mod.title}
      </nav>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{mod.title}</h1>
        <Badge tone={SOURCE_LABELS[mod.sourceCategory].tone}>{SOURCE_LABELS[mod.sourceCategory].label}</Badge>
        <Badge>{mod.sessions} sessions</Badge>
      </div>
      <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-soft">{mod.summary}</p>
      {mod.sessionNote && (
        <p className="mt-2 max-w-3xl rounded-lg bg-warn-soft px-3 py-2 text-[13px] text-warn">
          Session mapping note: {mod.sessionNote}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle sub="Each lesson: WHY → objectives → topics → recall checkpoint → transfer task.">
            Lessons
          </SectionTitle>
          <ol className="space-y-3">
            {mod.lessons.map((lesson) => {
              const p = progress.get(lesson.slug);
              return (
                <li key={lesson.slug}>
                  <Card>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/learn/${mod.slug}/${lesson.slug}`}
                          className="text-[15px] font-semibold text-ink hover:text-navy"
                        >
                          {lesson.order}. {lesson.title}
                        </Link>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{lesson.why}</p>
                        <p className="mt-2 text-[12px] text-ink-faint">
                          {lesson.topics.length} topics · {lesson.topics.slice(0, 6).map((t) => t.name).join(", ")}
                          {lesson.topics.length > 6 ? "…" : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge tone={p?.practiceCompletedAt ? "good" : "neutral"}>
                          {p?.practiceCompletedAt ? "Recall ✓" : "Recall pending"}
                        </Badge>
                        <Badge tone={p?.transferCompletedAt ? "good" : "neutral"}>
                          {p?.transferCompletedAt ? "Transfer ✓" : "Transfer pending"}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ol>
        </div>

        <div>
          <SectionTitle sub="Additive layers only — nothing from the original module is replaced. Statuses are honest; re-verify before relying on identifiers.">
            Harvard mapping
          </SectionTitle>
          <div className="space-y-3">
            {mod.harvardMappings.map((m) => (
              <Card key={m.course}>
                <p className="text-[13.5px] font-semibold text-ink">{m.course}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge tone={m.layer === "harvard_college" ? "good" : "navy"}>
                    {m.layer === "harvard_college" ? "Harvard College" : "Harvard Extension"}
                  </Badge>
                  <Badge
                    tone={
                      m.status === "confirmed_current"
                        ? "good"
                        : m.status === "likely_not_verified"
                          ? "warn"
                          : "neutral"
                    }
                  >
                    {STATUS_LABELS[m.status]}
                  </Badge>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{m.note}</p>
                {m.officialUrl && (
                  <a
                    href={m.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-[12.5px] font-medium text-accent hover:underline"
                  >
                    Official source ↗
                  </a>
                )}
              </Card>
            ))}
          </div>

          <SectionTitle sub="">{""}</SectionTitle>
          <Card>
            <p className="text-[13px] font-semibold text-ink">Prerequisite graph position</p>
            <p className="mt-1 text-[12.5px] text-ink-soft">
              {mod.prerequisites.length === 0
                ? "Entry node — no prerequisites."
                : `Requires: ${mod.prerequisites.map((p) => MODULES.find((x) => x.slug === p)?.title ?? p).join("; ")}.`}
            </p>
            {mod.parallelWith?.length ? (
              <p className="mt-1 text-[12.5px] text-ink-soft">
                Runs in parallel with: {mod.parallelWith.map((p) => MODULES.find((x) => x.slug === p)?.title ?? p).join("; ")}.
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
