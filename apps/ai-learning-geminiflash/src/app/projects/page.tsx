"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Filter,
  Search,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  Star
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function ProjectsCatalogPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (data.success) {
          setProjectsList(data.projects || []);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filteredProjects = projectsList.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || String(p.ladderLevel) === selectedLevel;
    const matchesSearch = searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.datasetName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const getEvidenceBadge = (level: string) => {
    switch (level) {
      case "signature_project":
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">Signature Artifact</span>;
      case "professional_evidence":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">Deployed Evidence</span>;
      case "portfolio_project":
        return <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">Portfolio Verified</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">Not Submitted</span>;
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
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
                ORIGINAL 21+ PROJECT CATALOG & FLAGSHIPS
              </span>
              <span className="text-xs text-slate-400">• Evidence Ladder 1–10</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Verified AI Engineering Project Catalog
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Every project is an evidence-backed portfolio artifact. Submit public GitHub repositories, verified test suites, live deployment URLs, and Model Cards to advance your CV evidence ladder.
            </p>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, datasets..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs w-full lg:w-auto">
              <span className="text-slate-500 text-[11px] font-medium mr-1">Domain:</span>
              {[
                { id: "all", label: "All Domains" },
                { id: "computer_vision", label: "Computer Vision" },
                { id: "nlp_llm", label: "NLP & LLMs" },
                { id: "tabular_ml", label: "Tabular ML & Risk" },
                { id: "data_engineering", label: "Data Engineering" },
                { id: "production_systems", label: "Production Systems" }
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
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((proj) => {
              const sub = proj.userSubmission;
              const isReviewed = sub?.status === "reviewed" || sub?.status === "submitted";

              return (
                <div
                  key={proj.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-indigo-300 font-mono font-bold">
                          Level {proj.ladderLevel}/10
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                          {proj.category.replace("_", " ")}
                        </span>
                      </div>
                      {getEvidenceBadge(sub?.evidenceLevel || "practice")}
                    </div>

                    <div>
                      <h3 className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {proj.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">Dataset:</span>
                        <span className="text-indigo-300 font-mono text-[11px] truncate max-w-[200px]">
                          {proj.datasetName || "Public Benchmark"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">License:</span>
                        <span className="text-slate-400">{proj.datasetLicense || "Open Dataset"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {proj.requirements ? `${proj.requirements.length} Core Requirements` : ""}
                    </span>

                    <Link
                      href={`/projects/${proj.slug}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>{isReviewed ? "View Submission" : "Open Brief & Submit"}</span>
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
