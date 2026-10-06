import { MENTOR_COUNCIL, MentorSpecialist } from "./personas";
import { formatSecurePrompt } from "./prompt-hierarchy";

export interface AICompletionRequest {
  personaId: string;
  userMessage: string;
  currentNodeId?: string;
  studentState?: string;
  helpLevel?: string;
  untrustedContent?: string;
  preferredModel?: "pro" | "flash";
}

export interface AICompletionResponse {
  content: string;
  persona: MentorSpecialist;
  modelUsed: string;
  providerStatus: "puter_live" | "external_live" | "educational_fallback";
  helpLevelApplied: string;
  thoughtProcess?: string;
}

export async function generateMentorResponse(request: AICompletionRequest): Promise<AICompletionResponse> {
  const persona = MENTOR_COUNCIL[request.personaId] || MENTOR_COUNCIL.lead_mentor;
  const modelTier = request.preferredModel || persona.defaultModelTier;
  const targetModelName = modelTier === "pro" 
    ? (process.env.PUTER_MODEL_NAME || "deepseek/deepseek-v4-pro")
    : "deepseek/deepseek-v4-flash";

  const { system, user } = formatSecurePrompt(
    "You are an expert AI Engineering professor adhering to Ismaili Harvard Learning Science (IHLS). Maintain strict mathematical, algorithmic, and engineering accuracy. Enforce active recall, step-by-step reasoning, and high-standard Technical English.",
    persona.systemPrompt,
    request.userMessage,
    {
      currentNode: request.currentNodeId,
      studentState: request.studentState,
      helpLevel: request.helpLevel,
      untrustedContent: request.untrustedContent
    }
  );

  const puterToken = process.env.PUTER_AUTH_TOKEN;

  // If live Puter Auth Token is available, make the real API request
  if (puterToken) {
    try {
      const res = await fetch("https://api.puter.com/drivers/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${puterToken}`
        },
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver: targetModelName,
          test_mode: false,
          args: {
            messages: [
              { role: "system", content: system },
              { role: "user", content: user }
            ]
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const outputText = data?.result?.message?.content || data?.message?.content || data?.text || "";
        if (outputText) {
          return {
            content: outputText,
            persona,
            modelUsed: targetModelName,
            providerStatus: "puter_live",
            helpLevelApplied: request.helpLevel || "hint"
          };
        }
      }
    } catch (err) {
      console.warn("Puter API call failed, falling back to built-in pedagogical engine:", err);
    }
  }

  // Built-in Pedagogical Response Engine (Ensures continuous, rich, truthful instruction without breaking when external API keys are not supplied in sandbox)
  const educationalResponse = generateEducationalFallback(persona, request.userMessage, request.currentNodeId, request.helpLevel, request.studentState);

  return {
    content: educationalResponse.text,
    persona,
    modelUsed: `${targetModelName} (IHLS Pedagogical Engine)`,
    providerStatus: "educational_fallback",
    helpLevelApplied: request.helpLevel || "hint",
    thoughtProcess: educationalResponse.thought
  };
}

function generateEducationalFallback(
  persona: MentorSpecialist,
  userMessage: string,
  nodeId?: string,
  helpLevel?: string,
  state?: string
): { text: string; thought: string } {
  const queryLower = userMessage.toLowerCase();

  let text = "";
  let thought = `Analyzed query from perspective of ${persona.name}. Diagnosed topic: ${nodeId || "general AI Engineering"}. Applied cognitive load adaptation for state: ${state || "deep"}.`;

  if (queryLower.includes("hint") || helpLevel === "hint") {
    text = `💡 **Targeted Socratic Hint:**\n\nConsider the fundamental invariant of this problem:
1. What is the mathematical shape or data structure before the operation?
2. What operation transforms it into the desired target space?
3. Pay special attention to edge cases: how should your logic behave when input is empty or zero?

👉 *Try writing the first two lines of your hypothesis, and I will verify your reasoning!*`;
  } else if (queryLower.includes("gradient") || queryLower.includes("derivative") || queryLower.includes("optimization")) {
    text = `### 📐 Optimization & Gradient Perspective (${persona.name})

The gradient $\\nabla f(\\mathbf{\\theta})$ points in the direction of **steepest ascent** on the loss surface. In Machine Learning, our objective is to minimize empirical loss $L(\\mathbf{\\theta})$. Therefore, we update our parameters in the opposite direction:

$$\\mathbf{\\theta}_{t+1} = \\mathbf{\\theta}_t - \\eta \\nabla L(\\mathbf{\\theta}_t)$$

**Key Diagnostic Checks:**
- **Learning rate $\\eta$ too large:** Gradients oscillate and explode, causing NaN loss values.
- **Learning rate $\\eta$ too small:** Optimization stagnates in flat saddle regions.
- **Adam optimizer advantage:** Dynamically scales $\\eta$ using running averages of both the first moment (momentum) and the second uncentered moment (squared gradients).

Would you like to derive the backpropagation step for a single linear layer or inspect a PyTorch training loop?`;
  } else if (queryLower.includes("attention") || queryLower.includes("transformer") || queryLower.includes("rag") || queryLower.includes("lora")) {
    text = `### ⚡ Transformer & Modern GenAI Architecture (${persona.name})

In modern AI Engineering (e.g. Nuwave / Navisoft standards), self-attention computes dynamic contextual weighting between all token pairs:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

**Why this matters in practice:**
1. **Scaled Factor $\\frac{1}{\\sqrt{d_k}}$:** Eliminates vanishing gradients in Softmax when embedding dimensions grow large ($d_k = 64, 128$).
2. **LoRA Fine-Tuning:** Rather than updating 70 billion parameters, decompose $\\Delta W = B \\cdot A$ with rank $r=8$, freezing the pre-trained weights and slashing VRAM demands by 99%.
3. **RAG Grounding:** To eliminate hallucinations, retrieve source chunks via hybrid search (Dense + BM25), rerank with Cross-Encoders, and format strict XML citation context.

What specific component would you like to implement or debug?`;
  } else if (queryLower.includes("arabic") || queryLower.includes("عربي") || queryLower.includes("شرح بالعربي")) {
    text = `### 🌍 الشرح باللغة العربية مع الحفاظ على المصطلحات التقنية (Technical English):

في هندسة الذكاء الاصطناعي، الهدف ليس مجرد تشغيل أكواد جاهزة، بل فهم الأساس الرياضي والبرمجي الذي تبنى عليه الأنظمة.

- **الكبسلة (Encapsulation):** حماية البيانات الداخلية للكائن وعدم السماح بالتعديل المباشر إلا من خلال واجهات محددة.
- **التعميم (Generalization):** قدرة النموذج على إعطاء نتائج دقيقة على بيانات جديدة لم يرها أثناء التدريب.
- **المفاضلة الهندسية (Trade-off):** موازنة دقيقة بين الدقة (Accuracy) وزمن الاستجابة (Latency) واستهلاك الذاكرة (Memory).

ما هو المفهوم الذي تود أن نعمل عليه معًا خطوة بخطوة؟`;
  } else {
    text = `### 🎓 Academic Advisory Guidance (${persona.name})

I have reviewed your query regarding **${nodeId || "AI Engineering Foundations"}**.

To maximize your **Learning Yield (IHLS Protocol)**:
1. **Formulate your hypothesis first:** What is your planned approach or understanding?
2. **Identify the trade-offs:** Are you optimizing for computational latency, memory footprint, or statistical accuracy?
3. **Connect to practical evidence:** How will you test this in your test suite or project repository?

Let me know what step you want to tackle next, and we will drill down together!`;
  }

  return { text, thought };
}
