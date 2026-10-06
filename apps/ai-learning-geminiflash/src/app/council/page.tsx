"use client";

import React, { useState } from "react";
import {
  Compass,
  HelpCircle,
  Code2,
  Award,
  Layers,
  Briefcase,
  TrendingUp,
  Globe2,
  Activity,
  BookOpen,
  ShieldCheck,
  FileText,
  BrainCircuit,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";
import { MENTOR_COUNCIL } from "@/lib/ai/personas";

export default function MentorCouncilChamberPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState("lead_mentor");

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case "HelpCircle": return <HelpCircle className="w-5 h-5 text-indigo-400" />;
      case "Code2": return <Code2 className="w-5 h-5 text-emerald-400" />;
      case "Award": return <Award className="w-5 h-5 text-amber-400" />;
      case "Layers": return <Layers className="w-5 h-5 text-purple-400" />;
      case "Briefcase": return <Briefcase className="w-5 h-5 text-blue-400" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case "Globe2": return <Globe2 className="w-5 h-5 text-cyan-400" />;
      case "Activity": return <Activity className="w-5 h-5 text-rose-400" />;
      case "BookOpen": return <BookOpen className="w-5 h-5 text-indigo-400" />;
      case "ShieldCheck": return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case "FileText": return <FileText className="w-5 h-5 text-amber-400" />;
      default: return <Compass className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-semibold">
              12 SPECIALIST ADVISORS • ACTIVE MENTORING COUNCIL
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI Mentor Council Chamber
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Dr. Ismaili coordinates with 11 domain specialists. Engage directly with Socratic tutors, staff code reviewers, master examiners, career strategists, and research scientists.
            </p>
          </div>

          {/* Advisors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(MENTOR_COUNCIL).map((spec) => (
              <div
                key={spec.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      {getPersonaIcon(spec.iconName)}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      spec.defaultModelTier === "pro"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}>
                      {spec.defaultModelTier === "pro" ? "DeepSeek V4 Pro" : "Flash Tier"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors">
                      {spec.name}
                    </h3>
                    <p className="text-xs text-indigo-400 font-mono mt-0.5">{spec.title}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{spec.domain}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setSelectedPersonaId(spec.id);
                      setIsMentorOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Consult {spec.name.split(" ")[0]}</span>
                  </button>
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
