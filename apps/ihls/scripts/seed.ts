/**
 * Seeds the canonical curriculum into the database (§17, §237).
 *
 * Only curriculum/content collections are seeded. No users, no progress, no
 * projects-in-progress, no analytics: student state must be real (§87, §217).
 */
import { config } from "dotenv";
import { buildCurriculumGraph, validateGraph } from "../src/content/index.js";
import { HARVARD_REALITY_CHECK, HARVARD_GAP_MATRIX } from "../src/content/harvard.js";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

async function main() {
  const { col, describeStorage } = await import("../src/lib/db/index.js");
  const storage = describeStorage();
  console.log(`Storage driver: ${storage.label}`);

  const graph = buildCurriculumGraph();
  const validation = validateGraph(graph);
  if (!validation.ok) {
    console.error("Refusing to seed an invalid graph:");
    for (const e of validation.errors) console.error(`  x ${e}`);
    process.exit(1);
  }

  const sets: [string, Record<string, unknown>[]][] = [
    ["curriculum_stages", graph.stages.map((s) => ({ _id: s.id, ...s }))],
    ["courses", graph.courses.map((c) => ({ _id: c.id, ...c }))],
    ["lessons", graph.lessons.map((l) => ({ _id: l.id, ...l }))],
    ["assessment_items", graph.assessments.map((a) => ({ _id: a.id, ...a }))],
    ["skills", graph.skills.map((s) => ({ _id: s.id, ...s }))],
    ["skill_dependencies", graph.skills.flatMap((s) => s.dependsOn.map((d) => ({ _id: `${s.id}->${d}`, from: s.id, to: d })))],
    ["projects", graph.projects.map((p) => ({ _id: p.id, ...p }))],
    ["career_roles", graph.roles.map((r) => ({ _id: r.id, ...r }))],
    ["english_terms", graph.englishTerms.map((t) => ({ _id: `en_${t.term}`, ...t }))],
    ["sources", graph.sources.map((s) => ({ _id: s.sourceId, ...s }))],
    ["harvard_mappings", graph.harvardMappings.map((m) => ({ _id: m.id, ...m }))],
    [
      "concepts",
      [
        { _id: "reality-check", kind: "harvard_reality_check", ...HARVARD_REALITY_CHECK },
        ...HARVARD_GAP_MATRIX.map((g, i) => ({ _id: `gap-${i}`, kind: "gap_matrix", ...g })),
      ],
    ],
  ];

  for (const [name, docs] of sets) {
    const c = col<{ _id: string }>(name as never);
    await c.deleteMany({});
    await c.insertMany(docs as { _id: string }[]);
    console.log(`  seeded ${String(docs.length).padStart(4)} → ${name}`);
  }

  if (storage.kind === "mongodb") {
    const { ensureIndexes } = await import("../src/lib/db/mongo-driver.js");
    await ensureIndexes();
    console.log("  indexes ensured");
  }

  console.log("\nContent statistics:");
  for (const [k, v] of Object.entries(validation.stats)) console.log(`  ${k.padEnd(18)} ${v}`);
  if (validation.warnings.length) {
    console.log("\nTruthful warnings carried into the admin audit:");
    for (const w of validation.warnings) console.log(`  ! ${w}`);
  }
  console.log("\nSeed complete. No user accounts, progress or analytics were created.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
