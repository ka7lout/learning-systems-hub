import {
  BookOpen,
  Brain,
  GraduationCap,
  Layers,
  Sparkles,
  Rocket,
  Code,
  Database,
  ChevronDown,
  ArrowRight,
  Zap,
  Target,
  Shield,
  Globe,
} from "lucide-react";

const projects = [
  {
    id: 1,
    slug: "ihls",
    title: "IHLS — Core Learning OS",
    description:
      "The original Ismaili Harvard Learning System with MongoDB. Curriculum graph, mastery engine, spaced review, project ladder, skill graph, career mapping, and AI mentor council.",
    tags: ["MongoDB", "AI Mentor", "Spaced Review"],
    tagClasses: ["tag-mongo", "tag-ai", "tag-drizzle"],
    icon: Brain,
    gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    url: process.env.NEXT_PUBLIC_IHLS_URL || "#",
  },
  {
    id: 2,
    slug: "ai-learning-os-v1",
    title: "AI Learning OS — Version 1",
    description:
      "First PostgreSQL-based iteration with Drizzle ORM. Login/signup authentication, curriculum viewer, and foundational learning dashboard.",
    tags: ["PostgreSQL", "Drizzle", "Auth"],
    tagClasses: ["tag-postgres", "tag-drizzle", "tag-auth"],
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    url: process.env.NEXT_PUBLIC_AI_LEARNING_OS_V1_URL || "#",
  },
  {
    id: 3,
    slug: "ai-learning-os-v2",
    title: "AI Learning OS — Version 2",
    description:
      "Refined learning platform with improved registration flow, user management, and curriculum organization with PostgreSQL backend.",
    tags: ["PostgreSQL", "Drizzle", "Auth"],
    tagClasses: ["tag-postgres", "tag-drizzle", "tag-auth"],
    icon: Layers,
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    url: process.env.NEXT_PUBLIC_AI_LEARNING_OS_V2_URL || "#",
  },
  {
    id: 4,
    slug: "ai-learning-os-v3",
    title: "AI Learning OS — Version 3",
    description:
      "Full-featured learning OS with career mapping, English lab, freelance simulation, research hypotheses, review scheduling, and curriculum dashboard.",
    tags: ["PostgreSQL", "AI Mentor", "Full Stack"],
    tagClasses: ["tag-postgres", "tag-ai", "tag-drizzle"],
    icon: Rocket,
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    url: process.env.NEXT_PUBLIC_AI_LEARNING_OS_V3_URL || "#",
  },
  {
    id: 5,
    slug: "ai-learning-geminiflash",
    title: "AI Learning — Gemini Flash",
    description:
      "Optimized variant using Gemini Flash model routing. Includes council system, dossiers, portfolio, practice engine, and research modules.",
    tags: ["PostgreSQL", "Gemini Flash", "AI Council"],
    tagClasses: ["tag-postgres", "tag-ai", "tag-drizzle"],
    icon: Zap,
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    url: process.env.NEXT_PUBLIC_AI_LEARNING_GEMINIFLASH_URL || "#",
  },
  {
    id: 6,
    slug: "ai-learning-spec-v1",
    title: "Learning Specification — V1",
    description:
      "Comprehensive specification build with mentor system, English lab, freelance simulator, portfolio engine, practice submissions, and project evidence ladder.",
    tags: ["PostgreSQL", "Full Spec", "Mentor"],
    tagClasses: ["tag-postgres", "tag-ai", "tag-drizzle"],
    icon: Target,
    gradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    url: process.env.NEXT_PUBLIC_AI_LEARNING_SPEC_V1_URL || "#",
  },
  {
    id: 7,
    slug: "ai-learning-spec-v3",
    title: "Learning Specification — V3",
    description:
      "Streamlined dashboard-first design with accessible responsive UI, reduced-motion support, and state-adaptive study controls (Deep/Drift/Fog/Overload).",
    tags: ["PostgreSQL", "Dashboard", "Accessible"],
    tagClasses: ["tag-postgres", "tag-drizzle", "tag-auth"],
    icon: Shield,
    gradient: "linear-gradient(135deg, #06b6d4, #10b981)",
    url: process.env.NEXT_PUBLIC_AI_LEARNING_SPEC_V3_URL || "#",
  },
  {
    id: 8,
    slug: "ai-learning-spec-v4",
    title: "Learning Specification — V4",
    description:
      "Canonical curriculum as prerequisite DAG with Harvard College/Extension mappings. 21-project catalog across 10 ladder levels, skill graph, and career engine.",
    tags: ["PostgreSQL", "Curriculum DAG", "Projects"],
    tagClasses: ["tag-postgres", "tag-ai", "tag-drizzle"],
    icon: GraduationCap,
    gradient: "linear-gradient(135deg, #f59e0b, #f43f5e)",
    url: process.env.NEXT_PUBLIC_AI_LEARNING_SPEC_V4_URL || "#",
  },
  {
    id: 9,
    slug: "ai-learning-spec-gpt6",
    title: "Specification — GPT6 Luna Max",
    description:
      "GPT-6 Luna Max variant with Better Auth integration, advanced session management, sign-in/sign-up flows, and enhanced curriculum seeding.",
    tags: ["PostgreSQL", "Better Auth", "GPT-6"],
    tagClasses: ["tag-postgres", "tag-auth", "tag-ai"],
    icon: Sparkles,
    gradient: "linear-gradient(135deg, #a855f7, #ec4899)",
    url: process.env.NEXT_PUBLIC_AI_LEARNING_SPEC_GPT6_URL || "#",
  },
  {
    id: 10,
    slug: "ai-engineering-optionb",
    title: "AI Engineering — Option B",
    description:
      "Alternative architecture with Better Auth, freelance simulation, mentor system, portfolio/CV engine, practice submissions, and research modules.",
    tags: ["PostgreSQL", "Better Auth", "Full Stack"],
    tagClasses: ["tag-postgres", "tag-auth", "tag-drizzle"],
    icon: Code,
    gradient: "linear-gradient(135deg, #3b82f6, #10b981)",
    url: process.env.NEXT_PUBLIC_AI_ENGINEERING_OPTIONB_URL || "#",
  },
  {
    id: 11,
    slug: "adaptive-study-v1",
    title: "Adaptive Study OS — V1",
    description:
      "Adaptive study platform with course management, lesson system, practice engine, progress tracking, review scheduling, and admin panel.",
    tags: ["PostgreSQL", "Adaptive", "Auth"],
    tagClasses: ["tag-postgres", "tag-drizzle", "tag-auth"],
    icon: Database,
    gradient: "linear-gradient(135deg, #14b8a6, #3b82f6)",
    url: process.env.NEXT_PUBLIC_ADAPTIVE_STUDY_V1_URL || "#",
  },
  {
    id: 12,
    slug: "adaptive-study-v2",
    title: "Adaptive Study OS — V2",
    description:
      "Enhanced adaptive study system with grouped app/auth route architecture, improved authentication flow, and database schema refinements.",
    tags: ["PostgreSQL", "Route Groups", "Auth"],
    tagClasses: ["tag-postgres", "tag-drizzle", "tag-auth"],
    icon: Globe,
    gradient: "linear-gradient(135deg, #e879f9, #3b82f6)",
    url: process.env.NEXT_PUBLIC_ADAPTIVE_STUDY_V2_URL || "#",
  },
];

export default function PortalPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <header className="header-glow max-w-6xl mx-auto text-center mb-16 pt-8">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
          <span className="status-dot" />
          <span className="text-sm text-[var(--text-secondary)] font-medium">
            All systems operational
          </span>
        </div>

        <h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-4 tracking-tight"
          style={{
            background: "linear-gradient(135deg, #f0f0f5 0%, #9090a0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Learning Systems
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Hub
          </span>
        </h1>

        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
          A curated collection of AI Engineering learning platforms.
          <br className="hidden sm:block" />
          Curriculum graphs, mastery engines, spaced review, and AI mentoring.
        </p>

        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="counter text-4xl">{projects.length}</div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1">
              Projects
            </div>
          </div>
          <div className="w-px h-12 bg-[var(--border-subtle)]" />
          <div className="text-center">
            <div className="counter text-4xl">3</div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1">
              Databases
            </div>
          </div>
          <div className="w-px h-12 bg-[var(--border-subtle)]" />
          <div className="text-center">
            <div className="counter text-4xl">∞</div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1">
              Learning
            </div>
          </div>
        </div>

        <div className="scroll-indicator flex justify-center">
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        </div>
      </header>

      {/* Projects Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="grid-container">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card block p-6 no-underline"
                id={`project-${project.slug}`}
              >
                <div className="card-accent" style={{ background: project.gradient }} />

                <div className="flex items-start gap-4 mb-4">
                  <div className="number-badge">{project.id}</div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: project.gradient }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-base font-bold text-[var(--text-primary)] leading-tight">
                      {project.title}
                    </h2>
                  </div>
                  <ArrowRight className="arrow-icon w-4 h-4 text-[var(--text-muted)] flex-shrink-0 mt-1" />
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 pl-[76px]">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 pl-[76px]">
                  {project.tags.map((tag, i) => (
                    <span key={tag} className={`tag ${project.tagClasses[i]}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-20 pb-8 text-center">
        <div className="border-t border-[var(--border-subtle)] pt-8">
          <p className="text-sm text-[var(--text-muted)]">
            Learning Systems Hub &middot; Built with Next.js &middot; Deployed on Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
