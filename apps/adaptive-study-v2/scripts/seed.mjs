// Seed script — populates the REAL local PostgreSQL database.
//
// IMPORTANT (truthfulness):
// The curriculum below is taken from the brief the student supplied. It is
// marked provenance = 'student_supplied_provisional' and verification_status =
// 'unverified' everywhere, because it has NOT been verified against the actual
// Google Drive source (which was unreachable from this environment). Lesson
// content is AI-generated explanation (origin = 'ai_explanation'); practice
// questions are clearly source_label = 'AI_GENERATED'. No university facts,
// professor statements, exam dates or weights are asserted as real.
//
// Re-runnable: if courses already exist it skips seeding.

import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const q = (text, params = []) => pool.query(text, params);

async function main() {
  const { rows } = await q("select count(*)::int as c from courses");
  if (rows[0].c > 0) {
    console.log("Courses already present — skipping seed.");
    await pool.end();
    return;
  }

  const courses = [
    {
      code: "MATHA 1301",
      title: "Calculus A",
      color: "#38bdf8",
      reference: "Thomas' Calculus, 12th Ed. (provisional reference)",
      concepts: [
        {
          title: "Functions",
          lessons: [
            {
              title: "What is a function?",
              mission: "Understand that a function turns an input into exactly one output.",
              objective: "Given a rule, identify the input, output, and whether it is a function.",
              prerequisite: "Comfort with basic algebra (variables, arithmetic).",
              simple: "A function is like a machine: you put in a number, it gives back exactly one number. Same input always gives the same output.",
              analogy: "A vending machine: press B4 (input) and you always get the same snack (output). If one button sometimes gave different snacks, it would not be a function.",
              formal: "A function f from a set A to a set B assigns to each element x in A exactly one element f(x) in B. A tells you the domain; B the codomain.",
              equation: "f: A -> B,  x -> f(x)\ny = f(x)",
              worked: "Let f(x) = 2x + 1. Then f(3) = 2(3)+1 = 7. The input 3 always maps to 7.",
              guided: "For f(x)=x^2, compute f(2), f(-2), f(0). (What do you notice about f(2) and f(-2)?)",
              independent: "Write a rule for a function that doubles a number and adds 3. Then find f(5).",
              retrieval: "Close this page. Write the definition of a function in your own words and give one real example.",
              reflection: "Why must a function give exactly one output for each input? What would break if it gave two?",
              schedule: "Default review: Day 1, Day 3, Day 7. Adapt if you struggle to recall.",
              questions: [
                { text: "If f(x)=3x-2, what is f(4)?", answer: "10", solution: "f(4)=3*4-2=12-2=10.", difficulty: "easy", skill: "evaluation" },
                { text: "True or false: a rule that maps x=2 to both 4 and 5 can be a function.", answer: "False", solution: "A function gives exactly one output per input, so this cannot be a function.", difficulty: "normal", skill: "definition" },
              ],
            },
          ],
        },
        {
          title: "Limits",
          lessons: [
            {
              title: "Limits: approaching a value",
              mission: "Understand a limit as the value a function approaches as x gets close to a point.",
              objective: "Read a limit from intuition and from a table of values.",
              prerequisite: "Functions.",
              simple: "A limit asks: as x gets closer and closer to some number, what value does f(x) get closer to? It does not require f to actually reach that value.",
              analogy: "Walking toward a wall: you can get half the remaining distance forever. You approach the wall without necessarily touching it.",
              formal: "lim_{x->a} f(x) = L means f(x) can be made arbitrarily close to L by taking x sufficiently close to a (but not equal to a).",
              equation: "lim_{x->a} f(x) = L",
              worked: "f(x) = (x^2-1)/(x-1). At x=1 it is 0/0 (undefined), but for x near 1, f(x)=x+1, so the limit as x->1 is 2.",
              guided: "Use the form x+1 above: what is f(1.1), f(1.01)? They approach 2.",
              independent: "Estimate lim_{x->0} (sin x)/x using x=0.1, 0.01 (it approaches 1).",
              retrieval: "Explain in your own words why a limit can exist even when the function is undefined at that point.",
              reflection: "When is a limit useful even if the function has a hole?",
              schedule: "Default review: Day 1, Day 3, Day 7.",
              questions: [
                { text: "lim_{x->2} (x+3) = ?", answer: "5", solution: "Substitute x=2: 2+3=5.", difficulty: "easy", skill: "evaluation" },
                { text: "A function has a hole at x=1 but approaches 4 there. Does the limit exist?", answer: "Yes, 4", solution: "The limit depends on approach, not the value at the point; it is 4.", difficulty: "normal", skill: "concept" },
              ],
            },
          ],
        },
        {
          title: "The Derivative",
          lessons: [
            {
              title: "The derivative as a rate of change",
              mission: "See the derivative as instantaneous rate of change / slope of the tangent.",
              objective: "State what a derivative measures and compute a simple derivative rule.",
              prerequisite: "Limits, functions.",
              simple: "The derivative is 'how fast' something is changing at an exact instant — like the speed on a speedometer at this moment, not the average over a trip.",
              analogy: "Average speed = distance/time over a trip. Instantaneous speed = what the speedometer shows now. The derivative is the speedometer reading.",
              formal: "f'(x) = lim_{h->0} (f(x+h)-f(x))/h. It is the slope of the tangent line to the graph at x.",
              equation: "f'(x) = lim_{h->0} (f(x+h)-f(x))/h\nd/dx(x^n)=n x^{n-1}",
              worked: "For f(x)=x^2, f'(x)=2x. At x=3 the slope is 6.",
              guided: "Use the power rule: find the derivative of x^3. (Answer: 3x^2.)",
              independent: "Find f'(x) for f(x)=5x^2 - 3x.",
              retrieval: "Without looking, write the definition of the derivative and one rule.",
              reflection: "Why is the limit h->0 needed instead of just h=0?",
              schedule: "Default review: Day 1, Day 3, Day 7, Day 14.",
              questions: [
                { text: "What does f'(x) measure?", answer: "Instantaneous rate of change / slope of tangent", solution: "The derivative is the instantaneous rate of change of f at x.", difficulty: "normal", skill: "concept" },
                { text: "If f(x)=x^3, what is f'(2)?", answer: "12", solution: "f'(x)=3x^2, so f'(2)=3*4=12.", difficulty: "hard", skill: "computation" },
              ],
            },
          ],
        },
        {
          title: "Integration",
          lessons: [
            {
              title: "Accumulation and the integral",
              mission: "Understand an integral as accumulated area / total change.",
              objective: "Relate integration to summation and to the derivative (inverse operation).",
              prerequisite: "Derivative, limits.",
              simple: "Integration adds up many tiny pieces to get a total — like finding the area under a curve by stacking thin rectangles.",
              analogy: "If the derivative tells you the speed at each instant, the integral tells you the total distance travelled.",
              formal: "The definite integral int_a^b f(x) dx is the signed area under f from a to b. The Fundamental Theorem links it to antiderivatives: int_a^b f = F(b)-F(a).",
              equation: "int_a^b f(x) dx = F(b) - F(a),  F' = f",
              worked: "int_0^2 2x dx = [x^2]_0^2 = 4 - 0 = 4.",
              guided: "Find int_0^1 3 dx. (Constant 3 over width 1 => area 3.)",
              independent: "Compute int_0^3 x dx.",
              retrieval: "Explain the relationship between derivative and integral in one sentence.",
              reflection: "Why is the antiderivative evaluated at two points?",
              schedule: "Default review: Day 1, Day 3, Day 7, Day 14.",
              questions: [
                { text: "int_0^3 x dx = ?", answer: "9/2 or 4.5", solution: "Antiderivative x^2/2; at 3 gives 9/2, at 0 gives 0.", difficulty: "hard", skill: "computation" },
                { text: "What does a definite integral represent geometrically?", answer: "Signed area under the curve", solution: "It is the net area between the graph and the x-axis.", difficulty: "normal", skill: "concept" },
              ],
            },
          ],
        },
      ],
    },
    {
      code: "PHYSA 1301",
      title: "General Physics A",
      color: "#34d399",
      reference: "Serway & Jewett, 9th Ed. (provisional reference)",
      concepts: [
        {
          title: "Kinematics in 1D",
          lessons: [
            {
              title: "Position, velocity, acceleration",
              mission: "Connect position, velocity and acceleration as rates of change.",
              objective: "Given one, describe the others and use v = dx/dt intuition.",
              prerequisite: "Basic algebra; idea of a rate of change.",
              simple: "Position is where you are. Velocity is how fast position changes. Acceleration is how fast velocity changes.",
              analogy: "Driving: your position is the mile-marker; velocity is the speedometer; acceleration is how quickly the speedometer number changes.",
              formal: "v = dx/dt,  a = dv/dt. For constant a: v = v0 + a t,  x = x0 + v0 t + 1/2 a t^2.",
              equation: "v = v0 + a t\nx = x0 + v0 t + (1/2) a t^2",
              worked: "A car starts from rest (v0=0) and accelerates at 2 m/s^2. After 3 s, v = 0 + 2*3 = 6 m/s.",
              guided: "With v0=0, a=2, find position after 3 s. (x = 0.5*2*9 = 9 m.)",
              independent: "A ball is dropped (a = -9.8 m/s^2). What is its velocity after 2 s?",
              retrieval: "Write the three kinematic equations for constant acceleration from memory.",
              reflection: "Why is acceleration not the same as velocity?",
              schedule: "Default review: Day 1, Day 3, Day 7.",
              questions: [
                { text: "A car accelerates at 3 m/s^2 from rest. Speed after 4 s?", answer: "12 m/s", solution: "v = a t = 3*4 = 12 m/s.", difficulty: "easy", skill: "kinematics" },
                { text: "If velocity is constant, what is acceleration?", answer: "0", solution: "Acceleration is the rate of change of velocity; constant velocity means zero change.", difficulty: "normal", skill: "concept" },
              ],
            },
          ],
        },
        {
          title: "Newton's Laws",
          lessons: [
            {
              title: "Forces and Newton's second law",
              mission: "Use F = ma to relate net force, mass and acceleration.",
              objective: "Draw a simple force picture and apply F_net = m a.",
              prerequisite: "Kinematics, vectors (basic).",
              simple: "To accelerate an object you must push it. The harder you push (net force) and the lighter the object (small mass), the bigger the acceleration.",
              analogy: "Pushing a shopping cart: a hard push accelerates it quickly; a full cart (more mass) accelerates slowly for the same push.",
              formal: "Newton's second law: the net force on an object equals its mass times acceleration, SUM F = m a. Newton's first: no net force => constant velocity. Third: forces come in equal/opposite pairs.",
              equation: "ΣF = m a",
              worked: "A 2 kg block has a net force of 6 N. a = F/m = 6/2 = 3 m/s^2.",
              guided: "If m=4 kg and a=2 m/s^2, what net force is needed? (F = 8 N.)",
              independent: "A 10 N force acts on a 5 kg object at rest. Find acceleration and speed after 3 s.",
              retrieval: "State Newton's three laws in your own words.",
              reflection: "Why must you use the NET force, not a single applied force?",
              schedule: "Default review: Day 1, Day 3, Day 7, Day 14.",
              questions: [
                { text: "Net force 10 N on 2 kg mass. Acceleration?", answer: "5 m/s^2", solution: "a = F/m = 10/2 = 5 m/s^2.", difficulty: "normal", skill: "dynamics" },
                { text: "An object moves at constant velocity. What is the net force?", answer: "0", solution: "Constant velocity means zero acceleration, so net force is zero.", difficulty: "normal", skill: "concept" },
              ],
            },
          ],
        },
        {
          title: "Energy",
          lessons: [
            {
              title: "Work and conservation of energy",
              mission: "Use energy conservation to relate speed and height without time.",
              objective: "Apply K + U = constant for simple systems.",
              prerequisite: "Newton's laws, kinematics.",
              simple: "Energy is a conserved quantity. Kinetic energy is 'motion energy'; potential energy is 'stored' energy (e.g. height). It can change form but the total stays the same (ignoring friction).",
              analogy: "A roller coaster at the top has stored height energy; as it drops, that becomes motion energy. Total stays constant.",
              formal: "Work W = F d cosθ. Kinetic K = 1/2 m v^2. Gravitational U = m g h. Conservation: K_i + U_i = K_f + U_f (no non-conservative work).",
              equation: "K = 1/2 m v^2\nU_g = m g h\nK_i + U_i = K_f + U_f",
              worked: "A 1 kg ball falls 5 m from rest. mgh = 1*9.8*5 = 49 J becomes K = 1/2 v^2 => v = sqrt(98) ≈ 9.9 m/s.",
              guided: "A 2 kg object drops 10 m. Find final speed using energy.",
              independent: "A 0.5 kg ball thrown up at 10 m/s — what max height? (Use v^2 = 2 g h.)",
              retrieval: "Write the kinetic and gravitational potential energy formulas and the conservation statement.",
              reflection: "When does conservation of energy NOT give the right answer directly?",
              schedule: "Default review: Day 1, Day 3, Day 7, Day 14.",
              questions: [
                { text: "Kinetic energy of 2 kg moving at 3 m/s?", answer: "9 J", solution: "K = 0.5*2*9 = 9 J.", difficulty: "easy", skill: "energy" },
                { text: "A frictionless 1 kg block slides down 2 m. Speed at bottom?", answer: "about 6.26 m/s", solution: "mgh = 1*9.8*2 = 19.6 J = 0.5 v^2 => v = sqrt(39.2) ≈ 6.26 m/s.", difficulty: "hard", skill: "energy" },
              ],
            },
          ],
        },
      ],
    },
    {
      code: "ELEC 1",
      title: "Electric Circuits I",
      color: "#fbbf24",
      reference: "Alexander & Sadiku, 5th Ed. (provisional reference)",
      concepts: [
        {
          title: "Ohm's Law",
          lessons: [
            {
              title: "Voltage, current, resistance",
              mission: "Relate voltage, current and resistance with V = I R.",
              objective: "Compute any one of V, I, R given the other two.",
              prerequisite: "Basic algebra.",
              simple: "Voltage is the 'push', current is the flow of charge, resistance is how hard the wire resists the flow. More push => more flow; more resistance => less flow.",
              analogy: "Water in a pipe: voltage is water pressure, current is flow rate, resistance is a narrow section of pipe.",
              formal: "Ohm's law: V = I R, where V is voltage (volts), I current (amperes), R resistance (ohms).",
              equation: "V = I R   ->   I = V/R   ->   R = V/I",
              worked: "A 9 V battery across a 3 Ω resistor gives I = V/R = 9/3 = 3 A.",
              guided: "If V=12 V and R=4 Ω, find I. (I = 3 A.)",
              independent: "A 2 A current flows through a 5 Ω resistor. What is the voltage?",
              retrieval: "Write Ohm's law three ways from memory.",
              reflection: "Why does a higher resistance reduce current for the same voltage?",
              schedule: "Default review: Day 1, Day 3, Day 7.",
              questions: [
                { text: "12 V across 6 Ω. Current?", answer: "2 A", solution: "I = V/R = 12/6 = 2 A.", difficulty: "easy", skill: "ohm" },
                { text: "A 5 Ω resistor has 2 A. Voltage across it?", answer: "10 V", solution: "V = I R = 2*5 = 10 V.", difficulty: "normal", skill: "ohm" },
              ],
            },
          ],
        },
        {
          title: "Kirchhoff's Laws",
          lessons: [
            {
              title: "KCL and KVL",
              mission: "Apply conservation of charge (KCL) and energy (KVL).",
              objective: "Write KCL at a node and KVL around a loop.",
              prerequisite: "Ohm's law.",
              simple: "KCL: what flows into a junction must flow out. KVL: the gains and drops of voltage around any closed loop add to zero.",
              analogy: "KCL is like water at a pipe junction — inflow equals outflow. KVL is like walking a loop and returning to the same height: net climb is zero.",
              formal: "KCL: sum of currents entering a node = sum leaving. KVL: algebraic sum of voltages around a closed loop = 0.",
              equation: "Σ I_in = Σ I_out\nΣ V = 0 (loop)",
              worked: "At a node, 3 A enters and two branches leave: I1 + I2 = 3 A. If I1=1 A then I2=2 A.",
              guided: "Around a loop with a 9 V source and two 3 V drops, verify KVL: 9 - 3 - 3 = 3, so a third drop of 3 V closes it.",
              independent: "Two currents 2 A and 4 A enter a node; one 3 A leaves. Find the other leaving current.",
              retrieval: "State KCL and KVL in your own words and write their equations.",
              reflection: "Why must KVL sum to zero around a loop?",
              schedule: "Default review: Day 1, Day 3, Day 7, Day 14.",
              questions: [
                { text: "At a node, 5 A enters and 2 A leaves on one branch. Other leaving branch?", answer: "3 A", solution: "KCL: 5 = 2 + I => I = 3 A.", difficulty: "normal", skill: "kcl" },
                { text: "A loop has a 12 V source and drops of 5 V and 4 V. Remaining drop?", answer: "3 V", solution: "KVL: 12 - 5 - 4 - V = 0 => V = 3 V.", difficulty: "hard", skill: "kvl" },
              ],
            },
          ],
        },
      ],
    },
    {
      code: "ENGG 1301",
      title: "Python Programming",
      color: "#f87171",
      reference: "Liang, Introduction to Programming Using Python (provisional reference)",
      concepts: [
        {
          title: "Variables and Types",
          lessons: [
            {
              title: "Variables and types",
              mission: "Store data in named variables and know the basic types.",
              objective: "Create variables of type int, float, str and print them.",
              prerequisite: "None.",
              simple: "A variable is a labeled container that holds a value. Its type says what kind of value it holds (number, text, ...).",
              analogy: "A variable is a labeled box: the label is the name, the content is the value, and the box type decides what you can put inside.",
              formal: "x = 5 binds the name x to the integer 5. type(x) returns int. Strings use quotes: name = 'Ada'.",
              equation: "x = 5        # int\ny = 3.14     # float\nname = 'Ada' # str",
              worked: "age = 20\nprint(age)\n# outputs 20",
              guided: "Create a variable price = 9.99 and print it.",
              independent: "Make a variable greeting that combines 'Hello, ' and your name using a string.",
              retrieval: "Write code that creates an integer, a float and a string, then prints each.",
              reflection: "Why does the type of a value matter when you do arithmetic vs. text?",
              schedule: "Default review: Day 1, Day 3, Day 7.",
              questions: [
                { text: "What does x = 5 create in Python?", answer: "An integer variable named x with value 5", solution: "It binds the name x to the int 5.", difficulty: "easy", skill: "variables" },
                { text: "Is '42' (with quotes) a number or a string?", answer: "A string", solution: "Quotes make it text, not an integer.", difficulty: "normal", skill: "types" },
              ],
            },
          ],
        },
        {
          title: "Conditionals",
          lessons: [
            {
              title: "if / else decisions",
              mission: "Make the program choose different actions using conditions.",
              objective: "Write an if/else that branches on a comparison.",
              prerequisite: "Variables and types.",
              simple: "A condition is a yes/no test. if it is true, do one block; else do another. Indentation shows what belongs to the if.",
              analogy: "A decision gate: 'if it is raining, take an umbrella, else wear sunglasses.'",
              formal: "if condition:\n    block\nelif other:\n    block\nelse:\n    block. Conditions use ==, !=, <, >, and, or.",
              equation: "if x > 5:\n    print('big')\nelse:\n    print('small')",
              worked: "x = 8\nif x > 5: print('big')   # prints big",
              guided: "Write an if that prints 'pass' if score >= 60 else 'fail'.",
              independent: "Given a number n, print 'even' if n % 2 == 0 else 'odd'.",
              retrieval: "Write a small if/else from memory that branches on a comparison.",
              reflection: "Why must the blocks be indented consistently?",
              schedule: "Default review: Day 1, Day 3, Day 7.",
              questions: [
                { text: "What does if x > 5: print('big') print when x = 3?", answer: "nothing (no output)", solution: "3 > 5 is false, so the if block is skipped and there is no else.", difficulty: "normal", skill: "conditionals" },
                { text: "Which operator tests equality in Python?", answer: "==", solution: "A single = assigns; == compares.", difficulty: "easy", skill: "syntax" },
              ],
            },
          ],
        },
        {
          title: "Loops",
          lessons: [
            {
              title: "Repeating with loops",
              mission: "Repeat an action with for and while loops.",
              objective: "Write a loop that prints numbers 1..5.",
              prerequisite: "Conditionals, variables.",
              simple: "A loop repeats a block of code. A for loop repeats for each item in a collection; a while loop repeats as long as a condition is true.",
              analogy: "Laps on a track: a for loop is 'run 5 laps'; a while loop is 'keep running while the whistle blows'.",
              formal: "for i in range(5): print(i) prints 0..4. while cond: block repeats until cond is false (avoid infinite loops!).",
              equation: "for i in range(1, 6):\n    print(i)\n# 1 2 3 4 5",
              worked: "total = 0\nfor i in range(1,4): total += i\n# total = 1+2+3 = 6",
              guided: "Write a loop that prints 'hello' three times.",
              independent: "Use a loop to sum the numbers 1 through 10.",
              retrieval: "Write a for loop that prints the numbers 1 to 5.",
              reflection: "When would you prefer a while loop over a for loop?",
              schedule: "Default review: Day 1, Day 3, Day 7.",
              questions: [
                { text: "What does range(3) produce?", answer: "0, 1, 2", solution: "range(n) yields 0..n-1.", difficulty: "easy", skill: "loops" },
                { text: "What is the danger of a while loop?", answer: "Infinite loop if condition never becomes false", solution: "Ensure the condition eventually turns false.", difficulty: "normal", skill: "concept" },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Insert courses, modules, topics, concepts, lessons, questions, assessments.
  for (const c of courses) {
    const { rows: cr } = await q(
      "insert into courses (code, title, reference_text, color, provenance, verification_status, position) values ($1,$2,$3,$4,'student_supplied_provisional','unverified',0) returning id",
      [c.code, c.title, c.reference, c.color],
    );
    const courseId = cr[0].id;

    const { rows: mr } = await q(
      "insert into modules (course_id, title, position) values ($1,'Core',0) returning id",
      [courseId],
    );
    const moduleId = mr[0].id;

    let prevConceptId = null;
    for (const concept of c.concepts) {
      const { rows: tr } = await q(
        "insert into topics (course_id, module_id, title, position) values ($1,$2,$3,0) returning id",
        [courseId, moduleId, concept.title + " topic"],
      );
      const topicId = tr[0].id;
      const { rows: conr } = await q(
        "insert into concepts (course_id, topic_id, title, summary, position) values ($1,$2,$3,$4,0) returning id",
        [courseId, topicId, concept.title, "Provisional concept from student-supplied brief."],
      );
      const conceptId = conr[0].id;

      if (prevConceptId) {
        await q(
          "insert into prerequisites (concept_id, depends_on_id) values ($1,$2)",
          [conceptId, prevConceptId],
        );
      }
      prevConceptId = conceptId;

      for (const lesson of concept.lessons) {
        const { rows: lr } = await q(
          `insert into lessons
            (course_id, concept_id, topic_id, title, mission, objective, prerequisite_text,
             simple_explanation, analogy, formal_definition, equation, worked_example,
             guided_practice, independent_practice, retrieval_prompt, reflection, review_schedule,
             source_doc, origin, generated_by_ai, verification_status, position)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
             'Provisional curriculum (student-supplied brief, unverified against Drive)',
             'ai_explanation', true, 'unverified', 0)
           returning id`,
          [
            courseId, conceptId, topicId, lesson.title, lesson.mission, lesson.objective,
            lesson.prerequisite, lesson.simple, lesson.analogy, lesson.formal, lesson.equation,
            lesson.worked, lesson.guided, lesson.independent, lesson.retrieval, lesson.reflection,
            lesson.schedule,
          ],
        );
        const lessonId = lr[0].id;

        for (const qu of lesson.questions) {
          await q(
            `insert into questions
              (course_id, concept_id, lesson_id, difficulty, skill, question_text, answer, solution,
               source_label, origin, verification_status)
             values ($1,$2,$3,$4,$5,$6,$7,$8,'AI_GENERATED','ai_practice','unverified')`,
            [courseId, conceptId, lessonId, qu.difficulty, qu.skill, qu.text, qu.answer, qu.solution],
          );
        }
      }
    }

    // assessments with NO asserted dates/weights (truthful)
    for (const a of c.assessments || []) {
      await q(
        `insert into assessments (course_id, title, type, exam_date, coverage_text, provenance, verification_status)
         values ($1,$2,$3,null,'Provisional — weighting and date unverified against source.','student_supplied_provisional','unverified')`,
        [courseId, a.title, a.type],
      );
    }
  }

  // Honest source-inventory record: the external Drive was NOT reachable.
  await q(
    `insert into source_inventory (filename, path, type, purpose, status, source_url, processed_at)
     values ('Google Drive folder (139xQLaE-...)','Google Drive / IUG materials','folder',
       'Primary academic source supplied in the brief. Could NOT be accessed from this sandbox environment, so no files were ingested, processed, or OCRd.',
       'unavailable','https://drive.google.com/drive/folders/139xQLaE-XcvdqWcX74gES44dSonAV4gR', now())`,
  );

  console.log("Seed complete: 4 courses, concepts, lessons, AI-generated questions, honest source record.");
  await pool.end();
}

main().catch(async (e) => {
  console.error("Seed failed:", e);
  await pool.end();
  process.exit(1);
});
