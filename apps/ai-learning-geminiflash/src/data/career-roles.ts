export interface CareerRoleSeed {
  id: string;
  slug: string;
  title: string;
  archetype: "navisoft_ai_engineer" | "nuwave_production_engineer" | "ml_systems_engineer" | "applied_ai_researcher";
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  seniority: string;
  typicalTasks: string[];
  flagshipProjects: string[];
  interviewDomains: string[];
  lastVerified: string;
}

export const CANONICAL_CAREER_ROLES: CareerRoleSeed[] = [
  {
    id: "role-navisoft-ai-eng",
    slug: "navisoft-ai-engineer",
    title: "Enterprise AI & Machine Learning Engineer (Navisoft Archetype)",
    archetype: "navisoft_ai_engineer",
    description: "Enterprise engineering role responsible for building, optimizing, and deploying machine learning pipelines, predictive scoring models, and NLP models integrated with enterprise data lakes and cloud services.",
    requiredSkills: [
      "sk-python",
      "sk-sql-databases",
      "sk-linear-algebra",
      "sk-probability-stats",
      "sk-classical-ml",
      "sk-deep-learning",
      "sk-mlops-docker-cicd",
      "sk-technical-english"
    ],
    preferredSkills: [
      "sk-c-systems",
      "sk-llm-transformers",
      "sk-rag-vector-db"
    ],
    seniority: "Mid-to-Senior AI Engineer",
    typicalTasks: [
      "Develop and optimize predictive models (XGBoost, CatBoost, neural nets) on large-scale enterprise datasets",
      "Design SQL ETL/ELT data pipelines and feature stores",
      "Deploy containerized microservices in Docker with FastAPI on AWS (EC2, S3, Lambda)",
      "Conduct rigorous statistical hypothesis testing and A/B evaluations",
      "Author technical model cards and present ROI analyses to executive leadership"
    ],
    flagshipProjects: [
      "proj-16-credit-card-fraud",
      "proj-14-bank-loan-analysis",
      "proj-01-skin-disease",
      "proj-15-sales-database"
    ],
    interviewDomains: [
      "Machine Learning Algorithms & Mathematical Derivations",
      "Data Pipeline Architecture & SQL Optimization",
      "Statistical Hypothesis Testing & Metric Calibration",
      "System Design for ML Inference & Containerization"
    ],
    lastVerified: "Spring 2026 Enterprise Industry Benchmark"
  },
  {
    id: "role-nuwave-prod-eng",
    slug: "nuwave-production-engineer",
    title: "Production AI & Autonomous Systems Engineer (Nuwave Archetype)",
    archetype: "nuwave_production_engineer",
    description: "Modern production AI systems role focusing on building autonomous LLM agents, GraphRAG retrieval systems, hybrid search indexes, and cloud-native microservices with strict observability and safety.",
    requiredSkills: [
      "sk-python",
      "sk-sql-databases",
      "sk-llm-transformers",
      "sk-rag-vector-db",
      "sk-agentic-systems",
      "sk-mlops-docker-cicd",
      "sk-technical-english"
    ],
    preferredSkills: [
      "sk-classical-ml",
      "sk-deep-learning"
    ],
    seniority: "Senior Production AI Engineer",
    typicalTasks: [
      "Architect multi-agent autonomous systems using LangGraph with cyclic state machines",
      "Implement hybrid dense/sparse RAG pipelines with Pinecone, Qdrant, and BM25",
      "Fine-tune foundation models with LoRA/QLoRA on domain-specific datasets",
      "Deploy and monitor LLM microservices with OpenTelemetry, token budgets, and automated fallback",
      "Ensure compliance with ISO/IEC 42001 AI governance standards and prevent prompt injection"
    ],
    flagshipProjects: [
      "proj-21-rag-system",
      "proj-22-flagship-agentic-workflow",
      "proj-19-chatbot",
      "proj-20-document-summarization"
    ],
    interviewDomains: [
      "LLM Architectures, Self-Attention & LoRA Mechanics",
      "RAG Retrieval Optimization, Chunking & Reranking",
      "Agent Orchestration, Tool Calling & State Machines",
      "Cloud Architecture, Observability & Security (OWASP for LLMs)"
    ],
    lastVerified: "Spring 2026 Production GenAI Benchmark"
  },
  {
    id: "role-ml-systems-eng",
    slug: "ml-systems-engineer",
    title: "Machine Learning Systems & Infrastructure Engineer",
    archetype: "ml_systems_engineer",
    description: "Systems-heavy AI engineering role focusing on GPU compute optimization, distributed training (DDP), low-latency inference serving (TensorRT, Triton), and high-throughput data streaming.",
    requiredSkills: [
      "sk-python",
      "sk-c-systems",
      "sk-linear-algebra",
      "sk-classical-ml",
      "sk-deep-learning",
      "sk-mlops-docker-cicd"
    ],
    preferredSkills: [
      "sk-llm-transformers",
      "sk-sql-databases"
    ],
    seniority: "Senior Infrastructure Engineer",
    typicalTasks: [
      "Optimize deep learning models for edge and cloud deployment using ONNX, TensorRT, and quantization (INT8/FP8)",
      "Design distributed multi-GPU training clusters with PyTorch DDP",
      "Build high-throughput streaming inference pipelines handling 10,000+ RPS",
      "Profile CUDA memory allocation and eradicate GPU kernel execution bottlenecks"
    ],
    flagshipProjects: [
      "proj-06-real-time-object-detection",
      "proj-08-brain-tumor-detection",
      "proj-02-face-recognition"
    ],
    interviewDomains: [
      "C / C++ Memory Hierarchy & CUDA Kernel Concepts",
      "Distributed Training Protocols & Network AllReduce",
      "Quantization & Latency Profiling",
      "Linux Operating System Internals & High-Concurrency Serving"
    ],
    lastVerified: "Spring 2026 Systems Benchmark"
  }
];
