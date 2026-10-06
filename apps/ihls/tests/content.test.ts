import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { buildCurriculumGraph, validateGraph } from "@/content";
import { ORIGINAL_MODULES, ORIGINAL_TOPIC_COUNT } from "@/content/original-curriculum";
import { SOURCES } from "@/content/sources";

const graph = buildCurriculumGraph();

describe("curriculum graph", () => {
  it("validates: acyclic, no dangling references", () => {
    const result = validateGraph(graph);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("preserves every topic of the original curriculum (§37)", () => {
    const declared = ORIGINAL_MODULES.flatMap((m) => m.sessions.flatMap((s) => s.topics));
    expect(declared.length).toBe(ORIGINAL_TOPIC_COUNT);

    const built = graph.lessons.filter((l) => l.sourceCategory === "Original Curriculum").flatMap((l) => l.topics);
    for (const topic of declared) {
      expect(built, `missing original topic: ${topic}`).toContain(topic);
    }
  });

  it("gives every node exactly one primary source label (§127)", () => {
    const allowed = ["Original Curriculum", "Harvard College", "Harvard Extension", "Industry Extension", "Research Extension"];
    for (const lesson of graph.lessons) {
      expect(allowed).toContain(lesson.sourceCategory);
      expect(typeof lesson.sourceCategory).toBe("string");
    }
    for (const course of graph.courses) expect(allowed).toContain(course.sourceCategory);
  });

  it("never claims an unauthored lesson is authored (§216)", () => {
    for (const lesson of graph.lessons) {
      if (lesson.contentStatus === "authored") expect(lesson.blocks.length).toBeGreaterThan(0);
      else expect(lesson.blocks.length).toBe(0);
    }
  });

  it("only marks assessments auto-gradable when a deterministic key exists", () => {
    for (const a of graph.assessments) {
      if (a.evaluation === "auto") {
        const deterministic = (a.choices && a.correctChoiceIndex !== undefined) || a.numericAnswer !== undefined;
        expect(deterministic, `${a.id} claims auto evaluation without a key`).toBe(true);
      }
    }
  });

  it("keeps verification statuses distinct and never invents a confirmation", () => {
    const allowed = ["confirmed_current", "confirmed_historical", "likely_not_verified", "not_found", "design_decision", "research_hypothesis"];
    for (const s of SOURCES) {
      expect(allowed).toContain(s.verificationStatus);
      // A source can only be "confirmed" if an extract was actually read from it.
      if (s.verificationStatus === "confirmed_current") expect((s.extract ?? []).length).toBeGreaterThan(0);
      expect(s.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("labels every role requirement with a source status (§161)", () => {
    for (const role of graph.roles) {
      expect(role.requirements.length).toBeGreaterThan(0);
      for (const r of role.requirements) expect(r.sourceStatus).toBeTruthy();
      expect(role.disclaimer.length).toBeGreaterThan(10);
    }
  });

  it("has prerequisites that all resolve to real lessons", () => {
    const ids = new Set(graph.lessons.map((l) => l.id));
    for (const l of graph.lessons) for (const p of l.prerequisites) expect(ids.has(p)).toBe(true);
  });
});

describe("no secrets in the repository (§195)", () => {
  const root = path.resolve(__dirname, "..");
  const skip = new Set(["node_modules", ".next", ".git", ".data", "dist", "out", "coverage"]);
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (skip.has(entry)) continue;
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|mjs|json|md|css)$/.test(entry)) files.push(full);
    }
  };
  walk(root);

  it("contains no hard-coded credential patterns", () => {
    const patterns = [
      /mongodb(\+srv)?:\/\/[^\s"']*:[^\s"']+@/i,
      /sk-[A-Za-z0-9]{20,}/,
      /ghp_[A-Za-z0-9]{20,}/,
      /AKIA[0-9A-Z]{16}/,
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    ];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const p of patterns) {
        expect(p.test(text), `possible secret in ${path.relative(root, file)}`).toBe(false);
      }
    }
  });

  it("never exposes a secret through a NEXT_PUBLIC_ variable", () => {
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const matches = text.match(/NEXT_PUBLIC_[A-Z0-9_]+/g) ?? [];
      for (const m of matches) {
        expect(/TOKEN|SECRET|KEY|PASSWORD|URI/.test(m), `${m} in ${path.relative(root, file)}`).toBe(false);
      }
    }
  });

  it("keeps .env.example to names with empty values", () => {
    const text = readFileSync(path.join(root, ".env.example"), "utf8");
    for (const line of text.split("\n")) {
      if (!line.trim() || line.startsWith("#")) continue;
      expect(line).toMatch(/^[A-Z0-9_]+=$/);
    }
  });
});
