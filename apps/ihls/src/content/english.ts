import type { EnglishTerm } from "./types";

/**
 * §154–§158. Standard Technical English is the default. The canonical term is
 * always kept; only the surrounding language is simplified in B1–B2 mode.
 * CEFR dimensions are tracked separately and never inferred from vocabulary count.
 */

export const ENGLISH_DIMENSIONS = [
  "Reading",
  "Listening",
  "Writing",
  "Speaking",
  "Interaction",
  "Technical Vocabulary",
  "Professional Communication",
] as const;

export type EnglishDimension = (typeof ENGLISH_DIMENSIONS)[number];

const t = (term: string, domain: string, b1b2: string, arabic: string, example: string, ipa?: string): EnglishTerm => ({
  term,
  domain,
  b1b2,
  arabic,
  example,
  ...(ipa ? { ipa } : {}),
});

export const ENGLISH_TERMS: EnglishTerm[] = [
  t("encapsulation", "Software engineering", "Keeping the inside details of a component hidden and offering a controlled way to use it.", "التغليف: إخفاء تفاصيل التنفيذ داخل المكوّن وإتاحة واجهة محددة للتعامل معه.", "Encapsulation means the caller does not need to know how the cache is stored.", "/ɪnˌkæpsjʊˈleɪʃən/"),
  t("abstraction", "Software engineering", "Showing only what matters and hiding the rest.", "التجريد: إظهار ما يهم وإخفاء التفاصيل الأقل أهمية.", "The repository is an abstraction over the database driver."),
  t("robustness", "Engineering", "How well a system keeps working when something unexpected happens.", "المتانة: قدرة النظام على الاستمرار في العمل عند حدوث أخطاء أو مدخلات غير متوقعة.", "We tested robustness by sending malformed input to every endpoint."),
  t("observability", "Production", "How easily you can understand what a running system is doing from the outside.", "قابلية الملاحظة: مدى سهولة فهم ما يحدث داخل النظام من خلال السجلات والمقاييس والتتبع.", "Without traces we had no observability into the retrieval stage.", "/əbˌzɜːvəˈbɪləti/"),
  t("idempotency", "API design", "A request can be sent more than once and the result stays the same.", "الخاصية الجامدة: تكرار نفس الطلب لا يغيّر النتيجة النهائية.", "We added an idempotency key so a retry cannot create two charges.", "/ˌaɪdɛmˈpoʊtənsi/"),
  t("generalisation", "Machine learning", "How well a model works on data it has never seen.", "التعميم: أداء النموذج على بيانات جديدة لم يرها أثناء التدريب.", "The gap between training and validation loss told us generalisation was poor."),
  t("calibration", "Machine learning", "Whether a model's confidence matches how often it is actually right.", "المعايرة: مدى تطابق ثقة النموذج مع دقته الفعلية.", "A calibrated model that says 70% should be right about 70% of the time."),
  t("inference", "Machine learning", "Using a trained model to produce an output.", "الاستدلال: تشغيل النموذج المدرَّب للحصول على نتيجة.", "Inference latency matters more than training time for this product."),
  t("orchestration", "Systems", "Coordinating several steps or services so they run in the right order.", "التنسيق: إدارة تشغيل عدة خطوات أو خدمات بالترتيب الصحيح.", "The orchestration layer decides which tool the agent may call next."),
  t("concurrency", "Systems", "Several tasks making progress during the same period of time.", "التزامن: تقدّم عدة مهام في نفس الفترة الزمنية.", "A race condition appeared only under high concurrency."),
  t("reproducibility", "Research / MLOps", "Being able to get the same result again from the same inputs.", "قابلية إعادة الإنتاج: الحصول على نفس النتيجة عند إعادة التنفيذ بنفس المدخلات.", "Pin the seed, the data version and the library versions for reproducibility."),
  t("maintainability", "Software engineering", "How cheap it is to change the code later without breaking it.", "قابلية الصيانة: سهولة تعديل الكود لاحقًا دون كسره.", "We traded a little performance for maintainability."),
  t("scalability", "Systems", "Whether the system still works when the load grows.", "قابلية التوسع: قدرة النظام على التعامل مع زيادة الحمل.", "Scalability failed at 200 requests per second, not at 20."),
  t("uncertainty", "Statistics", "How much you do not know about a number you estimated.", "عدم اليقين: مقدار ما لا نعرفه حول القيمة المقدَّرة.", "Report the interval, not just the point estimate, so uncertainty is visible."),
  t("trade-off", "Engineering", "Getting something better by accepting something worse.", "المفاضلة: تحسين جانب مقابل التنازل عن جانب آخر.", "The trade-off is lower latency for higher cost per request."),
  t("latency", "Production", "The delay between a request and its response.", "زمن الاستجابة: التأخير بين إرسال الطلب واستلام الرد.", "P95 latency, not the average, is what users notice."),
  t("provenance", "Data", "Where data came from and what happened to it.", "مصدر البيانات ومسارها: من أين جاءت البيانات وماذا جرى عليها.", "Every chunk stores its provenance so a citation can be verified."),
  t("retrieval", "LLM systems", "Finding the right documents to give the model before it answers.", "الاسترجاع: جلب المستندات المناسبة قبل توليد الإجابة.", "Measure retrieval separately from generation."),
  t("governance", "Responsible AI", "The rules and responsibilities that control how a system is used.", "الحوكمة: القواعد والمسؤوليات التي تحكم استخدام النظام.", "Governance means someone is accountable, not that a document exists."),
  t("optimisation", "Mathematics", "Finding the input that makes a quantity as small or as large as possible.", "الأمثلة/التحسين: إيجاد القيم التي تُصغّر أو تُكبّر دالة معينة.", "Training is an optimisation problem with a non-convex surface."),
];

/** §159 Speaking Lab activity catalogue. */
export const SPEAKING_ACTIVITIES = [
  { id: "sp-concept", label: "Explain a concept", prompt: "Explain the concept you studied most recently, aloud, for 90 seconds, without reading." },
  { id: "sp-code", label: "Explain your code", prompt: "Walk through a function you wrote and justify one decision inside it." },
  { id: "sp-project", label: "Explain your project", prompt: "Give a two-minute description of your current project: problem, approach, evidence." },
  { id: "sp-architecture", label: "Defend an architecture", prompt: "Defend your architecture choice, then answer the objection you would least like to hear." },
  { id: "sp-interview", label: "Technical interview answer", prompt: "Answer a technical interview question aloud, structured as claim → evidence → limitation." },
  { id: "sp-client", label: "Client discovery", prompt: "Run a client discovery conversation: ask the questions that define scope before promising anything." },
  { id: "sp-incident", label: "Incident communication", prompt: "Give a 60-second incident update: impact, current status, next step, next update time." },
];
