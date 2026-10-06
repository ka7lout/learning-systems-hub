import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getLesson,
  getCourse,
  getConceptTitle,
  getLessonProgress,
  getQuestions,
} from "@/lib/queries";
import { redirect } from "next/navigation";
import LessonView from "../../_components/LessonView";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lesson = await getLesson(id);
  if (!lesson) notFound();

  const [course, conceptTitle, progress, qs] = await Promise.all([
    getCourse(lesson.courseId),
    getConceptTitle(lesson.conceptId),
    getLessonProgress(user.id, id),
    getQuestions({ courseId: lesson.courseId, limit: 10 }),
  ]);

  const question =
    qs.find((q) => q.conceptId === lesson.conceptId) ?? qs[0] ?? null;

  const Section = ({
    title,
    body,
    accent,
  }: {
    title: string;
    body: string | null | undefined;
    accent?: string;
  }) =>
    body ? (
      <div className="surface p-4">
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${accent ?? "muted"}`}>
          {title}
        </h3>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{body}</div>
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={course ? `/courses/${course.id}` : "/courses"}
          className="text-sm brand hover:underline"
        >
          ← {course?.code ?? "Courses"}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{lesson.title}</h1>
        <p className="muted mt-1 text-xs">
          Concept: {conceptTitle ?? "—"} · Origin: {lesson.origin} · Verification:{" "}
          {lesson.verificationStatus}
        </p>
        {lesson.sourceDoc && (
          <p className="muted mt-1 text-xs">
            Source: {lesson.sourceDoc}
            {lesson.sourcePage ? `, p.${lesson.sourcePage}` : ""}
            {lesson.sourceSection ? `, ${lesson.sourceSection}` : ""}
          </p>
        )}
      </div>

      <Section title="Mission" body={lesson.mission} accent="brand" />
      <Section title="Objective" body={lesson.objective} />
      <Section title="Prerequisite" body={lesson.prerequisiteText} />
      <Section title="Simple explanation" body={lesson.simpleExplanation} accent="brand" />
      <Section title="Analogy" body={lesson.analogy} />
      <Section title="Formal definition" body={lesson.formalDefinition} />
      <Section title="Equation / code" body={lesson.equation} />
      <Section title="Worked example" body={lesson.workedExample} />
      <Section title="Guided practice" body={lesson.guidedPractice} />
      <Section title="Independent practice" body={lesson.independentPractice} />

      <div className="surface-2 p-4 text-sm muted">
        <b className="text-slate-200">What to write:</b> keywords, the core formula, one diagram, and
        the single condition you keep forgetting. Do not transcribe the whole page.
      </div>

      <Section title="Retrieval prompt" body={lesson.retrievalPrompt} />
      <Section title="Reflection" body={lesson.reflection} />
      <Section title="Review schedule" body={lesson.reviewSchedule} />

      <LessonView
        lessonId={lesson.id}
        initialStatus={progress?.status ?? "not_started"}
        initialMastery={progress?.masteryLevel ?? 0}
        question={
          question
            ? {
                id: question.id,
                questionText: question.questionText,
                answer: question.answer,
                solution: question.solution,
                sourceLabel: question.sourceLabel,
                conceptId: question.conceptId,
                difficulty: question.difficulty,
              }
            : null
        }
      />
    </div>
  );
}
