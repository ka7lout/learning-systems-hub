import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { ORIGINAL_MODULES, ORIGINAL_TOPIC_COUNT } from "../src/content/original";
import { PROJECTS, SKILLS, CAREER_ROLES } from "../src/content/catalog";
import { buildCurriculum, assertAcyclic } from "../src/db/seed";
import { hashPassword, verifyPassword } from "../src/lib/auth";
import { stateProfile, difficultyAllowed } from "../src/lib/engine";

const ORIGINAL_PROJECT_TITLES = ["Skin Disease Prediction", "Face Recognition / Detection / Verification", "Text Classification", "Stock Market Prediction", "Sign Language Classifier", "Real-time Object Detection", "Breast Cancer Detection", "Brain Tumor Detection", "Image Generation using GANs", "Library Management System", "Uber Data Analysis", "Superstore Data Analysis Dashboard", "HR Dashboard", "Bank Loan Data Analysis", "Sales Database", "Credit Card Fraud Detection", "Titanic Prediction", "House Pricing Prediction", "Chatbot", "Document Summarization", "RAG System"];

test("original curriculum: 8 modules, stated session counts preserved, no empty sections", () => {
  assert.equal(ORIGINAL_MODULES.length, 8);
  assert.deepEqual(ORIGINAL_MODULES.map((m) => m.statedSessions), [10, 5, 10, 4, 8, 12, 16, 2]);
  for (const m of ORIGINAL_MODULES) for (const s of m.sections) assert.ok(s.topics.length > 0, `${s.id} has topics`);
  assert.ok(ORIGINAL_TOPIC_COUNT >= 280, `topic count ${ORIGINAL_TOPIC_COUNT}`);
});

test("original curriculum: specific must-keep topics are present", () => {
  const all = ORIGINAL_MODULES.flatMap((m) => m.sections.flatMap((s) => [s.title, ...s.topics]));
  for (const t of ["Excel", "Power BI", "Selenium", "BeautifulSoup", "FastAPI", "Streamlit", "Docker Basics", "XGBoost", "CatBoost", "YOLO architecture", "OpenCV", "LoRA", "QLoRA", "Hugging Face", "Vector Databases", "AI Agents", "Apriori Algorithm", "Kurtosis", "Strides", "ANOVA", "DAX Formulas", "Window Functions"]) {
    assert.ok(all.some((x) => x.includes(t)), `missing ${t}`);
  }
});

test("all 21 original projects present", () => {
  for (const t of ORIGINAL_PROJECT_TITLES) assert.ok(PROJECTS.some((p) => p.title === t), `missing project ${t}`);
});

test("curriculum graph builds, is acyclic, and every lesson has practice + notebook + mastery criteria", () => {
  const { nodes, edges, practice } = buildCurriculum();
  const lessons = nodes.filter((n) => n.type === "lesson");
  assert.ok(lessons.length >= 60);
  for (const l of lessons) {
    assert.ok(practice.some((p) => p.nodeId === l.id), `${l.id} has practice`);
    assert.ok(practice.some((p) => p.nodeId === l.id && p.isTransfer), `${l.id} has a transfer item`);
    assert.ok(l.notebook && l.notebook.mustWrite.length > 0, `${l.id} notebook`);
    assert.ok((l.masteryCriteria ?? []).length > 0, `${l.id} mastery criteria`);
    assert.ok(l.why && l.why.length > 20, `${l.id} why`);
  }
  assert.ok(edges.length > 50);
  const ids = new Set(nodes.map((n) => n.id));
  assertAcyclic(edges, ids);
  assert.throws(() => assertAcyclic([{ nodeId: "a", prerequisiteId: "b" }, { nodeId: "b", prerequisiteId: "a" }], new Set(["a", "b"])), /cycle/);
});

test("skills referenced by roles exist", () => {
  const ids = new Set(SKILLS.map((s) => s.id));
  for (const r of CAREER_ROLES) for (const s of [...r.hard, ...r.preferred, ...r.familiarity]) assert.ok(ids.has(s), `${r.slug}: ${s}`);
});

test("password hashing is salted and verifiable", () => {
  const h1 = hashPassword("correct horse battery");
  const h2 = hashPassword("correct horse battery");
  assert.notEqual(h1, h2);
  assert.ok(verifyPassword("correct horse battery", h1));
  assert.ok(!verifyPassword("wrong", h1));
});

test("state profiles shrink task size under drift/fog/overload and cap difficulty", () => {
  assert.ok(stateProfile("deep").itemsPerBlock > stateProfile("drift").itemsPerBlock);
  assert.equal(stateProfile("overload").maxDifficulty, "B");
  assert.ok(difficultyAllowed("B", "B"));
  assert.ok(!difficultyAllowed("C", "B"));
});
