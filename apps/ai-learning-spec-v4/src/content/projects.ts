import type { ProjectSpec } from "./types";

// Original 21-project catalog — preserved in full (spec §171), organized on the
// 10-level project ladder (spec §170). Real public data policy applies (spec §172).

const DOD_BASE = [
  "Requirements and acceptance criteria written before coding",
  "Real public data/API with documented source, license, and acquisition date",
  "Repository with README, reproducible setup, and honest results",
  "Evaluation is valid (no leakage) and failures are analyzed, not hidden",
  "Portfolio evidence captured (repo link + short case-study notes)",
];

function p(
  slug: string,
  title: string,
  level: ProjectSpec["level"],
  levelName: string,
  summary: string,
  dataPolicy: string,
  skills: string[],
  cvClass: ProjectSpec["cvClass"],
  extraDod: string[] = []
): ProjectSpec {
  return {
    slug,
    title,
    level,
    levelName,
    sourceCategory: "original",
    summary,
    dataPolicy,
    definitionOfDone: [...DOD_BASE, ...extraDod],
    skills,
    cvClass,
  };
}

export const PROJECTS: ProjectSpec[] = [
  p(
    "library-management-system",
    "Library Management System",
    1,
    "Python engineering",
    "A CLI/structured Python application with classes, custom exceptions, and file persistence — your OOP fundamentals made real.",
    "No external data required; persistence via CSV/JSON you define. Any sample records must be labeled as fixtures.",
    ["python-core", "software-engineering"],
    "skill_evidence"
  ),
  p(
    "uber-data-analysis",
    "Uber Data Analysis",
    2,
    "Data analysis",
    "Full EDA pipeline on public ride data: load, clean, analyze, visualize, and present defensible insights.",
    "Use a real public rides dataset (e.g., an open NYC trip-data release). Record source URL, license, and acquisition date.",
    ["numpy-pandas", "eda", "visualization"],
    "skill_evidence"
  ),
  p(
    "superstore-dashboard",
    "Superstore Data Analysis Dashboard",
    2,
    "Data analysis",
    "Business analytics dashboard answering real commercial questions from the public Superstore dataset.",
    "Public Superstore sample dataset; document the exact variant and its terms.",
    ["eda", "visualization", "business-analytics"],
    "skill_evidence"
  ),
  p(
    "hr-dashboard",
    "HR Dashboard",
    2,
    "Data analysis",
    "Power BI/Excel HR analytics: headcount, attrition, and compensation views built on a modeled star schema.",
    "Use a public HR analytics dataset; record provenance. Synthetic records allowed ONLY if explicitly labeled synthetic in the report.",
    ["business-analytics", "visualization"],
    "skill_evidence"
  ),
  p(
    "bank-loan-analysis",
    "Bank Loan Data Analysis",
    2,
    "Data analysis",
    "Loan portfolio EDA: default patterns, risk segments, and an honest discussion of bias risks in lending data.",
    "Real public lending dataset (e.g., an open loan-club style release). Document license, leakage, and bias risks explicitly.",
    ["eda", "statistics", "visualization"],
    "technical_artifact"
  ),
  p(
    "sales-database",
    "Sales Database",
    3,
    "SQL / data pipeline",
    "Design, normalize, load, and query a sales database end to end — schema decisions defended in writing.",
    "Load real public sales/order data or API-collected data; document schema, data dictionary, and provenance.",
    ["sql", "data-engineering"],
    "skill_evidence"
  ),
  p(
    "titanic-prediction",
    "Titanic Prediction",
    4,
    "Classical ML",
    "The classic baseline classification exercise done honestly: proper splits, baselines, and error analysis instead of leaderboard chasing.",
    "Public Titanic dataset (open competition data); cite the exact source.",
    ["classical-ml", "evaluation"],
    "practice_only"
  ),
  p(
    "house-pricing-prediction",
    "House Pricing Prediction",
    4,
    "Classical ML",
    "Regression with real features: feature engineering, residual diagnostics, and a model card.",
    "Public housing dataset (e.g., an open city/competition release); record version and license.",
    ["classical-ml", "statistics", "evaluation"],
    "skill_evidence"
  ),
  p(
    "credit-card-fraud",
    "Credit Card Fraud Detection",
    4,
    "Classical ML",
    "Severe class imbalance, asymmetric costs, threshold engineering, and honest metric selection — the complete evaluation-literacy workout.",
    "Public anonymized fraud dataset; document its PCA-anonymized nature and the limits that places on interpretation.",
    ["classical-ml", "evaluation"],
    "portfolio_project",
    ["Precision/recall trade-off analysis with an explicit cost argument", "Model card with subgroup failure analysis"]
  ),
  p(
    "stock-market-prediction",
    "Stock Market Prediction",
    5,
    "Deep learning",
    "Time-series forecasting with LSTM against naive baselines — and an honest write-up about why beating them is hard.",
    "Real public market data via a documented API; record ticker set, date range, and acquisition date.",
    ["deep-learning", "time-series"],
    "technical_artifact",
    ["Naive/seasonal baseline comparison reported even if the NN loses"]
  ),
  p(
    "skin-disease-prediction",
    "Skin Disease Prediction",
    6,
    "CV / NLP",
    "Transfer-learning image classifier on dermatology data, with explicit ethics/safety framing: this is coursework, not a medical device.",
    "Public research dataset (e.g., an open dermatology image archive) under its stated terms; cite it. Must include a 'not for clinical use' statement.",
    ["deep-learning", "computer-vision"],
    "portfolio_project",
    ["Ethics note: intended use, misuse risks, and dataset bias discussion"]
  ),
  p(
    "breast-cancer-detection",
    "Breast Cancer Detection",
    6,
    "CV / NLP",
    "Classification on public diagnostic data with calibration and false-negative analysis at the center, not accuracy.",
    "Public diagnostic dataset (e.g., the open Wisconsin dataset); cite the archive and license.",
    ["classical-ml", "deep-learning", "evaluation"],
    "technical_artifact",
    ["Calibration curve + FN cost analysis", "'Not for clinical use' statement"]
  ),
  p(
    "brain-tumor-detection",
    "Brain Tumor Detection",
    6,
    "CV / NLP",
    "CNN/transfer-learning on public MRI imagery with segmentation awareness and honest small-data claims.",
    "Public research MRI dataset under its stated terms; cite it. 'Not for clinical use' statement required.",
    ["deep-learning", "computer-vision"],
    "portfolio_project"
  ),
  p(
    "face-recognition",
    "Face Recognition / Detection / Verification",
    6,
    "CV / NLP",
    "Detection vs recognition vs verification implemented and clearly distinguished, with a serious privacy and consent section.",
    "Use only properly licensed research datasets and/or your own consented images. Privacy analysis is mandatory.",
    ["computer-vision", "deep-learning"],
    "technical_artifact",
    ["Privacy, consent, and misuse analysis section in the README"]
  ),
  p(
    "sign-language-classifier",
    "Sign Language Classifier",
    6,
    "CV / NLP",
    "Gesture classification from public sign-language imagery — an accessibility-motivated vision project.",
    "Public sign-language dataset; cite source and license.",
    ["computer-vision", "deep-learning"],
    "portfolio_project"
  ),
  p(
    "realtime-object-detection",
    "Real-time Object Detection",
    6,
    "CV / NLP",
    "YOLO-based detection with latency measurement: accuracy vs FPS trade-offs made explicit.",
    "Pretrained open weights + public video/images with documented licenses.",
    ["computer-vision", "mlops-deployment"],
    "technical_artifact",
    ["Measured latency/FPS table on your hardware"]
  ),
  p(
    "text-classification",
    "Text Classification",
    6,
    "CV / NLP",
    "TF-IDF vs embedding approaches compared on a real corpus, with an argued winner per constraint set.",
    "Real public text corpus (reviews, news, tickets); cite source and license.",
    ["nlp", "classical-ml", "evaluation"],
    "skill_evidence"
  ),
  p(
    "image-generation-gans",
    "Image Generation using GANs",
    6,
    "CV / NLP (generative)",
    "Train a small GAN, document training instability honestly, and discuss generative-model ethics.",
    "Public image dataset suitable for generative training; cite license. Generated images must be labeled as generated.",
    ["deep-learning", "computer-vision"],
    "technical_artifact"
  ),
  p(
    "document-summarization",
    "Document Summarization",
    7,
    "LLM / RAG",
    "Extractive and abstractive summarization with a real evaluation protocol (not vibes): reference summaries or structured human rubric.",
    "Public document corpus; cite source. LLM outputs must never be presented as human-written.",
    ["nlp", "llm-engineering"],
    "technical_artifact"
  ),
  p(
    "chatbot",
    "Chatbot",
    7,
    "LLM / RAG",
    "A scoped task-oriented assistant with explicit boundaries, failure handling, and honest 'I don't know' behavior.",
    "Grounding corpus must be real and documented; conversation logs from testing are test artifacts, never user metrics.",
    ["llm-engineering", "software-engineering"],
    "portfolio_project",
    ["Documented instruction hierarchy and prompt-injection mitigation"]
  ),
  p(
    "rag-system",
    "RAG System",
    8,
    "Agentic / retrieval systems",
    "Retrieval-augmented answering over a real corpus: chunking, embeddings, vector search, citation grounding, and a retrieval-quality evaluation set.",
    "Real public document corpus with documented provenance; retrieval citations must point to real chunks.",
    ["llm-engineering", "data-engineering", "evaluation"],
    "signature_project",
    [
      "Retrieval evaluation set with hit-rate/groundedness results",
      "Hallucination analysis: cases where generation ignored retrieval",
      "Deployed demo or reproducible run instructions",
    ]
  ),
];

export function getProject(slug: string) {
  return PROJECTS.find((pr) => pr.slug === slug);
}

export const LADDER_LEVELS: { level: number; name: string }[] = [
  { level: 1, name: "Python engineering" },
  { level: 2, name: "Data analysis" },
  { level: 3, name: "SQL / data pipeline" },
  { level: 4, name: "Classical ML" },
  { level: 5, name: "Deep learning" },
  { level: 6, name: "CV / NLP" },
  { level: 7, name: "LLM / RAG" },
  { level: 8, name: "Agentic systems" },
  { level: 9, name: "Production AI" },
  { level: 10, name: "Research" },
];
