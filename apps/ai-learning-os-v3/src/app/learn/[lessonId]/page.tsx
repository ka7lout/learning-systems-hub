import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { courses, englishTerms, lessons, masteryRecords, sources } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { lessonItems, MASTERY_LABELS, type LearningState } from "@/lib/learning";
import { providerConfigured, SPECIALISTS } from "@/lib/ai";
import { PageHeader, Shell } from "@/components/shell";
import { PracticeBlock } from "@/components/practice";
import { MentorPanel } from "@/components/mentor-panel";
import type { LessonBlock } from "@/db/schema";

export const dynamic = "force-dynamic";

const BLOCK_LABEL: Record<string, string> = {
  worked: "Worked example",
  pitfall: "Common failure",
  case: "Case",
  math: "Formal statement",
  code: "Code",
};

function annotate(text: string, terms: { term: string; b1b2: string; arabic: string }[], enabled: boolean) {
  if (!enabled || terms.length === 0) return text;
  const parts: (string | { term: string; title: string })[] = [text];
  for (const t of terms) {
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof part !== "string") continue;
      const idx = part.toLowerCase().indexOf(t.term.toLowerCase());
      if (idx === -1) continue;
      const before = part.slice(0, idx);
      const match = part.slice(idx, idx + t.term.length);
      const after = part.slice(idx + t.term.length);
      parts.splice(i, 1, before, { term: match, title: `${t.b1b2} — ${t.arabic}` }, after);
      break;
    }
  }
  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : (
      <abbr key={i} className="term" title={p.title}>
        {p.term}
      </abbr>
    ),
  );
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const user = await getUser();
  if (!user) redirect("/");
  const { lessonId } = await params;

  const rows = await db
    .select({ lesson: lessons, course: courses })
    .from(lessons)
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  const row = rows[0];
  if (!row) notFound();
  const { lesson, course } = row;

  const store = await cookies();
  const state = (store.get("ihls_state")?.value ?? "deep") as LearningState;
  const englishMode = store.get("ihls_english")?.value ?? "standard";
  const vocabOn = (store.get("ihls_vocab")?.value ?? "on") === "on";

  const [items, mastery, terms, sourceRows] = await Promise.all([
    lessonItems(lesson.id, state),
    db
      .select()
      .from(masteryRecords)
      .where(
        and(
          eq(masteryRecords.userId, user.id),
          eq(masteryRecords.nodeType, "lesson"),
          eq(masteryRecords.nodeId, lesson.id),
        ),
      )
      .limit(1),
    db.select().from(englishTerms),
    lesson.sourceRefs.length > 0
      ? db.select().from(sources).where(inArray(sources.id, lesson.sourceRefs))
      : Promise.resolve([]),
  ]);

  const m = mastery[0];

  return (
    <Shell user={user} active="/curriculum">
      <nav className="text-xs muted mb-3">
        <Link href="/curriculum" className="underline underline-offset-2">
          Curriculum
        </Link>{" "}
        /{" "}
        <Link href={`/curriculum/${course.id}`} className="underline underline-offset-2">
          {course.title}
        </Link>{" "}
        / {lesson.title}
      </nav>

      <PageHeader title={lesson.title}>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="tag tag-accent">{lesson.sourceCategory}</span>
          <span className="tag">{lesson.estimatedMinutes} min</span>
          <span className="tag">
            mastery {m ? `L${m.level} — ${MASTERY_LABELS[m.level]}` : "L0 — not encountered"}
          </span>
          <span className="tag">english: {englishMode}</span>
        </div>
      </PageHeader>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="min-w-0 space-y-5">
          <section className="surface p-4">
            <h2 className="text-sm font-medium">Why this matters</h2>
            <p className="prose-block mt-2 text-sm">{lesson.why}</p>
            <h3 className="text-xs font-medium mt-4">By the end you should be able to</h3>
            <ul className="mt-1.5 space-y-1 text-[13px] muted">
              {lesson.objectives.map((o) => (
                <li key={o}>· {o}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            {(lesson.blocks as LessonBlock[]).map((b, i) => (
              <div key={i} className="surface p-4">
                {b.kind !== "prose" ? (
                  <p className="text-[11px] tracking-wide uppercase muted mb-2">
                    {BLOCK_LABEL[b.kind] ?? b.kind}
                  </p>
                ) : null}
                {"title" in b && b.title ? <h3 className="text-sm font-medium mb-2">{b.title}</h3> : null}
                {b.kind === "code" || b.kind === "worked" || b.kind === "math" ? (
                  <pre className="code">{b.body}</pre>
                ) : (
                  <p className="prose-block text-sm">{annotate(b.body, terms, vocabOn)}</p>
                )}
              </div>
            ))}
          </section>

          <section className="surface p-4">
            <h2 className="text-sm font-medium">Notebook guidance</h2>
            <p className="muted text-[11px] mt-1">
              You are never asked to copy the lesson. Write the items below by hand.
            </p>
            <div className="mt-3 space-y-3 text-[13px]">
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                  MUST WRITE
                </p>
                <ul className="mt-1 space-y-1">
                  {lesson.notebook.must.map((x) => (
                    <li key={x}>· {x}</li>
                  ))}
                </ul>
              </div>
              {lesson.notebook.recommended.length > 0 ? (
                <div>
                  <p className="text-xs font-medium muted">RECOMMENDED</p>
                  <ul className="mt-1 space-y-1 muted">
                    {lesson.notebook.recommended.map((x) => (
                      <li key={x}>· {x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {lesson.notebook.optional.length > 0 ? (
                <div>
                  <p className="text-xs font-medium muted">OPTIONAL — reference only</p>
                  <ul className="mt-1 space-y-1 muted">
                    {lesson.notebook.optional.map((x) => (
                      <li key={x}>· {x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          <section id="practice">
            <h2 className="text-sm font-medium mb-2">
              Practice — attempt first, then record how it went
            </h2>
            <p className="muted text-xs mb-3 leading-relaxed">
              Items are filtered by your current study state ({state}). The reference answer stays locked until
              you have written an attempt.
            </p>
            <PracticeBlock items={items} />
          </section>

          {m ? (
            <section className="surface p-4">
              <h2 className="text-sm font-medium">Your evidence on this node</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs">
                {[
                  ["Recall", m.recall],
                  ["Application", m.application],
                  ["Transfer", m.transfer],
                  ["Independence", m.independence],
                  ["Delayed retention", m.delayedPerformance],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="muted">{label as string}</dt>
                    <dd className="tabular-nums">{(value as number).toFixed(2)}</dd>
                    <div className="bar mt-1">
                      <span style={{ width: `${Math.min(100, (value as number) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div>
                  <dt className="muted">Attempts recorded</dt>
                  <dd className="tabular-nums">{m.evidenceCount}</dd>
                </div>
              </dl>
              <p className="muted text-[11px] mt-3 leading-relaxed">
                Level 6 and above requires transfer evidence; level 8 requires project evidence; level 9
                requires delayed retention. Watching or reading alone never moves these numbers.
              </p>
            </section>
          ) : null}

          {sourceRows.length > 0 ? (
            <section className="surface p-4">
              <h2 className="text-sm font-medium">Sources</h2>
              <ul className="mt-2 space-y-1.5 text-[12px]">
                {sourceRows.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                      {s.title}
                    </a>{" "}
                    <span className="tag">{s.verificationStatus}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <MentorPanel
          lessonId={lesson.id}
          specialists={SPECIALISTS.map((s) => ({ id: s.id, label: s.label, description: s.description }))}
          providerConfigured={providerConfigured()}
          englishMode={englishMode}
          learningState={state}
        />
      </div>
    </Shell>
  );
}
