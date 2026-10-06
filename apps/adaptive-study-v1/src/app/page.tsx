import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { courses, concepts, reviewItems, dailyPlans, studySessions } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { CoursesOverview } from "@/components/home/CoursesOverview";
import { TodayTasks } from "@/components/home/TodayTasks";
import { ReviewQueue } from "@/components/home/ReviewQueue";
import { QuickStats } from "@/components/home/QuickStats";

export default async function HomePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch real data from database
  const [userCourses, userReviews, userSessions, userPlan] = await Promise.all([
    db.select().from(courses).where(eq(courses.isActive, true)),
    db.select().from(reviewItems)
      .where(and(
        eq(reviewItems.userId, user.id),
        gte(reviewItems.nextReview, today),
        gte(reviewItems.nextReview, tomorrow)
      )),
    db.select().from(studySessions)
      .where(eq(studySessions.userId, user.id))
      .orderBy(desc(studySessions.sessionDate))
      .limit(10),
    db.select().from(dailyPlans)
      .where(and(
        eq(dailyPlans.userId, user.id),
        gte(dailyPlans.planDate, today),
        gte(dailyPlans.planDate, tomorrow)
      ))
      .orderBy(desc(dailyPlans.planDate))
      .limit(1),
  ]);

  // Calculate real stats
  const totalConcepts = await db.select({ id: concepts.id }).from(concepts);
  const completedSessions = userSessions.filter(s => s.completed).length;
  const totalStudyMinutes = userSessions
    .filter(s => s.completed)
    .reduce((sum, s) => sum + (s.actualDurationMinutes || 0), 0);

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Your Next Step</h1>
              <p className="text-gray-400 mt-1">
                {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Main Task Card */}
          <TodayTasks 
            userId={user.id}
            initialPlan={userPlan[0] || null}
            reviewCount={userReviews.length}
          />

          {/* Quick Stats */}
          <QuickStats 
            coursesCount={userCourses.length}
            conceptsCount={totalConcepts.length}
            sessionsCount={completedSessions}
            studyMinutes={totalStudyMinutes}
          />

          {/* Courses Overview */}
          <CoursesOverview courses={userCourses.map(c => ({...c, color: c.color || "#3B82F6"}))} userId={user.id} />

          {/* Review Queue */}
          <ReviewQueue reviews={userReviews.filter(r => r.nextReview !== null) as any} userId={user.id} />
        </div>
      </div>
    </main>
  );
}
