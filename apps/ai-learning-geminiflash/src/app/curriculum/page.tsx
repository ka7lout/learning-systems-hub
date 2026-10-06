"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Network,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
  Layers,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  Award
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function CurriculumPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCurriculum() {
      try {
        const res = await fetch("/api/curriculum");
        const data = await res.json();
        if (data.success) {
          setNodes(data.nodes || []);
          setStages(data.stages || []);
        }
      } catch (err) {
        console.error("Failed to load curriculum:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCurriculum();
  }, []);

  const filteredNodes = nodes.filter((n) => {
    const matchesSource = selectedSource === "all" || n.sourceCategory === selectedSource;
    const matchesStage = selectedStage === "all" || n.stage === selectedStage;
    const matchesSearch = searchQuery === "" || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.whyItMatters.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.skills && (n.skills as string[]).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSource && matchesStage && matchesSearch;
  });

  const getSourceBadge = (cat: string) => {
    switch (cat) {
      case "original_curriculum":
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">Original Module</span>;
      case "harvard_college":
        return <span className="px-2 py-0.5 rounded bg-crimson-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono">Harvard College</span>;
      case "harvard_extension":
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono">Harvard Extension</span>;
      case "industry_extension":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">Industry Practical</span>;
      case "research_extension":
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">Research Layer</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-semibold">
                PREREQUISITE DIRECTED ACYCLIC GRAPH (DAG)
              </span>
              <span className="text-xs text-slate-400">• 100% Modules 1-8 Preserved</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Master AI Engineering Curriculum
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Every node connects rigorous foundational Computer Science and Mathematics with enterprise Machine Learning, Deep Learning, Modern LLMs/RAG, and production MLOps systems.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, formulas, skills..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Source Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs w-full md:w-auto">
              <span className="text-slate-500 text-[11px] font-medium mr-1">Source:</span>
              {[
                { id: "all", label: "All Sources" },
                { id: "original_curriculum", label: "Original Curriculum" },
                { id: "harvard_college", label: "Harvard College" },
                { id: "harvard_extension", label: "Harvard Extension" },
                { id: "industry_extension", label: "Industry Practical" }
              ].map((src) => (
                <button
                  key={src.id}
                  onClick={() => setSelectedSource(src.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedSource === src.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>

          {/* Curriculum Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNodes.map((node) => {
              const mastery = node.userProgress?.masteryLevel || 0;
              const isMastered = node.userProgress?.status === "mastered" || mastery >= 6;
              const inProg = node.userProgress?.status === "in_progress";

              return (
                <div
                  key={node.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {node.moduleNumber ? (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
                            Module {node.moduleNumber}.{node.sessionIndex || 1}
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                            Core Addition
                          </span>
                        )}
                        {getSourceBadge(node.sourceCategory)}
                      </div>

                      {/* Mastery Pill */}
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        isMastered
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : inProg
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        Level L{mastery}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors">
                        {node.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {node.whyItMatters}
                      </p>
                    </div>

                    {/* Skills Chips */}
                    {node.skills && (node.skills as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(node.skills as string[]).slice(0, 4).map((sk: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-mono"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer & Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {node.prerequisites && (node.prerequisites as string[]).length > 0
                        ? `Prereqs: ${(node.prerequisites as string[]).length} required`
                        : "Foundational entry node"}
                    </span>

                    <Link
                      href={`/learn/${node.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium flex items-center gap-1.5 transition-all"
                    >
                      <span>Study Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
