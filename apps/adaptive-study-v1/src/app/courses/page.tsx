import { db } from "@/db";
import { courses, concepts, lessonProgress } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { CoursesList } from "@/components/courses/CoursesList";

export default async function CoursesPage() {
  // Fetch all active courses
  const allCourses = await db.select().from(courses)
    .where(eq(courses.isActive, true))
    .orderBy(courses.displayOrder);

  // Get concept counts per course
  const conceptCounts = await db.select({
    courseId: concepts.courseId,
    count: sql<number>`count(*)::int`
  }).from(concepts).groupBy(concepts.courseId);

  // Get lesson progress per course
  const progressData = await db.select({
    courseId: lessonProgress.lessonId,
    count: sql<number>`count(*)::int`
  }).from(lessonProgress)
    .where(eq(lessonProgress.status, "completed"))
    .groupBy(lessonProgress.lessonId);

  const coursesWithCounts = allCourses.map(course => ({
    ...course,
    color: course.color || "#3B82F6",
    conceptCount: conceptCounts.find(c => c.courseId === course.id)?.count || 0,
    completedLessons: progressData.filter(p => p.courseId === course.id).length,
  }));

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Your Courses</h1>
            <p className="text-gray-400 mt-1">
              Courses from your IUG Google Drive
            </p>
          </div>
          
          <CoursesList courses={coursesWithCounts} />
        </div>
      </div>
    </main>
  );
}
