import "server-only";
import { and, asc, desc, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  assessmentItems,
  careerRoles,
  courses,
  englishActivities,
  englishTerms,
  freelanceScenarios,
  laterItems,
  lessonProgress,
  lessons,
  masteryRecords,
  mentorMessages,
  mentorThreads,
  prerequisites,
  projectCatalog,
  projectEvidence,
  reviewItems,
  skills,
  sources,
  studySessions,
  tracks,
  userProjects,
} from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

let ready: Promise<void> | null = null;
export function ensureReady(): Promise<void> {
  if (!ready) ready = ensureSeeded();
  return ready;
}

/* ---------------- public curriculum (not user-scoped) ---------------- */

export async function getTracksWithCourses() {
  await ensureReady();
  const [trackRows, courseRows, lessonRows, prereqRows] = await Promise.all([
    db.select().from(tracks).orderBy(asc(tracks.position)),
    db.select().from(courses).orderBy(asc(courses.position)),
    db.select({ key: lessons.key, courseKey: lessons.courseKey, title: lessons.title, position: lessons.position }).from(lessons).orderBy(asc(lessons.position)),
    db.select().from(prerequisites),
  ]);
  return trackRows.map((track) => ({
    ...track,
    courses: courseRows
      .filter((c) => c.trackKey === track.key)
      .map((c) => ({
        ...c,
        prerequisites: prereqRows.filter((p) => p.courseKey === c.key).map((p) => p.requiresCourseKey),
        lessons: lessonRows.filter((l) => l.courseKey === c.key),
      })),
  }));
}

export async function getCourseTitles() {
  await ensureReady();
  const rows = await db.select({ key: courses.key, title: courses.title }).from(courses);
  return new Map(rows.map((r) => [r.key, r.title]));
}

export async function getLesson(lessonKey: string) {
  await ensureReady();
  const [lesson] = await db.select().from(lessons).where(eq(lessons.key, lessonKey)).limit(1);
  if (!lesson) return null;
  const [course] = await db.select().from(courses).where(eq(courses.key, lesson.courseKey)).limit(1);
  const items = await db
    .select()
    .from(assessmentItems)
    .where(eq(assessmentItems.lessonKey, lessonKey))
    .orderBy(asc(assessmentItems.id));
  const siblings = await db
    .select({ key: lessons.key, title: lessons.title, position: lessons.position })
    .from(lessons)
    .where(eq(lessons.courseKey, lesson.courseKey))
    .orderBy(asc(lessons.position));
  const refs = lesson.sourceRefs.length > 0 ? await db.select().from(sources) : [];
  return {
    lesson,
    course,
    items,
    siblings,
    sources: refs.filter((s) => lesson.sourceRefs.includes(s.key) || (course?.sourceRefs ?? []).includes(s.key)),
  };
}

export async function getAllSources() {
  await ensureReady();
  return db.select().from(sources).orderBy(asc(sources.id));
}

export async function getSkills() {
  await ensureReady();
  return db.select().from(skills).orderBy(asc(skills.category), asc(skills.title));
}

export async function getProjectCatalog() {
  await ensureReady();
  return db.select().from(projectCatalog).orderBy(asc(projectCatalog.ladderLevel), asc(projectCatalog.title));
}

export async function getProject(projectKey: string) {
  await ensureReady();
  const [project] = await db.select().from(projectCatalog).where(eq(projectCatalog.key, projectKey)).limit(1);
  return project ?? null;
}

export async function getRoles() {
  await ensureReady();
  return db.select().from(careerRoles).orderBy(asc(careerRoles.id));
}

export async function getEnglishTerms() {
  await ensureReady();
  return db.select().from(englishTerms).orderBy(asc(englishTerms.term));
}

export async function getFreelanceScenarios() {
  await ensureReady();
  return db.select().from(freelanceScenarios).orderBy(asc(freelanceScenarios.id));
}

/* ---------------- user-scoped (ownership enforced server-side) ---------------- */

export async function getProgressFor(userId: number) {
  return db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
}

export async function getMasteryFor(userId: number) {
  return db.select().from(masteryRecords).where(eq(masteryRecords.userId, userId));
}

export async function getDueReviews(userId: number) {
  return db
    .select({
      itemKey: reviewItems.itemKey,
      lessonKey: reviewItems.lessonKey,
      dueAt: reviewItems.dueAt,
      reps: reviewItems.reps,
      lapses: reviewItems.lapses,
      intervalDays: reviewItems.intervalDays,
      lessonTitle: lessons.title,
      prompt: assessmentItems.prompt,
      context: assessmentItems.context,
      rubric: assessmentItems.rubric,
      type: assessmentItems.type,
      stage: assessmentItems.stage,
    })
    .from(reviewItems)
    .innerJoin(lessons, eq(lessons.key, reviewItems.lessonKey))
    .innerJoin(assessmentItems, eq(assessmentItems.key, reviewItems.itemKey))
    .where(and(eq(reviewItems.userId, userId), lte(reviewItems.dueAt, new Date())))
    .orderBy(asc(reviewItems.dueAt))
    .limit(20);
}

export async function getUpcomingReviews(userId: number) {
  return db
    .select({
      itemKey: reviewItems.itemKey,
      dueAt: reviewItems.dueAt,
      intervalDays: reviewItems.intervalDays,
      lessonTitle: lessons.title,
    })
    .from(reviewItems)
    .innerJoin(lessons, eq(lessons.key, reviewItems.lessonKey))
    .where(eq(reviewItems.userId, userId))
    .orderBy(asc(reviewItems.dueAt))
    .limit(12);
}

export async function getUserProjects(userId: number) {
  return db
    .select({
      id: userProjects.id,
      projectKey: userProjects.projectKey,
      status: userProjects.status,
      repoUrl: userProjects.repoUrl,
      demoUrl: userProjects.demoUrl,
      datasetUrl: userProjects.datasetUrl,
      reportUrl: userProjects.reportUrl,
      notes: userProjects.notes,
      milestoneState: userProjects.milestoneState,
      dodState: userProjects.dodState,
      title: projectCatalog.title,
      ladderLevel: projectCatalog.ladderLevel,
      evidenceClass: projectCatalog.evidenceClass,
      skillKeys: projectCatalog.skillKeys,
    })
    .from(userProjects)
    .innerJoin(projectCatalog, eq(projectCatalog.key, userProjects.projectKey))
    .where(eq(userProjects.userId, userId))
    .orderBy(asc(projectCatalog.ladderLevel));
}

export async function getUserProject(userId: number, projectKey: string) {
  const [row] = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.userId, userId), eq(userProjects.projectKey, projectKey)))
    .limit(1);
  if (!row) return null;
  const evidence = await db
    .select()
    .from(projectEvidence)
    .where(and(eq(projectEvidence.userId, userId), eq(projectEvidence.userProjectId, row.id)))
    .orderBy(desc(projectEvidence.createdAt));
  return { project: row, evidence };
}

export async function getEvidenceFor(userId: number) {
  return db
    .select({
      id: projectEvidence.id,
      kind: projectEvidence.kind,
      url: projectEvidence.url,
      description: projectEvidence.description,
      createdAt: projectEvidence.createdAt,
      projectKey: userProjects.projectKey,
      projectTitle: projectCatalog.title,
      evidenceClass: projectCatalog.evidenceClass,
    })
    .from(projectEvidence)
    .innerJoin(userProjects, eq(userProjects.id, projectEvidence.userProjectId))
    .innerJoin(projectCatalog, eq(projectCatalog.key, userProjects.projectKey))
    .where(eq(projectEvidence.userId, userId))
    .orderBy(desc(projectEvidence.createdAt));
}

export async function getLaterItems(userId: number) {
  return db
    .select()
    .from(laterItems)
    .where(eq(laterItems.userId, userId))
    .orderBy(desc(laterItems.createdAt))
    .limit(25);
}

export async function getCurrentState(userId: number) {
  const [row] = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(desc(studySessions.startedAt))
    .limit(1);
  return row ?? null;
}

export async function getEnglishActivity(userId: number) {
  return db
    .select()
    .from(englishActivities)
    .where(eq(englishActivities.userId, userId))
    .orderBy(desc(englishActivities.createdAt))
    .limit(30);
}

export async function getOrCreateThread(userId: number, lessonKey?: string | null) {
  const existing = await db
    .select()
    .from(mentorThreads)
    .where(eq(mentorThreads.userId, userId))
    .orderBy(desc(mentorThreads.createdAt))
    .limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db
    .insert(mentorThreads)
    .values({ userId, lessonKey: lessonKey ?? null, title: "Mentor conversation" })
    .returning();
  return created;
}

export async function getThreadMessages(userId: number, threadId: number) {
  return db
    .select()
    .from(mentorMessages)
    .where(and(eq(mentorMessages.userId, userId), eq(mentorMessages.threadId, threadId)))
    .orderBy(asc(mentorMessages.createdAt))
    .limit(60);
}
