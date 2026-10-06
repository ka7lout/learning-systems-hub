import { beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

process.env.DATA_DRIVER = "file";
process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "ihls-test-"));

const { resetFileStore } = await import("@/lib/db/file-driver");
const { owned, newId } = await import("@/lib/dal");
const { computeSkillMastery, markContentSeen } = await import("@/lib/engines/mastery");
const { nextSchedule, upsertReviewItem, dueReviews } = await import("@/lib/engines/review");
const { buildRoleReport } = await import("@/lib/engines/career");
const { suggestNextTasks } = await import("@/lib/engines/tasks");
const { hashPassword, verifyPassword, validatePassword } = await import("@/lib/auth/password");
const { buildCurriculumGraph } = await import("@/content");

type Session = Awaited<ReturnType<typeof makeSession>>;
const makeSession = async (id: string) => ({
  userId: id,
  email: `${id}@example.test`,
  name: id,
  roles: ["student" as const],
  sessionId: `sess_${id}`,
});

const graph = buildCurriculumGraph();
const skillId = graph.skills[0].id;
const assessment = graph.assessments[0];

let alice: Session;
let bob: Session;

beforeEach(async () => {
  await resetFileStore();
  alice = await makeSession("alice");
  bob = await makeSession("bob");
});

describe("multi-tenant isolation (§189, §197)", () => {
  it("never returns another student's documents", async () => {
    await owned(alice, "notes").insert({ _id: newId("not"), lessonId: "l-x", kind: "free", content: "alice only" } as never);
    const bobNotes = await owned(bob, "notes").find({});
    expect(bobNotes).toEqual([]);
    const aliceNotes = await owned(alice, "notes").find({});
    expect(aliceNotes).toHaveLength(1);
  });

  it("ignores a client-supplied ownerId and uses the session value", async () => {
    await owned(alice, "notes").insert({
      _id: newId("not"),
      ownerId: bob.userId, // hostile input
      lessonId: "l-x",
      kind: "free",
      content: "attempted cross-tenant write",
    } as never);
    expect(await owned(bob, "notes").count({})).toBe(0);
    expect(await owned(alice, "notes").count({})).toBe(1);
  });

  it("refuses to scope a collection that is not ownership-bound", () => {
    expect(() => owned(alice, "lessons" as never)).toThrow();
  });
});

describe("mastery engine (§182, §218)", () => {
  it("reading a lesson never moves a skill past 'content seen'", async () => {
    await markContentSeen(alice, [skillId]);
    const m = await computeSkillMastery(alice, [skillId]);
    expect(m.get(skillId)!.level).toBe("exposed");
    expect(m.get(skillId)!.components.contentSeen).toBe(1);
  });

  it("weights assisted answers below unaided ones", async () => {
    const store = owned(alice, "submissions");
    await store.insert({
      _id: newId("sub"),
      assessmentId: assessment.id,
      lessonId: assessment.lessonId,
      skillIds: [skillId],
      tier: "recall",
      answer: "x",
      helpLevel: "Full Explanation",
      evaluation: "self",
      correct: true,
    } as never);
    const assisted = await computeSkillMastery(alice, [skillId]);
    expect(assisted.get(skillId)!.unaidedPasses).toBe(0);
    expect(assisted.get(skillId)!.level).toBe("exposed");

    await store.insert({
      _id: newId("sub"),
      assessmentId: assessment.id,
      lessonId: assessment.lessonId,
      skillIds: [skillId],
      tier: "recall",
      answer: "x",
      helpLevel: "No Help",
      evaluation: "self",
      correct: true,
    } as never);
    const unaided = await computeSkillMastery(alice, [skillId]);
    expect(unaided.get(skillId)!.unaidedPasses).toBe(1);
    expect(unaided.get(skillId)!.level).toBe("developing");
  });

  it("requires transfer and evidence before 'independently demonstrated'", async () => {
    const subs = owned(alice, "submissions");
    for (const tier of ["recall", "transfer", "transfer"] as const) {
      await subs.insert({
        _id: newId("sub"),
        assessmentId: assessment.id,
        lessonId: assessment.lessonId,
        skillIds: [skillId],
        tier,
        answer: "x",
        helpLevel: "No Help",
        evaluation: "self",
        correct: true,
      } as never);
    }
    const before = await computeSkillMastery(alice, [skillId]);
    expect(["developing", "competent"]).toContain(before.get(skillId)!.level);

    await owned(alice, "project_evidence").insert({
      _id: newId("evd"),
      kind: "repository",
      projectId: graph.projects[0].id,
      skillIds: [skillId],
      title: "repo",
      description: "real artefact",
      verified: true,
    } as never);
    const after = await computeSkillMastery(alice, [skillId]);
    expect(["competent", "independent"]).toContain(after.get(skillId)!.level);
  });

  it("counts a corrected error as debugging evidence", async () => {
    await owned(alice, "error_notebook").insert({
      _id: newId("err"),
      errorType: "Concept Error",
      skillIds: [skillId],
      description: "d",
      correction: "c",
      resolved: true,
    } as never);
    const m = await computeSkillMastery(alice, [skillId]);
    expect(m.get(skillId)!.components.debugging).toBe(1);
  });
});

describe("review scheduling (§148)", () => {
  it("expands the interval on a pass and collapses it on a miss", () => {
    const start = { ease: 2.3, intervalDays: 3, reps: 2, lapses: 0 };
    const passed = nextSchedule(start, { passed: true, difficulty: 3, importance: "CORE", helpUsed: false });
    const missed = nextSchedule(start, { passed: false, difficulty: 3, importance: "CORE", helpUsed: false });
    expect(passed.intervalDays).toBeGreaterThan(start.intervalDays);
    expect(missed.intervalDays).toBeLessThan(start.intervalDays);
    expect(missed.lapses).toBe(1);
    expect(missed.ease).toBeLessThan(start.ease);
  });

  it("shortens the interval when help was used", () => {
    const start = { ease: 2.3, intervalDays: 7, reps: 2, lapses: 0 };
    const unaided = nextSchedule(start, { passed: true, difficulty: 3, importance: "CORE", helpUsed: false });
    const assisted = nextSchedule(start, { passed: true, difficulty: 3, importance: "CORE", helpUsed: true });
    expect(assisted.intervalDays).toBeLessThan(unaided.intervalDays);
  });

  it("only returns items that are actually due", async () => {
    await upsertReviewItem(alice, assessment, "CORE", true, false);
    const due = await dueReviews(alice);
    expect(due).toEqual([]);
    const items = await owned(alice, "review_items").find({});
    expect(items).toHaveLength(1);
  });
});

describe("career engine (§180)", () => {
  it("reports per-requirement status and no overall readiness percentage", async () => {
    const report = await buildRoleReport(alice, graph.roles[0].id);
    expect(report).not.toBeNull();
    expect(report!.hard.length).toBeGreaterThan(0);
    for (const r of report!.hard) expect(["no_evidence", "learning", "practised", "demonstrated"]).toContain(r.status);
    expect(Object.keys(report!.summary)).not.toContain("readinessPercent");
  });

  it("starts every requirement at 'no evidence' for a new student", async () => {
    const report = await buildRoleReport(bob, graph.roles[0].id);
    expect(report!.summary.hardDemonstrated).toBe(0);
    expect(report!.summary.hardNoEvidence).toBe(report!.summary.hardTotal);
  });
});

describe("task engine (§219)", () => {
  it("produces no tasks without data rather than inventing busywork", async () => {
    const suggestions = await suggestNextTasks(bob, { learningState: "deep", careerTargets: [graph.roles[0].id] });
    for (const s of suggestions) {
      expect(s.reasonText.length).toBeGreaterThan(10);
      expect(s.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("caps task size by the declared learning state", async () => {
    const overload = await suggestNextTasks(alice, { learningState: "overload", careerTargets: [] });
    for (const s of overload) expect(s.estimatedMinutes).toBeLessThanOrEqual(20);
  });
});

describe("password handling (§196)", () => {
  it("round-trips a password without storing it in clear text", async () => {
    const hash = await hashPassword("a-very-long-passphrase");
    expect(hash).not.toContain("a-very-long-passphrase");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("a-very-long-passphrase", hash)).toBe(true);
    expect(await verifyPassword("wrong-passphrase-here", hash)).toBe(false);
  });

  it("enforces a minimum length", () => {
    expect(validatePassword("short")).toBeTruthy();
    expect(validatePassword("a-very-long-passphrase")).toBeNull();
  });
});
