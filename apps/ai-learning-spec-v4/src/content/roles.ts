import type { Skill, TargetRole } from "./types";

// Skill taxonomy — the skill graph nodes. Lessons and projects reference these slugs.
export const SKILLS: Skill[] = [
  { slug: "python-core", name: "Python Programming", area: "programming" },
  { slug: "algorithms", name: "Algorithms & Data Structures", area: "programming" },
  { slug: "software-engineering", name: "Software Engineering Practice", area: "engineering" },
  { slug: "debugging", name: "Debugging & Diagnosis", area: "engineering" },
  { slug: "linear-algebra", name: "Linear Algebra", area: "mathematics" },
  { slug: "calculus-optimization", name: "Calculus & Optimization", area: "mathematics" },
  { slug: "statistics", name: "Statistics & Inference", area: "mathematics" },
  { slug: "probability", name: "Probability & Bayes", area: "mathematics" },
  { slug: "numpy-pandas", name: "NumPy & Pandas", area: "data" },
  { slug: "eda", name: "Exploratory Data Analysis", area: "data" },
  { slug: "visualization", name: "Data Visualization & Storytelling", area: "data" },
  { slug: "business-analytics", name: "Excel & Power BI Analytics", area: "data" },
  { slug: "sql", name: "SQL & Database Design", area: "data" },
  { slug: "data-engineering", name: "Data Engineering & Pipelines", area: "data" },
  { slug: "classical-ml", name: "Classical Machine Learning", area: "machine_learning" },
  { slug: "evaluation", name: "Model Evaluation & Failure Analysis", area: "machine_learning" },
  { slug: "deep-learning", name: "Deep Learning", area: "deep_learning" },
  { slug: "computer-vision", name: "Computer Vision", area: "deep_learning" },
  { slug: "time-series", name: "Time Series & Sequence Models", area: "deep_learning" },
  { slug: "nlp", name: "Natural Language Processing", area: "llm" },
  { slug: "llm-engineering", name: "LLMs, RAG & Agents", area: "llm" },
  { slug: "mlops-deployment", name: "Deployment & MLOps", area: "cloud_mlops" },
  { slug: "cloud", name: "Cloud Engineering (AWS/Azure)", area: "cloud_mlops" },
  { slug: "communication", name: "Technical Communication (English)", area: "communication" },
  { slug: "research", name: "Research & Paper Reading", area: "research" },
];

export function getSkill(slug: string) {
  return SKILLS.find((s) => s.slug === slug);
}

// ---------------------------------------------------------------------------
// Target roles (spec §161–162). These are student-supplied reference blueprints.
// They are reference roles for gap analysis, NOT employment guarantees, and
// their current availability must be re-verified against the live postings.
// ---------------------------------------------------------------------------

export const TARGET_ROLES: TargetRole[] = [
  {
    slug: "navisoft-ai-engineer",
    title: "Reference Role A · Navisoft-style AI Engineer",
    blueprint:
      "Blueprint supplied in the build specification (student-provided). Classic full-spectrum AI/ML + data engineering role.",
    status: "likely_not_verified",
    sourceUrl: "https://app.devfound.ai/jobs/ai-engineers-navisoft/140943",
    summary:
      "AI/ML model development across TensorFlow/PyTorch, NLP, statistical modeling, big-data tooling (Hadoop/Spark/ETL), SQL and database design, AWS deployment, plus breadth across R/SAS/Bash/Java/C. Depth targets: Python & SQL deep; Bash strong; C foundation; R applied; SAS/Java targeted familiarity.",
    requirements: [
      { skillSlug: "python-core", kind: "hard" },
      { skillSlug: "classical-ml", kind: "hard", note: "Predictive modeling, model evaluation, data mining" },
      { skillSlug: "deep-learning", kind: "hard", note: "TensorFlow; PyTorch familiarity" },
      { skillSlug: "nlp", kind: "hard" },
      { skillSlug: "statistics", kind: "hard", note: "Statistical modeling; R/SAS familiarity" },
      { skillSlug: "sql", kind: "hard", note: "SQL + database design" },
      { skillSlug: "data-engineering", kind: "hard", note: "ETL; Hadoop/Spark concepts; Talend awareness" },
      { skillSlug: "cloud", kind: "hard", note: "AWS deployment of scalable systems" },
      { skillSlug: "mlops-deployment", kind: "hard" },
      { skillSlug: "evaluation", kind: "hard" },
      { skillSlug: "llm-engineering", kind: "preferred", note: "Generative AI" },
      { skillSlug: "algorithms", kind: "preferred" },
      { skillSlug: "communication", kind: "preferred" },
      { skillSlug: "debugging", kind: "preferred" },
    ],
  },
  {
    slug: "nuwave-production-ai-engineer",
    title: "Reference Role B · NUWAVE-style Production AI Engineer",
    blueprint:
      "Blueprint supplied in the build specification (student-provided). Modern production AI role: cloud-native, agentic, security-aware.",
    status: "likely_not_verified",
    sourceUrl: "https://jobs.nuwave.com/apply/JshTpQ8tb8/AI-Engineer",
    summary:
      "Python + TypeScript, AWS & Azure (serverless, containers, identity), RAG/GraphRAG, vector search, agent workflows (LangGraph/LangChain), IaC (Terraform/OpenTofu), observability, testing/deployment/rollback, security & ISO/IEC 42001 concepts, distributed systems, incident response, technical documentation.",
    requirements: [
      { skillSlug: "python-core", kind: "hard" },
      { skillSlug: "llm-engineering", kind: "hard", note: "RAG, GraphRAG, vector search, multi-agent orchestration" },
      { skillSlug: "cloud", kind: "hard", note: "AWS + Azure, serverless, containers, Entra ID" },
      { skillSlug: "mlops-deployment", kind: "hard", note: "Deployment, rollback, IaC, observability" },
      { skillSlug: "software-engineering", kind: "hard", note: "Git, testing, TypeScript, documentation" },
      { skillSlug: "data-engineering", kind: "hard", note: "Data + graph databases" },
      { skillSlug: "sql", kind: "hard" },
      { skillSlug: "debugging", kind: "hard", note: "Incident response" },
      { skillSlug: "communication", kind: "hard", note: "Technical documentation, client-facing English" },
      { skillSlug: "evaluation", kind: "preferred", note: "AI quality/safety evaluation" },
      { skillSlug: "deep-learning", kind: "preferred" },
      { skillSlug: "nlp", kind: "preferred" },
      { skillSlug: "research", kind: "familiarity" },
    ],
  },
];

export function getRole(slug: string) {
  return TARGET_ROLES.find((r) => r.slug === slug);
}

/**
 * Readiness gates (spec §180): per-skill, evidence-based, never a universal
 * completion percentage. Thresholds are design decisions, labeled as such.
 */
export const SKILL_GATES = {
  developing: { minLevel: 2, label: "Developing" },
  competent: { minLevel: 4, label: "Competent" },
  independent: { minLevel: 6, label: "Independently demonstrated" },
} as const;
