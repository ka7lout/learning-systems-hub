export interface LearningBlockSeed {
  id: string;
  nodeId: string;
  type: "orientation" | "lecture" | "worked_example" | "guided_section" | "problem_set" | "transfer_task" | "case_study" | "debugging_lab" | "viva_prompt";
  title: string;
  content: string;
  codeSnippet?: string;
  language?: string;
  starterCode?: string;
  solutionCode?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
  hints?: string[];
  metadata?: Record<string, unknown>;
  orderIndex: number;
}

export const CANONICAL_LEARNING_BLOCKS: LearningBlockSeed[] = [
  // -------------------------------------------------------------
  // Node 1: python-fundamentals
  // -------------------------------------------------------------
  {
    id: "blk-py-fund-orient",
    nodeId: "m1-s1-fundamentals",
    type: "orientation",
    title: "Why Python Foundations Matter for AI Engineering",
    content: `Welcome to the foundational cornerstone of the AI Engineering curriculum. 

In machine learning and neural networks, high-level frameworks like PyTorch and NumPy are controlled via Python. If you have subtle misconceptions about Python's object model—such as treating variables as variable 'boxes' rather than references to memory objects, or misunderstanding dynamic type coercion—you will write buggy data pipelines and introduce subtle silent bugs in tensor processing.

In this lesson, we establish an engineering-grade mental model of Python execution, type casting, branching, and iterative loops.`,
    orderIndex: 1
  },
  {
    id: "blk-py-fund-lecture",
    nodeId: "m1-s1-fundamentals",
    type: "lecture",
    title: "Core Mechanics: Variables, Types & Control Structures",
    content: `### 1. Variables as Names Bound to Objects
In Python, variables do not hold values directly. Instead, values (integers, strings, lists) live in memory as objects, and variables are names (labels) bound to those memory addresses via pointers.

\`\`\`python
a = [1, 2, 3]
b = a
b.append(4)
print(a) # Output: [1, 2, 3, 4] -> Both a and b point to the exact same list object!
\`\`\`

### 2. Control Flow & Short-Circuit Evaluation
Python's logical operators \`and\` and \`or\` use short-circuit evaluation:
- In \`A and B\`, if \`A\` evaluates to False, \`B\` is NEVER evaluated.
- In \`A or B\`, if \`A\` evaluates to True, \`B\` is NEVER evaluated.

### 3. Iteration Controls
- \`break\`: Immediately terminates the innermost loop.
- \`continue\`: Skips the remainder of the current iteration and jumps to the next iteration.
- \`pass\`: Syntactic placeholder that executes no operation.`,
    orderIndex: 2
  },
  {
    id: "blk-py-fund-worked-ex",
    nodeId: "m1-s1-fundamentals",
    type: "worked_example",
    title: "Worked Example: Safe Data Casting & Threshold Filtering",
    content: `Here is a standard data ingestion function that casts raw string sensor readings into normalized floats, handling invalid entries safely:`,
    codeSnippet: `def parse_sensor_readings(raw_data: list, threshold: float = 0.0) -> list:
    cleaned = []
    for item in raw_data:
        if item is None:
            continue
        try:
            val = float(item)
            if val >= threshold:
                cleaned.append(val)
        except (ValueError, TypeError):
            # Log invalid sensor read
            pass
    return cleaned

# Test run:
sample = ["12.5", "-3.2", None, "invalid_sensor", "45.0"]
print(parse_sensor_readings(sample, threshold=0.0))
# Output: [12.5, 45.0]`,
    language: "python",
    orderIndex: 3
  },
  {
    id: "blk-py-fund-debugging",
    nodeId: "m1-s1-fundamentals",
    type: "debugging_lab",
    title: "Debugging Lab: The Flawed Batch Filter",
    content: `Diagnose why the following batch filtration code produces incorrect results and crashes on specific inputs. Fix the implementation so all test cases pass.`,
    starterCode: `def filter_active_batches(batches):
    # BUG 1: Modifying a list while iterating over it
    # BUG 2: Incorrect type check for zero values
    for b in batches:
        if b["loss"] == None or b["loss"] > 10.0:
            batches.remove(b)
    return batches`,
    solutionCode: `def filter_active_batches(batches):
    # Fixed: Create a new list (or list comprehension) to avoid mutating while iterating
    # Use 'is None' for identity check and safe numeric comparison
    return [
        b for b in batches 
        if b is not None and b.get("loss") is not None and b["loss"] <= 10.0
    ]`,
    testCases: [
      { input: "[{'loss': 2.5}, {'loss': 12.0}, {'loss': None}, {'loss': 0.1}]", expectedOutput: "[{'loss': 2.5}, {'loss': 0.1}]" }
    ],
    hints: [
      "Never remove items from a list while iterating over it with a for-loop because index shifting causes items to be skipped.",
      "Use 'is None' rather than '== None' for checking NoneType in Python (PEP 8)."
    ],
    orderIndex: 4
  },
  {
    id: "blk-py-fund-transfer",
    nodeId: "m1-s1-fundamentals",
    type: "transfer_task",
    title: "Transfer Challenge: Early Stopping Loop Simulator",
    content: `Write a function \`simulate_early_stopping(loss_history, patience=3, min_delta=0.01)\` that iterates over a sequence of training epoch loss values and returns the epoch number (0-indexed) where training should stop due to no improvement of at least \`min_delta\` for \`patience\` consecutive epochs.`,
    starterCode: `def simulate_early_stopping(loss_history: list[float], patience: int = 3, min_delta: float = 0.01) -> int:
    # Implement early stopping loop with patience counter
    pass`,
    solutionCode: `def simulate_early_stopping(loss_history: list[float], patience: int = 3, min_delta: float = 0.01) -> int:
    if not loss_history:
        return 0
    best_loss = loss_history[0]
    patience_counter = 0
    
    for epoch, loss in enumerate(loss_history):
        if best_loss - loss >= min_delta:
            best_loss = loss
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                return epoch
    return len(loss_history) - 1`,
    testCases: [
      { input: "simulate_early_stopping([1.0, 0.8, 0.79, 0.785, 0.784, 0.783], patience=3, min_delta=0.01)", expectedOutput: "4" }
    ],
    orderIndex: 5
  },
  {
    id: "blk-py-fund-viva",
    nodeId: "m1-s1-fundamentals",
    type: "viva_prompt",
    title: "Oral Viva: Memory Binding & Identity vs Equality",
    content: `Explain orally in clear Technical English:
1. What is the fundamental difference between the \`==\` operator and the \`is\` operator in Python?
2. Explain what happens in computer memory when \`a = [1, 2]\` and \`b = a\` is executed, and why modifying \`b\` affects \`a\`.
3. How do you create an independent deep copy of a nested structure in Python?`,
    orderIndex: 6
  },

  // -------------------------------------------------------------
  // Node 8: m2-s1-linear-algebra-foundations
  // -------------------------------------------------------------
  {
    id: "blk-la-fund-orient",
    nodeId: "m2-s1-linear-algebra-foundations",
    type: "orientation",
    title: "Why Linear Algebra is the Language of AI",
    content: `Every image (pixels), text sequence (tokens embedded into vectors), and audio wave (spectrograms) is mapped to linear algebraic representations. When you pass a batch of 64 sentences through a Transformer layer with hidden dimension 768, you are computing high-dimensional matrix multiplications: (64 x 768) * (768 x 768) = (64 x 768).

Without intuitive mastery of vector spaces, matrix transformations, and determinants, gradient propagation and attention mechanics remain opaque black boxes.`,
    orderIndex: 1
  },
  {
    id: "blk-la-fund-lecture",
    nodeId: "m2-s1-linear-algebra-foundations",
    type: "lecture",
    title: "Vector Spaces, Matrix Multiplications & Geometric Transformations",
    content: `### 1. Vector Spaces & Dot Product
A vector **v** in R^n represents both a point in n-dimensional space and a directed arrow from the origin.
The dot product between two vectors **u** and **v**:
$$\\mathbf{u} \\cdot \\mathbf{v} = \\sum_{i=1}^n u_i v_i = \\|\\mathbf{u}\\| \\|\\mathbf{v}\\| \\cos(\\theta)$$

- If $\\mathbf{u} \\cdot \\mathbf{v} = 0$, the vectors are **orthogonal** (perpendicular).
- In NLP, cosine similarity is $\\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|}$, measuring semantic closeness irrespective of vector magnitude.

### 2. Matrix Multiplication as Linear Transformation
Multiplying matrix $A_{M \\times K}$ with $B_{K \\times N}$ produces $C_{M \\times N}$.
Each element $C_{ij}$ is the dot product of row $i$ of matrix $A$ and column $j$ of matrix $B$.

Geometrically, a matrix transformation stretches, rotates, and shears space while keeping grid lines parallel and origin fixed.

### 3. The Determinant $\\det(A)$
The determinant measures the factor by which the linear transformation scales area (in 2D) or volume (in 3D):
- If $\\det(A) = 1$, area is preserved (pure rotation).
- If $\\det(A) < 0$, space is inverted (reflection).
- If $\\det(A) = 0$, space is collapsed into a lower dimension (line or point). **A matrix with $\\det(A) = 0$ is singular and has NO inverse.**`,
    orderIndex: 2
  },
  {
    id: "blk-la-fund-worked-ex",
    nodeId: "m2-s1-linear-algebra-foundations",
    type: "worked_example",
    title: "Worked Example: Vectorized Dot Product & Cosine Similarity in Python",
    content: `Implementing dot product and cosine similarity from first principles without external libraries:`,
    codeSnippet: `import math

def dot_product(u: list[float], v: list[float]) -> float:
    assert len(u) == len(v), "Vectors must have identical dimensions"
    return sum(a * b for a, b in zip(u, v))

def l2_norm(v: list[float]) -> float:
    return math.sqrt(sum(x ** 2 for x in v))

def cosine_similarity(u: list[float], v: list[float]) -> float:
    norm_u = l2_norm(u)
    norm_v = l2_norm(v)
    if norm_u == 0 or norm_v == 0:
        return 0.0
    return dot_product(u, v) / (norm_u * norm_v)

# Example: Word embedding comparison
vec_king = [0.25, 0.88, -0.15]
vec_queen = [0.22, 0.85, -0.10]
vec_apple = [-0.60, 0.12, 0.75]

print("Sim(King, Queen):", round(cosine_similarity(vec_king, vec_queen), 4)) # ~ 0.998
print("Sim(King, Apple):", round(cosine_similarity(vec_king, vec_apple), 4)) # ~ -0.112`,
    language: "python",
    orderIndex: 3
  },
  {
    id: "blk-la-fund-case",
    nodeId: "m2-s1-linear-algebra-foundations",
    type: "case_study",
    title: "Engineering Case: Embedding Dimension Mismatch in Production RAG",
    content: `### Scenario:
Your team deployed a RAG system using an embedding model that outputs vectors of dimension $d = 768$. A junior engineer swapped the embedding model in production to an upgraded variant that outputs $d = 1536$. 

The vector similarity search started throwing runtime shape assertion errors during cosine similarity calculations:
\`ValueError: operands could not be broadcast together with shapes (768,) (1536,)\`.

### Engineering Questions:
1. Why is computing cosine similarity mathematically impossible between vectors of different dimensionality?
2. Why can you NOT simply pad the 768-dim vector with zeros to match 1536? What geometric distortion would that introduce into the dot product?
3. What is the correct production resolution?`,
    orderIndex: 4
  },

  // -------------------------------------------------------------
  // Node 35: m7-s6-transformers-llms-rag-agents
  // -------------------------------------------------------------
  {
    id: "blk-transformer-orient",
    nodeId: "m7-s6-transformers-llms-rag-agents",
    type: "orientation",
    title: "The Architecture That Changed Artificial Intelligence",
    content: `Before 2017, NLP relied on sequential recurrence (RNNs/LSTMs). The breakthrough paper *Attention Is All You Need* (Vaswani et al., 2017) eliminated recurrence in favor of Scaled Dot-Product Self-Attention.

This allowed massive parallelization on modern GPU clusters and birthed the modern Foundation Model era: GPT-4, Claude, LLaMA, and Gemini.

In this module, you will master self-attention mechanics, PEFT (LoRA/QLoRA), production RAG pipelines, and agentic workflows.`,
    orderIndex: 1
  },
  {
    id: "blk-transformer-lecture",
    nodeId: "m7-s6-transformers-llms-rag-agents",
    type: "lecture",
    title: "Scaled Dot-Product Attention, Multi-Head Attention & LoRA Mechanics",
    content: `### 1. Scaled Dot-Product Attention
Given an input sequence $X$, we project it with learnable weight matrices into Queries ($Q = X W_Q$), Keys ($K = X W_K$), and Values ($V = X W_V$):

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

- **Query ($Q$):** What the current token is searching for.
- **Key ($K$):** What information the other tokens offer.
- **Value ($V$):** The actual contextual representation to pass forward.
- **Scaling factor $\\frac{1}{\\sqrt{d_k}}$:** As embedding dimension $d_k$ grows large, dot products grow large, pushing softmax into regions with vanishingly small gradients. Dividing by $\\sqrt{d_k}$ stabilizes gradient variance to 1.0.

### 2. Parameter-Efficient Fine-Tuning: LoRA
A full 70B parameter model requires 140GB+ of VRAM just to store 16-bit weights.
Low-Rank Adaptation (LoRA) freezes the base weight matrix $W_0 \\in \\mathbb{R}^{d \\times k}$ and injects low-rank trainable matrices $A$ and $B$:

$$W = W_0 + \\Delta W = W_0 + \\frac{\\alpha}{r} (B \\cdot A)$$

where $B \\in \\mathbb{R}^{d \\times r}$ and $A \\in \\mathbb{R}^{r \\times k}$ with rank $r \\ll \\min(d, k)$ (e.g. $r = 8$ or $16$). This reduces trainable parameters by over 99.8% while matching full fine-tuning performance.`,
    orderIndex: 2
  },
  {
    id: "blk-transformer-worked-ex",
    nodeId: "m7-s6-transformers-llms-rag-agents",
    type: "worked_example",
    title: "Worked Example: Computing Self-Attention from Scratch in Python",
    content: `Step-by-step mathematical implementation of Scaled Dot-Product Attention:`,
    codeSnippet: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Q: (batch_size, seq_len, d_k)
    K: (batch_size, seq_len, d_k)
    V: (batch_size, seq_len, d_v)
    """
    d_k = Q.shape[-1]
    
    # Step 1: Compute Q * K^T
    scores = np.matmul(Q, np.swapaxes(K, -1, -2)) / np.sqrt(d_k)
    
    # Step 2: Apply causal mask if autoregressive (e.g., GPT decoder)
    if mask is not None:
        scores = np.where(mask == 0, -1e9, scores)
    
    # Step 3: Compute attention weights via softmax
    attention_weights = softmax(scores, axis=-1)
    
    # Step 4: Multiply by Values
    output = np.matmul(attention_weights, V)
    return output, attention_weights

# Simulation: 3 tokens, hidden dimension d_k = 4
np.random.seed(42)
Q_sim = np.random.randn(1, 3, 4)
K_sim = np.random.randn(1, 3, 4)
V_sim = np.random.randn(1, 3, 4)

out, weights = scaled_dot_product_attention(Q_sim, K_sim, V_sim)
print("Output shape:", out.shape) # (1, 3, 4)
print("Attention weights matrix (sums to 1.0 per row):\\n", weights[0])`,
    language: "python",
    orderIndex: 3
  },
  {
    id: "blk-transformer-debugging",
    nodeId: "m7-s6-transformers-llms-rag-agents",
    type: "debugging_lab",
    title: "Debugging Lab: RAG Context Poisoning & Chunking Bug",
    content: `A production RAG pipeline is returning hallucinated and outdated answers. Diagnose the bug in the chunking & retrieval logic below:`,
    starterCode: `def retrieve_and_format_context(vector_db, query, top_k=5):
    # BUG 1: No metadata filtering on document freshness/timestamp
    # BUG 2: Context is concatenated without source citations or delimiters
    results = vector_db.similarity_search(query, k=top_k)
    context_str = ""
    for r in results:
        context_str += r.page_content + " "
    return context_str`,
    solutionCode: `def retrieve_and_format_context(vector_db, query, top_k=5, min_score=0.72):
    # Fixed: Hybrid search with threshold filtering, date ordering, and structured citation XML
    results_with_scores = vector_db.similarity_search_with_relevance_scores(query, k=top_k)
    formatted_chunks = []
    
    for idx, (doc, score) in enumerate(results_with_scores):
        if score >= min_score:
            doc_id = doc.metadata.get("id", f"doc_{idx+1}")
            source = doc.metadata.get("source", "unknown")
            timestamp = doc.metadata.get("updated_at", "")
            formatted_chunks.append(
                f'<document id="{doc_id}" source="{source}" date="{timestamp}">\\n{doc.page_content.strip()}\\n</document>'
            )
            
    if not formatted_chunks:
        return "<no_relevant_documents_found/>"
        
    return "\\n\\n".join(formatted_chunks)`,
    hints: [
      "Without explicit XML document delimiters and document IDs, the LLM cannot attribute citations to specific source chunks.",
      "Filtering out low-similarity chunks (< 0.70 threshold) prevents irrelevant text from polluting the LLM's context window."
    ],
    orderIndex: 4
  }
];
