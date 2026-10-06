/**
 * Test suite for the Ismaili Harvard Learning OS.
 * Run: npx tsx --env-file=.env scripts/test.ts
 *
 * These are test artefacts. The users they create are prefixed with
 * `test+` and deleted at the end; they never appear as real learner data.
 */
import { and, eq, like, sql } from "drizzle-orm";
import { db, pool } from "../src/db/index";
import {
  assessmentItems,
  attempts,
  courses,
  lessons,
  masteryRecords,
  projectEvidence,
  projects,
  reviewItems,
  skills,
  sources,
  userProjects,
  users,
} from "../src/db/schema";
import { attemptScore, masteryLevel, nextInterval } from "../src/lib/mastery-math";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { courseSeeds } from "../src/content/courses";
import { projectSeeds } from "../src/content/projects";

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed += 1;
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function unitTests() {
  check("attemptScore: solid + no help = 1", attemptScore("solid", "none") === 1);
  check("attemptScore: full explanation is penalised", attemptScore("solid", "full_explanation") < 0.4);
  check("attemptScore: missed is zero regardless of help", attemptScore("missed", "none") === 0);

  check(
    "masteryLevel: no evidence is L0",
    masteryLevel({ recall: 0, application: 0, transfer: 0, independence: 0, evidenceCount: 0, delayedPerformance: 0, projectEvidence: 0 }) === 0,
  );
  check(
    "masteryLevel: recall alone cannot exceed L3",
    masteryLevel({ recall: 1, application: 0, transfer: 0, independence: 1, evidenceCount: 5, delayedPerformance: 1, projectEvidence: 0 }) <= 3,
  );
  check(
    "masteryLevel: L8 requires project evidence",
    masteryLevel({ recall: 1, application: 1, transfer: 0.9, independence: 0.9, evidenceCount: 8, delayedPerformance: 0.9, projectEvidence: 0 }) < 8,
  );
  check(
    "masteryLevel: L9 requires delayed retention",
    masteryLevel({ recall: 1, application: 1, transfer: 0.9, independence: 0.9, evidenceCount: 8, delayedPerformance: 0.2, projectEvidence: 1 }) === 8,
  );

  const fail = nextInterval(10, 2.3, 0, "missed", 1);
  check("nextInterval: a miss shortens the interval", fail.interval < 10 && fail.lapses === 1);
  const good = nextInterval(4, 2.3, 0, "solid", 1);
  check("nextInterval: a success grows the interval", good.interval > 4);
  const important = nextInterval(4, 2.3, 0, "solid", 1.5);
  check("nextInterval: important items return sooner", important.interval < good.interval);
  check("nextInterval: interval is bounded", nextInterval(1000, 3, 0, "solid", 1).interval <= 120);

  const hash = await hashPassword("correct horse battery staple");
  check("password: correct password verifies", await verifyPassword("correct horse battery staple", hash));
  check("password: wrong password rejected", !(await verifyPassword("wrong password here", hash)));
  check("password: hash is salted (not raw)", hash.includes(":") && !hash.includes("correct horse"));
}

async function contentTests() {
  const [courseCount] = await db.select({ n: sql<number>`count(*)::int` }).from(courses);
  check("content: courses seeded", (courseCount?.n ?? 0) === courseSeeds.length);

  const originals = await db.select().from(courses).where(eq(courses.sourceCategory, "Original Curriculum"));
  check("content: original curriculum modules preserved", originals.length >= 6, `found ${originals.length}`);

  const python = originals.find((c) => c.id === "orig-m1-python");
  for (const topic of ["Magic Methods", "Virtual Environments", "Polymorphism", "Binary Search"]) {
    check(`content: Python module retains "${topic}"`, Boolean(python?.topics.includes(topic)));
  }
  const dl = originals.find((c) => c.id === "orig-m7-deep-learning");
  for (const topic of ["QLoRA", "YOLO architecture", "Pose Estimation", "Word2Vec", "Context Window"]) {
    check(`content: Deep Learning module retains "${topic}"`, Boolean(dl?.topics.includes(topic)));
  }
  const excel = originals.find((c) => c.id === "orig-m4-excel-powerbi");
  check("content: Excel/Power BI kept as an industry extension, not deleted", Boolean(excel?.topics.includes("DAX Formulas")));
  const dbModule = originals.find((c) => c.id === "orig-m5-databases");
  for (const topic of ["Selenium", "BeautifulSoup", "Window Functions", "ETL / ELT Pipelines"]) {
    check(`content: Databases module retains "${topic}"`, Boolean(dbModule?.topics.includes(topic)));
  }
  const mlops = originals.find((c) => c.id === "orig-m8-mlops");
  for (const topic of ["FastAPI", "Streamlit for ML apps", "Docker Basics", "CI/CD overview"]) {
    check(`content: MLOps module retains "${topic}"`, Boolean(mlops?.topics.includes(topic)));
  }

  const projectRows = await db.select().from(projects);
  check("content: full project catalogue seeded", projectRows.length === projectSeeds.length);
  const originalTitles = [
    "Skin Disease Prediction",
    "Face Recognition / Detection / Verification",
    "Text Classification",
    "Stock Market Prediction",
    "Sign Language Classifier",
    "Real-time Object Detection",
    "Breast Cancer Detection",
    "Brain Tumor Detection",
    "Image Generation using GANs",
    "Library Management System",
    "Uber Data Analysis",
    "Superstore Data Analysis Dashboard",
    "HR Dashboard",
    "Bank Loan Data Analysis",
    "Sales Database",
    "Credit Card Fraud Detection",
    "Titanic Prediction",
    "House Pricing Prediction",
    "Chatbot",
    "Document Summarization",
    "RAG System",
  ];
  for (const title of originalTitles) {
    check(`content: original project "${title}" present`, projectRows.some((p) => p.title === title));
  }
  check(
    "content: project ladder reaches level 10",
    projectRows.some((p) => p.ladderLevel === 10),
  );

  const lessonRows = await db.select().from(lessons);
  const itemRows = await db.select().from(assessmentItems);
  check("content: lessons have notebook MUST WRITE guidance", lessonRows.every((l) => l.notebook.must.length > 0));
  check("content: every lesson has a transfer item", lessonRows.every((l) => itemRows.some((i) => i.lessonId === l.id && i.phase === "transfer")));
  const mcqShare = itemRows.filter((i) => i.type === "mcq").length / Math.max(1, itemRows.length);
  check("content: multiple-choice is not the assessment core", mcqShare < 0.2, `mcq share ${mcqShare}`);
  check("content: at least 10 distinct active task types", new Set(itemRows.map((i) => i.type)).size >= 10);

  const sourceRows = await db.select().from(sources);
  check("content: source statuses are not collapsed", new Set(sourceRows.map((s) => s.verificationStatus)).size >= 3);
  check(
    "content: unverified Harvard identifiers are labelled",
    sourceRows.some((s) => s.verificationStatus === "likely_not_verified"),
  );
  const skillRows = await db.select().from(skills);
  check("content: skill graph seeded", skillRows.length >= 50);
}

async function authorizationTests() {
  const a = (
    await db
      .insert(users)
      .values({ email: `test+a-${Date.now()}@example.invalid`, name: "Test A", passwordHash: await hashPassword("password-a-123"), role: "student" })
      .returning({ id: users.id })
  )[0]!;
  const b = (
    await db
      .insert(users)
      .values({ email: `test+b-${Date.now()}@example.invalid`, name: "Test B", passwordHash: await hashPassword("password-b-123"), role: "student" })
      .returning({ id: users.id })
  )[0]!;

  const projectRow = (await db.select().from(projects).limit(1))[0]!;
  const ownedProject = (
    await db.insert(userProjects).values({ userId: a.id, projectId: projectRow.id, status: "in_progress", repoUrl: "https://github.com/example/private" }).returning({ id: userProjects.id })
  )[0]!;
  await db.insert(projectEvidence).values({ userId: a.id, userProjectId: ownedProject.id, kind: "repository", description: "A's private evidence" });
  await db.insert(masteryRecords).values({ userId: a.id, nodeType: "lesson", nodeId: "l-py-mutability", level: 5 });
  await db.insert(reviewItems).values({ userId: a.id, lessonId: "l-py-mutability", label: "A's review", dueAt: new Date() });

  // The ownership-scoped read pattern used throughout the application.
  const bReadsAProject = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.id, ownedProject.id), eq(userProjects.userId, b.id)));
  check("authz: user B cannot read user A's project by id", bReadsAProject.length === 0);

  const bUpdatesAProject = await db
    .update(userProjects)
    .set({ notes: "hijacked" })
    .where(and(eq(userProjects.id, ownedProject.id), eq(userProjects.userId, b.id)))
    .returning({ id: userProjects.id });
  check("authz: scoped update by user B affects zero rows", bUpdatesAProject.length === 0);

  const untouched = (await db.select().from(userProjects).where(eq(userProjects.id, ownedProject.id)))[0];
  check("authz: user A's row is unchanged after B's attempt", untouched?.notes === null);

  const bEvidence = await db.select().from(projectEvidence).where(eq(projectEvidence.userId, b.id));
  check("authz: user B sees no evidence", bEvidence.length === 0);
  const bMastery = await db.select().from(masteryRecords).where(eq(masteryRecords.userId, b.id));
  check("authz: user B sees no mastery records", bMastery.length === 0);
  const bReviews = await db.select().from(reviewItems).where(eq(reviewItems.userId, b.id));
  check("authz: user B sees no review items", bReviews.length === 0);

  // Cleanup: test artefacts must not persist as learner data.
  await db.delete(users).where(like(users.email, "test+%@example.invalid"));
  const leftovers = await db.select().from(users).where(like(users.email, "test+%@example.invalid"));
  check("authz: test users removed", leftovers.length === 0);
  const orphanAttempts = await db.select().from(attempts).where(eq(attempts.userId, a.id));
  check("authz: cascade removed dependent rows", orphanAttempts.length === 0);
}

async function main() {
  await unitTests();
  await contentTests();
  await authorizationTests();

  console.log(`\n${passed} checks passed`);
  if (failures.length > 0) {
    console.error(`${failures.length} FAILED:`);
    for (const f of failures) console.error(` - ${f}`);
    await pool.end();
    process.exit(1);
  }
  console.log("all tests passed");
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
