"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";
import { CANONICAL_SKILLS } from "@/data/skills";
import { MASTERY_PYRAMID } from "@/lib/learning-science/mastery-evaluator";

export default function SkillsMatrixPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredSkills = CANONICAL_SKILLS.filter(
    (s) => selectedCategory === "all" || s.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-semibold">
              COMPETENCY GRAPH & MASTERY PYRAMID
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Skill Taxonomy & Competency Hierarchy
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Every skill is mapped to verifiable evidence: problem set scores, code debugging, novel transfer tasks, and deployed portfolio repositories.
            </p>
          </div>

          {/* Mastery Pyramid Visual Guide */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              The 10-Level Mastery Pyramid (L0 to L9)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              IHLS does not use simplistic &ldquo;completed&rdquo; badges. Competence is classified across 10 progressive tiers:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {MASTERY_PYRAMID.map((lvl) => (
                <div
                  key={lvl.level}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">{lvl.code}</span>
                    <span className="text-[10px] text-slate-500">Tier {lvl.level}</span>
                  </div>
                  <h4 className="font-semibold text-white text-xs">{lvl.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-normal">{lvl.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-medium mr-1">Category:</span>
            {[
              { id: "all", label: "All Skills" },
              { id: "programming", label: "Programming & CS" },
              { id: "mathematics", label: "Mathematics & Stats" },
              { id: "data_engineering", label: "Data Engineering" },
              { id: "machine_learning", label: "Machine Learning" },
              { id: "deep_learning", label: "Deep Learning" },
              { id: "modern_genai", label: "Modern GenAI" },
              { id: "mlops_cloud", label: "MLOps & Cloud" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((sk) => (
              <div
                key={sk.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono uppercase font-bold">
                      {sk.category.replace("_", " ")}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                      {sk.level}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm">{sk.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sk.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Prereqs: {sk.prerequisites.length || "None"}</span>
                  <span className="text-indigo-400">Mapped to {sk.careerRoles.length} Roles</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
