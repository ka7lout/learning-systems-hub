import { db } from "../src/db";
import {
  courses,
  courseSources,
  modules,
  topics,
  concepts,
  lessons,
  questions,
  profiles,
  reviewItems,
  studySessions
} from "../src/db/schema";
import { COURSE_DATA } from "../src/lib/courses-data";
import { MATH_CURRICULUM, PHYSICS_CURRICULUM, CIRCUITS_CURRICULUM, PYTHON_CURRICULUM } from "../src/lib/db-init";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting complete seed for Adaptive Study v1...");

  // 1. Ensure Default Profile
  const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, "default-user")).limit(1);
  if (!existingProfile[0]) {
    await db.insert(profiles).values({
      userId: "default-user",
      username: "Ismaili",
      fullName: "Ismaili Scholar",
      email: "scholar@iug.edu.ps",
      currentStreak: 5,
      longestStreak: 14,
      totalXp: 1250,
      totalStudyMinutes: 340,
      level: 3,
    });
    console.log("✅ Seeded default profile");
  }

  // 2. Insert Courses if not present
  const existingCourses = await db.select().from(courses);
  const courseMap = new Map<string, string>(); // code -> id

  for (const c of existingCourses) {
    courseMap.set(c.code, c.id);
  }

  for (let i = 0; i < COURSE_DATA.length; i++) {
    const cd = COURSE_DATA[i];
    if (!courseMap.has(cd.code)) {
      const [inserted] = await db.insert(courses).values({
        code: cd.code,
        name: cd.name,
        nameAr: cd.nameAr,
        instructor: cd.instructor || null,
        referenceBook: cd.referenceBook || null,
        referenceBookEdition: cd.referenceBookEdition || null,
        color: cd.color,
        icon: cd.icon,
        displayOrder: i,
        isActive: true,
      }).returning();
      courseMap.set(cd.code, inserted.id);
      console.log(`✅ Inserted course: ${cd.code} - ${cd.name}`);
    }
  }

  // Helper function to seed full curriculum for a course
  async function seedCurriculum(courseCode: string, curriculum: typeof MATH_CURRICULUM, subjectTag: string) {
    const courseId = courseMap.get(courseCode);
    if (!courseId) return;

    console.log(`\n📚 Seeding modules & lessons for ${courseCode}...`);

    for (let mIdx = 0; mIdx < curriculum.length; mIdx++) {
      const mod = curriculum[mIdx];
      
      // Check or insert module
      const existingMod = await db.select().from(modules)
        .where(eq(modules.courseId, courseId))
        .then(mods => mods.find(m => m.title === mod.moduleTitle));

      let moduleId = existingMod?.id;
      if (!moduleId) {
        const [newMod] = await db.insert(modules).values({
          courseId,
          title: mod.moduleTitle,
          titleAr: mod.moduleTitleAr,
          description: `Comprehensive module covering ${mod.moduleTitle} with rigorous analytical and problem-solving focus.`,
          displayOrder: mIdx,
        }).returning();
        moduleId = newMod.id;
      }

      for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
        const top = mod.topics[tIdx];

        // Check or insert topic
        const existingTop = await db.select().from(topics)
          .where(eq(topics.moduleId, moduleId))
          .then(tops => tops.find(t => t.title === top.title));

        let topicId = existingTop?.id;
        if (!topicId) {
          const [newTop] = await db.insert(topics).values({
            moduleId,
            title: top.title,
            description: `Core concepts and applied theory for ${top.title}.`,
            displayOrder: tIdx,
          }).returning();
          topicId = newTop.id;
        }

        for (let cIdx = 0; cIdx < top.concepts.length; cIdx++) {
          const cpt = top.concepts[cIdx];

          const existingConcept = await db.select().from(concepts)
            .where(eq(concepts.courseId, courseId))
            .then(cpts => cpts.find(c => c.title === cpt.title));

          let conceptId = existingConcept?.id;
          if (!existingConcept) {
            const [newCpt] = await db.insert(concepts).values({
              courseId,
              topicId,
              title: cpt.title,
              titleAr: cpt.title,
              simpleExplanation: getConceptSimple(cpt.title, subjectTag),
              formalDefinition: getConceptFormal(cpt.title, subjectTag),
              intuition: getConceptIntuition(cpt.title, subjectTag),
              visualDescription: `Coordinate diagram and graphical representation illustrating ${cpt.title}.`,
              equation: getConceptEquation(cpt.title, subjectTag),
              workedExample: getConceptWorked(cpt.title, subjectTag),
              keyPoints: [
                `Fundamental definition of ${cpt.title}`,
                "Primary conditions and domain constraints",
                "Common algebraic or computational steps",
                "Direct application in engineering systems"
              ],
              commonMistakes: [
                "Ignoring domain boundary conditions",
                "Sign errors in intermediate algebraic derivation",
                "Applying the rule outside its valid assumptions"
              ],
              difficulty: cpt.difficulty || 2,
              displayOrder: cIdx,
            }).returning();
            conceptId = newCpt.id;
          }

          // Check or insert rich Lesson
          const existingLesson = await db.select().from(lessons)
            .where(eq(lessons.conceptId, conceptId!))
            .limit(1);

          if (!existingLesson[0]) {
            await db.insert(lessons).values({
              conceptId: conceptId!,
              courseId,
              title: cpt.title,
              objective: `Master the theoretical foundations, exact definitions, and analytical solution methods of ${cpt.title}.`,
              prerequisiteText: `Solid grounding in prior foundational topics of ${mod.moduleTitle}.`,
              mission: `Understand ${cpt.title} deeply from first principles and solve practice problems without external reliance.`,
              simpleExplanation: getConceptSimple(cpt.title, subjectTag),
              formalContent: getConceptFormal(cpt.title, subjectTag),
              visualContent: `Mental Model: Visualize the behavior of ${cpt.title} as a transformation on input parameters, noting how small perturbations propagate through the system.`,
              equationContent: getConceptEquation(cpt.title, subjectTag),
              workedExample: getConceptWorked(cpt.title, subjectTag),
              guidedPractice: `Step 1: Write down the given values and governing equations.\nStep 2: Check boundary constraints.\nStep 3: Solve for the target variable systematically.\nStep 4: Verify physical and mathematical units.`,
              independentPractice: `Solve the standard benchmark problem for ${cpt.title} under modified parameters, documenting every intermediate step and proving correctness.`,
              retrievalPrompt: `Close your notes: State the core definition of ${cpt.title}, write the governing formula from memory, and identify one scenario where it cannot be applied.`,
              reflection: `What was the most counterintuitive aspect of ${cpt.title}? Where would this concept be most vulnerable to student error?`,
              estimatedMinutes: 25,
              displayOrder: cIdx,
            });

            // Insert a Practice Question
            await db.insert(questions).values({
              courseId,
              conceptId: conceptId!,
              type: "multiple_choice",
              difficulty: cpt.difficulty >= 3 ? "hard" : "normal",
              questionText: `What is the principal condition or rule governing ${cpt.title}?`,
              options: [
                `The standard analytical formulation where all boundary constraints are satisfied.`,
                `A heuristic approximation that ignores continuity.`,
                `An arbitrary constant with no physical interpretation.`,
                `An inverse relationship that only holds at zero.`
              ],
              correctAnswer: `The standard analytical formulation where all boundary constraints are satisfied.`,
              explanation: `In ${subjectTag}, ${cpt.title} is strictly governed by fundamental analytical principles and boundary conditions.`,
              hint1: `Recall the formal definition introduced in the lecture notes.`,
              hint2: `Consider what happens when constraints are not met.`,
              skill: `${subjectTag} Analysis`,
            });
          }
        }
      }
    }
  }

  // Seed all 4 core curricula
  await seedCurriculum("MATH A", MATH_CURRICULUM, "Calculus");
  await seedCurriculum("PHYS A", PHYSICS_CURRICULUM, "Physics");
  await seedCurriculum("ELEC 1", CIRCUITS_CURRICULUM, "Circuits");
  await seedCurriculum("ENGG 1301", PYTHON_CURRICULUM, "Python");

  console.log("✨ Complete seed finished successfully for Adaptive Study v1!");
}

function getConceptSimple(title: string, subject: string): string {
  return `${title} provides the essential building block for understanding system behavior in ${subject}. It connects basic intuition with quantifiable analysis, allowing engineers to predict how changing one variable affects the overall state.`;
}

function getConceptFormal(title: string, subject: string): string {
  return `Definition (${subject}): Let S be the system defined on a continuous domain D. ${title} is formally characterized by the relation f(x) satisfying all governing constraints across D, where every input maps to a well-defined state under initial and boundary conditions.`;
}

function getConceptIntuition(title: string, subject: string): string {
  return `Think of ${title} like a precise mechanical balance or transfer function: when you feed in an excitation or input, the internal laws dictate an exact, reproducible response without ambiguity.`;
}

function getConceptEquation(title: string, subject: string): string {
  if (subject === "Calculus") return `f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}, \\quad \\int_a^b f(x) dx = F(b) - F(a)`;
  if (subject === "Physics") return `\\vec{F}_{net} = m\\vec{a} = \\frac{d\\vec{p}}{dt}, \\quad W = \\int \\vec{F} \\cdot d\\vec{r}`;
  if (subject === "Circuits") return `v(t) = R \\cdot i(t), \\quad i_C(t) = C\\frac{dv}{dt}, \\quad v_L(t) = L\\frac{di}{dt}`;
  return `def calculate_metric(x: float) -> float:\n    # Computes deterministic response\n    return x ** 2 + 2 * x + 1`;
}

function getConceptWorked(title: string, subject: string): string {
  return `Example Problem: Apply ${title} to evaluate the system response given initial condition x_0 = 2.0.\n\nSolution Steps:\n1. Formulate the governing equation using known parameters.\n2. Substitute x_0 = 2.0 into the analytical relation.\n3. Simplify: 2.0^2 + 2(2.0) + 1 = 4.0 + 4.0 + 1 = 9.0.\n4. Verification: The result satisfies the boundary condition and domain constraints.`;
}

main().then(() => process.exit(0)).catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
