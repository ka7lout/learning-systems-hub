import type { CareerRole, RoleRequirement } from "./types";

/**
 * §161–§164. Target roles are encoded from the blueprints the student supplied.
 * The live postings were NOT re-verified in this build pass, so every role is
 * marked `likely_not_verified` and the UI states that location, seniority and
 * availability are unknown. No employment is implied or promised (§242).
 */

const req = (id: string, label: string, kind: "hard" | "preferred", skillIds: string[]): RoleRequirement => ({
  id,
  label,
  kind,
  skillIds,
  sourceStatus: "likely_not_verified",
});

export const ROLES: CareerRole[] = [
  {
    id: "role-navisoft",
    title: "AI Engineer (Navisoft-style blueprint)",
    referenceEmployer: "Navisoft (reference listing supplied by the student)",
    referenceUrl: "https://app.devfound.ai/jobs/ai-engineers-navisoft/140943",
    verificationStatus: "likely_not_verified",
    locationNote: "Unknown — the live listing was not re-verified during this build. Confirm before applying.",
    seniorityNote: "Unknown — not stated in the encoded blueprint.",
    disclaimer:
      "This is a target blueprint for study planning. It is not an application, not an endorsement, and not evidence that the role is open.",
    requirements: [
      req("nv-ml", "AI/ML model development", "hard", ["sk-ml-workflow", "sk-regression", "sk-classification", "sk-ensembles"]),
      req("nv-tf", "TensorFlow", "hard", ["sk-dl-training"]),
      req("nv-torch", "PyTorch", "hard", ["sk-dl-training"]),
      req("nv-nlp", "NLP", "hard", ["sk-nlp", "sk-transformers"]),
      req("nv-stat", "Statistical modelling", "hard", ["sk-statistics", "sk-probability"]),
      req("nv-r", "R", "preferred", ["sk-statistics"]),
      req("nv-sas", "SAS", "preferred", ["sk-statistics"]),
      req("nv-sql", "SQL", "hard", ["sk-sql"]),
      req("nv-dbdesign", "Database design", "hard", ["sk-sql"]),
      req("nv-hadoop", "Hadoop", "preferred", ["sk-data-engineering"]),
      req("nv-spark", "Spark", "hard", ["sk-data-engineering"]),
      req("nv-etl", "ETL", "hard", ["sk-data-engineering"]),
      req("nv-talend", "Talend", "preferred", ["sk-data-engineering"]),
      req("nv-aws", "AWS", "hard", ["sk-cloud-aws"]),
      req("nv-predictive", "Predictive modelling", "hard", ["sk-regression", "sk-ensembles"]),
      req("nv-genai", "Generative AI", "hard", ["sk-transformers", "sk-rag"]),
      req("nv-bash", "Bash", "preferred", ["sk-bash-linux"]),
      req("nv-vba", "VBA", "preferred", ["sk-excel-powerbi"]),
      req("nv-python", "Python", "hard", ["sk-python-core", "sk-python-oop"]),
      req("nv-java", "Java", "preferred", ["sk-typescript"]),
      req("nv-c", "C", "preferred", ["sk-c-memory"]),
      req("nv-eval", "Model evaluation", "hard", ["sk-classification", "sk-llm-eval"]),
      req("nv-mining", "Data mining", "hard", ["sk-unsupervised", "sk-eda"]),
      req("nv-scalable", "Scalable systems", "hard", ["sk-data-engineering", "sk-os-concurrency"]),
      req("nv-deploy", "Cloud deployment", "hard", ["sk-cloud-aws", "sk-containers", "sk-mlops"]),
    ],
  },
  {
    id: "role-nuwave",
    title: "Production AI Engineer (NUWAVE-style blueprint)",
    referenceEmployer: "NUWAVE (reference listing supplied by the student)",
    referenceUrl: "https://jobs.nuwave.com/apply/JshTpQ8tb8/AI-Engineer",
    verificationStatus: "likely_not_verified",
    locationNote: "Unknown — location restrictions were not re-verified during this build. Confirm before applying.",
    seniorityNote: "Unknown — not stated in the encoded blueprint.",
    disclaimer:
      "Reference role, not an employment guarantee. Verify the current listing, its location restrictions and its seniority before treating it as a target.",
    requirements: [
      req("nw-python", "Python", "hard", ["sk-python-core", "sk-python-oop"]),
      req("nw-ts", "TypeScript", "hard", ["sk-typescript"]),
      req("nw-aws", "AWS", "hard", ["sk-cloud-aws"]),
      req("nw-azure", "Azure", "hard", ["sk-cloud-azure"]),
      req("nw-serverless", "Serverless", "hard", ["sk-cloud-aws"]),
      req("nw-containers", "Containers", "hard", ["sk-containers"]),
      req("nw-identity", "Identity", "hard", ["sk-security", "sk-cloud-azure"]),
      req("nw-data", "Data", "hard", ["sk-sql", "sk-data-engineering"]),
      req("nw-observability", "Observability", "hard", ["sk-observability"]),
      req("nw-rag", "RAG", "hard", ["sk-rag"]),
      req("nw-graphrag", "GraphRAG", "hard", ["sk-graphrag"]),
      req("nw-vector", "Vector search", "hard", ["sk-rag"]),
      req("nw-graphdb", "Graph databases", "preferred", ["sk-graphrag"]),
      req("nw-agents", "Agent workflows", "hard", ["sk-agents"]),
      req("nw-codingagents", "AI coding agents", "preferred", ["sk-agents"]),
      req("nw-git", "Git", "hard", ["sk-git"]),
      req("nw-testing", "Testing", "hard", ["sk-testing"]),
      req("nw-deploy", "Deployment", "hard", ["sk-mlops", "sk-containers"]),
      req("nw-rollback", "Rollback", "hard", ["sk-mlops"]),
      req("nw-iac", "Infrastructure as code", "hard", ["sk-containers"]),
      req("nw-terraform", "Terraform / OpenTofu", "hard", ["sk-containers"]),
      req("nw-langgraph", "LangGraph", "preferred", ["sk-agents"]),
      req("nw-langchain", "LangChain", "preferred", ["sk-agents"]),
      req("nw-msgraph", "Microsoft Graph", "preferred", ["sk-api-design"]),
      req("nw-teams", "Teams apps", "preferred", ["sk-api-design"]),
      req("nw-entra", "Entra ID", "hard", ["sk-cloud-azure", "sk-security"]),
      req("nw-multiagent", "Multi-agent orchestration", "preferred", ["sk-agents"]),
      req("nw-security", "Security", "hard", ["sk-security"]),
      req("nw-iso42001", "ISO/IEC 42001 concepts", "preferred", ["sk-security"]),
      req("nw-distributed", "Distributed systems", "hard", ["sk-os-concurrency", "sk-networking"]),
      req("nw-docs", "Technical documentation", "hard", ["sk-communication", "sk-english-technical"]),
      req("nw-incident", "Incident response", "hard", ["sk-observability"]),
    ],
  },
];
