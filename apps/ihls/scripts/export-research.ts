/**
 * Generates docs/research/source-register.md and docs/research/harvard-mappings.md
 * directly from the content layer, so the dossier can never drift from the data
 * the application actually serves (§184).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SOURCES } from "../src/content/sources.js";
import { HARVARD_MAPPINGS, HARVARD_REALITY_CHECK, HARVARD_GAP_MATRIX } from "../src/content/harvard.js";

const OUT = path.resolve("docs/research");
mkdirSync(OUT, { recursive: true });

const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

const register = [
  "# Source register",
  "",
  "_Generated from `src/content/sources.ts` by `npm run export:research`. Do not edit by hand._",
  "",
  `${SOURCES.length} records. A record is only \`confirmed_current\` when the page was fetched on the retrieval date and the extract below was read from it.`,
  "",
  "| id | title | publisher | type | retrieved | status |",
  "| --- | --- | --- | --- | --- | --- |",
  ...SOURCES.map(
    (s) => `| \`${s.sourceId}\` | [${esc(s.title)}](${s.url}) | ${esc(s.publisher)} | ${s.sourceType} | ${s.accessedAt} | \`${s.verificationStatus}\` |`,
  ),
  "",
  "## Records in full",
  "",
  ...SOURCES.flatMap((s) => [
    `### ${s.title}`,
    "",
    `- **id:** \`${s.sourceId}\``,
    `- **url:** ${s.url}`,
    `- **publisher:** ${s.publisher}`,
    s.author ? `- **author:** ${s.author}` : "",
    `- **type:** ${s.sourceType}`,
    s.license ? `- **licence:** ${s.license}` : "- **licence:** not stated on the page",
    s.publishedAt ? `- **published:** ${s.publishedAt}` : "",
    `- **retrieved:** ${s.accessedAt}`,
    `- **status:** \`${s.verificationStatus}\``,
    s.notes ? `- **notes:** ${s.notes}` : "",
    "",
    ...(s.extract && s.extract.length
      ? ["**Extract read from the page:**", "", ...s.extract.map((e) => `> ${e}`), ""]
      : ["_No extract: this record was not fetched in this pass and must not be cited as evidence._", ""]),
  ]).filter(Boolean),
].join("\n");

const mappings = [
  "# Harvard mappings",
  "",
  "_Generated from `src/content/harvard.ts` by `npm run export:research`. Do not edit by hand._",
  "",
  "A mapping points this curriculum at a documented Harvard offering. It is **not** a claim of equivalence, accreditation or affiliation.",
  "",
  "## Reality check",
  "",
  `**Question.** ${HARVARD_REALITY_CHECK.question}`,
  "",
  `**Answer.** ${HARVARD_REALITY_CHECK.answer}`,
  "",
  `**Status.** \`${HARVARD_REALITY_CHECK.status}\` — checked ${HARVARD_REALITY_CHECK.checkedAt}.`,
  "",
  "**Evidence.**",
  "",
  ...HARVARD_REALITY_CHECK.evidence.map((e) => `- ${e}`),
  "",
  `**Caveat.** ${HARVARD_REALITY_CHECK.caveat}`,
  "",
  "## Gap and overlap matrix",
  "",
  "| Area | Original curriculum | What the Harvard material adds | Decision | Status |",
  "| --- | --- | --- | --- | --- |",
  ...HARVARD_GAP_MATRIX.map((g) => `| ${esc(g.area)} | ${esc(g.original)} | ${esc(g.harvardAdds)} | ${esc(g.decision)} | \`${g.status}\` |`),
  "",
  "## Mapped offerings",
  "",
  "| identifier | title | offering body | status | informs | verified |",
  "| --- | --- | --- | --- | --- | --- |",
  ...HARVARD_MAPPINGS.map(
    (m) =>
      `| ${m.identifier} | ${esc(m.title)} | ${m.offeringBody} | \`${m.verificationStatus}\` | ${m.mapsToCourses.join(", ") || "—"} | ${m.lastVerified} |`,
  ),
  "",
  "### Evidence per mapping",
  "",
  ...HARVARD_MAPPINGS.flatMap((m) => [`- **${m.identifier} — ${m.title}** (source \`${m.sourceId}\`): ${m.evidence}`]),
  "",
].join("\n");

writeFileSync(path.join(OUT, "source-register.md"), `${register}\n`);
writeFileSync(path.join(OUT, "harvard-mappings.md"), `${mappings}\n`);
console.log(`Wrote docs/research/source-register.md (${SOURCES.length} sources) and docs/research/harvard-mappings.md (${HARVARD_MAPPINGS.length} mappings).`);
