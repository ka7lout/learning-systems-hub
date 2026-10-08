export interface CurriculumNodeSeed {
  id: string;
  slug: string;
  title: string;
  stage: "foundations" | "mathematics" | "data_systems" | "machine_learning" | "deep_learning" | "modern_ai" | "ai_systems" | "research";
  sourceCategory: "original_curriculum" | "harvard_college" | "harvard_extension" | "industry_extension" | "research_extension";
  moduleNumber?: number;
  sessionIndex?: number;
  level: "foundational" | "intermediate" | "advanced" | "graduate" | "research";
  prerequisites: string[];
  corequisites: string[];
  whyItMatters: string;
  learningObjectives: string[];
  skills: string[];
  mustWriteNotes: string[];
  recommendedNotes: string[];
  optionalNotes: string[];
  englishKeywords: string[];
  sources: Array<{ title: string; url: string; verificationStatus: string; note: string }>;
  orderIndex: number;
}

export const CANONICAL_CURRICULUM_NODES: CurriculumNodeSeed[] = [
  // ==========================================
  // MODULE 1: Python Programming (10 Sessions)
  // ==========================================
  {
    id: "m1-s1-fundamentals",
    slug: "python-fundamentals",
    title: "Python Fundamentals & Control Flow",
    stage: "foundations",
    sourceCategory: "original_curriculum",
    moduleNumber: 1,
    sessionIndex: 1,
    level: "foundational",
    prerequisites: [],
    corequisites: [],
    whyItMatters: "Python is the lingua franca of AI Engineering. Clean mastery of syntax, execution models, and control flow prevents subtle computational bugs in tensor manipulation and training scripts.",
    learningObjectives: [
      "Master variable assignment, dynamic typing, and memory references",
      "Apply explicit type casting and avoid type coercion errors",
      "Formulate deterministic branching with conditionals (if/elif/else)",
      "Construct efficient for/while iterations with break, continue, and pass"
    ],
    skills: ["Python Syntax", "Control Flow", "Type Casting", "Memory References"],
    mustWriteNotes: [
      "Python variables are names bound to memory objects, not memory slots holding values.",
      "The exact semantics of 'break' (exit loop) vs 'continue' (skip iteration) vs 'pass' (syntactic no-op).",
      "Short-circuit evaluation rule in boolean logical expressions."
    ],
    recommendedNotes: [
      "Built-in operator precedence hierarchy.",
      "Common edge cases in float representation and equality checking."
    ],
    optionalNotes: [
      "PEP 8 stylistic conventions and indentation grammar specification."
    ],
    englishKeywords: ["dynamic typing", "coercion", "iteration", "short-circuit", "precedence", "immutable"],
    sources: [
      { title: "Original AI Curriculum Module 1.1", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly from specification." },
      { title: "Harvard CS50 Python Lecture", url: "https://cs50.harvard.edu/college/2026/fall/", verificationStatus: "confirmed_current", note: "Harvard CS50 Week 6 Python fundamentals equivalent." }
    ],
    orderIndex: 1
  },
  {
    id: "m1-s2-data-structures-functions",
    slug: "python-data-structures-and-functions",
    title: "Data Structures & Functions",
    stage: "foundations",
    sourceCategory: "original_curriculum",
    moduleNumber: 1,
    sessionIndex: 2,
    level: "foundational",
    prerequisites: ["m1-s1-fundamentals"],
    corequisites: [],
    whyItMatters: "AI data pipelines and embedding batches depend entirely on selecting the correct time-complexity collection: O(1) hash map lookups vs O(N) list scans.",
    learningObjectives: [
      "Distinguish mutable lists and dicts from immutable tuples and sets",
      "Write pure, modular functions with positional, default, *args, and **kwargs",
      "Construct anonymous lambda transformations and list comprehensions",
      "Master LEGB variable scoping rules (Local, Enclosing, Global, Built-in)"
    ],
    skills: ["Data Structures", "Functional Programming", "List Comprehensions", "LEGB Scope"],
    mustWriteNotes: [
      "Time complexity table for List vs Set vs Dict (Lookup, Insert, Delete).",
      "LEGB variable scope resolution chain diagram.",
      "Default mutable argument pitfall (e.g. def fn(arg=[])) and why it fails."
    ],
    recommendedNotes: [
      "Dictionary key hashing requirements (hashable and immutable).",
      "Tuple unpacking patterns in multi-return functions."
    ],
    optionalNotes: [
      "Bytecode inspection of list comprehensions vs traditional for-loops."
    ],
    englishKeywords: ["mutability", "immutability", "scoping", "hashable", "comprehension", "unpacking"],
    sources: [
      { title: "Original AI Curriculum Module 1.2", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 2
  },
  {
    id: "m1-s3-error-handling-io",
    slug: "error-handling-and-file-io",
    title: "Error Handling & File I/O (CSV & JSON)",
    stage: "foundations",
    sourceCategory: "original_curriculum",
    moduleNumber: 1,
    sessionIndex: 3,
    level: "foundational",
    prerequisites: ["m1-s2-data-structures-functions"],
    corequisites: [],
    whyItMatters: "Real dataset ingestion involves malformed rows, missing schemas, and unexpected network streams. Robust exception handling prevents training crashes after hours of computation.",
    learningObjectives: [
      "Implement robust try/except/else/finally exception blocks",
      "Design custom domain exception classes inheriting from Exception",
      "Safely stream file I/O with context managers ('with' statements)",
      "Serialize and deserialize structured CSV and JSON data payloads"
    ],
    skills: ["Exception Handling", "File I/O", "CSV Processing", "JSON Serialization"],
    mustWriteNotes: [
      "The execution sequence of try -> except -> else -> finally under success vs exception.",
      "Why 'except Exception as e:' should be preferred over bare 'except:'.",
      "Context manager protocol (__enter__ and __exit__) guarantees resource cleanup."
    ],
    recommendedNotes: [
      "Handling encoding issues (UTF-8 vs Latin-1) during dataset reading.",
      "JSON serialization limitations (e.g., NumPy ndarrays require custom encoder)."
    ],
    optionalNotes: [
      "Traceback introspection with the standard 'sys' and 'traceback' modules."
    ],
    englishKeywords: ["exception", "context manager", "serialization", "deserialization", "idempotency"],
    sources: [
      { title: "Original AI Curriculum Module 1.3", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 3
  },
  {
    id: "m1-s4-algorithms-oop",
    slug: "algorithms-and-oop-fundamentals",
    title: "Algorithms & OOP (Search, Sort, Classes)",
    stage: "foundations",
    sourceCategory: "original_curriculum",
    moduleNumber: 1,
    sessionIndex: 4,
    level: "foundational",
    prerequisites: ["m1-s2-data-structures-functions"],
    corequisites: [],
    whyItMatters: "Modern ML frameworks like PyTorch (nn.Module) and Hugging Face are built entirely on Object-Oriented inheritance and algorithmic recursion.",
    learningObjectives: [
      "Implement Linear Search O(N) and Binary Search O(log N)",
      "Trace Bubble Sort and implement recursive tree/divide-and-conquer logic",
      "Construct Classes, Instance Attributes, and Constructor methods (__init__)",
      "Apply OOP Inheritance and Polymorphic method overrides"
    ],
    skills: ["Binary Search", "Recursion", "OOP Classes", "Inheritance", "Polymorphism"],
    mustWriteNotes: [
      "Binary Search prerequisite invariant: data must be sorted.",
      "Base case requirement in recursion to prevent RecursionError stack overflow.",
      "The 'self' reference binding in Python method invocation."
    ],
    recommendedNotes: [
      "Super() method call hierarchy in single and multiple inheritance.",
      "Big-O comparison chart of searching and basic sorting algorithms."
    ],
    optionalNotes: [
      "Method Resolution Order (MRO) with C3 Linearization."
    ],
    englishKeywords: ["recursion", "polymorphism", "inheritance", "asymptotic", "invariant"],
    sources: [
      { title: "Original AI Curriculum Module 1.4", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard CS50 Algorithms & Data Structures", url: "https://cs50.harvard.edu/college/2026/fall/", verificationStatus: "confirmed_current", note: "Corresponds to CS50 search and sort algorithms." }
    ],
    orderIndex: 4
  },
  {
    id: "m1-s5-advanced-oop-ecosystem",
    slug: "advanced-oop-and-python-ecosystem",
    title: "Advanced OOP & Python Ecosystem (Magic Methods, Packages)",
    stage: "foundations",
    sourceCategory: "original_curriculum",
    moduleNumber: 1,
    sessionIndex: 5,
    level: "intermediate",
    prerequisites: ["m1-s4-algorithms-oop"],
    corequisites: [],
    whyItMatters: "Building custom PyTorch Dataset classes or Scikit-Learn transformers requires implementing dunder magic methods (__len__, __getitem__, __call__).",
    learningObjectives: [
      "Implement Encapsulation with private name mangling and @property decorators",
      "Apply Abstraction using Abstract Base Classes (abc.ABC)",
      "Implement Dunder Magic Methods (__str__, __repr__, __len__, __getitem__, __call__)",
      "Manage virtual environments (venv, uv, poetry) and modular packages"
    ],
    skills: ["Advanced OOP", "Dunder Methods", "Virtual Environments", "Packaging"],
    mustWriteNotes: [
      "Difference between __repr__ (unambiguous developer view) and __str__ (readable user view).",
      "How __getitem__ and __len__ enable Python duck-typing for dataset indexability.",
      "Why isolated virtual environments prevent dependency conflicts."
    ],
    recommendedNotes: [
      "@classmethod vs @staticmethod vs instance methods.",
      "Package structure with __init__.py and pyproject.toml."
    ],
    optionalNotes: [
      "Metaclasses and runtime class generation in framework code."
    ],
    englishKeywords: ["encapsulation", "abstraction", "magic methods", "duck typing", "isolated environment"],
    sources: [
      { title: "Original AI Curriculum Module 1.5", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 5
  },

  // ==========================================
  // HARVARD COLLEGE CS CORE FOUNDATIONS
  // ==========================================
  {
    id: "cs-c-memory-systems",
    slug: "c-programming-memory-model",
    title: "C Memory Model, Pointers & Systems Fundamentals",
    stage: "foundations",
    sourceCategory: "harvard_college",
    level: "foundational",
    prerequisites: ["m1-s1-fundamentals"],
    corequisites: [],
    whyItMatters: "Deep learning models execute on raw CUDA C/C++ kernels. Understanding pointers, stack vs heap allocation, and memory locality is essential for understanding GPU tensor allocation and inference latency.",
    learningObjectives: [
      "Trace pointer arithmetic, memory addresses, and dereferencing in C",
      "Manage stack vs heap memory explicitly with malloc, calloc, realloc, and free",
      "Diagnose memory leaks, segmentation faults, and buffer overflows using Valgrind/GDB",
      "Understand machine compilation, linking, and CPU instruction cache locality"
    ],
    skills: ["C Programming", "Pointers", "Dynamic Memory", "Valgrind", "Memory Locality"],
    mustWriteNotes: [
      "Stack (automatic, fast, fixed size) vs Heap (manual, dynamic, prone to fragmentation/leaks).",
      "Pointer dereferencing syntax: '&var' yields address, '*ptr' accesses target value.",
      "The Golden Rule of memory: every malloc() MUST pair with exactly one free()."
    ],
    recommendedNotes: [
      "Array representation in C as contiguous memory blocks with pointer equivalence.",
      "Common vulnerabilities: dangling pointers, use-after-free, double-free."
    ],
    optionalNotes: [
      "Assembly-level stack frames (RBP/RSP registers) and calling conventions."
    ],
    englishKeywords: ["pointer", "dereference", "segmentation fault", "heap allocation", "cache locality"],
    sources: [
      { title: "Harvard CS50 Weeks 3-5 (C, Memory, Data Structures)", url: "https://cs50.harvard.edu/college/2026/fall/syllabus/", verificationStatus: "confirmed_current", note: "Harvard College CS50 core requirements." },
      { title: "Harvard CS61 Systems Programming", url: "https://csadvising.seas.harvard.edu/concentration/requirements/", verificationStatus: "confirmed_current", note: "SEAS CS Core systems requirement." }
    ],
    orderIndex: 6
  },
  {
    id: "cs-data-structures-algorithms-core",
    slug: "harvard-data-structures-and-algorithms",
    title: "Advanced Data Structures & Asymptotic Analysis",
    stage: "foundations",
    sourceCategory: "harvard_college",
    level: "intermediate",
    prerequisites: ["cs-c-memory-systems", "m1-s4-algorithms-oop"],
    corequisites: [],
    whyItMatters: "Vector search indexes (HNSW), Graph neural networks, and AST parsers in LLMs rely on trees, graphs, and hash algorithms.",
    learningObjectives: [
      "Implement dynamic Linked Lists, Stacks, Queues, Binary Search Trees, and Hash Tables",
      "Analyze time and space complexity using Big-O, Big-Omega, and Big-Theta notation",
      "Implement Graph traversal algorithms: BFS, DFS, Dijkstra, and Topological Sort",
      "Apply Divide & Conquer (MergeSort, QuickSort) and Dynamic Programming (Memoization, Tabulation)"
    ],
    skills: ["Data Structures", "Big-O Analysis", "Graph Algorithms", "Dynamic Programming"],
    mustWriteNotes: [
      "Formal Big-O definition: f(n) <= c * g(n) for all n >= n0.",
      "Hash collision resolution strategies: Chaining vs Open Addressing (Linear/Quadratic Probing).",
      "Dynamic programming recurrence formulation: optimal substructure + overlapping subproblems."
    ],
    recommendedNotes: [
      "Self-balancing BSTs (AVL, Red-Black) and why tree height O(log N) matters.",
      "Amortized complexity analysis (e.g. dynamic array resizing)."
    ],
    optionalNotes: [
      "Trie data structure implementation for autocomplete and prefix token search."
    ],
    englishKeywords: ["asymptotic", "amortized", "optimal substructure", "topological sort", "memoization"],
    sources: [
      { title: "Harvard CS1240 Data Structures and Algorithms", url: "https://csadvising.seas.harvard.edu/concentration/requirements/", verificationStatus: "confirmed_current", note: "Harvard College CS concentration core requirement." }
    ],
    orderIndex: 7
  },

  // ==========================================
  // MODULE 2: Math & Statistics (5 Sessions) + Harvard Math Rigor
  // ==========================================
  {
    id: "m2-s1-linear-algebra-foundations",
    slug: "linear-algebra-foundations",
    title: "Linear Algebra Foundations (Vectors, Matrices, Determinants)",
    stage: "mathematics",
    sourceCategory: "original_curriculum",
    moduleNumber: 2,
    sessionIndex: 1,
    level: "foundational",
    prerequisites: ["m1-s1-fundamentals"],
    corequisites: [],
    whyItMatters: "In AI, every input (image, text token, tabular record) is represented as a tensor. Neural network layers are matrix transformations in high-dimensional vector spaces.",
    learningObjectives: [
      "Represent scalars, vectors, matrices, and multi-dimensional tensors",
      "Execute Matrix Multiplication, Transpose, and Dot Products with dimensional validity",
      "Calculate Determinants and interpret geometric volume scaling",
      "Visualize linear transformations in 2D and 3D Euclidean space"
    ],
    skills: ["Linear Algebra", "Matrix Multiplication", "Tensors", "Determinants"],
    mustWriteNotes: [
      "Matrix multiplication dimension compatibility rule: (M x K) * (K x N) = (M x N).",
      "Geometric meaning of determinant: det(A) = 0 means dimension collapse and non-invertibility.",
      "Dot product formula: a . b = ||a|| ||b|| cos(theta) = sum(a_i * b_i)."
    ],
    recommendedNotes: [
      "Tensor rank terminology (Rank 0: scalar, Rank 1: vector, Rank 2: matrix, Rank 3+: tensor).",
      "Properties of identity and diagonal matrices."
    ],
    optionalNotes: [
      "Linear independence and vector span formal definitions."
    ],
    englishKeywords: ["linear transformation", "determinant", "tensor", "dot product", "orthogonal"],
    sources: [
      { title: "Original AI Curriculum Module 2.1", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard MATH 21B Linear Algebra", url: "https://www.math.harvard.edu/courses/", verificationStatus: "confirmed_current", note: "Harvard College Math sequence." }
    ],
    orderIndex: 8
  },
  {
    id: "m2-s2-linear-algebra-advanced",
    slug: "linear-algebra-advanced-eigenvalues",
    title: "Linear Algebra Advanced (Eigenvalues, Inverses, Norms)",
    stage: "mathematics",
    sourceCategory: "original_curriculum",
    moduleNumber: 2,
    sessionIndex: 2,
    level: "intermediate",
    prerequisites: ["m2-s1-linear-algebra-foundations"],
    corequisites: [],
    whyItMatters: "PCA dimensionality reduction, spectral graph convolutions, and attention head stability rely on Eigen decomposition, SVD, and matrix norms.",
    learningObjectives: [
      "Compute Eigenvalues and Eigenvectors (Av = lambda * v) and understand principal directions",
      "Calculate Matrix Inverses and apply pseudo-inverses for non-square matrices",
      "Compute Vector and Matrix Norms (L1, L2, L-infinity, Frobenius)",
      "Compute Cross Products and verify orthogonality in feature spaces"
    ],
    skills: ["Eigen Decomposition", "Matrix Inverse", "Vector Norms", "SVD Intuition"],
    mustWriteNotes: [
      "Characteristic equation: det(A - lambda * I) = 0 for finding eigenvalues.",
      "L1 norm (Lasso: induces sparsity) vs L2 norm (Ridge: penalizes large weights evenly).",
      "Orthogonal matrix property: Q^T * Q = I, preserving vector length."
    ],
    recommendedNotes: [
      "Condition number of a matrix and numerical stability in gradient inversion.",
      "Singular Value Decomposition (SVD): A = U * Sigma * V^T intuition."
    ],
    optionalNotes: [
      "Positive semi-definite matrices and quadratic forms in optimization."
    ],
    englishKeywords: ["eigenvalue", "eigenvector", "L1 norm", "L2 norm", "Frobenius norm", "singular value decomposition"],
    sources: [
      { title: "Original AI Curriculum Module 2.2", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 9
  },
  {
    id: "m2-s3-calculus-optimization",
    slug: "calculus-and-optimization-gradients",
    title: "Calculus & Optimization (Derivatives, Chain Rule, Gradient Descent)",
    stage: "mathematics",
    sourceCategory: "original_curriculum",
    moduleNumber: 2,
    sessionIndex: 3,
    level: "intermediate",
    prerequisites: ["m2-s2-linear-algebra-advanced"],
    corequisites: [],
    whyItMatters: "Deep learning backpropagation is the computational application of the Multivariable Chain Rule. Gradient descent is the engine that fits millions of neural parameters.",
    learningObjectives: [
      "Compute Partial Derivatives, Gradients (nabla f), and Jacobians",
      "Apply the Multivariable Chain Rule across composite functions",
      "Implement Gradient Descent, Batch GD, and Stochastic Gradient Descent (SGD)",
      "Analyze Convexity, Local Minima, Saddle Points, and Learning Rate dynamics"
    ],
    skills: ["Multivariable Calculus", "Partial Derivatives", "Chain Rule", "Gradient Descent", "Optimization"],
    mustWriteNotes: [
      "Gradient vector points in the direction of steepest ASCENT; we subtract (theta = theta - eta * grad) to minimize.",
      "Chain rule for composite function f(g(x)): df/dx = (df/dg) * (dg/dx).",
      "Learning rate dilemma: too high -> divergence/oscillation; too low -> stagnation/plateau."
    ],
    recommendedNotes: [
      "Hessian matrix of second derivatives and curvature / condition numbers.",
      "Momentum intuition: accumulating velocity to bypass saddle points."
    ],
    optionalNotes: [
      "Convex optimization duality and Karush-Kuhn-Tucker (KKT) conditions."
    ],
    englishKeywords: ["partial derivative", "gradient", "Jacobian", "backpropagation", "convexity", "saddle point"],
    sources: [
      { title: "Original AI Curriculum Module 2.3", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard CS1280 / APMTH 120 Convex Optimization", url: "https://csadvising.seas.harvard.edu/concentration/requirements/", verificationStatus: "confirmed_current", note: "Harvard College Optimization offering." }
    ],
    orderIndex: 10
  },
  {
    id: "m2-s4-descriptive-inferential-statistics",
    slug: "statistics-foundations-distributions",
    title: "Statistics Foundations (Descriptive Stats, Distributions, Skewness)",
    stage: "mathematics",
    sourceCategory: "original_curriculum",
    moduleNumber: 2,
    sessionIndex: 4,
    level: "foundational",
    prerequisites: ["m1-s1-fundamentals"],
    corequisites: [],
    whyItMatters: "Machine learning models assume data distributions. Understanding variance, skewness, and IQR is the prerequisite for robust outlier cleaning and feature normalization.",
    learningObjectives: [
      "Distinguish Population parameters from Sample statistics",
      "Calculate Mean, Median, Mode, Variance, Standard Deviation, and IQR",
      "Evaluate Probability Distributions (Normal, Binomial, Uniform, Poisson)",
      "Analyze Skewness, Kurtosis, and detect distribution drift"
    ],
    skills: ["Descriptive Statistics", "Variance & StdDev", "IQR", "Distributions", "Skewness"],
    mustWriteNotes: [
      "Bessel's correction: Sample variance divides by (N - 1) instead of N to eliminate bias.",
      "IQR rule for outlier detection: [Q1 - 1.5*IQR, Q3 + 1.5*IQR].",
      "Skewness direction rule: Positive skew -> tail to right (Mean > Median)."
    ],
    recommendedNotes: [
      "Standard Normal Z-transformation: Z = (X - mu) / sigma.",
      "Kurtosis as a measure of heavy tails and outlier risk in financial ML."
    ],
    optionalNotes: [
      "Moment generating functions and theoretical distribution derivations."
    ],
    englishKeywords: ["variance", "standard deviation", "interquartile range", "skewness", "kurtosis", "Bessel correction"],
    sources: [
      { title: "Original AI Curriculum Module 2.4", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 11
  },
  {
    id: "m2-s5-probability-bayes",
    slug: "probability-bayes-likelihood",
    title: "Probability, Bayes' Theorem & Statistical Likelihood",
    stage: "mathematics",
    sourceCategory: "original_curriculum",
    moduleNumber: 2,
    sessionIndex: 5,
    level: "intermediate",
    prerequisites: ["m2-s4-descriptive-inferential-statistics"],
    corequisites: [],
    whyItMatters: "Classification models output probability scores. Bayes' theorem governs Bayesian inference, Naive Bayes classifiers, and Maximum Likelihood Estimation (MLE).",
    learningObjectives: [
      "Master Conditional Probability P(A|B) and Joint Probability P(A, B)",
      "Apply Bayes' Theorem: P(A|B) = P(B|A) * P(A) / P(B)",
      "Formulate Likelihood functions and Maximum Likelihood Estimation (MLE)",
      "Compute Covariance and Pearson/Spearman Correlation coefficients"
    ],
    skills: ["Probability", "Bayes Theorem", "Likelihood Estimation", "Correlation & Covariance"],
    mustWriteNotes: [
      "Bayes' Formula terminology: Posterior = (Likelihood * Prior) / Evidence.",
      "Law of Total Probability: P(B) = sum_i [ P(B|A_i) * P(A_i) ].",
      "Correlation != Causation: Pearson r measures LINEAR dependency only."
    ],
    recommendedNotes: [
      "Independence condition: P(A and B) = P(A) * P(B) iff A and B are independent.",
      "Log-Likelihood formulation and why we maximize sums instead of products."
    ],
    optionalNotes: [
      "Markov chains and stationary distribution convergence."
    ],
    englishKeywords: ["conditional probability", "Bayes theorem", "prior", "posterior", "likelihood", "covariance"],
    sources: [
      { title: "Original AI Curriculum Module 2.5", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard STAT 110: Introduction to Probability (Prof. Joe Blitzstein)", url: "https://stat110.fas.harvard.edu/", verificationStatus: "confirmed_current", note: "Gold-standard Harvard probability curriculum." }
    ],
    orderIndex: 12
  },

  // ==========================================
  // MODULE 3: Data Analysis with Python (10 Sessions)
  // ==========================================
  {
    id: "m3-s1-numpy-foundations",
    slug: "numpy-foundations-ndarrays",
    title: "NumPy Foundations & N-Dimensional Arrays",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 3,
    sessionIndex: 1,
    level: "foundational",
    prerequisites: ["m1-s2-data-structures-functions", "m2-s1-linear-algebra-foundations"],
    corequisites: [],
    whyItMatters: "NumPy ndarrays provide contiguous C-level memory storage and vectorized SIMD execution, enabling 50x-100x speedups over pure Python loops.",
    learningObjectives: [
      "Instantiate 1D, 2D, and N-D arrays with explicit dtypes (float32, int64)",
      "Execute multi-axis slicing, fancy indexing, and boolean masking",
      "Manipulate array shapes using reshape, transpose, flatten, and squeeze",
      "Understand memory strides and view vs copy mechanics"
    ],
    skills: ["NumPy", "NDArrays", "Array Slicing", "Memory Strides"],
    mustWriteNotes: [
      "Array slicing returns a VIEW; modifying a slice modifies the original array (use .copy() to decouple).",
      "Axis convention: axis=0 operates down columns (across rows); axis=1 operates across rows (across columns).",
      "Memory layout: C-contiguous (row-major) vs Fortran-contiguous (column-major)."
    ],
    recommendedNotes: [
      "Dtype memory footprints: float64 (8 bytes) vs float32 (4 bytes) vs float16 (2 bytes).",
      "Boolean mask filtering syntax: arr[arr > 0]."
    ],
    optionalNotes: [
      "NumPy memory buffer protocol and C-API integration."
    ],
    englishKeywords: ["vectorization", "stride", "contiguous memory", "boolean mask", "broadcasting"],
    sources: [
      { title: "Original AI Curriculum Module 3.1", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 13
  },
  {
    id: "m3-s2-numpy-perf-inferential-stats-pandas",
    slug: "numpy-perf-inferential-statistics-pandas-intro",
    title: "Broadcasting, Inferential Statistics (Hypothesis/AB Testing) & Pandas Intro",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 3,
    sessionIndex: 2,
    level: "intermediate",
    prerequisites: ["m3-s1-numpy-foundations", "m2-s5-probability-bayes"],
    corequisites: [],
    whyItMatters: "Broadcasting enables arithmetic between arrays of different shapes. Inferential testing (T-tests, A/B testing) is critical to prove model improvements are statistically significant.",
    learningObjectives: [
      "Apply NumPy Broadcasting rules across trailing dimensions",
      "Conduct Hypothesis Testing: Z-Score, T-Test (one-sample, two-sample), P-Value interpretation",
      "Formulate A/B Testing setups and Confidence Intervals (95% CI)",
      "Run One-Way ANOVA tests across multiple sample groups",
      "Initialize and index Pandas Series and DataFrames"
    ],
    skills: ["Broadcasting", "Hypothesis Testing", "A/B Testing", "P-Value Analysis", "Pandas Intro"],
    mustWriteNotes: [
      "Broadcasting Rule: Two dimensions are compatible if they are EQUAL or one of them is 1.",
      "P-Value definition: Probability of observing data at least as extreme assuming the Null Hypothesis (H0) is true.",
      "Type I Error (False Positive: rejecting true H0) vs Type II Error (False Negative: failing to reject false H0)."
    ],
    recommendedNotes: [
      "Confidence Interval interpretation: If we repeat the experiment 100 times, 95 intervals contain true population mean.",
      "Degrees of freedom in Student's T-distribution."
    ],
    optionalNotes: [
      "Benjamini-Hochberg FDR correction for multiple hypothesis testing."
    ],
    englishKeywords: ["broadcasting", "null hypothesis", "p-value", "confidence interval", "type I error", "type II error"],
    sources: [
      { title: "Original AI Curriculum Module 3.2", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard STAT 111 / CS109A Data Science 1", url: "https://csadvising.seas.harvard.edu/", verificationStatus: "confirmed_current", note: "Harvard Data Science statistical inference core." }
    ],
    orderIndex: 14
  },
  {
    id: "m3-s3-pandas-data-wrangling",
    slug: "pandas-data-wrangling-eda",
    title: "Pandas Data Wrangling & Feature Engineering Pipeline",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 3,
    sessionIndex: 3,
    level: "intermediate",
    prerequisites: ["m3-s2-numpy-perf-inferential-stats-pandas"],
    corequisites: [],
    whyItMatters: "Real-world data is messy, missing, and corrupted. 70% of an AI Engineer's pipeline effort is spent cleaning, joining, and engineering features in Pandas.",
    learningObjectives: [
      "Ingest CSV, Excel, JSON, and SQL database query streams into DataFrames",
      "Filter, sort, aggregate with groupby().agg(), and execute multi-table Merges and Joins",
      "Handle Missing Values: Imputation (mean, median, KNN) vs removal strategies",
      "Detect Outliers using IQR and Z-scores and construct new domain features",
      "Execute an end-to-end Exploratory Data Analysis (EDA) workflow"
    ],
    skills: ["Pandas", "Data Wrangling", "Missing Value Imputation", "Feature Engineering", "EDA"],
    mustWriteNotes: [
      "Merge types: Inner (intersection), Left (preserve left rows), Outer (full union), Right.",
      "Data Leakage warning: Imputation statistics (mean/std) MUST be fit ONLY on training fold, never on entire dataset.",
      "Groupby split-apply-combine lifecycle."
    ],
    recommendedNotes: [
      "Method chaining in Pandas for clean, reproducible pipelines.",
      "Categorical dtypes for reducing memory consumption by up to 80%."
    ],
    optionalNotes: [
      "Vectorized string operations and regex extraction in Pandas."
    ],
    englishKeywords: ["data leakage", "imputation", "aggregation", "exploratory data analysis", "wrangling"],
    sources: [
      { title: "Original AI Curriculum Module 3.3", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 15
  },
  {
    id: "m3-s4-data-visualization",
    slug: "data-visualization-matplotlib-seaborn-plotly",
    title: "Data Visualization & Storytelling (Matplotlib, Seaborn, Plotly)",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 3,
    sessionIndex: 4,
    level: "intermediate",
    prerequisites: ["m3-s3-pandas-data-wrangling"],
    corequisites: [],
    whyItMatters: "Visualizing feature distributions, correlations, and class imbalances reveals non-linear patterns, data artifacts, and evaluation failures invisible in summary statistics.",
    learningObjectives: [
      "Generate Line, Bar, Histogram, and Scatter plots in Matplotlib",
      "Construct correlation Heatmaps, Pairplots, and Violin/Distribution plots in Seaborn",
      "Build interactive zoomable charts and dashboards in Plotly",
      "Select the mathematically correct visualization for quantitative vs categorical features",
      "Communicate data stories clearly to technical and executive stakeholders"
    ],
    skills: ["Matplotlib", "Seaborn", "Plotly", "Data Visualization", "Data Storytelling"],
    mustWriteNotes: [
      "Chart selection heuristic: Continuous vs Continuous -> Scatter; Categorical vs Continuous -> Box/Violin; Correlation Matrix -> Heatmap.",
      "Heatmap correlation range [-1.0, 1.0] and multicollinearity diagnosis.",
      "Misleading chart traps: truncated y-axes, improper binning in histograms."
    ],
    recommendedNotes: [
      "Figure vs Axes object-oriented interface in Matplotlib.",
      "Plotly interactive callback structures."
    ],
    optionalNotes: [
      "Color theory and accessibility palettes (ColorBrewer, viridis)."
    ],
    englishKeywords: ["correlation heatmap", "pairplot", "multicollinearity", "interactive dashboard", "storytelling"],
    sources: [
      { title: "Original AI Curriculum Module 3.4", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 16
  },
  {
    id: "m3-s5-eda-capstone",
    slug: "eda-capstone-real-world-pipeline",
    title: "EDA Capstone: End-to-End Analysis Pipeline & Code Review",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 3,
    sessionIndex: 5,
    level: "intermediate",
    prerequisites: ["m3-s4-data-visualization"],
    corequisites: [],
    whyItMatters: "Synthesizes data wrangling, statistical inference, and visualization into a production-grade Jupyter/Python audit of real messy datasets (Uber/Superstore).",
    learningObjectives: [
      "Execute an end-to-end data pipeline: Load -> Clean -> Transform -> Analyze -> Present",
      "Identify data anomalies, seasonal trends, and demographic patterns in real datasets",
      "Deliver executive presentation and technical code review",
      "Write reproducible, documented Python scripts with assertions and tests"
    ],
    skills: ["EDA Capstone", "Pipeline Architecture", "Data Presentation", "Code Review"],
    mustWriteNotes: [
      "EDA checklist: 1) Shape and dtypes, 2) Missing values, 3) Duplicates, 4) Summary stats, 5) Outlier check, 6) Correlation & distribution.",
      "Documenting assumptions and data caveats upfront in technical reports."
    ],
    recommendedNotes: [
      "Structuring Jupyter Notebooks for production readability (Executive Summary -> Methodology -> Findings -> Next Steps)."
    ],
    optionalNotes: [
      "Automated profiling tools (ydata-profiling) vs custom manual audit."
    ],
    englishKeywords: ["capstone", "data pipeline", "code review", "reproducibility", "executive presentation"],
    sources: [
      { title: "Original AI Curriculum Module 3.5", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 17
  },

  // ==========================================
  // MODULE 4: Excel & Power BI (4 Sessions)
  // ==========================================
  {
    id: "m4-s1-excel-data-analysis",
    slug: "excel-for-data-analysis-power-query",
    title: "Excel for Business Analytics (XLOOKUP, Pivot, Power Query)",
    stage: "data_systems",
    sourceCategory: "industry_extension",
    moduleNumber: 4,
    sessionIndex: 1,
    level: "foundational",
    prerequisites: ["m1-s1-fundamentals"],
    corequisites: [],
    whyItMatters: "Enterprise AI projects interface with business stakeholders who consume results via Excel models. Rapid data sanity checks and client exports frequently occur in Excel.",
    learningObjectives: [
      "Master modern Excel functions: XLOOKUP, INDEX/MATCH, nested IF/IFS, and dynamic arrays",
      "Build dynamic multi-dimensional Pivot Tables and Slicers",
      "Automate data extraction, transformation, and cleaning in Power Query",
      "Design executive financial and operational KPI dashboards"
    ],
    skills: ["Excel Analytics", "XLOOKUP", "Pivot Tables", "Power Query", "KPI Dashboards"],
    mustWriteNotes: [
      "XLOOKUP advantages over VLOOKUP: doesn't break on column inserts, exact match by default, left-lookup capability.",
      "Power Query M-code transformation pipeline preserves immutable repeatable steps.",
      "Pivot Table caching model and manual refresh requirements."
    ],
    recommendedNotes: [
      "Dynamic array formulas (FILTER, UNIQUE, SORT).",
      "Conditional formatting rules for anomaly spotting."
    ],
    optionalNotes: [
      "Excel VBA macro automation vs modern Office Scripts (TypeScript)."
    ],
    englishKeywords: ["XLOOKUP", "pivot table", "power query", "dashboard", "KPI"],
    sources: [
      { title: "Original AI Curriculum Module 4.1", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly as Industry Business Analytics Extension." }
    ],
    orderIndex: 18
  },
  {
    id: "m4-s2-power-bi-modeling-dax",
    slug: "power-bi-data-modeling-dax",
    title: "Power BI Data Modeling, DAX & Executive Reporting",
    stage: "data_systems",
    sourceCategory: "industry_extension",
    moduleNumber: 4,
    sessionIndex: 2,
    level: "intermediate",
    prerequisites: ["m4-s1-excel-data-analysis"],
    corequisites: [],
    whyItMatters: "Power BI is the enterprise standard for publishing live business intelligence dashboards connected to cloud data warehouses and ML scoring endpoints.",
    learningObjectives: [
      "Construct Star Schema and Snowflake Schema relational data models in Power BI",
      "Formulate DAX measures (CALCULATE, FILTER, RELATED, Time Intelligence)",
      "Establish active vs inactive relationships and filter direction (single vs both)",
      "Build interactive multi-page reports and publish to Power BI Service"
    ],
    skills: ["Power BI", "Data Modeling", "DAX Formulas", "Star Schema", "Business Intelligence"],
    mustWriteNotes: [
      "CALCULATE() modifies the evaluation filter context of a measure.",
      "Calculated Column (evaluated at row level during refresh) vs Calculated Measure (evaluated dynamically at query time based on user filter context).",
      "Star Schema (Fact tables surrounded by Dimension tables) optimizes query speed."
    ],
    recommendedNotes: [
      "Time Intelligence DAX functions (YTD, SAMEPERIODLASTYEAR).",
      "Row-Level Security (RLS) implementation in Power BI."
    ],
    optionalNotes: [
      "Power BI REST API and embedding reports into React/Next.js portals."
    ],
    englishKeywords: ["DAX", "filter context", "star schema", "fact table", "dimension table", "row-level security"],
    sources: [
      { title: "Original AI Curriculum Module 4.2", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 19
  },

  // ==========================================
  // MODULE 5: Databases & Data Engineering (8 Sessions)
  // ==========================================
  {
    id: "m5-s1-sql-database-design",
    slug: "sql-and-relational-database-design",
    title: "SQL & Relational Database Design (DDL, DML, DQL, Normalization)",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 5,
    sessionIndex: 1,
    level: "foundational",
    prerequisites: ["m1-s3-error-handling-io"],
    corequisites: [],
    whyItMatters: "All enterprise AI applications query structured relational databases. Bad schemas cause data duplication, anomaly writes, and catastrophic query latency.",
    learningObjectives: [
      "Design Entity-Relationship Diagrams (ERD) with primary and foreign key constraints",
      "Apply Normalization principles (1NF, 2NF, 3NF, BCNF) to eliminate redundancy",
      "Write DDL (CREATE, ALTER, DROP), DML (INSERT, UPDATE, DELETE), and DQL (SELECT, WHERE, ORDER BY, LIMIT) commands",
      "Enforce ACID transaction properties (Atomicity, Consistency, Isolation, Durability)"
    ],
    skills: ["SQL", "Database Design", "ERD Modeling", "Normalization", "ACID Transactions"],
    mustWriteNotes: [
      "1NF: Atomic values; 2NF: No partial dependency on composite key; 3NF: No transitive dependency.",
      "Primary Key (unique, non-null row identifier) vs Foreign Key (referential integrity link).",
      "ACID transactions guarantee: BEGIN TRANSACTION ... COMMIT / ROLLBACK."
    ],
    recommendedNotes: [
      "Indexes (B-Trees) speed up WHERE/JOIN lookups at the cost of slower INSERT/UPDATE.",
      "Foreign key CASCADE vs RESTRICT delete constraints."
    ],
    optionalNotes: [
      "PostgreSQL internal MVCC (Multi-Version Concurrency Control) implementation."
    ],
    englishKeywords: ["normalization", "referential integrity", "ACID", "foreign key", "atomicity", "schema"],
    sources: [
      { title: "Original AI Curriculum Module 5.1", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard CS50 SQL Week & CS1650 Data Systems", url: "https://csadvising.seas.harvard.edu/", verificationStatus: "confirmed_current", note: "Harvard College database requirements." }
    ],
    orderIndex: 20
  },
  {
    id: "m5-s2-advanced-sql",
    slug: "advanced-sql-window-functions-ctes",
    title: "Advanced SQL: Window Functions, CTEs, Subqueries & Optimization",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 5,
    sessionIndex: 2,
    level: "intermediate",
    prerequisites: ["m5-s1-sql-database-design"],
    corequisites: [],
    whyItMatters: "Preparing training cohorts, calculating running cumulative metrics, and ranking features requires Window Functions (OVER, PARTITION BY) and Common Table Expressions (CTEs).",
    learningObjectives: [
      "Formulate multi-table JOINs (INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF JOIN)",
      "Write Common Table Expressions (WITH cte AS) and recursive CTEs",
      "Apply Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), SUM() OVER (PARTITION BY)",
      "Diagnose query execution plans using EXPLAIN ANALYZE and optimize indexes"
    ],
    skills: ["Advanced SQL", "Window Functions", "CTEs", "Query Optimization", "EXPLAIN ANALYZE"],
    mustWriteNotes: [
      "Window functions do NOT collapse rows like GROUP BY; they retain individual rows while computing partition aggregations.",
      "RANK() leaves gaps on ties (1, 2, 2, 4); DENSE_RANK() leaves no gaps (1, 2, 2, 3).",
      "EXPLAIN ANALYZE shows Sequential Scan vs Index Scan and actual execution time."
    ],
    recommendedNotes: [
      "Correlated vs non-correlated subqueries and optimizer rewrite behavior.",
      "Stored Procedures and Database Triggers."
    ],
    optionalNotes: [
      "PostgreSQL Partial and Expression-based Indexes."
    ],
    englishKeywords: ["window function", "partition by", "CTE", "execution plan", "sequential scan", "index scan"],
    sources: [
      { title: "Original AI Curriculum Module 5.2", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 21
  },
  {
    id: "m5-s3-web-scraping-data-acquisition",
    slug: "web-scraping-and-data-acquisition-pipelines",
    title: "Web Scraping & Automated Data Ingestion (BeautifulSoup, Selenium, APIs)",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 5,
    sessionIndex: 3,
    level: "intermediate",
    prerequisites: ["m1-s3-error-handling-io", "m5-s1-sql-database-design"],
    corequisites: [],
    whyItMatters: "When no clean dataset exists, AI engineers build crawlers and API consumers to acquire raw text, images, or pricing streams for training.",
    learningObjectives: [
      "Extract structured data from HTML DOM trees using BeautifulSoup and CSS selectors",
      "Construct regular expressions (RegEx) to parse unstructured textual patterns",
      "Automate dynamic JavaScript-rendered single-page apps using Selenium / Playwright",
      "Consume REST APIs with authentication headers, pagination handling, and rate limiting",
      "Understand Data Warehousing fundamentals (OLTP vs OLAP, Columnar storage)"
    ],
    skills: ["BeautifulSoup", "Regular Expressions", "Selenium", "API Ingestion", "OLAP Data Warehouses"],
    mustWriteNotes: [
      "OLTP (row-oriented, high write concurrency, normalized) vs OLAP (column-oriented, fast analytical aggregations, denormalized).",
      "Robots.txt compliance, rate-limiting, and ethical web scraping boundaries.",
      "Regular expression anchors: '^' (start of string), '$' (end of string), '\\d+' (one or more digits)."
    ],
    recommendedNotes: [
      "Explicit vs Implicit waits in Selenium for asynchronous JavaScript elements.",
      "Handling API token rotation and exponential backoff retry algorithms."
    ],
    optionalNotes: [
      "Headless browser fingerprinting evasion techniques."
    ],
    englishKeywords: ["web scraping", "CSS selector", "rate limit", "OLTP", "OLAP", "columnar storage"],
    sources: [
      { title: "Original AI Curriculum Module 5.3", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 22
  },
  {
    id: "m5-s4-etl-elt-data-engineering",
    slug: "etl-elt-pipelines-and-capstone",
    title: "ETL / ELT Pipelines, Data Lakes & Big Data Architecture (Airflow, Spark, dbt)",
    stage: "data_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 5,
    sessionIndex: 4,
    level: "advanced",
    prerequisites: ["m5-s3-web-scraping-data-acquisition", "m5-s2-advanced-sql"],
    corequisites: [],
    whyItMatters: "Modern enterprise AI models (Navisoft/Nuwave) consume data orchestrated by automated DAGs (Airflow), transformed by dbt, and processed at terabyte scale with Apache Spark.",
    learningObjectives: [
      "Design end-to-end ETL / ELT pipeline architectures: Scrape -> Validate -> Store -> Transform -> Query",
      "Implement workflow DAGs in Apache Airflow with retries, alerts, and dependency scheduling",
      "Understand distributed data computing with Apache Spark (RDDs, DataFrames, Partitioning, Shuffling)",
      "Compare Data Lake vs Data Lakehouse architectures (Parquet, Delta Lake, Snowflake, Databricks)"
    ],
    skills: ["ETL / ELT", "Apache Airflow", "Apache Spark", "Data Lakehouse", "dbt"],
    mustWriteNotes: [
      "ETL (transform before loading, schema-on-write) vs ELT (load raw data into Lakehouse then transform with dbt, schema-on-read).",
      "Airflow DAG idempotency: running the same pipeline task twice on the same partition MUST produce the identical state.",
      "Spark Shuffling: network data transfer across cluster worker nodes caused by wide transformations (groupBy, join)."
    ],
    recommendedNotes: [
      "Parquet columnar format: dictionary encoding and column projection optimizations.",
      "Talend & Hadoop ecosystem awareness (HDFS, MapReduce, YARN)."
    ],
    optionalNotes: [
      "Streaming ingestion pipelines with Apache Kafka and Spark Structured Streaming."
    ],
    englishKeywords: ["ETL", "ELT", "DAG", "idempotency", "data lakehouse", "spark partition", "shuffle"],
    sources: [
      { title: "Original AI Curriculum Module 5.4", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly with modern Big Data additions." },
      { title: "Harvard CSCI E-29 / Extension Data Engineering", url: "https://extension.harvard.edu/", verificationStatus: "confirmed_current", note: "Harvard Extension Graduate Data Engineering track." }
    ],
    orderIndex: 23
  },

  // ==========================================
  // MODULE 6: Machine Learning (12 Sessions)
  // ==========================================
  {
    id: "m6-s1-ml-fundamentals-preprocessing",
    slug: "ml-fundamentals-preprocessing",
    title: "ML Foundations, Preprocessing & Feature Engineering",
    stage: "machine_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 6,
    sessionIndex: 1,
    level: "intermediate",
    prerequisites: ["m3-s3-pandas-data-wrangling", "m2-s3-calculus-optimization"],
    corequisites: [],
    whyItMatters: "Algorithms are only as good as the features fed into them. Improper scaling or handling of imbalanced datasets causes total model failure in production.",
    learningObjectives: [
      "Classify Supervised, Unsupervised, Semi-Supervised, and Reinforcement Learning paradigms",
      "Build Scikit-Learn Pipelines with ColumnTransformers",
      "Apply Scaling (StandardScaler, MinMaxScaler, RobustScaler) and Encoding (One-Hot, Target, Ordinal)",
      "Resolve Imbalanced Datasets with SMOTE, class-weight balancing, and stratified sampling"
    ],
    skills: ["Scikit-Learn", "Feature Scaling", "One-Hot Encoding", "SMOTE", "Imbalanced Data"],
    mustWriteNotes: [
      "Fit on Training Data ONLY; Transform on Validation and Test data (fit_transform on train, transform on test).",
      "StandardScaler: z = (x - mu) / sigma; sensitive to outliers. RobustScaler uses Median and IQR.",
      "Why SMOTE should NEVER be applied to the validation/test folds."
    ],
    recommendedNotes: [
      "Curse of dimensionality: exponential volume growth in high-dimensional feature spaces.",
      "Feature selection methods (VarianceThreshold, SelectKBest, Mutual Information)."
    ],
    optionalNotes: [
      "Custom Scikit-Learn BaseEstimator and TransformerMixin subclassing."
    ],
    englishKeywords: ["supervised learning", "unsupervised learning", "data leakage", "standardization", "SMOTE", "class imbalance"],
    sources: [
      { title: "Original AI Curriculum Module 6.1", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard CS1810 / CS181 Machine Learning", url: "https://csadvising.seas.harvard.edu/concentration/requirements/", verificationStatus: "confirmed_current", note: "Harvard College Machine Learning concentration requirement." }
    ],
    orderIndex: 24
  },
  {
    id: "m6-s2-regression-models",
    slug: "regression-models-and-evaluation",
    title: "Regression Models: Simple, Multiple, Regularization (Ridge/Lasso) & Metrics",
    stage: "machine_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 6,
    sessionIndex: 2,
    level: "intermediate",
    prerequisites: ["m6-s1-ml-fundamentals-preprocessing"],
    corequisites: [],
    whyItMatters: "Regression predicts continuous values (pricing, demand, latency). Understanding regularization (L1/L2) prevents severe overfitting in multi-variable settings.",
    learningObjectives: [
      "Derive and train Simple and Multiple Linear Regression models (Ordinary Least Squares: OLS)",
      "Formulate Ridge Regression (L2 regularization) and Lasso Regression (L1 feature selection)",
      "Evaluate models with MSE, RMSE, MAE, R-Squared, and Adjusted R-Squared",
      "Verify OLS assumptions: Linearity, Homoscedasticity, Normality of residuals, No multicollinearity (VIF)"
    ],
    skills: ["Linear Regression", "Ridge & Lasso", "MSE & RMSE", "R-Squared", "Residual Analysis"],
    mustWriteNotes: [
      "OLS analytical closed-form Normal Equation: theta = (X^T * X)^(-1) * X^T * y.",
      "Lasso (L1) creates exact zero weights for non-informative features; Ridge (L2) shrinks weights asymptotically towards zero.",
      "R^2 formula: 1 - (SS_res / SS_tot). Adjusted R^2 penalizes adding useless predictor variables."
    ],
    recommendedNotes: [
      "Homoscedasticity: constant variance of errors across all predicted values.",
      "Variance Inflation Factor (VIF > 5 or 10 indicates severe multicollinearity)."
    ],
    optionalNotes: [
      "ElasticNet combining L1 and L2 penalties."
    ],
    englishKeywords: ["ordinary least squares", "regularization", "ridge regression", "lasso regression", "homoscedasticity", "adjusted R-squared"],
    sources: [
      { title: "Original AI Curriculum Module 6.2", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 25
  },
  {
    id: "m6-s3-classification-models",
    slug: "classification-models-and-metrics",
    title: "Classification Models: Logistic Regression, Trees, SVM, KNN & Evaluation Metrics",
    stage: "machine_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 6,
    sessionIndex: 3,
    level: "intermediate",
    prerequisites: ["m6-s2-regression-models"],
    corequisites: [],
    whyItMatters: "Classification powers medical diagnosis, fraud detection, and spam filtering. High accuracy is meaningless if false negatives destroy mission-critical trust.",
    learningObjectives: [
      "Derive Logistic Regression using the Sigmoid activation and Log-Loss (Binary Cross-Entropy)",
      "Train Decision Trees using Gini Impurity and Entropy/Information Gain",
      "Formulate Support Vector Machines (SVM) with hard/soft margins and Kernel Trick (RBF)",
      "Train K-Nearest Neighbors (KNN) and Naive Bayes classifiers",
      "Evaluate classifiers using Precision, Recall, F1-Score, Confusion Matrix, and ROC-AUC curves"
    ],
    skills: ["Logistic Regression", "Decision Trees", "SVM", "Precision & Recall", "ROC-AUC"],
    mustWriteNotes: [
      "Sigmoid function: sigma(z) = 1 / (1 + e^(-z)), mapping real values to [0, 1] probability.",
      "Precision = TP / (TP + FP) [cost of false alarms]; Recall = TP / (TP + FN) [cost of missing a case].",
      "ROC-AUC evaluates True Positive Rate vs False Positive Rate across all decision thresholds."
    ],
    recommendedNotes: [
      "Decision tree pruning techniques (max_depth, min_samples_split, ccp_alpha) to stop overfitting.",
      "SVM Kernel trick: projecting non-linearly separable points into higher dimension without computing coordinates explicitly."
    ],
    optionalNotes: [
      "Multi-class strategies: One-vs-Rest (OvR) vs One-vs-One (OvO)."
    ],
    englishKeywords: ["logistic regression", "precision", "recall", "F1-score", "ROC-AUC", "confusion matrix", "Gini impurity"],
    sources: [
      { title: "Original AI Curriculum Module 6.3", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 26
  },
  {
    id: "m6-s4-ensemble-methods",
    slug: "ensemble-methods-random-forest-xgboost",
    title: "Ensemble Methods: Random Forest, Boosting (XGBoost, CatBoost, LightGBM) & Stacking",
    stage: "machine_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 6,
    sessionIndex: 4,
    level: "advanced",
    prerequisites: ["m6-s3-classification-models"],
    corequisites: [],
    whyItMatters: "Gradient Boosted Trees (XGBoost/CatBoost) dominate tabular competitions and enterprise production pipelines due to superior accuracy and categorical handling.",
    learningObjectives: [
      "Distinguish Bagging (Bootstrap Aggregating) from Boosting (Sequential Residual Fitting)",
      "Train Random Forest ensembles with feature subsampling and Out-Of-Bag (OOB) scoring",
      "Implement Gradient Boosting, XGBoost, CatBoost, and LightGBM",
      "Build multi-layer Stacking Classifiers with meta-learners",
      "Tune hyperparameters via K-Fold Cross-Validation, GridSearch, and Bayesian Optimization (Optuna)"
    ],
    skills: ["Ensemble Methods", "Random Forest", "XGBoost", "CatBoost", "Cross-Validation", "Optuna"],
    mustWriteNotes: [
      "Bagging (Random Forest) reduces VARIANCE by averaging de-correlated trees; Boosting reduces BIAS by training trees on previous residuals.",
      "XGBoost incorporates second-order Taylor expansion gradients and tree pruning regularization.",
      "K-Fold Cross-Validation: Split data into K folds; train on K-1, evaluate on 1; repeat K times to prevent validation variance."
    ],
    recommendedNotes: [
      "CatBoost native categorical feature handling and ordered boosting to prevent target leakage.",
      "Early stopping on validation loss in GBDTs."
    ],
    optionalNotes: [
      "SHAP (SHapley Additive exPlanations) for tree explainability."
    ],
    englishKeywords: ["bagging", "boosting", "random forest", "XGBoost", "CatBoost", "cross-validation", "hyperparameter tuning"],
    sources: [
      { title: "Original AI Curriculum Module 6.4", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 27
  },
  {
    id: "m6-s5-unsupervised-learning",
    slug: "unsupervised-learning-clustering-pca",
    title: "Unsupervised Learning: K-Means, DBSCAN, Hierarchical Clustering, PCA & Recommendations",
    stage: "machine_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 6,
    sessionIndex: 5,
    level: "advanced",
    prerequisites: ["m6-s4-ensemble-methods"],
    corequisites: [],
    whyItMatters: "Most real-world data has no labels. Clustering segments customers, PCA compresses features for embedding search, and recommender engines drive commercial platforms.",
    learningObjectives: [
      "Implement K-Means clustering and evaluate with Elbow Method and Silhouette Analysis",
      "Apply DBSCAN for density-based clustering and arbitrary shape/noise detection",
      "Construct Agglomerative Hierarchical Clustering with Dendrograms",
      "Perform Principal Component Analysis (PCA) to compress dimensions while retaining variance",
      "Build Collaborative Filtering and Content-Based Recommendation Systems (Apriori algorithm)"
    ],
    skills: ["K-Means", "DBSCAN", "PCA", "Hierarchical Clustering", "Recommendation Systems"],
    mustWriteNotes: [
      "K-Means minimizes within-cluster sum of squares (inertia); assumes spherical clusters of equal size.",
      "DBSCAN parameters: eps (distance radius) and min_samples (core point threshold); separates core, border, and noise.",
      "PCA projects data onto orthogonal eigenvectors of the covariance matrix corresponding to largest eigenvalues."
    ],
    recommendedNotes: [
      "Silhouette Score range [-1.0, 1.0]: values close to +1 indicate well-separated clusters.",
      "Apriori Association Rules: Support, Confidence, and Lift metrics."
    ],
    optionalNotes: [
      "t-SNE and UMAP for non-linear high-dimensional manifold visualization."
    ],
    englishKeywords: ["unsupervised learning", "clustering", "DBSCAN", "principal component analysis", "silhouette score", "recommendation engine"],
    sources: [
      { title: "Original AI Curriculum Module 6.5", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 28
  },
  {
    id: "m6-s6-ml-capstone",
    slug: "ml-capstone-model-card-deployment",
    title: "ML Capstone: End-to-End System, Model Card & Rigorous Evaluation",
    stage: "machine_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 6,
    sessionIndex: 6,
    level: "advanced",
    prerequisites: ["m6-s5-unsupervised-learning"],
    corequisites: [],
    whyItMatters: "Prepares the student to deliver production ML systems complete with baseline benchmarks, error slicing, model cards, and defensible business trade-offs.",
    learningObjectives: [
      "Formulate business problem into a valid machine learning setup",
      "Establish simple heuristic baselines before building complex models",
      "Execute hyperparameter search and validate on holdout test set",
      "Author an official Google/Hugging Face standard Model Card documenting data provenance, evaluation, limitations, and ethical considerations",
      "Deliver a technical oral presentation"
    ],
    skills: ["ML Capstone", "Model Cards", "Failure Analysis", "Baseline Benchmarking", "Technical Defense"],
    mustWriteNotes: [
      "Model Card essential sections: Intended Use, Training Data, Performance Metrics, Subgroup Failure Analysis, Caveats & Limitations.",
      "Never claim 100% accuracy; always report confidence intervals and failure edge cases."
    ],
    recommendedNotes: [
      "Data drift monitoring strategies post-deployment."
    ],
    optionalNotes: [
      "Fairness metrics (Demographic Parity, Equalized Odds)."
    ],
    englishKeywords: ["model card", "baseline", "failure analysis", "provenance", "subgroup performance"],
    sources: [
      { title: "Original AI Curriculum Module 6.6", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 29
  },

  // ==========================================
  // MODULE 7: Deep Learning (Parts 1 & 2 - 16 Sessions)
  // ==========================================
  {
    id: "m7-s1-neural-networks-foundations",
    slug: "neural-networks-foundations-backprop",
    title: "Neural Networks Foundations: Perceptrons, Backpropagation & Optimizers",
    stage: "deep_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 7,
    sessionIndex: 1,
    level: "intermediate",
    prerequisites: ["m6-s3-classification-models", "m2-s3-calculus-optimization"],
    corequisites: [],
    whyItMatters: "Neural networks approximate any continuous function. Deep comprehension of gradient flow, vanishing gradients, and optimizer momentum is essential to debug failing training runs.",
    learningObjectives: [
      "Construct Artificial Neural Network (ANN) architectures from scratch",
      "Derive Forward Propagation and Backward Propagation (Chain Rule gradient flow)",
      "Evaluate Activation Functions: Sigmoid, Tanh, ReLU, LeakyReLU, GeLU, Softmax",
      "Analyze Loss Functions: MSE, Binary Cross-Entropy, Categorical Cross-Entropy",
      "Compare Optimizers: SGD, SGD with Momentum, RMSprop, Adam, AdamW",
      "Mitigate Overfitting using Dropout, L2 Weight Decay, and Early Stopping"
    ],
    skills: ["Neural Networks", "Backpropagation", "ReLU & Softmax", "Adam Optimizer", "Dropout & Regularization"],
    mustWriteNotes: [
      "Vanishing Gradient Problem: Sigmoid derivative max is 0.25; in deep networks, gradients multiply to zero. ReLU solves this with constant gradient 1 for x > 0.",
      "Softmax function converts unnormalized logits into a valid probability distribution summing to 1.0.",
      "Adam optimizer combines Momentum (1st moment of gradients) + RMSprop (2nd moment of squared gradients) with bias correction."
    ],
    recommendedNotes: [
      "Weight initialization schemes: He/Kaiming initialization (for ReLU) vs Xavier/Glorot (for Sigmoid/Tanh).",
      "Dying ReLU problem and LeakyReLU / GeLU alternatives."
    ],
    optionalNotes: [
      "Loss surface visualization and sharp vs flat minima generalization."
    ],
    englishKeywords: ["artificial neural network", "backpropagation", "activation function", "Adam optimizer", "vanishing gradient", "weight decay"],
    sources: [
      { title: "Original AI Curriculum Module 7.1", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard CSCI E-89 Deep Learning", url: "https://extension.harvard.edu/", verificationStatus: "confirmed_current", note: "Harvard Extension Graduate Deep Learning course." }
    ],
    orderIndex: 30
  },
  {
    id: "m7-s2-building-anns-tensorflow-pytorch",
    slug: "building-anns-tensorflow-pytorch",
    title: "Building Deep ANNs with TensorFlow/Keras & PyTorch",
    stage: "deep_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 7,
    sessionIndex: 2,
    level: "intermediate",
    prerequisites: ["m7-s1-neural-networks-foundations"],
    corequisites: [],
    whyItMatters: "Hands-on model building in industry standard frameworks. Translates theory into modular code with Batch Normalization and custom training loops.",
    learningObjectives: [
      "Implement Batch Normalization to stabilize internal covariate shift",
      "Apply Learning Rate Schedulers (Cosine Annealing, Warmup, ReduceLROnPlateau)",
      "Build and train end-to-end multi-layer ANNs on complex tabular datasets",
      "Construct custom PyTorch training loops (loss.backward(), optimizer.step(), optimizer.zero_grad())",
      "Instrument training with TensorBoard and Weights & Biases experiment tracking"
    ],
    skills: ["TensorFlow/Keras", "PyTorch", "Batch Normalization", "LR Scheduling", "Experiment Tracking"],
    mustWriteNotes: [
      "Batch Normalization: Normalizes activations across the mini-batch, scaling with learnable gamma and beta parameters.",
      "PyTorch training invariant: Always call 'optimizer.zero_grad()' before 'loss.backward()' because PyTorch accumulates gradients by default.",
      "'model.eval()' disables Dropout and switches BatchNorm to running population statistics."
    ],
    recommendedNotes: [
      "Mixed precision training (FP16 / BF16) with PyTorch torch.cuda.amp for 2x memory reduction.",
      "Keras Functional API vs Sequential API."
    ],
    optionalNotes: [
      "Distributed Data Parallel (DDP) multi-GPU training mechanics."
    ],
    englishKeywords: ["batch normalization", "learning rate scheduler", "gradient accumulation", "experiment tracking", "mixed precision"],
    sources: [
      { title: "Original AI Curriculum Module 7.2", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 31
  },
  {
    id: "m7-s3-computer-vision-cnn-yolo",
    slug: "computer-vision-cnn-transfer-learning-yolo",
    title: "Computer Vision: CNNs, Transfer Learning (ResNet), Object Detection (YOLO) & OpenCV",
    stage: "deep_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 7,
    sessionIndex: 3,
    level: "advanced",
    prerequisites: ["m7-s2-building-anns-tensorflow-pytorch"],
    corequisites: [],
    whyItMatters: "Powers medical imaging (tumor detection, skin lesions), autonomous vehicles, robotics, and automated document analysis.",
    learningObjectives: [
      "Master Convolutional Neural Networks (CNN): Kernels, Strides, Padding (Valid/Same), and Pooling (Max/Avg)",
      "Apply Transfer Learning with deep backbones: VGG, ResNet (Skip Connections), EfficientNet",
      "Implement Object Detection with YOLOv8/YOLOv9: Bounding boxes, Anchor boxes, IoU, and Non-Maximum Suppression (NMS)",
      "Process images using OpenCV: Color spaces, Filtering, Edge detection, Contours, and Augmentations",
      "Understand Image Segmentation (U-Net, Mask R-CNN) and Pose Estimation"
    ],
    skills: ["CNNs", "Transfer Learning", "ResNet", "YOLOv8", "OpenCV", "Image Segmentation"],
    mustWriteNotes: [
      "Convolution output size formula: O = ((W - K + 2P) / S) + 1.",
      "ResNet Residual Skip Connections solve the degradation problem: F(x) + x allows gradients to flow directly back.",
      "Non-Maximum Suppression (NMS) discards overlapping bounding boxes with IoU > threshold to keep single highest-confidence box."
    ],
    recommendedNotes: [
      "Intersection over Union (IoU) = Area of Overlap / Area of Union.",
      "Data Augmentation (Albumentations, RandAugment) to prevent visual overfitting."
    ],
    optionalNotes: [
      "Vision Transformers (ViT) and Patch Embeddings."
    ],
    englishKeywords: ["convolutional neural network", "transfer learning", "residual connection", "object detection", "YOLO", "IoU", "non-maximum suppression"],
    sources: [
      { title: "Original AI Curriculum Module 7.3", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard CSCI E-104 Advanced Deep Learning", url: "https://extension.harvard.edu/", verificationStatus: "confirmed_current", note: "Harvard Extension Graduate Vision & DL offering." }
    ],
    orderIndex: 32
  },
  {
    id: "m7-s4-sequence-models-time-series",
    slug: "sequence-models-rnn-lstm-gru-time-series",
    title: "Sequence Models & Time Series: RNNs, LSTMs, GRUs & Forecasting",
    stage: "deep_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 7,
    sessionIndex: 4,
    level: "advanced",
    prerequisites: ["m7-s2-building-anns-tensorflow-pytorch"],
    corequisites: [],
    whyItMatters: "Sequential data (financial stock streams, audio, IoT sensor telemetry) requires recurrent memory cells capable of capturing temporal dependencies.",
    learningObjectives: [
      "Analyze Recurrent Neural Networks (RNN) and Backpropagation Through Time (BPTT)",
      "Derive Long Short-Term Memory (LSTM) cell gates: Forget Gate, Input Gate, Candidate Cell, Output Gate",
      "Implement Gated Recurrent Units (GRU) with Reset and Update gates",
      "Build Time Series Forecasting pipelines with LSTM on real-world datasets",
      "Evaluate sequential forecasts with MAPE, MASE, and Directional Accuracy"
    ],
    skills: ["RNN", "LSTM", "GRU", "Time Series Forecasting", "Sequential Models"],
    mustWriteNotes: [
      "LSTM Forget Gate formula: f_t = sigma(W_f * [h_(t-1), x_t] + b_f), deciding what percentage of cell state to discard.",
      "The Cell State C_t acts as an uninterrupted conveyor belt allowing gradients to flow across hundreds of timesteps.",
      "Time Series split rule: NEVER shuffle; always split chronologically to prevent temporal data leakage."
    ],
    recommendedNotes: [
      "Bidirectional LSTMs and when future context is accessible (NLP) vs inaccessible (real-time forecasting).",
      "Stationarity testing (Augmented Dickey-Fuller test) before sequence modeling."
    ],
    optionalNotes: [
      "Temporal Convolutional Networks (TCN) with causal dilated convolutions."
    ],
    englishKeywords: ["recurrent neural network", "LSTM", "forget gate", "cell state", "time series forecasting", "data leakage"],
    sources: [
      { title: "Original AI Curriculum Module 7.4", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 33
  },
  {
    id: "m7-s5-nlp-fundamentals",
    slug: "nlp-fundamentals-tokenization-embeddings",
    title: "NLP Fundamentals: Text Processing, Embeddings (Word2Vec) & Seq2Seq",
    stage: "deep_learning",
    sourceCategory: "original_curriculum",
    moduleNumber: 7,
    sessionIndex: 5,
    level: "advanced",
    prerequisites: ["m7-s4-sequence-models-time-series"],
    corequisites: [],
    whyItMatters: "Bridges the gap between raw natural language text and dense mathematical vector spaces required by modern language models.",
    learningObjectives: [
      "Implement Text Preprocessing: Tokenization, Stop Words, Stemming (Porter), Lemmatization (WordNet)",
      "Construct Bag-of-Words, N-Grams, and TF-IDF (Term Frequency - Inverse Document Frequency) matrices",
      "Train Dense Word Embeddings using Word2Vec (Skip-Gram, CBOW) and GloVe",
      "Build Sequence-to-Sequence (Seq2Seq) Encoder-Decoder models with Attention mechanisms for Machine Translation and Summarization"
    ],
    skills: ["NLP Preprocessing", "TF-IDF", "Word2Vec", "Dense Embeddings", "Seq2Seq"],
    mustWriteNotes: [
      "TF-IDF formula: TF(t, d) * log(N / DF(t)); gives high weight to words common in document but rare across corpus.",
      "Word2Vec geometric property: vec('King') - vec('Man') + vec('Woman') approx vec('Queen').",
      "Bahdanau additive attention solves the Seq2Seq bottleneck by letting the decoder dynamically attend to all encoder hidden states."
    ],
    recommendedNotes: [
      "Cosine Similarity formula: cos(theta) = (A . B) / (||A|| * ||B||).",
      "Subword tokenization (BPE, WordPiece, SentencePiece)."
    ],
    optionalNotes: [
      "FastText n-gram character embeddings for out-of-vocabulary word handling."
    ],
    englishKeywords: ["tokenization", "TF-IDF", "word embedding", "cosine similarity", "encoder-decoder", "attention mechanism"],
    sources: [
      { title: "Original AI Curriculum Module 7.5", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard CS1870 Computational Linguistics & NLP", url: "https://csadvising.seas.harvard.edu/", verificationStatus: "confirmed_current", note: "Harvard College Computational Linguistics curriculum." }
    ],
    orderIndex: 34
  },
  {
    id: "m7-s6-transformers-llms-rag-agents",
    slug: "transformers-llms-rag-agents",
    title: "Modern AI: Transformers, LLMs, LoRA Fine-Tuning, RAG & Autonomous Agents",
    stage: "modern_ai",
    sourceCategory: "original_curriculum",
    moduleNumber: 7,
    sessionIndex: 6,
    level: "graduate",
    prerequisites: ["m7-s5-nlp-fundamentals"],
    corequisites: [],
    whyItMatters: "The frontier of AI Engineering. Powers ChatGPT, enterprise search systems (RAG), and multi-agent autonomous software workflows (Navisoft / Nuwave).",
    learningObjectives: [
      "Master Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V",
      "Analyze Transformer Architecture: Multi-Head Attention, Positional Encodings, Feed-Forward, LayerNorm",
      "Compare Foundation Architectures: Encoder-only (BERT), Decoder-only (GPT, LLaMA), Encoder-Decoder (T5)",
      "Execute Parameter-Efficient Fine-Tuning (PEFT): Low-Rank Adaptation (LoRA) and QLoRA 4-bit Quantization",
      "Build Retrieval-Augmented Generation (RAG) with Vector Databases (Pinecone, Chroma), Semantic Chunking, and Reranking",
      "Design Autonomous Tool-Calling Agents and Multi-Agent Orchestration (LangGraph)"
    ],
    skills: ["Transformers", "LLMs", "LoRA & QLoRA", "Hugging Face", "RAG Systems", "AI Agents", "LangGraph"],
    mustWriteNotes: [
      "Attention formula: Q (Query: what I seek), K (Key: what I contain), V (Value: what I output); sqrt(d_k) prevents vanishing gradients in softmax.",
      "LoRA principle: Freezes pre-trained weights W0 and decomposes weight updates into two low-rank matrices Delta W = B * A (rank r << d), reducing trainable params by 99%.",
      "RAG Triad metrics: Context Relevance, Groundedness (Faithfulness), and Answer Relevance to eliminate hallucinations."
    ],
    recommendedNotes: [
      "Rotary Positional Embeddings (RoPE) and FlashAttention memory I/O optimization.",
      "Agent loops: Thought -> Action -> Observation -> Final Answer."
    ],
    optionalNotes: [
      "GraphRAG: extracting knowledge graphs with entity-relationship triplets for global summarization."
    ],
    englishKeywords: ["transformer", "self-attention", "fine-tuning", "LoRA", "retrieval-augmented generation", "vector database", "agentic workflow"],
    sources: [
      { title: "Original AI Curriculum Module 7.6", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard CSCI E-222 Foundations of Large Language Models", url: "https://extension.harvard.edu/", verificationStatus: "confirmed_current", note: "Harvard Extension Graduate LLM curriculum." }
    ],
    orderIndex: 35
  },

  // ==========================================
  // MODULE 8: Development & MLOps (2 Sessions)
  // ==========================================
  {
    id: "m8-s1-fastapi-streamlit-docker",
    slug: "fastapi-streamlit-docker-mlops",
    title: "Model Deployment & Packaging (FastAPI, Streamlit, Docker Containers)",
    stage: "ai_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 8,
    sessionIndex: 1,
    level: "advanced",
    prerequisites: ["m7-s6-transformers-llms-rag-agents", "m5-s1-sql-database-design"],
    corequisites: [],
    whyItMatters: "An ML model that only lives in a Jupyter notebook has zero business value. Production engineers package models into containerized REST APIs with documented schemas and interactive UIs.",
    learningObjectives: [
      "Design high-performance asynchronous REST APIs using FastAPI with Pydantic request/response validation",
      "Auto-generate OpenAPI / Swagger documentation and implement API security/token authentication",
      "Build interactive ML demonstration web apps using Streamlit",
      "Write multi-stage Dockerfiles, build lightweight container images, and test container runtime isolation",
      "Orchestrate multi-container applications (FastAPI + PostgreSQL + Redis) using Docker Compose"
    ],
    skills: ["FastAPI", "Pydantic", "Streamlit", "Docker", "Docker Compose", "REST API Design"],
    mustWriteNotes: [
      "FastAPI uses Pydantic models for automatic JSON serialization, schema validation, and 422 Unprocessable Entity error generation.",
      "Multi-stage Dockerfile advantage: separates build dependencies from final runtime image, shrinking image size from 2GB to 150MB.",
      "Docker port mapping syntax: '-p 8000:8000' (host_port:container_port)."
    ],
    recommendedNotes: [
      "Asynchronous endpoints (async def) for non-blocking I/O operations.",
      "Healthcheck endpoints (/healthz) for container orchestrator readiness probes."
    ],
    optionalNotes: [
      "Triton Inference Server / ONNX Runtime optimizations."
    ],
    englishKeywords: ["FastAPI", "Pydantic", "containerization", "multi-stage build", "Docker Compose", "healthcheck"],
    sources: [
      { title: "Original AI Curriculum Module 8.1", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." },
      { title: "Harvard APCOMP 215 / CSCI E-29 Scalable AI Systems", url: "https://extension.harvard.edu/", verificationStatus: "confirmed_current", note: "Harvard Graduate Applied Computation systems curriculum." }
    ],
    orderIndex: 36
  },
  {
    id: "m8-s2-cicd-production-mlops-capstone",
    slug: "cicd-production-mlops-capstone",
    title: "Production MLOps: CI/CD, Model Monitoring, Drift Detection & Final Capstone",
    stage: "ai_systems",
    sourceCategory: "original_curriculum",
    moduleNumber: 8,
    sessionIndex: 2,
    level: "graduate",
    prerequisites: ["m8-s1-fastapi-streamlit-docker"],
    corequisites: [],
    whyItMatters: "Completes the AI Engineer journey. Automates continuous integration, automated testing, cloud deployment, and real-time monitoring of data and concept drift.",
    learningObjectives: [
      "Construct automated CI/CD pipelines in GitHub Actions (linting, pytest, container build, automated deployment)",
      "Implement Experiment Tracking and Model Registry using MLflow",
      "Monitor deployed models for Data Drift (KS-test) and Concept Drift in production",
      "Execute safe deployment strategies: Blue-Green Deployments, Canary releases, and Automated Rollbacks",
      "Deliver the Final Flagship AI Capstone presentation and portfolio case study"
    ],
    skills: ["MLOps Lifecycle", "GitHub Actions CI/CD", "MLflow", "Drift Monitoring", "Canary Deployment", "Final Capstone"],
    mustWriteNotes: [
      "The Production ML Lifecycle: Data -> Validation -> Training -> Registry -> Packaging -> Deployment -> Observability -> Retraining.",
      "Data Drift (P(X) changes while P(Y|X) remains constant) vs Concept Drift (the relationship between input X and target Y changes).",
      "Canary deployment: Route 5% of production traffic to new model; monitor error rate and latency before full rollout."
    ],
    recommendedNotes: [
      "Evidently AI / Prometheus metrics collection for inference latency and drift.",
      "Automated fallback to heuristic/previous model on healthcheck failure."
    ],
    optionalNotes: [
      "Kubernetes (K8s) KServe / Seldon Core deployment."
    ],
    englishKeywords: ["MLOps", "CI/CD", "data drift", "concept drift", "canary release", "model registry", "observability"],
    sources: [
      { title: "Original AI Curriculum Module 8.2", url: "#", verificationStatus: "confirmed_current", note: "Preserved exactly." }
    ],
    orderIndex: 37
  }
];
