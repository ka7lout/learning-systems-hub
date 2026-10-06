import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { AppShell } from "@/components/shell";
import { MentorPanel, PracticeItem } from "@/components/client";
import { Badge, BodyText, Card, PageHeader, SourceBadge } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getLesson, getOrCreateThread, getThreadMessages } from "@/lib/data";
import { SPECIALISTS, providerStatus } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params }: { params: Promise<{ lessonKey: string }> }) {
  const { lessonKey } = await params;
  const user = await requirePage();
  const data = await getLesson(lessonKey);
  if (!data) notFound();
  const { lesson, course, items, siblings, sources } = data;

  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonKey, lesson.key)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(lessonProgress).values({
      userId: user.id,
      lessonKey: lesson.key,
      status: "in_progress",
      contentSeenAt: new Date(),
    });
  }

  const thread = await getOrCreateThread(user.id, lesson.key);
  const messages = await getThreadMessages(user.id, thread.id);
  const mode = user.settings?.contentMode ?? "standard";
  const index = siblings.findIndex((s) => s.key === lesson.key);
  const next = siblings[index + 1];

  return (
    <AppShell user={user}>
      <nav className="mb-4 text-xs text-muted">
        <Link href="/curriculum" className="hover:text-ink">
          Curriculum
        </Link>
        <span className="px-1">/</span>
        <span>{course?.title}</span>
      </nav>

      <PageHeader
        eyebrow={lesson.sourceCategory}
        title={lesson.title}
        description={lesson.why}
        actions={<Badge tone="accent">{lesson.estimatedMinutes} min</Badge>}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Learning objectives</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
              {lesson.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <h2 className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-muted">Topics covered</h2>
            <div className="flex flex-wrap gap-1.5">
              {lesson.topics.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </Card>

          {lesson.blocks.map((block) => {
            const body =
              mode === "b1b2" && block.b1b2
                ? block.b1b2
                : mode === "arabic" && block.arabic
                  ? block.arabic
                  : block.body;
            return (
              <Card key={block.title} className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone={block.kind === "caution" ? "warn" : "neutral"}>{block.kind.replace(/_/g, " ")}</Badge>
                  <h3 className="text-sm font-semibold text-ink">{block.title}</h3>
                </div>
                <div dir={mode === "arabic" && block.arabic ? "rtl" : "ltr"}>
                  <BodyText text={body} />
                </div>
                {mode !== "standard" && !block.b1b2 && !block.arabic ? (
                  <p className="mt-2 text-xs text-muted">
                    No simplified or Arabic version is written for this block, so the standard technical English text is
                    shown unchanged rather than machine-rewritten without review.
                  </p>
                ) : null}
                {(block.b1b2 || block.arabic) && mode === "standard" ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-muted">Simplified / Arabic version</summary>
                    {block.b1b2 ? <p className="mt-2 text-sm text-muted">{block.b1b2}</p> : null}
                    {block.arabic ? (
                      <p dir="rtl" className="mt-2 text-sm text-muted">
                        {block.arabic}
                      </p>
                    ) : null}
                  </details>
                ) : null}
              </Card>
            );
          })}

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Notebook guidance</h2>
            <p className="mb-3 mt-1 text-xs text-muted">
              Do not copy the lesson. Write only what retrieval will later depend on.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Must write", lesson.notebook.mustWrite, "accent"],
                  ["Recommended", lesson.notebook.recommended, "neutral"],
                  ["Optional / reference", lesson.notebook.optional, "neutral"],
                ] as const
              ).map(([label, list, tone]) => (
                <div key={label}>
                  <Badge tone={tone}>{label}</Badge>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink">
                    {list.length === 0 ? <li className="list-none text-muted">—</li> : list.map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <section id="practice" className="space-y-4 scroll-mt-6">
            <div>
              <h2 className="text-base font-semibold text-ink">Practice</h2>
              <p className="text-sm text-muted">
                Attempt first, then self-assess against the rubric. Your help level is recorded so independent evidence can
                be distinguished from assisted performance.
              </p>
            </div>
            {items.map((item) => (
              <PracticeItem
                key={item.key}
                item={{
                  key: item.key,
                  type: item.type,
                  stage: item.stage,
                  difficulty: item.difficulty,
                  prompt: item.prompt,
                  context: item.context,
                  rubric: item.rubric,
                }}
              />
            ))}
          </section>

          {sources.length > 0 ? (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-ink">Sources for this node</h2>
              <ul className="space-y-2 text-sm">
                {sources.map((s) => (
                  <li key={s.key} className="flex flex-wrap items-center gap-2">
                    <SourceBadge status={s.verificationStatus} />
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-accentink underline underline-offset-4">
                        {s.title}
                      </a>
                    ) : (
                      <span className="text-ink">{s.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {next ? (
            <Link
              href={`/learn/${next.key}`}
              className="inline-flex rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-linestrong"
            >
              Next lesson: {next.title}
            </Link>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-8">
          <Card className="p-4">
            <h2 className="mb-2 text-sm font-semibold text-ink">AI Mentor</h2>
            <MentorPanel
              specialists={SPECIALISTS.map((s) => ({ key: s.key, label: s.label, description: s.description }))}
              lessonKey={lesson.key}
              initialMessages={messages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                specialist: m.specialist,
                provider: m.provider,
              }))}
              providerConfigured={providerStatus().available}
              compact
            />
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
