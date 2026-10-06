import { buildCurriculumGraph, validateGraph } from "../src/content/index.js";
import { ORIGINAL_MODULES, ORIGINAL_TOPIC_COUNT } from "../src/content/original-curriculum.js";

const graph = buildCurriculumGraph();
const result = validateGraph(graph);

// §237 FINAL CONTENT CHECK — prove the original curriculum survived intact.
const seeded = new Set<string>();
for (const l of graph.lessons) for (const t of l.topics) seeded.add(`${l.courseId}::${t}`);
let missing = 0;
for (const m of ORIGINAL_MODULES) {
  for (const s of m.sessions) {
    for (const t of s.topics) {
      const lesson = graph.lessons.find((l) => l.id === `l-${m.id}-${s.n}`);
      if (!lesson || !lesson.topics.includes(t)) {
        console.error(`MISSING ORIGINAL TOPIC: ${m.title} / ${s.title} / ${t}`);
        missing++;
      }
    }
  }
}

console.log("Content validation");
console.log("------------------");
for (const [k, v] of Object.entries(result.stats)) console.log(`  ${k.padEnd(18)} ${v}`);
console.log(`  original topics    ${ORIGINAL_TOPIC_COUNT} declared / ${ORIGINAL_TOPIC_COUNT - missing} preserved`);
if (result.warnings.length) {
  console.log("\nWarnings (truthful, not failures):");
  for (const w of result.warnings) console.log(`  ! ${w}`);
}
if (result.errors.length) {
  console.error("\nErrors:");
  for (const e of result.errors) console.error(`  x ${e}`);
}
if (!result.ok || missing > 0) process.exit(1);
console.log("\nOK: graph is acyclic, references resolve, original curriculum fully preserved.");
