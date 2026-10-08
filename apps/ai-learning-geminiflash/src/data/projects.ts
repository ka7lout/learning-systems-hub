export interface ProjectSeed {
  id: string;
  slug: string;
  title: string;
  category: "computer_vision" | "nlp_llm" | "tabular_ml" | "data_engineering" | "production_systems" | "research";
  ladderLevel: number; // 1 to 10
  isOriginalCatalog: boolean;
  catalogIndex?: number;
  description: string;
  whyImportant: string;
  datasetName: string;
  datasetUrl: string;
  datasetLicense: string;
  requirements: string[];
  acceptanceCriteria: string[];
  starterCode?: string;
  architectureDiagram?: string;
  suggestedMilestones: string[];
  rubric: {
    dataPreprocessing: number; // weight %
    modelingRigor: number;
    evaluationAndFailureAnalysis: number;
    engineeringQualityAndDocs: number;
  };
}

export const CANONICAL_PROJECTS: ProjectSeed[] = [
  // ==========================================
  // ORIGINAL 21+ PROJECT CATALOG
  // ==========================================
  {
    id: "proj-01-skin-disease",
    slug: "skin-disease-prediction",
    title: "1. Skin Disease Prediction",
    category: "computer_vision",
    ladderLevel: 6,
    isOriginalCatalog: true,
    catalogIndex: 1,
    description: "Build an end-to-end dermatology classification system utilizing Transfer Learning (ResNet50 / EfficientNet) to classify dermoscopic lesion images into clinical diagnosis categories (Melanoma, Nevus, Basal Cell Carcinoma).",
    whyImportant: "Demonstrates medical vision modeling, severe class imbalance handling, fine-tuning pre-trained backbones, and calculating clinical sensitivity/specificity metrics where false negatives carry critical risk.",
    datasetName: "ISIC Archive (International Skin Imaging Collaboration)",
    datasetUrl: "https://www.isic-archive.com/",
    datasetLicense: "CC-BY-NC 4.0 / Public Research License",
    requirements: [
      "Load and augment 25,000+ dermoscopic images using Albumentations",
      "Fine-tune a pre-trained ResNet50 / EfficientNet-B4 backbone in PyTorch",
      "Apply focal loss or class-weighted cross-entropy to handle rare malignant cases",
      "Generate Grad-CAM heatmaps to visually explain model attention regions",
      "Build a Streamlit demo allowing clinicians to upload images and inspect prediction confidence intervals"
    ],
    acceptanceCriteria: [
      "Macro F1-score >= 0.84 across all 7 diagnostic classes",
      "Melanoma Recall (Sensitivity) >= 0.92 on holdout test set",
      "Grad-CAM visual attribution maps pass clinical spot checks",
      "Model Card authored documenting false negative failure modes"
    ],
    suggestedMilestones: [
      "Milestone 1: EDA, class distribution audit & dataset pipeline setup",
      "Milestone 2: Baseline ResNet transfer learning benchmark",
      "Milestone 3: Focal loss tuning & Grad-CAM interpretability integration",
      "Milestone 4: Web app packaging and Docker containerization"
    ],
    rubric: {
      dataPreprocessing: 25,
      modelingRigor: 35,
      evaluationAndFailureAnalysis: 25,
      engineeringQualityAndDocs: 15
    }
  },
  {
    id: "proj-02-face-recognition",
    slug: "face-recognition-detection-verification",
    title: "2. Face Recognition / Detection / Verification",
    category: "computer_vision",
    ladderLevel: 6,
    isOriginalCatalog: true,
    catalogIndex: 2,
    description: "Design a real-time face verification pipeline that detects faces using MTCNN / RetinaFace and generates 512-dimensional facial embeddings using FaceNet with Triplet Loss / ArcFace.",
    whyImportant: "Teaches metric learning, cosine distance thresholding, embeddings storage, and low-latency video stream processing.",
    datasetName: "LFW (Labeled Faces in the Wild) & CelebA",
    datasetUrl: "http://vis-www.cs.umass.edu/lfw/",
    datasetLicense: "Academic Research Use",
    requirements: [
      "Extract bounding boxes and 5-point facial landmarks using OpenCV / RetinaFace",
      "Compute normalized facial embeddings using FaceNet / ArcFace",
      "Implement cosine similarity thresholding for 1:1 verification and 1:N recognition",
      "Handle lighting variations, head pose rotations, and partial occlusions"
    ],
    acceptanceCriteria: [
      "Verification accuracy >= 98.2% on LFW benchmark",
      "Real-time video inference latency < 45ms per frame on CPU/GPU",
      "Zero False Acceptance Rate at threshold = 0.65"
    ],
    suggestedMilestones: ["Detection pipeline", "Embedding model integration", "Cosine threshold tuning", "Live webcam demo"],
    rubric: { dataPreprocessing: 20, modelingRigor: 35, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 20 }
  },
  {
    id: "proj-03-text-classification",
    slug: "text-classification-nlp",
    title: "3. Text Classification (Multi-Class Sentiment & Intent)",
    category: "nlp_llm",
    ladderLevel: 5,
    isOriginalCatalog: true,
    catalogIndex: 3,
    description: "Develop a multi-class NLP text classification benchmark comparing classical TF-IDF + Logistic Regression, Bi-LSTM with GloVe embeddings, and fine-tuned DistilBERT.",
    whyImportant: "Shows how to benchmark traditional statistical NLP against modern transformer fine-tuning with latency vs accuracy trade-offs.",
    datasetName: "AG News / Yelp Reviews Dataset",
    datasetUrl: "https://huggingface.co/datasets/ag_news",
    datasetLicense: "Open Academic Dataset",
    requirements: [
      "Preprocess raw text: tokenization, lowercasing, regex cleaning, subword tokenization",
      "Train TF-IDF + LinearSVC baseline and measure training time and inference latency",
      "Fine-tune Hugging Face DistilBERT using PyTorch Trainer with mixed precision (fp16)",
      "Produce confusion matrix and error analysis on ambiguous text samples"
    ],
    acceptanceCriteria: [
      "DistilBERT test accuracy >= 94.0%",
      "Inference latency documented across CPU vs GPU",
      "Detailed failure analysis categorizing sarcasm and negation errors"
    ],
    suggestedMilestones: ["Text cleaning & TF-IDF baseline", "Bi-LSTM sequence model", "DistilBERT fine-tuning", "Benchmark comparison report"],
    rubric: { dataPreprocessing: 20, modelingRigor: 35, evaluationAndFailureAnalysis: 30, engineeringQualityAndDocs: 15 }
  },
  {
    id: "proj-04-stock-market-prediction",
    slug: "stock-market-prediction-time-series",
    title: "4. Stock Market Prediction & Volatility Forecasting",
    category: "tabular_ml",
    ladderLevel: 5,
    isOriginalCatalog: true,
    catalogIndex: 4,
    description: "Construct a non-leaking time series forecasting pipeline utilizing Stacked LSTMs and XGBoost with rolling technical indicators (RSI, MACD, Bollinger Bands) to forecast price volatility.",
    whyImportant: "Enforces strict temporal chronological train-test splits, prevents look-ahead data leakage, and evaluates directional accuracy and Sharpe ratio.",
    datasetName: "Yahoo Finance S&P 500 Historical Stock Telemetry",
    datasetUrl: "https://finance.yahoo.com/",
    datasetLicense: "Public Market Telemetry",
    requirements: [
      "Ingest 10 years of OHLCV ticker data via yfinance API",
      "Calculate 15+ rolling technical indicators without future lookahead bias",
      "Implement expanding-window walk-forward validation (TimeSeriesSplit)",
      "Train LSTM and XGBoost models; compare against a naive persistence baseline"
    ],
    acceptanceCriteria: [
      "Directional accuracy > 55.5% on out-of-sample test period",
      "Zero temporal data leakage verified via unit tests",
      "Simulated backtest showing Sharpe ratio vs Buy-and-Hold"
    ],
    suggestedMilestones: ["API ingestion & indicator engineering", "Walk-forward validation setup", "LSTM & GBDT training", "Backtesting simulation"],
    rubric: { dataPreprocessing: 30, modelingRigor: 30, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 15 }
  },
  {
    id: "proj-05-sign-language-classifier",
    slug: "sign-language-classifier",
    title: "5. Sign Language Classifier",
    category: "computer_vision",
    ladderLevel: 6,
    isOriginalCatalog: true,
    catalogIndex: 5,
    description: "Create a real-time American Sign Language (ASL) alphabet and gesture recognizer using MediaPipe 21-point hand landmark coordinates and a temporal Transformer / MLP.",
    whyImportant: "Demonstrates landmark extraction, invariant geometric coordinate normalization, and real-time edge computer vision.",
    datasetName: "Sign Language MNIST & Custom MediaPipe Landmark Stream",
    datasetUrl: "https://www.kaggle.com/datasets/datamunge/sign-language-mnist",
    datasetLicense: "Public Domain",
    requirements: [
      "Extract 3D hand keypoints (x, y, z) per frame using MediaPipe Hands",
      "Normalize coordinates relative to wrist origin and palm scale",
      "Train a spatial-temporal classifier for 26 ASL alphabet signs",
      "Deploy live interactive browser webcam feed with real-time HUD"
    ],
    acceptanceCriteria: [
      "ASL recognition accuracy >= 95.0% across 5 diverse test subjects",
      "Real-time FPS >= 30 on standard laptop webcam",
      "Robustness against background noise and hand scale variations"
    ],
    suggestedMilestones: ["Landmark extraction pipeline", "Geometric normalization", "Classifier training", "Webcam HUD app"],
    rubric: { dataPreprocessing: 25, modelingRigor: 30, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 20 }
  },
  {
    id: "proj-06-real-time-object-detection",
    slug: "real-time-object-detection-yolo",
    title: "6. Real-time Object Detection with YOLOv8",
    category: "computer_vision",
    ladderLevel: 7,
    isOriginalCatalog: true,
    catalogIndex: 6,
    description: "Train a custom YOLOv8 / YOLOv9 detector on a domain-specific dataset (e.g. warehouse safety equipment or traffic monitoring), export to ONNX / TensorRT, and benchmark inference throughput.",
    whyImportant: "Teaches bounding box annotations, anchor-free detection mechanics, mAP@0.5:0.95 evaluation, and ONNX runtime optimization.",
    datasetName: "Roboflow Safety Gear / COCO Subset",
    datasetUrl: "https://universe.roboflow.com/",
    datasetLicense: "Open Source Annotation",
    requirements: [
      "Annotate or curate 2,000+ images in YOLO format (class, x_center, y_center, width, height)",
      "Train YOLOv8-small and YOLOv8-medium with Mosaic and MixUp augmentations",
      "Evaluate mAP@50 and mAP@50-95 curves across all object classes",
      "Export trained model to ONNX and benchmark CPU vs GPU TensorRT latency"
    ],
    acceptanceCriteria: [
      "mAP@50 >= 0.88 across all target classes",
      "Inference speed <= 25ms per frame on ONNX runtime",
      "Documented precision-recall curves and PR-AUC per class"
    ],
    suggestedMilestones: ["Dataset curation & split", "YOLO training loop", "mAP evaluation & error slicing", "ONNX export & latency benchmark"],
    rubric: { dataPreprocessing: 20, modelingRigor: 35, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 20 }
  },
  {
    id: "proj-07-breast-cancer-detection",
    slug: "breast-cancer-detection",
    title: "7. Breast Cancer Detection & Risk Scoring",
    category: "tabular_ml",
    ladderLevel: 4,
    isOriginalCatalog: true,
    catalogIndex: 7,
    description: "Develop a high-precision diagnostic classifier on digitized fine needle aspirate (FNA) biopsy features with calibrated probability scores and SHAP explainability.",
    whyImportant: "Demonstrates medical diagnostic evaluation: calibration curves (Brier score), optimizing decision thresholds for high sensitivity, and generating clinician feature explanations.",
    datasetName: "Wisconsin Breast Cancer Diagnostic Dataset (WDBC)",
    datasetUrl: "https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic",
    datasetLicense: "UCI Public Domain",
    requirements: [
      "Perform exhaustive EDA on cell nuclei geometric characteristics (radius, texture, concavity)",
      "Train Logistic Regression, Random Forest, and CatBoost with cross-validation",
      "Calibrate model probabilities using Platt Scaling / Isotonic Regression",
      "Compute SHAP waterfall plots explaining individual biopsy predictions"
    ],
    acceptanceCriteria: [
      "Recall on Malignant tumors >= 0.98 at chosen decision threshold",
      "ROC-AUC >= 0.985 with Brier calibration score < 0.05",
      "Interactive explanation dashboard showing feature contributions"
    ],
    suggestedMilestones: ["EDA & correlation audit", "Model comparison & cross-validation", "Probability calibration", "SHAP explanation dashboard"],
    rubric: { dataPreprocessing: 25, modelingRigor: 30, evaluationAndFailureAnalysis: 30, engineeringQualityAndDocs: 15 }
  },
  {
    id: "proj-08-brain-tumor-detection",
    slug: "brain-tumor-detection-mri-segmentation",
    title: "8. Brain Tumor Detection & MRI Segmentation",
    category: "computer_vision",
    ladderLevel: 8,
    isOriginalCatalog: true,
    catalogIndex: 8,
    description: "Implement a U-Net semantic segmentation network in PyTorch to detect and segment glioma tumors from multi-modal MRI scans (T1, T2, FLAIR).",
    whyImportant: "Deep computer vision project covering 2D/3D biomedical image segmentation, Dice coefficient loss, and medical imaging protocols.",
    datasetName: "BraTS (Brain Tumor Segmentation Challenge) / Kaggle MRI",
    datasetUrl: "https://www.kaggle.com/datasets/mateuszbuda/lgg-mri-segmentation",
    datasetLicense: "Research & Non-Commercial",
    requirements: [
      "Preprocess DICOM / NIfTI MRI slices: intensity normalization, skull-stripping, resizing",
      "Build a U-Net architecture with contracting encoder, bottleneck, and expanding decoder with skip connections",
      "Train with combined Binary Cross-Entropy + Dice Loss (Dice Coefficient)",
      "Visualize ground-truth masks vs predicted tumor contours"
    ],
    acceptanceCriteria: [
      "Mean Dice Coefficient (IoU) >= 0.82 on validation set",
      "Zero channel mismatch errors across multi-slice MRI tensors",
      "Documented qualitative analysis of false positive boundary errors"
    ],
    suggestedMilestones: ["MRI slice preprocessing pipeline", "U-Net architecture from scratch", "BCE + Dice loss training", "Validation mask evaluation"],
    rubric: { dataPreprocessing: 30, modelingRigor: 35, evaluationAndFailureAnalysis: 20, engineeringQualityAndDocs: 15 }
  },
  {
    id: "proj-09-image-generation-gans",
    slug: "image-generation-using-gans",
    title: "9. Image Generation using Deep Convolutional GANs (DCGAN)",
    category: "computer_vision",
    ladderLevel: 7,
    isOriginalCatalog: true,
    catalogIndex: 9,
    description: "Train a Deep Convolutional Generative Adversarial Network (DCGAN) to synthesize realistic synthetic faces / artwork from 100-dimensional Gaussian latent noise vectors.",
    whyImportant: "Teaches min-max game optimization, generator vs discriminator adversarial training dynamics, mode collapse debugging, and Frechet Inception Distance (FID) scoring.",
    datasetName: "CelebA / Fashion-MNIST",
    datasetUrl: "https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html",
    datasetLicense: "Non-commercial Research",
    requirements: [
      "Build Generator with Transposed Convolutions (ConvTranspose2d) and Batch Normalization",
      "Build Discriminator with Strided Convolutions and LeakyReLU activations",
      "Implement adversarial training loop with Wasserstein Loss and Gradient Penalty (WGAN-GP) to prevent mode collapse",
      "Track generated sample grids over 50 epochs and compute FID score"
    ],
    acceptanceCriteria: [
      "Clear visual face/apparel generation without mode collapse artifacts",
      "Discriminator and Generator losses maintain healthy equilibrium",
      "Frechet Inception Distance (FID) improvement documented across training epochs"
    ],
    suggestedMilestones: ["Generator/Discriminator architecture", "WGAN-GP training loop", "Sample progression tracking", "Latent space interpolation"],
    rubric: { dataPreprocessing: 15, modelingRigor: 40, evaluationAndFailureAnalysis: 30, engineeringQualityAndDocs: 15 }
  },
  {
    id: "proj-10-library-management-system",
    slug: "library-management-system-oop",
    title: "10. Library Management System (Python OOP & SQLite)",
    category: "data_engineering",
    ladderLevel: 2,
    isOriginalCatalog: true,
    catalogIndex: 10,
    description: "Engineer an Object-Oriented software system implementing books, patrons, reservations, lending transactions, and fines with transactional SQLite persistence and CLI/GUI interface.",
    whyImportant: "Demonstrates core software engineering principles: encapsulation, inheritance, schema design, and ACID transactions.",
    datasetName: "Synthetic Relational Library Database",
    datasetUrl: "#",
    datasetLicense: "Open Source / MIT",
    requirements: [
      "Design OOP class hierarchy: LibraryItem -> Book, Magazine; User -> Member, Librarian",
      "Establish SQLite schema with foreign keys and check constraints",
      "Implement checkout, return, renewal, and late-fee calculation logic with error handling",
      "Write pytest suite with 90%+ code coverage for all transaction methods"
    ],
    acceptanceCriteria: [
      "All unit tests pass with zero unhandled exceptions",
      "ACID concurrency: Prevent double-checkout of the same book item",
      "Clean modular code adhering to PEP 8 with type hints"
    ],
    suggestedMilestones: ["OOP design & ERD", "SQLite schema & DAO layer", "Business logic & pytest suite", "CLI / Web interface"],
    rubric: { dataPreprocessing: 15, modelingRigor: 25, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 35 }
  },
  {
    id: "proj-11-uber-data-analysis",
    slug: "uber-data-analysis",
    title: "11. Uber Trip Data Analysis & Geospatial Demand Modeling",
    category: "tabular_ml",
    ladderLevel: 3,
    isOriginalCatalog: true,
    catalogIndex: 11,
    description: "Conduct an in-depth spatial-temporal analysis of 4.5M+ Uber pickup records in NYC to uncover demand hotspots, rush-hour surge patterns, and weather impact.",
    whyImportant: "Teaches large-scale Pandas wrangling, Datetime decomposition, Folium/Kepler.gl geospatial visualization, and business demand forecasting.",
    datasetName: "Uber NYC Pickups Dataset (FiveThirtyEight)",
    datasetUrl: "https://github.com/fivethirtyeight/uber-tlc-foil-response",
    datasetLicense: "Public Open Data",
    requirements: [
      "Load and parse millions of timestamped GPS coordinates using Pandas",
      "Extract temporal features: Day of week, hour of day, holiday flags",
      "Generate dynamic heatmaps of pickup density across NYC boroughs using Folium",
      "Formulate statistical hypotheses regarding rainfall impact on ride demand and test with T-tests"
    ],
    acceptanceCriteria: [
      "Actionable business insights presented with clear visual storytelling",
      "Interactive geospatial maps rendered with no performance stutter",
      "Statistically validated demand correlation metrics"
    ],
    suggestedMilestones: ["Data ingestion & cleaning", "Spatial-temporal aggregations", "Geospatial heatmaps", "Executive insight deck"],
    rubric: { dataPreprocessing: 30, modelingRigor: 25, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 20 }
  },
  {
    id: "proj-12-superstore-dashboard",
    slug: "superstore-sales-analysis-dashboard",
    title: "12. Superstore Sales Analysis Dashboard (Power BI / Excel)",
    category: "data_engineering",
    ladderLevel: 2,
    isOriginalCatalog: true,
    catalogIndex: 12,
    description: "Build an executive-grade Power BI / Excel dashboard analyzing global retail sales, profit margins, shipping modes, customer segments, and regional returns.",
    whyImportant: "Demonstrates business analytics acumen: Star Schema data modeling, advanced DAX measures, Pareto 80/20 analysis, and interactive executive reporting.",
    datasetName: "Sample Superstore Retail Dataset",
    datasetUrl: "https://community.tableau.com/s/article/sample-superstore-sales-dataset",
    datasetLicense: "Public Educational",
    requirements: [
      "Clean raw orders, returns, and people tables using Power Query",
      "Model Star Schema relationships with 1-to-Many dimension constraints",
      "Write DAX measures for YTD Sales, YoY Profit Margin %, and Customer Retention",
      "Construct interactive drill-through pages for Regional Managers"
    ],
    acceptanceCriteria: [
      "Flawless filter context interactions across all slicers and visual cards",
      "Accurate DAX calculations verified against ground truth financial sums",
      "Clean aesthetic UI following corporate reporting guidelines"
    ],
    suggestedMilestones: ["Power Query ETL", "Star Schema data modeling", "DAX measure formulation", "Dashboard UX layout"],
    rubric: { dataPreprocessing: 25, modelingRigor: 25, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 25 }
  },
  {
    id: "proj-13-hr-analytics-dashboard",
    slug: "hr-analytics-dashboard-attrition",
    title: "13. HR Analytics & Employee Attrition Dashboard",
    category: "tabular_ml",
    ladderLevel: 3,
    isOriginalCatalog: true,
    catalogIndex: 13,
    description: "Analyze employee demographics, satisfaction scores, compensation tiers, and overtime hours to identify key drivers of workplace attrition and build an early flight-risk model.",
    whyImportant: "Combines Business Intelligence with predictive modeling, showing how to calculate cost-per-hire ROI and prevent talent turnover.",
    datasetName: "IBM HR Analytics Employee Attrition & Performance Dataset",
    datasetUrl: "https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset",
    datasetLicense: "Open Database License",
    requirements: [
      "Analyze 35 workplace attributes (monthly income, work-life balance, years at company)",
      "Build Power BI report with department-level turnover KPIs and attrition risk factors",
      "Train a Scikit-Learn Logistic Regression / Random Forest baseline to score flight risk",
      "Deliver strategic retention recommendations based on feature importance"
    ],
    acceptanceCriteria: [
      "Interactive KPI cards for Turnover Rate %, Retention Cost, and Department Breakdowns",
      "Predictive model ROC-AUC >= 0.82 on holdout evaluation",
      "Documented ethical audit addressing gender/age compensation equity"
    ],
    suggestedMilestones: ["Data cleaning & EDA", "Power BI dashboard design", "Attrition classifier training", "Strategic HR report"],
    rubric: { dataPreprocessing: 25, modelingRigor: 25, evaluationAndFailureAnalysis: 30, engineeringQualityAndDocs: 20 }
  },
  {
    id: "proj-14-bank-loan-analysis",
    slug: "bank-loan-data-analysis-credit-risk",
    title: "14. Bank Loan Data Analysis & Credit Default Risk Scoring",
    category: "tabular_ml",
    ladderLevel: 4,
    isOriginalCatalog: true,
    catalogIndex: 14,
    description: "Develop a credit risk scoring model to predict loan default probability based on borrower credit history, debt-to-income ratio, revolving line utilization, and loan purpose.",
    whyImportant: "Teaches financial ML governance, handling severe class imbalance, computing expected financial loss, and regulatory fairness.",
    datasetName: "Lending Club Loan Data",
    datasetUrl: "https://www.kaggle.com/datasets/wordsforthewise/lending-club",
    datasetLicense: "Public Open Data",
    requirements: [
      "Clean loan status targets (Fully Paid vs Charged Off / Default)",
      "Handle missing values in credit inquiries and employment length without leakage",
      "Train XGBoost / LightGBM with monotonic constraints on risk features",
      "Optimize decision threshold based on financial asymmetric cost matrix (cost of False Negative default = 5x cost of False Positive rejection)"
    ],
    acceptanceCriteria: [
      "ROC-AUC >= 0.85 with Gini coefficient >= 0.70",
      "Cost-optimized decision threshold maximizes net financial portfolio yield",
      "Fairness audit proving no disparate impact across demographic segments"
    ],
    suggestedMilestones: ["Credit data wrangling", "Feature engineering (DTI, revol_util)", "XGBoost tuning & threshold optimization", "Financial loss simulation"],
    rubric: { dataPreprocessing: 25, modelingRigor: 35, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 15 }
  },
  {
    id: "proj-15-sales-database",
    slug: "sales-database-postgresql-schema",
    title: "15. Enterprise Sales Database & Analytical Warehouse",
    category: "data_engineering",
    ladderLevel: 3,
    isOriginalCatalog: true,
    catalogIndex: 15,
    description: "Design and implement a production PostgreSQL relational database supporting high-throughput sales order transactions, complex joins, and analytical reporting via Window Functions.",
    whyImportant: "Core database engineering skills: 3NF normalization, index optimization (B-Tree, GIN), CTEs, stored procedures, and concurrency control.",
    datasetName: "Enterprise Sales & E-Commerce Normalized Schema",
    datasetUrl: "#",
    datasetLicense: "Open Source Schema",
    requirements: [
      "Create normalized DDL schema (Customers, Orders, OrderItems, Products, Warehouses)",
      "Seed 500,000+ realistic transaction records",
      "Write analytical queries calculating running customer lifetime value (LTV), monthly retention cohorts, and inventory reorder alerts using Window Functions",
      "Analyze execution plans with EXPLAIN ANALYZE and add composite indexes to achieve sub-10ms query times"
    ],
    acceptanceCriteria: [
      "100% referential integrity with foreign key cascades and check constraints",
      "All analytical cohort queries execute in < 25ms on 500K records",
      "Transaction ACID isolation tested under simulated concurrent writes"
    ],
    suggestedMilestones: ["Schema ERD design", "DDL scripts & synthetic data generator", "Window function query suite", "EXPLAIN ANALYZE indexing audit"],
    rubric: { dataPreprocessing: 20, modelingRigor: 30, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 25 }
  },
  {
    id: "proj-16-credit-card-fraud",
    slug: "credit-card-fraud-detection",
    title: "16. Credit Card Fraud Detection (Extreme Imbalance & Anomaly Detection)",
    category: "tabular_ml",
    ladderLevel: 5,
    isOriginalCatalog: true,
    catalogIndex: 16,
    description: "Build an ultra-low latency transaction fraud detection engine on highly skewed data (0.17% fraud rate) using Isolation Forests, Autoencoders, and XGBoost.",
    whyImportant: "Teaches precision-recall curves (PR-AUC), cost-sensitive loss functions, anomaly detection without supervision, and real-time streaming inference latency.",
    datasetName: "Credit Card Fraud Detection Dataset (ULB Machine Learning Group)",
    datasetUrl: "https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud",
    datasetLicense: "Open Database License (ODbL)",
    requirements: [
      "Analyze 284,807 transactions with 28 PCA features and transaction amount/time",
      "Implement Unsupervised Anomaly Detection: Isolation Forest and PyTorch Autoencoder reconstruction error",
      "Train Supervised XGBoost with scale_pos_weight and Focal Loss",
      "Evaluate using Precision-Recall AUC (PR-AUC) instead of misleading ROC-AUC"
    ],
    acceptanceCriteria: [
      "PR-AUC >= 0.86 on holdout test set",
      "Precision >= 0.85 at Recall >= 0.80 on fraudulent transactions",
      "Sub-5ms inference latency per transaction benchmarked"
    ],
    suggestedMilestones: ["Imbalanced data EDA", "Isolation Forest baseline", "PyTorch Autoencoder & XGBoost", "PR-AUC optimization & latency test"],
    rubric: { dataPreprocessing: 25, modelingRigor: 35, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 15 }
  },
  {
    id: "proj-17-titanic-prediction",
    slug: "titanic-survival-prediction-pipeline",
    title: "17. Titanic Survival Prediction Pipeline & Benchmark",
    category: "tabular_ml",
    ladderLevel: 3,
    isOriginalCatalog: true,
    catalogIndex: 17,
    description: "Construct a disciplined Scikit-Learn Pipeline predicting passenger survival, featuring advanced title extraction, family size grouping, and cross-validated ensemble stacking.",
    whyImportant: "The classic benchmark for rigorous feature engineering, pipeline construction, and avoiding data leakage.",
    datasetName: "Kaggle Titanic Disaster Dataset",
    datasetUrl: "https://www.kaggle.com/c/titanic",
    datasetLicense: "Public Domain",
    requirements: [
      "Engineer domain features: Name title extraction (Master, Miss, Mr), Cabin deck level, FamilySize = SibSp + Parch + 1",
      "Encapsulate preprocessing in a Scikit-Learn ColumnTransformer and Pipeline",
      "Compare Logistic Regression, SVM, Random Forest, and LightGBM with 5-Fold Stratified Cross-Validation",
      "Build a Voting / Stacking Classifier meta-model"
    ],
    acceptanceCriteria: [
      "Cross-validated accuracy >= 83.5%",
      "Zero data leakage: Pipeline fits purely inside each cross-validation fold",
      "Modular, reproducible code adhering to clean architecture standards"
    ],
    suggestedMilestones: ["EDA & title extraction", "Scikit-Learn pipeline setup", "Model comparison & hyperparameter grid", "Stacking ensemble submission"],
    rubric: { dataPreprocessing: 30, modelingRigor: 30, evaluationAndFailureAnalysis: 20, engineeringQualityAndDocs: 20 }
  },
  {
    id: "proj-18-house-pricing-prediction",
    slug: "house-pricing-advanced-regression",
    title: "18. House Pricing Prediction (Advanced Regression & Feature Engineering)",
    category: "tabular_ml",
    ladderLevel: 4,
    isOriginalCatalog: true,
    catalogIndex: 18,
    description: "Predict residential home sale prices across 79 explanatory features in Ames, Iowa using log-transformed targets, target encoding, ElasticNet, and CatBoost.",
    whyImportant: "Deep regression modeling: handling skewed continuous distributions, polynomial interaction features, regularization tuning, and evaluating with RMSLE.",
    datasetName: "Ames Housing Dataset",
    datasetUrl: "https://www.kaggle.com/c/house-prices-advanced-regression-techniques",
    datasetLicense: "Open Academic Data",
    requirements: [
      "Apply log1p transformation to right-skewed target variable (SalePrice)",
      "Impute missing categorical and numerical features using neighborhood grouping",
      "Engineer square footage totals (TotalSF = GrLivArea + TotalBsmtSF) and quality interactions",
      "Train and blend Ridge, Lasso, ElasticNet, and CatBoost models"
    ],
    acceptanceCriteria: [
      "Root Mean Squared Logarithmic Error (RMSLE) <= 0.115 on test set",
      "Residual plots confirm homoscedasticity and normality of errors",
      "Feature importance analysis documented with SHAP values"
    ],
    suggestedMilestones: ["Target transformation & EDA", "Feature engineering & encoding", "Regularized regression & GBDT models", "Model blending & residual check"],
    rubric: { dataPreprocessing: 30, modelingRigor: 35, evaluationAndFailureAnalysis: 20, engineeringQualityAndDocs: 15 }
  },
  {
    id: "proj-19-chatbot",
    slug: "contextual-ai-chatbot-fastapi",
    title: "19. Contextual AI Chatbot & Conversational Service",
    category: "nlp_llm",
    ladderLevel: 6,
    isOriginalCatalog: true,
    catalogIndex: 19,
    description: "Build a production conversational chatbot utilizing Hugging Face transformers / OpenAI API with multi-turn conversation memory, intent routing, and FastAPI backend.",
    whyImportant: "Teaches conversational state management, session handling with Redis, streaming token responses (SSE), and fallback escalation.",
    datasetName: "Conversational Intent & Multi-Turn Dialogue Dataset",
    datasetUrl: "#",
    datasetLicense: "MIT Open Source",
    requirements: [
      "Implement multi-turn conversational session buffer with token window trimming",
      "Design intent classifier routing queries to domain-specific knowledge tools",
      "Deploy FastAPI endpoint supporting Server-Sent Events (SSE) streaming output",
      "Store conversation history in Redis / PostgreSQL with session expiration"
    ],
    acceptanceCriteria: [
      "First token latency < 450ms on streaming API",
      "Maintains context coherence over at least 10 conversational turns",
      "Graceful fallback handling for out-of-domain queries"
    ],
    suggestedMilestones: ["Dialogue state manager", "FastAPI streaming endpoint", "Redis session store", "Interactive chat UI"],
    rubric: { dataPreprocessing: 20, modelingRigor: 30, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 25 }
  },
  {
    id: "proj-20-document-summarization",
    slug: "document-summarization-t5-bart",
    title: "20. Abstractive Document Summarization (T5 / BART)",
    category: "nlp_llm",
    ladderLevel: 7,
    isOriginalCatalog: true,
    catalogIndex: 20,
    description: "Fine-tune a Seq2Seq transformer (BART / T5 / Longformer) to generate concise, abstractive executive summaries from long-form research papers and news articles.",
    whyImportant: "Teaches sequence-to-sequence generation, beam search decoding, length penalties, and ROUGE-1/2/L and BERTScore evaluation.",
    datasetName: "CNN / DailyMail & PubMed Summarization Dataset",
    datasetUrl: "https://huggingface.co/datasets/cnn_dailymail",
    datasetLicense: "Academic Research License",
    requirements: [
      "Preprocess long documents with sliding window chunking to respect context limits",
      "Fine-tune BART-base / T5-base using PyTorch Seq2SeqTrainer with LoRA",
      "Tune generation parameters: max_length, min_length, num_beams, length_penalty, no_repeat_ngram_size",
      "Evaluate generated summaries using ROUGE-1, ROUGE-2, ROUGE-L, and BERTScore"
    ],
    acceptanceCriteria: [
      "ROUGE-1 >= 42.5 and ROUGE-L >= 39.0 on CNN/DailyMail test split",
      "Zero repetitive generation loops verified via beam search constraints",
      "Hallucination audit evaluating factual consistency with source document"
    ],
    suggestedMilestones: ["Dataset tokenization & chunking", "BART/T5 fine-tuning with LoRA", "ROUGE & BERTScore evaluation", "Summarization web app"],
    rubric: { dataPreprocessing: 20, modelingRigor: 35, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 20 }
  },
  {
    id: "proj-21-rag-system",
    slug: "production-rag-system",
    title: "21. Production RAG (Retrieval-Augmented Generation) System",
    category: "nlp_llm",
    ladderLevel: 8,
    isOriginalCatalog: true,
    catalogIndex: 21,
    description: "Architect an enterprise Knowledge-Base RAG system featuring semantic document chunking, hybrid dense/sparse search (Pinecone + BM25), cross-encoder reranking, and Ragas evaluation.",
    whyImportant: "The foundational architecture of modern enterprise GenAI. Demonstrates hallucination mitigation, source citation grounding, and production retrieval engineering.",
    datasetName: "Curated Technical Documentation & PDF Engineering Manuals",
    datasetUrl: "#",
    datasetLicense: "Public Technical Docs",
    requirements: [
      "Parse multi-format documents (PDF, Markdown, HTML) with metadata extraction",
      "Implement recursive character & semantic chunking with optimal overlap",
      "Store embeddings in Vector DB (Pinecone/Chroma) and configure Hybrid Search with BM25 keyword matching",
      "Add Cross-Encoder Reranker (Cohere / BGE-Reranker) to refine top-k context",
      "Benchmark retrieval and generation using Ragas (Faithfulness, Answer Relevance, Context Recall)"
    ],
    acceptanceCriteria: [
      "Ragas Faithfulness score >= 0.92 (zero ungrounded hallucinations)",
      "Context Precision >= 0.88 with reciprocal rank fusion (RRF)",
      "Strict XML source citations returned with every answer"
    ],
    suggestedMilestones: ["Document parsing & chunking pipeline", "Vector DB & Hybrid search setup", "Reranker & prompt grounding", "Ragas benchmark & API deployment"],
    rubric: { dataPreprocessing: 25, modelingRigor: 30, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 20 }
  },

  // ==========================================
  // FLAGSHIP AI SYSTEMS & RESEARCH ADDITIONS
  // ==========================================
  {
    id: "proj-22-flagship-agentic-workflow",
    slug: "autonomous-multi-agent-system",
    title: "22. Flagship: Autonomous Multi-Agent Software Engineering System",
    category: "production_systems",
    ladderLevel: 9,
    isOriginalCatalog: false,
    description: "Design a production multi-agent system (LangGraph) where specialized agents (Planner, Coder, Reviewer, Test Runner) collaborate to solve GitHub issues, generate unit tests, and submit verified PRs.",
    whyImportant: "Modern Nuwave / Navisoft AI Engineer competency: deterministic state machines, tool calling schemas, human-in-the-loop checkpoints, and agent observability.",
    datasetName: "SWE-bench Lite Issue Dataset",
    datasetUrl: "https://www.swebench.com/",
    datasetLicense: "MIT Open Source",
    requirements: [
      "Define LangGraph state machine with cyclic decision loops and human approval gates",
      "Implement safe sandboxed code execution and test verification tools",
      "Integrate OpenTelemetry tracing to monitor agent token budgets and latency",
      "Benchmark on SWE-bench Lite problems and measure patch resolution rate"
    ],
    acceptanceCriteria: [
      "Resolves >= 25% of SWE-bench Lite problem instances autonomously",
      "Zero endless loop bugs with strict step timeout guards",
      "Full ADR (Architecture Decision Record) and system card documentation"
    ],
    suggestedMilestones: ["Agent state machine design", "Tool integration & sandbox", "SWE-bench evaluation", "Production monitoring dashboard"],
    rubric: { dataPreprocessing: 15, modelingRigor: 35, evaluationAndFailureAnalysis: 25, engineeringQualityAndDocs: 25 }
  }
];
