export type SourceCategory =
  | "Original Curriculum"
  | "Harvard College"
  | "Harvard Extension"
  | "Industry Extension"
  | "Research Extension";

export type CurriculumUnitSeed = {
  title: string;
  topics: string[];
  sessionAllocation?: string;
};

export type CurriculumModuleSeed = {
  id: string;
  title: string;
  track: string;
  sessions: number;
  sourceCategory: SourceCategory;
  note?: string;
  units: CurriculumUnitSeed[];
};

/** Original source outline retained topic-for-topic. Session reconciliation is explicit. */
export const originalModules: CurriculumModuleSeed[] = [
  {
    id: "python-programming",
    title: "Python Programming",
    track: "Foundations",
    sessions: 10,
    sourceCategory: "Original Curriculum",
    note: "Five numbered sections are preserved; the original 10-session envelope maps to two flexible study sessions per section. A session may expand or contract based on evidence, not a timer.",
    units: [
      { title: "1. Python Fundamentals", sessionAllocation: "Sessions 1–2", topics: ["Intro to Python", "Variables & Data Types", "Type Casting", "Operators", "Conditional Statements", "for/while Loops", "break/continue/pass"] },
      { title: "2. Data Structures & Functions", sessionAllocation: "Sessions 3–4", topics: ["Lists", "Tuples", "Dictionaries", "Sets", "Functions", "Parameters", "Return Values", "Lambda", "Scope"] },
      { title: "3. Error Handling & File I/O", sessionAllocation: "Sessions 5–6", topics: ["Error Handling", "try/except/finally", "Custom Exceptions", "File Handling", "Reading/Writing", "CSV files", "JSON files"] },
      { title: "4. Algorithms & OOP", sessionAllocation: "Sessions 7–8", topics: ["Searching Algorithms", "Linear Search", "Binary Search", "Sorting Algorithms", "Bubble Sort", "Recursion", "OOP", "Classes & Objects", "Inheritance", "Polymorphism"] },
      { title: "5. Advanced OOP & Python Ecosystem", sessionAllocation: "Sessions 9–10", topics: ["Encapsulation", "Abstraction", "Magic Methods", "Python Standard Libraries", "Modules & Packages", "Virtual Environments", "Mini-Project"] },
    ],
  },
  {
    id: "math-statistics",
    title: "Math & Statistics",
    track: "Foundations",
    sessions: 5,
    sourceCategory: "Original Curriculum",
    note: "The original five-session outline is preserved as five topic clusters. This is the practical layer; calculus, proof, probability, inference and optimization are deepened in parallel extensions.",
    units: [
      { title: "1. Linear Algebra", sessionAllocation: "Session 1", topics: ["Scalars", "Vectors", "Matrices", "Tensors", "Matrix Operations & Multiplication", "Determinants"] },
      { title: "2. Linear Algebra Advanced", sessionAllocation: "Session 2", topics: ["Eigenvalues", "Eigenvectors", "Matrix Inverse", "Vector Operations", "Dot Product", "Cross Product", "Norms"] },
      { title: "3. Calculus, Optimization", sessionAllocation: "Session 3", topics: ["Differentiation", "Partial Derivatives", "Chain Rule", "Gradient Descent", "Optimization Concepts"] },
      { title: "4. Statistics", sessionAllocation: "Session 4", topics: ["Population vs Sample", "Mean", "Median", "Mode", "Variance", "Standard Deviation", "IQR", "Distributions", "Skewness", "Kurtosis"] },
      { title: "5. Probability", sessionAllocation: "Session 5", topics: ["Probability Basics", "Conditional Probability", "Joint Probability", "Bayes", "Likelihood", "Correlation", "Covariance"] },
    ],
  },
  {
    id: "data-analysis-python",
    title: "Data Analysis with Python",
    track: "Data Foundations",
    sessions: 10,
    sourceCategory: "Original Curriculum",
    note: "The source declares 10 sessions but presents five numbered groups. Nothing is removed: each group receives two flexible sessions, with the EDA capstone allocated across both as needed.",
    units: [
      { title: "1. NumPy Foundations", sessionAllocation: "Sessions 1–2", topics: ["Arrays", "N-D Arrays", "Indexing & Slicing", "Reshaping"] },
      { title: "2. NumPy Performance + Inferential Statistics + Pandas Intro", sessionAllocation: "Sessions 3–4", topics: ["Broadcasting", "Strides", "Vectorized Operations", "Math Operations", "Random Module", "Performance Optimization", "Hypothesis Testing", "A/B Testing", "Z-Score", "T-Test", "P-Value", "Confidence Intervals", "ANOVA", "Pandas DataFrames", "Pandas Series"] },
      { title: "3. Pandas Data Wrangling", sessionAllocation: "Sessions 5–6", topics: ["Reading CSV", "Reading Excel", "Reading JSON", "Reading SQL", "Filtering", "Sorting", "GroupBy", "Aggregation", "Joins", "Merge", "Missing Values", "Outliers", "Feature Engineering", "EDA Workflow"] },
      { title: "4. Data Visualization", sessionAllocation: "Sessions 7–8", topics: ["Matplotlib", "Line", "Bar", "Histogram", "Scatter", "Seaborn", "Heatmaps", "Pairplots", "Distribution Plots", "Plotly", "Interactive Dashboards", "Interactive Charts", "Choosing the Right Chart", "Data Storytelling"] },
      { title: "5. EDA Capstone", sessionAllocation: "Sessions 9–10", topics: ["Real-world dataset", "Full analysis pipeline", "Load", "Clean", "Analyze", "Visualization & insights presentation", "Best Practices", "Code Review"] },
    ],
  },
  {
    id: "excel-power-bi",
    title: "Excel & Power BI",
    track: "Business Analytics Extension",
    sessions: 4,
    sourceCategory: "Original Curriculum",
    note: "The original four-session outline has two topic groups. Sessions 1–2 cover Excel; sessions 3–4 cover Power BI. Kept as a practical/business analytics layer, not represented as Harvard CS core.",
    units: [
      { title: "1. Excel for Data Analysis", sessionAllocation: "Sessions 1–2", topics: ["Functions & Formulas", "VLOOKUP", "XLOOKUP", "Pivot Tables", "Power Query", "Charts", "Building Dashboards"] },
      { title: "2. Power BI", sessionAllocation: "Sessions 3–4", topics: ["Introduction", "Power Query", "Power Pivot", "Data Modeling", "Relationships", "DAX Formulas", "Dashboards & Reports", "Publishing & Sharing"] },
    ],
  },
  {
    id: "databases-data-engineering",
    title: "Databases & Data Engineering",
    track: "Data Foundations",
    sessions: 8,
    sourceCategory: "Original Curriculum",
    note: "The eight-session envelope maps to two flexible sessions per four numbered sections; all SQL, scraping, ETL/ELT and warehouse topics remain.",
    units: [
      { title: "1. SQL & Database Design", sessionAllocation: "Sessions 1–2", topics: ["ERD", "Database Design", "Normalization", "SQL Basics", "DDL", "DML", "DQL"] },
      { title: "2. Advanced SQL & Web Scraping", sessionAllocation: "Sessions 3–4", topics: ["JOINs", "Subqueries", "Views", "CTEs", "Window Functions", "Stored Procedures", "Query Optimization"] },
      { title: "3. Scraping & Data Engineering Intro", sessionAllocation: "Sessions 5–6", topics: ["Advanced SQL Querying Practice", "BeautifulSoup", "Regular Expressions", "Selenium", "Dynamic Websites", "APIs for Data Collection", "Intro to Data Engineering", "Data Warehousing concepts"] },
      { title: "4. ETL Pipelines & Capstone", sessionAllocation: "Sessions 7–8", topics: ["ETL / ELT Pipelines", "Design", "Tools", "Implementation", "End-to-end pipeline", "Scrape → clean → store → query"] },
    ],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    track: "AI Core",
    sessions: 12,
    sourceCategory: "Original Curriculum",
    note: "Six numbered sections map to two flexible sessions each. Harvard CS1810/CS1820 and graduate-level theory are additive mathematical/analytical layers, not replacements.",
    units: [
      { title: "1. ML Fundamentals & Preprocessing", sessionAllocation: "Sessions 1–2", topics: ["Types of ML", "Supervised vs Unsupervised", "Scikit-Learn intro", "Scaling", "Encoding", "Feature Selection", "Imbalanced Data"] },
      { title: "2. Regression Models", sessionAllocation: "Sessions 3–4", topics: ["Linear Regression", "Simple Regression", "Multiple Regression", "Evaluation Metrics", "MSE", "R²"] },
      { title: "3. Classification Models", sessionAllocation: "Sessions 5–6", topics: ["Logistic Regression", "Precision", "Recall", "F1", "ROC-AUC", "Decision Trees", "SVM", "KNN", "Naive Bayes"] },
      { title: "4. Ensemble Methods", sessionAllocation: "Sessions 7–8", topics: ["Cross-Validation", "Grid Search", "Random Search", "Random Forest", "Bagging", "Boosting", "XGBoost", "CatBoost", "Stacking", "Model Comparison & Selection"] },
      { title: "5. Unsupervised Learning", sessionAllocation: "Sessions 9–10", topics: ["K-Means", "DBSCAN", "Hierarchical Clustering", "PCA", "Recommendation Systems", "Apriori Algorithm"] },
      { title: "6. ML Capstone", sessionAllocation: "Sessions 11–12", topics: ["Problem selection", "Data preparation", "Baseline models", "Tuning", "Evaluation", "Model card", "Presentation"] },
    ],
  },
  {
    id: "deep-learning",
    title: "Deep Learning",
    track: "AI Core",
    sessions: 16,
    sourceCategory: "Original Curriculum",
    note: "The source repeats the Module 7 heading for part 2. Both parts are consolidated under one coherent 16-session program; every listed topic is retained. Session pacing is adaptive rather than inferred as an exact historical schedule.",
    units: [
      { title: "1. Neural Networks Foundations", topics: ["ANN Architecture", "Backpropagation", "Activation Functions", "Loss Functions", "Optimizers", "SGD", "Adam", "Overfitting", "Dropout", "Early Stopping"] },
      { title: "2. Building ANNs with TensorFlow/Keras", topics: ["Batch Normalization", "Learning Rate Scheduling", "TensorFlow/Keras intro", "Build and train a full ANN on tabular data", "Hands-on lab"] },
      { title: "3. Computer Vision", topics: ["CNN Architecture", "Filters", "Pooling", "Transfer Learning", "VGG", "ResNet", "EfficientNet", "Fine-tuning practice", "Object Detection", "YOLO architecture", "YOLO inference", "OpenCV", "Image Processing", "Segmentation", "Pose Estimation"] },
      { title: "4. Sequence Models & Time Series", topics: ["RNN", "LSTM", "GRU", "Theory", "Implementation", "Time Series Forecasting with LSTM", "Real-world dataset lab"] },
      { title: "5. NLP Fundamentals", topics: ["Text Preprocessing", "Tokenization", "Stop Words", "Stemming", "Lemmatization", "TF-IDF", "N-Grams", "Word2Vec", "Word Embeddings", "Seq2Seq Models", "Summarization", "Translation", "Text Generation"] },
      { title: "6. Transformers & LLMs", topics: ["Attention Mechanism", "Architecture", "Embeddings", "Tokenizers", "Context Window", "Fine-tuning Types", "LoRA", "QLoRA", "Hugging Face", "Encoder models", "Decoder models", "Encoder-Decoder models", "Prompt Engineering", "RAG", "Vector Databases", "AI Agents", "DL Capstone kickoff"] },
    ],
  },
  {
    id: "development-mlops",
    title: "Development & MLOps",
    track: "Production AI",
    sessions: 2,
    sourceCategory: "Original Curriculum",
    note: "The original two-session capstone module and every named tool remain. Industry and Harvard Applied Computation layers extend the deployment content.",
    units: [
      { title: "1. Model Deployment & Final Capstone", sessionAllocation: "Sessions 1–2", topics: ["APIs Fundamentals", "FastAPI", "Building and documenting a model API", "Streamlit for ML apps", "Docker Basics", "Containerizing a model", "CI/CD overview", "Final Capstone presentations"] },
    ],
  },
];

export type HarvardCourseSeed = {
  id: string;
  title: string;
  level: string;
  status: "confirmed_current" | "confirmed_historical" | "likely_not_verified" | "not_found";
  sourceCategory: "Harvard College" | "Harvard Extension";
  sourceUrl: string;
  description: string;
  term?: string;
  prerequisites?: string[];
  mapsTo: string[];
  evidenceMode: string;
};

export const harvardCourses: HarvardCourseSeed[] = [
  { id: "hc-cs50", title: "Introduction to Computer Science (CS50)", level: "Introductory undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://cs50.harvard.edu/college/2026/fall/syllabus/", term: "Fall 2026", description: "Computational thinking, abstraction, algorithms, data structures, C, memory, Python, SQL and web development; lectures, sections, office hours, problem sets, quizzes and final project.", mapsTo: ["python-programming", "databases-data-engineering"], evidenceMode: "Problem sets, three quizzes, final project; course-specific weights are documented in the source." },
  { id: "hc-cs20", title: "Discrete Mathematics for Computer Science (CS 20)", level: "Undergraduate foundations", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Harvard CS formal-reasoning and discrete-mathematics mapping. Consult current term syllabus for exact content and assessment.", mapsTo: ["python-programming", "math-statistics"], evidenceMode: "Public current catalog/tag reference; no weekly assessment details encoded." },
  { id: "hc-cs51", title: "Abstraction and Design in Computation (CS 51)", level: "Intermediate undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Programming 2 / abstraction and design layer that deepens program construction beyond introductory syntax.", mapsTo: ["python-programming"], evidenceMode: "Current concentration tag page; term-specific assignments not asserted." },
  { id: "hc-cs61", title: "Systems Programming and Machine Organization (CS 61)", level: "Intermediate undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Systems and machine-organization layer; complements the original Python and deployment path with memory and lower-level software concerns.", mapsTo: ["python-programming", "development-mlops"], evidenceMode: "Current concentration tag page; term-specific syllabus not asserted." },
  { id: "hc-cs1200", title: "Introduction to Algorithms, Computability, and Complexity (CS 1200)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Algorithms and computational limitations/formal reasoning; complements, rather than repeats, practical algorithm implementations.", mapsTo: ["python-programming"], evidenceMode: "Current concentration tag page; no grading details claimed." },
  { id: "hc-cs1240", title: "Data Structures and Algorithms (CS 1240)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Algorithm/data-structure reasoning and intermediate algorithms; build correctness, complexity, and selection beyond tool use.", mapsTo: ["python-programming", "databases-data-engineering"], evidenceMode: "Current concentration tag page; do not infer a specific assignment schedule." },
  { id: "hc-cs1810", title: "Machine Learning (CS 1810; formerly CS 181)", level: "Advanced undergraduate / graduate-listed", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://beta.my.harvard.edu/course/COMPSCI1810/2026-Spring/001", term: "Spring 2026", description: "Probabilistic view of ML: supervised learning, ensembles/boosting, neural nets, SVMs, kernels, clustering, maximum likelihood, graphical models, HMMs, inference and computational learning theory; Python programs.", prerequisites: ["Non-trivial programming", "Multivariable calculus", "Linear algebra", "Probability theory", "Complexity theory"], mapsTo: ["math-statistics", "machine-learning", "deep-learning"], evidenceMode: "Catalog states significant programming and mathematical prerequisites; exact assessments need the term syllabus." },
  { id: "hc-cs1820", title: "Artificial Intelligence (CS 1820; formerly CS 182)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Current AI-tagged course in the Harvard CS map. Verify the term and course syllabus before scheduling.", mapsTo: ["machine-learning", "deep-learning"], evidenceMode: "Course-tag confirmation; term delivery and grading not asserted." },
  { id: "hc-cs1840", title: "Reinforcement Learning (CS 1840; formerly CS 184)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "AI-tagged reinforcement-learning option. Treat as a specialization after probability, optimization, and ML foundations.", mapsTo: ["machine-learning"], evidenceMode: "Course-tag confirmation; verify semester-specific offering." },
  { id: "hc-cs1870", title: "Introduction to Computational Linguistics and Natural-language Processing (CS 1870; formerly CS 187)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Current CS-tag reference to computational linguistics/NLP; complements original NLP and LLM foundations.", mapsTo: ["deep-learning"], evidenceMode: "Course-tag confirmation; course-specific topics/assessments need a current syllabus." },
  { id: "hc-am220", title: "Geometric Methods for Machine Learning (AM 220)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Mathematical/geometric extension for ML after linear algebra, calculus and probability.", prerequisites: ["Linear algebra", "Calculus", "Proof readiness"], mapsTo: ["math-statistics", "machine-learning"], evidenceMode: "Current course-tag title; do not infer exact schedule." },
  { id: "hc-cs1280", title: "Convex Optimization and Applications in Machine Learning (CS 1280 / AM 122)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Optimization theory/application bridge for ML; add after multivariable calculus and linear algebra.", prerequisites: ["Linear algebra", "Calculus", "Probability helpful"], mapsTo: ["math-statistics", "machine-learning"], evidenceMode: "Current course-tag title; exact semester offering is not promised." },
  { id: "hc-cs1410", title: "Computing Hardware (CS 1410 / ECE 141)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Hardware/software interface elective for an AI engineer’s selected systems layer.", mapsTo: ["development-mlops"], evidenceMode: "Current concentration tag page; syllabus details not asserted." },
  { id: "hc-cs1610", title: "Operating Systems (CS 1610)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Operating-system and software-systems extension for processes, concurrency, resource limits and deployment.", mapsTo: ["development-mlops", "databases-data-engineering"], evidenceMode: "Current concentration tag page; verify actual term offering." },
  { id: "hc-cs1090a", title: "Data Science 1: Introduction to Data Science (CS 1090A / STAT 109A / AC 209A)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Current course-tag page records the updated course identifiers (2025 and later) and distinguishes older CS109A numbering.", mapsTo: ["data-analysis-python", "machine-learning"], evidenceMode: "Current course tags; use term catalog for availability and syllabus." },
  { id: "hc-cs1090b", title: "Data Science 2: Advanced Topics in Data Science (CS 1090B / STAT 109B / AC 209B)", level: "Advanced undergraduate", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://csadvising.seas.harvard.edu/concentration/courses/tags/", description: "Advanced data-science extension; catalog tags retain former aliases where relevant.", mapsTo: ["data-analysis-python", "machine-learning"], evidenceMode: "Current course tags; verify offering/assessment by term." },
  { id: "he-ai-certificate", title: "Artificial Intelligence Graduate Certificate", level: "Graduate certificate (Harvard Extension School)", status: "confirmed_current", sourceCategory: "Harvard Extension", sourceUrl: "https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/", description: "Four courses: one AI foundation, advanced NLP/ML, deep learning/computer vision, and AI ethics/governance/law; exact course choices vary each term.", prerequisites: ["Python programming", "Statistics equivalent to STAT 100 recommended"], mapsTo: ["machine-learning", "deep-learning"], evidenceMode: "Program-level category structure; not a self-study credential." },
  { id: "he-dsai-alm", title: "Data Science and Artificial Intelligence ALM", level: "Graduate degree program (Harvard Extension School)", status: "confirmed_current", sourceCategory: "Harvard Extension", sourceUrl: "https://extension.harvard.edu/academics/programs/data-science-artificial-intelligence-graduate-program/data-science-artificial-intelligence-degree-requirements/", description: "12 graduate courses / 48 credits, including CSCI 101, CSCI 106, core/electives, on-campus precapstone and applied team capstone; degree program is separate from Harvard College.", prerequisites: ["Python functions", "Calculus comfort", "Formal admission eligibility and performance-based admission"], mapsTo: ["data-analysis-python", "machine-learning", "development-mlops"], evidenceMode: "Official published requirements; individual electives change." },
  { id: "he-math-e142", title: "Mathematics for Artificial Intelligence and Machine Learning (MATH E-142)", level: "Graduate/advanced Extension course", status: "confirmed_current", sourceCategory: "Harvard Extension", sourceUrl: "https://coursebrowser.dce.harvard.edu/course/mathematics-for-artificial-intelligence-and-machine-learning/", description: "Linear algebra, analytic geometry, vector calculus, optimization and probability applied to regression, dimensionality reduction, Gaussian mixtures and SVMs.", prerequisites: ["At least two of MATH E-21a, MATH E-21b, MATH E-23a, STAT E-150 or equivalent"], mapsTo: ["math-statistics", "machine-learning"], evidenceMode: "Course browser description; confirm section/term before enrollment." },
  { id: "he-csci-e82", title: "Advanced Machine Learning, Data Mining, and Artificial Intelligence (CSCI E-82)", level: "Graduate Extension course", status: "confirmed_current", sourceCategory: "Harvard Extension", sourceUrl: "https://coursebrowser.dce.harvard.edu/course/advanced-machine-learning-data-mining-and-artificial-intelligence/", term: "Fall 2026 listed", description: "Theory plus hands-on industry problems, including advanced clustering, deep learning, dimensionality reduction, frequent-item mining, recommenders and other topics; Python primary language.", prerequisites: ["CSCI E-63c or CSCI E-109a", "Proficient Python/Pandas"], mapsTo: ["machine-learning", "deep-learning"], evidenceMode: "Fall 2026 course-browser listing; term offerings can change." },
  { id: "hc-ac215", title: "Advanced Practical Data Science / MLOps (AC 215 / APCOMP 215)", level: "Advanced practical course", status: "confirmed_current", sourceCategory: "Harvard College", sourceUrl: "https://seas.harvard.edu/applied-computation/courses", term: "Fall 2026 APCOMP 215 listing", description: "Applied Computation course layer covering end-to-end data/AI workflows, evaluation, deployment/monitoring, LLMs, RAG and agent-based workflows. Course numbering and cross-listing have changed historically.", mapsTo: ["databases-data-engineering", "development-mlops", "deep-learning"], evidenceMode: "Current Applied Computation course description and 2026 catalog listing; exact weekly assessment schedule not encoded." },
];

export type ExtensionSpineSeed = { id: string; title: string; level: string; prerequisites: string[]; topics: string[]; why: string };

/** Additive non-Harvard spine; tools are not mistaken for discipline knowledge. */
export const industrySpine: ExtensionSpineSeed[] = [
  { id: "mathematical-depth", title: "Mathematical Foundations — Deepening Layer", level: "Core / Support", prerequisites: ["math-statistics"], topics: ["Algebra refresh", "Single-variable calculus", "Multivariable calculus", "Partial derivatives", "Gradients", "Jacobians", "Hessians", "Linear algebra", "Vector spaces", "Linear transformations", "Matrix calculus", "Probability", "Random variables", "Expectation", "Variance", "Covariance", "Distributions", "Conditional probability", "Bayes", "Likelihood", "Maximum likelihood", "MAP", "Statistical inference", "Hypothesis testing", "Confidence intervals", "Regression", "Optimization", "Convexity", "Numerical methods"], why: "Build the math needed to reason about model objectives, uncertainty, optimization and generalization." },
  { id: "computer-science-engineering", title: "Computer Science Foundations for AI Engineering", level: "Core / Support", prerequisites: ["python-programming"], topics: ["C programming", "Memory model", "Pointers", "Stack/heap", "Compilation/linking", "Debugging", "Linux/CLI", "Data structures", "Linked lists", "Stacks/queues", "Trees", "Hash tables", "Tries", "Graphs", "Recursion", "Asymptotic complexity", "Sorting/searching", "Greedy algorithms", "Divide and conquer", "Dynamic programming", "Formal logic", "Proof techniques", "Computational limitations", "Computer organization", "Operating-system concepts", "Processes/threads", "Concurrency", "Networking fundamentals", "HTTP/TCP/IP/DNS concepts", "Database transactions", "Distributed systems", "Software abstraction and design"], why: "Tools alone do not establish engineering competence; learn correctness, complexity, memory, systems and failure behavior." },
  { id: "software-engineering", title: "Software Engineering for AI", level: "Core", prerequisites: ["computer-science-engineering"], topics: ["Requirements", "Acceptance criteria", "Decomposition", "Issue tracking", "Git", "GitHub", "Branching", "Commits", "Pull requests", "Code review", "Semantic versioning", "Dependency management", "Typing", "Linting", "Formatting", "Unit tests", "Integration tests", "E2E tests", "Debugging", "Logging", "Configuration", "API design", "REST", "Authentication", "Authorization", "Caching", "Retries", "Idempotency", "Background jobs", "Queues", "Concurrency / async", "Performance", "Refactoring", "Maintainability", "Release engineering", "Rollback"], why: "Make AI work testable, reviewable, maintainable and safe to change." },
  { id: "data-systems-extension", title: "Data Engineering & Big Data Extension", level: "Support / Advanced", prerequisites: ["databases-data-engineering"], topics: ["Data modeling", "Warehouse concepts", "Lake/lakehouse concepts", "ETL/ELT", "Batch vs streaming", "Airflow", "dbt", "Spark", "Spark SQL", "Partitioning", "Shuffle concepts", "Performance", "Hadoop concepts", "HDFS", "MapReduce concepts", "Databricks awareness", "Talend awareness and targeted hands-on work"], why: "Extend the original SQL/scraping/ETL work to reproducible large-scale data workflows." },
  { id: "cloud-engineering", title: "Cloud Engineering (AWS primary; Azure familiarization)", level: "Industry Extension", prerequisites: ["software-engineering"], topics: ["AWS IAM", "S3", "Lambda", "API Gateway", "EC2 fundamentals", "ECR", "ECS fundamentals", "CloudWatch", "VPC/networking basics", "Secrets concepts", "Model/API hosting", "Serverless patterns", "Azure Entra ID", "Azure storage", "Azure compute", "Azure serverless", "Current Azure AI ecosystem", "Azure monitoring", "Azure identity and access", "Terraform/OpenTofu concepts"], why: "Target strong hands-on competence in one cloud and working familiarity with the other; avoid equal-depth tool collection." },
  { id: "production-mlops", title: "MLOps & Production ML Lifecycle", level: "Core / Advanced", prerequisites: ["machine-learning", "software-engineering"], topics: ["Data validation", "Training pipelines", "Experiment tracking", "MLflow", "Model registry concepts", "Evaluation gates", "Packaging", "Deployment", "Containers", "Docker", "CI/CD", "Airflow/dbt workflow context", "Orchestration", "Reproducibility", "Monitoring", "Data/model drift", "Rollback", "Retraining", "Model cards", "Observability", "Inference latency/cost constraints"], why: "Treat deployment, monitoring and rollback as part of the model lifecycle, not an afterthought." },
  { id: "llm-production-systems", title: "Transformers, LLMs, RAG, GraphRAG & Agents", level: "Advanced / Specialization", prerequisites: ["deep-learning", "software-engineering"], topics: ["Tokenization", "Embeddings", "Attention", "Transformer architecture", "Encoder/decoder/encoder-decoder", "Pretraining objectives", "Inference", "Context windows", "Generation controls", "Evaluation", "Hallucination analysis", "Fine-tuning", "LoRA", "QLoRA", "Quantization", "Hugging Face", "Retrieval", "Vector search", "Hybrid search", "Metadata filtering", "Chunking", "Reranking concepts", "RAG evaluation", "Citation grounding", "Knowledge graphs", "GraphRAG", "Graph databases", "Tool calling", "Agent planning", "Memory/state", "Orchestration", "Multi-agent patterns", "Permissions", "Safety", "Observability", "Latency", "Cost", "Deterministic workflow vs single call vs tool workflow vs agent vs multi-agent decision"], why: "Design the least-complex system that meets the evidence and workflow need; do not equate prompting or agent count with engineering." },
  { id: "security-responsible-ai", title: "Security, Responsible AI & Governance", level: "Core, integrated", prerequisites: ["software-engineering"], topics: ["Privacy", "Security", "Prompt injection", "Access control", "Data provenance", "Bias and fairness", "Robustness", "Evaluation safety", "Governance", "Accountability", "Model/system cards", "Human oversight", "Misuse analysis", "Monitoring", "ISO/IEC 42001 concepts", "Ethical and legal trade-offs"], why: "Integrate privacy, safety and accountability in data acquisition, evaluation, deployment and incident response." },
  { id: "technical-english", title: "Technical English & Professional Communication", level: "Core communication layer", prerequisites: [], topics: ["Technical reading", "Listening", "Writing", "Speaking", "Interaction", "Technical vocabulary", "Collocations", "Explain concepts", "Explain code", "Project presentations", "Interview answers", "Client discovery", "Incident communication", "Technical writing"], why: "Practice authentic engineering communication while studying technical material; vocabulary count alone is not CEFR proficiency." },
  { id: "career-interview", title: "Career & Interview Engineering", level: "Professional extension", prerequisites: ["software-engineering"], topics: ["Role requirement evidence", "Skill gap analysis", "Portfolio case studies", "Resume claims backed by artifacts", "Technical interviews", "System design interviews", "Behavioral examples", "Readiness rubric", "Communication practice"], why: "Translate demonstrated skill into truthful, inspectable career evidence; never guarantee employment." },
  { id: "freelancing", title: "Freelancing & Client Delivery", level: "Professional extension", prerequisites: ["software-engineering", "technical-english"], topics: ["Niche selection", "Service selection", "Value proposition", "Client discovery", "Requirements", "Scope", "Acceptance criteria", "Estimation", "Proposal", "Negotiation", "Change requests", "Implementation", "Revision", "Delivery", "Maintenance", "Support", "Case study creation"], why: "Learn discovery and delivery before accepting a simulated brief as real client work." },
  { id: "research-engineering", title: "Research Engineering", level: "Research Extension", prerequisites: ["machine-learning", "mathematical-depth"], topics: ["Paper reading", "Literature search", "Claim identification", "Experimental design", "Baselines", "Ablations", "Reproduction", "Statistical reasoning", "Reproducibility", "Critique", "Scientific writing", "Presentation", "Peer review", "Research question"], why: "Move from foundation to reproduction, ablation, extension and defensible research claims." },
];

export type ProjectSeed = { id: string; title: string; ladderLevel: number; category: string; riskNote?: string };

/** Titles below are learner-provided project ideas, not completed projects or results. */
export const originalProjects: ProjectSeed[] = [
  { id: "skin-disease-prediction", title: "Skin Disease Prediction", ladderLevel: 6, category: "Computer Vision", riskNote: "Educational research prototype only; not for diagnosis, triage, or clinical use." },
  { id: "face-recognition", title: "Face Recognition / Detection / Verification", ladderLevel: 6, category: "Computer Vision", riskNote: "High privacy and biometric-risk domain; require lawful data, consent, bias analysis and strict scope." },
  { id: "text-classification", title: "Text Classification", ladderLevel: 6, category: "NLP" },
  { id: "stock-market-prediction", title: "Stock Market Prediction", ladderLevel: 4, category: "Classical ML", riskNote: "No investment advice or predictive-performance claims without prospective evaluation." },
  { id: "sign-language-classifier", title: "Sign Language Classifier", ladderLevel: 6, category: "Computer Vision", riskNote: "Avoid claims of broad sign-language translation from a limited gesture dataset." },
  { id: "real-time-object-detection", title: "Real-time Object Detection", ladderLevel: 6, category: "Computer Vision" },
  { id: "breast-cancer-detection", title: "Breast Cancer Detection", ladderLevel: 4, category: "Classical ML", riskNote: "Educational prototype only; not for diagnosis or clinical decision-making." },
  { id: "brain-tumor-detection", title: "Brain Tumor Detection", ladderLevel: 6, category: "Computer Vision", riskNote: "Educational prototype only; not for diagnosis or clinical decision-making." },
  { id: "gan-image-generation", title: "Image Generation using GANs", ladderLevel: 5, category: "Deep Learning" },
  { id: "library-management", title: "Library Management System", ladderLevel: 1, category: "Software Engineering" },
  { id: "uber-data-analysis", title: "Uber Data Analysis", ladderLevel: 2, category: "Data Analysis" },
  { id: "superstore-dashboard", title: "Superstore Data Analysis Dashboard", ladderLevel: 2, category: "Business Analytics" },
  { id: "hr-dashboard", title: "HR Dashboard", ladderLevel: 2, category: "Business Analytics", riskNote: "Use lawful, privacy-conscious data; treat employment analytics as high-impact." },
  { id: "bank-loan-analysis", title: "Bank Loan Data Analysis", ladderLevel: 2, category: "Data Analysis", riskNote: "Credit decisions are high impact; analyze fairness, proxy variables and limitations." },
  { id: "sales-database", title: "Sales Database", ladderLevel: 3, category: "SQL / Data Engineering" },
  { id: "credit-card-fraud", title: "Credit Card Fraud Detection", ladderLevel: 4, category: "Classical ML", riskNote: "Use public permitted data, avoid implying production fraud coverage, and report false-positive costs." },
  { id: "titanic-prediction", title: "Titanic Prediction", ladderLevel: 4, category: "Classical ML" },
  { id: "house-pricing", title: "House Pricing Prediction", ladderLevel: 4, category: "Classical ML" },
  { id: "chatbot", title: "Chatbot", ladderLevel: 7, category: "LLM Application" },
  { id: "document-summarization", title: "Document Summarization", ladderLevel: 7, category: "LLM Application" },
  { id: "rag-system", title: "RAG System", ladderLevel: 7, category: "Retrieval-Augmented Generation" },
];

export const originalModuleProjects: Record<string, string[]> = {
  "python-programming": ["python-mini-project"],
  "data-analysis-python": ["eda-capstone"],
  "machine-learning": ["ml-capstone"],
  "deep-learning": ["dl-capstone"],
  "development-mlops": ["final-capstone"],
};

export const careerBlueprints = [
  {
    id: "navisoft-style-ai-engineer",
    title: "Navisoft-style AI Engineer",
    sourceStatus: "design_decision",
    sourceNote: "Learner-supplied target-role blueprint; no current first-party job posting or employment guarantee was verified.",
    skills: ["AI/ML model development", "TensorFlow", "PyTorch", "NLP", "statistical modeling", "R", "SAS", "SQL", "database design", "Hadoop", "Spark", "ETL", "Talend", "AWS", "predictive modeling", "generative AI", "Bash", "VBA", "Python", "Java", "C", "model evaluation", "data mining", "scalable systems", "cloud deployment"],
  },
  {
    id: "nuwave-style-production-ai-engineer",
    title: "Nuwave-style Production AI Engineer",
    sourceStatus: "design_decision",
    sourceNote: "Learner-supplied reference-role blueprint; seniority, region, current availability and exact requirements remain unverified.",
    skills: ["Python", "TypeScript", "AWS", "Azure", "serverless", "containers", "identity", "data", "observability", "RAG", "GraphRAG", "vector search", "graph databases", "agent workflows", "AI coding agents", "Git", "testing", "deployment", "rollback", "infrastructure as code", "Terraform/OpenTofu", "LangGraph", "LangChain", "Microsoft Graph", "Teams apps", "Entra ID", "multi-agent orchestration", "security", "ISO/IEC 42001 concepts", "distributed systems", "technical documentation", "incident response"],
  },
];

export const marketJobSnapshots = [
  {
    id: "anthropic-ml-infrastructure-safeguards-2026-09-29",
    employer: "Anthropic",
    roleTitle: "Machine Learning Infrastructure Engineer, Safeguards Research",
    sourceUrl: "https://job-boards.greenhouse.io/anthropic/jobs/5364804008",
    snapshotDate: "2026-09-29",
    location: "San Francisco, CA; New York City, NY",
    seniority: "Not specified; posting says minimum experience correlates with internal job level",
    sourceStatus: "confirmed_current",
    notes: "One first-party example snapshot only. Role-specific research infrastructure posting, not a generic AI Engineer job benchmark. Recheck the employer posting before reuse; it may close or change.",
    requirements: [
      { skill: "Python", type: "required" },
      { skill: "Strong software engineering fundamentals", type: "required" },
      { skill: "Production data-intensive or distributed systems", type: "required" },
      { skill: "Tooling or infrastructure used by engineers/researchers", type: "required" },
      { skill: "Research-to-deployment pipeline experience", type: "required" },
      { skill: "Performance and correctness debugging", type: "required" },
      { skill: "Written and verbal collaboration", type: "required" },
      { skill: "Large-scale machine learning systems", type: "preferred" },
      { skill: "Language modeling and Transformers", type: "preferred" },
      { skill: "ML framework internals", type: "preferred" },
      { skill: "GPU/accelerator programming or inference optimization", type: "preferred" },
      { skill: "Experiment tracking or evaluation harnesses", type: "preferred" },
      { skill: "Probes, interpretability or classifier development", type: "preferred" },
      { skill: "AI misuse-risk mitigation", type: "preferred" },
    ],
  },
];

export const learningSciencePrinciples = [
  { id: "retrieval", label: "Retrieval practice", evidence: "Strong research support; fit task, add feedback", behavior: "Ask a short recall or explanation question after the source is closed." },
  { id: "spacing", label: "Spaced practice", evidence: "Strong research support; useful interval depends on material and retention horizon", behavior: "Schedule review after performance evidence, with interval adjustments after success or difficulty." },
  { id: "interleaving", label: "Interleaving", evidence: "Moderate/context-dependent; more useful after initial familiarity for choosing among methods", behavior: "Mix related problem types after foundational practice." },
  { id: "feedback", label: "Actionable feedback", evidence: "Design principle; quality and timing matter", behavior: "Point to the smallest actionable gap; require another attempt when useful." },
  { id: "transfer", label: "Transfer checks", evidence: "Research-supported goal; recall does not automatically guarantee far transfer", behavior: "Use a changed dataset, constraint, codebase or decision case." },
  { id: "state-adaptive", label: "State-adaptive presentation", evidence: "Research hypothesis / product design", behavior: "Learner voluntarily selects Deep, Drift, Fog or Overload; change task size and scaffolding without diagnosis." },
  { id: "student-attempt-first", label: "Attempt before answer", evidence: "Research hypothesis / AI-integrity design", behavior: "For active practice, ask for a first attempt before the complete answer; offer full explanations on request." },
  { id: "time-flexible", label: "Time-flexible study", evidence: "Design decision, not a universal timing claim", behavior: "No mandatory Pomodoro; suggest a break or smaller task based on learner preference and work quality." },
];
