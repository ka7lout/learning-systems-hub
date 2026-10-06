import { db } from "@/db";
import { courses, courseSources, concepts, lessons, questions, studySessions, mistakes, reviewItems, ingestionRuns } from "@/db/schema";
import { sql } from "drizzle-orm";
import { DataHealthView } from "@/components/admin/DataHealthView";

export default async function DataHealthPage() {
  // Fetch real database statistics
  const [
    courseCount,
    sourceCount,
    conceptCount,
    lessonCount,
    questionCount,
    sessionCount,
    mistakeCount,
    reviewCount,
    lastIngestion
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(courses),
    db.select({ count: sql<number>`count(*)::int` }).from(courseSources),
    db.select({ count: sql<number>`count(*)::int` }).from(concepts),
    db.select({ count: sql<number>`count(*)::int` }).from(lessons),
    db.select({ count: sql<number>`count(*)::int` }).from(questions),
    db.select({ count: sql<number>`count(*)::int` }).from(studySessions),
    db.select({ count: sql<number>`count(*)::int` }).from(mistakes),
    db.select({ count: sql<number>`count(*)::int` }).from(reviewItems),
    db.select().from(ingestionRuns).orderBy(sql`${ingestionRuns.startedAt} DESC`).limit(1),
  ]);

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="md:ml-64 pt-16 md:pt-0">
        <DataHealthView 
          stats={{
            courses: courseCount[0]?.count || 0,
            sources: sourceCount[0]?.count || 0,
            concepts: conceptCount[0]?.count || 0,
            lessons: lessonCount[0]?.count || 0,
            questions: questionCount[0]?.count || 0,
            sessions: sessionCount[0]?.count || 0,
            mistakes: mistakeCount[0]?.count || 0,
            reviews: reviewCount[0]?.count || 0,
          }}
          lastIngestion={lastIngestion[0] || null}
        />
      </div>
    </main>
  );
}
