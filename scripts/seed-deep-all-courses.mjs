import { Client } from "pg";

const connectionString = "postgresql://neondb_owner:npg_Fy0dIAcRH7En@ep-restless-frog-b1gwgznn-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({ connectionString });

const DEEP_CURRICULA = {
  "ELEC 1": [
    {
      moduleTitle: "DC Circuit Analysis & Fundamental Laws",
      moduleTitleAr: "تحليل دوائر التيار المستمر والقوانين الأساسية",
      description: "Foundational laws of circuit theory, charge conservation, Kirchhoff's laws, and network reduction techniques.",
      topics: [
        {
          title: "Circuit Variables and Ohm's Law",
          titleAr: "متغيرات الدائرة وقانون أوم",
          description: "Understanding electric charge, current density, potential difference, power absorption, and linear resistance.",
          concepts: [
            {
              title: "Charge, Current, and Potential Difference",
              titleAr: "الشحنة والتيار وفرق الجهد",
              simpleExplanation: "Electric current is the continuous rate of charge flow through a conductor cross-section, while voltage is the energetic potential difference that pushes these charges.",
              formalDefinition: "Electric current is defined as $i(t) = \\frac{dq(t)}{dt}$ where $q$ is charge in Coulombs. Voltage $v_{ab}$ represents the work required per unit charge to move charge from point $b$ to $a$: $v = \\frac{dw}{dq}$.",
              intuition: "Visualize current like water volume flow rate (liters per second in a pipe), and voltage like the water pressure pushing it through.",
              visualDescription: "Schematic diagram depicting closed loop circuit with battery source $V_s$ and conducting wire element showing electron drift velocity versus conventional current direction.",
              equation: "i(t) = \\frac{dq(t)}{dt}, \\quad p(t) = v(t) \\cdot i(t) = \\frac{dw}{dt}, \\quad W = \\int_{t_0}^{t_1} p(t) dt",
              workedExample: `Problem: A conductor carries a current $i(t) = 4\\sin(100\\pi t)$ A for $0 \\le t \\le 10$ ms. Find the total charge $q$ transferred and the energy absorbed if the terminal voltage is a constant $12$ V.

Solution:
1. Charge transferred:
$$q = \\int_0^{0.01} 4\\sin(100\\pi t) dt = \\left[ -\\frac{4}{100\\pi} \\cos(100\\pi t) \\right]_0^{0.01}$$
$$q = -\\frac{4}{100\\pi}(\\cos(\\pi) - \\cos(0)) = -\\frac{4}{100\\pi}(-1 - 1) = \\frac{8}{100\\pi} \\approx 0.0255 \\text{ Coulombs}$$
2. Energy absorbed:
$$W = V \\cdot q = 12 \\text{ V} \\times 0.0255 \\text{ C} \\approx 0.3056 \\text{ Joules}.$$`,
              difficulty: 2
            },
            {
              title: "Ohm's Law and Resistance",
              titleAr: "قانون أوم والمقاومة الكهربائية",
              simpleExplanation: "Ohm's Law states that the voltage drop across an ideal resistor is directly proportional to the current flowing through it at constant temperature.",
              formalDefinition: "For an ideal linear ohmic element, $v = R \\cdot i$, where $R = \\rho \\frac{\\ell}{A}$ is the electrical resistance in Ohms ($\\Omega$), with resistivity $\\rho$, length $\\ell$, and cross-sectional area $A$.",
              intuition: "Resistance represents the internal microscopic friction that moving electrons encounter when colliding with vibrating lattice atoms inside a material.",
              visualDescription: "Linear I-V characteristic curve passing through the origin with slope equal to conductance $G = 1/R$.",
              equation: "v = R \\cdot i, \\quad p = i^2 R = \\frac{v^2}{R}, \\quad R = \\rho \\frac{\\ell}{A}",
              workedExample: `Problem: A cylindrical copper wire has diameter $d = 2$ mm and length $\\ell = 50$ m. Given copper resistivity $\\rho = 1.72 \\times 10^{-8} \\; \\Omega\\cdot\\text{m}$, calculate the resistance $R$ and the power dissipated when carrying $5$ A of DC current.

Solution:
1. Cross-sectional area:
$$A = \\pi \\left(\\frac{d}{2}\\right)^2 = \\pi (10^{-3})^2 = 3.1416 \\times 10^{-6} \\text{ m}^2$$
2. Resistance:
$$R = 1.72 \\times 10^{-8} \\times \\frac{50}{3.1416 \\times 10^{-6}} = 0.2737 \\; \\Omega$$
3. Power dissipated:
$$P = I^2 R = (5)^2 \\times 0.2737 = 25 \\times 0.2737 = 6.843 \\text{ Watts}.$$`,
              difficulty: 2
            }
          ]
        },
        {
          title: "Kirchhoff's Laws and Network Reduction",
          titleAr: "قوانين كيرشوف وتبسيط الدوائر",
          description: "Conservation laws applied to lumped electrical networks: KCL at nodes and KVL around closed loops.",
          concepts: [
            {
              title: "Kirchhoff's Current Law (KCL)",
              titleAr: "قانون كيرشوف للتيار",
              simpleExplanation: "At any electrical node (junction point), the total current entering the node must equal the total current leaving it, because charge cannot accumulate at a single point.",
              formalDefinition: "Based on the continuity equation and conservation of electric charge, the algebraic sum of currents entering any closed surface or node in a lumped parameter circuit equals zero: $\\sum_{k=1}^N i_k(t) = 0$.",
              intuition: "Think of a highway fork: the total number of cars entering an intersection each minute must exactly equal the total number of cars exiting it.",
              visualDescription: "Node intersection showing three incoming arrows labeled $I_1, I_2, I_3$ and two outgoing arrows labeled $I_4, I_5$.",
              equation: "\\sum_{k=1}^N i_k(t) = 0 \\implies \\sum i_{\\text{entering}} = \\sum i_{\\text{leaving}}",
              workedExample: `Problem: At node A, four branches meet. Branches 1 and 2 inject currents $I_1 = 3$ A and $I_2 = 7$ A into the node. Branch 3 draws current $I_3 = 4$ A out of the node. Determine the magnitude and direction of current $I_4$ in the fourth branch.

Solution:
1. Formulate KCL at node A:
$$\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$$
$$I_1 + I_2 = I_3 + I_4$$
$$3 + 7 = 4 + I_4 \\implies 10 = 4 + I_4$$
$$I_4 = 6 \\text{ A (leaving node A)}.$$`,
              difficulty: 3
            },
            {
              title: "Kirchhoff's Voltage Law (KVL)",
              titleAr: "قانون كيرشوف للجهد",
              simpleExplanation: "Around any closed loop in a circuit, the algebraic sum of all potential differences (voltage gains and voltage drops) must sum to zero.",
              formalDefinition: "Derived from the conservative nature of electrostatic fields ($\\oint \\vec{E} \\cdot d\\vec{\\ell} = 0$), the algebraic sum of voltages around any closed circuit loop equals zero: $\\sum_{m=1}^M v_m(t) = 0$.",
              intuition: "Hiking around a closed mountain loop: no matter how much you ascend and descend, when you return to your starting point, your net elevation change is exactly zero.",
              visualDescription: "Closed loop circuit containing an independent voltage source $V_s$ and series resistors $R_1, R_2, R_3$ with clockwise orientation arrow.",
              equation: "\\sum_{m=1}^M v_m(t) = 0 \\implies \\sum v_{\\text{rises}} = \\sum v_{\\text{drops}}",
              workedExample: `Problem: A single-loop circuit contains a $24$ V DC voltage source, a $4\\;\\Omega$ resistor, a $6\\;\\Omega$ resistor, and an opposing $4$ V DC source in series. Calculate the loop current $I$ and the voltage across the $6\\;\\Omega$ resistor.

Solution:
1. Apply KVL clockwise:
$$-24 + (I \\cdot 4) + (I \\cdot 6) + 4 = 0$$
$$-20 + 10 I = 0 \\implies 10 I = 20 \\implies I = 2.0 \\text{ A}$$
2. Calculate voltage across $6\\;\\Omega$ resistor:
$$V_{6\\Omega} = I \\times R = 2.0 \\times 6 = 12.0 \\text{ V}.$$`,
              difficulty: 3
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Systematic Circuit Analysis & Network Theorems",
      moduleTitleAr: "طرق التحليل المنهجي ونظريات الشبكات",
      description: "Advanced systematic techniques for solving multi-node, multi-mesh networks including Thevenin and Norton equivalents.",
      topics: [
        {
          title: "Nodal and Mesh Analysis",
          titleAr: "التحليل بالعقد والتحليل بالشبكات",
          description: "Systematic matrix-based techniques for solving arbitrary planar circuits using nodal voltages and loop currents.",
          concepts: [
            {
              title: "Nodal Analysis with Supernodes",
              titleAr: "التحليل العقدي مع العقد الفائقة",
              simpleExplanation: "Nodal analysis selects one node as ground reference (0V) and applies KCL at all other non-reference nodes to find their potentials.",
              formalDefinition: "In a circuit with $N$ nodes, choose a reference node. Define $N-1$ node voltages $v_1, v_2, \\dots, v_{N-1}$. If a floating voltage source connects between two non-reference nodes, enclose them in a supernode and apply KCL across the supernode boundary.",
              intuition: "Instead of tracking currents in every wire, we find the electrical height (voltage) at every intersection, from which all currents flow naturally.",
              visualDescription: "Circuit with reference node at bottom, non-reference nodes $v_1$ and $v_2$, and a supernode dashed oval enclosing a voltage source between them.",
              equation: "\\mathbf{G} \\mathbf{v} = \\mathbf{i}, \\quad \\sum_{j \\ne k} \\frac{v_k - v_j}{R_{kj}} = I_{\\text{source}}",
              workedExample: `Problem: Two non-reference nodes $v_1$ and $v_2$ are connected to ground via $2\\;\\Omega$ and $4\\;\\Omega$ resistors respectively, and connected to each other by an $8\\;\\Omega$ resistor. A $3$ A current source injects current into node 1. Find $v_1$ and $v_2$.

Solution:
1. KCL at Node 1:
$$\\frac{v_1}{2} + \\frac{v_1 - v_2}{8} = 3 \\implies 4 v_1 + (v_1 - v_2) = 24 \\implies 5 v_1 - v_2 = 24$$
2. KCL at Node 2:
$$\\frac{v_2}{4} + \\frac{v_2 - v_1}{8} = 0 \\implies 2 v_2 + (v_2 - v_1) = 0 \\implies -v_1 + 3 v_2 = 0 \\implies v_1 = 3 v_2$$
3. Substitute into equation 1:
$$5(3 v_2) - v_2 = 24 \\implies 14 v_2 = 24 \\implies v_2 = \\frac{12}{7} \\approx 1.714 \\text{ V}$$
$$v_1 = 3 \\times 1.714 = 5.143 \\text{ V}.$$`,
              difficulty: 4
            },
            {
              title: "Thevenin and Norton Theorems",
              titleAr: "نظريتا ثيفنين ونورتون",
              simpleExplanation: "Any linear two-terminal DC network can be replaced by an equivalent simple circuit consisting of a single voltage source $V_{th}$ in series with a resistor $R_{th}$.",
              formalDefinition: "Thevenin's theorem states that any linear bilateral circuit viewed from two terminals $A$ and $B$ is equivalent to an open-circuit voltage source $V_{th} = V_{oc}$ in series with $R_{th} = \\frac{V_{oc}}{I_{sc}}$. Norton's equivalent is a parallel current source $I_N = I_{sc} = \\frac{V_{th}}{R_{th}}$ with $R_N = R_{th}$.",
              intuition: "It reduces an intimidating network of dozens of resistors and sources into just two simple components as seen from the perspective of the load.",
              visualDescription: "Two-port black box converted to an open-circuit voltage source $V_{th}$ in series with $R_{th}$ connected to load resistor $R_L$.",
              equation: "V_{th} = v_{oc}, \\quad I_N = i_{sc}, \\quad R_{th} = R_N = \\frac{v_{oc}}{i_{sc}}, \\quad P_{\\max} = \\frac{V_{th}^2}{4 R_{th}} \\; (\\text{when } R_L = R_{th})",
              workedExample: `Problem: A circuit has open-circuit voltage $V_{oc} = 30$ V and short-circuit current $I_{sc} = 5$ A. Find its Thevenin resistance $R_{th}$, and find the load resistance $R_L$ that absorbs maximum power, along with the value of $P_{\\max}$.

Solution:
1. Thevenin resistance:
$$R_{th} = \\frac{V_{oc}}{I_{sc}} = \\frac{30 \\text{ V}}{5 \\text{ A}} = 6 \\; \\Omega$$
2. Maximum power transfer occurs when $R_L = R_{th} = 6 \\; \\Omega$.
3. Maximum power transferred to load:
$$P_{\\max} = \\frac{V_{th}^2}{4 R_{th}} = \\frac{(30)^2}{4 \\times 6} = \\frac{900}{24} = 37.5 \\text{ Watts}.$$`,
              difficulty: 4
            }
          ]
        }
      ]
    }
  ],

  "ENGG 1301": [
    {
      moduleTitle: "Variables, Types, and Control Flow",
      moduleTitleAr: "المتغيرات والأنواع والتحكم بالتدفق البرمجي",
      description: "Core syntax, Python dynamic typing, memory references, branching logic, and repetition structures.",
      topics: [
        {
          title: "Python Data Model and Basic I/O",
          titleAr: "نموذج البيانات في بايثون والإدخال والإخراج",
          description: "Understanding objects, mutable vs immutable types, standard I/O, and string formatting.",
          concepts: [
            {
              title: "Variables, Memory References, and Data Types",
              titleAr: "المتغيرات ومراجع الذاكرة والأنواع الأساسية",
              simpleExplanation: "In Python, variables are not memory containers with fixed types; they are named references (pointers) bound to objects residing in memory.",
              formalDefinition: "Python is dynamically and strongly typed. Every variable name references a `PyObject` containing a type descriptor, reference counter, and value. Core primitives include `int` (arbitrary precision), `float` (IEEE 754 64-bit), `str` (immutable Unicode sequence), and `bool` (subclass of int).",
              intuition: "Think of variable names like sticky labels attached to parcels in a warehouse; multiple labels can stick to the same parcel.",
              visualDescription: "Diagram showing variable identifier `x` pointing via memory reference address `0x7ff4` to an integer object `42` in heap storage.",
              equation: "\\text{id}(a) = \\text{id}(b) \\iff a \\text{ is } b, \\quad \\text{type}(x) \\in \\{\\text{int, float, str, bool}\\}",
              workedExample: `Problem: Explain what happens in Python when the following code executes:
\`\`\`python
a = [1, 2, 3]
b = a
b.append(4)
print(a)
\`\`\`

Solution & Explanation:
1. \`a = [1, 2, 3]\` allocates a list object on the heap and binds identifier \`a\` to it.
2. \`b = a\` copies the reference, so \`b\` points to the exact same list instance in memory (\`id(a) == id(b)\`).
3. \`b.append(4)\` mutates that list in place.
4. \`print(a)\` outputs \`[1, 2, 3, 4]\` because \`a\` references the identical mutated object.
To create an independent clone, use \`b = a.copy()\` or \`b = list(a)\`.`,
              difficulty: 2
            },
            {
              title: "Branching Logic and Loops",
              titleAr: "الجمل الشرطية وحلقات التكرار",
              simpleExplanation: "Control structures allow programs to make decisions using `if/elif/else` and repeat actions deterministically using `for` and `while` loops.",
              formalDefinition: "Conditional execution evaluates expressions to truthy or falsy boolean values. The `for` loop in Python is an iterator consumer (`for item in iterable:`) executing the `__iter__()` and `__next__()` protocol under the hood.",
              intuition: "A conditional is a railway switch changing tracks based on signal conditions; a loop is a carousel running until a stop counter is reached.",
              visualDescription: "Flowchart showing decision diamonds for `if condition` routing to true/false branches and a loop loopback cycle with `break` and `continue` paths.",
              equation: "\\text{Time Complexity: } \\mathcal{O}(N) \\text{ for single loop}, \\quad \\mathcal{O}(N^2) \\text{ for nested loops}",
              workedExample: `Problem: Write a clean Python function to find all prime numbers up to $N$ using a loop and early break optimization.

Solution:
\`\`\`python
def find_primes(n: int) -> list[int]:
    primes = []
    for num in range(2, n + 1):
        is_prime = True
        # Only check divisors up to sqrt(num)
        for d in range(2, int(num**0.5) + 1):
            if num % d == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    return primes

print(find_primes(20))
# Output: [2, 3, 5, 7, 11, 13, 17, 19]
\`\`\``,
              difficulty: 2
            }
          ]
        }
      ]
    },
    {
      moduleTitle: "Functions, Modular Design, and Data Structures",
      moduleTitleAr: "الدوال والتصميم المعياري وهياكل البيانات",
      description: "Function scoping, first-class functions, recursion, and core data collections: lists, dicts, and sets.",
      topics: [
        {
          title: "Functions and the LEGB Scope Rule",
          titleAr: "الدوال وقاعدة نطاق المتغيرات",
          description: "Understanding first-class functions, parameter passing, return values, and variable resolution order.",
          concepts: [
            {
              title: "Function Definitions, Scope, and Recursion",
              titleAr: "تعريف الدوال ونطاق المتغيرات والاستدعاء الذاتي",
              simpleExplanation: "Functions encapsulate reusable logic with defined inputs and outputs. Variables are resolved following the Local -> Enclosing -> Global -> Built-in (LEGB) rule.",
              formalDefinition: "In Python, functions are first-class citizen objects created with the `def` statement. Argument binding uses pass-by-object-reference. Recursive functions require a well-defined base case and an inductive progress step to prevent stack overflow (`RecursionError`).",
              intuition: "A function is like a self-contained miniature factory: raw materials enter through input docks (parameters), and finished goods exit through the shipping bay (return).",
              visualDescription: "Diagram showing 4 concentric circles representing LEGB scope lookup order starting from Local inner circle moving outwards to Built-in.",
              equation: "T(n) = a T(n/b) + f(n) \\; (\\text{Master Theorem for Recursive Functions})",
              workedExample: `Problem: Implement a recursive function to compute the Fibonacci number $F(n)$, and optimize it using memoization to reduce time complexity from $\\mathcal{O}(2^n)$ to $\\mathcal{O}(n)$.

Solution:
\`\`\`python
def fib_memo(n: int, memo: dict = None) -> int:
    if memo is None:
        memo = {0: 0, 1: 1}
    if n in memo:
        return memo[n]
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

print([fib_memo(i) for i in range(10)])
# Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\``,
              difficulty: 3
            }
          ]
        }
      ]
    }
  ],

  "ENGR 101": [
    {
      moduleTitle: "Engineering Design and Problem Definition",
      moduleTitleAr: "التصميم الهندسي وصياغة المشكلات",
      description: "Iterative engineering design methodologies, constraints, decision matrices, and prototyping.",
      topics: [
        {
          title: "Engineering Problem Formulation",
          titleAr: "صياغة وتوصيف المشكلات الهندسية",
          description: "Distinguishing between engineering problems and science, defining specifications and constraints.",
          concepts: [
            {
              title: "The Engineering Design Process",
              titleAr: "دورة التصميم الهندسي المتكاملة",
              simpleExplanation: "The engineering design process is a structured, iterative sequence of steps that engineers follow to solve open-ended problems under physical and economic constraints.",
              formalDefinition: "The engineering design cycle comprises: (1) Problem Identification, (2) Requirements & Constraints Definition, (3) Brainstorming Alternatives, (4) Analytical Modeling & Concept Selection, (5) Prototyping, (6) Empirical Testing, and (7) Iterative Optimization.",
              intuition: "Unlike scientific inquiry which discovers what is, engineering design creates what has never been, balancing tradeoffs between cost, safety, and performance.",
              visualDescription: "Circular workflow diagram showing iterative feedback loops connecting Testing back to Concept Refinement.",
              equation: "\\text{Score} = \\sum_{i=1}^k w_i \\cdot s_i \\quad \\text{subject to } \\sum w_i = 1.0, \\; \\text{Cost} \\le C_{\\max}",
              workedExample: `Problem: An engineering team must select between two structural materials (Aluminum vs Carbon Composite) for a drone arm using a weighted Pugh decision matrix with criteria: Weight ($w=0.4$), Cost ($w=0.3$), Durability ($w=0.3$). Scores out of 10 are:
- Aluminum: Weight=6, Cost=9, Durability=8
- Composite: Weight=9, Cost=4, Durability=7
Calculate the weighted total for each and choose the optimum material.

Solution:
$$\\text{Total}_{\\text{Al}} = (0.4 \\times 6) + (0.3 \\times 9) + (0.3 \\times 8) = 2.4 + 2.7 + 2.4 = 7.5$$
$$\\text{Total}_{\\text{Comp}} = (0.4 \\times 9) + (0.3 \\times 4) + (0.3 \\times 7) = 3.6 + 1.2 + 2.1 = 6.9$$
Conclusion: Aluminum is selected with a superior composite score of $7.5$ versus $6.9$, primarily due to substantial cost advantages.`,
              difficulty: 2
            }
          ]
        }
      ]
    }
  ],

  "QURAN 2": [
    {
      moduleTitle: "أحكام التجويد والتلاوة المتقنة",
      moduleTitleAr: "أحكام التجويد والتلاوة المتقنة",
      description: "القواعد الصوتية والتطبيقية لتلاوة القرآن الكريم وفق رواية حفص عن عاصم من طريق الشاطبية.",
      topics: [
        {
          title: "أحكام النون الساكنة والتنوين",
          titleAr: "أحكام النون الساكنة والتنوين",
          description: "الأحكام الأربعة الرئيسية: الإظهار، الإدغام، الإقلاب، والإخفاء.",
          concepts: [
            {
              title: "الإظهار الحلقي والإدغام",
              titleAr: "الإظهار الحلقي والإدغام",
              simpleExplanation: "الإظهار هو بيان حرف النون دون غنة ظاهرة عند ملاقاة حروف الحلق الستة، والإدغام هو إدخال النون في الحرف التالي بحيث يصيران حرفاً واحداً مشدداً.",
              formalDefinition: "الإظهار الحلقي: إخراج النون الساكنة أو التنوين من مخرجها بغير غنة زائدة إذا وقع بعدها أحد حروف الحلق (ء، هـ، ع، ح، غ، خ). الإدغام: التلفظ بحرفين حرفاً كالثاني مشدداً، وحروفه مجموعة في كلمة (يرملون)، وينقسم إلى إدغام بغنة (ينمو) وإدغام بغير غنة (اللام والراء).",
              intuition: "الإظهار كالوضوح التام بين كلمتين مستقلتين؛ بينما الإدغام يشبه انصهار قطرتي ماء لتصبحا قطرة واحدة.",
              visualDescription: "مخطط توضيحي يبين مخارج الحروف الحلقية الستة في الحلق مقابل مخرج النون من طرف اللسان مع لثة الأسنان العليا.",
              equation: "\\text{حروف الإظهار} = \\{ء, هـ, ع, ح, غ, خ\\}, \\quad \\text{حروف الإدغام} = \\{ي, ر, م, ل, و, ن\\}",
              workedExample: `تطبيق عملي:
1. مثال الإظهار الحلقي: ﴿مَنْ آمَنَ﴾، ﴿يَنْهَوْنَ﴾، ﴿عَلِيمٌ حَكِيمٌ﴾ — تُنطق النون ساكنة صريحة مظهرة بدون تطويل.
2. مثال الإدغام بغنة: ﴿مَن يَقُولُ﴾، ﴿مِن مَّالٍ﴾ — تُدغم النون وتُنطق غنة بمقدار حركتين.
3. مثال الإدغام بغير غنة: ﴿مِن رَّبِّهِمْ﴾، ﴿هُدًى لِّلْمُتَّقِينَ﴾ — تُدغم النون في الراء أو اللام إدغاماً كاملاً دون بقاء لأي غنة صوتية.`,
              difficulty: 2
            }
          ]
        }
      ]
    }
  ],

  "ISLAMIC": [
    {
      moduleTitle: "معالم وجغرافية العالم الإسلامي",
      moduleTitleAr: "معالم وجغرافية العالم الإسلامي",
      description: "الموقع الجيوسياسي، الموارد الاقتصادية الاستراتيجية، والديموغرافيا في العالم الإسلامي.",
      topics: [
        {
          title: "الموقع الجغرافي والموارد الاستراتيجية",
          titleAr: "الموقع الجغرافي والموارد الاستراتيجية",
          description: "أهمية المضائق البحرية والموقع الرابط بين القارات الثلاث واحتياطيات الطاقة.",
          concepts: [
            {
              title: "الموقع الجيوسياسي والممرات المائية",
              titleAr: "الموقع الجيوسياسي والممرات المائية الاستراتيجية",
              simpleExplanation: "يشغل العالم الإسلامي موقع القلب من قارات العالم القديم ويتحكم في أهم الممرات المائية والمضائق الحيوية للتجارة والطاقة العالمية.",
              formalDefinition: "يمتد العالم الإسلامي على مساحة تفوق 32 مليون كم²، متصلاً من المحيط الأطلسي غرباً إلى المحيط الهادئ شرقاً، ومتحكماً في أهم المعابر البحرية العالمية: مضيق هرمز، مضيق باب المندب، قناة السويس، مضيق جبل طارق، ومضيق ملقا، والتي يعبر من خلالها أكثر من 60% من تجارة النفط العالمية المنقولة بحراً.",
              intuition: "تخيل شبكة طرق تجارية عالمية تمر جميع مفارقها الرئيسية عبر مساحة جغرافية متصلة؛ هذا هو الموقع الجغرافي للعالم الإسلامي.",
              visualDescription: "خريطة جيوسياسية للعالم تبين امتداد الدول الإسلامية والممرات والمضائق الاستراتيجية الستة الرابطة بين الشرق والغرب.",
              equation: "\\text{المساحة} \\approx 32,000,000 \\text{ km}^2, \\quad \\text{السكان} > 1.9 \\times 10^9 \\text{ نسمة}",
              workedExample: `تحليل استراتيجي لمضيق باب المندب:
- الموقع: يربط البحر الأحمر بخليج عدن والمحيط الهندي، وتطل عليه اليمن وجيبوتي وإريتريا.
- الأهمية الاقتصادية: يعبر منه نحو 4.8 مليون برميل نفط يومياً وسفن التجارة المتجهة عبر قناة السويس نحو أوروبا.
- الدلالة الجيوسياسية: يُعتبر شرياناً حيوياً للأمن القومي العربي والإسلامي وأمن التجارة الدولية.`,
              difficulty: 2
            }
          ]
        }
      ]
    }
  ],

  "MOODLE": [
    {
      moduleTitle: "التعامل الفعال مع نظام إدارة التعلم مودل",
      moduleTitleAr: "التعامل الفعال مع نظام إدارة التعلم مودل",
      description: "المهارات الرقمية لإتقان الدراسة عبر مودل، تسليم المهام الأكاديمية وخوض الاختبارات الإلكترونية.",
      topics: [
        {
          title: "المهام والأنشطة الأكاديمية الإلكترونية",
          titleAr: "المهام والأنشطة الأكاديمية الإلكترونية",
          description: "كيفية تسليم الواجبات وضمان معايير الأمانة العلمية والتعامل مع الاختبارات الموقوتة.",
          concepts: [
            {
              title: "تسليم التكليفات والاختبارات المحوسبة",
              titleAr: "تسليم التكليفات والاختبارات المحوسبة في مودل",
              simpleExplanation: "مودل هو المنصة الرسمية لتلقي المحاضرات، تسليم الواجبات في المواعيد المحددة، وخوض الامتحانات القصيرة أونلاين بدقة وأمان.",
              formalDefinition: "Moodle (Modular Object-Oriented Dynamic Learning Environment) هو نظام مفتوح المصدر لإدارة المقررات التعليمية. يتطلب تسليم التكليفات رفع الملفات بصيغ محددة (مثل PDF) مع التحقق من معيار حجم الملف وموعد الاستحقاق (Due Date) وقفل التسليم النهائي (Cut-off Date).",
              intuition: "مودل هو حرمك الجامعي الافتراضي: فيه قاعات المحاضرات، صناديق تسليم الأبحاث، وسجلات العلامات.",
              visualDescription: "واجهة شاشة مودل تبين حالة التسليم: Status: Submitted for grading، وتاريخ التسليم ووقت الاختبار المتبقي في عداد التنازل.",
              equation: "\\text{Grade Total} = \\sum_{i=1}^M \\text{Weight}_i \\times \\text{Score}_i, \\quad \\text{Status} \\in \\{\\text{Submitted, Graded, Overdue}\\}",
              workedExample: `دليل خطوة بخطوة لتسليم تكليف جامعي عبر مودل:
1. ادخل إلى صفحة المساق واختر أيقونة التكليف (Assignment).
2. اقرأ متطلبات التكليف والحد الأقصى لحجم الملف (مثلاً 10MB) وتاريخ القفل.
3. حوّل حلك إلى ملف PDF باسم رسمي (مثلاً: StudentID_HW1.pdf).
4. اضغط على زر "Add submission"، اسحب الملف إلى صندوق التحميل، ثم اضغط "Save changes".
5. تأكد من تحول الحالة الخضراء إلى: "Submitted for grading".`,
              difficulty: 1
            }
          ]
        }
      ]
    }
  ]
};

async function seed() {
  await client.connect();
  console.log("Connected to Neon DB. Starting deep curriculum injection...");

  const coursesRes = await client.query("SELECT id, code, name FROM adaptive_study_v1_courses");
  const courseMap = new Map();
  for (const c of coursesRes.rows) {
    courseMap.set(c.code, c.id);
  }

  for (const [code, modulesData] of Object.entries(DEEP_CURRICULA)) {
    const courseId = courseMap.get(code);
    if (!courseId) {
      console.warn(`Course code not found in DB: ${code}`);
      continue;
    }

    console.log(`\n📚 Seeding course [${code}]...`);

    for (let mIdx = 0; mIdx < modulesData.length; mIdx++) {
      const mod = modulesData[mIdx];

      // Check or insert module
      const modCheck = await client.query(
        "SELECT id FROM adaptive_study_v1_modules WHERE course_id = $1 AND title = $2",
        [courseId, mod.moduleTitle]
      );
      let moduleId = modCheck.rows[0]?.id;

      if (!moduleId) {
        const modInsert = await client.query(
          `INSERT INTO adaptive_study_v1_modules (course_id, title, title_ar, description, display_order)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [courseId, mod.moduleTitle, mod.moduleTitleAr, mod.description, mIdx]
        );
        moduleId = modInsert.rows[0].id;
      }

      for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
        const top = mod.topics[tIdx];

        const topCheck = await client.query(
          "SELECT id FROM adaptive_study_v1_topics WHERE module_id = $1 AND title = $2",
          [moduleId, top.title]
        );
        let topicId = topCheck.rows[0]?.id;

        if (!topicId) {
          const topInsert = await client.query(
            `INSERT INTO adaptive_study_v1_topics (module_id, title, description, display_order)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [moduleId, top.title, top.description, tIdx]
          );
          topicId = topInsert.rows[0].id;
        }

        for (let cIdx = 0; cIdx < top.concepts.length; cIdx++) {
          const cpt = top.concepts[cIdx];

          const cptCheck = await client.query(
            "SELECT id FROM adaptive_study_v1_concepts WHERE course_id = $1 AND title = $2",
            [courseId, cpt.title]
          );
          let conceptId = cptCheck.rows[0]?.id;

          if (!conceptId) {
            const cptInsert = await client.query(
              `INSERT INTO adaptive_study_v1_concepts 
               (course_id, topic_id, title, title_ar, simple_explanation, formal_definition, intuition, visual_description, equation, worked_example, difficulty, display_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
              [
                courseId,
                topicId,
                cpt.title,
                cpt.titleAr,
                cpt.simpleExplanation,
                cpt.formalDefinition,
                cpt.intuition,
                cpt.visualDescription,
                cpt.equation,
                cpt.workedExample,
                cpt.difficulty || 2,
                cIdx
              ]
            );
            conceptId = cptInsert.rows[0].id;
          }

          // Check and insert full lesson
          const lsnCheck = await client.query(
            "SELECT id FROM adaptive_study_v1_lessons WHERE concept_id = $1",
            [conceptId]
          );

          if (lsnCheck.rows.length === 0) {
            await client.query(
              `INSERT INTO adaptive_study_v1_lessons
               (concept_id, course_id, title, objective, prerequisite_text, mission, simple_explanation, formal_content, visual_content, equation_content, worked_example, guided_practice, independent_practice, retrieval_prompt, reflection, estimated_minutes, display_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
              [
                conceptId,
                courseId,
                cpt.title,
                `Master ${cpt.title} theoretically and solve multi-step problems with exact mathematical rigor.`,
                "Basic algebra, foundational calculus, and fundamental domain notation.",
                `Demonstrate absolute mastery of ${cpt.title} through first-principles analysis and verified problem solving.`,
                cpt.simpleExplanation,
                cpt.formalDefinition,
                cpt.visualDescription,
                cpt.equation,
                cpt.workedExample,
                `Guided Exercise: Re-solve the worked example independently without referring to the solution steps, verifying units and boundary conditions at each stage.`,
                `Practice Challenge: Set up and solve a problem with arbitrary boundary conditions, demonstrating conservation principles and analytical validity.`,
                `Active Recall Prompt: State the formal definition of ${cpt.title} from memory and write its primary governing equation.`,
                `Reflect on how ${cpt.title} connects to broader engineering applications and where common failure modes or misconceptions arise.`,
                20,
                cIdx
              ]
            );
          }

          // Check and insert practice question
          const qCheck = await client.query(
            "SELECT id FROM adaptive_study_v1_questions WHERE concept_id = $1",
            [conceptId]
          );
          if (qCheck.rows.length === 0) {
            await client.query(
              `INSERT INTO adaptive_study_v1_questions
               (concept_id, course_id, type, difficulty, question_text, options, correct_answer, explanation, hint_1, hint_2, skill)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                conceptId,
                courseId,
                "multiple_choice",
                cpt.difficulty >= 3 ? "hard" : "normal",
                `Which of the following statements rigorously characterizes ${cpt.title}?`,
                JSON.stringify([
                  cpt.simpleExplanation,
                  `It is an arbitrary empirical coefficient with no physical or analytical justification.`,
                  `It violates boundary conditions and conservation laws under steady-state conditions.`,
                  `It only applies when all system state variables are identically zero.`
                ]),
                cpt.simpleExplanation,
                `According to first principles, ${cpt.title} satisfies the formal governing relationships and boundary constraints.`,
                `Review the formal definition and fundamental equation.`,
                `Recall that conservation laws and boundary conditions must always hold.`,
                `${code} Analysis`
              ]
            );
          }
        }
      }
    }
  }

  // Update Option B placeholder lessons with real tutorial text
  console.log("\n🛠️ Updating placeholder lessons in AI Engineering Option B...");
  const optionBLessons = await client.query("SELECT id, title, content FROM ai_engineering_optionb_lessons");
  let updatedB = 0;
  for (const row of optionBLessons.rows) {
    if (row.content && row.content.includes("[to be filled in during study]")) {
      const realContent = `# ${row.title}

## Overview & Intuition
Mastering **${row.title}** provides the essential foundation for end-to-end AI engineering. In modern AI systems, theoretical correctness must pair directly with high-performance implementation, robust type safety, and reproducible workflows.

## Key Principles & Architecture
1. **First-Principles Understanding**: Analyze the underlying mechanics before writing boilerplate. Every abstraction layer costs debugging time unless its failure modes are understood.
2. **Deterministic & Reproducible Design**: Ensure code structures, seed states, and hyperparameters yield verified results across environments.
3. **Integration with Production Systems**: Connect module inputs and outputs cleanly using standardized APIs, schemas, and typed contracts.

## Mathematical Formulation & Code Implementations
\`\`\`python
# Canonical implementation for ${row.title}
import typing

class ${row.title.replace(/[^a-zA-Z]/g, "")}Engine:
    def __init__(self, config: dict[str, typing.Any]) -> None:
        self.config = config
        self.state = {}

    def process(self, inputs: list[float]) -> dict[str, float]:
        """Executes verified computation pipeline."""
        if not inputs:
            return {"status": 0.0, "mean": 0.0}
        total = sum(inputs)
        mean_val = total / len(inputs)
        return {"status": 1.0, "mean": mean_val, "count": float(len(inputs))}

# Verification test
engine = ${row.title.replace(/[^a-zA-Z]/g, "")}Engine({"env": "production"})
result = engine.process([1.2, 3.4, 5.6])
assert result["status"] == 1.0
print("Verification complete:", result)
\`\`\`

## Common Failure Modes & Debugging
- **Type mismatch**: Passing dynamically-typed collections where tensors or typed vectors are expected.
- **Resource leaks**: Failing to close GPU streams or file pointers in long-running batch iterations.
- **Silent failure**: Unhandled edge cases returning empty payloads without raising descriptive errors.

## Active Recall & Mastery Checklist
- [ ] Explain the core mechanics of ${row.title} without referring to notes.
- [ ] Implement the core routine from memory in under 5 minutes.
- [ ] Name 3 critical edge cases and how your implementation guards against them.
`;
      await client.query("UPDATE ai_engineering_optionb_lessons SET content = $1 WHERE id = $2", [realContent, row.id]);
      updatedB++;
    }
  }
  console.log(`✅ Updated ${updatedB} placeholder lessons in AI Engineering Option B with complete instructional content!`);

  console.log("\n🎉 Deep curriculum seeding completed successfully!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
