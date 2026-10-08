import { notFound } from "next/navigation";
import { db } from "@/db";
import { courses, concepts, modules, topics, lessons, lessonProgress } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { CourseDetail } from "@/components/courses/CourseDetail";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;

  // Fetch course
  const course = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  
  if (!course[0]) {
    notFound();
  }

  // Fetch course modules first
  const courseModules = await db.select().from(modules).where(eq(modules.courseId, id)).orderBy(asc(modules.displayOrder));
  const moduleIds = courseModules.map((m) => m.id);

  // Fetch related topics, concepts, lessons, progress
  const [courseTopics, courseConcepts, courseLessons, courseProgress] = await Promise.all([
    moduleIds.length > 0
      ? db.select().from(topics).where(inArray(topics.moduleId, moduleIds)).orderBy(asc(topics.displayOrder))
      : Promise.resolve([]),
    db.select().from(concepts).where(eq(concepts.courseId, id)).orderBy(asc(concepts.displayOrder)),
    db.select().from(lessons).where(eq(lessons.courseId, id)).orderBy(asc(lessons.displayOrder)),
    db.select().from(lessonProgress).where(eq(lessonProgress.userId, "default-user")),
  ]);

  // Organize concepts by topic
  const conceptsByTopic = courseConcepts.reduce((acc, concept) => {
    const topicId = concept.topicId || "uncategorized";
    if (!acc[topicId]) acc[topicId] = [];
    acc[topicId].push(concept);
    return acc;
  }, {} as Record<string, typeof courseConcepts>);

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="md:ml-64 pt-16 md:pt-0">
        <CourseDetail 
          course={course[0]} 
          modules={courseModules}
          topics={courseTopics}
          concepts={courseConcepts}
          lessons={courseLessons}
          progress={courseProgress}
          conceptsByTopic={conceptsByTopic}
        />
      </div>
    </main>
  );
}
