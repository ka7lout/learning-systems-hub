import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq, inArray } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { db } from "@/db";
import { courses, lessons, projects, skills, sources } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { PageHeader, Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

const STATUS_TAG: Record<string, string> = {
  confirmed_current: "tag-ok",
  confirmed_historical: "tag",
  likely_not_verified: "tag-warn",
  not_found: "tag-warn",
  design_decision: "tag",
  research_hypothesis: "tag",
};

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const user = await getUser();
  if (!user) redirect("/");
  const { courseId } = await params;

  const rows = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  const course = rows[0];
  if (!course) notFound();

  const [courseLessons, prereqs, skillRows, sourceRows, allProjects] = await Promise.all([
    db.select().from(lessons).where(eq(lessons.courseId, course.id)).orderBy(asc(lessons.position)),
    course.prerequisites.length > 0
      ? db.select({ id: courses.id, title: courses.title }).from(courses).where(inArray(courses.id, course.prerequisites))
      : Promise.resolve([]),
    course.skills.length > 0
      ? db.select().from(skills).where(inArray(skills.id, course.skills))
      : Promise.resolve([]),
    course.sourceRefs.length > 0
      ? db.select().from(sources).where(inArray(sources.id, course.sourceRefs))
      : Promise.resolve([]),
    db.select().from(projects).orderBy(asc(projects.ladderLevel)),
  ]);

  const relatedProjects = allProjects.filter((p) => p.prerequisites.includes(course.id));

  return (
    <Shell user={user} active="/curriculum">
      <nav className="text-xs muted mb-3">
        <Link href="/curriculum" className="underline underline-offset-2">
          Curriculum
        </Link>{" "}
        / {course.title}
      </nav>

      <PageHeader title={course.title} lead={course.summary}>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="tag tag-accent">{course.sourceCategory}</span>
          <span className="tag">{course.priority}</span>
          <span className="tag">{course.level}</span>
          <span className="tag">~{course.estimatedHours}h</span>
          <span className="tag">content verified {course.lastVerified}</span>
        </div>
      </PageHeader>

      <section className="surface p-4">
        <h2 className="text-sm font-medium">Why this exists in the pathway</h2>
        <p className="prose-block muted mt-2 text-sm">{course.why}</p>
      </section>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <section className="surface p-4">
          <h2 className="text-sm font-medium">Learning objectives</h2>
          <ul className="mt-2 space-y-1.5 text-[13px] muted">
            {course.objectives.map((o) => (
              <li key={o}>· {o}</li>
            ))}
          </ul>
        </section>
        <section className="surface p-4">
          <h2 className="text-sm font-medium">Mastery criteria</h2>
          <ul className="mt-2 space-y-1.5 text-[13px] muted">
            {course.masteryCriteria.map((o) => (
              <li key={o}>· {o}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="surface p-4 mt-5">
        <h2 className="text-sm font-medium">
          Preserved topics <span className="muted font-normal">({course.topics.length})</span>
        </h2>
        <p className="muted text-[11px] mt-1">
          Every topic from the source outline is retained verbatim. Classification is never deletion.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {course.topics.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="surface p-4 mt-5">
        <h2 className="text-sm font-medium">Harvard mapping and verification status</h2>
        <div className="mt-3 space-y-3">
          {course.harvardMapping.map((m) => (
            <div key={m.candidate} className="text-[13px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{m.candidate}</span>
                <span className="tag">{m.institution}</span>
                <span className={STATUS_TAG[m.verification] ?? "tag"}>{m.verification}</span>
              </div>
              <p className="muted mt-1 leading-relaxed">What it adds: {m.adds}</p>
              {m.note ? <p className="muted text-[11px] mt-1 leading-relaxed">{m.note}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <section className="surface p-4">
          <h2 className="text-sm font-medium">Prerequisites</h2>
          {prereqs.length === 0 ? (
            <p className="muted text-xs mt-2">None — this is an entry node in the graph.</p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {prereqs.map((p) => (
                <li key={p.id}>
                  <Link href={`/curriculum/${p.id}`} className="underline underline-offset-2">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="surface p-4">
          <h2 className="text-sm font-medium">Skills developed</h2>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skillRows.map((s) => (
              <span key={s.id} className="tag">
                {s.name} · target {s.depthTarget}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5">
        <h2 className="text-sm font-medium mb-2">Authored lessons</h2>
        {courseLessons.length === 0 ? (
          <div className="surface p-4">
            <p className="text-[13px]">No lesson is authored for this course node yet.</p>
            <p className="muted text-xs mt-1.5 leading-relaxed">
              The topic list, objectives, mastery criteria and mapping above are real content. Teaching text is
              authored progressively rather than generated as filler — this empty state is deliberate and
              truthful.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {courseLessons.map((l) => (
              <li key={l.id}>
                <Link href={`/learn/${l.id}`} className="surface p-3.5 flex items-center gap-3">
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium">{l.title}</span>
                    <span className="block text-[11px] muted mt-0.5">
                      {l.estimatedMinutes} min · {l.concepts.length} concepts
                    </span>
                  </span>
                  <ArrowRight size={15} className="muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {relatedProjects.length > 0 ? (
        <section className="surface p-4 mt-5">
          <h2 className="text-sm font-medium">Projects unlocked by this course</h2>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {relatedProjects.map((p) => (
              <li key={p.id}>
                <Link href="/projects" className="underline underline-offset-2">
                  L{p.ladderLevel} · {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sourceRows.length > 0 ? (
        <section className="surface p-4 mt-5">
          <h2 className="text-sm font-medium">Sources behind this node</h2>
          <ul className="mt-2 space-y-2 text-[12px]">
            {sourceRows.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  {s.title}
                </a>{" "}
                <span className={STATUS_TAG[s.verificationStatus] ?? "tag"}>{s.verificationStatus}</span>
                <span className="muted"> · retrieved {s.accessedAt}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Shell>
  );
}
