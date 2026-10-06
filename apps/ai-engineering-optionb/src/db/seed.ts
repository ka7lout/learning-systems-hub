import { db } from "./index";
import {
  curriculumStages,
  courses,
  modules,
  lessons,
  skills,
  projects,
  careerRoles,
  englishTerms,
  freelanceServices,
  sources,
} from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting seed...");

  // Truncate all tables with cascade for idempotency
  const allTables = [
    "audit_logs", "course_enrollments", "lesson_progress", "resume_evidence",
    "portfolio_items", "tasks", "later_items", "ai_runs", "ai_messages",
    "ai_threads", "speaking_attempts", "freelance_simulations",
    "project_evidence", "project_milestones", "project_submissions",
    "review_items", "error_logs", "mastery_records", "submissions",
    "assessment_items", "assessments", "learning_blocks", "english_terms",
    "freelance_services", "career_roles", "projects", "skills", "lessons",
    "modules", "courses", "curriculum_stages", "sources", "sessions",
    "user_profiles"
  ];
  for (const t of allTables) {
    try {
      await db.execute(`TRUNCATE TABLE "${t}" CASCADE`);
    } catch (e) {
      // table may not exist yet, ignore
    }
  }
  // users is handled separately — keep schema for fresh seed
  try { await db.execute(`TRUNCATE TABLE "users" CASCADE`); } catch(e) {}

  // ============================================
  // STAGES (22 stages per spec section 129)
  // ============================================
  const stageData = [
    { n: 1, slug: "mathematical-foundations", title: "Mathematical Foundations", cat: "Harvard College+Original", prio: "core", weeks: 12 },
    { n: 2, slug: "programming-foundations", title: "Programming Foundations", cat: "Original Curriculum+Harvard Core", prio: "core", weeks: 10 },
    { n: 3, slug: "cs-foundations", title: "Computer Science Foundations", cat: "Harvard College", prio: "core", weeks: 16 },
    { n: 4, slug: "data-foundations", title: "Data Foundations", cat: "Original Curriculum+Harvard", prio: "core", weeks: 10 },
    { n: 5, slug: "statistics-probability", title: "Statistics and Probability", cat: "Harvard College+Original", prio: "core", weeks: 12 },
    { n: 6, slug: "data-analysis", title: "Data Analysis", cat: "Original Curriculum+Harvard", prio: "core", weeks: 10 },
    { n: 7, slug: "data-engineering", title: "Data Engineering", cat: "Industry+Harvard", prio: "support", weeks: 8 },
    { n: 8, slug: "classical-ml", title: "Classical Machine Learning", cat: "Original+Harvard CS181", prio: "core", weeks: 12 },
    { n: 9, slug: "deep-learning", title: "Deep Learning", cat: "Original+Harvard Extension", prio: "core", weeks: 16 },
    { n: 10, slug: "computer-vision", title: "Computer Vision", cat: "Original+Harvard", prio: "specialization", weeks: 6 },
    { n: 11, slug: "nlp", title: "NLP", cat: "Original+Harvard", prio: "specialization", weeks: 6 },
    { n: 12, slug: "transformers-llms", title: "Transformers / LLMs", cat: "Original+Harvard Extension", prio: "core", weeks: 8 },
    { n: 13, slug: "rag-graphrag", title: "RAG / GraphRAG", cat: "Industry+Research", prio: "advanced", weeks: 4 },
    { n: 14, slug: "agents", title: "Agents / Multi-Agent Systems", cat: "Industry+Research", prio: "advanced", weeks: 4 },
    { n: 15, slug: "software-engineering", title: "Software Engineering for AI", cat: "Industry+Harvard", prio: "core", weeks: 8 },
    { n: 16, slug: "cloud-engineering", title: "Cloud Engineering", cat: "Industry Extension", prio: "core", weeks: 6 },
    { n: 17, slug: "mlops", title: "MLOps / Production ML", cat: "Original+Industry+Harvard", prio: "core", weeks: 8 },
    { n: 18, slug: "security-responsible-ai", title: "Security / Responsible AI / Governance", cat: "Harvard+Industry", prio: "core", weeks: 4 },
    { n: 19, slug: "technical-english", title: "Technical English", cat: "Original Extension", prio: "support", weeks: 48 },
    { n: 20, slug: "career", title: "Career and Interview Engineering", cat: "Industry Extension", prio: "core", weeks: 8 },
    { n: 21, slug: "freelancing", title: "Freelancing", cat: "Industry Extension", prio: "support", weeks: 4 },
    { n: 22, slug: "research", title: "Research Engineering", cat: "Research Extension", prio: "advanced", weeks: 12 },
  ];

  const stageIds: Record<string, string> = {};
  for (const s of stageData) {
    const [created] = await db
      .insert(curriculumStages)
      .values({
        stageNumber: s.n,
        slug: s.slug,
        title: s.title,
        description: `Stage ${s.n}: ${s.title} — ${s.cat}`,
        sourceCategory: s.cat,
        priority: s.prio,
        estimatedWeeks: s.weeks,
        order: s.n,
      })
      .returning({ id: curriculumStages.id });
    stageIds[s.slug] = created.id;
  }
  console.log("✅ Stages seeded");

  // ============================================
  // COURSES - Mapped from original curriculum + Harvard additions
  // ============================================
  const courseData: Array<{
    slug: string;
    code?: string;
    title: string;
    stageSlug: string;
    cat: string;
    level: string;
    hours: number;
    objectives: string[];
    prereqs: string[];
    order: number;
    desc?: string;
    harvard?: any;
  }> = [
    // Stage 1 - Mathematical Foundations
    {
      slug: "calculus",
      code: "MATH 21A/21B equivalent",
      title: "Single & Multivariable Calculus",
      stageSlug: "mathematical-foundations",
      cat: "Harvard College",
      level: "undergraduate",
      hours: 80,
      objectives: ["Understand derivatives, integrals, partial derivatives, gradients", "Apply chain rule to ML optimization", "Compute Jacobians and understand Hessians"],
      prereqs: [],
      order: 1,
      harvard: { courseCode: "MATH 21A/MATH 21B", exactMatch: false, depth: "rigorous introductory", additions: ["proof elements", "multivariable theory"] },
    },
    {
      slug: "linear-algebra",
      code: "MATH 22A / AM 22A equivalent",
      title: "Linear Algebra & Matrix Theory",
      stageSlug: "mathematical-foundations",
      cat: "Harvard College",
      level: "undergraduate",
      hours: 70,
      objectives: ["Master vectors, matrices, tensors", "Understand eigenvalues/eigenvectors", "Apply linear transformations to ML", "Compute dot products, norms, matrix operations"],
      prereqs: [],
      order: 2,
      harvard: { courseCode: "MATH 22A", exactMatch: false, depth: "proof-aware", additions: ["vector spaces", "linear maps"] },
    },
    {
      slug: "optimization",
      code: "CS 1280 equivalent",
      title: "Optimization for Machine Learning",
      stageSlug: "mathematical-foundations",
      cat: "Harvard College",
      level: "graduate/advanced-undergraduate",
      hours: 50,
      objectives: ["Understand gradient descent", "Apply convex optimization concepts", "Reason about loss landscapes"],
      prereqs: ["calculus", "linear-algebra"],
      order: 3,
      harvard: { courseCode: "CS 1280", exactMatch: false, depth: "graduate-level convex optimization", additions: ["convex sets", "Lagrange duality", "ML applications"] },
    },
    // Stage 2 - Programming Foundations (Original Module 1)
    {
      slug: "python-programming",
      title: "Python Programming (10 sessions)",
      stageSlug: "programming-foundations",
      cat: "Original Curriculum",
      level: "beginner",
      hours: 40,
      objectives: ["Master Python fundamentals", "Data structures, functions, OOP", "Error handling, file I/O", "Algorithms and recursion", "Modules, packages, virtual environments"],
      prereqs: [],
      order: 1,
    },
    {
      slug: "c-programming",
      code: "CS50-style C layer",
      title: "C Programming & Memory Model",
      stageSlug: "programming-foundations",
      cat: "Harvard Core",
      level: "beginner/intermediate",
      hours: 30,
      objectives: ["Understand pointers", "Stack/heap memory", "Compilation/linking", "Low-level debugging"],
      prereqs: [],
      order: 2,
      harvard: { courseCode: "CS50", exactMatch: true, depth: "introductory systems", additions: ["memory model", "pointers", "manual memory management"] },
    },
    {
      slug: "linux-cli",
      title: "Linux, CLI, and Developer Tools",
      stageSlug: "programming-foundations",
      cat: "Industry Extension",
      level: "beginner",
      hours: 20,
      objectives: ["Navigate command line", "Use bash for automation", "Understand shells, permissions, processes"],
      prereqs: [],
      order: 3,
    },
    // Stage 3 - CS Foundations
    {
      slug: "discrete-math",
      title: "Discrete Mathematics & Formal Reasoning",
      stageSlug: "cs-foundations",
      cat: "Harvard College",
      level: "intermediate",
      hours: 60,
      objectives: ["Proof techniques", "Logic", "Set theory", "Combinatorics", "Graph theory basics"],
      prereqs: ["calculus"],
      order: 1,
      harvard: { courseCode: "CS 20 / CS 1200", exactMatch: false, depth: "rigorous", additions: ["formal proofs", "induction", "discrete probability"] },
    },
    {
      slug: "data-structures-algorithms",
      code: "CS 61 / CS 1240 equivalent",
      title: "Data Structures & Algorithms",
      stageSlug: "cs-foundations",
      cat: "Harvard College",
      level: "intermediate",
      hours: 80,
      objectives: ["Linked lists, trees, hash tables, graphs", "Sorting/searching algorithms", "Asymptotic complexity", "Greedy, divide and conquer, dynamic programming"],
      prereqs: ["python-programming", "discrete-math"],
      order: 2,
      harvard: { courseCode: "CS 61 / CS 1240", exactMatch: false, depth: "systems + theory", additions: ["implementation in C/Python", "algorithm design", "complexity analysis"] },
    },
    {
      slug: "systems-programming",
      code: "CS 61 style",
      title: "Systems Programming & Computer Organization",
      stageSlug: "cs-foundations",
      cat: "Harvard College",
      level: "intermediate",
      hours: 60,
      objectives: ["CPU architecture", "Memory hierarchy", "Processes, threads", "Concurrency", "Networking fundamentals"],
      prereqs: ["c-programming", "data-structures-algorithms"],
      order: 3,
      harvard: { courseCode: "CS 61", exactMatch: false, depth: "systems", additions: ["assembly", "virtual memory", "synchronization"] },
    },
    {
      slug: "theory-computation",
      code: "CS 1210 equivalent",
      title: "Theory of Computation",
      stageSlug: "cs-foundations",
      cat: "Harvard College",
      level: "advanced-undergraduate",
      hours: 40,
      objectives: ["Automata theory", "Computability", "Complexity classes (P, NP)", "Computational limitations"],
      prereqs: ["discrete-math", "data-structures-algorithms"],
      order: 4,
      harvard: { courseCode: "CS 1210", exactMatch: false, depth: "theoretical", additions: ["formal languages", "Turing machines", "reductions"] },
    },
    {
      slug: "databases-systems",
      code: "CS 1650 equivalent",
      title: "Database Systems & Data Management",
      stageSlug: "cs-foundations",
      cat: "Harvard College",
      level: "intermediate/advanced",
      hours: 50,
      objectives: ["Relational model", "Query optimization", "Indexing", "Transactions", "Distributed databases"],
      prereqs: ["data-structures-algorithms", "systems-programming"],
      order: 5,
      harvard: { courseCode: "CS 1650", exactMatch: false, depth: "systems", additions: ["storage engines", "concurrency control", "recovery"] },
    },
    // Stage 4 - Data Foundations (Original Module 5)
    {
      slug: "sql-databases",
      title: "SQL & Database Design",
      stageSlug: "data-foundations",
      cat: "Original Curriculum",
      level: "beginner/intermediate",
      hours: 30,
      objectives: ["ERD, normalization", "DDL, DML, DQL", "JOINs, subqueries, CTEs, window functions", "Stored procedures, query optimization"],
      prereqs: ["python-programming"],
      order: 1,
    },
    {
      slug: "web-scraping",
      title: "Web Scraping & Data Collection",
      stageSlug: "data-foundations",
      cat: "Original Curriculum/Industry",
      level: "intermediate",
      hours: 20,
      objectives: ["BeautifulSoup, Regex, Selenium", "Dynamic websites", "APIs for data collection", "Rate limiting and ethical scraping"],
      prereqs: ["python-programming", "sql-databases"],
      order: 2,
    },
    {
      slug: "data-warehousing-etl",
      title: "Data Warehousing & ETL/ELT",
      stageSlug: "data-foundations",
      cat: "Original Curriculum",
      level: "intermediate",
      hours: 20,
      objectives: ["Warehouse concepts", "ETL/ELT design", "End-to-end pipelines", "Scrape → clean → store → query"],
      prereqs: ["sql-databases", "web-scraping"],
      order: 3,
    },
    // Stage 5 - Statistics & Probability (Original Module 2 parts)
    {
      slug: "probability",
      code: "STAT 110 equivalent",
      title: "Probability",
      stageSlug: "statistics-probability",
      cat: "Harvard College",
      level: "undergraduate",
      hours: 50,
      objectives: ["Probability basics", "Conditional probability, Bayes", "Random variables", "Expectation, variance", "Common distributions"],
      prereqs: ["calculus", "linear-algebra"],
      order: 1,
      harvard: { courseCode: "STAT 110", exactMatch: false, depth: "introductory, conceptual", additions: ["counting methods", "distributions", "conditional reasoning"] },
    },
    {
      slug: "statistics",
      code: "STAT 111 equivalent",
      title: "Statistical Inference",
      stageSlug: "statistics-probability",
      cat: "Harvard College",
      level: "undergraduate",
      hours: 50,
      objectives: ["Population vs sample", "Descriptive stats", "Mean, median, mode, variance, std", "Distributions, skewness, kurtosis", "Hypothesis testing, A/B testing, confidence intervals"],
      prereqs: ["probability"],
      order: 2,
      harvard: { courseCode: "STAT 111", exactMatch: false, depth: "rigorous inference", additions: ["likelihood", "MLE", "Bayesian vs frequentist"] },
    },
    {
      slug: "regression-applied-stats",
      title: "Regression & Applied Statistical Modeling",
      stageSlug: "statistics-probability",
      cat: "Harvard College",
      level: "undergraduate",
      hours: 40,
      objectives: ["Correlation, covariance", "Linear regression", "Model assumptions", "Diagnostics", "Applied modeling"],
      prereqs: ["statistics", "linear-algebra"],
      order: 3,
    },
    // Stage 6 - Data Analysis (Original Module 3)
    {
      slug: "numpy",
      title: "NumPy Foundations",
      stageSlug: "data-analysis",
      cat: "Original Curriculum",
      level: "beginner",
      hours: 16,
      objectives: ["Arrays, n-d arrays", "Indexing, slicing, reshaping", "Broadcasting, strides", "Vectorized operations", "Performance optimization"],
      prereqs: ["python-programming", "linear-algebra"],
      order: 1,
    },
    {
      slug: "pandas",
      title: "Pandas Data Wrangling",
      stageSlug: "data-analysis",
      cat: "Original Curriculum",
      level: "beginner/intermediate",
      hours: 24,
      objectives: ["DataFrames, Series", "Reading CSV/Excel/JSON/SQL", "Filtering, sorting, groupby", "Joins, merge, missing values", "Outliers, feature engineering"],
      prereqs: ["numpy"],
      order: 2,
    },
    {
      slug: "visualization",
      title: "Data Visualization & Storytelling",
      stageSlug: "data-analysis",
      cat: "Original Curriculum",
      level: "beginner/intermediate",
      hours: 16,
      objectives: ["Matplotlib, Seaborn, Plotly", "Line, bar, hist, scatter", "Heatmaps, pairplots", "Interactive dashboards", "Data storytelling"],
      prereqs: ["pandas"],
      order: 3,
    },
    {
      slug: "eda-capstone",
      title: "EDA Capstone",
      stageSlug: "data-analysis",
      cat: "Original Curriculum",
      level: "intermediate",
      hours: 24,
      objectives: ["Full analysis pipeline on real data", "Load, clean, analyze", "Visualize insights", "Present findings", "Code review"],
      prereqs: ["visualization", "statistics"],
      order: 4,
    },
    // Stage 7 - Data Engineering
    {
      slug: "data-engineering-big-data",
      title: "Big Data & Data Engineering",
      stageSlug: "data-engineering",
      cat: "Industry Extension+Harvard",
      level: "intermediate",
      hours: 40,
      objectives: ["Data modeling", "Lake/lakehouse concepts", "Batch vs streaming", "Airflow, dbt", "Spark, Spark SQL"],
      prereqs: ["data-warehousing-etl", "pandas", "databases-systems"],
      order: 1,
    },
    {
      slug: "excel-powerbi",
      title: "Excel & Power BI for Analytics",
      stageSlug: "data-engineering",
      cat: "Industry Extension",
      level: "beginner/intermediate",
      hours: 16,
      objectives: ["Excel functions, VLOOKUP/XLOOKUP", "Pivot tables, Power Query", "Power BI, DAX", "Dashboards, publishing"],
      prereqs: ["sql-databases"],
      order: 2,
    },
    // Stage 8 - Classical ML (Original Module 6)
    {
      slug: "machine-learning",
      code: "CS 181 equivalent",
      title: "Machine Learning",
      stageSlug: "classical-ml",
      cat: "Original Curriculum+Harvard College",
      level: "intermediate/advanced",
      hours: 72,
      objectives: ["Supervised/unsupervised learning", "Scikit-learn", "Preprocessing, scaling, encoding", "Regression, classification models", "Cross-validation, grid search", "Ensembles: Random Forest, XGBoost, etc.", "K-Means, DBSCAN, PCA, Recommendation systems", "ML capstone with model cards"],
      prereqs: ["numpy", "pandas", "statistics", "probability", "optimization", "linear-algebra"],
      order: 1,
      harvard: { courseCode: "CS 1810/CS 1820", exactMatch: false, depth: "theoretical + practical", additions: ["statistical foundations", "learning theory", "practical modeling"] },
    },
    // Stage 9 - Deep Learning (Original Module 7)
    {
      slug: "deep-learning",
      code: "CSCI E-25/E-89 equivalent",
      title: "Deep Learning",
      stageSlug: "deep-learning",
      cat: "Original Curriculum+Harvard Extension",
      level: "advanced",
      hours: 96,
      objectives: ["ANNs, backpropagation", "CNNs for vision", "RNNs, LSTMs, GRUs", "Transformers and attention", "TensorFlow/Keras", "Transfer learning, fine-tuning", "YOLO, OpenCV for CV", "NLP preprocessing, embeddings", "Hugging Face ecosystem"],
      prereqs: ["machine-learning", "linear-algebra", "calculus"],
      order: 1,
      harvard: { courseCode: "CSCI E-25 / CSCI E-89", exactMatch: false, depth: "graduate", additions: ["advanced architectures", "generative models", "practical labs"] },
    },
    // Stage 10 - Computer Vision
    {
      slug: "computer-vision",
      title: "Advanced Computer Vision",
      stageSlug: "computer-vision",
      cat: "Original Curriculum+Harvard",
      level: "specialization",
      hours: 40,
      objectives: ["Object detection, segmentation", "Pose estimation", "Vision transformers", "Generative vision models"],
      prereqs: ["deep-learning"],
      order: 1,
    },
    // Stage 11 - NLP
    {
      slug: "nlp",
      code: "CS 1870 equivalent",
      title: "Natural Language Processing",
      stageSlug: "nlp",
      cat: "Original Curriculum+Harvard",
      level: "specialization",
      hours: 40,
      objectives: ["Text preprocessing", "Word embeddings", "Seq2seq models", "Summarization, translation", "Statistical and neural NLP"],
      prereqs: ["deep-learning"],
      order: 1,
      harvard: { courseCode: "CS 1870", exactMatch: false, depth: "graduate", additions: ["computational linguistics", "evaluation methodology"] },
    },
    // Stage 12 - Transformers/LLMs
    {
      slug: "llms",
      code: "CSCI E-222 equivalent",
      title: "Large Language Models",
      stageSlug: "transformers-llms",
      cat: "Original Curriculum+Harvard Extension",
      level: "advanced",
      hours: 48,
      objectives: ["Transformer architecture in depth", "Tokenization, embeddings", "Pretraining objectives", "Fine-tuning, LoRA, QLoRA", "Prompt engineering", "Hugging Face", "Quantization", "Evaluation, hallucination analysis"],
      prereqs: ["deep-learning", "nlp"],
      order: 1,
      harvard: { courseCode: "CSCI E-222", exactMatch: false, depth: "graduate", additions: ["foundations of LLMs", "conversational agents", "evaluation"] },
    },
    // Stage 13 - RAG/GraphRAG
    {
      slug: "rag",
      title: "Retrieval-Augmented Generation & GraphRAG",
      stageSlug: "rag-graphrag",
      cat: "Industry+Research",
      level: "advanced",
      hours: 24,
      objectives: ["Vector search", "Chunking strategies", "Embedding models", "Hybrid search", "Reranking", "Citation grounding", "Knowledge graphs", "Evaluation"],
      prereqs: ["llms"],
      order: 1,
    },
    // Stage 14 - Agents
    {
      slug: "agents",
      title: "Agentic & Multi-Agent Systems",
      stageSlug: "agents",
      cat: "Industry+Research",
      level: "advanced",
      hours: 24,
      objectives: ["Tool calling", "Planning, memory, state", "Orchestration", "Multi-agent patterns", "Permissions, safety", "Observability, cost/latency"],
      prereqs: ["llms", "software-engineering"],
      order: 1,
    },
    // Stage 15 - Software Engineering for AI
    {
      slug: "software-engineering",
      title: "Software Engineering for AI",
      stageSlug: "software-engineering",
      cat: "Industry+Harvard",
      level: "core",
      hours: 48,
      objectives: ["Git, GitHub, branching, PRs", "Testing (unit, integration, E2E)", "TypeScript", "Code review", "REST APIs", "Authentication, authorization", "Async/concurrency", "Design patterns"],
      prereqs: ["python-programming", "c-programming"],
      order: 1,
    },
    // Stage 16 - Cloud
    {
      slug: "cloud",
      title: "Cloud Engineering (AWS primary, Azure familiar)",
      stageSlug: "cloud-engineering",
      cat: "Industry Extension",
      level: "core",
      hours: 36,
      objectives: ["AWS IAM, S3, Lambda, API Gateway, EC2, ECR/ECS, CloudWatch", "Azure Entra ID, storage, compute, serverless", "VPC networking basics", "Secrets management", "Model/API hosting"],
      prereqs: ["software-engineering"],
      order: 1,
    },
    // Stage 17 - MLOps (Original Module 8)
    {
      slug: "mlops",
      code: "APCOMP 215 equivalent",
      title: "MLOps & Production ML",
      stageSlug: "mlops",
      cat: "Original+Industry+Harvard",
      level: "core",
      hours: 48,
      objectives: ["APIs: FastAPI, Streamlit", "Docker containerization", "CI/CD pipelines", "Experiment tracking (MLflow)", "Model registry", "Deployment, monitoring", "Drift detection", "Retraining/rollback", "Reproducibility"],
      prereqs: ["machine-learning", "software-engineering", "cloud"],
      order: 1,
      harvard: { courseCode: "APCOMP 215", exactMatch: false, depth: "applied", additions: ["data pipelines", "scalable ML systems"] },
    },
    // Stage 18 - Security/Ethics
    {
      slug: "ai-security-ethics",
      title: "AI Security, Ethics & Governance",
      stageSlug: "security-responsible-ai",
      cat: "Harvard+Industry",
      level: "core",
      hours: 24,
      objectives: ["Bias, fairness, privacy", "Security, robustness", "Prompt injection", "Model cards, system cards", "Responsible deployment", "ISO 42001 awareness", "AI regulation", "Misuse prevention"],
      prereqs: ["machine-learning"],
      order: 1,
    },
    // Stage 19 - Technical English - parallel throughout
    {
      slug: "technical-english",
      title: "Technical English for AI Engineers",
      stageSlug: "technical-english",
      cat: "Industry Extension",
      level: "support",
      hours: 200,
      objectives: ["Reading technical documentation", "Writing PRs, READMEs, reports", "Presenting projects", "Interview speaking", "Client communication", "Vocabulary growth"],
      prereqs: [],
      order: 1,
    },
    // Stage 20 - Career
    {
      slug: "career",
      title: "Career & Interview Engineering",
      stageSlug: "career",
      cat: "Industry Extension",
      level: "core",
      hours: 40,
      objectives: ["Resume from evidence", "Portfolio case studies", "Technical interview prep", "Behavioral interviews", "System design interviews", "Mock interviews", "Offer evaluation"],
      prereqs: ["machine-learning", "software-engineering"],
      order: 1,
    },
    // Stage 21 - Freelancing
    {
      slug: "freelancing",
      title: "Freelancing Practice",
      stageSlug: "freelancing",
      cat: "Industry Extension",
      level: "support",
      hours: 20,
      objectives: ["Niche selection", "Proposal writing", "Client discovery", "Scope and estimates", "Change management", "Delivery and case studies"],
      prereqs: ["career"],
      order: 1,
    },
    // Stage 22 - Research
    {
      slug: "research",
      title: "Research Engineering",
      stageSlug: "research",
      cat: "Research Extension",
      level: "advanced",
      hours: 80,
      objectives: ["Paper reading", "Reproducing results", "Ablation studies", "Experimental design", "Statistical reasoning", "Scientific writing", "Peer review"],
      prereqs: ["machine-learning", "deep-learning", "statistics"],
      order: 1,
    },
  ];

  const courseIds: Record<string, string> = {};
  for (const c of courseData) {
    const [created] = await db
      .insert(courses)
      .values({
        slug: c.slug,
        code: c.code,
        title: c.title,
        shortTitle: c.title,
        description: c.desc || `Comprehensive coverage of ${c.title}.`,
        sourceCategory: c.cat,
        sourceLabel: c.harvard?.courseCode || c.cat,
        sourceUrl: c.harvard?.courseCode ? undefined : undefined,
        sourceStatus: c.harvard?.courseCode ? "likely_not_verified" : "design_decision",
        level: c.level,
        estimatedEffortHours: c.hours,
        learningObjectives: c.objectives,
        prerequisites: c.prereqs,
        skills: c.objectives.slice(0, 5),
        order: c.order,
        harvardMapping: c.harvard,
        stageId: stageIds[c.stageSlug],
        lastVerified: c.harvard?.courseCode ? new Date("2024-01-01") : new Date(),
      })
      .returning({ id: courses.id });
    courseIds[c.slug] = created.id;
  }
  console.log("✅ Courses seeded");

  // ============================================
  // MODULES - map original modules into courses
  // ============================================
  const moduleData = [
    // Original Module 1: Python Programming (10 sessions, 5 numbered sections)
    { slug: "py-fundamentals", title: "Python Fundamentals", courseSlug: "python-programming", n: 1, sessions: 2, topics: ["Intro to Python", "Variables & Data Types", "Type Casting", "Operators", "Conditionals", "Loops", "break/continue/pass"] },
    { slug: "py-data-structures-functions", title: "Data Structures & Functions", courseSlug: "python-programming", n: 2, sessions: 2, topics: ["Lists", "Tuples", "Dictionaries", "Sets", "Functions", "Parameters", "Return Values", "Lambda", "Scope"] },
    { slug: "py-errors-files", title: "Error Handling & File I/O", courseSlug: "python-programming", n: 3, sessions: 2, topics: ["try/except/finally", "Custom Exceptions", "File Handling", "Reading/Writing", "CSV", "JSON"] },
    { slug: "py-algorithms-oop", title: "Algorithms & OOP", courseSlug: "python-programming", n: 4, sessions: 2, topics: ["Linear Search", "Binary Search", "Bubble Sort", "Recursion", "Classes & Objects", "Inheritance", "Polymorphism"] },
    { slug: "py-advanced-oop", title: "Advanced OOP & Python Ecosystem", courseSlug: "python-programming", n: 5, sessions: 2, topics: ["Encapsulation", "Abstraction", "Magic Methods", "Standard Libraries", "Modules & Packages", "Virtual Environments", "Mini-Project"] },
    // Original Module 2: Math & Stats (5 sessions)
    { slug: "math-linalg", title: "Linear Algebra", courseSlug: "linear-algebra", n: 1, sessions: 1, topics: ["Scalars", "Vectors", "Matrices", "Tensors", "Matrix Operations", "Multiplication", "Determinants"] },
    { slug: "math-linalg-adv", title: "Linear Algebra Advanced", courseSlug: "linear-algebra", n: 2, sessions: 1, topics: ["Eigenvalues", "Eigenvectors", "Matrix Inverse", "Vector Operations", "Dot Product", "Cross Product", "Norms"] },
    { slug: "math-calculus-opt", title: "Calculus & Optimization", courseSlug: "calculus", n: 3, sessions: 1, topics: ["Differentiation", "Partial Derivatives", "Chain Rule", "Gradient Descent", "Optimization Concepts"] },
    { slug: "math-stats", title: "Statistics", courseSlug: "statistics", n: 4, sessions: 1, topics: ["Population vs Sample", "Mean/Median/Mode", "Variance", "Std Dev", "IQR", "Distributions", "Skewness", "Kurtosis"] },
    { slug: "math-probability", title: "Probability", courseSlug: "probability", n: 5, sessions: 1, topics: ["Probability Basics", "Conditional Probability", "Joint Probability", "Bayes", "Likelihood", "Correlation", "Covariance"] },
    // Original Module 3: Data Analysis (10 sessions)
    { slug: "da-numpy-foundations", title: "NumPy Foundations", courseSlug: "numpy", n: 1, sessions: 2, topics: ["Arrays", "N-D Arrays", "Indexing & Slicing", "Reshaping"] },
    { slug: "da-numpy-perf", title: "NumPy Performance + Inferential Stats + Pandas Intro", courseSlug: "numpy", n: 2, sessions: 2, topics: ["Broadcasting", "Strides", "Vectorized Ops", "Math Ops", "Random Module", "Performance", "Hypothesis Testing", "A/B Testing", "Z-Score", "T-Test", "P-Value", "CI", "ANOVA", "DataFrames", "Series"] },
    { slug: "da-pandas-wrangling", title: "Pandas Data Wrangling", courseSlug: "pandas", n: 3, sessions: 2, topics: ["Read CSV/Excel/JSON/SQL", "Filtering", "Sorting", "GroupBy", "Aggregation", "Joins", "Merge", "Missing Values", "Outliers", "Feature Engineering", "EDA Workflow"] },
    { slug: "da-viz", title: "Data Visualization", courseSlug: "visualization", n: 4, sessions: 2, topics: ["Matplotlib", "Line/Bar/Hist/Scatter", "Seaborn: heatmaps, pairplots, distributions", "Plotly", "Interactive Dashboards", "Chart Choice", "Storytelling"] },
    { slug: "da-capstone", title: "EDA Capstone", courseSlug: "eda-capstone", n: 5, sessions: 2, topics: ["Real-world dataset", "Full pipeline", "Load", "Clean", "Analyze", "Visualize & present", "Best practices", "Code review"] },
    // Original Module 4: Excel & Power BI (4 sessions, 2 sections)
    { slug: "excel", title: "Excel for Data Analysis", courseSlug: "excel-powerbi", n: 1, sessions: 2, topics: ["Functions & Formulas", "VLOOKUP", "XLOOKUP", "Pivot Tables", "Power Query", "Charts", "Dashboards"] },
    { slug: "powerbi", title: "Power BI", courseSlug: "excel-powerbi", n: 2, sessions: 2, topics: ["Introduction", "Power Query", "Power Pivot", "Data Modeling", "Relationships", "DAX", "Dashboards", "Publishing & Sharing"] },
    // Original Module 5: Databases & Data Engineering (8 sessions, 4 sections)
    { slug: "de-sql-design", title: "SQL & Database Design", courseSlug: "sql-databases", n: 1, sessions: 2, topics: ["ERD", "Database Design", "Normalization", "SQL Basics", "DDL", "DML", "DQL"] },
    { slug: "de-advanced-sql", title: "Advanced SQL & Web Scraping", courseSlug: "sql-databases", n: 2, sessions: 2, topics: ["JOINs", "Subqueries", "Views", "CTEs", "Window Functions", "Stored Procedures", "Query Optimization"] },
    { slug: "de-scraping", title: "Scraping & Data Engineering Intro", courseSlug: "web-scraping", n: 3, sessions: 2, topics: ["BeautifulSoup", "Regex", "Selenium", "Dynamic Websites", "APIs for Data Collection", "Intro to Data Engineering", "Data Warehousing"] },
    { slug: "de-etl-capstone", title: "ETL Pipelines & Capstone", courseSlug: "data-warehousing-etl", n: 4, sessions: 2, topics: ["ETL/ELT", "Design", "Tools", "Implementation", "End-to-end pipeline", "Scrape→clean→store→query"] },
    // Original Module 6: Machine Learning (12 sessions, 6 sections)
    { slug: "ml-fundamentals", title: "ML Fundamentals & Preprocessing", courseSlug: "machine-learning", n: 1, sessions: 2, topics: ["Types of ML", "Supervised vs Unsupervised", "Scikit-learn", "Scaling", "Encoding", "Feature Selection", "Imbalanced Data"] },
    { slug: "ml-regression", title: "Regression Models", courseSlug: "machine-learning", n: 2, sessions: 2, topics: ["Linear Regression", "Simple/Multiple", "MSE", "R²", "Evaluation"] },
    { slug: "ml-classification", title: "Classification Models", courseSlug: "machine-learning", n: 3, sessions: 2, topics: ["Logistic Regression", "Precision/Recall/F1", "ROC-AUC", "Decision Trees", "SVM", "KNN", "Naive Bayes"] },
    { slug: "ml-ensembles", title: "Ensemble Methods", courseSlug: "machine-learning", n: 4, sessions: 2, topics: ["Cross-Validation", "Grid/Random Search", "Random Forest", "Bagging", "Boosting", "XGBoost", "CatBoost", "Stacking", "Model Selection"] },
    { slug: "ml-unsupervised", title: "Unsupervised Learning", courseSlug: "machine-learning", n: 5, sessions: 2, topics: ["K-Means", "DBSCAN", "Hierarchical", "PCA", "Recommendation Systems", "Apriori"] },
    { slug: "ml-capstone", title: "ML Capstone", courseSlug: "machine-learning", n: 6, sessions: 2, topics: ["Problem selection", "Data prep", "Baselines", "Tuning", "Evaluation", "Model card", "Presentation"] },
    // Original Module 7: Deep Learning (16 sessions, 6 sections)
    { slug: "dl-ann-foundations", title: "Neural Networks Foundations", courseSlug: "deep-learning", n: 1, sessions: 3, topics: ["ANN Architecture", "Backpropagation", "Activation Functions", "Loss Functions", "Optimizers", "SGD", "Adam", "Overfitting", "Dropout", "Early Stopping"] },
    { slug: "dl-ann-keras", title: "Building ANNs with TensorFlow/Keras", courseSlug: "deep-learning", n: 2, sessions: 2, topics: ["Batch Norm", "LR Scheduling", "TensorFlow/Keras", "Train ANN on tabular", "Hands-on lab"] },
    { slug: "dl-cv", title: "Computer Vision", courseSlug: "computer-vision", n: 3, sessions: 4, topics: ["CNN Architecture", "Filters", "Pooling", "Transfer Learning", "VGG", "ResNet", "EfficientNet", "Fine-tuning", "Object Detection", "YOLO", "OpenCV", "Segmentation", "Pose Estimation"] },
    { slug: "dl-sequences", title: "Sequence Models & Time Series", courseSlug: "deep-learning", n: 4, sessions: 2, topics: ["RNN", "LSTM", "GRU", "Theory/Implementation", "Time Series with LSTM", "Real-world lab"] },
    { slug: "dl-nlp", title: "NLP Fundamentals", courseSlug: "nlp", n: 5, sessions: 2, topics: ["Text Preprocessing", "Tokenization", "Stop Words", "Stemming", "Lemmatization", "TF-IDF", "N-Grams", "Word2Vec", "Embeddings", "Seq2Seq", "Summarization", "Translation", "Text Generation"] },
    { slug: "dl-transformers", title: "Transformers & LLMs", courseSlug: "llms", n: 6, sessions: 3, topics: ["Attention", "Architecture", "Embeddings", "Tokenizers", "Context Window", "Fine-tuning", "LoRA", "QLoRA", "Hugging Face", "Encoder/Decoder/Enc-Dec", "Prompt Engineering", "RAG", "Vector DBs", "AI Agents", "Capstone kickoff"] },
    // Original Module 8: Development & MLOps (2 sessions, 1 section)
    { slug: "mlops-deployment", title: "Model Deployment & Final Capstone", courseSlug: "mlops", n: 1, sessions: 2, topics: ["APIs Fundamentals", "FastAPI", "Model API", "Streamlit", "Docker Basics", "Containerization", "CI/CD overview", "Final Capstone presentations"] },
  ];

  const moduleIds: Record<string, string> = {};
  for (const m of moduleData) {
    const courseId = courseIds[m.courseSlug];
    const stage = courseData.find((c) => c.slug === m.courseSlug)?.stageSlug;
    const [created] = await db
      .insert(modules)
      .values({
        slug: m.slug,
        title: m.title,
        description: `Topics: ${m.topics.join(", ")}`,
        sessionCount: m.sessions,
        order: m.n,
        courseId,
        stageId: stage ? stageIds[stage] : null,
      })
      .returning({ id: modules.id });
    moduleIds[m.slug] = created.id;
  }
  console.log("✅ Modules seeded");

  // ============================================
  // LESSONS - seed one lesson per module as accessible entry points
  // ============================================
  for (const m of moduleData) {
    await db.insert(lessons).values({
      slug: `${m.slug}-lesson`,
      title: m.title,
      moduleId: moduleIds[m.slug],
      courseId: courseIds[m.courseSlug],
      whyThisMatters: `This session covers ${m.topics.slice(0, 3).join(", ")} — essential building blocks for AI engineering work.`,
      learningObjectives: m.topics,
      content: generateLessonContent(m.title, m.topics, m.courseSlug),
      concepts: m.topics,
      skillIds: [],
      masteryCriteria: ["Explain key concepts from memory", "Solve a direct application problem", "Apply to a new context"],
      mustWriteNotes: ["Core idea in your own words", "One formula / rule / API signature", "One worked example", "One common mistake", "When to use it"],
      recommendedNotes: ["Connection to prior concepts", "Analogy or mental model"],
      estimatedMinutes: 45,
      order: 1,
    });
  }
  console.log("✅ Lessons seeded");

  // ============================================
  // SKILLS - comprehensive skill taxonomy
  // ============================================
  const skillData = [
    // Programming
    { slug: "python", title: "Python Programming", cat: "Programming", level: "core", prereqs: [] },
    { slug: "c-programming", title: "C Programming", cat: "Programming", level: "support", prereqs: [] },
    { slug: "typescript", title: "TypeScript", cat: "Programming", level: "support", prereqs: [] },
    { slug: "bash", title: "Bash / CLI", cat: "Programming", level: "support", prereqs: [] },
    { slug: "git", title: "Git & GitHub", cat: "Programming", level: "core", prereqs: [] },
    { slug: "debugging", title: "Debugging", cat: "Programming", level: "core", prereqs: [] },
    // CS
    { slug: "data-structures", title: "Data Structures", cat: "Computer Science", level: "core", prereqs: ["python"] },
    { slug: "algorithms", title: "Algorithms", cat: "Computer Science", level: "core", prereqs: ["data-structures"] },
    { slug: "complexity-analysis", title: "Asymptotic Complexity", cat: "Computer Science", level: "core", prereqs: ["algorithms"] },
    { slug: "systems", title: "Systems Programming", cat: "Computer Science", level: "support", prereqs: ["c-programming"] },
    { slug: "os-concepts", title: "OS Concepts / Concurrency", cat: "Computer Science", level: "support", prereqs: ["systems"] },
    { slug: "networking", title: "Networking Fundamentals", cat: "Computer Science", level: "support", prereqs: ["systems"] },
    // Math
    { slug: "calculus-skill", title: "Calculus", cat: "Mathematics", level: "core", prereqs: [] },
    { slug: "linear-algebra-skill", title: "Linear Algebra", cat: "Mathematics", level: "core", prereqs: [] },
    { slug: "probability-skill", title: "Probability", cat: "Mathematics", level: "core", prereqs: ["calculus-skill"] },
    { slug: "statistics-skill", title: "Statistics", cat: "Mathematics", level: "core", prereqs: ["probability-skill"] },
    { slug: "optimization-skill", title: "Optimization", cat: "Mathematics", level: "core", prereqs: ["calculus-skill", "linear-algebra-skill"] },
    // Data
    { slug: "numpy-skill", title: "NumPy", cat: "Data", level: "core", prereqs: ["python", "linear-algebra-skill"] },
    { slug: "pandas-skill", title: "Pandas", cat: "Data", level: "core", prereqs: ["numpy-skill"] },
    { slug: "sql", title: "SQL", cat: "Data", level: "core", prereqs: [] },
    { slug: "eda", title: "Exploratory Data Analysis", cat: "Data", level: "core", prereqs: ["pandas-skill", "visualization-skill"] },
    { slug: "visualization-skill", title: "Data Visualization", cat: "Data", level: "core", prereqs: ["pandas-skill"] },
    { slug: "web-scraping-skill", title: "Web Scraping", cat: "Data", level: "support", prereqs: ["python", "html"] as any },
    { slug: "etl", title: "ETL / ELT Pipelines", cat: "Data Engineering", level: "support", prereqs: ["sql", "python"] },
    { slug: "excel-skill", title: "Excel", cat: "Data", level: "support", prereqs: [] },
    { slug: "powerbi", title: "Power BI", cat: "Data", level: "support", prereqs: [] },
    { slug: "spark", title: "Spark / Big Data", cat: "Data Engineering", level: "support", prereqs: ["sql", "python"] },
    // ML
    { slug: "preprocessing", title: "Data Preprocessing", cat: "ML", level: "core", prereqs: ["pandas-skill"] },
    { slug: "classical-ml", title: "Classical ML Models", cat: "ML", level: "core", prereqs: ["preprocessing", "statistics-skill", "optimization-skill"] },
    { slug: "model-evaluation", title: "Model Evaluation", cat: "ML", level: "core", prereqs: ["classical-ml", "statistics-skill"] },
    { slug: "ensemble-methods", title: "Ensemble Methods", cat: "ML", level: "core", prereqs: ["classical-ml"] },
    { slug: "unsupervised", title: "Unsupervised Learning", cat: "ML", level: "core", prereqs: ["classical-ml"] },
    // DL
    { slug: "neural-networks", title: "Neural Networks", cat: "Deep Learning", level: "core", prereqs: ["classical-ml", "optimization-skill", "linear-algebra-skill"] },
    { slug: "cnn", title: "Convolutional Neural Networks", cat: "Deep Learning", level: "specialization", prereqs: ["neural-networks"] },
    { slug: "rnn-lstm", title: "RNNs / LSTMs", cat: "Deep Learning", level: "specialization", prereqs: ["neural-networks"] },
    { slug: "transformers", title: "Transformers", cat: "Deep Learning", level: "core", prereqs: ["neural-networks"] },
    { slug: "computer-vision-skill", title: "Computer Vision", cat: "Deep Learning", level: "specialization", prereqs: ["cnn"] },
    { slug: "nlp-skill", title: "Natural Language Processing", cat: "Deep Learning", level: "specialization", prereqs: ["rnn-lstm", "transformers"] },
    { slug: "llms", title: "Large Language Models", cat: "Modern AI", level: "core", prereqs: ["transformers", "nlp-skill"] },
    { slug: "fine-tuning", title: "Fine-Tuning (LoRA/QLoRA)", cat: "Modern AI", level: "core", prereqs: ["llms"] },
    { slug: "rag", title: "Retrieval-Augmented Generation", cat: "Modern AI", level: "advanced", prereqs: ["llms", "vector-search"] },
    { slug: "vector-search", title: "Vector Search & Embeddings", cat: "Modern AI", level: "core", prereqs: ["llms"] },
    { slug: "agents-skill", title: "AI Agents", cat: "Modern AI", level: "advanced", prereqs: ["llms", "rag"] },
    // Production
    { slug: "apis", title: "API Design (FastAPI/REST)", cat: "Production", level: "core", prereqs: ["python"] },
    { slug: "docker", title: "Docker & Containerization", cat: "Production", level: "core", prereqs: ["apis"] },
    { slug: "cicd", title: "CI/CD", cat: "Production", level: "core", prereqs: ["git", "docker"] },
    { slug: "aws", title: "AWS Cloud", cat: "Production", level: "core", prereqs: ["docker"] },
    { slug: "azure", title: "Azure Cloud", cat: "Production", level: "support", prereqs: ["docker"] },
    { slug: "mlops-skill", title: "MLOps Lifecycle", cat: "Production", level: "core", prereqs: ["classical-ml", "apis", "docker", "aws"] },
    { slug: "monitoring", title: "Model Monitoring & Drift", cat: "Production", level: "core", prereqs: ["mlops-skill"] },
    { slug: "testing-ml", title: "Testing ML Systems", cat: "Production", level: "core", prereqs: ["mlops-skill"] },
    // Security/Ethics
    { slug: "ai-ethics", title: "AI Ethics & Responsible AI", cat: "Security", level: "core", prereqs: ["classical-ml"] },
    { slug: "ai-security", title: "AI Security & Prompt Injection", cat: "Security", level: "core", prereqs: ["llms", "apis"] },
    // Career
    { slug: "technical-english", title: "Technical English", cat: "Career", level: "core", prereqs: [] },
    { slug: "technical-writing", title: "Technical Writing", cat: "Career", level: "core", prereqs: ["technical-english"] },
    { slug: "system-design", title: "System Design", cat: "Career", level: "core", prereqs: ["mlops-skill", "apis"] },
    { slug: "interviewing", title: "Technical Interviewing", cat: "Career", level: "core", prereqs: ["algorithms", "classical-ml"] },
    { slug: "portfolio-building", title: "Portfolio Building", cat: "Career", level: "core", prereqs: [] },
    { slug: "freelancing-skill", title: "Freelancing & Client Work", cat: "Career", level: "support", prereqs: ["apis", "mlops-skill"] },
    // Research
    { slug: "paper-reading", title: "Research Paper Reading", cat: "Research", level: "advanced", prereqs: ["classical-ml"] },
    { slug: "experiment-design", title: "Experiment Design", cat: "Research", level: "advanced", prereqs: ["statistics-skill", "classical-ml"] },
    { slug: "reproduction", title: "Reproducing Research", cat: "Research", level: "advanced", prereqs: ["paper-reading", "deep-learning-final" as any] },
  ];

  for (const s of skillData) {
    await db.insert(skills).values({
      slug: s.slug,
      title: s.title,
      description: `${s.title} — ${s.level} level ${s.cat} skill.`,
      category: s.cat,
      level: s.level,
      prerequisites: s.prereqs,
      englishTerms: [s.title],
      order: 0,
    });
  }
  console.log("✅ Skills seeded");

  // ============================================
  // PROJECTS - all 21+ original projects + additions
  // ============================================
  const projectList = [
    // Level 1 - Python engineering
    { n: 10, slug: "library-management", title: "Library Management System", level: 1, cat: "Original Curriculum", desc: "Command-line library system with books, members, checkouts, and search using Python OOP.", tech: ["Python", "OOP"], skills: ["python", "data-structures"] },
    // Level 2 - Data analysis
    { n: 11, slug: "uber-analysis", title: "Uber Data Analysis", level: 2, cat: "Original Curriculum", desc: "Analyze Uber ride data: trips, timing, locations, patterns. Produce visualizations and insights.", tech: ["Python", "Pandas", "Matplotlib", "Seaborn"], skills: ["pandas-skill", "eda", "visualization-skill"] },
    { n: 12, slug: "superstore-dashboard", title: "Superstore Data Analysis Dashboard", level: 2, cat: "Original Curriculum", desc: "Sales dashboard for a superstore dataset with profitability, segment analysis, and time trends.", tech: ["Python", "Pandas", "Plotly", "Power BI"], skills: ["pandas-skill", "visualization-skill", "powerbi"] },
    { n: 13, slug: "hr-dashboard", title: "HR Dashboard", level: 2, cat: "Original Curriculum", desc: "HR analytics: attrition factors, department performance, employee satisfaction.", tech: ["Power BI", "Excel", "Pandas"], skills: ["eda", "powerbi", "excel-skill"] },
    { n: 14, slug: "bank-loan-analysis", title: "Bank Loan Data Analysis", level: 2, cat: "Original Curriculum", desc: "Analyze loan applicant data: default risk, approval patterns, portfolio health.", tech: ["Python", "SQL", "Pandas"], skills: ["sql", "eda", "pandas-skill"] },
    { n: 15, slug: "sales-database", title: "Sales Database", level: 3, cat: "Original Curriculum", desc: "Design and build a relational sales database with queries, reports, and analytics views.", tech: ["SQL", "PostgreSQL", "ERD Design"], skills: ["sql"] },
    // Level 4 - Classical ML
    { n: 16, slug: "credit-card-fraud", title: "Credit Card Fraud Detection", level: 4, cat: "Original Curriculum", desc: "Highly imbalanced fraud detection with classifiers, threshold tuning, and cost-sensitive evaluation.", tech: ["Python", "Scikit-learn", "XGBoost", "Pandas"], skills: ["classical-ml", "ensemble-methods", "model-evaluation", "preprocessing"] },
    { n: 17, slug: "titanic-prediction", title: "Titanic Survival Prediction", level: 4, cat: "Original Curriculum", desc: "Classic Kaggle-style classification problem with full EDA, feature engineering, and multiple models.", tech: ["Python", "Scikit-learn", "Pandas"], skills: ["classical-ml", "preprocessing", "eda"] },
    { n: 18, slug: "house-pricing", title: "House Pricing Prediction", level: 4, cat: "Original Curriculum", desc: "Regression task: predict house prices with feature engineering, regularized models, and evaluation.", tech: ["Python", "Scikit-learn", "XGBoost"], skills: ["classical-ml", "model-evaluation", "preprocessing"] },
    { n: 4, slug: "stock-market", title: "Stock Market Prediction", level: 4, cat: "Original Curriculum", desc: "Time-series or regression approaches to stock prediction with proper evaluation and caveats.", tech: ["Python", "Scikit-learn", "Pandas", "Time Series"], skills: ["classical-ml", "eda", "model-evaluation"] },
    // Level 5 - Deep Learning
    { n: 1, slug: "skin-disease", title: "Skin Disease Prediction", level: 5, cat: "Original Curriculum", desc: "Classify skin lesion images with CNNs, transfer learning, and medical imaging caveats.", tech: ["Python", "TensorFlow/Keras", "CNN", "Transfer Learning"], skills: ["neural-networks", "cnn", "computer-vision-skill", "model-evaluation"] },
    { n: 2, slug: "face-recognition", title: "Face Recognition / Detection / Verification", level: 5, cat: "Original Curriculum", desc: "Build face detection and recognition pipeline using modern architectures and pre-trained models.", tech: ["Python", "OpenCV", "TensorFlow", "Face Recognition"], skills: ["cnn", "computer-vision-skill"] },
    { n: 5, slug: "sign-language", title: "Sign Language Classifier", level: 5, cat: "Original Curriculum", desc: "Classify sign language images or video frames with CNN and/or transfer learning.", tech: ["Python", "TensorFlow/Keras", "OpenCV"], skills: ["cnn", "computer-vision-skill"] },
    { n: 7, slug: "breast-cancer", title: "Breast Cancer Detection", level: 5, cat: "Original Curriculum", desc: "Binary classification on breast cancer histopathology/features data with proper medical ML evaluation.", tech: ["Python", "Scikit-learn", "TensorFlow", "Tabular/Images"], skills: ["classical-ml", "neural-networks", "model-evaluation", "ai-ethics"] },
    { n: 8, slug: "brain-tumor", title: "Brain Tumor Detection", level: 5, cat: "Original Curriculum", desc: "Detect brain tumors in MRI scans using CNNs with sensitivity/specificity analysis.", tech: ["Python", "TensorFlow", "CNN", "Transfer Learning"], skills: ["cnn", "computer-vision-skill", "model-evaluation"] },
    // Level 6 - CV/NLP
    { n: 3, slug: "text-classification", title: "Text Classification", level: 6, cat: "Original Curriculum", desc: "Spam detection, sentiment analysis, or topic classification with classical and deep NLP.", tech: ["Python", "Scikit-learn", "NLTK", "TensorFlow", "Hugging Face"], skills: ["nlp-skill", "classical-ml", "neural-networks"] },
    { n: 6, slug: "realtime-object-detection", title: "Real-time Object Detection", level: 6, cat: "Original Curriculum", desc: "YOLO-based real-time object detection from webcam or video with OpenCV.", tech: ["Python", "YOLO", "OpenCV", "TensorFlow/PyTorch"], skills: ["computer-vision-skill", "cnn"] },
    { n: 9, slug: "image-generation-gans", title: "Image Generation using GANs", level: 6, cat: "Original Curriculum", desc: "Implement GAN or DCGAN for image generation with training dynamics analysis.", tech: ["Python", "TensorFlow/PyTorch", "GANs"], skills: ["neural-networks", "cnn", "computer-vision-skill"] },
    { n: 19, slug: "chatbot", title: "Chatbot", level: 7, cat: "Original Curriculum", desc: "Conversational agent: from retrieval-based to fine-tuned LLM with guardrails.", tech: ["Python", "Hugging Face", "LLMs", "Rasa/Chains"], skills: ["nlp-skill", "llms", "agents-skill"] },
    { n: 20, slug: "document-summarization", title: "Document Summarization", level: 7, cat: "Original Curriculum", desc: "Extractive and abstractive summarization of long documents with LLMs.", tech: ["Python", "Hugging Face", "Transformers"], skills: ["nlp-skill", "llms", "transformers"] },
    { n: 21, slug: "rag-system", title: "RAG System", level: 7, cat: "Original Curriculum", desc: "End-to-end RAG: document ingestion, chunking, embedding, vector search, generation, citations.", tech: ["Python", "LangChain/LlamaIndex", "Vector DB", "Hugging Face", "FastAPI"], skills: ["rag", "llms", "vector-search", "apis"] },
  ];

  for (const p of projectList) {
    await db.insert(projects).values({
      slug: p.slug,
      title: p.title,
      shortDescription: p.desc,
      fullDescription: p.desc,
      projectLevel: p.level,
      sourceCategory: p.cat,
      requiredTechnologies: p.tech,
      recommendedPrerequisites: p.skills,
      skillIds: p.skills,
      careerRoles: ["AI Engineer", "ML Engineer"],
      milestones: [
        { title: "Setup & data acquisition", done: false },
        { title: "Data cleaning / EDA", done: false },
        { title: "Baseline model", done: false },
        { title: "Improved model", done: false },
        { title: "Evaluation & failure analysis", done: false },
        { title: "Deployment / demo", done: false },
        { title: "Documentation & portfolio writeup", done: false },
      ],
      requirements: ["Working implementation", "Documented evaluation", "Code on GitHub"],
      acceptanceCriteria: ["Meets baseline metric", "Demonstrates understanding", "Has error analysis"],
      deliverables: ["GitHub repo", "README", "Demo", "Report"],
      isFlagship: [1, 6, 19, 21].includes(p.n),
      order: p.n,
    });
  }
  console.log("✅ Projects seeded");

  // ============================================
  // CAREER ROLES (Navisoft + NUWAVE blueprints)
  // ============================================
  await db.insert(careerRoles).values([
    {
      slug: "navisoft-ai-engineer",
      title: "AI Engineer",
      company: "Navisoft (reference blueprint)",
      roleType: "target",
      description: "AI/ML Engineer with TensorFlow, PyTorch, NLP, statistical modeling, R, SAS, SQL, database design, Hadoop, Spark, ETL, Talend, AWS, predictive modeling, generative AI, Bash, VBA, Python, Java, C, scalable systems, cloud deployment.",
      requirementsHard: [
        "AI/ML model development",
        "TensorFlow",
        "PyTorch",
        "NLP",
        "Statistical modeling",
        "R",
        "SAS",
        "SQL / database design",
        "Hadoop",
        "Spark",
        "ETL / Talend",
        "AWS",
        "Predictive modeling",
        "Generative AI",
        "Python",
      ],
      requirementsPreferred: ["Bash", "Java", "C", "VBA", "Scalable systems", "Cloud deployment", "Data mining"],
      seniority: "mid-level",
      sourceUrl: "https://app.devfound.ai/jobs/ai-engineers-navisoft/140943",
      snapshotDate: new Date(),
      status: "reference_blueprint",
      skills: ["tensorflow", "pytorch", "nlp", "statistical-modeling", "python", "sql", "aws", "spark", "etl"],
    },
    {
      slug: "nuwave-ai-engineer",
      title: "Production AI Engineer",
      company: "NUWAVE (reference blueprint)",
      roleType: "target",
      description: "Production AI engineer: Python, TypeScript, AWS, Azure, serverless, containers, identity, data, observability, RAG, GraphRAG, vector search, graph databases, agent workflows, Git, testing, deployment, rollback, IaC, LangGraph, LangChain, Microsoft Graph, Teams apps, Entra ID, multi-agent orchestration, security, ISO 42001, distributed systems, technical documentation, incident response.",
      requirementsHard: [
        "Python",
        "TypeScript",
        "AWS",
        "Serverless / containers",
        "RAG",
        "Vector search",
        "Agent workflows",
        "Git / testing / CI/CD",
        "Deployment & rollback",
        "Security mindset",
        "Distributed systems",
        "Technical documentation",
      ],
      requirementsPreferred: ["Azure / Entra ID", "Terraform/OpenTofu", "LangGraph/LangChain", "Graph databases", "ISO 42001", "Microsoft Graph", "Incident response"],
      seniority: "mid-senior",
      sourceUrl: "https://jobs.nuwave.com/apply/JshTpQ8tb8/AI-Engineer",
      snapshotDate: new Date(),
      status: "reference_blueprint",
      skills: ["python", "typescript", "aws", "azure", "rag", "vector-search", "agents", "cicd", "docker", "system-design", "ai-security"],
    },
  ]);
  console.log("✅ Career roles seeded");

  // ============================================
  // FREELANCE SERVICES
  // ============================================
  await db.insert(freelanceServices).values([
    {
      slug: "ml-model-development",
      title: "Custom ML Model Development",
      description: "Build predictive models for tabular business problems: churn, scoring, forecasting, segmentation.",
      niche: "SME / business data",
      deliverables: ["Trained model", "API endpoint", "Evaluation report", "Documentation"],
      skills: ["classical-ml", "apis", "model-evaluation"],
      typicalQuestions: [
        "What business outcome are we predicting?",
        "What data do you currently have, in what format?",
        "How will predictions be consumed — batch or real-time?",
        "What is the cost of false positives vs false negatives?",
        "Who maintains the model after delivery?",
      ],
    },
    {
      slug: "rag-chatbot",
      title: "RAG Chatbot on Internal Documents",
      description: "Build a grounded chatbot that answers questions from company docs, knowledge bases, or PDFs.",
      niche: "Internal knowledge / support",
      deliverables: ["Ingestion pipeline", "Chat interface / API", "Citation system", "Evaluation report"],
      skills: ["rag", "llms", "vector-search", "apis"],
      typicalQuestions: [
        "Who are the users (employees, customers, support)?",
        "What are the source documents and how do they update?",
        "What access controls are required?",
        "What languages?",
        "What is the acceptable hallucination rate?",
      ],
    },
    {
      slug: "data-dashboard",
      title: "Data Analytics Dashboard",
      description: "Design and build interactive dashboards for KPIs, operations, or customer data.",
      niche: "Business intelligence",
      deliverables: ["Dashboard (Power BI / Streamlit / Plotly)", "Data pipeline", "User documentation"],
      skills: ["eda", "visualization-skill", "sql", "pandas-skill", "powerbi"],
      typicalQuestions: [
        "Which KPIs matter most?",
        "Who is the audience (exec, ops, analyst)?",
        "How fresh does data need to be?",
        "What are the drill-down dimensions?",
        "Do you need export capabilities?",
      ],
    },
    {
      slug: "data-pipeline",
      title: "Data Pipeline / ETL Build",
      description: "Build robust ETL pipelines for data collection, cleaning, and warehouse loading.",
      niche: "Data infrastructure",
      deliverables: ["Pipeline code", "Scheduling", "Logging/alerting", "Documentation"],
      skills: ["etl", "sql", "python", "web-scraping-skill"],
      typicalQuestions: [
        "What are the source systems?",
        "What is the data volume and frequency?",
        "Where does it need to land?",
        "What SLAs for freshness?",
        "How are bad records handled?",
      ],
    },
  ]);
  console.log("✅ Freelance services seeded");

  // ============================================
  // ENGLISH TERMS
  // ============================================
  const englishTermsData = [
    { term: "encapsulation", ar: "التغليف", b1b2: "Hiding the internal details of code and only exposing what is needed", ex: "Encapsulation in this class keeps the internal state safe from outside changes.", pos: "noun" },
    { term: "abstraction", ar: "التجريد", b1b2: "Showing only important features and hiding complexity", ex: "The API abstraction lets us use the model without understanding every detail.", pos: "noun" },
    { term: "robustness", ar: "المتانة", b1b2: "How well a system handles errors and unexpected inputs", ex: "We added input validation to improve the system's robustness.", pos: "noun" },
    { term: "observability", ar: "قابلية المراقبة", b1b2: "The ability to understand what a system is doing from its logs and metrics", ex: "Good observability means we can detect production issues quickly.", pos: "noun" },
    { term: "idempotency", ar: "الثبات/عدم التكرار", b1b2: "A property where doing the same operation multiple times has the same result as doing it once", ex: "The webhook endpoint must be idempotent to handle retries safely.", pos: "noun" },
    { term: "generalization", ar: "التعميم", b1b2: "How well a model performs on new, unseen data", ex: "The model showed good generalization on the holdout test set.", pos: "noun" },
    { term: "calibration", ar: "المعايرة", b1b2: "How well predicted probabilities match actual outcomes", ex: "We performed temperature scaling to improve calibration.", pos: "noun" },
    { term: "inference", ar: "الاستدلال/التنبؤ", b1b2: "Running a trained model to produce predictions; also drawing conclusions from data", ex: "Inference latency was under 100ms per request.", pos: "noun" },
    { term: "orchestration", ar: "التنسيق/الأوركستر", b1b2: "Coordinating multiple services, tasks, or agents in a workflow", ex: "We use Airflow for data pipeline orchestration.", pos: "noun" },
    { term: "concurrency", ar: "التزامن", b1b2: "Multiple tasks happening at the same time in a system", ex: "Concurrency bugs are difficult to reproduce.", pos: "noun" },
    { term: "reproducibility", ar: "قابلية الإعادة", b1b2: "Being able to run the same experiment and get the same results", ex: "We pinned library versions and saved the random seed for reproducibility.", pos: "noun" },
    { term: "maintainability", ar: "قابلية الصيانة", b1b2: "How easy it is to change and update code over time", ex: "Clean interfaces and tests improve maintainability.", pos: "noun" },
    { term: "scalability", ar: "قابلية التوسع", b1b2: "How well a system handles more data or more users", ex: "The serverless design improved scalability for sudden traffic spikes.", pos: "noun" },
    { term: "uncertainty", ar: "عدم اليقين", b1b2: "How much doubt there is in a prediction or estimate", ex: "Bayesian models explicitly represent uncertainty.", pos: "noun" },
    { term: "trade-off", ar: "مقايضة/مفاضلة", b1b2: "Giving up one thing to gain another", ex: "There is always a trade-off between precision and recall.", pos: "noun" },
    { term: "gradient", ar: "التدرج/المشتقة المتجهة", b1b2: "The vector of partial derivatives used in optimization", ex: "Gradient descent uses the gradient to update weights.", pos: "noun" },
    { term: "overfitting", ar: "الإفراط في التعلم", b1b2: "When a model learns training data too well and fails on new data", ex: "We added dropout to reduce overfitting.", pos: "noun" },
    { term: "bias", ar: "الانحياز", b1b2: "Systematic error in a model or data that skews results", ex: "The training data had gender bias that led to unfair decisions.", pos: "noun" },
    { term: "fairness", ar: "العدالة", b1b2: "Whether model outcomes are equitable across groups", ex: "We tested fairness across different demographic slices.", pos: "noun" },
    { term: "latency", ar: "زمن الاستجابة", b1b2: "How long a request takes from sending to receiving a response", ex: "We reduced p95 latency by adding a cache.", pos: "noun" },
    { term: "throughput", ar: "الإنتاجية", b1b2: "Number of requests a system can handle per unit time", ex: "Batching improved throughput by a factor of four.", pos: "noun" },
    { term: "drift", ar: "الانحراف", b1b2: "When data distribution or model behavior changes over time", ex: "We monitor for data drift every week.", pos: "noun" },
    { term: "ablation", ar: "دراسة الإزالة", b1b2: "Removing one component to measure how much it contributes", ex: "Our ablation study showed attention was the key component.", pos: "noun" },
    { term: "baseline", ar: "نموذج مرجعي/خط أساس", b1b2: "A simple model used as a comparison point for more advanced ones", ex: "Always compare against a strong baseline.", pos: "noun" },
    { term: "chunking", ar: "تقسيم النص إلى قطع", b1b2: "Splitting documents into smaller pieces for retrieval", ex: "Semantic chunking improved retrieval quality.", pos: "noun" },
    { term: "fine-tuning", ar: "الضبط الدقيق", b1b2: "Taking a pretrained model and training it further on a specific task", ex: "LoRA made fine-tuning feasible on consumer GPUs.", pos: "noun" },
    { term: "hallucination", ar: "هلوسة النموذج", b1b2: "When an LLM produces confident but false information", ex: "Retrieval grounding reduces hallucination rates.", pos: "noun" },
    { term: "pruning", ar: "التقليم", b1b2: "Removing unnecessary weights to make a model smaller", ex: "Pruning reduced model size by 60% with minimal accuracy loss.", pos: "noun" },
    { term: "quantization", ar: "التكميم/تقليل الدقة", b1b2: "Using lower-precision numbers to make inference faster and smaller", ex: "INT8 quantization cut latency in half.", pos: "noun" },
    { term: "recall", ar: "الاسترجاع", b1b2: "A metric measuring how many relevant items were found; also retrieving information from memory", ex: "In medical diagnosis, high recall is often preferred.", pos: "noun" },
    { term: "precision", ar: "الدقة التنبؤية", b1b2: "A metric measuring how many predicted positives were actually positive", ex: "Spam filters need high precision to avoid marking real mail as spam.", pos: "noun" },
  ];

  for (const et of englishTermsData) {
    await db.insert(englishTerms).values({
      term: et.term,
      b1b2Definition: et.b1b2,
      arabicMeaning: et.ar,
      exampleSentence: et.ex,
      partOfSpeech: et.pos,
      category: "AI/Engineering",
      cefrLevel: "b2",
      createdAt: new Date(),
    });
  }
  console.log("✅ English terms seeded");

  // ============================================
  // SOURCES
  // ============================================
  const sourceData = [
    { id: "harvard-cs-requirements", url: "https://csadvising.seas.harvard.edu/concentration/requirements/", title: "Harvard Computer Science Concentration Requirements", publisher: "Harvard SEAS", type: "official", status: "likely_not_verified", note: "Primary source for Harvard CS undergraduate requirements" },
    { id: "harvard-cs50", url: "https://cs50.harvard.edu/college/2026/fall/syllabus/", title: "CS50 Fall 2026 Syllabus", publisher: "Harvard", type: "official", status: "confirmed_historical", note: "Intro CS course" },
    { id: "harvard-ai-cert", url: "https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/", title: "Harvard Extension AI Graduate Certificate", publisher: "Harvard Extension School", type: "official", status: "likely_not_verified", note: "Graduate certificate in AI" },
    { id: "wwc-organizing", url: "https://ies.ed.gov/ncee/wwc/PracticeGuide/1", title: "Organizing Instruction and Study to Improve Student Learning", publisher: "IES What Works Clearinghouse", type: "research", status: "confirmed_current", note: "Learning science practice guide" },
    { id: "dunlosky-2013", url: "https://doi.org/10.1177/1529100612453266", title: "Improving Students' Learning With Effective Learning Techniques", publisher: "Psychological Science in the Public Interest", type: "research", status: "confirmed_current", note: "Dunlosky et al. meta-review of learning techniques" },
    { id: "cepeda-2006", url: "https://pubmed.ncbi.nlm.nih.gov/16719566/", title: "Distributed Practice in Verbal Recall Tasks", publisher: "Psychological Bulletin", type: "research", status: "confirmed_current", note: "Cepeda et al. spaced practice meta-analysis" },
    { id: "wcag-22", url: "https://www.w3.org/TR/WCAG22/", title: "Web Content Accessibility Guidelines 2.2", publisher: "W3C", type: "standard", status: "confirmed_current", note: "Accessibility standard" },
    { id: "owasp-api-2023", url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/", title: "OWASP API Security Top 10 (2023)", publisher: "OWASP", type: "standard", status: "confirmed_current", note: "API security standard" },
    { id: "puter-docs", url: "https://docs.puter.com/", title: "Puter Documentation", publisher: "Puter", type: "integration", status: "confirmed_current", note: "AI provider" },
    { id: "nuwave-job", url: "https://jobs.nuwave.com/apply/JshTpQ8tb8/AI-Engineer", title: "NUWAVE AI Engineer posting", publisher: "NUWAVE", type: "job_posting", status: "likely_not_verified", note: "Reference role blueprint" },
    { id: "navisoft-job", url: "https://app.devfound.ai/jobs/ai-engineers-navisoft/140943", title: "Navisoft AI Engineer posting", publisher: "Navisoft/Devfound", type: "job_posting", status: "likely_not_verified", note: "Reference role blueprint" },
  ];

  for (const s of sourceData) {
    await db.insert(sources).values({
      sourceId: s.id,
      url: s.url,
      title: s.title,
      publisher: s.publisher,
      sourceType: s.type,
      verificationStatus: s.status,
      notes: s.note,
      accessedAt: new Date(),
    });
  }
  console.log("✅ Sources seeded");

  console.log("🌱 Seed complete!");
  process.exit(0);
}

function generateLessonContent(title: string, topics: string[], courseSlug: string): string {
  const whyMap: Record<string, string> = {
    "python-programming": "Python is the primary language for AI/ML work. Mastering it means you can implement, debug, and read production AI code.",
    "linear-algebra": "Data in ML is stored as vectors and matrices. Models are linear transformations combined with non-linearities. Linear algebra is not optional.",
    "calculus": "Optimization — training neural networks — relies on gradients, partial derivatives, and the chain rule.",
    "probability": "AI is reasoning under uncertainty. Probability is the language we use to talk about models, data, and predictions.",
    "statistics": "Statistics lets you draw conclusions from data, design experiments, and evaluate whether a model's performance is real.",
    "numpy": "Numerical Python is the bedrock of the entire Python ML ecosystem. Understand it and everything else is faster and clearer.",
    "pandas": "Real-world data is messy. Pandas is the industry-standard tool for cleaning, reshaping, and analyzing tabular data.",
    "machine-learning": "Classical ML covers the core mental models: features, models, loss, overfitting, evaluation. You need this before deep learning.",
    "deep-learning": "Deep learning powers modern AI: computer vision, NLP, LLMs. You need to understand how these models actually train and fail.",
    "llms": "Large Language Models are the biggest shift in AI today. You need to understand how they work beyond just calling an API.",
    "sql-databases": "Most production data lives in relational databases. SQL is the single most persistent skill across data roles.",
    "mlops": "A model that never deploys does not help anyone. MLOps is how trained models become useful systems.",
    "data-warehousing-etl": "ETL is how data moves from source systems to where analysts and models can use it.",
    "web-scraping": "When data isn't available via APIs, scraping is how you build your own datasets — ethically and carefully.",
    "visualization": "If you can't communicate the results of analysis, they may as well not exist.",
    "eda-capstone": "EDA is the first thing you do with any new dataset, and it shapes everything downstream.",
    "excel-powerbi": "Business stakeholders live in Excel and Power BI. An AI engineer who can speak both tools and ML is far more effective.",
    "c-programming": "C teaches you how memory, pointers, and compilation actually work. This removes magic from the rest of the stack.",
    "systems-programming": "Understanding processes, threads, memory hierarchy, and syscalls makes you a better engineer even when writing Python.",
    "data-structures-algorithms": "Algorithmic thinking is the foundation of technical interviews and efficient code.",
    "theory-computation": "Understanding what computers cannot do prevents wasted effort and gives you intellectual depth.",
    "discrete-math": "Logic, proof, sets, and combinatorics are the mathematical foundation of computer science.",
    "databases-systems": "Harvard's databases course adds depth: storage engines, transactions, distributed data — way beyond SELECT statements.",
    "optimization": "Every neural network trains via optimization. Going beyond 'gradient descent is magic' to understanding convexity, constraints, and convergence makes you a stronger DL practitioner.",
    "data-engineering-big-data": "At scale, data engineering dominates AI work. You need Spark, Airflow, and data modeling skills.",
    "computer-vision": "Advanced vision systems power detection, segmentation, generative images, and multimodal AI.",
    "nlp": "NLP bridges classical linguistics, statistical models, and modern deep learning.",
    "rag": "Retrieval-Augmented Generation is the current standard architecture for grounding LLMs in proprietary or current data.",
    "agents": "Agent systems can automate complex multi-step workflows — but require careful engineering around safety, cost, and control flow.",
    "software-engineering": "Most AI engineers spend more time on Git, tests, code review, and API design than they do on model training.",
    "cloud": "Real systems run in the cloud. AWS is the current dominant provider; Azure familiarity increases your career surface area.",
    "ai-security-ethics": "AI systems affect real people. Ethics, bias, privacy, and security are not optional add-ons — they are engineering requirements.",
    "technical-english": "Global AI work happens in English. Technical English is a career multiplier, not a side subject.",
    "career": "Translating skills into a job requires deliberate engineering of your resume, portfolio, and interview performance.",
    "freelancing": "Freelancing is a viable path for AI engineers and gives you maximum leverage and autonomy — but requires business skills.",
    "research": "Understanding research lets you read, evaluate, and eventually contribute to new AI developments rather than only consuming tutorials.",
  };

  const why = whyMap[courseSlug] || `This module covers ${title}, which is essential for AI engineers.`;

  const topicLines = topics.map((t, i) => `### ${i + 1}. ${t}\n- Core idea: [to be filled in during study]\n- Why it matters: [in your own words]\n- Key concepts: [to add]\n- Common mistakes: [to add]\n`).join("\n");

  return `# ${title}\n\n## Why this matters\n\n${why}\n\n## Learning objectives\n\nBy the end of this module you should be able to:\n${topics.slice(0, 5).map((t) => `- Explain and apply: ${t}`).join("\n")}\n\n## Topics\n\n${topicLines}\n\n## How to study this under IHLS\n\n1. **Orientation (2–5 min):** Read the "Why this matters" section above. Look at the prerequisites. If any are weak, note them for review later.\n2. **Lecture / Reading (10–30 min):** Work through each topic. Stop after each sub-topic and ask yourself: "Can I explain this without looking?"\n3. **Attempt:** Before looking at the worked solution for any example, attempt it yourself first — even for 2 minutes.\n4. **Retrieval:** After reading, close the material and write a 2–3 sentence explanation of each core concept from memory.\n5. **Practice:** Work through problems and coding exercises. Mix problem types (interleaving) once you have basics.\n6. **Transfer:** Find one new problem or dataset where this concept applies in a different form.\n7. **Notebook (MUST WRITE):**\n   - Core idea in your own words\n   - One formula / rule / code signature if essential\n   - One worked example or structure\n   - One common mistake\n   - One "when to use this" sentence\n8. **Connect to project:** Note which of the ${21} original projects (or your own capstone) uses this concept.\n\n## Source category\n\nSee the course page for the official source category (Original Curriculum, Harvard College, Harvard Extension, Industry Extension, or Research Extension).\n\n## Mastery checkpoint\n\nYou are ready to move on when you can:\n- Explain the key concepts from memory (closed notes)\n- Solve a direct-application problem\n- Choose the right tool for a small novel scenario\n- Identify at least one common failure mode\n\nIf you cannot, that is information — revisit the weak sub-topic, do not start over from scratch.\n`;
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
