import { db } from "./index";
import {
  users,
  curriculumNodes,
  learningBlocks,
  skills,
  projects,
  careerRoles,
  englishTerms,
  userProgress,
  tasks
} from "./schema";
import { CANONICAL_CURRICULUM_NODES } from "../data/canonical-curriculum";
import { CANONICAL_LEARNING_BLOCKS } from "../data/learning-blocks";
import { CANONICAL_SKILLS } from "../data/skills";
import { CANONICAL_PROJECTS } from "../data/projects";
import { CANONICAL_CAREER_ROLES } from "../data/career-roles";
import { CANONICAL_ENGLISH_TERMS } from "../data/english-vocab";

export async function seedDatabase() {
  console.log("🌱 Starting full database seed...");

  // 1. Seed Default Primary Learner
  const defaultUser = {
    id: "usr-learner-primary",
    email: "learner@ismaili-harvard.edu",
    name: "Ismaili Scholar",
    role: "student",
    statePreference: "deep",
    englishMode: "standard_tech",
    targetRoleId: "role-navisoft-ai-eng"
  };

  await db
    .insert(users)
    .values(defaultUser)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: defaultUser.name,
        role: defaultUser.role,
        statePreference: defaultUser.statePreference,
        englishMode: defaultUser.englishMode,
        targetRoleId: defaultUser.targetRoleId
      }
    });

  console.log("✅ Seeded primary user:", defaultUser.email);

  // 2. Seed Curriculum Nodes
  for (const node of CANONICAL_CURRICULUM_NODES) {
    await db
      .insert(curriculumNodes)
      .values({
        id: node.id,
        slug: node.slug,
        title: node.title,
        stage: node.stage,
        sourceCategory: node.sourceCategory,
        moduleNumber: node.moduleNumber,
        sessionIndex: node.sessionIndex,
        level: node.level,
        prerequisites: node.prerequisites,
        corequisites: node.corequisites,
        whyItMatters: node.whyItMatters,
        learningObjectives: node.learningObjectives,
        skills: node.skills,
        mustWriteNotes: node.mustWriteNotes,
        recommendedNotes: node.recommendedNotes,
        optionalNotes: node.optionalNotes,
        englishKeywords: node.englishKeywords,
        sources: node.sources,
        orderIndex: node.orderIndex,
        version: "1.0.0",
        lastVerified: "Spring 2026 Official Catalog"
      })
      .onConflictDoUpdate({
        target: curriculumNodes.id,
        set: {
          title: node.title,
          stage: node.stage,
          sourceCategory: node.sourceCategory,
          moduleNumber: node.moduleNumber,
          sessionIndex: node.sessionIndex,
          level: node.level,
          prerequisites: node.prerequisites,
          corequisites: node.corequisites,
          whyItMatters: node.whyItMatters,
          learningObjectives: node.learningObjectives,
          skills: node.skills,
          mustWriteNotes: node.mustWriteNotes,
          recommendedNotes: node.recommendedNotes,
          optionalNotes: node.optionalNotes,
          englishKeywords: node.englishKeywords,
          sources: node.sources,
          orderIndex: node.orderIndex
        }
      });
  }
  console.log(`✅ Seeded ${CANONICAL_CURRICULUM_NODES.length} canonical curriculum nodes`);

  // 3. Seed Learning Blocks
  for (const block of CANONICAL_LEARNING_BLOCKS) {
    await db
      .insert(learningBlocks)
      .values({
        id: block.id,
        nodeId: block.nodeId,
        type: block.type,
        title: block.title,
        content: block.content,
        codeSnippet: block.codeSnippet,
        language: block.language || "python",
        starterCode: block.starterCode,
        solutionCode: block.solutionCode,
        testCases: block.testCases || [],
        hints: block.hints || [],
        metadata: block.metadata || {},
        orderIndex: block.orderIndex
      })
      .onConflictDoUpdate({
        target: learningBlocks.id,
        set: {
          nodeId: block.nodeId,
          type: block.type,
          title: block.title,
          content: block.content,
          codeSnippet: block.codeSnippet,
          starterCode: block.starterCode,
          solutionCode: block.solutionCode,
          testCases: block.testCases || [],
          hints: block.hints || []
        }
      });
  }
  console.log(`✅ Seeded ${CANONICAL_LEARNING_BLOCKS.length} pedagogical learning blocks`);

  // 4. Seed Skills
  for (const skill of CANONICAL_SKILLS) {
    await db
      .insert(skills)
      .values({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        level: skill.level,
        prerequisites: skill.prerequisites,
        careerRoles: skill.careerRoles
      })
      .onConflictDoUpdate({
        target: skills.id,
        set: {
          name: skill.name,
          category: skill.category,
          description: skill.description,
          level: skill.level,
          prerequisites: skill.prerequisites,
          careerRoles: skill.careerRoles
        }
      });
  }
  console.log(`✅ Seeded ${CANONICAL_SKILLS.length} skill taxonomy entries`);

  // 5. Seed Projects (21+ original + flagships)
  for (const proj of CANONICAL_PROJECTS) {
    await db
      .insert(projects)
      .values({
        id: proj.id,
        slug: proj.slug,
        title: proj.title,
        category: proj.category,
        ladderLevel: proj.ladderLevel,
        isOriginalCatalog: proj.isOriginalCatalog,
        catalogIndex: proj.catalogIndex,
        description: proj.description,
        whyImportant: proj.whyImportant,
        datasetName: proj.datasetName,
        datasetUrl: proj.datasetUrl,
        datasetLicense: proj.datasetLicense,
        requirements: proj.requirements,
        acceptanceCriteria: proj.acceptanceCriteria,
        starterCode: proj.starterCode,
        architectureDiagram: proj.architectureDiagram,
        suggestedMilestones: proj.suggestedMilestones,
        rubric: proj.rubric
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          title: proj.title,
          category: proj.category,
          ladderLevel: proj.ladderLevel,
          isOriginalCatalog: proj.isOriginalCatalog,
          catalogIndex: proj.catalogIndex,
          description: proj.description,
          whyImportant: proj.whyImportant,
          datasetName: proj.datasetName,
          datasetUrl: proj.datasetUrl,
          datasetLicense: proj.datasetLicense,
          requirements: proj.requirements,
          acceptanceCriteria: proj.acceptanceCriteria,
          suggestedMilestones: proj.suggestedMilestones,
          rubric: proj.rubric
        }
      });
  }
  console.log(`✅ Seeded ${CANONICAL_PROJECTS.length} projects from master catalog`);

  // 6. Seed Career Roles
  for (const role of CANONICAL_CAREER_ROLES) {
    await db
      .insert(careerRoles)
      .values({
        id: role.id,
        slug: role.slug,
        title: role.title,
        archetype: role.archetype,
        description: role.description,
        requiredSkills: role.requiredSkills,
        preferredSkills: role.preferredSkills,
        seniority: role.seniority,
        typicalTasks: role.typicalTasks,
        flagshipProjects: role.flagshipProjects,
        interviewDomains: role.interviewDomains,
        lastVerified: role.lastVerified
      })
      .onConflictDoUpdate({
        target: careerRoles.id,
        set: {
          title: role.title,
          archetype: role.archetype,
          description: role.description,
          requiredSkills: role.requiredSkills,
          preferredSkills: role.preferredSkills,
          seniority: role.seniority,
          typicalTasks: role.typicalTasks,
          flagshipProjects: role.flagshipProjects,
          interviewDomains: role.interviewDomains,
          lastVerified: role.lastVerified
        }
      });
  }
  console.log(`✅ Seeded ${CANONICAL_CAREER_ROLES.length} target career roles`);

  // 7. Seed English Terms
  for (const term of CANONICAL_ENGLISH_TERMS) {
    const id = `eng-${term.term.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    await db
      .insert(englishTerms)
      .values({
        id,
        term: term.term,
        category: term.category,
        partOfSpeech: term.partOfSpeech,
        b1b2Definition: term.b1b2Definition,
        technicalDefinition: term.technicalDefinition,
        arabicMeaning: term.arabicMeaning,
        pronunciationIpa: term.pronunciationIpa,
        exampleSentence: term.exampleSentence,
        commonMistakes: term.commonMistakes
      })
      .onConflictDoUpdate({
        target: englishTerms.id,
        set: {
          term: term.term,
          category: term.category,
          partOfSpeech: term.partOfSpeech,
          b1b2Definition: term.b1b2Definition,
          technicalDefinition: term.technicalDefinition,
          arabicMeaning: term.arabicMeaning,
          pronunciationIpa: term.pronunciationIpa,
          exampleSentence: term.exampleSentence,
          commonMistakes: term.commonMistakes
        }
      });
  }
  console.log(`✅ Seeded ${CANONICAL_ENGLISH_TERMS.length} English vocabulary terms`);

  // 8. Seed Initial Learner Progress & Next Tasks
  await db
    .insert(userProgress)
    .values({
      id: "prog-usr-m1-s1",
      userId: defaultUser.id,
      nodeId: "m1-s1-fundamentals",
      status: "in_progress",
      completionPct: 60,
      masteryLevel: 4,
      completedBlocks: ["blk-py-fund-orient", "blk-py-fund-lecture", "blk-py-fund-worked-ex"]
    })
    .onConflictDoNothing();

  await db
    .insert(tasks)
    .values({
      id: "tsk-01-complete-py-transfer",
      userId: defaultUser.id,
      title: "Solve Python Early Stopping Transfer Challenge",
      description: "Implement the simulate_early_stopping function in the Python Fundamentals module without external libraries.",
      category: "programming",
      reasonType: "prerequisite_gap",
      nodeId: "m1-s1-fundamentals",
      priority: "high",
      difficulty: "intermediate",
      status: "pending"
    })
    .onConflictDoNothing();

  console.log("✨ Seed completed successfully!");
}
