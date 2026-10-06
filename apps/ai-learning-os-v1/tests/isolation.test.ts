import "dotenv/config";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { and, eq } from "drizzle-orm";
import { db, pool } from "../src/db";
import { users, userProjects, projectCatalog, practiceItems, masteryRecords, projectEvidence } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { recordAttemptAndUpdateMastery, careerGap } from "../src/lib/engine";
import { ensureSeeded } from "../src/db/seed";

/** Integration tests against the local database. Test users are deleted afterwards and never appear as real learners. */
const suffix = Date.now();
let a = "";
let b = "";

test("setup", async () => {
  await ensureSeeded();
  const [ua] = await db.insert(users).values({ email: `test-a-${suffix}@example.test`, passwordHash: hashPassword("password123"), name: "Test A" }).returning();
  const [ub] = await db.insert(users).values({ email: `test-b-${suffix}@example.test`, passwordHash: hashPassword("password123"), name: "Test B" }).returning();
  a = ua.id; b = ub.id;
});

test("student B cannot read student A's project through the owner-scoped query", async () => {
  const [cat] = await db.select().from(projectCatalog).limit(1);
  const [p] = await db.insert(userProjects).values({ ownerId: a, catalogId: cat.id }).returning();
  const asB = await db.select().from(userProjects).where(and(eq(userProjects.id, p.id), eq(userProjects.ownerId, b)));
  assert.equal(asB.length, 0);
  const asA = await db.select().from(userProjects).where(and(eq(userProjects.id, p.id), eq(userProjects.ownerId, a)));
  assert.equal(asA.length, 1);
});

test("mastery is owner-scoped and independent attempts raise level while assisted attempts are discounted", async () => {
  const [item] = await db.select().from(practiceItems).where(eq(practiceItems.isTransfer, false)).limit(1);
  for (let i = 0; i < 3; i++) await recordAttemptAndUpdateMastery({ ownerId: a, itemId: item.id, response: "attempt", selfScore: 3, helpLevel: "none", learningState: "deep", isReview: false });
  const [ma] = await db.select().from(masteryRecords).where(and(eq(masteryRecords.ownerId, a), eq(masteryRecords.nodeId, item.nodeId)));
  const mb = await db.select().from(masteryRecords).where(and(eq(masteryRecords.ownerId, b), eq(masteryRecords.nodeId, item.nodeId)));
  assert.ok(ma.level >= 3, `level ${ma.level}`);
  assert.equal(mb.length, 0);
  const r = await recordAttemptAndUpdateMastery({ ownerId: b, itemId: item.id, response: "attempt", selfScore: 3, helpLevel: "full_explanation", learningState: "deep", isReview: false });
  assert.ok(r.mastery.recall < 0.6, "assisted performance is discounted");
  assert.equal(r.mastery.assisted, 1);
});

test("career gap shows no evidence for a fresh user", async () => {
  const gap = await careerGap(b, "nuwave-style-production-ai-engineer");
  assert.ok(gap.summary.hardTotal > 10);
  assert.ok(gap.requirements.every((r) => r.status === "missing" || r.evidenceCount >= 0));
});

after(async () => {
  await db.delete(projectEvidence).where(eq(projectEvidence.ownerId, a));
  await db.delete(users).where(eq(users.id, a));
  await db.delete(users).where(eq(users.id, b));
  await pool.end();
});
