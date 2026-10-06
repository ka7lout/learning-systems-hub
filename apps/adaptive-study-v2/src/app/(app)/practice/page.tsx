import { getCurrentUser } from "@/lib/auth";
import { getQuestions, getCourses } from "@/lib/queries";
import { redirect } from "next/navigation";
import PracticeArena from "../_components/PracticeArena";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [questions, courses] = await Promise.all([
    getQuestions({ limit: 100 }),
    getCourses(),
  ]);

  const pq = questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    answer: q.answer,
    solution: q.solution,
    sourceLabel: q.sourceLabel,
    difficulty: q.difficulty,
    skill: q.skill,
    courseId: q.courseId,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Practice arena</h1>
        <p className="muted mt-1 text-sm">
          Real question bank, each clearly labelled by source. Self-report whether you solved it; your
          answer is recorded and mistakes feed your review queue.
        </p>
      </div>
      <PracticeArena questions={pq} courses={courses.map((c) => ({ id: c.id, code: c.code, title: c.title }))} />
    </div>
  );
}
