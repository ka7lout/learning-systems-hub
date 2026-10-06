import { RETRIEVED } from "./spine";

export type CourseSeed = {
  id: string;
  stageId: string;
  position: number;
  title: string;
  sourceCategory:
    | "Original Curriculum"
    | "Harvard College"
    | "Harvard Extension"
    | "Industry Extension"
    | "Research Extension";
  level: "Introductory" | "Intermediate" | "Advanced" | "Graduate-equivalent";
  priority: "CORE" | "SUPPORT" | "ADVANCED" | "SPECIALIZATION" | "INDUSTRY" | "RESEARCH";
  why: string;
  summary: string;
  estimatedHours: number;
  prerequisites: string[];
  topics: string[];
  objectives: string[];
  masteryCriteria: string[];
  skills: string[];
  harvardMapping: { candidate: string; institution: string; verification: string; adds: string; note?: string }[];
  sourceRefs: string[];
  lastVerified: string;
};

const V = RETRIEVED;

/** Candidate Harvard course identifiers are stored as unverified mappings on purpose. */
const candidate = (
  candidateName: string,
  institution: string,
  adds: string,
  verification = "likely_not_verified",
  note = "Course identifier taken from the build specification; not individually re-verified against the live catalog in this build.",
) => ({ candidate: candidateName, institution, verification, adds, note });

export const courseSeeds: CourseSeed[] = [
  /* ---------------- Programming foundations (Original Module 1) ------------- */
  {
    id: "orig-m1-python",
    stageId: "programming-foundations",
    position: 1,
    title: "Module 1 — Python Programming (Original Curriculum, preserved)",
    sourceCategory: "Original Curriculum",
    level: "Introductory",
    priority: "CORE",
    why:
      "Every later layer — NumPy, pandas, training loops, serving code, agents — is written in Python. Weak Python becomes an invisible tax on every future topic.",
    summary:
      "The original 10-session Python module, preserved topic by topic, taught through tracing, writing, debugging, code reading and a mini-project rather than syntax recitation.",
    estimatedHours: 60,
    prerequisites: [],
    topics: [
      "Intro to Python", "Variables & Data Types", "Type Casting", "Operators", "Conditional Statements",
      "for/while Loops", "break/continue/pass", "Lists", "Tuples", "Dictionaries", "Sets", "Functions",
      "Parameters", "Return Values", "Lambda", "Scope", "Error Handling", "try/except/finally",
      "Custom Exceptions", "File Handling", "Reading/Writing", "CSV files", "JSON files",
      "Searching Algorithms", "Linear Search", "Binary Search", "Sorting Algorithms", "Bubble Sort",
      "Recursion", "OOP", "Classes & Objects", "Inheritance", "Polymorphism", "Encapsulation",
      "Abstraction", "Magic Methods", "Python Standard Libraries", "Modules & Packages",
      "Virtual Environments", "Mini-Project",
    ],
    objectives: [
      "Trace Python execution accurately without running the code",
      "Choose the right built-in data structure for a stated access pattern",
      "Design classes with meaningful encapsulation instead of attribute bags",
      "Handle and raise errors deliberately",
      "Read and debug unfamiliar code",
    ],
    masteryCriteria: [
      "Predicts output of unfamiliar code with ≥80% accuracy",
      "Debugs a broken module without being given the fix",
      "Explains mutability and scope from memory",
      "Ships the mini-project with tests and a README",
    ],
    skills: ["python", "software-engineering", "testing"],
    harvardMapping: [
      candidate("CS 50 (Introduction to Computer Science)", "Harvard College", "Adds C-level memory reasoning and problem-set rigor beneath Python fluency."),
      candidate("CS 32 / CS 51-style abstraction courses", "Harvard College", "Adds abstraction and program-design reasoning beyond procedural Python."),
    ],
    sourceRefs: ["src-harvard-cs-requirements", "src-cs50-syllabus"],
    lastVerified: V,
  },

  /* ---------------- Mathematics (Original Module 2 + depth) ---------------- */
  {
    id: "orig-m2-math-stats",
    stageId: "math-foundations",
    position: 1,
    title: "Module 2 — Math & Statistics (Original Curriculum, preserved)",
    sourceCategory: "Original Curriculum",
    level: "Introductory",
    priority: "CORE",
    why:
      "Linear algebra describes the data and the model; calculus describes how the model learns; probability describes what it does not know. Without these three, ML becomes API memorisation.",
    summary:
      "The original 5-session mathematics and statistics module, preserved item by item, taught with intuition first, then derivation, then interleaved problem sets.",
    estimatedHours: 45,
    prerequisites: [],
    topics: [
      "Scalars", "Vectors", "Matrices", "Tensors", "Matrix Operations & Multiplication", "Determinants",
      "Eigenvalues", "Eigenvectors", "Matrix Inverse", "Vector Operations", "Dot Product", "Cross Product",
      "Norms", "Differentiation", "Partial Derivatives", "Chain Rule", "Gradient Descent",
      "Optimization Concepts", "Population vs Sample", "Mean", "Median", "Mode", "Variance",
      "Standard Deviation", "IQR", "Distributions", "Skewness", "Kurtosis", "Probability Basics",
      "Conditional Probability", "Joint Probability", "Bayes", "Likelihood", "Correlation", "Covariance",
    ],
    objectives: [
      "Interpret matrix multiplication as composition of linear maps",
      "Differentiate composite functions and read gradients as directions",
      "Distinguish population from sample claims",
      "Apply Bayes' rule to a diagnostic problem and explain the base-rate effect",
    ],
    masteryCriteria: [
      "Derives the gradient-descent update from a loss function unaided",
      "Explains eigenvectors geometrically from memory",
      "Correctly selects between correlation and covariance in context",
    ],
    skills: ["linear-algebra", "calculus", "probability", "statistics", "optimization"],
    harvardMapping: [
      candidate("MATH 21a / 21b (multivariable calculus, linear algebra)", "Harvard College", "Adds formal multivariable treatment and proof-aware reasoning."),
      candidate("STAT 110 (Probability)", "Harvard College", "Adds rigorous probability, distributions and expectation machinery.", "likely_not_verified", "The CS concentration requirements comparison page lists a Stat 110 pathway for the probability requirement; the course's current syllabus was not fetched in this build."),
    ],
    sourceRefs: ["src-harvard-cs-requirements-comparison"],
    lastVerified: V,
  },
  {
    id: "harvard-math-depth",
    stageId: "math-foundations",
    position: 2,
    title: "Mathematical Depth Layer for Machine Learning",
    sourceCategory: "Harvard College",
    level: "Intermediate",
    priority: "SUPPORT",
    why:
      "The original module gives working tools. This layer gives the reasoning that lets you read a paper, derive a loss, and understand why an optimiser behaves badly.",
    summary:
      "Additive depth: vector spaces and linear maps, matrix calculus (gradients, Jacobians, Hessians), convexity, maximum likelihood and MAP, estimator properties, and confidence/testing logic.",
    estimatedHours: 50,
    prerequisites: ["orig-m2-math-stats"],
    topics: [
      "Vector spaces and linear transformations", "Rank and nullspace", "Spectral intuition",
      "Matrix calculus", "Jacobians", "Hessians", "Convexity", "Lagrangian intuition",
      "Maximum likelihood estimation", "MAP estimation", "Bias–variance decomposition",
      "Sampling distributions", "Confidence intervals", "Hypothesis testing logic", "Numerical stability",
    ],
    objectives: [
      "Derive the MLE for a simple model and connect it to a loss function",
      "Compute a Jacobian for a small vector-valued function",
      "Explain why convexity matters for optimisation guarantees",
    ],
    masteryCriteria: [
      "Derives cross-entropy from the Bernoulli likelihood",
      "Explains bias–variance with a concrete experiment, not a slogan",
    ],
    skills: ["linear-algebra", "calculus", "probability", "statistics", "optimization"],
    harvardMapping: [
      candidate("APMTH 120 / CS 1280-style optimisation offerings", "Harvard College", "Adds convex optimisation framing used in ML theory."),
    ],
    sourceRefs: ["src-harvard-cs-requirements-comparison"],
    lastVerified: V,
  },

  /* ---------------- CS foundations ---------------- */
  {
    id: "cs-foundations-core",
    stageId: "cs-foundations",
    position: 1,
    title: "Computer Science Foundations: C, Memory, Data Structures, Algorithms",
    sourceCategory: "Harvard College",
    level: "Intermediate",
    priority: "CORE",
    why:
      "An AI engineer debugging a slow data loader, a memory-exhausted training job or a mis-sized batch is doing systems work. Python hides the machine; this layer un-hides it.",
    summary:
      "C and the memory model, pointers, stack vs heap, compilation and linking, Linux/CLI, the core data structures, asymptotic analysis, and the main algorithm design techniques.",
    estimatedHours: 90,
    prerequisites: ["orig-m1-python"],
    topics: [
      "C programming", "Memory model", "Pointers", "Stack and heap", "Compilation and linking", "Debugging",
      "Linux and the CLI", "Arrays and linked lists", "Stacks and queues", "Trees", "Hash tables", "Tries",
      "Graphs", "Recursion", "Asymptotic complexity", "Sorting and searching", "Greedy algorithms",
      "Divide and conquer", "Dynamic programming", "Formal logic", "Proof techniques", "Computational limitations",
    ],
    objectives: [
      "Explain what a pointer is in terms of memory, not metaphor",
      "Select a data structure from access-pattern requirements",
      "Analyse time and space complexity of unfamiliar code",
      "Recognise when a problem has optimal substructure",
    ],
    masteryCriteria: [
      "Implements a hash table and explains collision behaviour",
      "Derives the complexity of a recursive routine",
      "Argues correctness of a greedy choice or shows a counterexample",
    ],
    skills: ["c-lang", "data-structures", "algorithms", "bash"],
    harvardMapping: [
      candidate("CS 50, CS 1200-style algorithms, CS 20-style discrete mathematics", "Harvard College", "Adds proof-based formal reasoning and algorithmic rigor.", "likely_not_verified", "The CS concentration page confirms tagged requirement areas including formal reasoning and algorithms; individual course numbers were not re-verified."),
    ],
    sourceRefs: ["src-harvard-cs-requirements", "src-harvard-cs-requirements-comparison"],
    lastVerified: V,
  },
  {
    id: "cs-systems",
    stageId: "cs-foundations",
    position: 2,
    title: "Systems: Computer Organization, OS Concepts, Concurrency, Networking",
    sourceCategory: "Harvard College",
    level: "Intermediate",
    priority: "SUPPORT",
    why:
      "Model serving, data pipelines and distributed training fail for systems reasons far more often than for mathematical reasons.",
    summary:
      "Computer organization, memory hierarchy, processes and threads, concurrency hazards, scheduling, HTTP/TCP/IP/DNS, database transactions, distributed-systems fundamentals and GPU/accelerator concepts.",
    estimatedHours: 60,
    prerequisites: ["cs-foundations-core"],
    topics: [
      "Computer organization", "CPU and memory hierarchy", "Caching", "Processes", "Threads", "Concurrency",
      "Parallelism", "Scheduling", "Networking fundamentals", "HTTP", "TCP/IP", "DNS",
      "Database transactions", "Distributed systems", "GPU concepts", "AI accelerators",
      "Inference optimization", "Quantization", "Model serving constraints", "Software abstraction and design",
    ],
    objectives: [
      "Explain why a cache miss can dominate runtime",
      "Distinguish concurrency from parallelism with a real example",
      "Trace an HTTP request end to end",
    ],
    masteryCriteria: ["Diagnoses a throughput problem by identifying the actual bottleneck layer"],
    skills: ["os-systems", "networking", "system-design"],
    harvardMapping: [
      candidate("CS 61-style systems programming; ECE computing-hardware courses", "Harvard College / SEAS", "Adds hardware/software interface depth."),
    ],
    sourceRefs: ["src-harvard-cs-requirements"],
    lastVerified: V,
  },

  /* ---------------- Data foundations: Original Module 3 ---------------- */
  {
    id: "orig-m3-data-analysis",
    stageId: "data-analysis",
    position: 1,
    title: "Module 3 — Data Analysis with Python (Original Curriculum, preserved)",
    sourceCategory: "Original Curriculum",
    level: "Intermediate",
    priority: "CORE",
    why:
      "Most real AI work is data work. Before modelling, you must be able to load, clean, interrogate and honestly visualise messy data.",
    summary:
      "The original 10-session data analysis module. NumPy foundations and performance, inferential statistics, pandas wrangling, visualisation, and a full EDA capstone on a real dataset.",
    estimatedHours: 70,
    prerequisites: ["orig-m1-python", "orig-m2-math-stats"],
    topics: [
      "Arrays", "N-D Arrays", "Indexing & Slicing", "Reshaping", "Broadcasting", "Strides",
      "Vectorized Operations", "Math Operations", "Random Module", "Performance Optimization",
      "Hypothesis Testing", "A/B Testing", "Z-Score", "T-Test", "P-Value", "Confidence Intervals", "ANOVA",
      "Pandas DataFrames", "Pandas Series", "Reading CSV", "Reading Excel", "Reading JSON", "Reading SQL",
      "Filtering", "Sorting", "GroupBy", "Aggregation", "Joins", "Merge", "Missing Values", "Outliers",
      "Feature Engineering", "EDA Workflow", "Matplotlib", "Line", "Bar", "Histogram", "Scatter", "Seaborn",
      "Heatmaps", "Pairplots", "Distribution Plots", "Plotly", "Interactive Dashboards", "Interactive Charts",
      "Choosing the Right Chart", "Data Storytelling", "Real-world dataset", "Full analysis pipeline",
      "Load", "Clean", "Analyze", "Visualization & insights presentation", "Best Practices", "Code Review",
    ],
    objectives: [
      "Vectorise a loop and explain the performance difference",
      "Run and correctly interpret a hypothesis test, including what it does not prove",
      "Produce an EDA that changes a decision, not just a notebook of plots",
    ],
    masteryCriteria: [
      "Explains broadcasting rules from memory and predicts a shape error",
      "Delivers an EDA with documented data provenance and limitations",
    ],
    skills: ["numpy", "pandas", "visualization", "statistics"],
    harvardMapping: [
      candidate("CS 109a-style Data Science 1", "Harvard College", "Adds statistical-learning framing and messy real-world data discipline."),
    ],
    sourceRefs: ["src-harvard-cs-requirements"],
    lastVerified: V,
  },
  {
    id: "orig-m4-excel-powerbi",
    stageId: "data-analysis",
    position: 2,
    title: "Module 4 — Excel & Power BI (Original Curriculum, preserved)",
    sourceCategory: "Original Curriculum",
    level: "Introductory",
    priority: "INDUSTRY",
    why:
      "Not a Harvard AI core requirement — and we say so plainly. It is kept because stakeholders live in spreadsheets and BI dashboards, and an AI engineer who can meet them there gets better requirements.",
    summary:
      "The original 4-session business analytics extension: Excel analysis functions and dashboards, then Power BI modelling, DAX, reports and publishing.",
    estimatedHours: 25,
    prerequisites: ["orig-m3-data-analysis"],
    topics: [
      "Functions & Formulas", "VLOOKUP", "XLOOKUP", "Pivot Tables", "Power Query", "Charts",
      "Building Dashboards", "Power BI Introduction", "Power Pivot", "Data Modeling", "Relationships",
      "DAX Formulas", "Dashboards & Reports", "Publishing & Sharing",
    ],
    objectives: ["Model a star schema in Power BI", "Write DAX measures that survive filter context", "Build a dashboard that answers one business question"],
    masteryCriteria: ["Ships a dashboard whose every visual maps to a stated decision"],
    skills: ["excel-powerbi", "visualization", "communication"],
    harvardMapping: [
      { candidate: "No Harvard core equivalent", institution: "—", verification: "design_decision", adds: "Explicitly classified as Industry/Business Analytics Extension, not Harvard content." },
    ],
    sourceRefs: ["src-design-decision"],
    lastVerified: V,
  },

  /* ---------------- Data engineering: Original Module 5 ---------------- */
  {
    id: "orig-m5-databases",
    stageId: "data-engineering",
    position: 1,
    title: "Module 5 — Databases & Data Engineering (Original Curriculum, preserved)",
    sourceCategory: "Original Curriculum",
    level: "Intermediate",
    priority: "CORE",
    why:
      "Models consume tables. The ability to design a schema, write a correct query and move data reliably separates an AI engineer from a notebook user.",
    summary:
      "The original 8-session module: ERD and normalisation, SQL through window functions and optimisation, scraping and API collection, warehousing concepts and an end-to-end ETL capstone.",
    estimatedHours: 65,
    prerequisites: ["orig-m1-python"],
    topics: [
      "ERD", "Database Design", "Normalization", "SQL Basics", "DDL", "DML", "DQL", "JOINs", "Subqueries",
      "Views", "CTEs", "Window Functions", "Stored Procedures", "Query Optimization",
      "Advanced SQL Querying Practice", "BeautifulSoup", "Regular Expressions", "Selenium",
      "Dynamic Websites", "APIs for Data Collection", "Intro to Data Engineering",
      "Data Warehousing concepts", "ETL / ELT Pipelines", "Design", "Tools", "Implementation",
      "End-to-end pipeline", "Scrape → clean → store → query",
    ],
    objectives: [
      "Normalise a messy spreadsheet into a defensible relational schema",
      "Write window-function queries and explain the execution cost",
      "Collect data lawfully and record provenance",
    ],
    masteryCriteria: ["Builds a pipeline that re-runs idempotently and documents its source terms"],
    skills: ["sql", "scraping", "data-engineering"],
    harvardMapping: [
      candidate("CS 1650-style data systems", "Harvard College", "Adds indexing, concurrency, recovery and distributed data-systems theory."),
    ],
    sourceRefs: ["src-harvard-cs-requirements"],
    lastVerified: V,
  },
  {
    id: "de-big-data",
    stageId: "data-engineering",
    position: 2,
    title: "Big Data and Orchestration: Spark, Airflow, dbt, Lakehouse",
    sourceCategory: "Industry Extension",
    level: "Advanced",
    priority: "INDUSTRY",
    why:
      "Target roles name Spark, Hadoop concepts, Talend and ETL explicitly. This layer makes those names into working competence rather than résumé keywords.",
    summary:
      "Warehouse vs lake vs lakehouse, batch vs streaming, Spark and Spark SQL, partitioning and shuffle costs, Airflow DAGs, dbt models and tests, MapReduce/HDFS concepts, Databricks and Talend awareness.",
    estimatedHours: 45,
    prerequisites: ["orig-m5-databases"],
    topics: [
      "Data modeling", "Warehouse concepts", "Lake and lakehouse", "ETL vs ELT", "Batch vs streaming",
      "Airflow", "dbt", "Spark", "Spark SQL", "Partitioning", "Shuffle", "Performance tuning",
      "Hadoop concepts", "HDFS", "MapReduce", "Databricks awareness", "Talend awareness",
    ],
    objectives: ["Explain why a shuffle is expensive", "Write an idempotent Airflow DAG", "Test a dbt model"],
    masteryCriteria: ["Explains a Spark job's stage boundaries and fixes one skew problem"],
    skills: ["spark", "airflow-dbt", "data-engineering"],
    harvardMapping: [{ candidate: "Industry practice", institution: "—", verification: "design_decision", adds: "Kept as explicit industry extension aligned to target roles." }],
    sourceRefs: ["src-navisoft-role"],
    lastVerified: V,
  },

  /* ---------------- Classical ML: Original Module 6 ---------------- */
  {
    id: "orig-m6-ml",
    stageId: "classical-ml",
    position: 1,
    title: "Module 6 — Machine Learning (Original Curriculum, preserved)",
    sourceCategory: "Original Curriculum",
    level: "Intermediate",
    priority: "CORE",
    why:
      "Most production value still comes from classical ML on tabular data. It is also where evaluation literacy is cheapest to learn and most transferable.",
    summary:
      "The original 12-session ML module: preprocessing, regression, classification, ensembles, unsupervised learning and a capstone with a model card.",
    estimatedHours: 80,
    prerequisites: ["orig-m3-data-analysis", "orig-m2-math-stats"],
    topics: [
      "Types of ML", "Supervised vs Unsupervised", "Scikit-Learn intro", "Scaling", "Encoding",
      "Feature Selection", "Imbalanced Data", "Linear Regression", "Simple Regression",
      "Multiple Regression", "Evaluation Metrics", "MSE", "R²", "Logistic Regression", "Precision",
      "Recall", "F1", "ROC-AUC", "Decision Trees", "SVM", "KNN", "Naive Bayes", "Cross-Validation",
      "Grid Search", "Random Search", "Random Forest", "Bagging", "Boosting", "XGBoost", "CatBoost",
      "Stacking", "Model Comparison & Selection", "K-Means", "DBSCAN", "Hierarchical Clustering", "PCA",
      "Recommendation Systems", "Apriori Algorithm", "Problem selection", "Data preparation",
      "Baseline models", "Tuning", "Evaluation", "Model card", "Presentation",
    ],
    objectives: [
      "Choose a metric from the decision context, not from habit",
      "Build an honest validation design that prevents leakage",
      "Explain why an ensemble helps in terms of bias and variance",
    ],
    masteryCriteria: [
      "Defends a model choice against a stronger baseline",
      "Produces a model card with a real failure analysis",
    ],
    skills: ["classical-ml", "model-evaluation", "pandas"],
    harvardMapping: [
      candidate("CS 1810-style Machine Learning", "Harvard College", "Adds probabilistic framing, derivations and learning-theory reasoning."),
      candidate("Advanced NLP/ML certificate course", "Harvard Extension", "Graduate-level applied ML within the AI graduate certificate.", "confirmed_current", "The AI Graduate Certificate requires one advanced NLP and machine learning course (verified program page)."),
    ],
    sourceRefs: ["src-harvard-extension-ai-certificate"],
    lastVerified: V,
  },

  /* ---------------- Deep learning: Original Module 7 ---------------- */
  {
    id: "orig-m7-deep-learning",
    stageId: "deep-learning",
    position: 1,
    title: "Module 7 — Deep Learning (Original Curriculum, preserved, unified track)",
    sourceCategory: "Original Curriculum",
    level: "Advanced",
    priority: "CORE",
    why:
      "Deep learning is where representation learning replaces manual feature engineering — and where silent training bugs punish anyone who cannot read a loss curve.",
    summary:
      "The original 16-session deep learning programme kept as one coherent track: ANN foundations, TensorFlow/Keras practice, computer vision, sequence models, NLP fundamentals, and transformers/LLMs.",
    estimatedHours: 120,
    prerequisites: ["orig-m6-ml", "harvard-math-depth"],
    topics: [
      "ANN Architecture", "Backpropagation", "Activation Functions", "Loss Functions", "Optimizers", "SGD",
      "Adam", "Overfitting", "Dropout", "Early Stopping", "Batch Normalization", "Learning Rate Scheduling",
      "TensorFlow/Keras intro", "Build and train a full ANN on tabular data", "Hands-on lab",
      "CNN Architecture", "Filters", "Pooling", "Transfer Learning", "VGG", "ResNet", "EfficientNet",
      "Fine-tuning practice", "Object Detection", "YOLO architecture", "YOLO inference", "OpenCV",
      "Image Processing", "Segmentation", "Pose Estimation", "RNN", "LSTM", "GRU", "Theory",
      "Implementation", "Time Series Forecasting with LSTM", "Real-world dataset lab", "Text Preprocessing",
      "Tokenization", "Stop Words", "Stemming", "Lemmatization", "TF-IDF", "N-Grams", "Word2Vec",
      "Word Embeddings", "Seq2Seq Models", "Summarization", "Translation", "Text Generation",
      "Attention Mechanism", "Architecture", "Embeddings", "Tokenizers", "Context Window",
      "Fine-tuning Types", "LoRA", "QLoRA", "Hugging Face", "Encoder models", "Decoder models",
      "Encoder-Decoder models", "Prompt Engineering", "RAG", "Vector Databases", "AI Agents",
      "DL Capstone kickoff",
    ],
    objectives: [
      "Derive a backpropagation step for a two-layer network",
      "Diagnose a training failure from loss curves and gradient statistics",
      "Choose between fine-tuning, feature extraction and prompting with reasons",
    ],
    masteryCriteria: [
      "Explains why Adam differs from SGD in behaviour, not just in formula",
      "Runs an ablation and interprets it honestly",
    ],
    skills: ["deep-learning", "tensorflow", "pytorch", "computer-vision", "nlp", "transformers", "huggingface"],
    harvardMapping: [
      candidate("Deep learning and computer vision certificate course", "Harvard Extension", "Graduate-level DL/CV coursework.", "confirmed_current", "The AI Graduate Certificate includes one deep learning and computer vision course (verified program page)."),
      candidate("CS 109b-style Data Science 2", "Harvard College", "Adds statistical modelling bridge into deep learning."),
    ],
    sourceRefs: ["src-harvard-extension-ai-certificate"],
    lastVerified: V,
  },

  /* ---------------- LLM / RAG / Agents ---------------- */
  {
    id: "llm-engineering",
    stageId: "transformers-llms",
    position: 1,
    title: "LLM Engineering: Beyond Prompting",
    sourceCategory: "Harvard Extension",
    level: "Graduate-equivalent",
    priority: "ADVANCED",
    why:
      "Prompting is the smallest part of LLM work. Context limits, tokenisation, evaluation, cost and hallucination analysis are what break systems in production.",
    summary:
      "Tokenisation and embeddings, attention and transformer internals, pretraining objectives, decoding controls, context management, evaluation design, hallucination analysis, fine-tuning with LoRA/QLoRA and quantisation.",
    estimatedHours: 60,
    prerequisites: ["orig-m7-deep-learning"],
    topics: [
      "Tokenization", "Embeddings", "Attention", "Transformer architecture", "Encoder/decoder variants",
      "Pretraining objectives", "Inference and decoding controls", "Context windows", "Evaluation",
      "Hallucination analysis", "Fine-tuning", "LoRA", "QLoRA", "Quantization", "Hugging Face", "Cost and latency",
    ],
    objectives: ["Explain attention with shapes", "Design an evaluation set that can actually fail", "Decide when fine-tuning beats retrieval"],
    masteryCriteria: ["Builds an eval harness and reports a weakness in their own system"],
    skills: ["transformers", "huggingface", "model-evaluation"],
    harvardMapping: [
      candidate("CSCI E-222-style Foundations of Large Language Models", "Harvard Extension", "Graduate LLM coursework.", "likely_not_verified", "Course identifier from the specification; current title/offering not re-verified."),
    ],
    sourceRefs: ["src-harvard-extension-ai-certificate"],
    lastVerified: V,
  },
  {
    id: "rag-engineering",
    stageId: "rag",
    position: 1,
    title: "Retrieval-Augmented Generation and GraphRAG",
    sourceCategory: "Industry Extension",
    level: "Advanced",
    priority: "CORE",
    why:
      "Named explicitly by the production target role. RAG is where retrieval quality, not model quality, decides whether the system is trustworthy.",
    summary:
      "Chunking strategy, embeddings, vector and hybrid search, metadata filtering, reranking, citation grounding, RAG evaluation, knowledge graphs and GraphRAG traversal.",
    estimatedHours: 45,
    prerequisites: ["llm-engineering", "orig-m5-databases"],
    topics: [
      "Chunking", "Embeddings", "Vector search", "Hybrid search", "Metadata filtering", "Reranking",
      "Citation grounding", "RAG evaluation", "Knowledge graphs", "GraphRAG", "Graph databases",
      "Freshness and re-indexing", "Prompt injection from retrieved content",
    ],
    objectives: ["Diagnose retrieval failure vs generation failure", "Design a grounded-answer contract", "Evaluate retrieval with recall@k and faithfulness checks"],
    masteryCriteria: ["Shows a measured improvement from a retrieval change, not a vibe check"],
    skills: ["rag", "graphrag", "security", "model-evaluation"],
    harvardMapping: [{ candidate: "Applied computation / practical AI systems layer", institution: "Harvard Extension (candidate)", verification: "likely_not_verified", adds: "Applied AI systems framing." }],
    sourceRefs: ["src-nuwave-role"],
    lastVerified: V,
  },
  {
    id: "agent-engineering",
    stageId: "agents",
    position: 1,
    title: "Agent Engineering and the Decision Not to Use an Agent",
    sourceCategory: "Industry Extension",
    level: "Advanced",
    priority: "SPECIALIZATION",
    why:
      "Agents multiply failure modes. The valuable skill is choosing the simplest architecture that satisfies the requirement, then engineering it safely.",
    summary:
      "Tool calling, planning, memory and state, orchestration, multi-agent patterns, permissions and least privilege, evaluation, observability, latency and cost.",
    estimatedHours: 40,
    prerequisites: ["rag-engineering", "software-eng-ai"],
    topics: [
      "Tool calling", "Planning", "Memory and state", "Orchestration", "Multi-agent patterns",
      "Permissions and least privilege", "Failure handling", "Evaluation", "Observability", "Latency", "Cost",
      "Deterministic workflow vs agent decision framework",
    ],
    objectives: ["Justify architecture choice across five options", "Bound an agent loop", "Design tool permissions defensively"],
    masteryCriteria: ["Replaces an agent with a deterministic workflow where that is the better engineering answer"],
    skills: ["agents", "security", "observability", "system-design"],
    harvardMapping: [{ candidate: "Industry practice", institution: "—", verification: "design_decision", adds: "Target-role requirement." }],
    sourceRefs: ["src-nuwave-role"],
    lastVerified: V,
  },

  /* ---------------- SWE / Cloud / MLOps / Security ---------------- */
  {
    id: "software-eng-ai",
    stageId: "software-engineering",
    position: 1,
    title: "Software Engineering for AI Systems",
    sourceCategory: "Industry Extension",
    level: "Intermediate",
    priority: "CORE",
    why:
      "Research code that cannot be reviewed, tested or rolled back is not an engineering deliverable. This is the layer that makes your work employable.",
    summary:
      "Requirements and acceptance criteria, Git workflow and review, typing and linting, testing pyramids, API design, idempotency and retries, async and queues, logging, refactoring and release/rollback.",
    estimatedHours: 55,
    prerequisites: ["orig-m1-python"],
    topics: [
      "Requirements", "Acceptance criteria", "Decomposition", "Issue tracking", "Git", "GitHub", "Branching",
      "Commits", "Pull requests", "Code review", "Semantic versioning", "Dependency management", "Typing",
      "Linting", "Formatting", "Unit tests", "Integration tests", "E2E tests", "Debugging", "Logging",
      "Configuration", "API design", "REST", "Authentication", "Authorization", "Caching", "Retries",
      "Idempotency", "Background jobs", "Queues", "Concurrency and async", "Performance", "Refactoring",
      "Maintainability", "Release engineering", "Rollback",
    ],
    objectives: ["Write acceptance criteria that can fail", "Review a PR for correctness and maintainability", "Design an idempotent endpoint"],
    masteryCriteria: ["Ships a reviewed PR with tests and a rollback note"],
    skills: ["software-engineering", "git", "testing", "api-design", "fastapi"],
    harvardMapping: [{ candidate: "Industry practice + CS abstraction courses", institution: "Mixed", verification: "design_decision", adds: "Professional engineering discipline." }],
    sourceRefs: ["src-nuwave-role"],
    lastVerified: V,
  },
  {
    id: "cloud-engineering",
    stageId: "cloud",
    position: 1,
    title: "Cloud Engineering for AI: AWS depth, Azure familiarity",
    sourceCategory: "Industry Extension",
    level: "Advanced",
    priority: "INDUSTRY",
    why: "Both target roles require cloud deployment. Depth in one cloud plus working familiarity with the other is the efficient allocation.",
    summary:
      "AWS IAM, S3, Lambda, API Gateway, EC2/ECR/ECS fundamentals, CloudWatch, VPC basics and secrets handling; Azure Entra ID, storage, compute, serverless and monitoring; Terraform/OpenTofu for reproducible infrastructure.",
    estimatedHours: 50,
    prerequisites: ["software-eng-ai"],
    topics: [
      "IAM", "S3", "Lambda", "API Gateway", "EC2 fundamentals", "ECR", "ECS fundamentals", "CloudWatch",
      "VPC basics", "Secrets management", "Serverless patterns", "Entra ID", "Azure storage",
      "Azure compute", "Azure serverless", "Azure monitoring", "Terraform / OpenTofu", "Model and API hosting",
    ],
    objectives: ["Write a least-privilege IAM policy", "Deploy a containerised inference API", "Describe cost drivers before deploying"],
    masteryCriteria: ["Deploys a service with monitoring and documents the teardown"],
    skills: ["aws", "azure", "terraform", "docker", "security"],
    harvardMapping: [{ candidate: "Industry practice", institution: "—", verification: "design_decision", adds: "Role-aligned cloud competence." }],
    sourceRefs: ["src-nuwave-role"],
    lastVerified: V,
  },
  {
    id: "orig-m8-mlops",
    stageId: "mlops",
    position: 1,
    title: "Module 8 — Development & MLOps (Original Curriculum, preserved) + Lifecycle Depth",
    sourceCategory: "Original Curriculum",
    level: "Advanced",
    priority: "CORE",
    why:
      "A model that is not deployed, monitored and reversible is a notebook. This module keeps every original tool and adds the lifecycle that production demands.",
    summary:
      "FastAPI model APIs, Streamlit interfaces, Docker containerisation, CI/CD and the final capstone — extended with experiment tracking, model registry concepts, monitoring, drift detection, retraining and rollback.",
    estimatedHours: 55,
    prerequisites: ["orig-m6-ml", "software-eng-ai"],
    topics: [
      "APIs Fundamentals", "FastAPI", "Building and documenting a model API", "Streamlit for ML apps",
      "Docker Basics", "Containerizing a model", "CI/CD overview", "Final Capstone presentations",
      "Data validation", "Experiment tracking", "MLflow", "Model registry concepts", "Packaging",
      "Deployment", "Monitoring", "Drift detection", "Retraining", "Rollback", "Reproducibility",
    ],
    objectives: ["Containerise and document a model API", "Define monitoring signals before deployment", "Write a rollback procedure"],
    masteryCriteria: ["Deploys, monitors and intentionally rolls back one release"],
    skills: ["mlops", "docker", "fastapi", "streamlit", "observability"],
    harvardMapping: [
      candidate("APCOMP 215-style practical AI systems", "Harvard Extension (candidate)", "Adds academic framing for production AI systems.", "likely_not_verified"),
    ],
    sourceRefs: ["src-design-decision"],
    lastVerified: V,
  },
  {
    id: "security-responsible-ai",
    stageId: "security-governance",
    position: 1,
    title: "Security, Responsible AI and Governance",
    sourceCategory: "Harvard Extension",
    level: "Advanced",
    priority: "CORE",
    why:
      "Ethics taught as one lecture is decoration. Here it is integrated: every project carries a data-provenance, privacy, misuse and oversight analysis.",
    summary:
      "OWASP API risks, authorization and least privilege, secrets handling, prompt injection and tool abuse, privacy, bias and fairness analysis, model and system cards, human oversight, and AI management-system concepts (ISO/IEC 42001 family).",
    estimatedHours: 35,
    prerequisites: ["software-eng-ai"],
    topics: [
      "Broken object-level authorization", "Authentication and session integrity", "Excessive data exposure",
      "Resource consumption limits", "Injection", "SSRF", "Unsafe file handling", "Prompt injection",
      "Tool abuse", "Secrets management", "Privacy", "Bias and fairness", "Model cards", "System cards",
      "Data provenance", "Human oversight", "AI governance concepts", "Incident communication",
    ],
    objectives: ["Find a BOLA flaw in a sample API", "Write a model card with real limitations", "Design an instruction hierarchy that resists injected document text"],
    masteryCriteria: ["Produces a security review that identifies a genuine defect and a mitigation"],
    skills: ["security", "responsible-ai", "communication"],
    harvardMapping: [
      candidate("AI ethics, governance and law certificate course", "Harvard Extension", "Graduate-level ethics/governance/law coursework.", "confirmed_current", "The AI Graduate Certificate includes one AI ethics, governance and law course (verified program page)."),
    ],
    sourceRefs: ["src-harvard-extension-ai-certificate", "src-owasp-api"],
    lastVerified: V,
  },

  /* ---------------- English / Career / Freelance / Research ---------------- */
  {
    id: "technical-english",
    stageId: "technical-english",
    position: 1,
    title: "Technical English for AI Engineers",
    sourceCategory: "Industry Extension",
    level: "Intermediate",
    priority: "SUPPORT",
    why:
      "Your technical work is the English classroom: bug reports, PR descriptions, architecture defences, client calls and interview answers are all graded language performances.",
    summary:
      "Seven tracked dimensions — reading, listening, writing, speaking, interaction, technical vocabulary and professional communication — practised on the same artefacts you are already building.",
    estimatedHours: 40,
    prerequisites: [],
    topics: [
      "Technical reading", "Listening to engineering talk", "Writing PR descriptions", "Writing documentation",
      "Speaking: explaining code", "Speaking: defending architecture", "Interaction: standups and reviews",
      "Technical vocabulary and collocations", "Client communication", "Interview answers", "Incident updates",
    ],
    objectives: ["Explain your own architecture aloud for 90 seconds without reading", "Write a PR description a reviewer can act on", "Use 20 target terms correctly in context"],
    masteryCriteria: ["Records evidence in all seven dimensions; no dimension claimed from vocabulary count alone"],
    skills: ["technical-english", "communication"],
    harvardMapping: [{ candidate: "CEFR descriptors", institution: "Council of Europe", verification: "confirmed_current", adds: "Multi-dimensional descriptors instead of a single level claim." }],
    sourceRefs: ["src-cefr"],
    lastVerified: V,
  },
  {
    id: "career-engineering",
    stageId: "career",
    position: 1,
    title: "Career and Interview Engineering",
    sourceCategory: "Industry Extension",
    level: "Intermediate",
    priority: "SUPPORT",
    why:
      "Readiness is a claim that must be backed by evidence. This course teaches you to decompose a real posting into requirements, then map each one to something you actually built.",
    summary:
      "Requirement decomposition, skill taxonomy mapping, evidence classification, CV bullets that trace to artefacts, interview simulation and honest readiness reporting.",
    estimatedHours: 25,
    prerequisites: ["software-eng-ai"],
    topics: [
      "Role requirement decomposition", "Skill taxonomy mapping", "Evidence classification",
      "CV value engine", "Evidence-traceable bullets", "Portfolio case studies", "Technical interviews",
      "System-design interviews", "Behavioural interviews", "Readiness rubrics",
    ],
    objectives: ["Map every hard requirement of a target role to owned or missing evidence", "Write five CV bullets that each cite a real artefact"],
    masteryCriteria: ["Role report shows no unsupported claims"],
    skills: ["communication", "system-design", "technical-english"],
    harvardMapping: [{ candidate: "Target role blueprints", institution: "Industry", verification: "likely_not_verified", adds: "Role-aligned evidence mapping." }],
    sourceRefs: ["src-nuwave-role", "src-navisoft-role"],
    lastVerified: V,
  },
  {
    id: "freelance-engineering",
    stageId: "freelance",
    position: 1,
    title: "Freelancing: Discovery to Delivery",
    sourceCategory: "Industry Extension",
    level: "Intermediate",
    priority: "SUPPORT",
    why:
      "Most freelance failures are scope failures, not technical ones. Discovery and acceptance criteria are engineering skills.",
    summary:
      "Niche and service selection, value proposition, discovery questioning, scope and exclusions, acceptance criteria, estimation, proposals, negotiation, change requests, delivery, maintenance and case studies.",
    estimatedHours: 25,
    prerequisites: ["career-engineering"],
    topics: [
      "Niche selection", "Service selection", "Value proposition", "Client discovery", "Requirements",
      "Scope", "Acceptance criteria", "Estimation", "Proposal", "Negotiation", "Change request",
      "Implementation", "Revision", "Delivery", "Maintenance", "Support", "Case study creation",
    ],
    objectives: ["Run a discovery conversation that surfaces hidden constraints", "Write a scope with explicit exclusions"],
    masteryCriteria: ["Covers ≥75% of required discovery questions before quoting"],
    skills: ["freelancing", "communication", "technical-english"],
    harvardMapping: [{ candidate: "Professional practice", institution: "—", verification: "design_decision", adds: "Simulation-based practice, always labelled as simulation." }],
    sourceRefs: ["src-design-decision"],
    lastVerified: V,
  },
  {
    id: "research-engineering",
    stageId: "research",
    position: 1,
    title: "Research Engineering: Read, Reproduce, Ablate, Extend",
    sourceCategory: "Research Extension",
    level: "Graduate-equivalent",
    priority: "RESEARCH",
    why:
      "Reading papers critically and reproducing results is how you stop depending on blog posts and start evaluating claims yourself.",
    summary:
      "Paper reading protocol, literature search, claim identification, baselines, ablation design, reproduction, statistical reasoning, reproducibility practices, critique and scientific writing.",
    estimatedHours: 45,
    prerequisites: ["orig-m7-deep-learning", "harvard-math-depth"],
    topics: [
      "Paper reading protocol", "Literature search", "Claim identification", "Experimental design",
      "Baselines", "Ablation", "Reproduction", "Statistical reasoning", "Reproducibility", "Critique",
      "Scientific writing", "Presentation",
    ],
    objectives: ["Extract the falsifiable claim of a paper", "Reproduce one reported number and report the gap honestly"],
    masteryCriteria: ["Produces a reproduction report including what did not replicate"],
    skills: ["research", "model-evaluation", "technical-english"],
    harvardMapping: [{ candidate: "Research seminar practice", institution: "Mixed", verification: "design_decision", adds: "Research-layer competence." }],
    sourceRefs: ["src-design-decision"],
    lastVerified: V,
  },
];
