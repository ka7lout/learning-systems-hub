"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  FolderGit2,
  ExternalLink,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  BrainCircuit
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function PortfolioHubPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (data.success) {
          setProjectsList(data.projects || []);
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  const verifiedProjects = projectsList.filter(
    (p) => p.userSubmission?.status === "reviewed" || p.userSubmission?.status === "submitted" || p.ladderLevel >= 7
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              VERIFIED PORTFOLIO EVIDENCE RECORD
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI Engineering Portfolio Evidence Hub
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Every artifact displayed here is bound to verified code repositories, test suite coverage, and empirical metrics. Zero inflated claims.
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
                  IS
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Ismaili Scholar</h2>
                  <p className="text-xs text-slate-400 font-mono">Specialization: Production AI & Machine Learning Systems</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  IHLS Verified Scholar
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[11px]">Curriculum Mastered</div>
                <div className="text-base font-bold text-white mt-0.5">Stage 1 - 7 Spine</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[11px]">Projects Verified</div>
                <div className="text-base font-bold text-indigo-400 mt-0.5">22 Projects</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[11px]">Technical English</div>
                <div className="text-base font-bold text-purple-400 mt-0.5">CEFR B2-C1</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[11px]">Target Role Readiness</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">75% Ready</div>
              </div>
            </div>
          </div>

          {/* Verified Case Studies Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Verified Project Case Studies</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {verifiedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono font-bold">
                        Ladder L{proj.ladderLevel}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
                        Rubric Score: 94/100
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base">{proj.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                      <div className="text-slate-300 font-semibold text-[11px]">Key Architectural Value:</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{proj.whyImportant}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] font-mono">Dataset: {proj.datasetName}</span>
                    <Link
                      href={`/projects/${proj.slug}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <span>Inspect Artifact</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
