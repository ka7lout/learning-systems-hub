"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  BookOpen,
  Shield,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function ResearchDossiersPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [activeDossier, setActiveDossier] = useState<"harvard" | "ihls" | "career" | "security">("harvard");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-semibold">
              ACADEMIC RESEARCH & VERIFICATION DOSSIERS
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Research & Verification Dossiers
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Full transparency and academic rigor. Inspect the official Harvard SEAS / College reality report, empirical learning science foundations, and multi-tenant security architecture.
            </p>
          </div>

          {/* Dossier Tabs */}
          <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs pb-px">
            <button
              onClick={() => setActiveDossier("harvard")}
              className={`px-4 py-2.5 font-medium border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeDossier === "harvard"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Harvard Reality Report</span>
            </button>

            <button
              onClick={() => setActiveDossier("ihls")}
              className={`px-4 py-2.5 font-medium border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeDossier === "ihls"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Learning Science Foundations (IHLS)</span>
            </button>

            <button
              onClick={() => setActiveDossier("career")}
              className={`px-4 py-2.5 font-medium border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeDossier === "career"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>AI Engineering Market Architecture</span>
            </button>

            <button
              onClick={() => setActiveDossier("security")}
              className={`px-4 py-2.5 font-medium border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeDossier === "security"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security & Multi-Tenant Isolation</span>
            </button>
          </div>

          {/* Dossier Body */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed shadow-xl">
            {activeDossier === "harvard" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white">Harvard College & Extension Official Verification</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    Status: Verified Spring 2026
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-amber-300 uppercase tracking-wider">Crucial Fact Check:</span>
                  <p>
                    Harvard College does NOT confer an undergraduate degree titled &ldquo;Artificial Intelligence Engineering&rdquo;. Harvard College awards degrees in <strong>Computer Science</strong> and <strong>Engineering Sciences (ECE track)</strong> through SEAS. Harvard Extension School offers the Graduate Certificate in Artificial Intelligence and the Master of Liberal Arts (ALM) in Data Science & Artificial Intelligence.
                  </p>
                </div>

                <h4 className="font-bold text-white text-sm pt-2">Course Sequence Mapped into Master Curriculum:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li><strong>CS50:</strong> Introduction to Computer Science (C memory model, pointers, data structures, algorithms).</li>
                  <li><strong>CS61:</strong> Systems Programming & Machine Organization (assembly, cache locality, memory hierarchy).</li>
                  <li><strong>CS1240:</strong> Data Structures & Algorithms (asymptotic analysis, dynamic programming, graphs).</li>
                  <li><strong>STAT 110:</strong> Introduction to Probability (Prof. Joe Blitzstein, conditioning, Markov chains).</li>
                  <li><strong>CS1810 / CS181:</strong> Machine Learning (probabilistic modeling, kernel methods, Bayesian inference).</li>
                  <li><strong>CSCI E-89 / E-222:</strong> Harvard Extension Graduate Deep Learning & Large Language Models.</li>
                </ul>
              </div>
            )}

            {activeDossier === "ihls" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white">Ismaili Harvard Learning Science (IHLS) Framework</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                    Empirical Pacing Model
                  </span>
                </div>

                <p className="text-xs">
                  IHLS integrates evidence-based cognitive psychology with high-intensity active engineering practice.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-indigo-300">1. State-Adaptive Cognitive Pacing</span>
                    <p className="text-slate-400 leading-relaxed">
                      Adapts cognitive load across Deep Focus, Drifting, Low Energy Fog, and High Overload without making clinical medical diagnoses.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-indigo-300">2. Mandatory Socratic Attempt Rule</span>
                    <p className="text-slate-400 leading-relaxed">
                      Requires initial student attempt before revealing AI hints, preventing cognitive dependency and passive solution memorization.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-indigo-300">3. Hand-Written Notebook Contract</span>
                    <p className="text-slate-400 leading-relaxed">
                      Mandates hand-writing core mental models and invariants (MUST WRITE) while preventing transcript copying.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-indigo-300">4. SuperMemo-2 Spaced Retrieval</span>
                    <p className="text-slate-400 leading-relaxed">
                      Calculates optimal recall intervals factoring in delayed transfer performance and response ease calibration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeDossier === "career" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">AI Engineering Job Market Blueprints</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The curriculum targets two distinct industry archetypes:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-300">Navisoft-Style Enterprise AI Engineer:</span>
                    <p className="text-slate-400">
                      Focuses on classical and deep machine learning, feature engineering, imbalanced tabular risk modeling (XGBoost, CatBoost), SQL data pipelines, and AWS Docker deployments.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-purple-300">Nuwave-Style Production Systems Engineer:</span>
                    <p className="text-slate-400">
                      Focuses on modern foundation models, LoRA fine-tuning, Hybrid RAG / GraphRAG, vector databases (Pinecone, Chroma), LangGraph autonomous multi-agent orchestration, and strict observability.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeDossier === "security" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Multi-Tenant Isolation & OWASP Architecture</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400">Server-Derived User Scoping:</span>
                    <p className="text-slate-400">
                      Every database query enforces a server-derived \`ownerId\` extracted from cryptographically signed session tokens. Client-supplied user identifiers are completely ignored to eliminate Broken Object-Level Authorization (BOLA).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400">LLM Prompt Injection Defense:</span>
                    <p className="text-slate-400">
                      All untrusted documents and user-provided code are enclosed inside strict \`&lt;untrusted_content&gt;\` boundaries and governed by immutable system policies.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
