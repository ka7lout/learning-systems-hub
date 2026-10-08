export interface EnglishTermSeed {
  term: string;
  category: string;
  partOfSpeech: string;
  b1b2Definition: string;
  technicalDefinition: string;
  arabicMeaning: string;
  pronunciationIpa: string;
  exampleSentence: string;
  commonMistakes: string;
}

export const CANONICAL_ENGLISH_TERMS: EnglishTermSeed[] = [
  {
    term: "Encapsulation",
    category: "Software Engineering",
    partOfSpeech: "noun",
    b1b2Definition: "Keeping code details hidden inside a box and only showing what other parts need to use.",
    technicalDefinition: "The bundling of data with the methods that operate on that data, restricting direct access to internal state components to enforce invariant integrity.",
    arabicMeaning: "التغليف / كبسلة البيانات",
    pronunciationIpa: "/ɪnˌkæp.sjəˈleɪ.ʃən/",
    exampleSentence: "Encapsulation in Python is achieved by prefixing private attributes with underscores and providing controlled property getters.",
    commonMistakes: "Do not confuse encapsulation (information hiding) with abstraction (simplifying interfaces)."
  },
  {
    term: "Abstraction",
    category: "Software Engineering",
    partOfSpeech: "noun",
    b1b2Definition: "Hiding complex work so the user only sees a simple, easy interface.",
    technicalDefinition: "The mechanism of hiding concrete implementation complexity behind high-level interfaces or Abstract Base Classes (ABCs).",
    arabicMeaning: "التجريد",
    pronunciationIpa: "/æbˈstræk.ʃən/",
    exampleSentence: "PyTorch provides high-level abstractions like torch.nn.Module so developers do not manually write backward gradient formulas.",
    commonMistakes: "Abstraction is about creating clean mental models, not merely shortening code."
  },
  {
    term: "Robustness",
    category: "System Engineering",
    partOfSpeech: "noun",
    b1b2Definition: "The ability of a computer system to keep working even when strange or unexpected inputs occur.",
    technicalDefinition: "The degree to which a software system or ML model correctly handles invalid inputs, noisy distributions, or stressful runtime conditions without crashing.",
    arabicMeaning: "المتانة / صلابة النظام",
    pronunciationIpa: "/roʊˈbʌst.nəs/",
    exampleSentence: "We tested the robustness of the computer vision pipeline by injecting synthetic Gaussian noise and motion blur into the test images.",
    commonMistakes: "Robustness is different from accuracy; an accurate model can be fragile under distribution shift."
  },
  {
    term: "Idempotency",
    category: "Backend & Systems",
    partOfSpeech: "noun",
    b1b2Definition: "A property where doing the same action multiple times produces the exact same result as doing it once.",
    technicalDefinition: "A mathematical and systems property where an operation can be applied multiple times without changing the result beyond the initial application (e.g. HTTP PUT/DELETE or Airflow DAG tasks).",
    arabicMeaning: "خاصية التكرار المتماثل (عدم تغير النتيجة بتكرار العملية)",
    pronunciationIpa: "/ˌaɪ.dəmˈpoʊ.tən.si/",
    exampleSentence: "To guarantee reliable data pipelines, every step in our ETL pipeline was engineered for strict idempotency.",
    commonMistakes: "HTTP POST is typically non-idempotent, whereas HTTP PUT and GET are idempotent."
  },
  {
    term: "Generalization",
    category: "Machine Learning",
    partOfSpeech: "noun",
    b1b2Definition: "How well a trained model performs on new data it has never seen before.",
    technicalDefinition: "The capability of an algorithmic model to accurately predict outputs on unseen data drawn from the target joint distribution, rather than merely memorizing the training samples.",
    arabicMeaning: "التعميم / القدرة على التنبؤ ببيانات جديدة",
    pronunciationIpa: "/ˌdʒɛn.ər.ə.laɪˈzeɪ.ʃən/",
    exampleSentence: "Regularization techniques like Dropout and weight decay prevent overfitting and significantly improve the network's generalization error.",
    commonMistakes: "High training accuracy with low validation accuracy is a clear sign of poor generalization (overfitting)."
  },
  {
    term: "Calibration",
    category: "Machine Learning",
    partOfSpeech: "noun",
    b1b2Definition: "Making sure the confidence score (e.g. 80%) actually matches the real probability of being correct.",
    technicalDefinition: "The agreement between predicted probability estimates and empirical true class frequencies across the output distribution.",
    arabicMeaning: "المعايرة الاحتمالية",
    pronunciationIpa: "/ˌkæl.ɪˈbreɪ.ʃən/",
    exampleSentence: "In clinical diagnostic systems, probability calibration via Platt scaling is essential so that a 90% cancer risk score genuinely corresponds to a 9-in-10 occurrence.",
    commonMistakes: "Modern deep neural networks are often overconfident and uncalibrated despite having high accuracy."
  },
  {
    term: "Orchestration",
    category: "MLOps & Cloud",
    partOfSpeech: "noun",
    b1b2Definition: "Managing and coordinating many different automated steps or software agents so they work together smoothly.",
    technicalDefinition: "The automated coordination, scheduling, and management of multiple interdependent computational workflows, containers, or autonomous AI agents.",
    arabicMeaning: "التنسيق والإدارة الآلية (أوركسترا الأنظمة)",
    pronunciationIpa: "/ˌɔːr.kəˈstreɪ.ʃən/",
    exampleSentence: "We used LangGraph for agentic orchestration, routing complex customer queries across specialized planning and execution agents.",
    commonMistakes: "Orchestration manages the entire workflow DAG, whereas choreography relies on decentralized events."
  },
  {
    term: "Observability",
    category: "Production Engineering",
    partOfSpeech: "noun",
    b1b2Definition: "Being able to understand what is happening inside a system by looking at its outputs and logs.",
    technicalDefinition: "The extent to which the internal execution state and performance health of a system can be inferred from its external outputs: metrics, distributed traces, and structured logs.",
    arabicMeaning: "قابلية المراقبة والاستدلال على حالة النظام",
    pronunciationIpa: "/əbˌzɜːr.vəˈbɪl.ə.ti/",
    exampleSentence: "Production LLM observability requires tracking token latency, prompt costs, context drift, and hallucination metrics in real time.",
    commonMistakes: "Observability is proactive insight into unknown failure modes, whereas basic monitoring only checks predefined thresholds."
  },
  {
    term: "Concurrency",
    category: "Computer Science",
    partOfSpeech: "noun",
    b1b2Definition: "Managing multiple tasks at the same time so they make progress without waiting for each other.",
    technicalDefinition: "The ability of different parts of a program or algorithm to be executed out-of-order or in partial order without affecting the final outcome.",
    arabicMeaning: "التزامن / معالجة مهام متعددة متزامنة",
    pronunciationIpa: "/kənˈkɜːr.ən.si/",
    exampleSentence: "FastAPI handles high concurrency for inference requests using Python's asyncio non-blocking event loop.",
    commonMistakes: "Concurrency is about dealing with lots of things at once (structure); parallelism is doing lots of things at once (execution across CPU/GPU cores)."
  },
  {
    term: "Trade-off",
    category: "Engineering Judgment",
    partOfSpeech: "noun",
    b1b2Definition: "Giving up one benefit or feature in order to gain a different, more important advantage.",
    technicalDefinition: "A situational decision that involves diminishing or losing one quality or property of a design in exchange for gains in other aspects (e.g. latency vs accuracy).",
    arabicMeaning: "المفاضلة الهندسية / الموازنة بين ميزتين متضادتين",
    pronunciationIpa: "/ˈtreɪd.ɔːf/",
    exampleSentence: "Quantizing the 70B model to 4-bit weights introduced a minor accuracy trade-off in exchange for a 75% reduction in GPU memory requirements.",
    commonMistakes: "In senior engineering, there are rarely perfect solutions—only defensible engineering trade-offs."
  }
];
