import { beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

process.env.DATA_DRIVER = "file";
process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "ihls-actions-"));

/**
 * Integration tests for the server-action pipeline: authentication, validation,
 * rate limiting, ownership scoping and persistence, exercised through the same
 * functions the UI calls. Next.js request primitives are replaced with
 * in-memory equivalents.
 */
const jar = new Map<string, string>();
const headerMap = new Map<string, string>([["user-agent", "vitest"], ["x-forwarded-for", "127.0.0.1"]]);

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string | { name: string; value: string }, value?: string) => {
      if (typeof name === "string") jar.set(name, value ?? "");
      else jar.set(name.name, name.value);
    },
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => ({ get: (k: string) => headerMap.get(k.toLowerCase()) ?? null }),
}));

vi.mock("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {} }));

class RedirectError extends Error {
  constructor(public to: string) {
    super(`REDIRECT:${to}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new RedirectError(to);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

const { resetFileStore } = await import("@/lib/db/file-driver");
const { registerAction, loginAction, logoutAction } = await import("@/app/actions/auth");
const { submitAttemptAction, saveSettingsAction, saveNoteAction, addEvidenceAction, refreshTasksAction, setLearningStateAction } =
  await import("@/app/actions/study");
const { owned } = await import("@/lib/dal");
const { getSession } = await import("@/lib/auth/session");
const { buildCurriculumGraph } = await import("@/content");

const graph = buildCurriculumGraph();
const autoItem = graph.assessments.find((a) => a.evaluation === "auto" && a.numericAnswer !== undefined);
const openItem = graph.assessments.find((a) => a.evaluation !== "auto")!;

const form = (entries: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, value] of Object.entries(entries)) fd.set(k, value);
  return fd;
};

const expectRedirect = async (fn: () => Promise<unknown>, to: string) => {
  await expect(fn()).rejects.toThrow(`REDIRECT:${to}`);
};

let ipCounter = 0;
beforeEach(async () => {
  await resetFileStore();
  jar.clear();
  // Registration and sign-in are rate limited per IP; each test gets its own.
  headerMap.set("x-forwarded-for", `10.0.0.${++ipCounter}`);
});

describe("registration and sign-in", () => {
  it("creates an account, starts a session and signs out again", async () => {
    await expectRedirect(() => registerAction(undefined, form({ email: "Student@Example.com", password: "a-long-enough-passphrase", name: "Student" })), "/dashboard");
    const session = await getSession();
    expect(session?.email).toBe("student@example.com");
    expect(session?.roles).toContain("admin"); // first account

    await expectRedirect(() => logoutAction(), "/login");
    expect(await getSession()).toBeNull();

    await expectRedirect(() => loginAction(undefined, form({ email: "student@example.com", password: "a-long-enough-passphrase" })), "/dashboard");
    expect((await getSession())?.email).toBe("student@example.com");
  });

  it("rejects a weak password and a duplicate email", async () => {
    const weak = await registerAction(undefined, form({ email: "a@example.com", password: "short" }));
    expect(weak?.error).toMatch(/12/);

    await expectRedirect(() => registerAction(undefined, form({ email: "a@example.com", password: "a-long-enough-passphrase" })), "/dashboard");
    const duplicate = await registerAction(undefined, form({ email: "a@example.com", password: "another-long-passphrase" }));
    expect(duplicate?.error).toMatch(/already exists/i);
  });

  it("gives the same answer for a wrong password and an unknown account", async () => {
    await expectRedirect(() => registerAction(undefined, form({ email: "a@example.com", password: "a-long-enough-passphrase" })), "/dashboard");
    await expectRedirect(() => logoutAction(), "/login");
    const wrongPassword = await loginAction(undefined, form({ email: "a@example.com", password: "not-the-right-password" }));
    const unknownUser = await loginAction(undefined, form({ email: "nobody@example.com", password: "not-the-right-password" }));
    expect(wrongPassword?.error).toBe(unknownUser?.error);
  });
});

describe("study actions require a session", () => {
  it("refuses every mutation when signed out", async () => {
    for (const call of [
      () => submitAttemptAction({ assessmentId: openItem.id, answer: "x", helpLevel: "No Help" }),
      () => saveNoteAction({ lessonId: graph.lessons[0].id, kind: "free", content: "x" }),
      () => saveSettingsAction({}),
      () => refreshTasksAction(),
    ]) {
      const result = await call();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe("unauthenticated");
    }
  });
});

describe("signed-in behaviour", () => {
  beforeEach(async () => {
    await expectRedirect(() => registerAction(undefined, form({ email: "learner@example.com", password: "a-long-enough-passphrase", name: "Learner" })), "/dashboard");
  });

  it("validates input and reports field errors", async () => {
    const result = await submitAttemptAction({ assessmentId: openItem.id, answer: "", helpLevel: "No Help" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid");
      expect(result.issues?.join(" ")).toMatch(/answer/i);
    }
  });

  it("stores an open-response attempt without inventing a judgement", async () => {
    const result = await submitAttemptAction({ assessmentId: openItem.id, answer: "My answer in full.", helpLevel: "Hint" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.correct).toBeNull();
      expect(result.data.rubric.length).toBeGreaterThan(0);
      expect(result.data.nextReviewAt).toBeUndefined();
    }
  });

  it("records a self-assessment as the student's own judgement", async () => {
    const result = await submitAttemptAction({ assessmentId: openItem.id, answer: "Answer", helpLevel: "No Help", selfRating: 5 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.correct).toBe(true);
      expect(result.data.nextReviewAt).toBeTruthy();
    }
  });

  it.runIf(autoItem)("checks an auto-gradable item deterministically", async () => {
    const wrong = await submitAttemptAction({ assessmentId: autoItem!.id, answer: "-9999", helpLevel: "No Help" });
    expect(wrong.ok && wrong.data.correct).toBe(false);
    const right = await submitAttemptAction({ assessmentId: autoItem!.id, answer: String(autoItem!.numericAnswer), helpLevel: "No Help" });
    expect(right.ok && right.data.correct).toBe(true);
  });

  it("writes notes and evidence to the signed-in student only", async () => {
    await saveNoteAction({ lessonId: graph.lessons[0].id, kind: "must_write", content: "in my own words" });
    await addEvidenceAction({ kind: "repository", title: "My repo", url: "https://example.com/repo", description: "", skillIds: [] });
    const session = (await getSession())!;
    expect(await owned(session, "notes").count({})).toBe(1);
    const evidence = (await owned(session, "project_evidence").find({})) as unknown as { verified: boolean }[];
    expect(evidence).toHaveLength(1);
    expect(evidence[0].verified).toBe(false); // never auto-verified
  });

  it("rejects a career target that is not a real role", async () => {
    const result = await saveSettingsAction({
      theme: "dark",
      language: "en",
      englishMode: "standard",
      vocabularyAssist: true,
      englishTraining: false,
      reducedMotion: false,
      textSize: "normal",
      readingDensity: "comfortable",
      hintPolicy: "minimal",
      careerTargets: ["role-does-not-exist"],
      notifications: true,
    });
    expect(result.ok).toBe(true);
    const session = (await getSession())!;
    const settings = await owned(session, "settings").findOne({});
    expect((settings as unknown as { careerTargets: string[] }).careerTargets).toEqual([]);
  });

  it("rate-limits a hammered action", async () => {
    let limited = false;
    for (let i = 0; i < 25; i++) {
      const result = await setLearningStateAction({ state: "deep" });
      if (!result.ok && result.code === "rate_limited") {
        limited = true;
        break;
      }
    }
    // The limit for this action is 60/min, so 25 calls must all succeed.
    expect(limited).toBe(false);

    let blocked = false;
    for (let i = 0; i < 40; i++) {
      const result = await setLearningStateAction({ state: "drift" });
      if (!result.ok && result.code === "rate_limited") {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
  });
});
