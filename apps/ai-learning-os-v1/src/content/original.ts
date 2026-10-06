/**
 * ORIGINAL CURRICULUM — preserved verbatim. Nothing here may be deleted.
 * Session counts are the counts stated in the original outline. Where the
 * numbered sections are fewer than the stated session count, the session
 * mapping ("sessionSpan") distributes the stated sessions across sections
 * without removing any topic.
 */
export type OriginalSection = {
  id: string;
  title: string;
  topics: string[];
  why: string;
  objectives: string[];
  sessionSpan: string;
  skills: string[];
};

export type OriginalModule = {
  id: string;
  title: string;
  statedSessions: number;
  sessionNote?: string;
  sections: OriginalSection[];
};

export const ORIGINAL_MODULES: OriginalModule[] = [
  {
    id: "m1-python",
    title: "Module 1: Python Programming",
    statedSessions: 10,
    sessionNote: "10 sessions distributed across 5 sections (2 sessions each).",
    sections: [
      {
        id: "m1-s1-fundamentals",
        title: "Python Fundamentals",
        topics: ["Intro to Python", "Variables & Data Types", "Type Casting", "Operators", "Conditional Statements", "for/while Loops", "break/continue/pass"],
        why: "Every AI system you will build — data pipelines, training loops, APIs, agents — is expressed as control flow over typed values. If you cannot predict what a loop or a conditional does, you cannot debug a model, a scraper, or a RAG pipeline.",
        objectives: ["Predict the output of short Python programs without running them", "Choose between for and while loops based on the shape of the problem", "Explain what type casting does and when it silently loses information"],
        sessionSpan: "Sessions 1–2",
        skills: ["python"],
      },
      {
        id: "m1-s2-structures-functions",
        title: "Data Structures & Functions",
        topics: ["Lists", "Tuples", "Dictionaries", "Sets", "Functions", "Parameters", "Return Values", "Lambda", "Scope"],
        why: "Datasets are lists of records, model configs are dictionaries, vocabularies are sets, and every reusable piece of ML code is a function. Scope bugs are among the most common causes of silent errors in notebooks.",
        objectives: ["Select the right container (list/tuple/dict/set) by access pattern and mutability", "Write functions with clear parameters and return values", "Explain local vs global scope and predict its effect on a program"],
        sessionSpan: "Sessions 3–4",
        skills: ["python"],
      },
      {
        id: "m1-s3-errors-files",
        title: "Error Handling & File I/O",
        topics: ["Error Handling", "try/except/finally", "Custom Exceptions", "File Handling", "Reading/Writing", "CSV files", "JSON files"],
        why: "Real data arrives as files and real pipelines fail. An engineer who swallows exceptions or cannot read CSV/JSON robustly will ship systems that fail silently in production.",
        objectives: ["Handle specific exceptions without hiding bugs", "Design a custom exception hierarchy for a small application", "Read and write CSV and JSON safely, including encoding and malformed rows"],
        sessionSpan: "Sessions 5–6",
        skills: ["python"],
      },
      {
        id: "m1-s4-algorithms-oop",
        title: "Algorithms & OOP",
        topics: ["Searching Algorithms", "Linear Search", "Binary Search", "Sorting Algorithms", "Bubble Sort", "Recursion", "OOP", "Classes & Objects", "Inheritance", "Polymorphism"],
        why: "Binary search is the first time you feel why complexity matters; recursion is the mental model behind tree traversal and dynamic programming; OOP is how scikit-learn, PyTorch and FastAPI are organised.",
        objectives: ["Trace linear and binary search and state their complexity", "Implement bubble sort and explain why it is O(n²)", "Write a recursive function with a correct base case", "Model a small domain with classes, inheritance and polymorphism"],
        sessionSpan: "Sessions 7–8",
        skills: ["python", "algorithms"],
      },
      {
        id: "m1-s5-advanced-oop-ecosystem",
        title: "Advanced OOP & Python Ecosystem",
        topics: ["Encapsulation", "Abstraction", "Magic Methods", "Python Standard Libraries", "Modules & Packages", "Virtual Environments", "Mini-Project"],
        why: "Encapsulation and abstraction are the difference between a script and maintainable software. Virtual environments and packaging are the first reproducibility tools an ML engineer needs.",
        objectives: ["Explain encapsulation and abstraction with a concrete class design", "Implement __repr__, __eq__, __len__ or __iter__ where appropriate", "Create a reproducible virtual environment and a package structure", "Deliver a Python mini-project with tests"],
        sessionSpan: "Sessions 9–10",
        skills: ["python", "software-engineering"],
      },
    ],
  },
  {
    id: "m2-math-stats",
    title: "Module 2: Math & Statistics",
    statedSessions: 5,
    sections: [
      {
        id: "m2-s1-linear-algebra",
        title: "Linear Algebra",
        topics: ["Scalars", "Vectors", "Matrices", "Tensors", "Matrix Operations & Multiplication", "Determinants"],
        why: "A dataset is a matrix. A layer of a neural network is a matrix multiplication. Embeddings are vectors. If matrices are not intuitive, every later topic becomes memorisation instead of understanding.",
        objectives: ["Describe data, weights and activations as scalars, vectors, matrices and tensors", "Compute matrix products by hand for small cases and explain shape rules", "Interpret the determinant geometrically"],
        sessionSpan: "Session 1",
        skills: ["linear-algebra"],
      },
      {
        id: "m2-s2-linear-algebra-advanced",
        title: "Linear Algebra Advanced",
        topics: ["Eigenvalues", "Eigenvectors", "Matrix Inverse", "Vector Operations", "Dot Product", "Cross Product", "Norms"],
        why: "PCA is eigenvectors. Attention is dot products. Regularisation is norms. Convergence of gradient descent depends on eigenvalues of the Hessian.",
        objectives: ["Compute eigenvalues/eigenvectors of a 2×2 matrix and explain what they mean", "Explain when a matrix is invertible and why that matters for least squares", "Use dot products as similarity and norms as length/penalty"],
        sessionSpan: "Session 2",
        skills: ["linear-algebra"],
      },
      {
        id: "m2-s3-calculus-optimization",
        title: "Calculus, Optimization",
        topics: ["Differentiation", "Partial Derivatives", "Chain Rule", "Gradient Descent", "Optimization Concepts"],
        why: "Training a model is minimising a loss. Backpropagation is the chain rule applied systematically. Without derivatives you cannot reason about why training diverges or stalls.",
        objectives: ["Differentiate common functions and compose them with the chain rule", "Compute partial derivatives and assemble a gradient", "Run gradient descent by hand for a quadratic and explain the learning-rate trade-off"],
        sessionSpan: "Session 3",
        skills: ["calculus", "optimization"],
      },
      {
        id: "m2-s4-statistics",
        title: "Statistics",
        topics: ["Population vs Sample", "Mean", "Median", "Mode", "Variance", "Standard Deviation", "IQR", "Distributions", "Skewness", "Kurtosis"],
        why: "Every EDA, every feature scaler, every outlier rule and every evaluation metric rests on descriptive statistics. Mistaking a sample for a population is how leakage and over-confidence begin.",
        objectives: ["Distinguish population parameters from sample statistics", "Choose mean vs median vs mode given a distribution's shape", "Interpret variance, standard deviation, IQR, skewness and kurtosis on real data"],
        sessionSpan: "Session 4",
        skills: ["statistics"],
      },
      {
        id: "m2-s5-probability",
        title: "Probability",
        topics: ["Probability Basics", "Conditional Probability", "Joint Probability", "Bayes", "Likelihood", "Correlation", "Covariance"],
        why: "Machine learning is reasoning under uncertainty. Logistic regression outputs probabilities, Naive Bayes is Bayes' rule, and maximum likelihood is the principle behind most loss functions.",
        objectives: ["Compute conditional and joint probabilities from a table", "Apply Bayes' rule to a diagnostic-test problem and explain base rates", "Distinguish likelihood from probability", "Interpret covariance and correlation and their limits"],
        sessionSpan: "Session 5",
        skills: ["probability", "statistics"],
      },
    ],
  },
  {
    id: "m3-data-analysis",
    title: "Module 3: Data Analysis with Python",
    statedSessions: 10,
    sessionNote: "10 sessions distributed across 5 sections (2 sessions each). No topic removed.",
    sections: [
      {
        id: "m3-s1-numpy-foundations",
        title: "NumPy Foundations",
        topics: ["Arrays", "N-D Arrays", "Indexing & Slicing", "Reshaping"],
        why: "NumPy arrays are the memory model behind pandas, scikit-learn, TensorFlow and PyTorch tensors. Shape errors are the most common deep-learning bug, and they begin here.",
        objectives: ["Create and inspect N-dimensional arrays", "Predict the result of indexing, slicing and boolean masks", "Reshape arrays and explain when reshape is free vs copying"],
        sessionSpan: "Sessions 1–2",
        skills: ["numpy"],
      },
      {
        id: "m3-s2-numpy-performance-inference-pandas",
        title: "NumPy Performance + Inferential Statistics + Pandas Intro",
        topics: ["Broadcasting", "Strides", "Vectorized Operations", "Math Operations", "Random Module", "Performance Optimization", "Hypothesis Testing", "A/B Testing", "Z-Score", "T-Test", "P-Value", "Confidence Intervals", "ANOVA", "Pandas DataFrames", "Pandas Series"],
        why: "Vectorisation is why Python can train models at all. Hypothesis testing is how you decide whether a model improvement is real or noise. Pandas is where every tabular project starts.",
        objectives: ["Explain broadcasting rules and strides", "Replace a Python loop with a vectorised expression and measure the difference", "Run and interpret z-tests, t-tests, confidence intervals and ANOVA, including what a p-value is not", "Construct and index DataFrames and Series"],
        sessionSpan: "Sessions 3–4",
        skills: ["numpy", "statistics", "pandas"],
      },
      {
        id: "m3-s3-pandas-wrangling",
        title: "Pandas Data Wrangling",
        topics: ["Reading CSV", "Reading Excel", "Reading JSON", "Reading SQL", "Filtering", "Sorting", "GroupBy", "Aggregation", "Joins", "Merge", "Missing Values", "Outliers", "Feature Engineering", "EDA Workflow"],
        why: "Most of an ML engineer's time is spent here. Joins that silently duplicate rows and missing-value strategies that leak the target are the real sources of bad models.",
        objectives: ["Load data from CSV, Excel, JSON and SQL", "Filter, sort, group, aggregate, join and merge correctly, checking row counts", "Handle missing values and outliers with justified strategies", "Engineer features and run a repeatable EDA workflow"],
        sessionSpan: "Sessions 5–6",
        skills: ["pandas", "data-analysis"],
      },
      {
        id: "m3-s4-visualization",
        title: "Data Visualization",
        topics: ["Matplotlib", "Line", "Bar", "Histogram", "Scatter", "Seaborn", "Heatmaps", "Pairplots", "Distribution Plots", "Plotly", "Interactive Dashboards", "Interactive Charts", "Choosing the Right Chart", "Data Storytelling"],
        why: "A chart is an argument. Choosing the wrong chart hides the pattern you need and persuades stakeholders of the wrong decision.",
        objectives: ["Produce line, bar, histogram and scatter plots with correct labelling", "Use heatmaps, pairplots and distribution plots to find structure", "Build an interactive Plotly chart/dashboard", "Choose the chart for the question and narrate an insight"],
        sessionSpan: "Sessions 7–8",
        skills: ["visualization", "data-analysis"],
      },
      {
        id: "m3-s5-eda-capstone",
        title: "EDA Capstone",
        topics: ["Real-world dataset", "Full analysis pipeline", "Load", "Clean", "Analyze", "Visualization & insights presentation", "Best Practices", "Code Review"],
        why: "This is the first artifact a recruiter can read. A clean, reviewed EDA on real data is portfolio evidence; a tutorial notebook is not.",
        objectives: ["Run a complete load → clean → analyse → visualise pipeline on a real public dataset", "Present insights with explicit uncertainty", "Pass a code review against a checklist"],
        sessionSpan: "Sessions 9–10",
        skills: ["data-analysis", "communication"],
      },
    ],
  },
  {
    id: "m4-excel-powerbi",
    title: "Module 4: Excel & Power BI",
    statedSessions: 4,
    sessionNote: "4 sessions: 2 for Excel, 2 for Power BI. Classified as Business/Data Analytics Extension; kept in full.",
    sections: [
      {
        id: "m4-s1-excel",
        title: "Excel for Data Analysis",
        topics: ["Functions & Formulas", "VLOOKUP", "XLOOKUP", "Pivot Tables", "Power Query", "Charts", "Building Dashboards"],
        why: "Stakeholders live in Excel. An AI engineer who cannot reconcile a model output with a finance team's pivot table loses the argument, regardless of model quality.",
        objectives: ["Use lookup functions and pivot tables to answer business questions", "Clean data with Power Query", "Build a readable dashboard"],
        sessionSpan: "Sessions 1–2",
        skills: ["excel", "business-analytics"],
      },
      {
        id: "m4-s2-power-bi",
        title: "Power BI",
        topics: ["Introduction", "Power Query", "Power Pivot", "Data Modeling", "Relationships", "DAX Formulas", "Dashboards & Reports", "Publishing & Sharing"],
        why: "Power BI teaches dimensional data modelling and measures — the same ideas behind warehouses and dbt — in a tool many employers already use.",
        objectives: ["Model relationships between tables (star schema)", "Write DAX measures", "Publish and share a report with appropriate access"],
        sessionSpan: "Sessions 3–4",
        skills: ["power-bi", "business-analytics", "data-modeling"],
      },
    ],
  },
  {
    id: "m5-databases-de",
    title: "Module 5: Databases & Data Engineering",
    statedSessions: 8,
    sessionNote: "8 sessions distributed across 4 sections (2 sessions each).",
    sections: [
      {
        id: "m5-s1-sql-design",
        title: "SQL & Database Design",
        topics: ["ERD", "Database Design", "Normalization", "SQL Basics", "DDL", "DML", "DQL"],
        why: "Training data, feature stores, evaluation logs and application state all live in databases. Normalisation is how you avoid inconsistent labels.",
        objectives: ["Draw an ERD and normalise to 3NF with justification", "Write DDL, DML and DQL statements", "Explain integrity constraints"],
        sessionSpan: "Sessions 1–2",
        skills: ["sql", "data-modeling"],
      },
      {
        id: "m5-s2-advanced-sql",
        title: "Advanced SQL & Web Scraping",
        topics: ["JOINs", "Subqueries", "Views", "CTEs", "Window Functions", "Stored Procedures", "Query Optimization"],
        why: "Window functions and CTEs are what separate analysts from engineers in interviews; query plans are how you make a feature pipeline run in seconds instead of hours.",
        objectives: ["Write multi-join queries, subqueries, CTEs and window functions", "Create views and stored procedures", "Read a query plan and apply an index to fix a slow query"],
        sessionSpan: "Sessions 3–4",
        skills: ["sql"],
      },
      {
        id: "m5-s3-scraping-de-intro",
        title: "Scraping & Data Engineering Intro",
        topics: ["Advanced SQL Querying Practice", "BeautifulSoup", "Regular Expressions", "Selenium", "Dynamic Websites", "APIs for Data Collection", "Intro to Data Engineering", "Data Warehousing concepts"],
        why: "Models are only as good as the data you can acquire. Scraping, regex and APIs are practical data-acquisition skills; warehousing is how acquired data becomes queryable.",
        objectives: ["Parse HTML with BeautifulSoup and extract structured records", "Write regular expressions for cleaning and extraction", "Automate a dynamic site with Selenium responsibly (robots.txt, terms, rate limits)", "Collect data from a public API with pagination and error handling", "Explain warehouse vs operational database"],
        sessionSpan: "Sessions 5–6",
        skills: ["web-scraping", "regex", "apis", "data-engineering"],
      },
      {
        id: "m5-s4-etl-capstone",
        title: "ETL Pipelines & Capstone",
        topics: ["ETL / ELT Pipelines", "Design", "Tools", "Implementation", "End-to-end pipeline", "Scrape → clean → store → query"],
        why: "An end-to-end pipeline is the first time your work looks like engineering rather than analysis: scheduled, idempotent, tested, and queryable.",
        objectives: ["Design an ETL/ELT pipeline with clear stages and failure handling", "Implement scrape → clean → store → query end-to-end", "Document provenance and reproducibility"],
        sessionSpan: "Sessions 7–8",
        skills: ["data-engineering", "etl", "sql"],
      },
    ],
  },
  {
    id: "m6-machine-learning",
    title: "Module 6: Machine Learning",
    statedSessions: 12,
    sessionNote: "12 sessions distributed across 6 sections (2 sessions each).",
    sections: [
      {
        id: "m6-s1-fundamentals-preprocessing",
        title: "ML Fundamentals & Preprocessing",
        topics: ["Types of ML", "Supervised vs Unsupervised", "Scikit-Learn intro", "Scaling", "Encoding", "Feature Selection", "Imbalanced Data"],
        why: "Most ML failures are preprocessing failures: scaling fitted on the test set, encodings that leak the target, imbalance ignored until deployment.",
        objectives: ["Classify problems as supervised/unsupervised and regression/classification", "Build a scikit-learn pipeline that fits transformers only on training data", "Choose scaling and encoding strategies and explain leakage risks", "Handle imbalanced data and explain the effect on metrics"],
        sessionSpan: "Sessions 1–2",
        skills: ["machine-learning", "scikit-learn"],
      },
      {
        id: "m6-s2-regression",
        title: "Regression Models",
        topics: ["Linear Regression", "Simple Regression", "Multiple Regression", "Evaluation Metrics", "MSE", "R²"],
        why: "Linear regression is the spine of statistical learning: least squares, assumptions, interpretation and evaluation all generalise to neural networks.",
        objectives: ["Fit and interpret simple and multiple linear regression", "Derive the least-squares objective and connect it to MSE", "Interpret R² and explain when it misleads"],
        sessionSpan: "Sessions 3–4",
        skills: ["machine-learning", "statistics"],
      },
      {
        id: "m6-s3-classification",
        title: "Classification Models",
        topics: ["Logistic Regression", "Precision", "Recall", "F1", "ROC-AUC", "Decision Trees", "SVM", "KNN", "Naive Bayes"],
        why: "Choosing the metric is choosing what mistakes you tolerate. A fraud or cancer model with 96% accuracy can be useless; precision/recall trade-offs are an engineering decision.",
        objectives: ["Explain logistic regression as probability + threshold", "Compute precision, recall, F1, ROC-AUC from a confusion matrix", "Compare trees, SVM, KNN and Naive Bayes by assumptions and failure modes", "Select a model and a threshold for a given cost structure"],
        sessionSpan: "Sessions 5–6",
        skills: ["machine-learning", "evaluation"],
      },
      {
        id: "m6-s4-ensembles",
        title: "Ensemble Methods",
        topics: ["Cross-Validation", "Grid Search", "Random Search", "Random Forest", "Bagging", "Boosting", "XGBoost", "CatBoost", "Stacking", "Model Comparison & Selection"],
        why: "Gradient-boosted trees still win most tabular problems in industry. Cross-validation is the only honest way to compare them.",
        objectives: ["Run k-fold cross-validation without leakage", "Tune with grid and random search", "Explain bagging vs boosting and when each helps", "Train XGBoost/CatBoost and a stacked model, then justify the final choice"],
        sessionSpan: "Sessions 7–8",
        skills: ["machine-learning", "evaluation"],
      },
      {
        id: "m6-s5-unsupervised",
        title: "Unsupervised Learning",
        topics: ["K-Means", "DBSCAN", "Hierarchical Clustering", "PCA", "Recommendation Systems", "Apriori Algorithm"],
        why: "Labels are expensive. Clustering, dimensionality reduction and recommendation are how you create value — and find data problems — before labels exist.",
        objectives: ["Run K-Means, DBSCAN and hierarchical clustering and explain their assumptions", "Explain PCA via eigenvectors of the covariance matrix", "Build a simple recommender and run Apriori for association rules"],
        sessionSpan: "Sessions 9–10",
        skills: ["machine-learning", "linear-algebra"],
      },
      {
        id: "m6-s6-ml-capstone",
        title: "ML Capstone",
        topics: ["Problem selection", "Data preparation", "Baseline models", "Tuning", "Evaluation", "Model card", "Presentation"],
        why: "A complete ML project with a baseline, honest evaluation, failure analysis and a model card is exactly what hiring managers ask about in interviews.",
        objectives: ["Frame a problem and select real data", "Establish a baseline before tuning", "Evaluate with appropriate metrics and subgroup failure analysis", "Write a model card and present the decision"],
        sessionSpan: "Sessions 11–12",
        skills: ["machine-learning", "communication", "responsible-ai"],
      },
    ],
  },
  {
    id: "m7-deep-learning",
    title: "Module 7: Deep Learning",
    statedSessions: 16,
    sessionNote: "The original outline split Module 7 into part 1 and part 2 under a duplicated heading; both parts are preserved here as one coherent 16-session Deep Learning program.",
    sections: [
      {
        id: "m7-s1-nn-foundations",
        title: "Neural Networks Foundations",
        topics: ["ANN Architecture", "Backpropagation", "Activation Functions", "Loss Functions", "Optimizers", "SGD", "Adam", "Overfitting", "Dropout", "Early Stopping"],
        why: "Everything from CNNs to LLMs is this: layers, a loss, gradients, an optimiser and regularisation. If you understand this session deeply, later architectures are variations.",
        objectives: ["Describe a feed-forward network as composed functions", "Derive backpropagation for a two-layer network using the chain rule", "Compare activations, losses, SGD and Adam", "Diagnose overfitting and apply dropout and early stopping"],
        sessionSpan: "Sessions 1–3",
        skills: ["deep-learning", "calculus", "optimization"],
      },
      {
        id: "m7-s2-ann-keras",
        title: "Building ANNs with TensorFlow/Keras",
        topics: ["Batch Normalization", "Learning Rate Scheduling", "TensorFlow/Keras intro", "Build and train a full ANN on tabular data", "Hands-on lab"],
        why: "Training dynamics are learned by watching loss curves move. Keras lets you run controlled experiments on batch norm and learning-rate schedules quickly.",
        objectives: ["Explain batch normalisation and learning-rate schedules", "Build, train and evaluate an ANN on tabular data in Keras", "Run a small ablation and report it"],
        sessionSpan: "Sessions 4–5",
        skills: ["deep-learning", "tensorflow"],
      },
      {
        id: "m7-s3-computer-vision",
        title: "Computer Vision",
        topics: ["CNN Architecture", "Filters", "Pooling", "Transfer Learning", "VGG", "ResNet", "EfficientNet", "Fine-tuning practice", "Object Detection", "YOLO architecture", "YOLO inference", "OpenCV", "Image Processing", "Segmentation", "Pose Estimation"],
        why: "Vision is where transfer learning became standard practice. Fine-tuning a pretrained backbone is a daily industrial skill; detection and segmentation are what products actually ship.",
        objectives: ["Explain convolution, filters and pooling and compute output shapes", "Fine-tune VGG/ResNet/EfficientNet on a small dataset", "Run YOLO inference and describe its architecture", "Use OpenCV for preprocessing; describe segmentation and pose estimation tasks"],
        sessionSpan: "Sessions 6–8",
        skills: ["computer-vision", "deep-learning"],
      },
      {
        id: "m7-s4-sequence-models",
        title: "Sequence Models & Time Series",
        topics: ["RNN", "LSTM", "GRU", "Theory", "Implementation", "Time Series Forecasting with LSTM", "Real-world dataset lab"],
        why: "Sequences introduce state and time — and the vanishing-gradient problem that motivated LSTMs and, eventually, attention.",
        objectives: ["Explain recurrence, vanishing gradients and gating", "Implement an LSTM/GRU forecaster on a real time series", "Evaluate forecasts without look-ahead leakage"],
        sessionSpan: "Sessions 9–10",
        skills: ["deep-learning", "time-series"],
      },
      {
        id: "m7-s5-nlp-fundamentals",
        title: "NLP Fundamentals",
        topics: ["Text Preprocessing", "Tokenization", "Stop Words", "Stemming", "Lemmatization", "TF-IDF", "N-Grams", "Word2Vec", "Word Embeddings", "Seq2Seq Models", "Summarization", "Translation", "Text Generation"],
        why: "LLMs did not erase classical NLP: tokenisation decides what a model can see, TF-IDF is still a strong baseline, and embeddings are the foundation of retrieval.",
        objectives: ["Build a text preprocessing pipeline and justify each step", "Train a TF-IDF + linear baseline", "Explain Word2Vec and embedding geometry", "Describe seq2seq for summarisation, translation and generation"],
        sessionSpan: "Sessions 11–12",
        skills: ["nlp", "deep-learning"],
      },
      {
        id: "m7-s6-transformers-llms",
        title: "Transformers & LLMs",
        topics: ["Attention Mechanism", "Architecture", "Embeddings", "Tokenizers", "Context Window", "Fine-tuning Types", "LoRA", "QLoRA", "Hugging Face", "Encoder models", "Decoder models", "Encoder-Decoder models", "Prompt Engineering", "RAG", "Vector Databases", "AI Agents", "DL Capstone kickoff"],
        why: "This is the current frontier of the field and the core of the target AI Engineer roles. Attention, context windows, fine-tuning and retrieval must be understood as engineering constraints, not buzzwords.",
        objectives: ["Compute scaled dot-product attention for a tiny example", "Distinguish encoder, decoder and encoder-decoder models by task", "Explain LoRA/QLoRA and when fine-tuning beats prompting or retrieval", "Design a RAG system with a vector database and evaluate grounding", "Decide when an agent is warranted"],
        sessionSpan: "Sessions 13–16",
        skills: ["llm", "nlp", "rag", "agents"],
      },
    ],
  },
  {
    id: "m8-mlops",
    title: "Module 8: Development & MLOps",
    statedSessions: 2,
    sections: [
      {
        id: "m8-s1-deployment-capstone",
        title: "Model Deployment & Final Capstone",
        topics: ["APIs Fundamentals", "FastAPI", "Building and documenting a model API", "Streamlit for ML apps", "Docker Basics", "Containerizing a model", "CI/CD overview", "Final Capstone presentations"],
        why: "A model that only runs in a notebook has no users. APIs, containers and CI/CD are how models become products — and what the target roles explicitly require.",
        objectives: ["Serve a model with FastAPI and document the API", "Build a Streamlit demo", "Containerise the service with Docker", "Explain a CI/CD pipeline and present the final capstone"],
        sessionSpan: "Sessions 1–2",
        skills: ["mlops", "fastapi", "docker", "ci-cd"],
      },
    ],
  },
];

export const ORIGINAL_TOPIC_COUNT = ORIGINAL_MODULES.reduce(
  (acc, m) => acc + m.sections.reduce((a, s) => a + s.topics.length, 0),
  0,
);
