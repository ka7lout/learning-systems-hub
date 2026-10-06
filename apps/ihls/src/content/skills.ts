import type { Skill } from "./types";

/**
 * SKILL GRAPH (§181, §182).
 * Every skill links to concepts/lessons (via lesson.skills), assessments, tasks,
 * projects, evidence, roles, interview questions and English vocabulary.
 * A skill is never marked mastered from "content seen" — only from evidence (§182).
 */

const s = (
  id: string,
  title: string,
  family: string,
  description: string,
  dependsOn: string[],
  roles: string[],
  interviewQuestions: string[],
  englishTerms: string[] = [],
): Skill => ({ id, title, family, description, dependsOn, roles, interviewQuestions, englishTerms });

export const SKILLS: Skill[] = [
  // Programming
  s("sk-python-core", "Python core programming", "Programming", "Control flow, types, collections, functions, scope.", [], ["role-navisoft", "role-nuwave"], ["Walk me through how Python evaluates a mutable default argument."], ["abstraction"]),
  s("sk-python-oop", "Object-oriented design in Python", "Programming", "Classes, inheritance, polymorphism, encapsulation, magic methods.", ["sk-python-core"], ["role-navisoft", "role-nuwave"], ["When would you prefer composition over inheritance?"], ["encapsulation", "abstraction", "maintainability"]),
  s("sk-python-errors", "Error handling and I/O", "Programming", "Exceptions, custom exceptions, files, CSV/JSON.", ["sk-python-core"], ["role-navisoft"], ["How do you decide what to catch and what to let propagate?"], ["robustness"]),
  s("sk-c-memory", "C and the memory model", "Programming", "Pointers, stack/heap, compilation and linking, segmentation faults.", ["sk-python-core"], ["role-navisoft"], ["What exactly happens when you dereference a freed pointer?"], []),
  s("sk-typescript", "TypeScript for AI product surfaces", "Programming", "Typed application code for APIs and interfaces.", ["sk-python-core"], ["role-nuwave"], ["Why does a typed boundary matter at an LLM API edge?"], ["maintainability"]),
  s("sk-bash-linux", "Bash and Linux command line", "Programming", "Shell, processes, pipes, file system, scripting.", [], ["role-navisoft", "role-nuwave"], ["How would you find which process is holding a port?"], []),

  // CS foundations
  s("sk-datastructures", "Data structures", "CS Foundations", "Arrays, linked lists, stacks, queues, trees, hash tables, tries, graphs.", ["sk-python-core"], ["role-navisoft"], ["Why is a hash table average O(1) but worst case O(n)?"], []),
  s("sk-algorithms", "Algorithm design", "CS Foundations", "Recursion, divide and conquer, greedy, dynamic programming, searching, sorting.", ["sk-datastructures"], ["role-navisoft"], ["Give an example where a greedy algorithm fails and DP succeeds."], []),
  s("sk-complexity", "Asymptotic complexity analysis", "CS Foundations", "O, Ω, Θ; time and space trade-offs.", ["sk-algorithms"], ["role-navisoft"], ["Analyse the complexity of this nested loop and justify each step."], ["trade-off"]),
  s("sk-os-concurrency", "OS, processes and concurrency", "CS Foundations", "Processes, threads, scheduling, race conditions, async.", ["sk-c-memory"], ["role-nuwave"], ["What is a race condition and how do you prove you fixed one?"], ["concurrency"]),
  s("sk-networking", "Networking fundamentals", "CS Foundations", "HTTP, TCP/IP, DNS, latency, retries.", [], ["role-nuwave"], ["Trace what happens between typing a URL and the first byte rendered."], ["latency"]),

  // Mathematics
  s("sk-linear-algebra", "Linear algebra for ML", "Mathematics", "Vectors, matrices, tensors, products, determinants, inverse, eigen-decomposition, norms.", [], ["role-navisoft"], ["What does an eigenvector mean for a covariance matrix?"], []),
  s("sk-calculus-opt", "Calculus and optimisation", "Mathematics", "Derivatives, partial derivatives, chain rule, gradients, gradient descent, convexity.", ["sk-linear-algebra"], ["role-navisoft"], ["Derive the gradient of mean squared error for linear regression."], ["optimisation"]),
  s("sk-probability", "Probability", "Mathematics", "Random variables, conditional and joint probability, Bayes, likelihood, distributions.", [], ["role-navisoft"], ["A test is 99% accurate for a 1-in-10,000 disease. Interpret a positive result."], ["uncertainty"]),
  s("sk-statistics", "Statistical inference", "Mathematics", "Estimation, hypothesis testing, confidence intervals, A/B testing, ANOVA.", ["sk-probability"], ["role-navisoft"], ["What does a 95% confidence interval actually claim?"], ["uncertainty", "calibration"]),

  // Data
  s("sk-numpy", "NumPy and vectorised computation", "Data", "N-D arrays, broadcasting, strides, vectorisation, performance.", ["sk-python-core", "sk-linear-algebra"], ["role-navisoft"], ["Why is a vectorised operation faster than a Python loop?"], ["performance"]),
  s("sk-pandas", "Pandas data wrangling", "Data", "Loading, filtering, grouping, joining, missing values, outliers, feature engineering.", ["sk-numpy"], ["role-navisoft"], ["How do you decide between dropping, imputing and modelling missingness?"], []),
  s("sk-visualisation", "Data visualisation and storytelling", "Data", "Matplotlib, Seaborn, Plotly, chart selection, narrative.", ["sk-pandas"], ["role-navisoft"], ["Which chart would mislead here and why?"], []),
  s("sk-eda", "Exploratory data analysis", "Data", "End-to-end load → clean → analyse → communicate.", ["sk-pandas", "sk-statistics"], ["role-navisoft"], ["What is the first thing you check in an unfamiliar dataset?"], []),
  s("sk-excel-powerbi", "Excel and Power BI analytics", "Data", "Formulas, pivot tables, Power Query, data modelling, DAX, dashboards.", [], ["role-navisoft"], ["When is a BI dashboard the right deliverable instead of a notebook?"], []),
  s("sk-sql", "SQL and relational modelling", "Data", "ERD, normalisation, DDL/DML/DQL, joins, CTEs, window functions, optimisation.", [], ["role-navisoft", "role-nuwave"], ["Rewrite this correlated subquery as a window function and explain the cost difference."], []),
  s("sk-scraping", "Web scraping and data collection", "Data", "BeautifulSoup, regex, Selenium, APIs, lawful collection.", ["sk-python-errors"], ["role-navisoft"], ["How do you decide whether scraping a site is acceptable?"], []),
  s("sk-data-engineering", "Data engineering and pipelines", "Data", "ETL/ELT, warehouses, lakehouse, batch vs streaming, Airflow, dbt, Spark.", ["sk-sql"], ["role-navisoft"], ["Batch or streaming for this requirement? Justify."], ["idempotency"]),

  // ML / DL
  s("sk-ml-workflow", "ML workflow and preprocessing", "Machine Learning", "Problem framing, splits, leakage, scaling, encoding, imbalance.", ["sk-pandas", "sk-statistics"], ["role-navisoft"], ["Where does data leakage usually enter a pipeline?"], ["generalisation"]),
  s("sk-regression", "Regression modelling", "Machine Learning", "Linear/multiple regression, assumptions, MSE, R².", ["sk-ml-workflow", "sk-calculus-opt"], ["role-navisoft"], ["Your R² is high but predictions are useless. What happened?"], []),
  s("sk-classification", "Classification modelling", "Machine Learning", "Logistic regression, trees, SVM, KNN, Naive Bayes, precision/recall/F1/ROC-AUC.", ["sk-ml-workflow"], ["role-navisoft"], ["Pick a metric for a fraud model and defend it."], ["calibration"]),
  s("sk-ensembles", "Ensembles and model selection", "Machine Learning", "Cross-validation, search, bagging, boosting, XGBoost, CatBoost, stacking.", ["sk-classification", "sk-regression"], ["role-navisoft"], ["Why can cross-validated scores still be optimistic?"], ["generalisation"]),
  s("sk-unsupervised", "Unsupervised learning", "Machine Learning", "K-Means, DBSCAN, hierarchical clustering, PCA, recommenders, Apriori.", ["sk-ml-workflow", "sk-linear-algebra"], ["role-navisoft"], ["How do you validate a clustering with no labels?"], []),
  s("sk-nn-foundations", "Neural network foundations", "Deep Learning", "Architecture, backpropagation, activations, losses, optimisers, regularisation.", ["sk-calculus-opt", "sk-ml-workflow"], ["role-navisoft", "role-nuwave"], ["Walk through one backward pass by hand."], []),
  s("sk-dl-training", "Training deep models in practice", "Deep Learning", "Keras/PyTorch, batch norm, LR schedules, debugging training.", ["sk-nn-foundations"], ["role-navisoft"], ["Loss is NaN at step 300. Diagnose it."], ["reproducibility"]),
  s("sk-cv", "Computer vision", "Deep Learning", "CNNs, filters, pooling, transfer learning, detection, segmentation, OpenCV.", ["sk-dl-training"], ["role-navisoft"], ["Why does transfer learning work on a small medical dataset?"], []),
  s("sk-sequence", "Sequence models and time series", "Deep Learning", "RNN, LSTM, GRU, forecasting.", ["sk-dl-training"], ["role-navisoft"], ["Why do vanilla RNNs struggle with long dependencies?"], []),
  s("sk-nlp", "NLP fundamentals", "Deep Learning", "Preprocessing, tokenisation, TF-IDF, embeddings, seq2seq.", ["sk-dl-training"], ["role-navisoft", "role-nuwave"], ["TF-IDF or embeddings for this task? Justify."], []),
  s("sk-transformers", "Transformers and LLM internals", "LLM", "Attention, architecture, tokenisers, context windows, fine-tuning, LoRA/QLoRA.", ["sk-nlp"], ["role-navisoft", "role-nuwave"], ["Explain attention to a backend engineer in 90 seconds."], ["inference"]),
  s("sk-llm-eval", "LLM evaluation and failure analysis", "LLM", "Task metrics, hallucination analysis, regression suites, human review.", ["sk-transformers"], ["role-nuwave"], ["How do you prove a prompt change did not regress quality?"], ["calibration", "uncertainty"]),
  s("sk-rag", "Retrieval-augmented generation", "LLM", "Chunking, embeddings, vector/hybrid search, metadata filters, reranking, citation grounding.", ["sk-transformers"], ["role-nuwave"], ["Your RAG answers are confident and wrong. Find the stage that failed."], ["retrieval"]),
  s("sk-graphrag", "Knowledge graphs and GraphRAG", "LLM", "Graph construction, graph databases, graph-augmented retrieval.", ["sk-rag"], ["role-nuwave"], ["When is a graph worth the ingestion cost over plain vector search?"], []),
  s("sk-agents", "Agent and tool-use engineering", "LLM", "Tool calling, planning, memory, orchestration, multi-agent patterns, permissions.", ["sk-rag"], ["role-nuwave"], ["Argue against using an agent for this workflow."], ["orchestration"]),

  // Engineering / production
  s("sk-git", "Git and collaborative workflow", "Software Engineering", "Branching, commits, pull requests, review, versioning.", [], ["role-navisoft", "role-nuwave"], ["How do you structure a PR so review is fast?"], []),
  s("sk-testing", "Testing and quality", "Software Engineering", "Unit, integration and end-to-end tests, fixtures, coverage judgement.", ["sk-python-core"], ["role-nuwave"], ["What do you test when the output is non-deterministic?"], ["robustness"]),
  s("sk-api-design", "API design", "Software Engineering", "REST, schemas, auth, idempotency, retries, versioning.", ["sk-testing"], ["role-nuwave"], ["Make this endpoint safe to retry."], ["idempotency"]),
  s("sk-debugging", "Systematic debugging", "Software Engineering", "Hypothesis-driven diagnosis, bisection, instrumentation.", ["sk-python-errors"], ["role-navisoft", "role-nuwave"], ["Describe the last bug that took you more than a day."], ["observability"]),
  s("sk-cloud-aws", "AWS fundamentals", "Cloud", "IAM, S3, Lambda, API Gateway, EC2, ECR/ECS, CloudWatch, VPC basics.", ["sk-api-design"], ["role-navisoft", "role-nuwave"], ["Least-privilege IAM for a model inference service — sketch it."], []),
  s("sk-cloud-azure", "Azure fundamentals", "Cloud", "Entra ID, storage, compute, serverless, monitoring, identity.", ["sk-api-design"], ["role-nuwave"], ["How does Entra ID change your app's auth design?"], []),
  s("sk-containers", "Containers and IaC", "Cloud", "Docker, images, orchestration basics, Terraform/OpenTofu.", ["sk-bash-linux"], ["role-nuwave"], ["Why is your image 4GB and how do you fix it?"], ["reproducibility"]),
  s("sk-mlops", "MLOps lifecycle", "MLOps", "Data validation, experiment tracking, registry, CI/CD, monitoring, drift, rollback.", ["sk-containers", "sk-ml-workflow"], ["role-navisoft", "role-nuwave"], ["Production accuracy dropped 6 points. What is your first hour?"], ["observability", "reproducibility"]),
  s("sk-observability", "Observability and incident response", "MLOps", "Logs, metrics, traces, alerts, triage, postmortems.", ["sk-mlops"], ["role-nuwave"], ["What do you instrument in an LLM endpoint?"], ["observability", "latency"]),
  s("sk-security", "Security and responsible AI", "Security", "AuthN/AuthZ, OWASP API risks, prompt injection, privacy, governance, model cards.", ["sk-api-design"], ["role-nuwave"], ["How would you break your own RAG system?"], ["governance"]),

  // Human / professional
  s("sk-english-technical", "Technical English", "Professional", "Reading, writing, listening, speaking and interaction in engineering contexts.", [], ["role-navisoft", "role-nuwave"], ["Explain your architecture in English in three minutes."], []),
  s("sk-communication", "Technical writing and documentation", "Professional", "Design docs, ADRs, model cards, reports.", ["sk-english-technical"], ["role-nuwave"], ["Write the ADR for the decision you just described."], ["maintainability"]),
  s("sk-client-discovery", "Client discovery and scoping", "Professional", "Requirements, constraints, acceptance criteria, estimates, change control.", ["sk-communication"], ["role-nuwave"], ["A client says 'I need an AI chatbot'. What do you ask first?"], []),
  s("sk-research", "Research engineering", "Research", "Paper reading, reproduction, ablation, experimental design, critique, writing.", ["sk-statistics", "sk-dl-training"], [], ["Which claim in this paper is weakest and what experiment would test it?"], ["reproducibility"]),
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((x) => [x.id, x]));
