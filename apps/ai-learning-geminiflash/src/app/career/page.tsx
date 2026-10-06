"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Copy,
  Check,
  Award,
  Sparkles,
  ExternalLink,
  Layers,
  BrainCircuit
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function CareerHubPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("role-navisoft-ai-eng");
  const [analysis, setAnalysis] = useState<any>(null);
  const [cvBullets, setCvBullets] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCareerData() {
      try {
        const [gapRes, cvRes] = await Promise.all([
          fetch(`/api/career/gap-analysis?roleId=${selectedRole}`),
          fetch("/api/career/cv-bullets")
        ]);

        if (gapRes.ok) {
          const gapData = await gapRes.json();
          if (gapData.success) {
            setAnalysis(gapData.analysis);
            setAvailableRoles(gapData.availableRoles || []);
          }
        }

        if (cvRes.ok) {
          const cvData = await cvRes.json();
          if (cvData.success) {
            setCvBullets(cvData.bullets || []);
          }
        }
      } catch (err) {
        console.error("Failed to load career data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCareerData();
  }, [selectedRole]);

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono font-semibold">
                EVIDENCE-DRIVEN CAREER & CV ENGINE
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                AI Engineering Career Readiness Hub
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Map your demonstrated project artifacts against verified enterprise job blueprints (Navisoft AI Engineer & Nuwave Production Engineer).
              </p>
            </div>

            {/* Target Role Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">Target Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
              >
                {availableRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 Cols): Skill Gap Radar & Action Plan */}
              <div className="lg:col-span-2 space-y-6">
                {/* Readiness Score Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="font-semibold text-white text-base">{analysis.role?.title}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Seniority: {analysis.role?.seniority}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-400 font-mono">
                        {analysis.readinessPercentage}%
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Readiness Match
                      </div>
                    </div>
                  </div>

                  {/* Matched vs Missing Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Demonstrated Skills */}
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                      <span className="text-xs font-bold text-emerald-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Demonstrated Competencies ({analysis.matchedRequiredSkills.length}):
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {analysis.matchedRequiredSkills.map((sk: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-slate-200 p-1.5 rounded bg-slate-950/40">
                            <span>{sk.name}</span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">L{sk.masteryLevel}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skill Gaps */}
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-3">
                      <span className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        High-Priority Gaps ({analysis.missingRequiredSkills.length}):
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {analysis.missingRequiredSkills.map((sk: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-slate-300 p-1.5 rounded bg-slate-950/40">
                            <span className="truncate max-w-[160px]">{sk.name}</span>
                            <Link
                              href={`/learn/${sk.recommendedNodeId}`}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline"
                            >
                              Close Gap &rarr;
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Next Strategic Actions */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                      Recommended Next Actions for Role Readiness:
                    </span>
                    <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                      {analysis.recommendedNextActions.map((act: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Evidence-Backed CV Generator */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h3 className="font-semibold text-white text-base">Verified CV Bullet Generator</h3>
                        <p className="text-xs text-slate-400">
                          Strictly tied to your verified GitHub repositories and metrics (Zero Hallucinated Experience).
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Truth-Bound
                    </span>
                  </div>

                  <div className="space-y-3">
                    {cvBullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-slate-200 leading-relaxed font-sans">{bullet.bulletText}</p>
                          <button
                            onClick={() => handleCopyBullet(bullet.bulletText, idx)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
                            title="Copy CV Bullet"
                          >
                            {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] text-slate-500 font-mono">
                          <span>Verified Evidence: {bullet.evidenceSource}</span>
                          <span className="text-indigo-400">{bullet.metricsClaimed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Typical Tasks & Interview Domains */}
              <div className="space-y-6">
                {/* Typical Tasks */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                  <h3 className="font-semibold text-white text-sm">Typical Role Responsibilities</h3>
                  <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                    {analysis.role?.typicalTasks.map((t: string, i: number) => (
                      <li key={i} className="leading-relaxed">{t}</li>
                    ))}
                  </ul>
                </div>

                {/* Interview Domains */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                  <h3 className="font-semibold text-white text-sm">Key Interview Evaluation Domains</h3>
                  <div className="space-y-2 text-xs">
                    {analysis.role?.interviewDomains.map((dom: string, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                        <span>{dom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
