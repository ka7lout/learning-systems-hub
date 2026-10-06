import { db } from "@/db";
import {
  careerRoles,
  curriculumNodes,
  englishTerms,
  learners,
  masteryRecords,
  projects,
  reviewItems,
  skills,
  sources,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEMO_LEARNER_ID = "learner-ismaili";

const originalModules = [
  {
    id: "foundations-python",
    title: "Python Programming",
    description: "Build programming fluency through tracing, debugging, data structures, algorithms, and object-oriented design.",
    topics: [
      "Intro to Python", "Variables & Data Types", "Type Casting", "Operators", "Conditional Statements", "for/while Loops", "break/continue/pass",
      "Lists", "Tuples", "Dictionaries", "Sets", "Functions", "Parameters", "Return Values", "Lambda", "Scope",
      "Error Handling", "try/except/finally", "Custom Exceptions", "File Handling", "Reading/Writing", "CSV files", "JSON files",
      "Searching Algorithms", "Linear Search", "Binary Search", "Sorting Algorithms", "Bubble Sort", "Recursion", "OOP", "Classes & Objects", "Inheritance", "Polymorphism",
      "Encapsulation", "Abstraction", "Magic Methods", "Python Standard Libraries", "Modules & Packages", "Virtual Environments", "Mini-Project",
    ],
    objectives: ["Read and write maintainable Python", "Trace and debug unfamiliar code", "Build a small tested application"],
    prerequisites: ["math-refresh"],
    masteryCriteria: ["Explain control flow from memory", "Implement and test a data-structure solution", "Debug a broken module without answer-first AI"],
    estimatedHours: 80,
    level: "foundation",
    sourceCategory: "Original Curriculum",
  },
  {
    id: "foundations-math-statistics",
    title: "Math & Statistics",
    description: "Develop the quantitative language for models: vectors, matrices, derivatives, uncertainty, and statistical reasoning.",
    topics: [
      "Scalars", "Vectors", "Matrices", "Tensors", "Matrix Operations & Multiplication", "Determinants", "Eigenvalues", "Eigenvectors", "Matrix Inverse", "Vector Operations", "Dot Product", "Cross Product", "Norms",
      "Differentiation", "Partial Derivatives", "Chain Rule", "Gradient Descent", "Optimization Concepts",
      "Population vs Sample", "Mean", "Median", "Mode", "Variance", "Standard Deviation", "IQR", "Distributions", "Skewness", "Kurtosis",
      "Probability Basics", "Conditional Probability", "Joint Probability", "Bayes", "Likelihood", "Correlation", "Covariance",
    ],
    objectives: ["Translate between mathematical, visual, and code representations", "Interpret uncertainty rather than only calculate it", "Use gradients and probability in model reasoning"],
    prerequisites: ["math-refresh"],
    masteryCriteria: ["Derive a simple gradient update", "Interpret a confidence interval in context", "Choose a relevant statistical quantity for a decision"],
    estimatedHours: 72,
    level: "foundation",
    sourceCategory: "Original Curriculum",
  },
  {
    id: "data-analysis-python",
    title: "Data Analysis with Python",
    description: "Move from raw files to defensible analysis using numerical arrays, inferential statistics, wrangling, visualization, and an EDA capstone.",
    topics: [
      "Arrays", "N-D Arrays", "Indexing & Slicing", "Reshaping", "Broadcasting", "Strides", "Vectorized Operations", "Math Operations", "Random Module", "Performance Optimization",
      "Hypothesis Testing", "A/B Testing", "Z-Score", "T-Test", "P-Value", "Confidence Intervals", "ANOVA", "Pandas DataFrames", "Pandas Series",
      "Reading CSV", "Reading Excel", "Reading JSON", "Reading SQL", "Filtering", "Sorting", "GroupBy", "Aggregation", "Joins", "Merge", "Missing Values", "Outliers", "Feature Engineering", "EDA Workflow",
      "Matplotlib", "Line", "Bar", "Histogram", "Scatter", "Seaborn", "Heatmaps", "Pairplots", "Distribution Plots", "Plotly", "Interactive Dashboards", "Interactive Charts", "Choosing the Right Chart", "Data Storytelling",
      "Real-world dataset", "Full analysis pipeline", "Load", "Clean", "Analyze", "Visualization & insights presentation", "Best Practices", "Code Review",
    ],
    objectives: ["Audit a messy dataset", "Select visualizations that support a claim", "Present an analysis with limitations and provenance"],
    prerequisites: ["foundations-python", "foundations-math-statistics"],
    masteryCriteria: ["Reproduce a clean EDA workflow", "Find leakage, missingness, and outliers", "Defend one insight with evidence"],
    estimatedHours: 84,
    level: "foundation",
    sourceCategory: "Original Curriculum",
  },
  {
    id: "excel-power-bi",
    title: "Excel & Power BI",
    description: "A practical business analytics extension for communicating decisions through spreadsheets, models, dashboards, and reports.",
    topics: ["Functions & Formulas", "VLOOKUP", "XLOOKUP", "Pivot Tables", "Power Query", "Charts", "Building Dashboards", "Introduction", "Power Pivot", "Data Modeling", "Relationships", "DAX Formulas", "Dashboards & Reports", "Publishing & Sharing"],
    objectives: ["Transform business data", "Model relationships and measures", "Communicate a decision with an auditable dashboard"],
    prerequisites: ["data-analysis-python"],
    masteryCriteria: ["Build one dashboard from messy data", "Explain a DAX measure and its assumptions", "State when BI is more suitable than a notebook"],
    estimatedHours: 32,
    level: "industry",
    sourceCategory: "Industry Extension",
  },
  {
    id: "databases-data-engineering",
    title: "Databases & Data Engineering",
    description: "Design reliable data systems: relational modeling, advanced SQL, lawful collection, and end-to-end ETL/ELT pipelines.",
    topics: ["ERD", "Database Design", "Normalization", "SQL Basics", "DDL", "DML", "DQL", "JOINs", "Subqueries", "Views", "CTEs", "Window Functions", "Stored Procedures", "Query Optimization", "Advanced SQL Querying Practice", "BeautifulSoup", "Regular Expressions", "Selenium", "Dynamic Websites", "APIs for Data Collection", "Intro to Data Engineering", "Data Warehousing concepts", "ETL / ELT Pipelines", "Design", "Tools", "Implementation", "End-to-end pipeline", "Scrape → clean → store → query"],
    objectives: ["Turn requirements into a normalized schema", "Write and tune analytical queries", "Build a reproducible, provenance-aware pipeline"],
    prerequisites: ["foundations-python", "data-analysis-python"],
    masteryCriteria: ["Explain query plans and indexing trade-offs", "Ship an end-to-end pipeline with validation", "Document data terms, limits, and lawful acquisition"],
    estimatedHours: 76,
    level: "intermediate",
    sourceCategory: "Original Curriculum",
  },
  {
    id: "classical-machine-learning",
    title: "Machine Learning",
    description: "Learn statistical learning by comparing baselines, models, metrics, and failures on real data.",
    topics: ["Types of ML", "Supervised vs Unsupervised", "Scikit-Learn intro", "Scaling", "Encoding", "Feature Selection", "Imbalanced Data", "Linear Regression", "Simple Regression", "Multiple Regression", "Evaluation Metrics", "MSE", "R²", "Logistic Regression", "Precision", "Recall", "F1", "ROC-AUC", "Decision Trees", "SVM", "KNN", "Naive Bayes", "Cross-Validation", "Grid Search", "Random Search", "Random Forest", "Bagging", "Boosting", "XGBoost", "CatBoost", "Stacking", "Model Comparison & Selection", "K-Means", "DBSCAN", "Hierarchical Clustering", "PCA", "Recommendation Systems", "Apriori Algorithm", "Problem selection", "Data preparation", "Baseline models", "Tuning", "Evaluation", "Model card", "Presentation"],
    objectives: ["Build defensible baselines", "Choose metrics from the decision context", "Analyze failures and generalization"],
    prerequisites: ["foundations-math-statistics", "data-analysis-python", "databases-data-engineering"],
    masteryCriteria: ["Compare at least two models with valid splits", "Explain a failure subgroup", "Write a model card with limitations"],
    estimatedHours: 120,
    level: "intermediate",
    sourceCategory: "Original Curriculum",
  },
  {
    id: "deep-learning",
    title: "Deep Learning",
    description: "Progress from neural-network foundations through vision, sequence models, NLP, transformers, LLMs, RAG, and agents.",
    topics: [
      "ANN Architecture", "Backpropagation", "Activation Functions", "Loss Functions", "Optimizers", "SGD", "Adam", "Overfitting", "Dropout", "Early Stopping", "Batch Normalization", "Learning Rate Scheduling", "TensorFlow/Keras intro", "Build and train a full ANN on tabular data", "Hands-on lab",
      "CNN Architecture", "Filters", "Pooling", "Transfer Learning", "VGG", "ResNet", "EfficientNet", "Fine-tuning practice", "Object Detection", "YOLO architecture", "YOLO inference", "OpenCV", "Image Processing", "Segmentation", "Pose Estimation",
      "RNN", "LSTM", "GRU", "Theory", "Implementation", "Time Series Forecasting with LSTM", "Real-world dataset lab",
      "Text Preprocessing", "Tokenization", "Stop Words", "Stemming", "Lemmatization", "TF-IDF", "N-Grams", "Word2Vec", "Word Embeddings", "Seq2Seq Models", "Summarization", "Translation", "Text Generation",
      "Attention Mechanism", "Architecture", "Embeddings", "Tokenizers", "Context Window", "Fine-tuning Types", "LoRA", "QLoRA", "Hugging Face", "Encoder models", "Decoder models", "Encoder-Decoder models", "Prompt Engineering", "RAG", "Vector Databases", "AI Agents", "DL Capstone kickoff",
    ],
    objectives: ["Explain optimization and representation learning", "Run controlled experiments and ablations", "Engineer a grounded LLM workflow instead of a prompt-only demo"],
    prerequisites: ["classical-machine-learning", "foundations-math-statistics", "databases-data-engineering"],
    masteryCriteria: ["Diagnose a training failure", "Compare an architecture change with evidence", "Evaluate retrieval and generation separately"],
    estimatedHours: 180,
    level: "advanced",
    sourceCategory: "Original Curriculum",
  },
  {
    id: "development-mlops",
    title: "Development & MLOps",
    description: "Connect model work to software engineering, APIs, containers, reproducibility, deployment, and a defended final capstone.",
    topics: ["APIs Fundamentals", "FastAPI", "Building and documenting a model API", "Streamlit for ML apps", "Docker Basics", "Containerizing a model", "CI/CD overview", "Final Capstone presentations", "Git", "GitHub", "Testing", "Logging", "Monitoring", "Rollback"],
    objectives: ["Package a model behind a documented interface", "Create tests and operational evidence", "Explain deployment, monitoring, and rollback trade-offs"],
    prerequisites: ["classical-machine-learning", "deep-learning", "databases-data-engineering"],
    masteryCriteria: ["Deploy a small service safely", "Demonstrate a failure and recovery path", "Present a reproducible capstone"],
    estimatedHours: 68,
    level: "advanced",
    sourceCategory: "Original Curriculum",
  },
];

const additions = [
  { id: "math-refresh", title: "Mathematical Foundations", description: "Calculus, linear algebra, probability, inference, optimization, and proof-oriented reasoning needed for AI engineering.", topics: ["Single-variable calculus", "Multivariable calculus", "Vector spaces", "Matrix calculus", "Random variables", "Expectation", "Maximum likelihood", "MAP", "Convexity", "Numerical methods"], objectives: ["Use mathematical notation without losing intuition", "Connect derivation to implementation"], prerequisites: [], masteryCriteria: ["Solve and interpret a multistep quantitative problem", "Explain assumptions and limits"], estimatedHours: 112, level: "foundation", sourceCategory: "Harvard College" },
  { id: "cs-foundations", title: "Computer Science Foundations", description: "A Harvard-informed CS layer spanning C, memory, data structures, formal reasoning, systems, networking, and software design.", topics: ["C programming", "Pointers", "Stack/heap", "Compilation/linking", "Linux/CLI", "Linked lists", "Stacks/queues", "Trees", "Hash tables", "Tries", "Graphs", "Asymptotic complexity", "Greedy algorithms", "Divide and conquer", "Dynamic programming", "Formal logic", "Proof techniques", "Computational limitations", "Computer organization", "Processes/threads", "Networking fundamentals", "HTTP/TCP/IP/DNS", "Transactions", "Distributed systems", "Software abstraction and design"], objectives: ["Reason about programs below the framework level", "Choose data structures and algorithms with evidence", "Explain system boundaries and failure modes"], prerequisites: ["foundations-python"], masteryCriteria: ["Trace memory and complexity", "Defend a data structure choice", "Diagnose a systems failure"], estimatedHours: 144, level: "intermediate", sourceCategory: "Harvard College" },
  { id: "ai-systems-production", title: "AI Systems & Production", description: "Production patterns for cloud, data platforms, model lifecycle, security, observability, and reliable AI products.", topics: ["AWS IAM", "S3", "Lambda", "API Gateway", "ECR/ECS", "CloudWatch", "Azure Entra ID", "Terraform/OpenTofu", "Airflow", "dbt", "Spark", "MLflow", "Experiment tracking", "Model registry", "CI/CD", "Drift", "RAG evaluation", "GraphRAG", "Vector search", "Agent orchestration", "Permissions", "Cost and latency", "ISO/IEC 42001 concepts"], objectives: ["Design an observable and secure AI service", "Select deterministic workflows versus agents", "Operate a model through failure and rollback"], prerequisites: ["development-mlops", "cs-foundations", "databases-data-engineering"], masteryCriteria: ["Produce an architecture decision record", "Run an incident simulation", "Show deployment and monitoring evidence"], estimatedHours: 120, level: "advanced", sourceCategory: "Industry Extension" },
  { id: "responsible-ai-security", title: "Security, Responsible AI & Governance", description: "Integrate privacy, safety, fairness, access control, provenance, evaluation, and secure AI behavior throughout the pathway.", topics: ["Data privacy", "Bias and fairness", "Model cards", "System cards", "Prompt injection", "Broken object authorization", "SSRF", "Unsafe uploads", "Human oversight", "Misuse", "Governance", "AI regulation"], objectives: ["Identify risks before deployment", "Choose mitigations and document residual risk"], prerequisites: ["cs-foundations", "classical-machine-learning"], masteryCriteria: ["Write a threat model", "Explain a fairness or privacy trade-off", "Review an AI workflow for unsafe assumptions"], estimatedHours: 44, level: "advanced", sourceCategory: "Research Extension" },
  { id: "technical-english-career", title: "Technical English & Career Engineering", description: "Use technical learning as the language classroom: reading, PRs, oral defense, interviews, proposals, and evidence-based CV artifacts.", topics: ["Technical reading", "PR descriptions", "Architecture explanations", "Interview answers", "Client discovery", "Technical writing", "Portfolio case studies", "Role gap analysis", "Freelance scoping"], objectives: ["Communicate technical decisions clearly", "Translate real evidence into professional artifacts"], prerequisites: ["foundations-python"], masteryCriteria: ["Defend a project in English", "Write a traceable CV bullet", "Run a client discovery simulation"], estimatedHours: 48, level: "professional", sourceCategory: "Industry Extension" },
  { id: "research-engineering", title: "Research Engineering", description: "Move from reading to reproduction, ablation, extension, critique, and reproducible scientific communication.", topics: ["Paper reading", "Claim identification", "Baselines", "Ablation", "Reproduction", "Experimental design", "Statistical reasoning", "Reproducibility", "Scientific writing", "Replication"], objectives: ["Separate a claim from evidence", "Design an experiment another person can reproduce"], prerequisites: ["deep-learning", "ai-systems-production", "responsible-ai-security"], masteryCriteria: ["Reproduce a baseline", "Run a controlled ablation", "Write a limitations-aware report"], estimatedHours: 96, level: "research", sourceCategory: "Research Extension" },
];

const projectCatalog: Array<[string, string, number, string]> = [
  ["skin-disease-prediction", "Skin Disease Prediction", 5, "Computer Vision"], ["face-recognition", "Face Recognition / Detection / Verification", 6, "Computer Vision"], ["text-classification", "Text Classification", 6, "NLP"], ["stock-market-prediction", "Stock Market Prediction", 4, "Time Series"], ["sign-language-classifier", "Sign Language Classifier", 6, "Computer Vision"], ["real-time-object-detection", "Real-time Object Detection", 6, "Computer Vision"], ["breast-cancer-detection", "Breast Cancer Detection", 4, "Classical ML"], ["brain-tumor-detection", "Brain Tumor Detection", 6, "Computer Vision"], ["gan-image-generation", "Image Generation using GANs", 7, "Deep Learning"], ["library-management", "Library Management System", 1, "Software Engineering"], ["uber-data-analysis", "Uber Data Analysis", 2, "Data Analysis"], ["superstore-dashboard", "Superstore Data Analysis Dashboard", 2, "Business Analytics"], ["hr-dashboard", "HR Dashboard", 2, "Business Analytics"], ["bank-loan-analysis", "Bank Loan Data Analysis", 2, "Data Analysis"], ["sales-database", "Sales Database", 3, "Data Engineering"], ["credit-card-fraud", "Credit Card Fraud Detection", 4, "Classical ML"], ["titanic-prediction", "Titanic Prediction", 4, "Classical ML"], ["house-pricing", "House Pricing Prediction", 4, "Classical ML"], ["chatbot", "Chatbot", 7, "NLP"], ["document-summarization", "Document Summarization", 7, "LLM"], ["rag-system", "RAG System", 8, "LLM Systems"],
];

const skillCatalog = [
  ["python-engineering", "Python engineering", "Engineering", "Reading, writing, testing, and debugging maintainable Python."],
  ["quantitative-reasoning", "Quantitative reasoning", "Mathematics", "Linear algebra, calculus, probability, and statistical interpretation."],
  ["data-analysis", "Data analysis", "Data", "Messy-data inspection, visualization, inference, and communication."],
  ["sql-data-systems", "SQL & data systems", "Data", "Schema design, query reasoning, and pipeline reliability."],
  ["classical-ml", "Classical machine learning", "AI/ML", "Model selection, evaluation, generalization, and failure analysis."],
  ["deep-learning", "Deep learning", "AI/ML", "Optimization, architectures, experiments, and debugging."],
  ["llm-systems", "LLM systems", "AI/ML", "Transformers, retrieval, evaluation, tool use, cost, and safety."],
  ["production-ai", "Production AI", "Production", "APIs, containers, deployment, monitoring, and rollback."],
  ["security-governance", "AI security & governance", "Security", "Threat modeling, authorization, privacy, and responsible deployment."],
  ["technical-communication", "Technical communication", "English", "Clear written, spoken, and client-facing technical communication."],
];

const englishCatalog = [
  ["observability", "observability", "The ability to understand a system’s internal state from its outputs, logs, and signals.", "قابلية المراقبة", "We added observability before the first production rollout.", "Production"],
  ["idempotency", "idempotency", "A property where repeating the same operation has the same effect as doing it once.", "قابلية التكرار الآمن", "The retry is safe because the endpoint is idempotent.", "Engineering"],
  ["generalization", "generalization", "A model’s ability to perform well on new data beyond its training examples.", "التعميم", "The holdout set gives us evidence about generalization.", "AI/ML"],
  ["orchestration", "orchestration", "Coordinating multiple services, tools, or steps into a reliable workflow.", "تنسيق المكونات", "The workflow uses orchestration, not an autonomous agent by default.", "AI Systems"],
  ["calibration", "calibration", "How closely a system’s confidence matches the actual frequency of outcomes.", "معايرة الثقة", "We checked calibration before presenting probabilities to users.", "Statistics"],
  ["reproducibility", "reproducibility", "The ability for another person to obtain consistent results using documented inputs and steps.", "قابلية إعادة الإنتاج", "The experiment is not reproducible without the data version.", "Research"],
];

const sourceCatalog = [
  ["harvard-cs-requirements", "CS Concentration Requirements", "Harvard Computer Science Advising", "https://csadvising.seas.harvard.edu/concentration/requirements/", "official_catalog", "confirmed_current", "Current page describes nine basic CS courses plus mathematics, programming, formal reasoning, systems, computation and the world, and advanced CS."],
  ["harvard-cs50-syllabus", "CS50 College Fall 2026 Syllabus", "Harvard University", "https://cs50.harvard.edu/college/2026/fall/syllabus/", "official_syllabus", "confirmed_current", "The page explicitly lists lectures, sections, ten problem sets, quizzes, a final project, and an AI policy. Term-specific details must not be generalized to all Harvard courses."],
  ["harvard-ai-certificate", "Artificial Intelligence Graduate Certificate", "Harvard Extension School", "https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/", "official_program", "confirmed_current", "Extension offering, separate from Harvard College; four online graduate courses across foundations, NLP/ML, deep learning/vision, and ethics/governance/law."],
  ["harvard-ds-certificate", "Data Science Graduate Certificate", "Harvard Extension School", "https://extension.harvard.edu/academics/programs/data-science-graduate-certificate/", "official_program", "confirmed_current", "Extension offering with statistics, electives, and a data science course; term offerings vary."],
  ["harvard-ds-ai-degree", "Data Science and Artificial Intelligence Master’s Degree Requirements", "Harvard Extension School", "https://extension.harvard.edu/academics/programs/data-science-graduate-program/data-science-degree-requirements/", "official_program", "confirmed_current", "Extension master’s structure includes foundations, statistical modeling, core/electives, precapstone, and capstone. Not a Harvard College undergraduate program."],
  ["nature-spacing-retrieval", "The science of effective learning with spacing and retrieval practice", "Nature Reviews Psychology", "https://doi.org/10.1038/s44159-022-00089-1", "peer_reviewed_review", "confirmed_current", "Supports retrieval and spacing as useful learning strategies, with limitations and context dependence."],
  ["owasp-api-top10", "OWASP API Security Top 10 2023", "OWASP", "https://owasp.org/API-Security/editions/2023/en/0x11-t10/", "security_guidance", "confirmed_current", "Relevant risks include broken object authorization, broken authentication, unrestricted resource consumption, SSRF, and unsafe API consumption."],
  ["wcag-22", "Web Content Accessibility Guidelines 2.2", "W3C", "https://www.w3.org/TR/WCAG22/", "standard", "confirmed_current", "Accessibility baseline for semantic, keyboard, contrast, motion, and labeling decisions."],
];

function nodeValues(node: (typeof originalModules)[number] | (typeof additions)[number], sequence: number) {
  return { ...node, kind: "module", sequence, status: "published" as const, createdAt: new Date(), updatedAt: new Date() };
}

export async function ensureSeeded() {
  const existing = await db.select({ id: learners.id }).from(learners).where(eq(learners.id, DEMO_LEARNER_ID)).limit(1);
  if (existing.length > 0) return;

  await db.insert(learners).values({ id: DEMO_LEARNER_ID, name: "Ismaili", email: "learner@ihls.local", targetRole: "Production AI Engineer", preferredLanguage: "en", learningState: "deep" });
  await db.insert(curriculumNodes).values([...originalModules, ...additions].map((node, index) => nodeValues(node, index + 1)));
  await db.insert(skills).values(skillCatalog.map(([id, name, domain, description]) => ({ id, name, domain, description, status: id === "python-engineering" ? "competent" : "developing", evidenceCount: id === "python-engineering" ? 2 : 0 })));
  await db.insert(projects).values(projectCatalog.map(([id, title, level, category], index) => ({ id, title, level, category, description: `A level ${level} build that requires a real problem statement, provenance, tests, failure analysis, and an honest portfolio record.`, evidenceType: level >= 8 ? "Professional Evidence" : level >= 5 ? "Technical Artifact" : "Skill Evidence", status: index === 10 ? "active" : "not_started", sourcePolicy: "Use a lawful public dataset or API. Record license, acquisition date, version, schema, limitations, bias risks, and leakage risks." })));
  await db.insert(sources).values(sourceCatalog.map(([id, title, publisher, url, sourceType, verificationStatus, notes]) => ({ id, title, publisher, url, sourceType, verificationStatus, accessedAt: new Date("2026-04-01T00:00:00Z"), notes })));
  await db.insert(careerRoles).values([
    { id: "role-production-ai-engineer", title: "Production AI Engineer", track: "Nuwave-style reference role", description: "A dated reference blueprint for building secure, observable AI systems; not an employment guarantee.", requirements: ["Python", "TypeScript", "AWS", "Azure", "RAG", "GraphRAG", "vector search", "agent workflows", "Git", "testing", "deployment", "rollback", "identity", "security", "incident response"], sourceStatus: "likely_not_verified", sourceUrl: "https://jobs.nuwave.com/apply/JshTpQ8tb8/AI-Engineer", snapshotDate: new Date("2026-04-01T00:00:00Z") },
    { id: "role-ai-engineer-data", title: "AI Engineer / Data & ML", track: "Navisoft-style reference role", description: "A dated reference blueprint emphasizing ML, data platforms, cloud, and multiple language/tool ecosystems.", requirements: ["Python", "SQL", "TensorFlow", "PyTorch", "NLP", "statistical modeling", "R", "SAS", "Hadoop", "Spark", "ETL", "AWS", "model evaluation"], sourceStatus: "likely_not_verified", sourceUrl: "https://app.devfound.ai/jobs/ai-engineers-navisoft/140943", snapshotDate: new Date("2026-04-01T00:00:00Z") },
  ]);
  await db.insert(englishTerms).values(englishCatalog.map(([id, term, definition, arabicMeaning, example, domain]) => ({ id, term, definition, arabicMeaning, example, domain })));
  await db.insert(masteryRecords).values([
    { id: "mastery-python", learnerId: DEMO_LEARNER_ID, nodeId: "foundations-python", completion: 36, recall: 62, transfer: 48, implementation: 58, delayedRetention: 0, evidenceLevel: "skill_developing" },
    { id: "mastery-data", learnerId: DEMO_LEARNER_ID, nodeId: "data-analysis-python", completion: 18, recall: 0, transfer: 0, implementation: 0, delayedRetention: 0, evidenceLevel: "starting" },
  ]);
  await db.insert(reviewItems).values([
    { id: "review-python-control-flow", learnerId: DEMO_LEARNER_ID, nodeId: "foundations-python", prompt: "Predict the output of a loop that uses continue and break, then explain why.", taskType: "predict_output", dueAt: new Date("2026-04-01T00:00:00Z"), priority: "high", status: "due" },
    { id: "review-data-shapes", learnerId: DEMO_LEARNER_ID, nodeId: "data-analysis-python", prompt: "Explain how reshaping changes an array without changing its values.", taskType: "explain_own_words", dueAt: new Date("2026-04-04T00:00:00Z"), priority: "normal", status: "scheduled" },
  ]);
}
