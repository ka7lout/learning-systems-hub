import type { LessonSpec } from "./types";

export type ItemSpec = {
  key: string;
  lessonKey: string;
  type:
    | "free_recall"
    | "explain"
    | "predict_output"
    | "code_reading"
    | "debugging"
    | "transfer"
    | "case_decision"
    | "choose_method"
    | "derivation"
    | "complexity"
    | "mcq"
    | "oral";
  stage: "recall" | "application" | "transfer" | "case";
  difficulty: "A" | "B" | "C" | "D" | "E" | "F";
  prompt: string;
  context?: string;
  options?: string[];
  answerKey?: string;
  rubric: string[];
  skillKeys: string[];
};

/** Hand-written high-signal items. Deliberately not multiple choice. */
export const HANDCRAFTED_ITEMS: ItemSpec[] = [
  {
    key: "it-m1l1-predict",
    lessonKey: "oc-m1-l1",
    type: "predict_output",
    stage: "application",
    difficulty: "B",
    prompt:
      "Predict the exact printed output BEFORE running anything, then explain each line of your reasoning.",
    context: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a, len(a))\nprint(7 / 2, 7 // 2, -7 // 2, 7 % 2)\nprint(0 or 'fallback', '' or 'fallback', 'x' or 'fallback')",
    rubric: [
      "States [1, 2, 3, 4] 4 and explains that a and b name the same object",
      "States 3.5 3 -4 1 and explains floor division toward negative infinity",
      "States fallback fallback x and explains that `or` returns an operand, not a boolean",
    ],
    skillKeys: ["python", "programming-fundamentals"],
  },
  {
    key: "it-m1l4-debug",
    lessonKey: "oc-m1-l4",
    type: "debugging",
    stage: "application",
    difficulty: "C",
    prompt:
      "This binary search hangs on some inputs. Find the defect, state the failing input, explain the broken invariant, and give the corrected line.",
    context:
      "def bsearch(a, target):\n    lo, hi = 0, len(a) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] == target:\n            return mid\n        if a[mid] < target:\n            lo = mid\n        else:\n            hi = mid - 1\n    return -1",
    rubric: [
      "Identifies `lo = mid` as the non-progressing update (should be mid + 1)",
      "Gives a concrete input that loops or misses, e.g. a = [1, 3] with target 3",
      "States the invariant: the target, if present, lies within the active range, which must shrink each iteration",
    ],
    skillKeys: ["algorithms", "debugging", "python"],
  },
  {
    key: "it-m2l3-derive",
    lessonKey: "oc-m2-l3",
    type: "derivation",
    stage: "application",
    difficulty: "C",
    prompt:
      "With the source closed, derive ∂L/∂w for L = (ŷ − y)², ŷ = σ(z), z = wx + b. Then state what happens to this gradient when |z| is large, and what design change the field adopted because of it.",
    rubric: [
      "Produces 2(ŷ − y)·σ(z)(1 − σ(z))·x with correct chain-rule structure",
      "States that σ(z)(1 − σ(z)) → 0 for large |z|, so the gradient vanishes",
      "Connects this to replacing sigmoid with ReLU in hidden layers",
    ],
    skillKeys: ["calculus", "deep-learning", "mathematics"],
  },
  {
    key: "it-m2l5-case",
    lessonKey: "oc-m2-l5",
    type: "case_decision",
    stage: "case",
    difficulty: "D",
    prompt:
      "A screening test has 99% sensitivity and 99% specificity for a condition affecting 1 in 1000 people. A product manager says 'the model is 99% accurate, let's auto-notify everyone who tests positive.' Compute P(condition | positive), then write the two-sentence reply you would actually send.",
    rubric: [
      "Computes approximately 9% using natural frequencies or Bayes' rule",
      "Explains the base-rate effect without jargon",
      "Recommends a concrete action (confirmatory step, threshold change, or human review) rather than only objecting",
    ],
    skillKeys: ["probability", "model-evaluation", "communication"],
  },
  {
    key: "it-m3l3-debug",
    lessonKey: "oc-m3-l3",
    type: "debugging",
    stage: "application",
    difficulty: "C",
    prompt:
      "After this merge the report shows revenue roughly three times higher than finance expects, and a reviewer asks you to explain. List the checks you run, in order, and name the two most likely causes.",
    context:
      "orders = pd.read_csv('orders.csv')        # one row per order\nitems  = pd.read_csv('order_items.csv')   # one row per line item\ndf = orders.merge(items, on='order_id')\nrevenue = df['order_total'].sum()",
    rubric: [
      "Identifies the one-to-many join duplicating order_total across line items",
      "Checks row counts before and after the merge, and key uniqueness",
      "Proposes aggregating line items first, or summing a line-level amount instead of the order total",
    ],
    skillKeys: ["pandas", "data-quality", "debugging"],
  },
  {
    key: "it-m6l1-case",
    lessonKey: "oc-m6-l1",
    type: "case_decision",
    stage: "case",
    difficulty: "D",
    prompt:
      "A colleague reports 0.97 ROC-AUC on a churn model. Their notebook scales features and imputes missing values on the full dataset, then splits, then oversamples the minority class, then cross-validates. Identify every methodological defect, rank them by severity, and state what the honest next step is.",
    rubric: [
      "Names leakage from fitting the scaler and imputer before splitting",
      "Names oversampling applied before the split/outside the fold",
      "Explains that the reported score is not merely optimistic but uninformative",
      "Next step: rebuild as a Pipeline inside cross-validation and re-measure before any other work",
    ],
    skillKeys: ["machine-learning", "model-evaluation", "data-quality"],
  },
  {
    key: "it-m6l3-case",
    lessonKey: "oc-m6-l3",
    type: "case_decision",
    stage: "case",
    difficulty: "E",
    prompt:
      "A triage model reports 96% accuracy. On the 4% of cases labelled severe, recall is 0.55. The clinical lead asks whether to deploy. Give your recommendation with: the metric you would report instead, the threshold decision, one subgroup check, and the single sentence you would put in the model card.",
    rubric: [
      "Rejects accuracy and proposes recall at a fixed precision and/or PR-AUC with a cost rationale",
      "Proposes lowering the threshold deliberately and quantifies the false-positive cost",
      "Specifies a disaggregated evaluation (e.g. by age, site, device) ",
      "Model-card sentence states the limitation honestly rather than marketing the result",
    ],
    skillKeys: ["model-evaluation", "responsible-ai", "communication"],
  },
  {
    key: "it-m7l1-debug",
    lessonKey: "oc-m7-l1",
    type: "debugging",
    stage: "application",
    difficulty: "C",
    prompt:
      "For each training signature, give the most likely cause and the FIRST change you would make: (a) training loss falls steadily, validation loss rises after epoch 3; (b) both losses are flat and high from the start; (c) loss becomes NaN in epoch 1; (d) validation accuracy is higher than training accuracy throughout.",
    rubric: [
      "(a) overfitting → regularization/early stopping/more data, not a bigger model",
      "(b) underfitting, learning rate too small, or a broken label/feature pipeline → verify the data path first",
      "(c) learning rate too high / exploding gradients / log(0) → lower LR, clip gradients, check numerics",
      "(d) dropout or augmentation active only at training time, or an easy/leaked validation split",
    ],
    skillKeys: ["deep-learning", "debugging", "optimization"],
  },
  {
    key: "it-m7l6-choose",
    lessonKey: "oc-m7-l6",
    type: "choose_method",
    stage: "transfer",
    difficulty: "D",
    prompt:
      "For each case choose retrieval, fine-tuning, both, or neither — and justify in one sentence each: (1) an internal assistant must answer from a policy library that changes weekly and must cite sources; (2) outputs must always follow a strict JSON schema and a house tone; (3) the model must answer questions about a 5000-page manual it has never seen; (4) the team wants 'better answers' but has no evaluation set.",
    rubric: [
      "(1) retrieval — changing knowledge plus citation requirement",
      "(2) fine-tuning (or structured decoding) — behaviour and format, not knowledge",
      "(3) retrieval — knowledge access beyond the context window",
      "(4) neither yet — build an evaluation set first; without measurement no change is justifiable",
    ],
    skillKeys: ["llm", "rag", "model-evaluation"],
  },
  {
    key: "it-m8l1-review",
    lessonKey: "oc-m8-l1",
    type: "code_reading",
    stage: "application",
    difficulty: "C",
    prompt:
      "Review this endpoint as if it were a pull request. List every defect you would block the merge on, with a one-line reason each.",
    context:
      "@app.post('/predict')\ndef predict(payload: dict):\n    model = joblib.load('model.pkl')\n    df = pd.DataFrame([payload])\n    return {'prediction': float(model.predict(df)[0])}",
    rubric: [
      "No request schema/validation — untyped dict accepts anything",
      "Model loaded per request — latency and memory cost",
      "No model version in the response — predictions cannot be attributed to a release",
      "No error handling, no logging/request id, no health endpoint",
      "Silent column-order/missing-feature risk when building the DataFrame",
    ],
    skillKeys: ["fastapi", "software-engineering", "deployment", "testing"],
  },
  {
    key: "it-formal-complexity",
    lessonKey: "hc-formal-l1",
    type: "complexity",
    stage: "transfer",
    difficulty: "D",
    prompt:
      "You must count, for each of n queries, how many of m stored items are within distance d. The naive solution is O(nm). Describe one approach that improves the expected cost, state its assumption, and say when the naive version is still the right engineering choice.",
    rubric: [
      "Proposes indexing/bucketing/sorting/ANN with a stated assumption (e.g. low dimensionality, metric structure)",
      "Gives the improved expected complexity and names what it costs (build time, memory, approximation)",
      "Identifies that for small n·m the naive version is simpler, exact and correct — complexity is not a goal in itself",
    ],
    skillKeys: ["algorithms", "complexity-analysis", "system-design"],
  },
  {
    key: "it-security-bola",
    lessonKey: "ie-security-l1",
    type: "debugging",
    stage: "application",
    difficulty: "D",
    prompt:
      "Find the vulnerability class, explain how you would exploit it in one sentence, and write the corrected query logic.",
    context:
      "// GET /api/projects/:id?userId=123\nconst project = await db.query.projects.findFirst({\n  where: eq(projects.id, Number(params.id)),\n});\nif (project.ownerId === Number(searchParams.get('userId'))) return project;",
    rubric: [
      "Names broken object-level authorization and the trust placed in a client-supplied userId",
      "Exploit: change the userId (or read the object before the check) to access another user's data",
      "Fix: derive the user id from the authenticated server session and filter in the query: id = :id AND owner_id = session.userId",
    ],
    skillKeys: ["security", "software-engineering"],
  },
  {
    key: "it-rag-case",
    lessonKey: "ie-rag-l1",
    type: "case_decision",
    stage: "case",
    difficulty: "E",
    prompt:
      "Users say your RAG assistant 'makes things up'. You have no evaluation set. Describe exactly what you build and measure first, in order, and state the decision rule that tells you whether the problem is retrieval or generation.",
    rubric: [
      "Builds a small labelled set of questions with known supporting passages before changing anything",
      "Measures recall@k first; low recall ⇒ retrieval problem (chunking, hybrid search, reranking)",
      "If recall is high but answers are unsupported ⇒ generation/grounding problem (citation enforcement, prompt, model)",
      "Explicitly refuses to tune prompts before measurement",
    ],
    skillKeys: ["rag", "model-evaluation", "llm"],
  },
  {
    key: "it-agents-choose",
    lessonKey: "ie-agents-l1",
    type: "choose_method",
    stage: "transfer",
    difficulty: "D",
    prompt:
      "A client wants to 'use AI agents' to process incoming invoices: extract fields, validate against a purchase order, and flag mismatches for review. Place this on the five-rung decision ladder, justify your rung, and name the two controls you would add regardless.",
    rubric: [
      "Recognises the steps are known and fixed ⇒ deterministic workflow with one or two bounded model calls for extraction",
      "Justifies rejecting an agent: no need for dynamic planning, and non-determinism is a liability in a financial process",
      "Controls: schema-validated extraction output and human confirmation before any irreversible action; plus logging of every step",
    ],
    skillKeys: ["agents", "system-design", "security"],
  },
  {
    key: "it-career-evidence",
    lessonKey: "ie-career-l1",
    type: "transfer",
    stage: "transfer",
    difficulty: "C",
    prompt:
      "Rewrite this CV bullet so every claim maps to verifiable evidence, and list the artifacts you would need to support it: 'Experienced in machine learning and cloud deployment, improved model performance significantly.'",
    rubric: [
      "Replaces vague claims with a specific system, method and measurement",
      "Names the baseline being compared against",
      "Lists concrete artifacts: repository, evaluation report/metric source, deployment URL or infrastructure definition",
      "Contains no number the learner could not show on request",
    ],
    skillKeys: ["career", "communication", "technical-english"],
  },
  {
    key: "it-english-oral",
    lessonKey: "ie-english-l1",
    type: "oral",
    stage: "transfer",
    difficulty: "D",
    prompt:
      "Speak for 2–3 minutes in English (record or type a transcript): explain a technical decision you made recently using the structure context → decision → reason → trade-off → what would change it.",
    rubric: [
      "All five structural elements present and in order",
      "Uses at least three canonical technical terms correctly",
      "States a trade-off explicitly rather than only advantages",
      "Hedges honestly where evidence is missing",
    ],
    skillKeys: ["technical-english", "communication"],
  },
];

/**
 * Default item set generated for every lesson that has no hand-written items.
 * These are real retrieval / explanation / transfer prompts grounded in the
 * lesson's own objectives and topics — not multiple-choice filler.
 */
export function defaultItemsFor(lesson: LessonSpec): ItemSpec[] {
  const topicList = lesson.topics.slice(0, 8).join(", ");
  const primary = lesson.objectives[0] ?? lesson.title;
  const last = lesson.objectives[lesson.objectives.length - 1] ?? lesson.title;
  return [
    {
      key: `it-${lesson.key}-recall`,
      lessonKey: lesson.key,
      type: "free_recall",
      stage: "recall",
      difficulty: "B",
      prompt: `Close the lesson. From memory, write what you can recall about: ${topicList}. Then reopen it and mark what you missed.`,
      rubric: [
        "Attempted from memory before reopening the material",
        "Covers the core ideas rather than surface vocabulary",
        "Identifies at least one gap honestly",
      ],
      skillKeys: lesson.skillKeys,
    },
    {
      key: `it-${lesson.key}-explain`,
      lessonKey: lesson.key,
      type: "explain",
      stage: "application",
      difficulty: "C",
      prompt: `Explain in your own words, as if to a competent colleague who has not studied this: ${primary}. Include one concrete example and one common mistake.`,
      rubric: [
        "Explanation is accurate and not copied phrasing",
        "Includes a concrete example",
        "Names a realistic failure mode or common mistake",
      ],
      skillKeys: lesson.skillKeys,
    },
    {
      key: `it-${lesson.key}-transfer`,
      lessonKey: lesson.key,
      type: "transfer",
      stage: "transfer",
      difficulty: "D",
      prompt: `Transfer task: describe a situation from a domain you have NOT studied in this lesson where "${last}" would change your decision. State the decision, the reasoning, and what evidence would prove you wrong.`,
      rubric: [
        "Situation is genuinely different from the lesson's examples",
        "Decision follows from the principle rather than pattern-matching",
        "States disconfirming evidence — what would change the decision",
      ],
      skillKeys: lesson.skillKeys,
    },
  ];
}
