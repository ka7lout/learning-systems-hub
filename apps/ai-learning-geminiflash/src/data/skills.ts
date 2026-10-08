export interface SkillSeed {
  id: string;
  name: string;
  category: "programming" | "mathematics" | "data_engineering" | "machine_learning" | "deep_learning" | "modern_genai" | "mlops_cloud" | "professional_english";
  description: string;
  level: "foundational" | "intermediate" | "advanced" | "expert";
  prerequisites: string[];
  careerRoles: string[];
}

export const CANONICAL_SKILLS: SkillSeed[] = [
  // Programming & CS
  {
    id: "sk-python",
    name: "Python Engineering & Object-Oriented Architecture",
    category: "programming",
    description: "Writing modular, idiomatic, high-performance Python code with OOP, dunder magic methods, type annotations, and virtual environments.",
    level: "advanced",
    prerequisites: [],
    careerRoles: ["navisoft_ai_engineer", "nuwave_production_engineer", "ml_systems_engineer"]
  },
  {
    id: "sk-c-systems",
    name: "C Programming & Memory Systems",
    category: "programming",
    description: "Understanding pointers, memory addressing, stack/heap allocation, cache locality, and low-level execution models.",
    level: "intermediate",
    prerequisites: ["sk-python"],
    careerRoles: ["navisoft_ai_engineer", "ml_systems_engineer"]
  },
  {
    id: "sk-sql-databases",
    name: "Relational SQL & Database Architecture",
    category: "data_engineering",
    description: "Designing normalized 3NF schemas, indexing with B-Trees, writing CTEs, and executing partition-level Window Functions.",
    level: "advanced",
    prerequisites: ["sk-python"],
    careerRoles: ["navisoft_ai_engineer", "nuwave_production_engineer", "ml_systems_engineer"]
  },
  {
    id: "sk-linear-algebra",
    name: "Linear Algebra & Tensor Calculus",
    category: "mathematics",
    description: "Matrix operations, eigenvalues, singular value decomposition, norms, and high-dimensional vector spaces.",
    level: "advanced",
    prerequisites: [],
    careerRoles: ["navisoft_ai_engineer", "applied_ai_researcher", "ml_systems_engineer"]
  },
  {
    id: "sk-probability-stats",
    name: "Probability, Inference & Hypothesis Testing",
    category: "mathematics",
    description: "Bayesian probability, distributions, maximum likelihood estimation, confidence intervals, and A/B hypothesis testing.",
    level: "advanced",
    prerequisites: [],
    careerRoles: ["navisoft_ai_engineer", "applied_ai_researcher"]
  },
  {
    id: "sk-classical-ml",
    name: "Supervised & Unsupervised Machine Learning",
    category: "machine_learning",
    description: "Regression, regularized models (Ridge/Lasso), SVMs, GBDTs (XGBoost, CatBoost), clustering, and metric calibration.",
    level: "advanced",
    prerequisites: ["sk-python", "sk-linear-algebra", "sk-probability-stats"],
    careerRoles: ["navisoft_ai_engineer", "ml_systems_engineer"]
  },
  {
    id: "sk-deep-learning",
    name: "Deep Neural Networks & Computer Vision",
    category: "deep_learning",
    description: "Backpropagation, PyTorch/TensorFlow, CNN architectures (ResNet), object detection (YOLO), and transfer learning.",
    level: "advanced",
    prerequisites: ["sk-classical-ml"],
    careerRoles: ["navisoft_ai_engineer", "applied_ai_researcher"]
  },
  {
    id: "sk-llm-transformers",
    name: "Transformers, LLMs & LoRA Fine-Tuning",
    category: "modern_genai",
    description: "Scaled dot-product self-attention, Hugging Face ecosystem, PEFT/LoRA, tokenization, and generation parameters.",
    level: "expert",
    prerequisites: ["sk-deep-learning"],
    careerRoles: ["nuwave_production_engineer", "applied_ai_researcher", "navisoft_ai_engineer"]
  },
  {
    id: "sk-rag-vector-db",
    name: "RAG Systems & Vector Database Architecture",
    category: "modern_genai",
    description: "Semantic chunking, hybrid search (BM25 + Dense), vector databases (Pinecone, Chroma), cross-encoder rerankers, and Ragas evaluation.",
    level: "expert",
    prerequisites: ["sk-llm-transformers"],
    careerRoles: ["nuwave_production_engineer", "navisoft_ai_engineer"]
  },
  {
    id: "sk-agentic-systems",
    name: "Autonomous AI Agents & Multi-Agent Orchestration",
    category: "modern_genai",
    description: "LangGraph state machines, structured tool calling, deterministic workflows, agent memory, and observability.",
    level: "expert",
    prerequisites: ["sk-rag-vector-db"],
    careerRoles: ["nuwave_production_engineer"]
  },
  {
    id: "sk-mlops-docker-cicd",
    name: "MLOps, Docker Containerization & CI/CD",
    category: "mlops_cloud",
    description: "Packaging models into FastAPI REST microservices, multi-stage Docker builds, automated GitHub Actions pipelines, and MLflow tracking.",
    level: "advanced",
    prerequisites: ["sk-python", "sk-classical-ml"],
    careerRoles: ["navisoft_ai_engineer", "nuwave_production_engineer", "ml_systems_engineer"]
  },
  {
    id: "sk-technical-english",
    name: "Professional Technical English & Oral Defense",
    category: "professional_english",
    description: "Communicating complex technical trade-offs, defending architectural decisions orally, and authoring rigorous documentation in English.",
    level: "advanced",
    prerequisites: [],
    careerRoles: ["navisoft_ai_engineer", "nuwave_production_engineer", "applied_ai_researcher"]
  }
];
