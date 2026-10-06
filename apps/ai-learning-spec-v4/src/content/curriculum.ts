import type { Module, Topic, TopicPriority, NotebookGuidance } from "./types";

// ---------------------------------------------------------------------------
// Canonical curriculum. Original Curriculum Modules 1–8 are preserved verbatim
// (every topic kept). Harvard layers are ADDITIVE mappings with honest
// verification statuses — this is a Harvard-informed self-study curriculum,
// NOT a Harvard degree or credential.
// Harvard mapping verification pass: 2026 (CS50 + Extension AI Certificate
// confirmed against official pages; other identifiers flagged for re-check).
// ---------------------------------------------------------------------------

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function t(name: string, priority: TopicPriority = "core"): Topic {
  return { slug: slugify(name), name, priority };
}

function nb(coreIdea: string, keyItem: string, mistake: string): NotebookGuidance {
  return {
    mustWrite: [
      `${coreIdea} — in your own words, one or two sentences.`,
      keyItem,
      "The meaning of each symbol, parameter, or keyword you met for the first time.",
      "One worked example — its structure, not a transcript.",
      mistake,
      "One sentence: why this exists and when you would reach for it.",
    ],
    recommended: [
      "A connection: what this depends on and what it enables next.",
      "One retrieval question you will ask yourself later.",
    ],
    optional: [
      "Reference details you can always look up (full API signatures, long tables).",
    ],
  };
}

export const MODULES: Module[] = [
  // ========================================================================
  // MODULE 1 — PYTHON PROGRAMMING (Original, 10 sessions)
  // ========================================================================
  {
    slug: "python",
    title: "Module 1 · Python Programming",
    order: 1,
    sourceCategory: "original",
    sessions: 10,
    summary:
      "The programming foundation of the entire pathway: fundamentals, data structures, functions, errors, files, algorithms, and OOP — taught with tracing, writing, debugging, and a mini-project.",
    prerequisites: [],
    parallelWith: ["math-stats"],
    harvardMappings: [
      {
        course: "COMPSCI 50 (CS50)",
        layer: "harvard_college",
        status: "confirmed_current",
        officialUrl: "https://cs50.harvard.edu/college/",
        note: "Confirmed current (Fall 2025 syllabus verified 2026): C → Python → SQL → web, with problem sets and a final project. Adds the C/memory layer and problem-set culture on top of this module.",
      },
      {
        course: "CS51 (Abstraction & Design)",
        layer: "harvard_college",
        status: "likely_not_verified",
        note: "Candidate additive layer for software abstraction/design depth. Re-verify current number and offering before citing as current.",
      },
    ],
    lessons: [
      {
        slug: "python-fundamentals",
        title: "Python Fundamentals",
        moduleSlug: "python",
        order: 1,
        why: "Every model you will ever train, every pipeline you will ever debug, is driven by code. Variables, types, conditionals, and loops are the control surface of everything an AI engineer does.",
        objectives: [
          "Trace and predict the output of programs using variables, casting, and operators.",
          "Write conditionals and loops from a plain-English problem statement.",
          "Explain when break, continue, and pass change control flow — and why.",
        ],
        topics: [
          t("Intro to Python"),
          t("Variables & Data Types"),
          t("Type Casting"),
          t("Operators"),
          t("Conditional Statements"),
          t("for/while Loops"),
          t("break/continue/pass"),
        ],
        notebook: nb(
          "What a variable actually is (a name bound to a value)",
          "The loop patterns: counting loop, accumulator loop, sentinel while-loop.",
          "One tracing mistake you made (e.g., off-by-one, integer vs string comparison)."
        ),
        extraRetrieval: [
          "Without running it, predict: what does `for i in range(3): print(i*2)` output, and why?",
          "Explain the difference between `break` and `continue` using a concrete loop.",
        ],
        transfer: {
          title: "New context: data validation loop",
          prompt:
            "Write (on paper or in your editor) a loop that reads a list of raw strings and counts how many can be cast to a valid float, skipping empty strings with continue and stopping entirely at the value 'END'. You have not seen this exact exercise — reuse the primitives.",
        },
        skills: ["python-core"],
      },
      {
        slug: "python-data-structures-functions",
        title: "Data Structures & Functions",
        moduleSlug: "python",
        order: 2,
        why: "Lists, dicts, and functions are the vocabulary of data work. Choosing the right structure is an engineering decision you will make daily — in pandas, in APIs, in model code.",
        objectives: [
          "Choose between list, tuple, dict, and set for a given access pattern and justify the choice.",
          "Write functions with parameters, returns, defaults, and lambdas.",
          "Explain scope rules and predict what a closure sees.",
        ],
        topics: [
          t("Lists"),
          t("Tuples"),
          t("Dictionaries"),
          t("Sets"),
          t("Functions"),
          t("Parameters"),
          t("Return Values"),
          t("Lambda"),
          t("Scope"),
        ],
        notebook: nb(
          "The decision rule: when list vs tuple vs dict vs set",
          "Function anatomy: signature, parameters, return; one lambda example.",
          "One selection mistake (e.g., using a list where a set made lookup O(1))."
        ),
        transfer: {
          title: "New context: word frequency",
          prompt:
            "Design (structure first, then code) a function that takes raw text and returns the 5 most frequent words, excluding a set of stop words. State which data structure you use at each step and why.",
        },
        skills: ["python-core"],
      },
      {
        slug: "python-errors-files",
        title: "Error Handling & File I/O",
        moduleSlug: "python",
        order: 3,
        why: "Real data arrives in files, and real programs fail. Engineers are judged by how their code behaves when things go wrong — not when they go right.",
        objectives: [
          "Use try/except/finally deliberately, catching specific exceptions only.",
          "Define custom exceptions and explain when they add value.",
          "Read and write text, CSV, and JSON files safely.",
        ],
        topics: [
          t("Error Handling"),
          t("try/except/finally"),
          t("Custom Exceptions"),
          t("File Handling"),
          t("Reading/Writing"),
          t("CSV files"),
          t("JSON files"),
        ],
        notebook: nb(
          "Why catching `Exception` broadly is usually a mistake",
          "The safe-file pattern: `with open(...) as f:` and the CSV/JSON read/write calls.",
          "One failure you produced on purpose and what the traceback told you."
        ),
        transfer: {
          title: "New context: resilient import",
          prompt:
            "Sketch a loader that reads a folder of JSON records where some files are corrupted. It must process every valid file, collect the names of broken ones, and report both — without crashing. Which exceptions do you catch, and where?",
        },
        skills: ["python-core", "debugging"],
      },
      {
        slug: "python-algorithms-oop",
        title: "Algorithms & OOP",
        moduleSlug: "python",
        order: 4,
        why: "Search, sort, and recursion are where you first practice algorithmic reasoning — the skill interviewers test and systems demand. OOP is how real codebases are organized.",
        objectives: [
          "Implement and compare linear vs binary search, stating their complexity.",
          "Trace bubble sort and a recursive function by hand.",
          "Model a small domain with classes, inheritance, and polymorphism.",
        ],
        topics: [
          t("Searching Algorithms"),
          t("Linear Search"),
          t("Binary Search"),
          t("Sorting Algorithms"),
          t("Bubble Sort"),
          t("Recursion"),
          t("OOP"),
          t("Classes & Objects"),
          t("Inheritance"),
          t("Polymorphism"),
        ],
        notebook: nb(
          "Why binary search needs sorted input, and what O(log n) means here",
          "The recursion contract: base case + smaller subproblem; one class diagram.",
          "One recursion trace where you initially lost the call stack."
        ),
        extraRetrieval: [
          "When would you choose linear search over binary search despite worse complexity?",
        ],
        transfer: {
          title: "New context: library catalog",
          prompt:
            "Design classes for a catalog of Books and Magazines sharing a search interface. Then decide: does searching by exact ID justify keeping a sorted list + binary search, or a dict? Defend the trade-off.",
        },
        skills: ["python-core", "algorithms"],
      },
      {
        slug: "python-advanced-oop-ecosystem",
        title: "Advanced OOP & Python Ecosystem",
        moduleSlug: "python",
        order: 5,
        why: "Encapsulation and abstraction are what keep 50,000-line ML codebases maintainable. Virtual environments and packages are the daily hygiene of professional Python work.",
        objectives: [
          "Apply encapsulation and abstraction to hide implementation details behind interfaces.",
          "Use magic methods to make objects integrate with Python syntax.",
          "Create and manage virtual environments, modules, and packages.",
          "Ship the Module 1 mini-project.",
        ],
        topics: [
          t("Encapsulation"),
          t("Abstraction"),
          t("Magic Methods"),
          t("Python Standard Libraries"),
          t("Modules & Packages"),
          t("Virtual Environments"),
          t("Mini-Project"),
        ],
        notebook: nb(
          "Encapsulation vs abstraction — the one-line distinction",
          "The env workflow: create venv → activate → pip install → freeze requirements.",
          "One API design decision from your mini-project and why you made it."
        ),
        transfer: {
          title: "Mini-project (Level 1 ladder entry)",
          prompt:
            "Build a small command-line Python application (your choice of domain) with at least two classes, custom exceptions, file persistence (CSV or JSON), and a README. This is your first portfolio-ladder artifact — record it in Projects.",
        },
        skills: ["python-core", "software-engineering"],
      },
    ],
  },

  // ========================================================================
  // MODULE 2 — MATH & STATISTICS (Original, 5 sessions)
  // ========================================================================
  {
    slug: "math-stats",
    title: "Module 2 · Math & Statistics",
    order: 2,
    sourceCategory: "original",
    sessions: 5,
    summary:
      "Linear algebra, calculus & optimization, statistics, and probability — the mathematical language of machine learning. The Harvard math layer is additive and deeper; nothing here is removed.",
    prerequisites: [],
    parallelWith: ["python"],
    harvardMappings: [
      {
        course: "MATH 21A/21B (Multivariable Calculus / Linear Algebra sequence)",
        layer: "harvard_college",
        status: "likely_not_verified",
        note: "Long-standing Harvard sequence; adds rigor and multivariable depth above this module. Re-verify current numbering/term before citing as current.",
      },
      {
        course: "STAT 110 (Introduction to Probability)",
        layer: "harvard_college",
        status: "confirmed_historical",
        note: "Long-running Harvard probability course (public lectures exist). Adds story proofs, named distributions, and conditioning depth. Re-verify current term offering.",
      },
      {
        course: "APMTH 120 / CS1280 (Applied Math / Convex Optimization)",
        layer: "harvard_college",
        status: "likely_not_verified",
        note: "Candidate optimization depth layer for the advanced phase. Verify current catalog before use.",
      },
    ],
    lessons: [
      {
        slug: "linear-algebra",
        title: "Linear Algebra",
        moduleSlug: "math-stats",
        order: 1,
        why: "Datasets are matrices. Model weights are matrices. A forward pass is matrix multiplication. Without vectors and matrices you can run models but never read them.",
        objectives: [
          "Distinguish scalars, vectors, matrices, and tensors, with shapes.",
          "Multiply matrices by hand for small cases and predict result shapes in general.",
          "Compute 2×2 and 3×3 determinants and state what a zero determinant means.",
        ],
        topics: [
          t("Scalars"),
          t("Vectors"),
          t("Matrices"),
          t("Tensors"),
          t("Matrix Operations & Multiplication"),
          t("Determinants"),
        ],
        notebook: nb(
          "Shape rule for matrix multiplication: (m×n)(n×p) → (m×p)",
          "One hand-worked 2×2 multiplication and one 2×2 determinant.",
          "One shape-mismatch error and how you would catch it in NumPy."
        ),
        extraRetrieval: [
          "Why can a dataset of 1,000 rows and 20 features be treated as a 1000×20 matrix? What does one row mean? One column?",
        ],
        transfer: {
          title: "New context: image as tensor",
          prompt:
            "A 64×64 RGB image enters a model as a tensor. Give its shape, explain what each axis means, and compute the shape after multiplying the flattened image by a weight matrix mapping it to 128 features.",
        },
        skills: ["linear-algebra"],
      },
      {
        slug: "linear-algebra-advanced",
        title: "Linear Algebra Advanced",
        moduleSlug: "math-stats",
        order: 2,
        why: "Eigenvectors explain PCA. Dot products explain similarity search and attention. Norms explain regularization. This is the lesson that later makes embeddings feel obvious.",
        objectives: [
          "Explain eigenvalues/eigenvectors geometrically and verify a given eigenpair.",
          "Compute dot products and interpret them as similarity.",
          "Use L1/L2 norms and explain where each appears in ML.",
        ],
        topics: [
          t("Eigenvalues"),
          t("Eigenvectors"),
          t("Matrix Inverse"),
          t("Vector Operations"),
          t("Dot Product"),
          t("Cross Product"),
          t("Norms"),
        ],
        notebook: nb(
          "Av = λv — what each symbol means and the geometric picture",
          "Dot product as |a||b|cosθ and as a similarity score; L1 vs L2 norm formulas.",
          "One case where a matrix has no inverse and what that implies."
        ),
        transfer: {
          title: "New context: nearest document",
          prompt:
            "Three documents are embedded as vectors. Using dot products and norms (cosine similarity), decide which two are most related — then explain why this exact computation powers vector databases in RAG systems.",
        },
        skills: ["linear-algebra"],
      },
      {
        slug: "calculus-optimization",
        title: "Calculus & Optimization",
        moduleSlug: "math-stats",
        order: 3,
        why: "Training a neural network IS gradient descent. The chain rule IS backpropagation. Learn this once properly and deep learning stops being magic.",
        objectives: [
          "Differentiate standard functions and apply the chain rule confidently.",
          "Compute partial derivatives and assemble a gradient.",
          "Run two steps of gradient descent by hand on a simple loss.",
        ],
        topics: [
          t("Differentiation"),
          t("Partial Derivatives"),
          t("Chain Rule"),
          t("Gradient Descent"),
          t("Optimization Concepts"),
        ],
        notebook: nb(
          "The derivative as instantaneous rate of change / slope",
          "Chain rule d/dx f(g(x)) = f'(g(x))·g'(x); the update rule θ ← θ − α∇L.",
          "One hand-worked gradient-descent step where a too-large α diverged."
        ),
        extraRetrieval: [
          "Why does an AI engineer need derivatives at all? Answer in two sentences before you peek.",
        ],
        transfer: {
          title: "Interleaved problem set",
          prompt:
            "Mixed set — first identify the tool, then solve: (1) d/dx of x·sin(x), (2) d/dx of (3x²+1)⁵, (3) ∂f/∂x of f(x,y)=x²y+y², (4) one gradient-descent step on L(w)=(w−4)² from w=0 with α=0.25. Name the rule before using it.",
        },
        skills: ["calculus-optimization"],
      },
      {
        slug: "statistics",
        title: "Statistics",
        moduleSlug: "math-stats",
        order: 4,
        why: "Every EDA, every A/B test, every 'is this model actually better?' question is statistics. Engineers who skip this ship models that lie.",
        objectives: [
          "Compute and interpret mean, median, mode, variance, SD, and IQR.",
          "Explain population vs sample and why the distinction changes formulas.",
          "Read a distribution's shape: skewness and kurtosis, and what they imply for analysis.",
        ],
        topics: [
          t("Population vs Sample"),
          t("Mean"),
          t("Median"),
          t("Mode"),
          t("Variance"),
          t("Standard Deviation"),
          t("IQR"),
          t("Distributions"),
          t("Skewness"),
          t("Kurtosis"),
        ],
        notebook: nb(
          "When the median beats the mean (and a real example)",
          "Variance and SD formulas, sample vs population versions, IQR rule for outliers.",
          "One dataset where skewness changed which summary statistic you trusted."
        ),
        transfer: {
          title: "New context: salary report",
          prompt:
            "A company reports 'average salary $95k' but most employees earn near $55k. Explain what distribution shape produces this, which statistics you would report instead, and how you would detect it with IQR.",
        },
        skills: ["statistics"],
      },
      {
        slug: "probability",
        title: "Probability",
        moduleSlug: "math-stats",
        order: 5,
        why: "Models output probabilities, not truths. Bayes' rule is the backbone of spam filters, medical screening logic, and the way you should reason about model errors.",
        objectives: [
          "Compute conditional and joint probabilities from tables and trees.",
          "Apply Bayes' theorem to a realistic diagnostic problem.",
          "Distinguish correlation from covariance and both from causation.",
        ],
        topics: [
          t("Probability Basics"),
          t("Conditional Probability"),
          t("Joint Probability"),
          t("Bayes"),
          t("Likelihood"),
          t("Correlation"),
          t("Covariance"),
        ],
        notebook: nb(
          "P(A|B) ≠ P(B|A) — and the classic example proving it",
          "Bayes' theorem with each term named (prior, likelihood, posterior, evidence).",
          "One Bayes calculation where the base rate surprised you."
        ),
        transfer: {
          title: "Case: screening test",
          prompt:
            "A disease affects 1 in 1,000 people. A test is 99% sensitive and 95% specific. A patient tests positive. Compute the probability they actually have the disease, then explain why this matters for how you evaluate rare-class ML classifiers.",
        },
        caseStudy: {
          title: "Why uncertainty matters to AI",
          prompt:
            "Your fraud model outputs 0.93 for a transaction. Explain to a non-technical stakeholder what that number does and does not mean, and what threshold decision you would make given asymmetric costs.",
        },
        skills: ["probability", "statistics"],
      },
    ],
  },

  // ========================================================================
  // MODULE 3 — DATA ANALYSIS WITH PYTHON (Original, 10 sessions)
  // ========================================================================
  {
    slug: "data-analysis",
    title: "Module 3 · Data Analysis with Python",
    order: 3,
    sourceCategory: "original",
    sessions: 10,
    sessionNote:
      "Original outline lists 10 sessions across 5 numbered sections. All material preserved; each section spans roughly two sessions in practice. Nothing deleted.",
    summary:
      "NumPy, inferential statistics, pandas wrangling, visualization, and a full EDA capstone on a real-world dataset.",
    prerequisites: ["python", "math-stats"],
    harvardMappings: [
      {
        course: "CS109A / Data Science 1 (variants)",
        layer: "harvard_college",
        status: "likely_not_verified",
        note: "Harvard's data-science course family adds statistical-learning framing, messy-data discipline, and communication emphasis. Verify current numbering/offering.",
      },
    ],
    lessons: [
      {
        slug: "numpy-foundations",
        title: "NumPy Foundations",
        moduleSlug: "data-analysis",
        order: 1,
        why: "NumPy is the numerical engine beneath pandas, scikit-learn, and even parts of deep-learning tooling. Arrays and shapes are the first systems-level idea in your data career.",
        objectives: [
          "Create and manipulate N-dimensional arrays with correct dtypes.",
          "Index and slice arrays (including boolean masks) without loops.",
          "Reshape arrays and predict shapes before running code.",
        ],
        topics: [t("Arrays"), t("N-D Arrays"), t("Indexing & Slicing"), t("Reshaping")],
        notebook: nb(
          "Why vectorized array math beats Python loops (what happens under the hood)",
          "Slicing grammar a[start:stop:step] and boolean masking a[a > 0].",
          "One reshape error (-1 misuse or incompatible size) and the fix."
        ),
        transfer: {
          title: "New context: sensor grid",
          prompt:
            "You receive 24 hourly readings from 6 sensors as a flat list of 144 numbers. Reshape into (sensors, hours), extract sensor 3's night hours (0–6), and zero-out all negative readings — all without a Python loop.",
        },
        skills: ["numpy-pandas"],
      },
      {
        slug: "numpy-performance-inference-pandas",
        title: "NumPy Performance, Inferential Statistics & Pandas Intro",
        moduleSlug: "data-analysis",
        order: 2,
        why: "Broadcasting is how real numerical code stays fast and readable; hypothesis testing is how analysts avoid shipping noise as insight. This session joins computation and inference.",
        objectives: [
          "Apply broadcasting rules and explain strides at a conceptual level.",
          "Run and interpret z-tests, t-tests, and ANOVA, reporting p-values and confidence intervals honestly.",
          "Create pandas Series and DataFrames and explain their relationship to NumPy.",
        ],
        topics: [
          t("Broadcasting"),
          t("Strides", "advanced"),
          t("Vectorized Operations"),
          t("Math Operations"),
          t("Random Module"),
          t("Performance Optimization", "support"),
          t("Hypothesis Testing"),
          t("A/B Testing"),
          t("Z-Score"),
          t("T-Test"),
          t("P-Value"),
          t("Confidence Intervals"),
          t("ANOVA", "support"),
          t("Pandas DataFrames"),
          t("Pandas Series"),
        ],
        notebook: nb(
          "What a p-value is — and the two most common misreadings of it",
          "Broadcasting rule (align trailing dims; stretch size-1); t-test decision template.",
          "One A/B test conclusion you initially over-claimed, corrected."
        ),
        transfer: {
          title: "Case: checkout experiment",
          prompt:
            "An A/B test shows conversion 3.1% vs 3.4% with p = 0.06. The product manager wants to ship. Write your recommendation: what does p = 0.06 license you to say, what else do you need (effect size, CI, sample size), and what would change your mind?",
        },
        skills: ["numpy-pandas", "statistics"],
      },
      {
        slug: "pandas-wrangling",
        title: "Pandas Data Wrangling",
        moduleSlug: "data-analysis",
        order: 3,
        why: "Practitioners spend most of their time here. Joins, groupbys, missing values, and leakage-safe feature engineering separate working analysts from notebook tourists.",
        objectives: [
          "Load CSV, Excel, JSON, and SQL data into DataFrames.",
          "Filter, sort, group, aggregate, join, and merge confidently.",
          "Handle missing values and outliers with documented justification.",
          "Run a disciplined EDA workflow end to end.",
        ],
        topics: [
          t("Reading CSV"),
          t("Reading Excel"),
          t("Reading JSON"),
          t("Reading SQL"),
          t("Filtering"),
          t("Sorting"),
          t("GroupBy"),
          t("Aggregation"),
          t("Joins"),
          t("Merge"),
          t("Missing Values"),
          t("Outliers"),
          t("Feature Engineering"),
          t("EDA Workflow"),
        ],
        notebook: nb(
          "The groupby mental model: split → apply → combine",
          "Join types (inner/left/right/outer) with a two-table sketch; missing-value decision tree (drop vs impute vs flag).",
          "One silent bug (e.g., a join that duplicated rows) and how row counts exposed it."
        ),
        transfer: {
          title: "New context: messy orders",
          prompt:
            "Given an orders table and a customers table where 4% of orders have no matching customer and revenue has nulls and negative returns: produce monthly revenue per region. List every cleaning decision and its justification before writing code.",
        },
        skills: ["numpy-pandas", "eda"],
      },
      {
        slug: "data-visualization",
        title: "Data Visualization",
        moduleSlug: "data-analysis",
        order: 4,
        why: "A model nobody understands doesn't ship. Visualization is how engineers reason about data and how they persuade stakeholders — chart choice is an argument, not decoration.",
        objectives: [
          "Build line, bar, histogram, and scatter plots in Matplotlib.",
          "Use Seaborn heatmaps, pairplots, and distribution plots for EDA.",
          "Create interactive Plotly charts and know when interactivity earns its cost.",
          "Choose the right chart for the question and tell a truthful data story.",
        ],
        topics: [
          t("Matplotlib"),
          t("Line"),
          t("Bar"),
          t("Histogram"),
          t("Scatter"),
          t("Seaborn"),
          t("Heatmaps"),
          t("Pairplots"),
          t("Distribution Plots"),
          t("Plotly", "industry_extension"),
          t("Interactive Dashboards", "industry_extension"),
          t("Interactive Charts", "industry_extension"),
          t("Choosing the Right Chart"),
          t("Data Storytelling"),
        ],
        notebook: nb(
          "The chart-choice table: comparison → bar, trend → line, distribution → histogram, relationship → scatter",
          "The anatomy of an honest chart: labeled axes, baseline choice, no truncated-axis tricks.",
          "One chart you rebuilt because the first version misled."
        ),
        transfer: {
          title: "Case: one chart, one decision",
          prompt:
            "You must convince a stakeholder that weekend support tickets spike. You get ONE chart. Choose the type, the aggregation, the axis baseline, and the single sentence caption — and justify each choice.",
        },
        skills: ["visualization", "communication"],
      },
      {
        slug: "eda-capstone",
        title: "EDA Capstone",
        moduleSlug: "data-analysis",
        order: 5,
        why: "This is your first end-to-end artifact: real-world dataset in, defensible insights out. It becomes Level-2 evidence on your project ladder.",
        objectives: [
          "Execute the full pipeline: load → clean → analyze → visualize → present insights.",
          "Apply best practices and survive a code review.",
        ],
        topics: [
          t("Real-world dataset"),
          t("Full analysis pipeline"),
          t("Load"),
          t("Clean"),
          t("Analyze"),
          t("Visualization & insights presentation"),
          t("Best Practices"),
          t("Code Review"),
        ],
        notebook: nb(
          "Your dataset's provenance: source, license, acquisition date, known limitations",
          "Your three strongest findings, each tied to specific evidence in the data.",
          "The one analysis path you abandoned and why."
        ),
        transfer: {
          title: "EDA Capstone (Level 2 ladder)",
          prompt:
            "Pick a real public dataset (document source + license), run the full EDA pipeline, and produce a notebook + short written insight report. Register it in Projects (Uber Data Analysis, Superstore, HR Dashboard, or Bank Loan Analysis from the catalog are canonical choices).",
        },
        skills: ["eda", "communication"],
      },
    ],
  },

  // ========================================================================
  // MODULE 4 — EXCEL & POWER BI (Original, 4 sessions, Business/Analytics layer)
  // ========================================================================
  {
    slug: "excel-powerbi",
    title: "Module 4 · Excel & Power BI",
    order: 4,
    sourceCategory: "original",
    sessions: 4,
    sessionNote:
      "Original outline groups this content into 4 sessions across 2 sections. Preserved as the explicit Business/Data-Analytics practical layer — not claimed as Harvard AI core.",
    summary:
      "Excel analysis (lookups, pivots, Power Query, dashboards) and Power BI (modeling, DAX, reports, publishing). An industry analytics layer an AI engineer meets in almost every business context.",
    prerequisites: ["data-analysis"],
    harvardMappings: [
      {
        course: "No Harvard core equivalent claimed",
        layer: "harvard_college",
        status: "design_decision",
        note: "Deliberately kept as Industry/Business Analytics extension. Harvard AI coursework does not center these tools; they remain because real jobs and clients do.",
      },
    ],
    lessons: [
      {
        slug: "excel-for-data-analysis",
        title: "Excel for Data Analysis",
        moduleSlug: "excel-powerbi",
        order: 1,
        why: "Excel is still the lingua franca of business data. Clients and stakeholders will hand you spreadsheets; fluency here is professional credibility, not nostalgia.",
        objectives: [
          "Use core functions, VLOOKUP/XLOOKUP, and pivot tables on real data.",
          "Clean data with Power Query and build a working dashboard.",
        ],
        topics: [
          t("Functions & Formulas", "industry_extension"),
          t("VLOOKUP", "industry_extension"),
          t("XLOOKUP", "industry_extension"),
          t("Pivot Tables", "industry_extension"),
          t("Power Query", "industry_extension"),
          t("Charts", "industry_extension"),
          t("Building Dashboards", "industry_extension"),
        ],
        notebook: nb(
          "When Excel is the right tool (and when it stops being one)",
          "XLOOKUP syntax vs VLOOKUP limitations; pivot-table field layout sketch.",
          "One lookup error (#N/A cascade) and its root cause."
        ),
        transfer: {
          title: "New context: ad-hoc client file",
          prompt:
            "A client sends monthly sales in 12 inconsistent sheets. Outline a Power Query flow that consolidates them, then a pivot + chart answering 'which product line is slowing?' — and state at what data size you would move this workflow to Python/SQL instead.",
        },
        skills: ["business-analytics"],
      },
      {
        slug: "power-bi",
        title: "Power BI",
        moduleSlug: "excel-powerbi",
        order: 2,
        why: "BI dashboards are how organizations consume analytics daily. Data modeling and DAX teach you dimensional thinking you will reuse in warehouses and metrics layers.",
        objectives: [
          "Model data with relationships in Power Pivot and write core DAX measures.",
          "Build, publish, and share a multi-page report.",
        ],
        topics: [
          t("Introduction", "industry_extension"),
          t("Power Query", "industry_extension"),
          t("Power Pivot", "industry_extension"),
          t("Data Modeling", "industry_extension"),
          t("Relationships", "industry_extension"),
          t("DAX Formulas", "industry_extension"),
          t("Dashboards & Reports", "industry_extension"),
          t("Publishing & Sharing", "industry_extension"),
        ],
        notebook: nb(
          "Star schema in one sketch: fact table + dimension tables",
          "Two DAX measures you wrote (e.g., YoY growth) with each function's role.",
          "One relationship direction mistake and the wrong totals it caused."
        ),
        transfer: {
          title: "New context: HR dashboard",
          prompt:
            "Design the data model (facts, dimensions, relationships) for the HR Dashboard catalog project before opening Power BI. Then specify three DAX measures leadership would actually use.",
        },
        skills: ["business-analytics", "communication"],
      },
    ],
  },

  // ========================================================================
  // MODULE 5 — DATABASES & DATA ENGINEERING (Original, 8 sessions)
  // ========================================================================
  {
    slug: "databases-data-engineering",
    title: "Module 5 · Databases & Data Engineering",
    order: 5,
    sourceCategory: "original",
    sessions: 8,
    sessionNote:
      "Original outline lists 8 sessions across 4 sections. All topics preserved; sections span multiple sessions.",
    summary:
      "SQL and database design through advanced querying, web scraping, data collection APIs, and ETL/ELT pipelines ending in an end-to-end scrape → clean → store → query build.",
    prerequisites: ["python"],
    parallelWith: ["data-analysis"],
    harvardMappings: [
      {
        course: "CS50 SQL track / CS1650-style Data Systems",
        layer: "harvard_college",
        status: "likely_not_verified",
        note: "CS50 includes SQL (confirmed current). Deeper data-systems coursework (query optimization, concurrency, recovery, distributed systems) is a candidate advanced layer — verify current identifiers.",
      },
    ],
    lessons: [
      {
        slug: "sql-database-design",
        title: "SQL & Database Design",
        moduleSlug: "databases-data-engineering",
        order: 1,
        why: "Nearly every production AI system sits beside a relational database. Schema design decisions outlive models by years — learn to make them deliberately.",
        objectives: [
          "Design an ERD and normalize it to a defensible form.",
          "Write DDL, DML, and DQL confidently.",
        ],
        topics: [
          t("ERD"),
          t("Database Design"),
          t("Normalization"),
          t("SQL Basics"),
          t("DDL"),
          t("DML"),
          t("DQL"),
        ],
        notebook: nb(
          "Normalization in plain words: one fact, one place",
          "The DDL/DML/DQL verb table (CREATE/ALTER · INSERT/UPDATE/DELETE · SELECT).",
          "One redundancy bug your first schema allowed, fixed by normalizing."
        ),
        transfer: {
          title: "New context: clinic bookings",
          prompt:
            "Design the schema (ERD + CREATE TABLE statements) for a clinic with doctors, patients, appointments, and treatments. Identify one deliberate denormalization you might accept and the cost it carries.",
        },
        skills: ["sql"],
      },
      {
        slug: "advanced-sql",
        title: "Advanced SQL & Query Craft",
        moduleSlug: "databases-data-engineering",
        order: 2,
        why: "JOINs, CTEs, and window functions are the difference between asking the database questions and torturing it. They are also the single most-tested skill in data interviews.",
        objectives: [
          "Compose multi-join queries with subqueries, views, and CTEs.",
          "Use window functions for rankings and running aggregates.",
          "Reason about stored procedures and query optimization basics.",
        ],
        topics: [
          t("JOINs"),
          t("Subqueries"),
          t("Views"),
          t("CTEs"),
          t("Window Functions"),
          t("Stored Procedures", "support"),
          t("Query Optimization"),
        ],
        notebook: nb(
          "Window function vs GROUP BY — the row-preservation distinction",
          "The CTE pattern for readable multi-step queries; one ROW_NUMBER/PARTITION BY example.",
          "One slow query and the specific reason it was slow (missing index, exploding join...)."
        ),
        extraRetrieval: [
          "Explain verbally: why might this query be slow — SELECT * FROM orders o JOIN events e ON e.user_id = o.user_id WHERE DATE(e.created_at) = '2026-01-01'?",
        ],
        transfer: {
          title: "New context: retention query",
          prompt:
            "Using a users and orders table, write a query returning each user's first order date, their order rank per month, and a 7-day running revenue total — using CTEs and window functions. Then state which index you would add and why.",
        },
        skills: ["sql"],
      },
      {
        slug: "scraping-data-collection",
        title: "Scraping & Data Engineering Intro",
        moduleSlug: "databases-data-engineering",
        order: 3,
        why: "Real projects start with acquiring data lawfully: APIs first, scraping where permitted. This is a practical data-acquisition craft — classified as industry skill, not inflated into academia.",
        objectives: [
          "Practice advanced SQL querying on realistic schemas.",
          "Extract data with BeautifulSoup and regex; automate dynamic pages with Selenium where terms permit.",
          "Prefer and consume official APIs for collection; explain warehousing concepts.",
        ],
        topics: [
          t("Advanced SQL Querying Practice"),
          t("BeautifulSoup", "industry_extension"),
          t("Regular Expressions"),
          t("Selenium", "industry_extension"),
          t("Dynamic Websites", "industry_extension"),
          t("APIs for Data Collection"),
          t("Intro to Data Engineering"),
          t("Data Warehousing concepts"),
        ],
        notebook: nb(
          "The acquisition ladder: official API → licensed dataset → permitted scraping (check terms, robots, rate limits)",
          "A regex cheat-line for the three patterns you actually used; warehouse vs OLTP one-liner.",
          "One brittle selector that broke and the more robust strategy that replaced it."
        ),
        transfer: {
          title: "New context: acquisition plan",
          prompt:
            "You need historical weather + public event data for a demand model. Write the acquisition plan: sources, legality check, API vs scrape decision, rate limiting, storage format, and provenance records — before any code.",
        },
        skills: ["data-engineering", "sql"],
      },
      {
        slug: "etl-pipelines-capstone",
        title: "ETL Pipelines & Capstone",
        moduleSlug: "databases-data-engineering",
        order: 4,
        why: "Pipelines are where data engineering becomes engineering: idempotency, failure handling, and reproducibility. This capstone is Level-3 ladder evidence.",
        objectives: [
          "Design and implement an ETL/ELT pipeline with clear stage contracts.",
          "Ship the end-to-end build: scrape/collect → clean → store → query.",
        ],
        topics: [
          t("ETL / ELT Pipelines"),
          t("Design"),
          t("Tools"),
          t("Implementation"),
          t("End-to-end pipeline"),
          t("Scrape → clean → store → query"),
        ],
        notebook: nb(
          "ETL vs ELT — where transformation lives and why it moved",
          "Your pipeline's stage diagram with the failure behavior of each stage.",
          "One idempotency bug (double-insert on retry) and the fix."
        ),
        transfer: {
          title: "Pipeline Capstone (Level 3 ladder)",
          prompt:
            "Build the end-to-end pipeline: collect real public data (API-first), clean it, load into SQL, and expose three analytical queries. Document provenance, schedule logic, and failure handling. Register as the Sales Database or an equivalent catalog project.",
        },
        skills: ["data-engineering", "sql"],
      },
    ],
  },

  // ========================================================================
  // MODULE 6 — MACHINE LEARNING (Original, 12 sessions)
  // ========================================================================
  {
    slug: "machine-learning",
    title: "Module 6 · Machine Learning",
    order: 6,
    sourceCategory: "original",
    sessions: 12,
    summary:
      "Classical ML end to end: preprocessing, regression, classification, ensembles, unsupervised learning, and a capstone with a model card. Harvard ML theory is additive on top.",
    prerequisites: ["data-analysis", "math-stats"],
    harvardMappings: [
      {
        course: "CS181 / CS1810 (Machine Learning)",
        layer: "harvard_college",
        status: "likely_not_verified",
        note: "Harvard's core ML course family adds probabilistic foundations, derivations, and theory depth (bias–variance, graphical models). Verify current number/title before citing.",
      },
      {
        course: "AI Graduate Certificate — 'advanced NLP and machine learning' category",
        layer: "harvard_extension",
        status: "confirmed_current",
        officialUrl:
          "https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/",
        note: "Confirmed current (verified 2026): certificate requires 1 foundations course, 1 advanced NLP/ML course, 1 deep learning & CV course, 1 AI ethics/governance/law course.",
      },
    ],
    lessons: [
      {
        slug: "ml-fundamentals-preprocessing",
        title: "ML Fundamentals & Preprocessing",
        moduleSlug: "machine-learning",
        order: 1,
        why: "Most real-world model failures are data failures. Scaling, encoding, and leakage-safe preprocessing decide model quality before any algorithm runs.",
        objectives: [
          "Distinguish supervised vs unsupervised framing for a given problem.",
          "Build leakage-safe preprocessing: scaling, encoding, feature selection.",
          "Handle imbalanced data with justified technique choices.",
        ],
        topics: [
          t("Types of ML"),
          t("Supervised vs Unsupervised"),
          t("Scikit-Learn intro"),
          t("Scaling"),
          t("Encoding"),
          t("Feature Selection"),
          t("Imbalanced Data"),
        ],
        notebook: nb(
          "Data leakage: the definition and the fit-on-train-only rule",
          "The preprocessing decision table: standardize vs min-max; one-hot vs ordinal; when SMOTE/class weights.",
          "One leakage mistake (scaling before split) and its inflated metric."
        ),
        transfer: {
          title: "New context: churn setup",
          prompt:
            "Given a churn dataset with 4% positives, mixed numeric/categorical features, and a signup_date column: specify the full preprocessing pipeline, the split strategy, and two leakage risks specific to this data.",
        },
        skills: ["classical-ml"],
      },
      {
        slug: "regression-models",
        title: "Regression Models",
        moduleSlug: "machine-learning",
        order: 2,
        why: "Linear regression is the layered concept of the whole curriculum: practical in sklearn, statistical in its assumptions, mathematical in its derivation, and the ancestor of every neural network.",
        objectives: [
          "Fit simple and multiple regression and interpret coefficients.",
          "Evaluate with MSE and R² and explain what each misses.",
          "Connect the loss-minimization view to gradient descent from Module 2.",
        ],
        topics: [
          t("Linear Regression"),
          t("Simple Regression"),
          t("Multiple Regression"),
          t("Evaluation Metrics"),
          t("MSE"),
          t("R²"),
        ],
        notebook: nb(
          "What a coefficient means (holding other features constant) and when that reading breaks",
          "MSE and R² formulas with the one-line intuition for each.",
          "One case where high R² hid a residual pattern."
        ),
        extraRetrieval: [
          "Layered depth check: explain linear regression (1) as an sklearn user, (2) statistically, (3) as an optimization problem. Three different answers.",
        ],
        transfer: {
          title: "New context: pricing residuals",
          prompt:
            "Your house-price model has R² = 0.84 but systematically underprices large houses. Diagnose: what residual plot reveals this, what feature engineering fixes it, and why R² alone never told you.",
        },
        skills: ["classical-ml", "statistics"],
      },
      {
        slug: "classification-models",
        title: "Classification Models",
        moduleSlug: "machine-learning",
        order: 3,
        why: "Choosing a classifier and its metric is an engineering judgment call with real consequences — a fraud model and a spam filter should never be graded the same way.",
        objectives: [
          "Train logistic regression, trees, SVM, KNN, and Naive Bayes.",
          "Choose between precision, recall, F1, and ROC-AUC per context.",
          "Explain verbally when KNN beats SVM and vice versa.",
        ],
        topics: [
          t("Logistic Regression"),
          t("Precision"),
          t("Recall"),
          t("F1"),
          t("ROC-AUC"),
          t("Decision Trees"),
          t("SVM"),
          t("KNN"),
          t("Naive Bayes"),
        ],
        notebook: nb(
          "The precision/recall trade-off with one domain where each dominates",
          "The confusion-matrix sketch with all four cells labeled by a concrete example.",
          "One threshold decision where accuracy was the wrong metric."
        ),
        transfer: {
          title: "Case: 96% accuracy, dangerous model",
          prompt:
            "A medical triage model reports 96% accuracy but misses many critical cases (high false negatives). Is the model good? Choose the right metric, propose threshold/data/model changes, and design the test that validates your decision. Defend it with evidence.",
        },
        skills: ["classical-ml", "evaluation"],
      },
      {
        slug: "ensemble-methods",
        title: "Ensemble Methods",
        moduleSlug: "machine-learning",
        order: 4,
        why: "Gradient-boosted trees still win on most tabular problems in industry. Knowing why ensembles work — and how to tune them honestly — is bread-and-butter engineering.",
        objectives: [
          "Use cross-validation with grid and random search without leaking.",
          "Explain bagging vs boosting and when each helps.",
          "Compare Random Forest, XGBoost, CatBoost, and stacking on one problem.",
        ],
        topics: [
          t("Cross-Validation"),
          t("Grid Search"),
          t("Random Search"),
          t("Random Forest"),
          t("Bagging"),
          t("Boosting"),
          t("XGBoost"),
          t("CatBoost"),
          t("Stacking", "advanced"),
          t("Model Comparison & Selection"),
        ],
        notebook: nb(
          "Bagging reduces variance, boosting reduces bias — with the mechanism for each",
          "The CV + search loop diagram showing exactly where the test set is never touched.",
          "One tuning run that overfit the validation folds and how you detected it."
        ),
        transfer: {
          title: "New context: model bake-off",
          prompt:
            "Design a fair comparison protocol for RF vs XGBoost vs logistic regression on the Bank Loan dataset: splits, CV scheme, search budget per model, metric, and the statistical check before declaring a winner.",
        },
        skills: ["classical-ml", "evaluation"],
      },
      {
        slug: "unsupervised-learning",
        title: "Unsupervised Learning",
        moduleSlug: "machine-learning",
        order: 5,
        why: "Clusters, components, and associations find structure without labels — and PCA is the bridge from eigenvectors (Module 2) to embeddings (Module 7).",
        objectives: [
          "Apply K-Means, DBSCAN, and hierarchical clustering with validity checks.",
          "Use PCA for reduction and explain variance-explained plots.",
          "Build a basic recommender and run Apriori for associations.",
        ],
        topics: [
          t("K-Means"),
          t("DBSCAN"),
          t("Hierarchical Clustering"),
          t("PCA"),
          t("Recommendation Systems"),
          t("Apriori Algorithm", "support"),
        ],
        notebook: nb(
          "Why K-Means fails on non-spherical clusters and DBSCAN doesn't",
          "PCA in one chain: covariance matrix → eigenvectors → projection; the elbow/silhouette checks.",
          "One clustering result that looked meaningful but failed a stability check."
        ),
        transfer: {
          title: "New context: customer segments",
          prompt:
            "Segment the Superstore customers. Decide: which features, which scaling, K-Means or DBSCAN (and why), how you validate the clusters, and what you tell marketing each segment means — including uncertainty.",
        },
        skills: ["classical-ml"],
      },
      {
        slug: "ml-capstone",
        title: "ML Capstone",
        moduleSlug: "machine-learning",
        order: 6,
        why: "This is Level-4 ladder evidence: problem framing to model card. A model card forces the honesty that separates engineers from demo-builders.",
        objectives: [
          "Select a problem, prepare real data, establish baselines, tune, evaluate, and present.",
          "Write a model card documenting intended use, metrics, failure analysis, and limitations.",
        ],
        topics: [
          t("Problem selection"),
          t("Data preparation"),
          t("Baseline models"),
          t("Tuning"),
          t("Evaluation"),
          t("Model card"),
          t("Presentation"),
        ],
        notebook: nb(
          "Your baseline's score — the number every later result must beat",
          "The model card skeleton: intended use, data provenance, metrics by subgroup, limitations.",
          "Your model's worst failure mode, found via error analysis, and what caused it."
        ),
        transfer: {
          title: "ML Capstone (Level 4 ladder)",
          prompt:
            "Complete a classical-ML capstone on real public data (Credit Card Fraud, Titanic, or House Pricing from the catalog are canonical). Deliver repo + model card + short presentation. Register it in Projects with evidence.",
        },
        skills: ["classical-ml", "evaluation", "communication"],
      },
    ],
  },

  // ========================================================================
  // MODULE 7 — DEEP LEARNING (Original, 16 sessions; parts 1+2 unified)
  // ========================================================================
  {
    slug: "deep-learning",
    title: "Module 7 · Deep Learning",
    order: 7,
    sourceCategory: "original",
    sessions: 16,
    sessionNote:
      "The original outline splits Module 7 into two parts (duplicated heading) because it is one continuing Deep Learning track. Preserved here as one coherent 16-session program; nothing deleted.",
    summary:
      "Neural networks, TensorFlow/Keras, computer vision, sequence models, NLP, and transformers/LLMs — ending at the DL capstone kickoff.",
    prerequisites: ["machine-learning"],
    harvardMappings: [
      {
        course: "AI Graduate Certificate — 'deep learning and computer vision' category",
        layer: "harvard_extension",
        status: "confirmed_current",
        officialUrl:
          "https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/",
        note: "Confirmed current (verified 2026). Candidate Extension courses previously discussed (CSCI E-25, E-89, E-104) remain likely_not_verified individually.",
      },
      {
        course: "CSCI E-222 (Foundations of Large Language Models)",
        layer: "harvard_extension",
        status: "likely_not_verified",
        note: "Previously discussed Extension LLM course; verify current identifier, syllabus, and term before citing as current.",
      },
    ],
    lessons: [
      {
        slug: "neural-networks-foundations",
        title: "Neural Networks Foundations",
        moduleSlug: "deep-learning",
        order: 1,
        why: "Backpropagation is the chain rule you already own, applied at scale. Understand it once by hand and every framework becomes transparent instead of magical.",
        objectives: [
          "Describe ANN architecture: layers, weights, activations, loss.",
          "Walk one backprop step by hand on a tiny network.",
          "Choose activations, losses, and optimizers (SGD vs Adam) with reasons.",
          "Diagnose overfitting and apply dropout and early stopping.",
        ],
        topics: [
          t("ANN Architecture"),
          t("Backpropagation"),
          t("Activation Functions"),
          t("Loss Functions"),
          t("Optimizers"),
          t("SGD"),
          t("Adam"),
          t("Overfitting"),
          t("Dropout"),
          t("Early Stopping"),
        ],
        notebook: nb(
          "Forward pass → loss → backward pass → update: the training loop in four lines",
          "One hand-worked backprop step on a 1-hidden-unit network; the Adam vs SGD one-liner.",
          "One training curve you sketched showing where overfitting began."
        ),
        extraRetrieval: [
          "Oral viva prompt: explain why Adam differs from SGD, out loud, in under 90 seconds.",
        ],
        transfer: {
          title: "New context: diagnose the curves",
          prompt:
            "Training loss falls smoothly; validation loss falls then climbs after epoch 12. List three interventions in priority order, the mechanism of each, and the experiment that confirms which one worked.",
        },
        skills: ["deep-learning", "calculus-optimization"],
      },
      {
        slug: "ann-tensorflow-keras",
        title: "Building ANNs with TensorFlow/Keras",
        moduleSlug: "deep-learning",
        order: 2,
        why: "This is where theory becomes a trainable artifact. Batch norm and LR schedules are the practical knobs that make real training runs converge.",
        objectives: [
          "Explain batch normalization and learning-rate scheduling.",
          "Build and train a full ANN on tabular data in TensorFlow/Keras (hands-on lab).",
        ],
        topics: [
          t("Batch Normalization"),
          t("Learning Rate Scheduling"),
          t("TensorFlow/Keras intro"),
          t("Build and train a full ANN on tabular data"),
          t("Hands-on lab"),
        ],
        notebook: nb(
          "What batch norm actually normalizes and the two learnable parameters it adds",
          "The Keras recipe: model definition → compile(optimizer, loss, metrics) → fit → evaluate.",
          "One run where lowering the LR at a plateau rescued training."
        ),
        transfer: {
          title: "New context: debug the training run",
          prompt:
            "A colleague's Keras model on tabular data sits at constant loss from epoch 1. Produce your debugging checklist in order (data, labels, scaling, LR, architecture, loss choice) and the observable symptom each check rules out.",
        },
        skills: ["deep-learning", "debugging"],
      },
      {
        slug: "computer-vision",
        title: "Computer Vision",
        moduleSlug: "deep-learning",
        order: 3,
        why: "Convolutions encode an inductive bias about images; transfer learning is how practitioners ship vision systems without Google-scale data. YOLO and OpenCV make it real-time and real-world.",
        objectives: [
          "Explain CNN filters and pooling; trace one convolution by hand.",
          "Fine-tune pretrained backbones (VGG, ResNet, EfficientNet).",
          "Run YOLO inference and classical OpenCV processing; survey segmentation and pose estimation.",
        ],
        topics: [
          t("CNN Architecture"),
          t("Filters"),
          t("Pooling"),
          t("Transfer Learning"),
          t("VGG"),
          t("ResNet"),
          t("EfficientNet"),
          t("Fine-tuning practice"),
          t("Object Detection"),
          t("YOLO architecture", "specialization"),
          t("YOLO inference", "specialization"),
          t("OpenCV", "industry_extension"),
          t("Image Processing"),
          t("Segmentation", "specialization"),
          t("Pose Estimation", "specialization"),
        ],
        notebook: nb(
          "Why convolutions beat dense layers on images (weight sharing + locality)",
          "One hand-traced 3×3 convolution; the freeze-then-fine-tune transfer recipe.",
          "One fine-tuning run where unfreezing too much too early destroyed accuracy."
        ),
        transfer: {
          title: "New context: defect detection",
          prompt:
            "A factory wants defect detection with 900 labeled images. Plan it: which pretrained backbone, what augmentation, classification vs detection vs segmentation framing, and what accuracy claim you can honestly make at this data size.",
        },
        skills: ["deep-learning", "computer-vision"],
      },
      {
        slug: "sequence-models-time-series",
        title: "Sequence Models & Time Series",
        moduleSlug: "deep-learning",
        order: 4,
        why: "Order matters in language, sensors, and markets. RNN limitations are precisely what make attention — the next lesson's core — feel inevitable rather than arbitrary.",
        objectives: [
          "Explain RNN/LSTM/GRU mechanics and the vanishing-gradient motivation.",
          "Implement an LSTM forecaster on a real time-series dataset (lab).",
        ],
        topics: [
          t("RNN"),
          t("LSTM"),
          t("GRU"),
          t("Theory"),
          t("Implementation"),
          t("Time Series Forecasting with LSTM"),
          t("Real-world dataset lab"),
        ],
        notebook: nb(
          "The LSTM gate story: forget, input, output — and the cell-state highway",
          "The windowing recipe: sequence → (X windows, y next-step) with shapes.",
          "One leakage trap unique to time series (shuffled splits) and the correct split.",
        ),
        transfer: {
          title: "New context: energy demand",
          prompt:
            "Forecast hourly electricity demand. Decide window length, train/validation split that respects time, baseline (naive seasonal), and the metric. State when LSTM is NOT worth it over the baseline.",
        },
        skills: ["deep-learning", "time-series"],
      },
      {
        slug: "nlp-fundamentals",
        title: "NLP Fundamentals",
        moduleSlug: "deep-learning",
        order: 5,
        why: "From TF-IDF to Word2Vec is the conceptual leap from counting words to meaning as geometry — the single idea underneath every embedding and every LLM.",
        objectives: [
          "Build preprocessing pipelines: tokenization through lemmatization.",
          "Compare TF-IDF vs embeddings and justify a choice per task.",
          "Explain Seq2Seq and apply it to summarization/translation/generation.",
        ],
        topics: [
          t("Text Preprocessing"),
          t("Tokenization"),
          t("Stop Words"),
          t("Stemming"),
          t("Lemmatization"),
          t("TF-IDF"),
          t("N-Grams"),
          t("Word2Vec"),
          t("Word Embeddings"),
          t("Seq2Seq Models"),
          t("Summarization", "specialization"),
          t("Translation", "specialization"),
          t("Text Generation"),
        ],
        notebook: nb(
          "Meaning as geometry: why king − man + woman ≈ queen works at all",
          "The TF-IDF formula with each term's job; the preprocessing order that matters.",
          "One task where stemming hurt and lemmatization (or nothing) won."
        ),
        transfer: {
          title: "New context: support tickets",
          prompt:
            "Classify 50k support tickets into 12 categories. Decide: TF-IDF + linear model or embeddings + small NN? Specify the decision criteria (data size, latency, interpretability) and your evaluation plan — Text Classification catalog project is the natural home.",
        },
        skills: ["nlp", "deep-learning"],
      },
      {
        slug: "transformers-llms",
        title: "Transformers & LLMs",
        moduleSlug: "deep-learning",
        order: 6,
        why: "Attention, context windows, fine-tuning, RAG, and agents are the working vocabulary of the modern AI engineer. This lesson goes far beyond prompting — into how the machinery works.",
        objectives: [
          "Explain attention and the transformer architecture (encoder/decoder/both).",
          "Trace tokenization → embeddings → attention → generation for one prompt.",
          "Choose between prompting, LoRA/QLoRA fine-tuning, and RAG for a given problem.",
          "Explain vector databases and agent tool-use at the architecture level.",
        ],
        topics: [
          t("Attention Mechanism"),
          t("Architecture"),
          t("Embeddings"),
          t("Tokenizers"),
          t("Context Window"),
          t("Fine-tuning Types"),
          t("LoRA"),
          t("QLoRA"),
          t("Hugging Face", "industry_extension"),
          t("Encoder models"),
          t("Decoder models"),
          t("Encoder-Decoder models"),
          t("Prompt Engineering"),
          t("RAG"),
          t("Vector Databases"),
          t("AI Agents"),
          t("DL Capstone kickoff"),
        ],
        notebook: nb(
          "Attention in one line: every token asks every other token how relevant it is (Q·K → weights → weighted V)",
          "The decision tree: prompt vs RAG vs fine-tune — with the cost/freshness/behavior criteria.",
          "One hallucination you reproduced and the grounding change that fixed it."
        ),
        extraRetrieval: [
          "Why does a context window limit exist? Connect it to the O(n²) cost of attention.",
        ],
        transfer: {
          title: "Case: build-or-ground decision",
          prompt:
            "A legal firm wants a document-answering assistant over 40k private contracts with citation requirements. Deterministic workflow, single LLM call, RAG, fine-tune, or agent? Justify against cost, freshness, auditability, and hallucination risk. (This feeds the RAG System catalog project.)",
        },
        skills: ["llm-engineering", "nlp"],
      },
    ],
  },

  // ========================================================================
  // MODULE 8 — DEVELOPMENT & MLOPS (Original, 2 sessions)
  // ========================================================================
  {
    slug: "mlops",
    title: "Module 8 · Development & MLOps",
    order: 8,
    sourceCategory: "original",
    sessions: 2,
    summary:
      "Model deployment: FastAPI, Streamlit, Docker, CI/CD, and the final capstone presentations. All original tools preserved; Harvard/industry lifecycle depth is additive.",
    prerequisites: ["machine-learning", "databases-data-engineering"],
    harvardMappings: [
      {
        course: "APCOMP 215-style practical AI systems (and Extension equivalents)",
        layer: "harvard_extension",
        status: "likely_not_verified",
        note: "Candidate applied-computation layer covering pipelines → deployment → monitoring → MLOps at scale. Verify current title/syllabus before citing.",
      },
    ],
    lessons: [
      {
        slug: "deployment-final-capstone",
        title: "Model Deployment & Final Capstone",
        moduleSlug: "mlops",
        order: 1,
        why: "A model that only lives in a notebook is a rehearsal. APIs, containers, and CI/CD are how your work reaches users — and how employers tell builders from students.",
        objectives: [
          "Build and document a model-serving API with FastAPI.",
          "Ship a Streamlit front-end for an ML app.",
          "Containerize a model with Docker and explain each Dockerfile line.",
          "Describe the CI/CD loop and the full ML lifecycle (data → … → retraining/rollback).",
          "Present the final capstone.",
        ],
        topics: [
          t("APIs Fundamentals"),
          t("FastAPI", "industry_extension"),
          t("Building and documenting a model API"),
          t("Streamlit for ML apps", "industry_extension"),
          t("Docker Basics"),
          t("Containerizing a model"),
          t("CI/CD overview"),
          t("Final Capstone presentations"),
        ],
        notebook: nb(
          "The lifecycle loop: data → training → evaluation → packaging → deployment → monitoring → drift → retrain/rollback",
          "Your Dockerfile, annotated line by line; the FastAPI endpoint contract (schema in/out).",
          "One deployment failure (dependency, port, memory) and the log line that revealed it."
        ),
        transfer: {
          title: "Deployment Capstone (Level 9 ladder step)",
          prompt:
            "Take your ML capstone model: wrap it in a documented FastAPI service, containerize it, add a health endpoint and basic request logging, and write the monitoring + rollback plan you would use in production. Register evidence in Projects.",
        },
        caseStudy: {
          title: "Incident: latency spike",
          prompt:
            "Your deployed model API's p95 latency jumps from 80ms to 2.3s after a dependency update. Triage: what do you check first, how do you mitigate within 15 minutes, and what goes in the post-incident note?",
        },
        skills: ["mlops-deployment", "software-engineering"],
      },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const mod = getModule(moduleSlug);
  const lesson = mod?.lessons.find((l) => l.slug === lessonSlug);
  return mod && lesson ? { module: mod, lesson } : undefined;
}

export function allLessons() {
  return MODULES.flatMap((m) => m.lessons.map((l) => ({ module: m, lesson: l })));
}

/** Stable review key for a topic within a lesson. */
export function topicKey(lessonSlug: string, topicSlug: string) {
  return `${lessonSlug}:${topicSlug}`;
}

/** Auto-generated retrieval prompts per topic — retrieval + transfer oriented, not flashcard trivia. */
export function retrievalPromptsForTopic(topicName: string): string[] {
  return [
    `Close the source. Explain "${topicName}" in your own words — definition, why it exists, and one example.`,
    `When would you reach for "${topicName}", and when is it the wrong tool? Give one failure mode.`,
  ];
}

export const TOTAL_TOPICS = MODULES.reduce(
  (sum, m) => sum + m.lessons.reduce((s, l) => s + l.topics.length, 0),
  0
);
