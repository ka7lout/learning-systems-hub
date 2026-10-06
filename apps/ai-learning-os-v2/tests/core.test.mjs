import { test } from "node:test";
import assert from "node:assert/strict";
import { nextReview, masteryLevel, updateDimension, shouldLimitReassurance, cvEligible, sessionAdvice, scoreFromKeyPoints } from "../src/lib/learning.ts";
import { validateCurriculum } from "../src/lib/validate.ts";
import { UNITS, MODULES, PROJECTS } from "../src/content/curriculum.ts";

test("spacing grows on success, resets on failure", () => {
  const a = nextReview(null, 0.9); assert.equal(a.intervalDays, 1);
  const b = nextReview(a, 0.9); assert.equal(b.intervalDays, 3);
  const c = nextReview(b, 0.9); assert.ok(c.intervalDays > 3);
  const f = nextReview(c, 0.3); assert.equal(f.intervalDays, 1); assert.equal(f.lapses, 1);
});
test("mastery requires independent transfer for L6", () => {
  const base = { recall: 0.9, application: 0.9, transfer: 0.9, contentSeen: true, delayedPass: false, projectEvidence: false };
  assert.equal(masteryLevel({ ...base, independentCount: 0 }), 5);
  assert.equal(masteryLevel({ ...base, independentCount: 1 }), 6);
  assert.equal(masteryLevel({ ...base, independentCount: 1, delayedPass: true, projectEvidence: true }), 8);
  assert.equal(masteryLevel({ recall: 0, application: 0, transfer: 0, independentCount: 0, contentSeen: false, delayedPass: false, projectEvidence: false }), 0);
});
test("assisted attempts are capped", () => {
  assert.ok(updateDimension(0, 1, "full_explanation") <= 0.12 + 1e-9);
  assert.ok(updateDimension(0, 1, "none") > updateDimension(0, 1, "hint"));
});
test("reassurance guardrail triggers on repeated identical checks", () => {
  assert.equal(shouldLimitReassurance([{ response: "x" }, { response: "x" }], "x"), true);
  assert.equal(shouldLimitReassurance([{ response: "x" }], "x"), false);
});
test("CV eligibility needs tier and link", () => {
  assert.equal(cvEligible("Practice Only", "https://a"), false);
  assert.equal(cvEligible("Portfolio Project", null), false);
  assert.equal(cvEligible("Portfolio Project", "https://github.com/x"), true);
});
test("session advice responds to performance, not time", () => {
  assert.equal(sessionAdvice([0.9], "deep"), null);
  assert.match(sessionAdvice([0.2, 0.3, 0.1], "deep") ?? "", /prerequisite/);
  assert.equal(scoreFromKeyPoints(4, 2), 0.5);
});
test("curriculum graph is valid and acyclic", () => {
  assert.deepEqual(validateCurriculum(UNITS), []);
  const cyc = [{ ...UNITS[0], id: "a", prerequisites: ["b"] }, { ...UNITS[0], id: "b", prerequisites: ["a"] }];
  assert.ok(validateCurriculum(cyc).some((e) => e.startsWith("cycle")));
});
test("original curriculum fully preserved", () => {
  for (const m of ["m1","m2","m3","m4","m5","m6","m7","m8"]) assert.ok(MODULES.find((x) => x.id === m));
  const topics = UNITS.flatMap((u) => u.topics);
  for (const t of ["Bubble Sort","Kurtosis","ANOVA","XLOOKUP","DAX Formulas","Selenium","Stored Procedures","Apriori Algorithm","CatBoost","Pose Estimation","QLoRA","Streamlit for ML apps","CI/CD overview","Virtual Environments","Cross Product"]) assert.ok(topics.includes(t), t);
  assert.equal(UNITS.filter((u) => u.sourceCategory === "Original Curriculum").length, 34);
  assert.ok(PROJECTS.filter((p) => Number(p.id.slice(1)) <= 21).length === 21);
});
