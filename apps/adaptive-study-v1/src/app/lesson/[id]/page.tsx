import { notFound } from "next/navigation";
import { db } from "@/db";
import { lessons, concepts, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LessonView } from "@/components/lesson/LessonView";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;

  const lesson = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  
  if (!lesson[0]) {
    notFound();
  }

  const concept = await db.select().from(concepts).where(eq(concepts.id, lesson[0].conceptId)).limit(1);
  const course = await db.select().from(courses).where(eq(courses.id, lesson[0].courseId)).limit(1);

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="md:ml-64 pt-16 md:pt-0">
        <LessonView 
          lesson={lesson[0]} 
          concept={concept[0]} 
          course={course[0]} 
        />
      </div>
    </main>
  );
}
