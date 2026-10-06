"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  MessageSquare,
  FileCheck2,
  DollarSign,
  Shield,
  Clock,
  Sparkles,
  Send,
  Award,
  BrainCircuit,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function FreelanceHubPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>("fintech-rag-assistant");
  const [proposalText, setProposalText] = useState<string>(`## Enterprise AI Consulting Proposal: Regulatory Knowledge-Base RAG

### 1. Executive Summary & Problem Understanding
The client requires a secure internal retrieval system for 120 compliance analysts to query 50,000 regulatory PDF filings.

### 2. Architectural Solution & Security Posture
- Deployment: AWS VPC containerized deployment (Zero third-party data retention).
- Retrieval: Hybrid Dense (Vector) + Sparse (BM25) search with Cross-Encoder reranking.
- Grounding: Strict XML citation attribution to eliminate hallucinations.

### 3. Phased Milestones & Acceptance Criteria
- Phase 1 (Weeks 1-2): Ingestion pipeline & POC benchmark on 1,000 documents (Target: >90% faithfulness).
- Phase 2 (Weeks 3-4): VPC deployment, authentication, and sub-500ms API latency validation.
- Phase 3 (Weeks 5-6): User acceptance testing (UAT) and analyst onboarding.

### 4. Pricing & Retainer
- Fixed Project Fee: $22,000 USD
- Ongoing Maintenance Retainer: $2,500/month for drift monitoring and updates.
`);
  const [proposalScore, setProposalScore] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadScenarios() {
      try {
        const res = await fetch("/api/freelance/simulate");
        const data = await res.json();
        if (data.success) {
          setScenarios(data.scenarios || []);
        }
      } catch (err) {
        console.error("Failed to load scenarios:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadScenarios();
  }, []);

  const handleEvaluateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalText.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/freelance/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioSlug: selectedScenario,
          proposalMarkdown: proposalText
        })
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setProposalScore(data.evaluation);
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const activeScenario = scenarios.find((s) => s.slug === selectedScenario) || scenarios[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              HIGH-VALUE AI FREELANCING & CONSULTING ENGINE
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Enterprise Freelance & Consulting Hub
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Master the entire client consulting lifecycle: client discovery, uncovering hidden security constraints, scoping de-risked milestones, and drafting winning technical proposals.
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((sc) => {
              const isSelected = sc.slug === selectedScenario;
              return (
                <div
                  key={sc.slug}
                  onClick={() => setSelectedScenario(sc.slug)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-600/10"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-semibold text-white">{sc.clientName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{sc.clientRole}</span>
                  </div>
                  <h4 className="font-medium text-indigo-300 text-sm mt-2">{sc.companyType}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.initialBrief}</p>
                </div>
              );
            })}
          </div>

          {activeScenario && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Hidden Constraints & Discovery Guide */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <h3 className="font-semibold text-white text-base flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    Client Hidden Constraints & Boundaries
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-semibold text-slate-400">Budget Range:</span>
                      <p className="text-emerald-400 font-mono font-bold">{activeScenario.hiddenConstraints?.budgetRange}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-semibold text-slate-400">Timeline Expectation:</span>
                      <p className="text-slate-200">{activeScenario.hiddenConstraints?.timelineWeeks} Weeks</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-semibold text-slate-400">Security & VPC Requirement:</span>
                      <p className="text-slate-200 leading-relaxed">{activeScenario.hiddenConstraints?.securityRequirement}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-semibold text-slate-400">Data Volume & Frequency:</span>
                      <p className="text-slate-200 leading-relaxed">{activeScenario.hiddenConstraints?.dataVolume}</p>
                    </div>
                  </div>
                </div>

                {/* Evaluation Criteria Checklist */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                  <h3 className="font-semibold text-white text-sm">Winning Proposal Rubric</h3>
                  <div className="space-y-2 text-xs">
                    {activeScenario.evaluationCriteria?.map((crit: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Statement of Work & Proposal Builder */}
              <div className="space-y-6">
                <form onSubmit={handleEvaluateProposal} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-semibold text-white text-base">Statement of Work (SOW) Proposal</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                      Markdown SOW
                    </span>
                  </div>

                  <textarea
                    rows={14}
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-indigo-200 focus:outline-hidden focus:border-indigo-500 shadow-inner"
                  />

                  <button
                    type="submit"
                    disabled={!proposalText.trim() || isEvaluating}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isEvaluating ? "Evaluating Proposal..." : "Submit to Freelance Coach Sarah"}</span>
                  </button>
                </form>

                {proposalScore && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3 text-xs shadow-lg animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-semibold text-emerald-400">Coach Sarah&apos;s Proposal Score</span>
                      <span className="text-lg font-bold text-white font-mono">{proposalScore.score}/100</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{proposalScore.feedback}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 space-y-1">
                        <span className="font-bold">Key Strengths:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {proposalScore.strengths?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300 space-y-1">
                        <span className="font-bold">Areas to Strengthen:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {proposalScore.weaknesses?.map((w: string, idx: number) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
