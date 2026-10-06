"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  ArrowRight,
  RotateCw,
  FolderGit2,
  Briefcase,
  CheckCircle2,
  Clock,
  Layers,
  BrainCircuit,
  Flame,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Target,
  Zap,
  TrendingUp
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";
import { LearningState, STATE_CONFIGS, recommendNextStepForState } from "@/lib/learning-science/state-manager";

export default function DashboardPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [learningState, setLearningState] = useState<LearningState>("deep");
  const [nextTask, setNextTask] = useState<any>(null);
  const [dueReviewsCount, setDueReviewsCount] = useState<number>(1);
  const [curriculumStats, setCurriculumStats] = useState({ totalNodes: 37, masteredNodes: 4, inProgress: 2 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [taskRes, reviewRes, currRes] = await Promise.all([
          fetch("/api/tasks/next"),
          fetch("/api/review/due"),
          fetch("/api/curriculum")
        ]);

        if (taskRes.ok) {
          const taskData = await taskRes.json();
          if (taskData.success) {
            setNextTask(taskData.nextTask);
            if (taskData.userState) setLearningState(taskData.userState);
          }
        }

        if (reviewRes.ok) {
          const revData = await reviewRes.json();
          if (revData.success) {
            setDueReviewsCount(revData.dueCount || 0);
          }
        }

        if (currRes.ok) {
          const currData = await currRes.json();
          if (currData.success && currData.nodes) {
            const nodes = currData.nodes;
            const mastered = nodes.filter((n: any) => n.userProgress?.status === "mastered" || n.userProgress?.masteryLevel >= 6).length;
            const inProg = nodes.filter((n: any) => n.userProgress?.status === "in_progress").length;
            setCurriculumStats({
              totalNodes: nodes.length,
              masteredNodes: mastered,
              inProgress: inProg
            });
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const stateConfig = STATE_CONFIGS[learningState] || STATE_CONFIGS.deep;
  const stateAdvice = recommendNextStepForState(learningState, "general");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenMentor={() => setIsMentorOpen(true)}
        activeState={learningState}
        onStateChange={(st) => setLearningState(st)}
      />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
          {/* Top Banner: What Should I Do Now? */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> PRIMARY ACTION NOW
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    IHLS State: <strong className="text-white">{stateConfig.displayName}</strong>
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                  {nextTask?.title || "Python Fundamentals & Early Stopping Challenge"}
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {nextTask?.description || "Work through the next pedagogical learning block: write and verify the early stopping loop transfer challenge."}
                </p>

                {/* Why this task */}
                <div className="pt-2 flex items-start gap-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-indigo-300">Why this task: </span>
                    {nextTask?.reasonExplanation || "Required prerequisite for building robust PyTorch training loops, preventing data leakage, and training sequential deep learning models."}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  href={nextTask?.nodeId ? `/learn/${nextTask.nodeId}` : "/learn/m1-s1-fundamentals"}
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:gap-3"
                >
                  <span>Start Learning Task</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setIsMentorOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4 text-indigo-400" />
                  <span>Consult Mentor First</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Spaced Review Due */}
            <Link
              href="/review"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Spaced Reviews</span>
                <RotateCw className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{dueReviewsCount}</span>
                <span className="text-xs text-amber-400 font-medium">Ready for recall</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">SuperMemo-2 retention schedule</p>
            </Link>

            {/* Curriculum Progress */}
            <Link
              href="/curriculum"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curriculum Mastery</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{curriculumStats.masteredNodes}</span>
                <span className="text-xs text-slate-400">/ {curriculumStats.totalNodes} Nodes Mastered</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((curriculumStats.masteredNodes / curriculumStats.totalNodes) * 100)}%` }}
                />
              </div>
            </Link>

            {/* 21+ Project Catalog Status */}
            <Link
              href="/projects"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Catalog</span>
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">22</span>
                <span className="text-xs text-emerald-400 font-medium">Original 21+ Flagship</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">GitHub Verified Evidence Ladder</p>
            </Link>

            {/* Target Role Readiness */}
            <Link
              href="/career"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navisoft / Nuwave Role</span>
                <Briefcase className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">75%</span>
                <span className="text-xs text-purple-400 font-medium">Readiness Match</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Based on verified project commits</p>
            </Link>
          </div>

          {/* Educational State & Pacing Advice */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">State-Adaptive Learning Protocol</h4>
                <p className="text-xs text-slate-400 mt-0.5">{stateAdvice.instruction}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 italic font-mono">{stateAdvice.pacingAdvice}</span>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Master Curriculum Stages */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-base">Curriculum Progression Spine</h3>
                <Link href="/curriculum" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                  <span>Explore Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    stage: "Stage 1",
                    title: "Mathematical Foundations & Statistics",
                    desc: "Linear Algebra, Multivariable Calculus, STAT 110 Probability & Convex Optimization",
                    status: "in_progress",
                    progress: 70,
                    source: "Original + Harvard Math"
                  },
                  {
                    stage: "Stage 2",
                    title: "Computer Science & Python Engineering",
                    desc: "Python Fundamentals, OOP, C Memory Model, Valgrind, and Data Structures",
                    status: "in_progress",
                    progress: 60,
                    source: "Original + Harvard CS50/CS61"
                  },
                  {
                    stage: "Stage 3",
                    title: "Data Systems & Data Engineering",
                    desc: "NumPy, Pandas Wrangling, PostgreSQL Schema, Window Functions, Airflow & Spark",
                    status: "available",
                    progress: 30,
                    source: "Original + Extension Data Eng"
                  },
                  {
                    stage: "Stage 4",
                    title: "Classical Machine Learning",
                    desc: "Scikit-Learn, Regression, SVM, Decision Trees, XGBoost, CatBoost & Model Cards",
                    status: "available",
                    progress: 10,
                    source: "Original + Harvard CS1810"
                  },
                  {
                    stage: "Stage 5",
                    title: "Deep Learning & Vision",
                    desc: "ANNs, PyTorch, Backprop, ResNet Transfer Learning, YOLOv8 & OpenCV",
                    status: "available",
                    progress: 0,
                    source: "Original + CSCI E-89"
                  },
                  {
                    stage: "Stage 6",
                    title: "Modern AI, Transformers, RAG & Agents",
                    desc: "Scaled Dot-Product Attention, LoRA, Vector Databases, GraphRAG & LangGraph Agents",
                    status: "available",
                    progress: 0,
                    source: "Original + CSCI E-222"
                  },
                  {
                    stage: "Stage 7",
                    title: "Production MLOps & Scalable Systems",
                    desc: "FastAPI REST microservices, Docker Compose, CI/CD Actions & Evidently Drift Monitoring",
                    status: "available",
                    progress: 0,
                    source: "Original + APCOMP 215"
                  }
                ].map((st, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                          {st.stage}
                        </span>
                        <h4 className="font-medium text-white text-sm">{st.title}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {st.source}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{st.desc}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${st.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-8 text-right">{st.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (1 Col): Verified Project Spotlight & Quick Viva */}
            <div className="space-y-6">
              {/* Flagship Project Spotlight */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    Flagship Project Spotlight
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-medium border border-emerald-500/20">
                    Ladder L8
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-base">Production RAG System</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Vector search, hybrid BM25 retrieval, cross-encoder reranking, and Ragas faithfulness evaluation.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Dataset: Technical Docs</span>
                  <Link
                    href="/projects/production-rag-system"
                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <span>View Spec</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Oral Defense Viva Quick Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    Speaking Lab (Oral Viva)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono font-medium">
                    Technical English
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Practice oral technical defenses using browser voice recognition. Speak your explanation of memory allocation or backpropagation.
                </p>

                <Link
                  href="/practice"
                  className="w-full py-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-800/60 text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Launch Practice Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Research Dossier Quick Link */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/70 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Harvard Reality & Research Dossiers</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Inspect the official Harvard verification pass, learning science empirical citations, and OWASP multi-tenant security architecture.
                </p>
                <div className="pt-1">
                  <Link href="/dossiers" className="text-amber-400 hover:text-amber-300 font-medium">
                    Read Research Dossiers &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Global Mentor Council Drawer */}
      <MentorDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        currentNodeTitle={nextTask?.title}
      />
    </div>
  );
}
