import { count } from "drizzle-orm";
import { db } from "@/db";
import {
  careerRoles,
  curriculumNodes,
  curriculumSources,
  englishTerms,
  jobRequirements,
  jobSnapshots,
  projectsCatalog,
  skills,
} from "@/db/schema";
import {
  careerBlueprints,
  harvardCourses,
  industrySpine,
  learningSciencePrinciples,
  marketJobSnapshots,
  originalModules,
  originalProjects,
  type SourceCategory,
} from "@/data/curriculum";

const SNAPSHOT_DATE = "2026-09-29";
const globalSeed = globalThis as typeof globalThis & {
  __ihlsSeedPromise?: Promise<void>;
};

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type NodeSeed = typeof curriculumNodes.$inferInsert;

function makeCurriculumNodes(): NodeSeed[] {
  const output: NodeSeed[] = [];
  const modulePrerequisites: Record<string, string[]> = {
    "python-programming": [],
    "math-statistics": [],
    "data-analysis-python": ["python-programming", "math-statistics"],
    "excel-power-bi": [],
    "databases-data-engineering": ["python-programming"],
    "machine-learning": ["math-statistics", "python-programming", "data-analysis-python"],
    "deep-learning": ["machine-learning"],
    "development-mlops": ["machine-learning", "databases-data-engineering"],
  };

  for (const [moduleIndex, module] of originalModules.entries()) {
    const moduleSkills = module.units.flatMap((unit) => unit.topics).slice(0, 12);
    output.push({
      id: module.id,
      kind: "module",
      title: module.title,
      parentId: null,
      sourceCategory: module.sourceCategory,
      level: "Core",
      stage: module.track,
      description: `${module.sessions}-session source module. ${module.note ?? ""}`.trim(),
      why: "This original curriculum material is preserved in full and connects practical tool fluency to demonstrable competence.",
      learningObjectives: ["Explain key ideas", "Solve a representative problem", "Transfer the idea to a new context", "Build or analyze an artifact where appropriate"],
      skills: moduleSkills,
      prerequisites: modulePrerequisites[module.id] ?? [],
      corequisites: module.id === "data-analysis-python" ? ["math-statistics"] : [],
      estimatedEffort: module.sessions * 2,
      masteryCriteria: { completion: "Evidence-based, not view-based", requiredEvidence: ["recall", "application", "transfer"], target: "Independent core-prerequisite competence" },
      assessments: ["Free recall or explanation", "Independent application", "Transfer task", "Project checkpoint where appropriate"],
      projectRefs: [],
      sources: [{ title: "Learner-provided original curriculum specification", url: "https://local/learner-provided-curriculum", status: "design_decision" }],
      content: { sessionCount: module.sessions, sessionMap: module.note ?? "Original session count retained", unitCount: module.units.length },
      version: 1,
      lastVerified: SNAPSHOT_DATE,
      changeNotes: `Original Curriculum preserved verbatim; module ${moduleIndex + 1} of 8.`,
    });

    module.units.forEach((unit, unitIndex) => {
      const unitId = `${module.id}-unit-${unitIndex + 1}`;
      output.push({
        id: unitId,
        parentId: module.id,
        kind: "unit",
        title: unit.title,
        sourceCategory: module.sourceCategory,
        level: "Core",
        stage: module.track,
        description: unit.sessionAllocation ? `Original session allocation: ${unit.sessionAllocation}.` : "Original topic group; session pacing remains flexible.",
        why: `This unit contributes to ${module.title} while preserving the source outline's structure.`,
        learningObjectives: ["Explain the unit's concepts", "Apply the unit's methods", "Identify a limitation or common error"],
        skills: unit.topics.slice(0, 12),
        prerequisites: [module.id],
        corequisites: [],
        estimatedEffort: Math.max(1, Math.ceil(unit.topics.length / 3)),
        masteryCriteria: { requiredEvidence: ["recall", "application"], transfer: "Required for high-value concepts" },
        assessments: ["Short-answer retrieval", "Worked-to-independent practice", "Debugging or transfer where appropriate"],
        projectRefs: [],
        sources: [{ title: "Learner-provided original curriculum specification", url: "https://local/learner-provided-curriculum", status: "design_decision" }],
        content: { originalTopics: unit.topics, sessionAllocation: unit.sessionAllocation ?? "Adaptive; do not invent a source schedule" },
        version: 1,
        lastVerified: SNAPSHOT_DATE,
        changeNotes: "Source heading and topics preserved.",
      });

      unit.topics.forEach((topic, topicIndex) => {
        const id = `${module.id}-u${unitIndex + 1}-t${topicIndex + 1}`;
        const isFirstPythonConcept = module.id === "python-programming" && unitIndex === 0 && topicIndex === 0;
        output.push({
          id,
          parentId: unitId,
          kind: "lesson",
          title: topic,
          sourceCategory: module.sourceCategory,
          level: "Core",
          stage: module.track,
          description: `Original curriculum topic: ${topic}.`,
          why: isFirstPythonConcept ? "As an AI engineer, Python is a practical medium for data work, model experiments, automation and production services. Learn the language foundations so you can inspect and debug what libraries do." : `This topic supports independent competence in ${module.title}. Connect it to a worked example, an attempt, feedback and a changed-context transfer task.`,
          learningObjectives: [`Explain ${topic} in your own words`, `Use or reason about ${topic} without copying a worked answer`, `Identify one failure mode or boundary`],
          skills: [topic],
          prerequisites: [unitId],
          corequisites: [],
          estimatedEffort: 1,
          masteryCriteria: { recall: "Explain or reconstruct the central idea", application: "Complete an independent representative task", transfer: "Solve a changed-context task for core concepts", independence: "Record the hint level used" },
          assessments: ["Free recall", "Attempt-first practice", "Transfer challenge"],
          projectRefs: [],
          sources: [{ title: "Learner-provided original curriculum specification", url: "https://local/learner-provided-curriculum", status: "design_decision" }],
          content: isFirstPythonConcept
            ? {
                objective: "Describe what a program is and explain the role of an interpreter at a high level.",
                mentalModel: "A program is a written set of instructions. Python code is read and executed by a Python implementation; the interpreter is not magic, and errors are information about how execution differed from your model.",
                example: "Run `print(2 + 3)` in a Python REPL. Predict the output first, then explain which expression is evaluated and what `print` does.",
                task: "Without running it, predict the output of `print(2 * 3 + 1)`. State the order of operations that led to your prediction.",
                hint: "Multiplication binds more tightly than addition. Work out the multiplication before the addition.",
                transfer: "Predict `print(2 * (3 + 1))` and explain why the parentheses change the result compared with the previous expression.",
                mustWrite: ["Concept in your own words", "One example and its output", "One common mistake", "Why this matters for AI engineering"],
                recommendedNotes: ["Python version and command used", "One question to retrieve later"],
                optionalNotes: ["Reference links and syntax details"],
                notebookRule: "Do not copy the whole lesson. Record only the core idea, your example, a common error, and one retrieval question.",
              }
            : {
                objective: `Explain and apply ${topic}.`,
                task: `Describe ${topic} from memory, then complete one independent example.`,
                transfer: `Apply ${topic} in a new dataset, code example, constraint or engineering context.`,
                mustWrite: ["Concept in your own words", "One essential rule, formula or structure", "One worked example", "One common mistake", "Why and when to use it"],
                notebookRule: "Capture a compact reference, not a transcript.",
              },
          version: 1,
          lastVerified: SNAPSHOT_DATE,
          changeNotes: "Original topic retained as an individually addressable learning node.",
        });
      });
    });
  }

  for (const extension of industrySpine) {
    output.push({
      id: extension.id,
      parentId: null,
      kind: "extension",
      title: extension.title,
      sourceCategory: extension.id === "research-engineering" ? "Research Extension" : "Industry Extension",
      level: extension.level,
      stage: extension.title,
      description: extension.topics.join(" · "),
      why: extension.why,
      learningObjectives: [`Explain the core ideas in ${extension.title}`, "Build or evaluate an artifact", "Transfer reasoning to a novel scenario"],
      skills: extension.topics,
      prerequisites: extension.prerequisites,
      corequisites: [],
      estimatedEffort: Math.max(8, Math.ceil(extension.topics.length * 1.5)),
      masteryCriteria: { evidence: ["recall", "application", "transfer", "implementation"], progress: "Core threshold first; elective and research depth later" },
      assessments: ["Problem set", "Code reading or debugging", "Case decision", "Project or research artifact"],
      projectRefs: [],
      sources: [{ title: "Ismaili curriculum design specification", url: "https://local/learning-system-specification", status: "design_decision" }],
      content: { topics: extension.topics, studyApproach: "Interleave only after initial familiarity; scaffold and fade support." },
      version: 1,
      lastVerified: SNAPSHOT_DATE,
      changeNotes: "Additive Industry/Research Extension; not labeled as Harvard coursework.",
    });
    extension.topics.forEach((topic, index) => {
      output.push({
        id: `${extension.id}-t${index + 1}`,
        parentId: extension.id,
        kind: "lesson",
        title: topic,
        sourceCategory: extension.id === "research-engineering" ? "Research Extension" : "Industry Extension",
        level: extension.level,
        stage: extension.title,
        description: `${topic} within ${extension.title}.`,
        why: extension.why,
        learningObjectives: [`Explain ${topic}`, `Use ${topic} in a bounded practice task`, "Identify one trade-off or failure mode"],
        skills: [topic],
        prerequisites: [extension.id],
        corequisites: [],
        estimatedEffort: 1,
        masteryCriteria: { independentEvidence: true, transfer: "Required for core skills" },
        assessments: ["Free response", "Case/implementation task", "Transfer"],
        projectRefs: [],
        sources: [{ title: "Industry/research extension design mapping", url: "https://local/learning-system-specification", status: "design_decision" }],
        content: { task: `Explain ${topic} in your own words and apply it to a changed-context scenario.`, mustWrite: ["Core idea", "When to use it", "One risk or limitation"] },
        version: 1,
        lastVerified: SNAPSHOT_DATE,
        changeNotes: "Additive topic-level node.",
      });
    });
  }

  for (const course of harvardCourses) {
    const sourceCategory = course.sourceCategory as SourceCategory;
    output.push({
      id: course.id,
      parentId: null,
      kind: "course_reference",
      title: course.title,
      sourceCategory,
      level: course.level,
      stage: course.sourceCategory,
      description: course.description,
      why: "Use official Harvard course structure as a depth/reference layer; this self-study program does not grant Harvard credit or imply enrollment.",
      learningObjectives: ["Compare course content with the personal curriculum", "Check the course's current catalog/syllabus before planning", "Preserve source status and term"],
      skills: course.mapsTo,
      prerequisites: course.id === "hc-cs1810" ? ["python-programming", "math-statistics"] : course.mapsTo.slice(0, 1),
      corequisites: [],
      estimatedEffort: course.sourceCategory === "Harvard Extension" ? 24 : 24,
      masteryCriteria: { mappingStatus: course.status, evidenceMode: course.evidenceMode },
      assessments: [course.evidenceMode],
      projectRefs: [],
      sources: [{ title: course.title, url: course.sourceUrl, status: course.status }],
      content: { term: course.term ?? null, prerequisites: course.prerequisites ?? [], mapsTo: course.mapsTo, evidenceMode: course.evidenceMode, disclaimer: "Reference map only; not a Harvard credential or full course replication." },
      version: 1,
      lastVerified: SNAPSHOT_DATE,
      changeNotes: `Harvard mapping status: ${course.status}. Re-verify before publishing a new term plan.`,
    });
  }
  return output;
}

function validatePrerequisiteDag(nodes: NodeSeed[]): void {
  const ids = new Set(nodes.map((node) => node.id));
  for (const node of nodes) {
    for (const prerequisite of node.prerequisites ?? []) {
      if (!ids.has(prerequisite)) {
        throw new Error(`Curriculum prerequisite ${prerequisite} referenced by ${node.id} is missing.`);
      }
    }
  }
  const graph = new Map(nodes.map((node) => [node.id, node.prerequisites ?? []]));
  const active = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (active.has(id)) throw new Error(`Curriculum prerequisite cycle detected at ${id}.`);
    if (visited.has(id)) return;
    active.add(id);
    for (const prerequisite of graph.get(id) ?? []) visit(prerequisite);
    active.delete(id);
    visited.add(id);
  };
  for (const id of ids) visit(id);
}

const sourceSeed = [
  { id: "src-harvard-cs-requirements", title: "Harvard CS Concentration Requirements", url: "https://csadvising.seas.harvard.edu/concentration/requirements/", status: "confirmed_current", notes: "Concentration structure; not a standalone AI Engineering degree." },
  { id: "src-harvard-cs-course-tags", title: "Harvard CS Course Tags", url: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", status: "confirmed_current", notes: "Continuously updated course-tag reference; offering must still be checked." },
  { id: "src-cs50-fall-2026", title: "CS50 College Fall 2026 Syllabus", url: "https://cs50.harvard.edu/college/2026/fall/syllabus/", status: "confirmed_current", notes: "Course-specific schedule, assessments, grading and AI policy." },
  { id: "src-cs1810-spring-2026", title: "CS1810 Spring 2026 Catalog", url: "https://beta.my.harvard.edu/course/COMPSCI1810/2026-Spring/001", status: "confirmed_current", notes: "Term-specific catalog description and prerequisites; not full weekly syllabus." },
  { id: "src-hes-ai-certificate", title: "Harvard Extension Artificial Intelligence Graduate Certificate", url: "https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/", status: "confirmed_current", notes: "Four program categories; actual course choices vary by term." },
  { id: "src-hes-dsai-alm", title: "Harvard Extension Data Science and AI ALM Requirements", url: "https://extension.harvard.edu/academics/programs/data-science-artificial-intelligence-graduate-program/data-science-artificial-intelligence-degree-requirements/", status: "confirmed_current", notes: "12 graduate courses, on-campus precapstone, applied capstone; separate from College." },
  { id: "src-learning-review", title: "Teaching the Science of Learning", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5780548/", status: "confirmed_current", notes: "Research review; strategies have context-dependent limits." },
  { id: "src-next-auth", title: "Next.js Authentication Guide", url: "https://nextjs.org/docs/app/guides/authentication", status: "confirmed_current", notes: "Authentication, sessions, authorization, DAL, DTO guidance." },
  { id: "src-owasp-api", title: "OWASP API Security Top 10 (2023)", url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/", status: "confirmed_current", notes: "Security reference edition checked in this research pass." },
  { id: "src-puter-chat", title: "Puter AI Chat Documentation", url: "https://docs.puter.com/AI/chat/", status: "confirmed_current", notes: "Provider interface; this deployment's credentials/availability are not assumed." },
  { id: "src-aws-mlops", title: "AWS Well-Architected ML Lens: MLOps", url: "https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/mlops04-bp01.html", status: "confirmed_current", notes: "Vendor-specific guidance for lifecycle, automation, monitoring and rollback." },
  { id: "src-anthropic-safeguards-infrastructure-role", title: "Machine Learning Infrastructure Engineer, Safeguards Research", url: "https://job-boards.greenhouse.io/anthropic/jobs/5364804008", status: "confirmed_current", notes: "First-party listing checked 2026-09-29; specific role/location, not a general market estimate. Recheck before reuse." },
  { id: "src-coursera-guided-project-pedagogy", title: "Coursera Guided Projects Pedagogy", url: "https://blog.coursera.org/coursera-white-paper-details-the-pedagogy-underlying-guided-projects-on-coursera/", status: "confirmed_current", notes: "Coursera-authored description of project scaffolding and challenge mode; product evidence is vendor-authored." },
  { id: "src-owasp-llm-2025-prompt-injection", title: "OWASP LLM01:2025 Prompt Injection", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM01_PromptInjection.html", status: "confirmed_current", notes: "2025 LLM application security risks and mitigations; prompt boundaries do not guarantee prevention." },
  { id: "src-owasp-llm-2025-excessive-agency", title: "OWASP LLM06:2025 Excessive Agency", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency.html", status: "confirmed_current", notes: "Least functionality, permissions and autonomy; human approval for high-impact actions." },
  { id: "src-azure-ai103", title: "Microsoft AI-103 Skills Measured", url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-103", status: "confirmed_current", notes: "Skills measured as of 2026-04-16; Azure vendor certification scope, not a universal job standard." },
  { id: "src-azure-ai300", title: "Microsoft AI-300 Skills Measured", url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-300", status: "confirmed_current", notes: "Azure-specific MLOps/GenAIOps scope; certification guide, not a university curriculum." },
];

const seededEnglishTerms = [
  ["abstraction", "A way to focus on essential behavior while hiding lower-level details behind a defined interface.", "The abstraction lets the caller use storage without knowing the internal representation."],
  ["observability", "The ability to infer a system's internal behavior from its outputs, logs, traces and metrics.", "We added tracing to improve observability of the retrieval pipeline."],
  ["idempotency", "A property where repeating an operation with the same request has no additional unintended effect.", "The payment endpoint uses an idempotency key to avoid duplicate charges."],
  ["generalization", "A model's ability to perform on relevant unseen examples beyond its training data.", "We tested generalization on a held-out population and a later time period."],
  ["calibration", "Agreement between predicted confidence and the observed frequency of outcomes.", "The classifier's calibration was poor even though its ranking quality was useful."],
  ["inference", "Using a trained model to compute outputs for new inputs, or drawing a conclusion from evidence.", "The service performs inference after validating the request schema."],
  ["orchestration", "Coordinating multiple steps, tools, services or jobs with explicit control flow.", "The orchestration layer records retries and each model step."],
  ["concurrency", "Managing multiple operations whose execution overlaps in time.", "The API limits concurrency to keep memory usage predictable."],
  ["reproducibility", "The ability to rerun a process with tracked data, code, parameters and environment and obtain comparable results.", "Pinned dependencies and dataset versions improved reproducibility."],
  ["maintainability", "How easily software can be understood, changed and tested over time.", "The smaller modules improved maintainability of the training pipeline."],
  ["scalability", "A system's ability to handle growth in workload while meeting relevant performance constraints.", "We measured scalability by increasing request volume and recording tail latency."],
  ["uncertainty", "A representation of what is not known or how variable plausible outcomes may be.", "The report states uncertainty instead of presenting a point estimate as fact."],
  ["trade-off", "A choice where improving one objective can worsen another under constraints.", "We accepted a latency trade-off to reduce inference cost."],
].map(([term, definition, example]) => ({ id: `eng-${slug(term)}`, term, definition, arabicMeaning: null, example, topic: "Professional technical English" }));

function buildSkillRows(): Array<typeof skills.$inferInsert> {
  const result = new Map<string, typeof skills.$inferInsert>();
  const add = (title: string, category: string, sourceCategory: string, nodeId: string) => {
    const id = `skill-${slug(title)}`;
    const prior = result.get(id);
    if (prior) {
      prior.nodeIds = [...new Set([...(prior.nodeIds ?? []), nodeId])];
      return;
    }
    result.set(id, { id, title, category, sourceCategory, description: `Demonstrate ${title} through independent recall, application, transfer or an artifact.`, nodeIds: [nodeId] });
  };
  for (const module of originalModules) {
    add(module.title, module.track, module.sourceCategory, module.id);
    for (const unit of module.units) for (const topic of unit.topics) add(topic, module.track, module.sourceCategory, `${module.id}-unit-${module.units.indexOf(unit) + 1}`);
  }
  for (const extension of industrySpine) {
    add(extension.title, "Professional Engineering", extension.id === "research-engineering" ? "Research Extension" : "Industry Extension", extension.id);
    for (const topic of extension.topics) add(topic, "Professional Engineering", extension.id === "research-engineering" ? "Research Extension" : "Industry Extension", extension.id);
  }
  for (const role of careerBlueprints) for (const skill of role.skills) add(skill, "Career requirement", "Industry Extension", role.id);
  return [...result.values()];
}

async function seedAll(): Promise<void> {
  const nodes = makeCurriculumNodes();
  validatePrerequisiteDag(nodes);
  const [{ value: nodeCount }] = await db.select({ value: count() }).from(curriculumNodes);
  if (nodeCount < nodes.length) {
    for (let offset = 0; offset < nodes.length; offset += 250) {
      await db.insert(curriculumNodes).values(nodes.slice(offset, offset + 250)).onConflictDoNothing();
    }
  }

  const [{ value: projectCount }] = await db.select({ value: count() }).from(projectsCatalog);
  if (projectCount < originalProjects.length) {
    await db.insert(projectsCatalog).values(originalProjects.map((project) => ({
      ...project,
      brief: `${project.title} is a preserved project idea. Plan a real, lawful data source, acceptance criteria, evaluation, failure analysis and limitations before claiming any result.`,
      definitionOfDone: ["Problem and constraints documented", "Data provenance recorded where data is used", "Tests and evaluation included", "Failures and limitations stated", "Evidence linked to a repository/report/demo only after it exists"],
    }))).onConflictDoNothing();
  }

  await db.insert(curriculumSources).values(sourceSeed.map((source) => ({
    id: source.id,
    title: source.title,
    url: source.url,
    author: "",
    publisher: source.title.startsWith("Harvard") || source.title.startsWith("CS50") ? "Harvard University / Harvard Extension School" : source.title.startsWith("OWASP") ? "OWASP" : source.title.startsWith("Puter") ? "Puter" : source.title.startsWith("AWS") ? "Amazon Web Services" : "Peer-reviewed research / official documentation",
    sourceType: source.id.startsWith("src-learning") ? "research_review" : "official_primary_source",
    license: "Copyright remains with publisher; link and citation only; no source content copied.",
    accessedAt: SNAPSHOT_DATE,
    verificationStatus: source.status,
    notes: source.notes,
  }))).onConflictDoNothing();

  const [{ value: roleCount }] = await db.select({ value: count() }).from(careerRoles);
  if (roleCount < careerBlueprints.length) {
    for (const role of careerBlueprints) {
      await db.insert(careerRoles).values({
        id: role.id,
        title: role.title,
        sourceStatus: role.sourceStatus,
        sourceNote: role.sourceNote,
        region: null,
        seniority: null,
        sourceUrl: null,
        snapshotDate: SNAPSHOT_DATE,
      }).onConflictDoNothing();
      await db.insert(jobRequirements).values(role.skills.map((skill) => ({
        id: `${role.id}-${slug(skill)}`,
        roleId: role.id,
        skillName: skill,
        requirementType: "learner_supplied_blueprint",
        confidence: "not_a_verified_job_posting",
      }))).onConflictDoNothing();
    }
  }
  await db.insert(jobSnapshots).values(marketJobSnapshots.map((snapshot) => ({
    ...snapshot,
    requirements: snapshot.requirements as Array<{ skill: string; type: "required" | "preferred" }>,
  }))).onConflictDoNothing();

  const skillRows = buildSkillRows();
  const [{ value: skillCount }] = await db.select({ value: count() }).from(skills);
  if (skillCount < skillRows.length) {
    for (let offset = 0; offset < skillRows.length; offset += 250) {
      await db.insert(skills).values(skillRows.slice(offset, offset + 250)).onConflictDoNothing();
    }
  }
  await db.insert(englishTerms).values(seededEnglishTerms).onConflictDoNothing();
  // Stored as a machine-readable curriculum node rather than artificial learner events.
  await db.insert(curriculumNodes).values({
    id: "ihls-learning-science-configuration",
    parentId: null,
    kind: "learning_science_configuration",
    title: "Ismaili Harvard Learning Science (IHLS)",
    sourceCategory: "Research Extension",
    level: "Research hypotheses + evidence-informed design",
    stage: "Learning system",
    description: "A human-centered, non-diagnostic study framework using evidence-informed principles with explicit hypotheses.",
    why: "Preserve a stable learning loop while adjusting presentation to a learner-selected study state.",
    learningObjectives: ["Practice retrieval", "Space useful review", "Apply and transfer concepts", "Separate evidence from completion", "Keep independent and AI-assisted performance distinct"],
    skills: ["Retrieval practice", "Spacing", "Interleaving", "Feedback", "Transfer", "Adaptive scaffolding"],
    prerequisites: [],
    corequisites: [],
    estimatedEffort: 0,
    masteryCriteria: { evidenceLevel: "principles are research-informed; state-adaptive and attempt-first workflows remain hypotheses" },
    assessments: ["Immediate performance", "Delayed performance", "Transfer performance", "Independence"],
    projectRefs: [],
    sources: [{ title: "Teaching the Science of Learning", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5780548/", status: "research_review" }],
    content: { principles: learningSciencePrinciples, states: ["deep", "drift", "fog", "overload"], diagnosticUse: false, timing: "Flexible; no mandatory Pomodoro" },
    version: 1,
    lastVerified: SNAPSHOT_DATE,
    changeNotes: "Evidence-informed strategies and product hypotheses are intentionally labeled separately.",
  }).onConflictDoNothing();
}

export async function ensureCurriculumSeeded(): Promise<void> {
  if (!globalSeed.__ihlsSeedPromise) {
    globalSeed.__ihlsSeedPromise = seedAll().catch((error: unknown) => {
      globalSeed.__ihlsSeedPromise = undefined;
      throw error;
    });
  }
  return globalSeed.__ihlsSeedPromise;
}

export { slug as makeSlug };
