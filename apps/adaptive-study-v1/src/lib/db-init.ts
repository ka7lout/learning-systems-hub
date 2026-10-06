import { db } from "@/db";
import { courses, courseSources, modules, topics, concepts, prerequisites, lessons } from "@/db/schema";
import { COURSE_DATA } from "./courses-data";

export async function initializeDatabase() {
  console.log("Initializing database with real course data...");
  
  // Check if courses already exist
  const existingCourses = await db.select().from(courses).limit(1);
  if (existingCourses.length > 0) {
    console.log("Database already initialized. Skipping.");
    return;
  }

  // Insert courses
  const insertedCourses = await db.insert(courses).values(
    COURSE_DATA.map((course, index) => ({
      code: course.code,
      name: course.name,
      nameAr: course.nameAr,
      instructor: course.instructor || null,
      referenceBook: course.referenceBook || null,
      referenceBookEdition: course.referenceBookEdition || null,
      color: course.color,
      icon: course.icon,
      displayOrder: index,
      isActive: true,
    }))
  ).returning();

  console.log(`Inserted ${insertedCourses.length} courses`);

  // Insert course sources based on Google Drive inspection
  const driveBaseUrl = "https://drive.google.com/drive/folders";
  
  for (let i = 0; i < insertedCourses.length; i++) {
    const course = insertedCourses[i];
    const courseData = COURSE_DATA[i];
    
    // Insert source records for known files
    const sources = [];
    
    // Main folder source
    sources.push({
      courseId: course.id,
      filename: `${courseData.name} - Main Folder`,
      path: courseData.folders.join(", "),
      type: "folder",
      size: "N/A",
      driveUrl: `${driveBaseUrl}/139xQLaE-XcvdqWcX74gES44dSonAV4gR`,
      purpose: "course_materials",
      status: "processed",
    });

    // Known markdown files
    for (const file of courseData.files) {
      sources.push({
        courseId: course.id,
        filename: file,
        path: `${courseData.folders[0]}/${file}`,
        type: file.endsWith(".md") ? "md" : "unknown",
        size: "N/A",
        driveUrl: `${driveBaseUrl}/139xQLaE-XcvdqWcX74gES44dSonAV4gR`,
        purpose: file.includes("syllabus") ? "syllabus" : 
                 file.includes("assignments") ? "assignments" :
                 file.includes("إعلانات") ? "announcements" : "reference",
        status: "processed",
      });
    }

    // Subfolders
    for (const subfolder of courseData.subfolders) {
      sources.push({
        courseId: course.id,
        filename: subfolder,
        path: `${courseData.folders[0]}/${subfolder}`,
        type: "folder",
        size: "N/A",
        driveUrl: `${driveBaseUrl}/139xQLaE-XcvdqWcX74gES44dSonAV4gR`,
        purpose: "course_materials",
        status: "processed",
      });
    }

    // Chapter folders for Math and Physics
    for (const chapter of courseData.chapters) {
      sources.push({
        courseId: course.id,
        filename: chapter.folder,
        path: `${courseData.folders[0]}/${chapter.folder}`,
        type: "folder",
        size: "N/A",
        driveUrl: `${driveBaseUrl}/139xQLaE-XcvdqWcX74gES44dSonAV4gR`,
        purpose: "lecture",
        status: "processed",
      });
    }

    if (sources.length > 0) {
      await db.insert(courseSources).values(sources);
    }
  }

  console.log("Database initialization complete!");
  console.log("Courses:", insertedCourses.map(c => `${c.code} - ${c.name}`).join(", "));
}

// Curriculum structure for Math A
export const MATH_CURRICULUM = [
  {
    moduleTitle: "Functions & Graphs",
    moduleTitleAr: "الدوال والرسوم البيانية",
    topics: [
      { title: "Functions", titleAr: "الدوال", concepts: [
        { title: "Definition of a Function", difficulty: 1 },
        { title: "Function Notation", difficulty: 1 },
        { title: "Domain and Range", difficulty: 2 },
        { title: "Graphing Functions", difficulty: 2 },
      ]},
      { title: "Graph Transformations", titleAr: "تحويلات الرسوم", concepts: [
        { title: "Vertical and Horizontal Shifts", difficulty: 2 },
        { title: "Reflections", difficulty: 2 },
        { title: "Stretching and Compressing", difficulty: 3 },
      ]},
      { title: "Trigonometric Functions", titleAr: "الدوال المثلثية", concepts: [
        { title: "Sine and Cosine", difficulty: 2 },
        { title: "Tangent", difficulty: 2 },
        { title: "Unit Circle", difficulty: 3 },
        { title: "Graphs of Trigonometric Functions", difficulty: 3 },
      ]},
    ]
  },
  {
    moduleTitle: "Limits & Continuity",
    moduleTitleAr: "النهايات والاستمرارية",
    topics: [
      { title: "Limits", titleAr: "النهايات", concepts: [
        { title: "Intuitive Definition of Limit", difficulty: 2 },
        { title: "Limit Laws", difficulty: 2 },
        { title: "One-Sided Limits", difficulty: 3 },
        { title: "Limits at Infinity", difficulty: 3 },
      ]},
      { title: "Continuity", titleAr: "الاستمرارية", concepts: [
        { title: "Definition of Continuity", difficulty: 2 },
        { title: "Types of Discontinuity", difficulty: 3 },
        { title: "Intermediate Value Theorem", difficulty: 3 },
      ]},
      { title: "Infinite Limits & Asymptotes", titleAr: "نهايات لا نهائية ومقاربات", concepts: [
        { title: "Infinite Limits", difficulty: 3 },
        { title: "Vertical Asymptotes", difficulty: 3 },
        { title: "Horizontal Asymptotes", difficulty: 3 },
      ]},
    ]
  },
  {
    moduleTitle: "Derivatives",
    moduleTitleAr: "المشتقات",
    topics: [
      { title: "Derivative Definition", titleAr: "تعريف المشتقة", concepts: [
        { title: "Average Rate of Change", difficulty: 2 },
        { title: "Instantaneous Rate of Change", difficulty: 3 },
        { title: "Limit Definition of Derivative", difficulty: 3 },
        { title: "Differentiability", difficulty: 3 },
      ]},
      { title: "Differentiation Rules", titleAr: "قواعد التفاضل", concepts: [
        { title: "Power Rule", difficulty: 2 },
        { title: "Constant Multiple and Sum Rules", difficulty: 2 },
        { title: "Product Rule", difficulty: 3 },
        { title: "Quotient Rule", difficulty: 3 },
        { title: "Derivatives of Trigonometric Functions", difficulty: 3 },
      ]},
      { title: "Chain Rule & Implicit Differentiation", titleAr: "قاعده السلسله والتفاضل الضمني", concepts: [
        { title: "Chain Rule", difficulty: 4 },
        { title: "Implicit Differentiation", difficulty: 4 },
        { title: "Derivatives of Inverse Functions", difficulty: 4 },
      ]},
      { title: "Applications of Derivatives", titleAr: "تطبيقات المشتقات", concepts: [
        { title: "Related Rates", difficulty: 4 },
        { title: "Linear Approximation", difficulty: 3 },
        { title: "Extrema and Critical Points", difficulty: 3 },
        { title: "Mean Value Theorem", difficulty: 4 },
        { title: "Increasing/Decreasing Functions", difficulty: 3 },
        { title: "Concavity and Curve Sketching", difficulty: 4 },
      ]},
    ]
  },
  {
    moduleTitle: "Integrals",
    moduleTitleAr: "التكامل",
    topics: [
      { title: "Integration Fundamentals", titleAr: "أساسيات التكامل", concepts: [
        { title: "Antiderivatives", difficulty: 3 },
        { title: "Riemann Sums", difficulty: 3 },
        { title: "Definite Integrals", difficulty: 3 },
        { title: "Fundamental Theorem of Calculus", difficulty: 4 },
      ]},
      { title: "Integration Techniques", titleAr: "تقنيات التكامل", concepts: [
        { title: "Substitution Rule", difficulty: 4 },
        { title: "Areas Between Curves", difficulty: 3 },
        { title: "Volumes of Revolution", difficulty: 4 },
        { title: "Arc Length", difficulty: 4 },
        { title: "Surface Area", difficulty: 5 },
      ]},
    ]
  },
];

// Curriculum structure for Physics A
export const PHYSICS_CURRICULUM = [
  {
    moduleTitle: "Kinematics",
    moduleTitleAr: "علم الحركة",
    topics: [
      { title: "Motion in One Dimension", titleAr: "الحركة في بُعد واحد", concepts: [
        { title: "Position, Displacement, Distance", difficulty: 1 },
        { title: "Velocity and Speed", difficulty: 2 },
        { title: "Acceleration", difficulty: 2 },
        { title: "Kinematic Equations", difficulty: 3 },
        { title: "Free Fall", difficulty: 3 },
      ]},
      { title: "Vectors", titleAr: "المتجهات", concepts: [
        { title: "Vector Addition and Subtraction", difficulty: 2 },
        { title: "Dot Product", difficulty: 3 },
        { title: "Cross Product", difficulty: 4 },
      ]},
      { title: "Motion in Two Dimensions", titleAr: "الحركة في بُعدين", concepts: [
        { title: "Projectile Motion", difficulty: 4 },
        { title: "Relative Velocity", difficulty: 4 },
      ]},
    ]
  },
  {
    moduleTitle: "Dynamics",
    moduleTitleAr: "علم القوى",
    topics: [
      { title: "Newton's Laws", titleAr: "قوانين نيوتن", concepts: [
        { title: "First Law - Inertia", difficulty: 2 },
        { title: "Second Law - F=ma", difficulty: 3 },
        { title: "Third Law - Action-Reaction", difficulty: 3 },
      ]},
      { title: "Forces", titleAr: "القوى", concepts: [
        { title: "Friction", difficulty: 3 },
        { title: "Circular Motion", difficulty: 4 },
        { title: "Centripetal Acceleration", difficulty: 4 },
      ]},
    ]
  },
  {
    moduleTitle: "Work & Energy",
    moduleTitleAr: "الشغل والطاقة",
    topics: [
      { title: "Work and Kinetic Energy", titleAr: "الشغل والطاقة الحركية", concepts: [
        { title: "Work Done by a Force", difficulty: 3 },
        { title: "Kinetic Energy", difficulty: 2 },
        { title: "Work-Energy Theorem", difficulty: 3 },
        { title: "Potential Energy", difficulty: 3 },
        { title: "Conservation of Energy", difficulty: 4 },
      ]},
      { title: "Momentum", titleAr: "الزخم", concepts: [
        { title: "Linear Momentum", difficulty: 3 },
        { title: "Collisions", difficulty: 4 },
        { title: "Center of Mass", difficulty: 4 },
      ]},
    ]
  },
  {
    moduleTitle: "Rotation & Fluids",
    moduleTitleAr: "الدوران والسوائل",
    topics: [
      { title: "Rotational Dynamics", titleAr: "ديناميكا الدوران", concepts: [
        { title: "Torque", difficulty: 4 },
        { title: "Angular Momentum", difficulty: 5 },
        { title: "Static Equilibrium", difficulty: 4 },
      ]},
      { title: "Fluid Mechanics", titleAr: "ميكانيكا السوائل", concepts: [
        { title: "Pressure", difficulty: 3 },
        { title: "Pascal's Principle", difficulty: 3 },
        { title: "Archimedes' Principle", difficulty: 3 },
        { title: "Continuity Equation", difficulty: 4 },
        { title: "Bernoulli Equation", difficulty: 4 },
      ]},
    ]
  },
];

// Curriculum structure for Circuits
export const CIRCUITS_CURRICULUM = [
  {
    moduleTitle: "Basic Concepts",
    moduleTitleAr: "المفاهيم الأساسية",
    topics: [
      { title: "Circuit Variables", titleAr: "متغيرات الدائرة", concepts: [
        { title: "Charge and Current", difficulty: 1 },
        { title: "Voltage", difficulty: 2 },
        { title: "Power and Energy", difficulty: 2 },
      ]},
      { title: "Basic Laws", titleAr: "القوانين الأساسية", concepts: [
        { title: "Ohm's Law", difficulty: 2 },
        { title: "Kirchhoff's Current Law (KCL)", difficulty: 3 },
        { title: "Kirchhoff's Voltage Law (KVL)", difficulty: 3 },
      ]},
    ]
  },
  {
    moduleTitle: "Circuit Analysis",
    moduleTitleAr: "تحليل الدوائر",
    topics: [
      { title: "Nodal and Mesh Analysis", titleAr: "التحليل العقدي والشبكي", concepts: [
        { title: "Nodal Analysis", difficulty: 4 },
        { title: "Mesh Analysis", difficulty: 4 },
        { title: "Superposition", difficulty: 4 },
      ]},
      { title: "Thevenin & Norton", titleAr: "ثيفنين و نورتون", concepts: [
        { title: "Thevenin's Theorem", difficulty: 5 },
        { title: "Norton's Theorem", difficulty: 5 },
        { title: "Maximum Power Transfer", difficulty: 5 },
      ]},
    ]
  },
  {
    moduleTitle: "Capacitors & Inductors",
    moduleTitleAr: "المكثفات والحدود",
    topics: [
      { title: "Energy Storage Elements", titleAr: "عناصر تخزين الطاقة", concepts: [
        { title: "Capacitors", difficulty: 3 },
        { title: "Inductors", difficulty: 3 },
        { title: "DC Steady State", difficulty: 4 },
        { title: "RC Circuits - Transient Response", difficulty: 4 },
        { title: "RL Circuits - Transient Response", difficulty: 4 },
      ]},
    ]
  },
];

// Curriculum structure for Python
export const PYTHON_CURRICULUM = [
  {
    moduleTitle: "Python Fundamentals",
    moduleTitleAr: "أساسيات بايثون",
    topics: [
      { title: "Getting Started", titleAr: "البداية", concepts: [
        { title: "Computer Architecture Basics", difficulty: 1 },
        { title: "Development Environment Setup", difficulty: 1 },
        { title: "VS Code Configuration", difficulty: 1 },
      ]},
      { title: "Variables & Types", titleAr: "المتغيرات والأنواع", concepts: [
        { title: "Variables and Assignment", difficulty: 1 },
        { title: "Data Types - int, float, str, bool", difficulty: 1 },
        { title: "Input and Output", difficulty: 2 },
        { title: "Mathematical Operations", difficulty: 1 },
        { title: "Strings and String Methods", difficulty: 2 },
      ]},
      { title: "Control Flow", titleAr: "التحكم في التدفق", concepts: [
        { title: "Conditional Statements - if/elif/else", difficulty: 2 },
        { title: "Loops - for and while", difficulty: 3 },
        { title: "Loop Control - break, continue", difficulty: 2 },
      ]},
      { title: "Functions", titleAr: "الدوال", concepts: [
        { title: "Defining Functions", difficulty: 3 },
        { title: "Parameters and Arguments", difficulty: 3 },
        { title: "Return Values", difficulty: 3 },
        { title: "Variable Scope", difficulty: 4 },
      ]},
    ]
  },
  {
    moduleTitle: "Data Structures",
    moduleTitleAr: "هياكل البيانات",
    topics: [
      { title: "Lists", titleAr: "القوائم", concepts: [
        { title: "Creating and Accessing Lists", difficulty: 2 },
        { title: "List Methods", difficulty: 3 },
        { title: "List Slicing", difficulty: 3 },
        { title: "Multidimensional Lists", difficulty: 4 },
      ]},
      { title: "Sets and Dictionaries", titleAr: "المجموعات والقواميس", concepts: [
        { title: "Sets", difficulty: 3 },
        { title: "Dictionaries", difficulty: 3 },
        { title: "Dictionary Methods", difficulty: 3 },
      ]},
      { title: "Files & Exceptions", titleAr: "الملفات والاستثناءات", concepts: [
        { title: "File Reading and Writing", difficulty: 4 },
        { title: "Exception Handling", difficulty: 4 },
      ]},
    ]
  },
  {
    moduleTitle: "Libraries",
    moduleTitleAr: "المكتبات",
    topics: [
      { title: "NumPy", titleAr: "نومبي", concepts: [
        { title: "NumPy Arrays", difficulty: 3 },
        { title: "Array Operations", difficulty: 3 },
        { title: "Mathematical Functions", difficulty: 3 },
      ]},
      { title: "Matplotlib", titleAr: "ماتبلوتليب", concepts: [
        { title: "Basic Plotting", difficulty: 3 },
        { title: "Customizing Plots", difficulty: 4 },
      ]},
      { title: "Data Analysis", titleAr: "تحليل البيانات", concepts: [
        { title: "Loading Datasets", difficulty: 3 },
        { title: "Data Cleaning", difficulty: 4 },
        { title: "Basic Statistics", difficulty: 3 },
      ]},
    ]
  },
];
