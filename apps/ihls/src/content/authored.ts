import type { LearningBlock } from "./types";

/**
 * Authored teaching content (§209 learning workspace, §45 learning loop,
 * §47 worked examples with fading support, §102 one concept many representations).
 *
 * Lessons absent from this map are seeded as `outline_only` and the UI says so
 * truthfully — an unauthored lesson is never dressed up as a written one (§217).
 */

const b = (id: string, kind: LearningBlock["kind"], title: string, body: string, lang?: LearningBlock["lang"]): LearningBlock => ({
  id,
  kind,
  title,
  body,
  ...(lang ? { lang } : {}),
});

export const AUTHORED_BLOCKS: Record<string, LearningBlock[]> = {
  // =====================================================================
  "l-om1-1": [
    b("why", "why", "Why this matters", `Every model you will ever train is wrapped in ordinary code. The bugs that cost you days are rarely exotic: a string where you expected a number, a loop that exits one iteration early, a condition that is true for the empty list. This session is where you stop guessing what Python will do and start predicting it.`),
    b("c1", "concept", "Values have types, names do not", `In Python a name is a label attached to an object. The object carries the type; the name carries nothing.

    x = 5        # name x → int object 5
    x = "five"   # same name, now pointing at a str object

This is why \`type()\` answers questions about the value, and why reassignment never "converts" anything. Type casting (\`int("7")\`, \`float("3.2")\`, \`str(9)\`) does not change an object — it builds a new one.`),
    b("c2", "mental_model", "Truthiness is a protocol, not a special case", `\`if x:\` does not test "is x True". It calls the object's own notion of emptiness. Empty containers, 0, 0.0, "" and None are falsy; everything else is truthy by default.

Consequence that bites people: \`if len(items) > 0:\` and \`if items:\` are the same test for a list — but if \`items\` could be \`None\`, only one of them is safe.`),
    b("w1", "worked_example", "Worked example — predict before you run", `Read this and write down the output before scrolling:

    total = 0
    for n in range(1, 6):
        if n % 2 == 0:
            continue
        if n > 4:
            break
        total += n
    print(total)

Trace: n=1 odd, not >4 → total=1. n=2 even → continue. n=3 → total=4. n=4 even → continue. n=5 odd, 5>4 → break. Output: **4**.

The point of the exercise is not the number. It is that you produced the number without the interpreter.`, "python"),
    b("p1", "pitfall", "Three mistakes that look like Python bugs", `1. \`0.1 + 0.2 == 0.3\` is \`False\`. Floating point is binary; compare with a tolerance.
2. \`int("7.0")\` raises \`ValueError\` — it parses integers, not decimal strings. Use \`int(float("7.0"))\` deliberately, not accidentally.
3. \`range(1, 5)\` stops at 4. Half-open intervals are a feature: \`range(a, b)\` has exactly \`b - a\` elements.`),
    b("t1", "transfer", "Transfer task", `You are reading a CSV where a column should hold integers but some rows contain \`""\`, some contain \`"12"\`, and one contains \`"12.0"\`. Write the conversion rule you would apply — including what you do with the empty string — and justify why you are not using a bare \`int(value)\`.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Without running code: give the output of a loop you have not seen before, state why \`if items:\` can be unsafe, and explain in one sentence what type casting actually creates.`),
  ],

  // =====================================================================
  "l-om1-4": [
    b("why", "why", "Why this matters", `Search, sort and recursion are where you first meet the idea that two correct programs can differ by a factor of a million. Object orientation is where you first meet the idea that two correct programs can differ in how expensive they are to change. AI engineering needs both.`),
    b("c1", "concept", "Binary search has a precondition, and it is the whole story", `Linear search works on anything. Binary search works only on sorted data, and it works by maintaining an invariant: *if the target exists, it is inside [lo, hi]*.

    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target: return mid
        if a[mid] < target:  lo = mid + 1
        else:                hi = mid - 1
    return -1

Every line exists to preserve that invariant. \`mid + 1\` and \`mid - 1\` are not stylistic — without them the range never shrinks and the loop hangs.`, "python"),
    b("m1", "math", "Why it is log n", `Each iteration halves the candidate range: n → n/2 → n/4 → … → 1. The number of halvings k satisfies n / 2^k = 1, so k = log₂ n. For n = 1,000,000 that is 20 comparisons instead of 1,000,000.`),
    b("c2", "concept", "Recursion = base case + strictly smaller subproblem", `A recursive function is correct when (a) the base case is reachable and correct, and (b) every recursive call is on a strictly smaller input. If you cannot state both in one sentence each, the function is not finished.`),
    b("c3", "mental_model", "Polymorphism replaces a type switch", `This is the smell:

    if shape.kind == "circle":   area = 3.14159 * shape.r ** 2
    elif shape.kind == "square": area = shape.side ** 2

Every new shape edits this function. With polymorphism each class owns its \`area()\`, and adding a shape adds a file instead of editing one. The trade-off is real: the logic is now spread across classes, which is harder to read in one glance. Choose deliberately.`, "python"),
    b("p1", "pitfall", "Bubble sort is a teaching tool", `It is O(n²) and nothing you ship should use it. Learn it because it makes the cost of a swap visible, then use \`sorted()\` — which is Timsort, O(n log n), and written by people who spent years on it.`),
    b("ck", "checkpoint", "Mastery checkpoint", `State binary search's precondition and invariant. Give the complexity of each algorithm you implemented and defend it. Then take one \`if/elif\` type-switch from your own code and rewrite it as polymorphism, naming what you gained and what you lost.`),
  ],

  // =====================================================================
  "l-om2-3": [
    b("why", "why", "Why this matters", `Gradient descent is the engine under essentially every model you will train. If you understand it as a formula you can run it. If you understand it as a geometry you can debug it — and debugging training is most of deep learning.`),
    b("m1", "math", "The chain rule, stated once, properly", `If y = f(g(x)) then

    dy/dx = f'(g(x)) · g'(x)

Read it as: the sensitivity of the output to x is the sensitivity of the outer function at its input, multiplied by the sensitivity of the inner function to x. Backpropagation is this rule applied repeatedly over a computation graph — nothing more exotic.`),
    b("w1", "worked_example", "Derive the MSE gradient by hand", `Model: ŷ = wx + b. Loss over n points: L = (1/n) Σ (ŷᵢ − yᵢ)².

Let eᵢ = (wxᵢ + b − yᵢ).

    ∂L/∂w = (2/n) Σ eᵢ · xᵢ
    ∂L/∂b = (2/n) Σ eᵢ

Check the units: ∂L/∂w carries an extra factor of x, which is why unscaled features produce wildly different gradient magnitudes per weight — and why feature scaling is not cosmetic.`),
    b("c1", "concept", "The update rule and its one knob", `    w ← w − η · ∂L/∂w

η (the learning rate) is the only thing standing between you and three distinct failure modes:

- **η too large** → loss oscillates or explodes to NaN.
- **η too small** → loss decreases, but you run out of patience before it converges.
- **η fine, surface bad** → loss plateaus in a flat region; the gradient is tiny but you are not at a minimum.

You diagnose these from the loss curve shape, not from the final number.`),
    b("c2", "mental_model", "Convex vs non-convex, honestly", `Convex: one basin, any descent path reaches the global minimum. Linear and logistic regression live here.

Non-convex: many basins and saddle points. Neural networks live here, and we do not find the global minimum — we find a good enough basin. That is an empirical fact about these loss surfaces, not a theorem, and it is why initialisation and learning-rate schedules matter.`),
    b("t1", "transfer", "Transfer task", `Your loss drops for 200 steps, then jumps to a huge value and stays flat. Give three candidate causes ordered by how cheap they are to test, and say what evidence would distinguish them.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Derive ∂L/∂w for MSE without notes. Then, from a loss curve alone, name the failure mode and the single change you would make first.`),
  ],

  // =====================================================================
  "l-om2-5": [
    b("why", "why", "Why this matters", `Most expensive modelling mistakes are probability mistakes wearing a machine-learning costume: confusing P(A|B) with P(B|A), ignoring base rates, reading correlation as cause. Bayes is the antidote and it is three symbols long.`),
    b("m1", "math", "Bayes' theorem with every symbol named", `    P(H|E) = P(E|H) · P(H) / P(E)

- P(H)   prior — belief in the hypothesis before the evidence
- P(E|H) likelihood — how expected the evidence is if H is true
- P(E)   marginal — how expected the evidence is overall
- P(H|E) posterior — belief after the evidence

P(E) = P(E|H)·P(H) + P(E|¬H)·P(¬H). That denominator is where base rates enter, and skipping it is the single most common error.`),
    b("w1", "worked_example", "The base-rate problem, fully worked", `A disease affects 1 in 10,000. A test is 99% sensitive and 99% specific. You test positive. What is P(disease | positive)?

    P(H)      = 0.0001
    P(E|H)    = 0.99
    P(E|¬H)   = 0.01
    P(E)      = 0.99(0.0001) + 0.01(0.9999) = 0.000099 + 0.009999 = 0.010098
    P(H|E)    = 0.000099 / 0.010098 ≈ 0.0098

**About 1%.** A "99% accurate" test on a rare condition still yields a mostly-false-positive population, because the 0.01 false-positive rate acts on a vastly larger group. Read your classifier's precision the same way.`),
    b("c1", "concept", "Likelihood is not probability of the hypothesis", `P(E|H) is a function of H with the data fixed. It does not integrate to 1 over H and it is not "the probability the hypothesis is true". Saying "the likelihood that the model is right" is a vocabulary error that leads to a reasoning error.`),
    b("c2", "concept", "Covariance, correlation, causation", `Covariance has units and scale; correlation is covariance normalised to [−1, 1]. Neither says anything about direction of influence. A correlation of 0 rules out *linear* association only — y = x² on symmetric data gives r ≈ 0 with perfect dependence.`),
    b("t1", "transfer", "Transfer task", `Your fraud classifier reports 95% precision on a test set with 50% fraud, created by downsampling. Production fraud is 0.2%. Estimate the real precision and explain the mechanism to a product manager in three sentences.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Solve a base-rate problem you have not seen, then explain the result to someone non-technical without using the word "Bayes".`),
  ],

  // =====================================================================
  "l-om3-2": [
    b("why", "why", "Why this matters", `This session carries two separate powers: making numerical code 50× faster, and knowing whether a difference you observed is real. Both are routinely faked in industry — vectorisation by copying a snippet, significance by running tests until one passes.`),
    b("c1", "concept", "Broadcasting rules, stated so you can apply them", `Align shapes from the right. Two dimensions are compatible if they are equal, or one of them is 1. Missing leading dimensions are treated as 1.

    (3, 1) + (1, 4) → (3, 4)      intended
    (3,)   + (3, 1) → (3, 3)      usually NOT intended

The second case is the classic silent bug: you expected elementwise addition of two length-3 vectors and got a 3×3 matrix. Assert your shapes.`),
    b("c2", "concept", "Why vectorised code is fast", `A Python loop over an array performs, per element: a bytecode dispatch, a pointer dereference to a boxed object, a type check, and an allocation for the result. A NumPy operation performs one dispatch for the whole array, over contiguous memory, in compiled code, often with SIMD instructions.

The strides array is what makes this possible: NumPy stores one flat buffer plus a rule for stepping through it. That is also why a reshape is usually free and a transpose-then-reshape sometimes is not.`),
    b("c3", "concept", "What a p-value is — and the three things it is not", `A p-value is: the probability of observing data at least as extreme as yours, **assuming the null hypothesis is true**.

It is **not** the probability the null is true. It is **not** the probability your result was luck. It is **not** a measure of effect size — with enough data a trivial difference reaches p < 0.001.

Report the effect size and the interval. The p-value alone has never justified a product decision.`),
    b("w1", "worked_example", "Reading a confidence interval correctly", `"Conversion improved by 1.4 percentage points, 95% CI [−0.2, 3.0]."

The correct reading: the procedure that produced this interval captures the true value 95% of the time across repeated experiments. This particular interval includes zero, so the data are compatible with no improvement — and also with a 3-point improvement. The honest conclusion is "underpowered", not "no effect".`),
    b("p1", "pitfall", "Peeking invalidates the test", `Checking the result daily and stopping when it crosses p < 0.05 inflates the false-positive rate far above 5%. Fix the sample size in advance, or use a sequential method designed for it.`),
    b("ck", "checkpoint", "Mastery checkpoint", `State what a p-value means with no hedging. Then take a loop from your own code, vectorise it, measure both, and explain the speedup in terms of memory and dispatch.`),
  ],

  // =====================================================================
  "l-om3-3": [
    b("why", "why", "Why this matters", `Most of a real AI project is this session. Models are interchangeable; a correct join is not. The errors here are silent — no exception, just wrong rows — and they propagate all the way to a metric someone trusts.`),
    b("c1", "concept", "Every join needs a row-count expectation", `Before you join, write down the expected row count. After you join, check it.

- inner → ≤ left rows, drops non-matches
- left  → ≥ left rows; **more** if the right key is not unique
- outer → ≥ max(left, right)

The duplication case is the dangerous one: a left join on a non-unique key multiplies rows, your sum doubles, and nothing errors.

    assert df.merge(other, on="id", how="left").shape[0] == df.shape[0]`, "python"),
    b("c2", "concept", "Missing values are three different problems", `**MCAR** — missing at random, unrelated to anything. Dropping is defensible.
**MAR** — missingness depends on observed variables. Impute conditionally, and say so.
**MNAR** — missingness depends on the unobserved value itself (people with high income skip the income field). No imputation is neutral; model the missingness as a feature.

The decision is a modelling decision, never a default.`),
    b("c3", "engineering_note", "Leakage enters through feature engineering", `Any feature computed using information unavailable at prediction time is leakage. The usual culprits:

- aggregates computed over the full dataset before the split
- target encoding fitted on all rows
- a timestamp-derived feature that encodes the label's future
- scaling fitted on train+test together

Rule: fit on train, transform everything else. If a statistic crosses the split boundary, you have leaked.`),
    b("w1", "worked_example", "A wrangling pipeline that stays readable", `    clean = (
        raw
        .loc[lambda d: d["status"].isin(VALID)]
        .assign(amount=lambda d: d["amount"].astype("float64"))
        .pipe(drop_outliers, col="amount", k=3)
        .merge(customers[["id", "segment"]], on="id", how="left", validate="m:1")
        .groupby("segment", as_index=False)
        .agg(total=("amount", "sum"), n=("id", "nunique"))
    )

\`validate="m:1"\` is the line that turns a silent duplication bug into an immediate error. Use it on every merge.`, "python"),
    b("t1", "transfer", "Transfer task", `You join orders to customers and the revenue total rises by 12%. The join key looks correct. List the checks you run, in order, and say what each one would prove.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Reproduce a specified pipeline with correct row counts at each stage, and show the assertion that would have caught a duplicate-key join.`),
  ],

  // =====================================================================
  "l-om5-2": [
    b("why", "why", "Why this matters", `Window functions are the difference between pulling a table into Pandas and answering the question in the database. In interviews they are the most reliable signal that someone has actually worked with data at scale.`),
    b("c1", "concept", "Window function anatomy", `    SELECT
      customer_id,
      order_date,
      amount,
      SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total,
      ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS recency_rank
    FROM orders;

- \`PARTITION BY\` → restart the calculation per group (it does not collapse rows)
- \`ORDER BY\` inside OVER → defines the frame's sequence, enabling running totals
- The row count of the output equals the row count of the input. That is the whole difference from GROUP BY.`, "sql"),
    b("c2", "concept", "GROUP BY collapses; OVER annotates", `If the question is "one row per customer", use GROUP BY. If it is "every order, plus something about its customer", use a window. Choosing GROUP BY then self-joining back is the pattern a window function replaces — usually with one scan instead of two.`),
    b("c3", "engineering_note", "Indexes: the trade you are making", `An index makes a lookup O(log n) instead of O(n), and makes every INSERT, UPDATE and DELETE more expensive because the index must be maintained. On a write-heavy table, an unused index is pure cost.

Read the plan. If it says sequential scan where you expected an index scan, the common causes are: a function applied to the indexed column, a type mismatch forcing a cast, or low selectivity making the scan genuinely cheaper.`),
    b("w1", "worked_example", "Correlated subquery → window function", `Slow:

    SELECT o.*, (SELECT AVG(amount) FROM orders o2 WHERE o2.customer_id = o.customer_id) AS cust_avg
    FROM orders o;

Fast:

    SELECT o.*, AVG(amount) OVER (PARTITION BY customer_id) AS cust_avg
    FROM orders o;

The first runs the subquery per row; the second computes each partition once.`, "sql"),
    b("ck", "checkpoint", "Mastery checkpoint", `Convert a correlated subquery to a window function, measure both, read the plan, and explain in one paragraph why the cost changed.`),
  ],

  // =====================================================================
  "l-om6-1": [
    b("why", "why", "Why this matters", `A model that scores 0.98 in a notebook and 0.61 in production is almost never a modelling failure. It is a framing failure or a leakage failure, both of which happen before any algorithm is chosen.`),
    b("c1", "concept", "Frame the problem before choosing the family", `Ask, in order:
1. What decision will this output change? (If none — stop.)
2. What is the unit of prediction? (Order? Customer? Customer-month?)
3. What is available at the moment of prediction? (This defines your feature set, not what is in the table.)
4. What does each error cost? (This defines the metric, not convention.)
5. What is the baseline a non-ML rule would achieve?

Step 5 is the one people skip, and it is the one that most often ends the project honestly.`),
    b("c2", "engineering_note", "Fit on train, transform everywhere else", `    scaler.fit(X_train)              # learns mean and std — from train only
    X_train_s = scaler.transform(X_train)
    X_test_s  = scaler.transform(X_test)   # uses TRAIN statistics

Fitting on the full dataset leaks test distribution information into training. The leak is small, the optimism is not — and it is invisible in your validation score, which is precisely the problem.

Use a \`Pipeline\` so the split boundary is enforced by the code rather than by your memory.`, "python"),
    b("c3", "concept", "Imbalance is a cost problem, not a ratio problem", `Before resampling, write the cost matrix. If a missed fraud costs 300× a false alarm, that number should drive the threshold and the metric. Options and their real costs:

- **Class weights** — no data distortion, changes the loss. Usually try first.
- **Undersampling** — throws away real majority data; fast, lossy.
- **Oversampling / SMOTE** — synthesises points; risks fitting interpolation artefacts; never apply before the split.
- **Threshold tuning** — often the whole answer, and the cheapest.`),
    b("t1", "transfer", "Transfer task", `A churn model is trained on customers who have already churned, using a "support_tickets_last_90d" feature computed from the full history. Identify every leakage path and state the corrected feature definition.`),
    b("ck", "checkpoint", "Mastery checkpoint", `For a described business problem, produce the framing (unit, available features, metric, baseline) and point to the exact line in a pipeline where leakage would enter.`),
  ],

  // =====================================================================
  "l-om6-3": [
    b("why", "why", "Why this matters", `Choosing a classifier is the easy half. Choosing the metric and the threshold is where engineering judgement lives, and it is what you will be asked to defend.`),
    b("c1", "concept", "The confusion matrix, all four cells named", `                 predicted +        predicted −
    actual +     TP (caught)        FN (missed)
    actual −     FP (false alarm)   TN (correct pass)

    precision = TP / (TP + FP)   "of what I flagged, how much was real"
    recall    = TP / (TP + FN)   "of what was real, how much did I catch"
    F1        = harmonic mean of the two

Accuracy = (TP+TN)/all. On a 0.2% fraud base rate, predicting "never fraud" scores 99.8% accuracy and has zero value. Accuracy is a usable metric only when classes are balanced *and* errors cost the same.`),
    b("c2", "concept", "ROC-AUC vs precision-recall", `ROC-AUC is threshold-independent and measures ranking quality: the probability a random positive ranks above a random negative. On heavily imbalanced data it looks flattering, because the false-positive rate has a huge denominator.

For rare positives, a precision-recall curve is the honest picture. Report both, know why they disagree.`),
    b("c3", "mental_model", "Algorithm selection from data properties", `- **Logistic regression** — linear boundary, calibrated probabilities, interpretable coefficients. The correct default and a serious baseline.
- **Decision tree** — non-linear, interpretable, high variance alone.
- **SVM** — strong on small, high-dimensional, clean data; kernels cost O(n²)+ and probabilities need extra calibration.
- **KNN** — no training cost, expensive inference, suffers in high dimensions, needs scaling.
- **Naive Bayes** — assumes conditional independence; wrong on most data yet strong on text, and extremely fast.

Say which assumption your data violates before claiming an algorithm is "better".`),
    b("w1", "worked_example", "Choosing a threshold from cost", `Fraud: a missed fraud costs €300, a false alarm costs €2 of review time.

Expected cost at threshold t: C(t) = 300·FN(t) + 2·FP(t).

Sweep t over the validation set, plot C(t), pick the minimum. You will typically land far from 0.5 — and now you can defend the number in a meeting, which 0.5 never allowed you to do.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Given a cost structure, select a metric and a threshold, defend both, and explain why accuracy and ROC-AUC would have misled you here.`),
  ],

  // =====================================================================
  "l-om7-1": [
    b("why", "why", "Why this matters", `Frameworks compute gradients for you, which means the only way to debug training is to understand what they are computing. One hand-worked backward pass buys you years of faster debugging.`),
    b("c1", "concept", "A network is a composition of differentiable functions", `    z₁ = W₁x + b₁ ;  a₁ = σ(z₁) ;  z₂ = W₂a₁ + b₂ ;  ŷ = σ(z₂) ;  L = loss(ŷ, y)

Forward: evaluate left to right, caching intermediates. Backward: apply the chain rule right to left, reusing those cached values. Backpropagation is not an algorithm for neural networks specifically — it is reverse-mode automatic differentiation on this graph.`),
    b("w1", "worked_example", "One backward pass, by hand", `Single neuron, sigmoid, MSE. x = 2, w = 0.5, b = 0, y = 1.

    z = wx + b = 1.0
    ŷ = σ(1.0) = 0.731
    L = (ŷ − y)² = 0.0724

    ∂L/∂ŷ = 2(ŷ − y)        = −0.538
    ∂ŷ/∂z = ŷ(1 − ŷ)        =  0.197
    ∂z/∂w = x               =  2.0

    ∂L/∂w = −0.538 × 0.197 × 2.0 = −0.212

With η = 0.1: w ← 0.5 − 0.1(−0.212) = 0.521. Loss decreases. Do this once on paper; it never needs doing again.`),
    b("c2", "concept", "Why sigmoid stalls and ReLU does not", `σ'(z) = σ(z)(1 − σ(z)) peaks at 0.25 and approaches 0 in both tails. Multiply a handful of those through a deep chain and the gradient reaching the early layers is effectively zero — the vanishing gradient.

ReLU's derivative is exactly 1 on the positive side, so the signal passes through unattenuated. Its cost is the dead-unit problem: a unit stuck negative receives zero gradient forever, which is what leaky variants address.`),
    b("c3", "concept", "Loss functions encode what you consider wrong", `- MSE — regression; penalises large errors quadratically; sensitive to outliers.
- MAE — regression; robust; gradient does not shrink near the optimum.
- Binary cross-entropy — two classes; punishes confident wrong answers severely.
- Categorical cross-entropy — mutually exclusive classes with softmax.

Choosing a loss is choosing a definition of failure. Choose it from the cost of errors, not from the tutorial you copied.`),
    b("c4", "engineering_note", "Overfitting: detect it before you treat it", `Overfitting is a *gap*, not a number: training loss falls while validation loss rises. Dropout and early stopping treat that gap. If both losses are high, you are underfitting and dropout makes it worse.

Early stopping needs a patience value and a restore-best-weights policy, or it simply stops late and keeps the worst model.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Hand-compute a two-layer backward pass and match the framework's gradients to three decimals. Then, from two loss curves, state whether the problem is overfitting, underfitting, or a broken learning rate.`),
  ],

  // =====================================================================
  "l-om7-6": [
    b("why", "why", "Why this matters", `Everything in your target roles — RAG, agents, fine-tuning, evaluation — rests on one mechanism. If attention is a black box to you, every downstream decision becomes guesswork and vendor marketing.`),
    b("m1", "math", "Self-attention in one formula", `    Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V

For a sequence of n tokens with model dimension d:

- Each token is projected into a **query** (what I am looking for), a **key** (what I offer), and a **value** (what I pass on).
- QKᵀ is n×n — every token scored against every token. This is the quadratic cost of long contexts.
- Division by √d_k keeps the dot products out of softmax's saturated region, where gradients vanish.
- softmax turns scores into weights that sum to 1; multiplying by V produces a weighted blend of the sequence.

Multi-head attention runs h of these in parallel on d/h dimensions each, so different heads can attend to different relationships, then concatenates.`),
    b("c1", "concept", "Encoder, decoder, encoder-decoder", `- **Encoder-only** (BERT-style): bidirectional, sees the whole sequence. Use for classification, retrieval embeddings, extraction.
- **Decoder-only** (GPT-style): causal mask, each token sees only the past. Use for generation. Nearly every current chat model.
- **Encoder-decoder** (T5-style): encode the source, generate the target. Use for translation and heavily conditioned transformation.

Picking the wrong family is a common and expensive error: embeddings for retrieval should come from an encoder trained for similarity, not from a generative decoder's hidden states.`),
    b("c2", "mental_model", "Prompt vs RAG vs fine-tune — the decision", `| Need | Use |
|---|---|
| Behaviour/format change | Prompting |
| Model lacks *your* facts | RAG |
| Facts change frequently | RAG (fine-tuning freezes stale facts) |
| Consistent style/schema at scale | Fine-tune (LoRA) |
| Domain vocabulary it has never seen | Fine-tune |
| Must cite sources | RAG, always |
| Latency/cost reduction on a narrow task | Fine-tune a smaller model |

Most production systems need prompting + RAG. Fine-tuning is the third tool, not the first, and it adds a training, evaluation and versioning burden that must be paid forever.`),
    b("c3", "concept", "LoRA, concretely", `Full fine-tuning updates every weight — billions of parameters, enormous memory. LoRA freezes W and learns a low-rank correction: W + BA where B is d×r, A is r×k and r is small (8–64). You train a fraction of a percent of the parameters, and you can swap adapters per task. QLoRA adds 4-bit quantisation of the frozen base so it fits on a single consumer GPU, trading a measurable amount of quality for a large amount of accessibility.`),
    b("c4", "engineering_note", "What a vector database does not fix", `A vector store makes similarity search fast. It does not make your chunks meaningful, your embeddings appropriate to the domain, your retrieval relevant, or your model honest about missing context. When RAG fails, the vector database is almost never the broken component — measure retrieval separately before touching it.`),
    b("t1", "transfer", "Transfer task", `A client wants a support assistant over 40,000 internal documents that change weekly, must cite sources, and must answer in under two seconds. Decide prompt / RAG / fine-tune, justify with cost, latency and freshness, and name the one requirement that eliminates fine-tuning outright.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Compute attention output shapes for a given batch, explain attention aloud in 90 seconds to a backend engineer, and defend a prompt-vs-RAG-vs-fine-tune decision under challenge.`),
  ],

  // =====================================================================
  "l-rag-1": [
    b("why", "why", "Why this matters", `RAG is the most common production AI system in the roles you are targeting, and the most commonly broken. Nearly every failure is a retrieval failure misdiagnosed as a model failure.`),
    b("c1", "concept", "The pipeline, stage by stage", `    Document → Parse → Chunk → Embed → Index
    Query → (rewrite) → Embed → Search → Filter → Rerank → Assemble context → Generate → Cite

Each stage can fail independently and each is separately measurable. If you cannot say which stage produced a bad answer, you cannot fix it — you can only reroll the prompt and hope.`),
    b("c2", "concept", "Chunking follows the question, not a default", `A 512-token default is a guess about your questions. Decide from the answer shape:

- Answers live in a sentence → small chunks, high precision, risk of lost context.
- Answers need a whole procedure → larger chunks or parent-document retrieval.
- Documents are structured → chunk on headings, never mid-table.

Overlap exists to stop an answer being split across a boundary; 10–20% is typical, and more is usually a sign the chunk size is wrong.`),
    b("c3", "concept", "Why hybrid search beats either half", `Vector search finds semantic matches but fails on exact tokens — part numbers, error codes, rare names — because embeddings blur them. Lexical search (BM25) nails exact tokens and misses paraphrase.

Hybrid runs both and fuses the rankings (reciprocal rank fusion is the usual default). In practice this is the single highest-value change to a mediocre RAG system.`),
    b("c4", "engineering_note", "Metadata filters make retrieval auditable", `Store source, section, date, permission scope and version with every chunk. That gives you: filtering before search (cheaper and more accurate), per-user access control that does not rely on the model behaving, freshness rules, and citations that point at something a human can open.

Permission filtering must happen in the query, not in the prompt. A model asked nicely not to reveal a document is not an access control.`),
    b("t1", "transfer", "Transfer task", `Users ask "what changed in the Q3 policy?" and get content from the Q1 document. Name the stage that failed, the metric that would have caught it, and the fix — without touching the generation prompt.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Given three wrong answers from a RAG system, attribute each to a specific stage with evidence, and specify the retrieval metric you would use to verify the fix.`),
  ],

  // =====================================================================
  "l-agent-1": [
    b("why", "why", "Why this matters", `"Agent" is the most oversold word in the field. The engineering skill is not building one — it is knowing the cheapest design that satisfies the requirement, and being able to say no with reasons.`),
    b("c1", "concept", "The five options, cheapest first", `1. **Deterministic workflow** — no model. Rules, SQL, code. Fastest, testable, free.
2. **Single LLM call** — one prompt, one response. Predictable cost and latency.
3. **Tool-using workflow** — *you* decide the sequence; the model fills in steps. Deterministic control flow, model-powered steps.
4. **Single agent** — the *model* decides the sequence within a tool set and a loop limit.
5. **Multi-agent system** — several specialised agents coordinating.

Each step up multiplies cost, latency, failure surface and debugging difficulty. Start at 1 and justify every step up.`),
    b("c2", "mental_model", "The questions that decide the level", `- Is the sequence of steps known in advance? → yes: level 3, not 4.
- Is the number of steps bounded? → unbounded suggests an agent, and also suggests a bad requirement.
- Does a wrong step cost money or change data? → prefer human approval over autonomy.
- Can you write the test? → if you cannot describe correct behaviour, an agent will not discover it.
- What happens on the worst run? → if the answer is unacceptable, you need level ≤ 3 or hard limits.`),
    b("c3", "engineering_note", "Non-determinism changes your testing strategy", `Deterministic systems get assertion tests. Agentic systems need:
- a fixed scenario suite with expected *properties*, not exact strings
- bounded iterations, timeouts and spend caps as hard code, never as prompt instructions
- full traces of every tool call for post-hoc review
- a replay mechanism so a failure can be re-examined

If a system cannot be replayed, it cannot be debugged.`),
    b("c4", "case", "Case: the invoice question", `A finance team wants "ask questions about our invoices". Volumes: 2,000 invoices/month, already in Postgres. Questions are overwhelmingly aggregate ("total by vendor last quarter").

Option 1 — a text-to-SQL *workflow* (level 3): validated query against a read-only replica, with a whitelist of tables. Deterministic, auditable, cents per query.

Option 4 — an agent that explores the schema, writes queries, retries on error, and summarises. Flexible, slower, costlier, and capable of a 40-step loop on a malformed question.

The correct answer for this requirement is level 3. Write that decision down, with the condition that would change it — for example, questions needing multi-source joins across systems that no single query can express.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Take a real requirement, place it on the ladder, write a short decision memo rejecting the level above it, and state the trigger that would change your mind.`),
  ],

  // =====================================================================
  "l-sec-1": [
    b("why", "why", "Why this matters", `Your target production role lists security as a requirement, and AI features add attack surface that classical checklists do not cover. The failures here are not embarrassing bugs — they are data breaches.`),
    b("c1", "concept", "Broken object-level authorisation is the number one API risk", `The pattern that leaks data:

    GET /api/projects/{id}      → fetch project by id, return it

Authentication passed. Authorisation never happened. Any logged-in user reads any project by changing a number.

The fix is structural, not a patch: ownership is part of the query, derived from the session on the server, never from the request.

    const project = await db.projects.findOne({ _id: id, ownerId: session.userId });

If the ownership check lives in a controller rather than the data access layer, some future route will forget it.`, "ts"),
    b("c2", "concept", "Prompt injection is not solvable by prompting", `Any text the model reads — a retrieved document, a web page, a filename, a tool result — can carry instructions. Asking the model to ignore them is a mitigation, not a control.

Layered defences, in order of actual effectiveness:
1. **Least privilege for tools.** If the model cannot delete, injected text cannot delete.
2. **Deterministic authorisation outside the model.** Filter retrieval by the *user's* permissions before the model sees anything.
3. **Output constraints.** Structured outputs validated by a schema; never execute model output directly.
4. **Human approval** for irreversible actions.
5. **Instruction hierarchy in the prompt.** Useful, weakest, and the only one most teams implement.`),
    b("c3", "engineering_note", "Excessive data exposure and the server/client boundary", `Returning a whole document and hiding fields in the UI is a leak: the payload is in the browser's network tab. Serialise explicitly — an allowlist of fields per endpoint, never \`return user\`.

Related rule: secrets never cross the boundary. No \`NEXT_PUBLIC_\` prefix on anything sensitive, no provider token in a client component, no connection string in an error message returned to the caller.`),
    b("c4", "pitfall", "SSRF through a 'fetch this URL' feature", `A research or ingestion feature that fetches a user-supplied URL will be pointed at \`http://169.254.169.254/\` (cloud metadata) or \`http://localhost:27017\`. Controls: scheme allowlist, DNS resolution checked against private ranges *after* resolution, no redirects followed blindly, egress restrictions, timeouts and size caps.`),
    b("t1", "transfer", "Transfer task", `Threat-model the mentor feature of this very application: it reads your notes, your mastery data and retrieved curriculum text, and it can call tools. List three attack paths and the control that stops each, ranked by effectiveness.`),
    b("ck", "checkpoint", "Mastery checkpoint", `Attack one of your own endpoints: attempt an object-level authorisation bypass and an injection, document what you found, and show the layer where the fix belongs.`),
  ],
};
