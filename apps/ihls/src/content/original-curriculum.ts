/**
 * ORIGINAL CURRICULUM — preserved verbatim (§37, §242 "Do not remove original curriculum content").
 *
 * Every module, session and topic string below is copied exactly from the master
 * specification. Nothing is deleted, renamed, merged or "improved". Classification,
 * sequencing and Harvard/industry layers are additive and live in other files.
 */

export interface OriginalSession {
  n: number;
  title: string;
  topics: string[];
}

export interface OriginalModule {
  id: string;
  n: number;
  title: string;
  declaredSessions: number;
  /** Verbatim note from the source specification about session-count mismatches. */
  preservationNote?: string;
  sessions: OriginalSession[];
}

export const ORIGINAL_MODULES: OriginalModule[] = [
  {
    id: "om1",
    n: 1,
    title: "Python Programming",
    declaredSessions: 10,
    preservationNote:
      "Source states 10 sessions with 5 grouped sections. Every listed topic is preserved; the session mapping is expressed as 5 authored sessions covering the full 10-session workload.",
    sessions: [
      {
        n: 1,
        title: "Python Fundamentals",
        topics: [
          "Intro to Python",
          "Variables & Data Types",
          "Type Casting",
          "Operators",
          "Conditional Statements",
          "for/while Loops",
          "break/continue/pass",
        ],
      },
      {
        n: 2,
        title: "Data Structures & Functions",
        topics: ["Lists", "Tuples", "Dictionaries", "Sets", "Functions", "Parameters", "Return Values", "Lambda", "Scope"],
      },
      {
        n: 3,
        title: "Error Handling & File I/O",
        topics: [
          "Error Handling",
          "try/except/finally",
          "Custom Exceptions",
          "File Handling",
          "Reading/Writing",
          "CSV files",
          "JSON files",
        ],
      },
      {
        n: 4,
        title: "Algorithms & OOP",
        topics: [
          "Searching Algorithms",
          "Linear Search",
          "Binary Search",
          "Sorting Algorithms",
          "Bubble Sort",
          "Recursion",
          "OOP",
          "Classes & Objects",
          "Inheritance",
          "Polymorphism",
        ],
      },
      {
        n: 5,
        title: "Advanced OOP & Python Ecosystem",
        topics: [
          "Encapsulation",
          "Abstraction",
          "Magic Methods",
          "Python Standard Libraries",
          "Modules & Packages",
          "Virtual Environments",
          "Mini-Project",
        ],
      },
    ],
  },
  {
    id: "om2",
    n: 2,
    title: "Math & Statistics",
    declaredSessions: 5,
    preservationNote: "The Harvard math layer must be ADDITIVE and deeper. Nothing here is removed.",
    sessions: [
      {
        n: 1,
        title: "Linear Algebra",
        topics: ["Scalars", "Vectors", "Matrices", "Tensors", "Matrix Operations & Multiplication", "Determinants"],
      },
      {
        n: 2,
        title: "Linear Algebra Advanced",
        topics: ["Eigenvalues", "Eigenvectors", "Matrix Inverse", "Vector Operations", "Dot Product", "Cross Product", "Norms"],
      },
      {
        n: 3,
        title: "Calculus, Optimization",
        topics: ["Differentiation", "Partial Derivatives", "Chain Rule", "Gradient Descent", "Optimization Concepts"],
      },
      {
        n: 4,
        title: "Statistics",
        topics: [
          "Population vs Sample",
          "Mean",
          "Median",
          "Mode",
          "Variance",
          "Standard Deviation",
          "IQR",
          "Distributions",
          "Skewness",
          "Kurtosis",
        ],
      },
      {
        n: 5,
        title: "Probability",
        topics: [
          "Probability Basics",
          "Conditional Probability",
          "Joint Probability",
          "Bayes",
          "Likelihood",
          "Correlation",
          "Covariance",
        ],
      },
    ],
  },
  {
    id: "om3",
    n: 3,
    title: "Data Analysis with Python",
    declaredSessions: 10,
    preservationNote:
      "Source note: if the list says 10 sessions but only 5 numbered sections are shown, DO NOT delete material; resolve session mapping, preserve every topic.",
    sessions: [
      { n: 1, title: "NumPy Foundations", topics: ["Arrays", "N-D Arrays", "Indexing & Slicing", "Reshaping"] },
      {
        n: 2,
        title: "NumPy Performance + Inferential Statistics + Pandas Intro",
        topics: [
          "Broadcasting",
          "Strides",
          "Vectorized Operations",
          "Math Operations",
          "Random Module",
          "Performance Optimization",
          "Hypothesis Testing",
          "A/B Testing",
          "Z-Score",
          "T-Test",
          "P-Value",
          "Confidence Intervals",
          "ANOVA",
          "Pandas DataFrames",
          "Pandas Series",
        ],
      },
      {
        n: 3,
        title: "Pandas Data Wrangling",
        topics: [
          "Reading CSV",
          "Reading Excel",
          "Reading JSON",
          "Reading SQL",
          "Filtering",
          "Sorting",
          "GroupBy",
          "Aggregation",
          "Joins",
          "Merge",
          "Missing Values",
          "Outliers",
          "Feature Engineering",
          "EDA Workflow",
        ],
      },
      {
        n: 4,
        title: "Data Visualization",
        topics: [
          "Matplotlib",
          "Line",
          "Bar",
          "Histogram",
          "Scatter",
          "Seaborn",
          "Heatmaps",
          "Pairplots",
          "Distribution Plots",
          "Plotly",
          "Interactive Dashboards",
          "Interactive Charts",
          "Choosing the Right Chart",
          "Data Storytelling",
        ],
      },
      {
        n: 5,
        title: "EDA Capstone",
        topics: [
          "Real-world dataset",
          "Full analysis pipeline",
          "Load",
          "Clean",
          "Analyze",
          "Visualization & insights presentation",
          "Best Practices",
          "Code Review",
        ],
      },
    ],
  },
  {
    id: "om4",
    n: 4,
    title: "Excel & Power BI",
    declaredSessions: 4,
    preservationNote:
      "Do not delete Excel or Power BI because Harvard does not use them as a core AI requirement. Kept as an explicit practical/business analytics layer.",
    sessions: [
      {
        n: 1,
        title: "Excel for Data Analysis",
        topics: ["Functions & Formulas", "VLOOKUP", "XLOOKUP", "Pivot Tables", "Power Query", "Charts", "Building Dashboards"],
      },
      {
        n: 2,
        title: "Power BI",
        topics: [
          "Introduction",
          "Power Query",
          "Power Pivot",
          "Data Modeling",
          "Relationships",
          "DAX Formulas",
          "Dashboards & Reports",
          "Publishing & Sharing",
        ],
      },
    ],
  },
  {
    id: "om5",
    n: 5,
    title: "Databases & Data Engineering",
    declaredSessions: 8,
    sessions: [
      { n: 1, title: "SQL & Database Design", topics: ["ERD", "Database Design", "Normalization", "SQL Basics", "DDL", "DML", "DQL"] },
      {
        n: 2,
        title: "Advanced SQL & Web Scraping",
        topics: ["JOINs", "Subqueries", "Views", "CTEs", "Window Functions", "Stored Procedures", "Query Optimization"],
      },
      {
        n: 3,
        title: "Scraping & Data Engineering Intro",
        topics: [
          "Advanced SQL Querying Practice",
          "BeautifulSoup",
          "Regular Expressions",
          "Selenium",
          "Dynamic Websites",
          "APIs for Data Collection",
          "Intro to Data Engineering",
          "Data Warehousing concepts",
        ],
      },
      {
        n: 4,
        title: "ETL Pipelines & Capstone",
        topics: ["ETL / ELT Pipelines", "Design", "Tools", "Implementation", "End-to-end pipeline", "Scrape → clean → store → query"],
      },
    ],
  },
  {
    id: "om6",
    n: 6,
    title: "Machine Learning",
    declaredSessions: 12,
    preservationNote: "Do not remove any algorithm or tool. Harvard advanced ML content is additive.",
    sessions: [
      {
        n: 1,
        title: "ML Fundamentals & Preprocessing",
        topics: [
          "Types of ML",
          "Supervised vs Unsupervised",
          "Scikit-Learn intro",
          "Scaling",
          "Encoding",
          "Feature Selection",
          "Imbalanced Data",
        ],
      },
      {
        n: 2,
        title: "Regression Models",
        topics: ["Linear Regression", "Simple Regression", "Multiple Regression", "Evaluation Metrics", "MSE", "R²"],
      },
      {
        n: 3,
        title: "Classification Models",
        topics: ["Logistic Regression", "Precision", "Recall", "F1", "ROC-AUC", "Decision Trees", "SVM", "KNN", "Naive Bayes"],
      },
      {
        n: 4,
        title: "Ensemble Methods",
        topics: [
          "Cross-Validation",
          "Grid Search",
          "Random Search",
          "Random Forest",
          "Bagging",
          "Boosting",
          "XGBoost",
          "CatBoost",
          "Stacking",
          "Model Comparison & Selection",
        ],
      },
      {
        n: 5,
        title: "Unsupervised Learning",
        topics: ["K-Means", "DBSCAN", "Hierarchical Clustering", "PCA", "Recommendation Systems", "Apriori Algorithm"],
      },
      {
        n: 6,
        title: "ML Capstone",
        topics: ["Problem selection", "Data preparation", "Baseline models", "Tuning", "Evaluation", "Model card", "Presentation"],
      },
    ],
  },
  {
    id: "om7",
    n: 7,
    title: "Deep Learning",
    declaredSessions: 16,
    preservationNote:
      "The original prompt contains a duplicated Module 7 heading because it continues the Deep Learning track. All content is preserved under one coherent Deep Learning program.",
    sessions: [
      {
        n: 1,
        title: "Neural Networks Foundations",
        topics: [
          "ANN Architecture",
          "Backpropagation",
          "Activation Functions",
          "Loss Functions",
          "Optimizers",
          "SGD",
          "Adam",
          "Overfitting",
          "Dropout",
          "Early Stopping",
        ],
      },
      {
        n: 2,
        title: "Building ANNs with TensorFlow/Keras",
        topics: [
          "Batch Normalization",
          "Learning Rate Scheduling",
          "TensorFlow/Keras intro",
          "Build and train a full ANN on tabular data",
          "Hands-on lab",
        ],
      },
      {
        n: 3,
        title: "Computer Vision",
        topics: [
          "CNN Architecture",
          "Filters",
          "Pooling",
          "Transfer Learning",
          "VGG",
          "ResNet",
          "EfficientNet",
          "Fine-tuning practice",
          "Object Detection",
          "YOLO architecture",
          "YOLO inference",
          "OpenCV",
          "Image Processing",
          "Segmentation",
          "Pose Estimation",
        ],
      },
      {
        n: 4,
        title: "Sequence Models & Time Series",
        topics: ["RNN", "LSTM", "GRU", "Theory", "Implementation", "Time Series Forecasting with LSTM", "Real-world dataset lab"],
      },
      {
        n: 5,
        title: "NLP Fundamentals",
        topics: [
          "Text Preprocessing",
          "Tokenization",
          "Stop Words",
          "Stemming",
          "Lemmatization",
          "TF-IDF",
          "N-Grams",
          "Word2Vec",
          "Word Embeddings",
          "Seq2Seq Models",
          "Summarization",
          "Translation",
          "Text Generation",
        ],
      },
      {
        n: 6,
        title: "Transformers & LLMs",
        topics: [
          "Attention Mechanism",
          "Architecture",
          "Embeddings",
          "Tokenizers",
          "Context Window",
          "Fine-tuning Types",
          "LoRA",
          "QLoRA",
          "Hugging Face",
          "Encoder models",
          "Decoder models",
          "Encoder-Decoder models",
          "Prompt Engineering",
          "RAG",
          "Vector Databases",
          "AI Agents",
          "DL Capstone kickoff",
        ],
      },
    ],
  },
  {
    id: "om8",
    n: 8,
    title: "Development & MLOps",
    declaredSessions: 2,
    preservationNote: "Do not remove any tool from this module. Harvard equivalents are added around these tools, never instead of them.",
    sessions: [
      {
        n: 1,
        title: "Model Deployment & Final Capstone",
        topics: [
          "APIs Fundamentals",
          "FastAPI",
          "Building and documenting a model API",
          "Streamlit for ML apps",
          "Docker Basics",
          "Containerizing a model",
          "CI/CD overview",
          "Final Capstone presentations",
        ],
      },
    ],
  },
];

export const ORIGINAL_TOPIC_COUNT = ORIGINAL_MODULES.reduce(
  (sum, m) => sum + m.sessions.reduce((s, x) => s + x.topics.length, 0),
  0,
);
