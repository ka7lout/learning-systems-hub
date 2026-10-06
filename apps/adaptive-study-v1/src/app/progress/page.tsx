import { db } from "@/db";
import { courses, concepts, lessonProgress, studySessions, mistakes } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { ProgressView } from "@/components/progress/ProgressView";

export default async function ProgressPage() {
  // Fetch real progress data
  const [courseData, progressData, sessionData, mistakeData] = await Promise.all([
    db.select().from(courses),
    db.select().from(lessonProgress).where(eq(lessonProgress.userId, "default-user")),
    db.select().from(studySessions).where(eq(studySessions.userId, "default-user")).orderBy(desc(studySessions.sessionDate)).limit(20),
    db.select().from(mistakes).where(eq(mistakes.userId, "default-user")),
  ]);

  const totalStudyMinutes = sessionData
    .filter(s => s.completed)
    .reduce((sum, s) => sum + (s.actualDurationMinutes || 0), 0);

  const completedLessons = progressData.filter(p => p.status === "completed").length;

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="md:ml-64 pt-16 md:pt-0">
        <ProgressView 
          courses={courseData}
          completedLessons={completedLessons}
          totalStudyMinutes={totalStudyMinutes}
          recentSessions={sessionData}
          mistakes={mistakeData}
        />
      </div>
    </main>
  );
}
