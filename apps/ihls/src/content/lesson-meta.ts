import type { Importance, NotebookGuidance } from "./types";

/**
 * Per-session teaching metadata for the ORIGINAL curriculum sessions.
 * Key format: `om{module}-{session}` matching original-curriculum.ts.
 *
 * Topics are NOT repeated here — they live verbatim in original-curriculum.ts.
 * This file adds the layer the specification requires on top of every topic list:
 * objectives (§54 level 1–2), mastery criteria (§35/§73), notebook guidance (§144),
 * skills (§181), prerequisites (§42) and effort (§62).
 */

export interface LessonMeta {
  level: 1 | 2 | 3 | 4 | 5;
  importance: Importance;
  skills: string[];
  effort: number;
  prereqs: string[];
  objectives: string[];
  mastery: string[];
  notebook: NotebookGuidance;
  projects?: string[];
  roles?: string[];
}

const nb = (mustWrite: string[], recommended: string[], optional: string[]): NotebookGuidance => ({
  mustWrite,
  recommended,
  optional,
});

export const ORIGINAL_LESSON_META: Record<string, LessonMeta> = {
  // ---------------- Module 1: Python Programming ----------------
  "om1-1": {
    level: 1,
    importance: "CORE",
    skills: ["sk-python-core"],
    effort: 180,
    prereqs: [],
    objectives: [
      "Predict the value and type of an expression before running it.",
      "Choose the right loop and the right exit condition for a problem.",
      "Explain why type casting can silently change meaning.",
    ],
    mastery: [
      "Trace a loop with break/continue on paper and match the interpreter exactly.",
      "Write a correct conditional chain for a specification you did not design.",
    ],
    notebook: nb(
      ["Truthiness rules for empty collections, 0 and None", "The difference between `=`, `==` and `is`", "One worked trace of a while loop with break"],
      ["A table of operator precedence surprises you hit", "Your own one-line definition of 'type'"],
      ["The full list of built-in types"],
    ),
    roles: ["role-navisoft", "role-nuwave"],
  },
  "om1-2": {
    level: 1,
    importance: "CORE",
    skills: ["sk-python-core"],
    effort: 180,
    prereqs: ["l-om1-1"],
    objectives: [
      "Select list vs tuple vs set vs dict from access, mutability and cost requirements.",
      "Reason about scope and closures without guessing.",
      "Design a function signature that is hard to misuse.",
    ],
    mastery: [
      "Justify a data-structure choice with a complexity argument, not a preference.",
      "Explain the output of a function that mutates a default argument.",
    ],
    notebook: nb(
      ["When each of the four collections is the right answer", "LEGB scope rule in your own words", "One mutable-default-argument example"],
      ["Lambda vs def: when the lambda actually helps"],
      ["Full dict method list"],
    ),
  },
  "om1-3": {
    level: 2,
    importance: "CORE",
    skills: ["sk-python-errors", "sk-debugging"],
    effort: 180,
    prereqs: ["l-om1-2"],
    objectives: [
      "Decide what to catch, what to re-raise and what to let crash.",
      "Write a custom exception that improves a caller's decision-making.",
      "Read and write CSV and JSON safely, including encoding and partial failures.",
    ],
    mastery: [
      "Convert a crash-prone script into one that fails loudly at the right boundary.",
      "Explain why a bare `except:` is a defect, not a safety net.",
    ],
    notebook: nb(
      ["Rule for choosing catch vs propagate", "try/except/else/finally execution order", "One custom exception you would actually define"],
      ["Checklist for safe file writes (temp file + rename)"],
      ["csv module parameter reference"],
    ),
  },
  "om1-4": {
    level: 2,
    importance: "CORE",
    skills: ["sk-algorithms", "sk-complexity", "sk-python-oop"],
    effort: 210,
    prereqs: ["l-om1-3"],
    objectives: [
      "Implement linear and binary search and state the precondition binary search needs.",
      "Implement bubble sort and explain why it is a teaching algorithm, not a production one.",
      "Convert a recursive definition into code and identify the base case that terminates it.",
      "Model a small domain with classes, inheritance and polymorphism.",
    ],
    mastery: [
      "Give the O() of each algorithm you wrote and defend it.",
      "Rewrite an if/elif type-switch as polymorphism and explain the trade-off.",
    ],
    notebook: nb(
      ["Binary search invariant and its precondition", "Base case + recursive case template", "One class diagram of your own domain"],
      ["Table: search/sort algorithm → best/average/worst"],
      ["Full sorting algorithm zoo"],
    ),
    projects: ["pj-library-management"],
  },
  "om1-5": {
    level: 2,
    importance: "CORE",
    skills: ["sk-python-oop", "sk-git"],
    effort: 210,
    prereqs: ["l-om1-4"],
    objectives: [
      "Use encapsulation and abstraction to make a module safe to change.",
      "Implement the magic methods that make an object behave like a Python citizen.",
      "Structure code as modules and packages inside a reproducible virtual environment.",
    ],
    mastery: [
      "Ship the mini-project as an installable package with a pinned environment.",
      "Explain what breaks for a caller if you rename a public attribute.",
    ],
    notebook: nb(
      ["What encapsulation buys you, in one sentence", "__init__ / __repr__ / __eq__ contract", "Commands to create and freeze a virtual environment"],
      ["Package layout you will reuse"],
      ["Complete magic-method list"],
    ),
    projects: ["pj-library-management"],
  },

  // ---------------- Module 2: Math & Statistics ----------------
  "om2-1": {
    level: 1,
    importance: "CORE",
    skills: ["sk-linear-algebra"],
    effort: 180,
    prereqs: [],
    objectives: [
      "Move fluently between scalar, vector, matrix and tensor views of the same data.",
      "Multiply matrices by hand and state why the inner dimensions must agree.",
      "Interpret a determinant geometrically.",
    ],
    mastery: [
      "Compute a 3×3 matrix product by hand with no arithmetic slips.",
      "Explain a batch of feature vectors as a matrix and name each axis.",
    ],
    notebook: nb(
      ["Shape rule for matrix multiplication", "Determinant = signed volume scaling", "One hand-worked 2×3 · 3×2 product"],
      ["How a dataset maps onto a matrix"],
      ["Tensor rank terminology across libraries"],
    ),
  },
  "om2-2": {
    level: 2,
    importance: "CORE",
    skills: ["sk-linear-algebra"],
    effort: 180,
    prereqs: ["l-om2-1"],
    objectives: [
      "Explain eigenvectors as directions a transformation only scales.",
      "Decide when an inverse exists and when to avoid computing one.",
      "Choose between L1, L2 and L∞ norms for a measurement task.",
    ],
    mastery: [
      "Find eigenvalues of a 2×2 matrix by hand and verify them.",
      "Explain why solving a linear system is preferred over inverting a matrix.",
    ],
    notebook: nb(
      ["Definition Av = λv with the geometric reading", "Condition for invertibility", "L1 vs L2 in one line each"],
      ["Dot product as projection"],
      ["Cross product in 3D applications"],
    ),
  },
  "om2-3": {
    level: 2,
    importance: "CORE",
    skills: ["sk-calculus-opt"],
    effort: 210,
    prereqs: ["l-om2-2"],
    objectives: [
      "Differentiate composite functions with the chain rule reliably.",
      "Read a gradient as the direction of steepest increase.",
      "Explain gradient descent, its learning rate and its failure modes.",
    ],
    mastery: [
      "Derive the gradient of mean squared error for linear regression by hand.",
      "Diagnose divergence, oscillation and plateau from a loss curve.",
    ],
    notebook: nb(
      ["Chain rule statement and one worked composite", "Gradient descent update rule with symbol meanings", "Three failure modes of a bad learning rate"],
      ["Convex vs non-convex sketch"],
      ["Second-order methods overview"],
    ),
  },
  "om2-4": {
    level: 1,
    importance: "CORE",
    skills: ["sk-statistics"],
    effort: 180,
    prereqs: [],
    objectives: [
      "Distinguish a population parameter from a sample statistic in a real dataset.",
      "Choose mean vs median for a skewed distribution and justify it.",
      "Read skewness and kurtosis as shape statements, not scores.",
    ],
    mastery: [
      "Explain why variance uses n−1 for a sample.",
      "Pick the correct spread measure for salary data and defend it.",
    ],
    notebook: nb(
      ["Population vs sample notation (μ, σ vs x̄, s)", "When the median beats the mean", "IQR and the outlier rule you will use"],
      ["Sketch of the four shape cases"],
      ["Full distribution catalogue"],
    ),
  },
  "om2-5": {
    level: 2,
    importance: "CORE",
    skills: ["sk-probability"],
    effort: 180,
    prereqs: ["l-om2-4"],
    objectives: [
      "Apply conditional probability without confusing P(A|B) and P(B|A).",
      "Use Bayes' theorem on a base-rate problem and interpret the result.",
      "Separate correlation from covariance from causation.",
    ],
    mastery: [
      "Solve a medical-test base-rate problem and explain the result to a non-specialist.",
      "State what a likelihood is, and what it is not.",
    ],
    notebook: nb(
      ["Bayes' theorem with every symbol named", "One base-rate worked example", "Correlation ≠ causation with your own counter-example"],
      ["Joint vs marginal vs conditional table"],
      ["Named distributions reference"],
    ),
  },

  // ---------------- Module 3: Data Analysis with Python ----------------
  "om3-1": {
    level: 1,
    importance: "CORE",
    skills: ["sk-numpy"],
    effort: 150,
    prereqs: ["l-om1-2", "l-om2-1"],
    objectives: [
      "Create and reshape N-D arrays with intent rather than trial and error.",
      "Predict the result of an indexing or slicing expression.",
      "Explain when a slice is a view and when it is a copy.",
    ],
    mastery: ["Reshape between (n, h, w, c) layouts without losing track of an axis.", "Predict array shapes before executing."],
    notebook: nb(
      ["Axis convention you will use for the rest of the course", "View vs copy rule", "One reshape worked on paper"],
      ["Indexing cheat lines you keep forgetting"],
      ["Full dtype table"],
    ),
  },
  "om3-2": {
    level: 3,
    importance: "CORE",
    skills: ["sk-numpy", "sk-statistics", "sk-pandas"],
    effort: 240,
    prereqs: ["l-om3-1", "l-om2-5"],
    objectives: [
      "Use broadcasting deliberately and detect accidental broadcasts.",
      "Explain why vectorised code is faster in terms of memory layout and strides.",
      "Run and interpret a z-test, t-test and ANOVA, including the p-value's real meaning.",
      "Design an A/B test that could actually answer the question asked.",
    ],
    mastery: [
      "State what a p-value does and does not mean, without hedging.",
      "Replace a Python loop with a vectorised form and measure the difference.",
    ],
    notebook: nb(
      ["Broadcasting rules in your own words", "p-value definition — the correct one", "Confidence interval interpretation sentence"],
      ["Which test for which design (table)", "Strides → why vectorisation wins"],
      ["ANOVA computational details"],
    ),
  },
  "om3-3": {
    level: 2,
    importance: "CORE",
    skills: ["sk-pandas"],
    effort: 240,
    prereqs: ["l-om3-1"],
    objectives: [
      "Load data from CSV, Excel, JSON and SQL with explicit dtypes and encodings.",
      "Compose filter → group → aggregate → join pipelines that stay readable.",
      "Decide between dropping, imputing and modelling missing values.",
      "Engineer features without leaking target information.",
    ],
    mastery: [
      "Reproduce a wrangling pipeline from a specification with correct row counts at each step.",
      "Explain one way your join could silently duplicate rows and how you checked.",
    ],
    notebook: nb(
      ["Join type → row-count expectation", "Missing-value decision rule", "Leakage checklist"],
      ["GroupBy–apply–combine mental model"],
      ["Full read_csv parameter list"],
    ),
    projects: ["pj-uber-analysis", "pj-bank-loan"],
  },
  "om3-4": {
    level: 2,
    importance: "SUPPORT",
    skills: ["sk-visualisation"],
    effort: 180,
    prereqs: ["l-om3-3"],
    objectives: [
      "Choose a chart from the question being asked, not from the library gallery.",
      "Build the same figure in Matplotlib, Seaborn and Plotly and state when each wins.",
      "Tell a defensible story with a figure without distorting the data.",
    ],
    mastery: ["Critique a misleading chart and produce an honest replacement.", "Explain an axis choice that would change a reader's conclusion."],
    notebook: nb(
      ["Question → chart type mapping", "Three ways a chart lies", "Your default figure template"],
      ["Colour choices that survive colour-blindness"],
      ["Plotly configuration reference"],
    ),
    projects: ["pj-superstore-dashboard", "pj-hr-dashboard"],
  },
  "om3-5": {
    level: 3,
    importance: "CORE",
    skills: ["sk-eda", "sk-communication"],
    effort: 300,
    prereqs: ["l-om3-3", "l-om3-4"],
    objectives: [
      "Run a complete load → clean → analyse → present pipeline on a real public dataset.",
      "Document provenance, limitations and bias risks alongside the findings.",
      "Survive a code review of your analysis.",
    ],
    mastery: [
      "Deliver an analysis another engineer can rerun from your repository alone.",
      "State three limitations of your own conclusion unprompted.",
    ],
    notebook: nb(
      ["Your EDA checklist, ordered", "Data dictionary template", "Three questions a reviewer always asks"],
      ["Repository structure for analyses"],
      ["Notebook-to-report conversion tips"],
    ),
    projects: ["pj-uber-analysis"],
  },

  // ---------------- Module 4: Excel & Power BI ----------------
  "om4-1": {
    level: 1,
    importance: "SUPPORT",
    skills: ["sk-excel-powerbi"],
    effort: 150,
    prereqs: [],
    objectives: [
      "Build lookup and aggregation formulas that survive data changes.",
      "Shape data with Power Query instead of manual edits.",
      "Design a spreadsheet dashboard a non-technical stakeholder can read.",
    ],
    mastery: ["Rebuild a manual report as a refreshable Power Query pipeline.", "Explain why XLOOKUP replaced VLOOKUP in your workflow."],
    notebook: nb(["XLOOKUP signature and the VLOOKUP trap", "Power Query step order", "Dashboard layout rules"], ["Pivot table design patterns"], ["Full function reference"]),
    projects: ["pj-superstore-dashboard"],
  },
  "om4-2": {
    level: 2,
    importance: "SUPPORT",
    skills: ["sk-excel-powerbi"],
    effort: 180,
    prereqs: ["l-om4-1"],
    objectives: [
      "Model a star schema with correct relationships and cardinality.",
      "Write DAX measures that aggregate correctly under filter context.",
      "Publish and share a report with an access model you can defend.",
    ],
    mastery: ["Explain filter context to someone who only knows Excel formulas.", "Fix a measure that double-counts across a many-to-many relationship."],
    notebook: nb(["Star schema sketch", "Filter context in one sentence", "Measure vs calculated column rule"], ["Relationship cardinality cases"], ["DAX function catalogue"]),
    projects: ["pj-hr-dashboard", "pj-superstore-dashboard"],
  },

  // ---------------- Module 5: Databases & Data Engineering ----------------
  "om5-1": {
    level: 1,
    importance: "CORE",
    skills: ["sk-sql"],
    effort: 180,
    prereqs: [],
    objectives: [
      "Translate a domain into an ERD with correct cardinalities.",
      "Normalise to third normal form and say what each form prevents.",
      "Write DDL, DML and DQL that match a specification.",
    ],
    mastery: ["Design a schema for a described business and defend each key.", "Explain one anomaly that normalisation eliminates."],
    notebook: nb(["1NF/2NF/3NF in one line each", "Primary vs foreign vs candidate key", "Your ERD notation"], ["When denormalisation is correct"], ["Full DDL syntax"]),
    projects: ["pj-sales-database"],
  },
  "om5-2": {
    level: 2,
    importance: "CORE",
    skills: ["sk-sql"],
    effort: 210,
    prereqs: ["l-om5-1"],
    objectives: [
      "Use joins, subqueries, CTEs and window functions to express analytical questions.",
      "Read a query plan and explain why an index did or did not help.",
      "Decide when a stored procedure belongs in the database.",
    ],
    mastery: ["Convert a slow correlated subquery into a window function and measure the improvement.", "Explain the cost of an index on writes."],
    notebook: nb(["Window function anatomy (OVER / PARTITION BY / ORDER BY)", "Join type → row behaviour", "Index trade-off sentence"], ["CTE vs subquery readability rule"], ["Vendor-specific syntax notes"]),
    projects: ["pj-sales-database"],
  },
  "om5-3": {
    level: 2,
    importance: "SUPPORT",
    skills: ["sk-scraping", "sk-data-engineering"],
    effort: 210,
    prereqs: ["l-om5-2", "l-om1-3"],
    objectives: [
      "Collect data lawfully from HTML, dynamic pages and APIs, respecting terms and robots directives.",
      "Write regular expressions you can still read next month.",
      "Explain what a data warehouse is for, in contrast to an application database.",
    ],
    mastery: ["Produce a collection script with rate limiting, retries and a provenance log.", "State the legal and ethical check you ran before scraping."],
    notebook: nb(["Scraping permission checklist (§70)", "Regex constructs you actually use", "OLTP vs OLAP in one line"], ["Selenium vs requests decision rule"], ["Full regex reference"]),
  },
  "om5-4": {
    level: 3,
    importance: "CORE",
    skills: ["sk-data-engineering"],
    effort: 300,
    prereqs: ["l-om5-3"],
    objectives: [
      "Design an ETL/ELT pipeline with explicit idempotency and failure handling.",
      "Implement scrape → clean → store → query end to end.",
      "Justify tool choices against the requirement, not the trend.",
    ],
    mastery: ["Re-run your pipeline twice and prove the output is unchanged.", "Describe what happens when the source is unavailable mid-run."],
    notebook: nb(["Idempotency definition and your test for it", "Pipeline stage diagram", "Failure-handling policy"], ["ETL vs ELT decision rule"], ["Tool comparison table"]),
  },

  // ---------------- Module 6: Machine Learning ----------------
  "om6-1": {
    level: 2,
    importance: "CORE",
    skills: ["sk-ml-workflow"],
    effort: 210,
    prereqs: ["l-om3-3", "l-om2-5"],
    objectives: [
      "Frame a problem as supervised, unsupervised or not-ML-at-all.",
      "Build a preprocessing pipeline that cannot leak test information.",
      "Handle class imbalance with a method matched to the cost structure.",
    ],
    mastery: ["Explain where leakage would enter your pipeline and show the guard.", "Justify a resampling choice with the business cost of each error."],
    notebook: nb(["Leakage sources list", "Fit on train, transform on test — why", "Imbalance options and their costs"], ["Encoding decision table"], ["sklearn API map"]),
  },
  "om6-2": {
    level: 2,
    importance: "CORE",
    skills: ["sk-regression"],
    effort: 180,
    prereqs: ["l-om6-1", "l-om2-3"],
    objectives: [
      "Fit and interpret simple and multiple regression coefficients honestly.",
      "Check the assumptions that make those coefficients meaningful.",
      "Choose and interpret MSE, RMSE and R² for the audience.",
    ],
    mastery: ["Explain a high R² with useless predictions.", "Interpret a coefficient in business units, with its caveats."],
    notebook: nb(["Regression assumptions list", "MSE vs RMSE vs R² meanings", "One residual plot and what it told you"], ["Multicollinearity symptoms"], ["Closed-form solution derivation"]),
    projects: ["pj-house-pricing"],
  },
  "om6-3": {
    level: 2,
    importance: "CORE",
    skills: ["sk-classification"],
    effort: 240,
    prereqs: ["l-om6-2"],
    objectives: [
      "Choose between logistic regression, trees, SVM, KNN and Naive Bayes from data properties.",
      "Select a metric from the cost of false positives and false negatives.",
      "Read a ROC curve and a confusion matrix without mixing them up.",
    ],
    mastery: ["Defend a threshold choice in business terms.", "Explain why accuracy is the wrong metric for your imbalanced case."],
    notebook: nb(["Confusion matrix with all four cells named", "Precision vs recall trade-off sentence", "Threshold selection rule"], ["Algorithm → assumption table"], ["Kernel trick details"]),
    projects: ["pj-titanic", "pj-credit-fraud"],
  },
  "om6-4": {
    level: 3,
    importance: "CORE",
    skills: ["sk-ensembles"],
    effort: 240,
    prereqs: ["l-om6-3"],
    objectives: [
      "Design a cross-validation scheme that matches the data's structure (time, groups, leakage).",
      "Explain bagging vs boosting in terms of bias and variance.",
      "Tune and compare models without fooling yourself.",
    ],
    mastery: ["Show why your CV score is or is not an honest estimate.", "Explain a case where a simpler model should win."],
    notebook: nb(["Bias–variance in one sentence each", "CV scheme → when to use it", "Search budget discipline"], ["XGBoost vs CatBoost practical notes"], ["Stacking architectures"]),
    projects: ["pj-credit-fraud"],
  },
  "om6-5": {
    level: 2,
    importance: "SUPPORT",
    skills: ["sk-unsupervised"],
    effort: 210,
    prereqs: ["l-om6-1", "l-om2-2"],
    objectives: [
      "Select a clustering algorithm from shape, density and scale assumptions.",
      "Use PCA with a clear statement of what variance it kept and what it destroyed.",
      "Build a basic recommender and state its cold-start weakness.",
    ],
    mastery: ["Validate a clustering without labels and explain the validation's limits.", "Explain what a principal component means in the original features."],
    notebook: nb(["K-Means assumptions and failures", "PCA in four steps", "Clustering validation options"], ["DBSCAN parameter intuition"], ["Apriori support/confidence formulas"]),
  },
  "om6-6": {
    level: 4,
    importance: "CORE",
    skills: ["sk-ml-workflow", "sk-ensembles", "sk-communication"],
    effort: 420,
    prereqs: ["l-om6-4", "l-om6-5"],
    objectives: [
      "Carry a real problem from framing to a defensible model and a written model card.",
      "Establish a baseline before any tuning and keep it visible.",
      "Present results including failures and limitations.",
    ],
    mastery: ["Produce a model card with honest metrics, intended use and limitations.", "Defend your model choice under questioning."],
    notebook: nb(["Model card sections", "Baseline-first rule", "Your evaluation protocol"], ["Presentation structure"], ["Hyperparameter log template"]),
    projects: ["pj-credit-fraud", "pj-house-pricing"],
  },

  // ---------------- Module 7: Deep Learning ----------------
  "om7-1": {
    level: 3,
    importance: "CORE",
    skills: ["sk-nn-foundations"],
    effort: 300,
    prereqs: ["l-om2-3", "l-om6-2"],
    objectives: [
      "Describe a network as a composition of differentiable functions.",
      "Execute one forward and one backward pass by hand on a tiny network.",
      "Choose activations, losses and optimisers for a stated task.",
      "Recognise overfitting and apply dropout and early stopping for the right reason.",
    ],
    mastery: ["Hand-compute a two-layer backward pass and match the framework's gradients.", "Explain why ReLU helped where sigmoid stalled."],
    notebook: nb(
      ["Backpropagation = chain rule over a computation graph", "Activation → use case table", "Loss function → task mapping"],
      ["Adam vs SGD practical differences"],
      ["Optimiser mathematics in full"],
    ),
  },
  "om7-2": {
    level: 3,
    importance: "CORE",
    skills: ["sk-dl-training"],
    effort: 300,
    prereqs: ["l-om7-1"],
    objectives: [
      "Train a full ANN on tabular data with a reproducible configuration.",
      "Apply batch normalisation and learning-rate scheduling for stated reasons.",
      "Debug a training run from its loss curve.",
    ],
    mastery: ["Reproduce your own run twice with identical seeds and configuration.", "Diagnose a diverging run and fix it with one change at a time."],
    notebook: nb(["Reproducibility checklist (seed, versions, data hash)", "Loss-curve diagnosis patterns", "BatchNorm placement rule"], ["LR schedule shapes"], ["Keras API reference"]),
  },
  "om7-3": {
    level: 4,
    importance: "SPECIALIZATION",
    skills: ["sk-cv"],
    effort: 420,
    prereqs: ["l-om7-2"],
    objectives: [
      "Explain convolution, filters and pooling in terms of parameter sharing and locality.",
      "Apply transfer learning and decide which layers to freeze.",
      "Run object detection and segmentation and interpret their distinct metrics.",
    ],
    mastery: ["Fine-tune a pretrained backbone on a small dataset and justify the freezing strategy.", "Explain IoU and mAP correctly."],
    notebook: nb(["Convolution arithmetic (size, stride, padding)", "Transfer learning decision rule", "IoU definition"], ["Backbone comparison notes"], ["Full YOLO version history"]),
    projects: ["pj-skin-disease", "pj-face-recognition", "pj-object-detection", "pj-brain-tumor", "pj-breast-cancer", "pj-sign-language"],
  },
  "om7-4": {
    level: 3,
    importance: "SPECIALIZATION",
    skills: ["sk-sequence"],
    effort: 300,
    prereqs: ["l-om7-2"],
    objectives: [
      "Explain why vanilla RNNs fail on long dependencies and how gates fix it.",
      "Build an LSTM forecaster with an honest train/validation split in time.",
      "Avoid the lookahead bias that invalidates most time-series demos.",
    ],
    mastery: ["Show that your time split cannot leak the future.", "Compare your model against a naive persistence baseline."],
    notebook: nb(["Gate roles in an LSTM", "Time-series split rule", "Persistence baseline formula"], ["GRU vs LSTM trade-off"], ["Seq2seq attention variants"]),
    projects: ["pj-stock-prediction"],
  },
  "om7-5": {
    level: 3,
    importance: "SPECIALIZATION",
    skills: ["sk-nlp"],
    effort: 300,
    prereqs: ["l-om7-2"],
    objectives: [
      "Build a text preprocessing pipeline and justify every destructive step.",
      "Compare TF-IDF with learned embeddings on the same task.",
      "Explain what Word2Vec actually learns.",
    ],
    mastery: ["Show a case where stemming destroyed signal.", "Explain cosine similarity in embedding space to a non-specialist."],
    notebook: nb(["Preprocessing steps and what each destroys", "TF-IDF formula with symbols named", "Embedding intuition sentence"], ["N-gram vs embedding trade-off"], ["Lemmatiser comparison"]),
    projects: ["pj-text-classification", "pj-document-summarisation"],
  },
  "om7-6": {
    level: 4,
    importance: "CORE",
    skills: ["sk-transformers", "sk-rag", "sk-agents"],
    effort: 420,
    prereqs: ["l-om7-5"],
    objectives: [
      "Explain self-attention mathematically and in plain language.",
      "Choose encoder, decoder or encoder-decoder for a task.",
      "Decide between prompting, RAG and fine-tuning (LoRA/QLoRA) from constraints.",
      "Describe what a vector database adds and what it cannot fix.",
    ],
    mastery: ["Derive attention output shapes for a given batch.", "Defend a prompt-vs-RAG-vs-fine-tune decision with cost, latency and data arguments."],
    notebook: nb(
      ["Attention formula with Q, K, V named", "Encoder vs decoder vs encoder-decoder uses", "Prompt / RAG / fine-tune decision rule"],
      ["Context window cost implications", "LoRA in one paragraph"],
      ["Full Hugging Face API tour"],
    ),
    projects: ["pj-chatbot", "pj-rag-system", "pj-document-summarisation"],
  },

  // ---------------- Module 8: Development & MLOps ----------------
  "om8-1": {
    level: 4,
    importance: "CORE",
    skills: ["sk-api-design", "sk-containers", "sk-mlops", "sk-communication"],
    effort: 420,
    prereqs: ["l-om6-6", "l-om7-2"],
    objectives: [
      "Expose a model behind a documented, validated, versioned API.",
      "Containerise it reproducibly and run it somewhere other than your laptop.",
      "Explain the CI/CD stages that protect the model in production.",
      "Present and defend the final capstone.",
    ],
    mastery: [
      "Another engineer runs your container from the README alone and gets the documented output.",
      "Your API rejects bad input with useful errors and never leaks internals.",
    ],
    notebook: nb(
      ["API contract: request schema, response schema, error codes", "Dockerfile layer-ordering rule", "CI/CD stage list"],
      ["FastAPI dependency pattern", "Streamlit vs API: when each is the deliverable"],
      ["Full Docker CLI reference"],
    ),
    projects: ["pj-rag-system", "pj-chatbot"],
  },
};
