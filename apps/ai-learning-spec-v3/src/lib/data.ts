import { db } from "@/db";
import {
  careerRoles,
  curriculumNodes,
  learners,
  masteryRecords,
  projects,
  reviewItems,
  skills,
  sources,
} from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { DEMO_LEARNER_ID, ensureSeeded } from "@/lib/seed";

export async function getDashboardData() {
  await ensureSeeded();

  const [learnerRows, nodes, mastery, reviews, projectRows, skillRows, sourceRows, roleRows] = await Promise.all([
    db.select().from(learners).where(eq(learners.id, DEMO_LEARNER_ID)).limit(1),
    db.select().from(curriculumNodes).orderBy(asc(curriculumNodes.sequence)),
    db.select().from(masteryRecords).where(eq(masteryRecords.learnerId, DEMO_LEARNER_ID)),
    db.select().from(reviewItems).where(eq(reviewItems.learnerId, DEMO_LEARNER_ID)).orderBy(asc(reviewItems.dueAt)),
    db.select().from(projects).orderBy(asc(projects.level)),
    db.select().from(skills).orderBy(desc(skills.evidenceCount), asc(skills.name)),
    db.select().from(sources).orderBy(desc(sources.accessedAt)),
    db.select().from(careerRoles).orderBy(asc(careerRoles.title)),
  ]);

  const learner = learnerRows[0];
  if (!learner) throw new Error("Learner profile could not be loaded");

  const activeNode = nodes.find((node) => node.id === "foundations-python") ?? nodes[0];
  const activeMastery = mastery.find((record) => record.nodeId === activeNode?.id);
  const dueReviews = reviews.filter((review) => review.status === "due");
  const activeProject = projectRows.find((project) => project.status === "active") ?? projectRows[0];

  return {
    learner,
    nodes,
    mastery,
    reviews,
    dueReviews,
    projects: projectRows,
    activeProject,
    skills: skillRows,
    sources: sourceRows,
    roles: roleRows,
    activeNode,
    activeMastery,
    stats: {
      moduleCount: nodes.length,
      projectCount: projectRows.length,
      dueReviewCount: dueReviews.length,
      skillEvidenceCount: skillRows.reduce((sum, skill) => sum + skill.evidenceCount, 0),
    },
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
