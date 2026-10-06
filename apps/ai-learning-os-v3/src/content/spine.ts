/**
 * Canonical, human-authored content for the Ismaili Harvard AI Engineering Learning OS.
 * Every externally derived claim carries an explicit verification status.
 */

export const RETRIEVED = "2026-03-01";

export type SourceSeed = {
  id: string;
  url: string;
  title: string;
  publisher: string;
  sourceType: string;
  license?: string;
  publishedAt?: string;
  accessedAt: string;
  verificationStatus:
    | "confirmed_current"
    | "confirmed_historical"
    | "likely_not_verified"
    | "not_found"
    | "design_decision"
    | "research_hypothesis";
  notes?: string;
};

export const sourceSeeds: SourceSeed[] = [
  {
    id: "src-harvard-cs-requirements",
    url: "https://csadvising.seas.harvard.edu/concentration/requirements/",
    title: "Concentration Requirements — Harvard CS Concentration",
    publisher: "Harvard SEAS / CS Advising",
    sourceType: "official_program_page",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_current",
    notes:
      "Retrieved during build research. Confirms the CS concentration is built from tagged requirement areas (programming, formal reasoning, systems, computation and the world, advanced computer science) plus mathematical preparation, not from a single AI degree.",
  },
  {
    id: "src-harvard-cs-requirements-comparison",
    url: "https://csadvising.seas.harvard.edu/concentration/requirements/comparison/",
    title: "Requirements Comparison — Harvard CS Concentration",
    publisher: "Harvard SEAS / CS Advising",
    sourceType: "official_program_page",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_current",
    notes:
      "Confirms linear algebra and probability/multivariable-calculus mathematical preparation options (e.g. Stat 110 pathway) and the move to tag-based CS requirements.",
  },
  {
    id: "src-harvard-extension-ai-certificate",
    url: "https://extension.harvard.edu/academics/programs/artificial-intelligence-graduate-certificate/",
    title: "Artificial Intelligence Graduate Certificate (Online)",
    publisher: "Harvard Extension School",
    sourceType: "official_program_page",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_current",
    notes:
      "Four online graduate courses: one foundations of AI, one advanced NLP/ML, one deep learning and computer vision, one AI ethics/governance/law. This is Harvard Extension School, NOT Harvard College.",
  },
  {
    id: "src-cs50-syllabus",
    url: "https://cs50.harvard.edu/college/2026/fall/syllabus/",
    title: "CS50 (Harvard College) Syllabus",
    publisher: "Harvard University",
    sourceType: "official_course_page",
    accessedAt: RETRIEVED,
    verificationStatus: "likely_not_verified",
    notes:
      "Referenced by the build specification. Term-specific syllabus content was NOT fetched during this build, so weekly structure and grading weights are not encoded as fact.",
  },
  {
    id: "src-harvard-course-numbers",
    url: "https://csadvising.seas.harvard.edu/",
    title: "Harvard CS course identifiers (CS 20, CS 50, CS 51, CS 61, CS 1200, CS 1810, ...)",
    publisher: "Harvard SEAS / CS Advising",
    sourceType: "catalog_reference",
    accessedAt: RETRIEVED,
    verificationStatus: "likely_not_verified",
    notes:
      "Individual course numbers mentioned in the specification were not individually re-verified against the live catalog in this build. They are stored as CANDIDATE mappings only and must be re-checked before being presented as current fact.",
  },
  {
    id: "src-dunlosky",
    url: "https://doi.org/10.1177/1529100612453266",
    title: "Improving Students' Learning With Effective Learning Techniques",
    publisher: "Psychological Science in the Public Interest",
    sourceType: "peer_reviewed_review",
    publishedAt: "2013",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_historical",
    notes:
      "Basis for rating practice testing and distributed practice as high-utility techniques; rereading and highlighting as low-utility.",
  },
  {
    id: "src-cepeda",
    url: "https://pubmed.ncbi.nlm.nih.gov/16719566/",
    title: "Distributed practice in verbal recall tasks: A review and quantitative synthesis",
    publisher: "Psychological Bulletin",
    sourceType: "meta_analysis",
    publishedAt: "2006",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_historical",
    notes: "Basis for spacing-gap scheduling logic (gap scaled to retention interval).",
  },
  {
    id: "src-wwc-organizing",
    url: "https://ies.ed.gov/ncee/wwc/PracticeGuide/1",
    title: "Organizing Instruction and Study to Improve Student Learning",
    publisher: "IES / What Works Clearinghouse",
    sourceType: "practice_guide",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_historical",
  },
  {
    id: "src-cefr",
    url: "https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors-search",
    title: "CEFR Descriptors",
    publisher: "Council of Europe",
    sourceType: "standards_reference",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_current",
    notes: "Used for multi-dimensional English descriptors; vocabulary count alone never implies C1/C2.",
  },
  {
    id: "src-owasp-api",
    url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/",
    title: "OWASP API Security Top 10 (2023)",
    publisher: "OWASP",
    sourceType: "security_standard",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_historical",
    notes: "Drives BOLA/authorization, resource consumption and data exposure controls in this build.",
  },
  {
    id: "src-nextjs-auth",
    url: "https://nextjs.org/docs/app/guides/authentication",
    title: "Next.js Authentication Guide",
    publisher: "Vercel",
    sourceType: "framework_documentation",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_current",
  },
  {
    id: "src-wcag22",
    url: "https://www.w3.org/TR/WCAG22/",
    title: "Web Content Accessibility Guidelines (WCAG) 2.2",
    publisher: "W3C",
    sourceType: "standards_reference",
    accessedAt: RETRIEVED,
    verificationStatus: "confirmed_current",
  },
  {
    id: "src-puter",
    url: "https://developer.puter.com/",
    title: "Puter developer documentation",
    publisher: "Puter",
    sourceType: "vendor_documentation",
    accessedAt: RETRIEVED,
    verificationStatus: "likely_not_verified",
    notes:
      "Planned AI provider. No Puter credentials are configured in this environment, so the mentor runs in truthful degraded mode until a provider key exists.",
  },
  {
    id: "src-nuwave-role",
    url: "https://jobs.nuwave.com/apply/JshTpQ8tb8/AI-Engineer",
    title: "NUWAVE — AI Engineer (reference role)",
    publisher: "NUWAVE",
    sourceType: "job_posting",
    accessedAt: RETRIEVED,
    verificationStatus: "likely_not_verified",
    notes:
      "Role blueprint supplied inside the build specification. Live posting availability, seniority and location restrictions were NOT re-verified in this build.",
  },
  {
    id: "src-navisoft-role",
    url: "https://app.devfound.ai/jobs/ai-engineers-navisoft/140943",
    title: "Navisoft — AI Engineers (reference role)",
    publisher: "Navisoft (via DevFound)",
    sourceType: "job_posting",
    accessedAt: RETRIEVED,
    verificationStatus: "likely_not_verified",
    notes: "Role blueprint supplied inside the build specification; posting not re-verified in this build.",
  },
  {
    id: "src-design-decision",
    url: "internal://ihls",
    title: "IHLS design decisions and research hypotheses",
    publisher: "Ismaili Harvard Learning Science",
    sourceType: "internal",
    accessedAt: RETRIEVED,
    verificationStatus: "design_decision",
    notes: "Covers state-adaptive delivery, help-level logging, independence weighting and the mastery ladder.",
  },
];

export type StageSeed = { id: string; position: number; title: string; summary: string };

export const stageSeeds: StageSeed[] = [
  ["math-foundations", "Mathematical Foundations", "Algebra through calculus, linear algebra and the matrix calculus that machine learning actually consumes."],
  ["programming-foundations", "Programming Foundations", "The complete original Python module, preserved item by item, taught for engineering competence rather than syntax familiarity."],
  ["cs-foundations", "Computer Science Foundations", "C, memory, data structures, algorithms, formal reasoning, systems, OS and networking depth appropriate to AI engineering."],
  ["data-foundations", "Data Foundations", "NumPy, array semantics, vectorisation and the numerical substrate underneath every ML library."],
  ["stats-probability", "Statistics and Probability", "Probability, inference, estimation and uncertainty — the discipline knowledge behind model evaluation."],
  ["data-analysis", "Data Analysis", "Pandas wrangling, EDA, visualisation, storytelling, plus the Excel / Power BI business analytics extension."],
  ["data-engineering", "Data Engineering", "SQL, database design, scraping, APIs, warehousing, ETL/ELT, Spark and orchestration."],
  ["classical-ml", "Classical Machine Learning", "Regression, classification, ensembles, unsupervised learning, model selection and evaluation literacy."],
  ["deep-learning", "Deep Learning", "Neural networks, backpropagation, optimisation, training dynamics and experiment discipline."],
  ["computer-vision", "Computer Vision", "CNNs, transfer learning, detection, segmentation and classical image processing."],
  ["nlp", "Natural Language Processing", "Preprocessing, representations, embeddings, sequence models and neural NLP."],
  ["transformers-llms", "Transformers and LLMs", "Attention, architecture, tokenisation, inference control, fine-tuning, LoRA/QLoRA and evaluation."],
  ["rag", "RAG and GraphRAG", "Chunking, vector and hybrid search, reranking, citation grounding, knowledge graphs and RAG evaluation."],
  ["agents", "Agents and Multi-Agent Systems", "Tool calling, planning, memory, orchestration, permissions and the decision of when NOT to use an agent."],
  ["software-engineering", "Software Engineering for AI", "Git, review, typing, testing, API design, concurrency, refactoring and release engineering."],
  ["cloud", "Cloud Engineering", "AWS depth plus Azure familiarity: identity, storage, compute, serverless, networking and monitoring."],
  ["mlops", "MLOps and Production ML", "The full lifecycle from data validation to drift, retraining and rollback."],
  ["security-governance", "Security, Responsible AI and Governance", "OWASP thinking, prompt injection, privacy, fairness, model cards and management-system concepts."],
  ["technical-english", "Technical English", "Reading, listening, writing, speaking, interaction, vocabulary and professional communication as separate tracked dimensions."],
  ["career", "Career and Interview Engineering", "Role requirement decomposition, evidence mapping, CV value classification and interview simulation."],
  ["freelance", "Freelancing", "Discovery, scope, acceptance criteria, estimation, proposals, change requests and delivery."],
  ["research", "Research Engineering", "Paper reading, reproduction, ablation, experimental design, critique and scientific writing."],
].map(([id, title, summary], i) => ({ id, position: i + 1, title, summary }));

/* ------------------------------------------------------------------ */

export type SkillSeed = {
  id: string;
  name: string;
  category: string;
  description: string;
  depthTarget: "deep" | "strong" | "applied" | "familiarity" | "foundation";
};

export const skillSeeds: SkillSeed[] = [
  ["python", "Python", "Programming", "Idiomatic Python: data structures, OOP, errors, modules, packaging.", "deep"],
  ["sql", "SQL", "Data", "Query authoring, joins, window functions, optimisation and schema design.", "deep"],
  ["typescript", "TypeScript", "Programming", "Typed application code for AI product surfaces.", "strong"],
  ["bash", "Bash / Linux CLI", "Systems", "Shell scripting, process control and environment management.", "strong"],
  ["c-lang", "C", "Systems", "Memory model, pointers, compilation and manual resource management.", "foundation"],
  ["r-lang", "R", "Statistics", "Applied statistical analysis and reporting.", "applied"],
  ["sas", "SAS", "Statistics", "Role-specific familiarity for enterprise statistical environments.", "familiarity"],
  ["java", "Java", "Programming", "Applied software-engineering familiarity for JVM codebases.", "familiarity"],
  ["algorithms", "Algorithms and Complexity", "CS Core", "Correctness reasoning, asymptotics, design techniques.", "deep"],
  ["data-structures", "Data Structures", "CS Core", "Lists, trees, hash tables, graphs and their trade-offs.", "deep"],
  ["os-systems", "Operating Systems and Concurrency", "CS Core", "Processes, threads, memory hierarchy, scheduling.", "strong"],
  ["networking", "Networking", "CS Core", "HTTP, TCP/IP, DNS and distributed communication basics.", "strong"],
  ["linear-algebra", "Linear Algebra", "Mathematics", "Vectors, matrices, eigen-structure, transformations.", "deep"],
  ["calculus", "Calculus and Matrix Calculus", "Mathematics", "Derivatives, partials, gradients, chain rule, Jacobians.", "deep"],
  ["probability", "Probability", "Mathematics", "Random variables, distributions, conditioning, Bayes.", "deep"],
  ["statistics", "Statistical Inference", "Mathematics", "Estimation, testing, intervals, assumptions, interpretation.", "deep"],
  ["optimization", "Optimization", "Mathematics", "Gradient methods, convexity, objective design.", "strong"],
  ["numpy", "NumPy", "Data", "Array semantics, broadcasting, vectorisation, performance.", "deep"],
  ["pandas", "Pandas", "Data", "Wrangling, joins, grouping, missing data, feature engineering.", "deep"],
  ["visualization", "Data Visualization", "Data", "Matplotlib/Seaborn/Plotly and honest data storytelling.", "strong"],
  ["excel-powerbi", "Excel and Power BI", "Business Analytics", "Pivot tables, Power Query, data modelling, DAX, dashboards.", "applied"],
  ["scraping", "Web Scraping and API Collection", "Data", "BeautifulSoup, regex, Selenium, API ingestion, legality.", "applied"],
  ["data-engineering", "Data Engineering", "Data", "Modelling, warehousing, ETL/ELT, batch vs streaming.", "strong"],
  ["spark", "Spark and Big Data", "Data", "Distributed processing, Spark SQL, partitioning, shuffle costs.", "applied"],
  ["airflow-dbt", "Airflow and dbt", "Data", "Orchestration and transformation workflows.", "applied"],
  ["classical-ml", "Classical Machine Learning", "AI/ML", "Linear models, trees, SVM, KNN, ensembles, clustering.", "deep"],
  ["model-evaluation", "Model Evaluation", "AI/ML", "Metric selection, validation design, failure analysis, calibration.", "deep"],
  ["deep-learning", "Deep Learning", "AI/ML", "Architectures, optimisation, regularisation, training dynamics.", "deep"],
  ["computer-vision", "Computer Vision", "AI/ML", "CNNs, transfer learning, detection, segmentation.", "strong"],
  ["nlp", "Natural Language Processing", "AI/ML", "Text processing, representations, sequence modelling.", "strong"],
  ["transformers", "Transformers and LLMs", "AI/ML", "Attention, tokenisation, inference, fine-tuning, evaluation.", "deep"],
  ["rag", "RAG and Vector Search", "AI/ML", "Chunking, embeddings, hybrid search, reranking, grounding.", "deep"],
  ["graphrag", "Knowledge Graphs and GraphRAG", "AI/ML", "Graph modelling, traversal-based retrieval.", "applied"],
  ["agents", "Agent Engineering", "AI/ML", "Tool calling, planning, memory, orchestration, guardrails.", "strong"],
  ["pytorch", "PyTorch", "AI/ML", "Tensors, autograd, training loops, debugging.", "strong"],
  ["tensorflow", "TensorFlow / Keras", "AI/ML", "Model building and training in the Keras API.", "applied"],
  ["huggingface", "Hugging Face", "AI/ML", "Models, tokenizers, datasets, PEFT.", "strong"],
  ["software-engineering", "Software Engineering", "Engineering", "Decomposition, review, maintainability, release discipline.", "deep"],
  ["git", "Git and GitHub", "Engineering", "Branching, PRs, review, history hygiene.", "deep"],
  ["testing", "Testing", "Engineering", "Unit, integration, E2E, regression and fixture design.", "strong"],
  ["api-design", "API Design", "Engineering", "REST, contracts, idempotency, errors, versioning.", "strong"],
  ["docker", "Docker and Containers", "Engineering", "Images, layers, reproducible runtime packaging.", "strong"],
  ["fastapi", "FastAPI", "Engineering", "Typed Python service endpoints for model serving.", "strong"],
  ["streamlit", "Streamlit", "Engineering", "Rapid internal ML interfaces.", "applied"],
  ["aws", "AWS", "Cloud", "IAM, S3, Lambda, API Gateway, ECR/ECS, CloudWatch, VPC basics.", "strong"],
  ["azure", "Azure", "Cloud", "Entra ID, storage, compute, serverless, monitoring.", "applied"],
  ["terraform", "Terraform / OpenTofu", "Cloud", "Infrastructure as code and reproducible environments.", "applied"],
  ["mlops", "MLOps", "Production", "Tracking, registry, CI/CD, deployment, monitoring, rollback.", "deep"],
  ["observability", "Observability", "Production", "Logs, metrics, traces, alerting and incident triage.", "strong"],
  ["security", "Application and AI Security", "Security", "AuthZ, injection, prompt injection, secrets, least privilege.", "strong"],
  ["responsible-ai", "Responsible AI and Governance", "Security", "Bias, privacy, model cards, oversight, management systems.", "strong"],
  ["system-design", "System Design", "Engineering", "Requirements, components, failure modes, scaling, cost.", "strong"],
  ["research", "Research Engineering", "Research", "Reproduction, ablation, experimental design, critique, writing.", "strong"],
  ["technical-english", "Technical English", "Communication", "Professional reading, writing, speaking and interaction.", "strong"],
  ["communication", "Professional Communication", "Communication", "Documentation, presentation, client and incident communication.", "strong"],
  ["freelancing", "Freelancing Practice", "Career", "Discovery, scoping, estimation, proposals, delivery.", "applied"],
].map(([id, name, category, description, depthTarget]) => ({
  id,
  name,
  category,
  description,
  depthTarget: depthTarget as SkillSeed["depthTarget"],
}));

export const skillEdgeSeeds: [string, string][] = [
  ["python", "numpy"],
  ["python", "pandas"],
  ["python", "classical-ml"],
  ["numpy", "deep-learning"],
  ["linear-algebra", "deep-learning"],
  ["calculus", "optimization"],
  ["optimization", "deep-learning"],
  ["probability", "statistics"],
  ["statistics", "model-evaluation"],
  ["classical-ml", "deep-learning"],
  ["deep-learning", "computer-vision"],
  ["deep-learning", "nlp"],
  ["nlp", "transformers"],
  ["transformers", "rag"],
  ["rag", "graphrag"],
  ["rag", "agents"],
  ["sql", "data-engineering"],
  ["data-engineering", "spark"],
  ["software-engineering", "mlops"],
  ["docker", "mlops"],
  ["aws", "mlops"],
  ["mlops", "observability"],
  ["security", "responsible-ai"],
  ["data-structures", "algorithms"],
  ["c-lang", "os-systems"],
];

/* ------------------------------------------------------------------ */

export type CareerRoleSeed = {
  id: string;
  title: string;
  organization: string;
  sourceUrl: string;
  snapshotDate: string;
  verificationStatus: string;
  region: string;
  seniority: string;
  summary: string;
  hardRequirements: string[];
  preferredRequirements: string[];
  skills: string[];
  interviewQuestions: string[];
  notes: string;
};

export const careerRoleSeeds: CareerRoleSeed[] = [
  {
    id: "role-navisoft-ai-engineer",
    title: "AI Engineer (Navisoft-style blueprint)",
    organization: "Navisoft",
    sourceUrl: "https://app.devfound.ai/jobs/ai-engineers-navisoft/140943",
    snapshotDate: RETRIEVED,
    verificationStatus: "likely_not_verified",
    region: "Remote (not re-verified)",
    seniority: "Mid",
    summary:
      "Broad AI/statistics/data-platform role blueprint: model development plus enterprise statistics and big-data tooling.",
    hardRequirements: [
      "AI/ML model development",
      "Python",
      "SQL and database design",
      "Model evaluation",
      "Predictive modelling",
      "Data mining",
      "Cloud deployment (AWS)",
    ],
    preferredRequirements: [
      "TensorFlow",
      "PyTorch",
      "NLP",
      "Statistical modelling in R",
      "SAS",
      "Hadoop",
      "Spark",
      "ETL with Talend",
      "Generative AI",
      "Bash",
      "VBA",
      "Java",
      "C",
      "Scalable systems",
    ],
    skills: [
      "python", "sql", "classical-ml", "model-evaluation", "deep-learning", "nlp",
      "tensorflow", "pytorch", "r-lang", "sas", "spark", "data-engineering", "aws", "bash", "java", "c-lang",
    ],
    interviewQuestions: [
      "A model reaches 96% accuracy but misses most positive cases in a high-risk subgroup. What do you change first and why?",
      "When would you choose a gradient-boosted tree ensemble over a neural network for tabular data?",
      "Explain how you would design an ETL pipeline that must survive a schema change upstream.",
      "How do you detect and prevent target leakage in a predictive-modelling project?",
    ],
    notes:
      "Role blueprint supplied by the learner inside the build specification. Treat breadth items (SAS, VBA, Hadoop) as targeted familiarity rather than deep study; verify the live posting before applying.",
  },
  {
    id: "role-nuwave-ai-engineer",
    title: "AI Engineer (NUWAVE-style production blueprint)",
    organization: "NUWAVE",
    sourceUrl: "https://jobs.nuwave.com/apply/JshTpQ8tb8/AI-Engineer",
    snapshotDate: RETRIEVED,
    verificationStatus: "likely_not_verified",
    region: "Not re-verified (location restrictions may apply)",
    seniority: "Mid / Senior",
    summary:
      "Production AI engineering: cloud-native agentic and retrieval systems with real security, identity and operational responsibility.",
    hardRequirements: [
      "Python",
      "TypeScript",
      "AWS or Azure",
      "Containers and serverless",
      "RAG and vector search",
      "Agent workflows",
      "Git, testing, deployment and rollback",
      "Technical documentation",
      "Incident response",
    ],
    preferredRequirements: [
      "GraphRAG and graph databases",
      "LangGraph / LangChain",
      "Terraform or OpenTofu",
      "Microsoft Graph and Teams apps",
      "Entra ID identity integration",
      "Multi-agent orchestration",
      "ISO/IEC 42001 concepts",
      "Distributed systems",
      "Observability",
    ],
    skills: [
      "python", "typescript", "aws", "azure", "docker", "terraform", "rag", "graphrag", "agents",
      "git", "testing", "api-design", "observability", "security", "responsible-ai", "system-design", "communication",
    ],
    interviewQuestions: [
      "Your RAG answers cite the wrong document after a corpus refresh. Walk through your triage.",
      "When is a deterministic workflow strictly better than an agent? Give a concrete example.",
      "How do you prevent prompt injection from a retrieved document escalating tool permissions?",
      "Describe your rollback plan for a bad model/prompt release at 2am.",
    ],
    notes:
      "Reference role, not an employment guarantee. Seniority, location restrictions and availability must be re-verified before use in an application.",
  },
];

/* ------------------------------------------------------------------ */

export const englishTermSeeds: {
  id: string; term: string; b1b2: string; arabic: string; example: string; category: string;
}[] = [
  ["encapsulation", "Encapsulation", "Keeping the inside details of a component hidden and offering a controlled interface.", "التغليف: إخفاء تفاصيل التنفيذ وإتاحة واجهة محددة.", "We improved encapsulation so callers no longer depend on the internal cache format.", "Software"],
  ["abstraction", "Abstraction", "Describing what something does without describing how it does it.", "التجريد: وصف الوظيفة دون تفاصيل التنفيذ.", "The storage abstraction lets us swap S3 for local disk in tests.", "Software"],
  ["idempotency", "Idempotency", "Running the same request twice gives the same result as running it once.", "الطلب المتكرر لا يغيّر النتيجة عن المرة الأولى.", "Make the retraining webhook idempotent so retries cannot duplicate runs.", "Engineering"],
  ["observability", "Observability", "How well you can understand what a system is doing from its logs, metrics and traces.", "القابلية للمراقبة: فهم سلوك النظام من مخرجاته.", "Without request IDs our observability during the incident was poor.", "Production"],
  ["generalization", "Generalization", "How well a model works on data it has never seen.", "التعميم: أداء النموذج على بيانات جديدة.", "Validation accuracy dropped, which suggests weak generalization.", "AI/ML"],
  ["calibration", "Calibration", "Whether a model's confidence matches how often it is actually right.", "المعايرة: تطابق ثقة النموذج مع دقته الفعلية.", "The classifier is accurate but badly calibrated above 0.9 confidence.", "AI/ML"],
  ["inference", "Inference", "Using a trained model to produce outputs.", "الاستدلال: تشغيل النموذج للحصول على نتائج.", "Inference latency rose after we increased the context window.", "AI/ML"],
  ["orchestration", "Orchestration", "Coordinating several steps, services or agents in a controlled order.", "التنسيق بين عدة خطوات أو خدمات.", "The orchestration layer retries the retrieval step before calling the model.", "Agents"],
  ["concurrency", "Concurrency", "Handling several tasks that overlap in time.", "التزامن: تنفيذ مهام متداخلة زمنياً.", "The worker uses async concurrency to overlap network waits.", "CS"],
  ["reproducibility", "Reproducibility", "Being able to get the same result again from the same inputs.", "قابلية إعادة الإنتاج بنفس النتائج.", "Pin the seed and the dependency versions for reproducibility.", "Research"],
  ["robustness", "Robustness", "Continuing to work correctly when inputs or conditions are imperfect.", "المتانة: الصمود أمام مدخلات غير مثالية.", "We tested robustness against truncated and malformed documents.", "Engineering"],
  ["maintainability", "Maintainability", "How easy it is for another engineer to change the code safely.", "سهولة الصيانة والتعديل الآمن.", "Splitting the module improved maintainability more than any rewrite.", "Software"],
  ["scalability", "Scalability", "Keeping performance acceptable as load grows.", "قابلية التوسع مع زيادة الحمل.", "Scalability is limited by the single-writer database, not the model.", "Systems"],
  ["uncertainty", "Uncertainty", "Not knowing the exact value; expressed with probability or intervals.", "عدم اليقين: يُعبَّر عنه باحتمال أو فترة ثقة.", "Report the interval so stakeholders see the uncertainty.", "Statistics"],
  ["trade-off", "Trade-off", "Accepting less of one good thing to get more of another.", "مقايضة: التنازل عن ميزة لصالح أخرى.", "There is a latency/quality trade-off in reranking.", "Engineering"],
  ["provenance", "Provenance", "The documented origin and history of data or an artefact.", "مصدر البيانات وتاريخها الموثق.", "We rejected the dataset because its provenance was undocumented.", "Data"],
  ["drift", "Drift", "The data or relationships changing after deployment.", "الانحراف: تغير البيانات بعد النشر.", "Feature drift explained the silent quality drop.", "Production"],
  ["leakage", "Leakage", "Information from the future or the target sneaking into training data.", "تسرب معلومات الهدف إلى بيانات التدريب.", "The ID column leaked the label ordering.", "AI/ML"],
  ["grounding", "Grounding", "Tying generated answers to actual retrieved evidence.", "إسناد الإجابة إلى مصادر حقيقية.", "Every claim in the answer must have grounding in a cited chunk.", "RAG"],
  ["least-privilege", "Least privilege", "Giving each component only the access it truly needs.", "أقل صلاحية ممكنة لكل مكوّن.", "The agent runs under a least-privilege role with read-only data access.", "Security"],
].map(([id, term, b1b2, arabic, example, category]) => ({ id, term, b1b2, arabic, example, category }));

/* ------------------------------------------------------------------ */

export const freelanceSeeds = [
  {
    id: "fl-chatbot-discovery",
    title: "Client discovery: “I need an AI chatbot”",
    clientBrief:
      "SIMULATION. A 40-person logistics company writes: “We need an AI chatbot for our website. Our competitor has one. How much and how fast?”",
    hiddenConstraints: [
      "Their documentation lives in SharePoint and is three years out of date",
      "Legal will not allow customer PII to leave the EU",
      "Peak traffic is 40 concurrent users for two hours a day",
      "They expect the tool to answer shipment status, which needs a live API, not retrieval",
    ],
    requiredQuestions: [
      "Who are the users and what tasks must they complete?",
      "What is the authoritative content source and how often does it change?",
      "Which systems must it integrate with?",
      "What data is sensitive, and where may it be processed?",
      "What volume and latency do you expect?",
      "How will we evaluate whether answers are correct?",
      "Where will it be deployed and who maintains it?",
      "What is the budget range and the decision timeline?",
    ],
    deliverables: ["Discovery notes", "Scope statement with explicit exclusions", "Acceptance criteria", "Estimate with assumptions", "Proposal"],
    stage: "discovery",
  },
  {
    id: "fl-scope-change",
    title: "Change request mid-project",
    clientBrief:
      "SIMULATION. Two weeks into a fixed-scope RAG delivery the client asks to “also support Arabic documents and add a dashboard — small additions, right?”",
    hiddenConstraints: [
      "Arabic documents are scanned PDFs requiring OCR",
      "The dashboard implies a new auth surface",
      "The original acceptance criteria mention English only",
    ],
    requiredQuestions: [
      "Which acceptance criteria does this change affect?",
      "Is OCR quality acceptable on your actual scans?",
      "Who may see the dashboard and how do they authenticate?",
      "Should this extend the timeline or replace existing scope?",
      "Shall I price this as a separate change order?",
    ],
    deliverables: ["Impact analysis", "Change order", "Revised timeline"],
    stage: "change_request",
  },
];
