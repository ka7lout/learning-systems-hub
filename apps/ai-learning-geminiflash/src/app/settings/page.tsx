"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Sparkles,
  Globe,
  Briefcase,
  Shield,
  CheckCircle2,
  BrainCircuit,
  Save,
  Activity,
  Layers
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";
import { LearningState, STATE_CONFIGS } from "@/lib/learning-science/state-manager";

export default function SettingsPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [learningState, setLearningState] = useState<LearningState>("deep");
  const [englishMode, setEnglishMode] = useState<string>("standard_tech");
  const [targetRole, setTargetRole] = useState<string>("navisoft_ai_engineer");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setLearningState(data.user.statePreference || "deep");
          setEnglishMode(data.user.englishMode || "standard_tech");
          setTargetRole(data.user.targetRoleId || "navisoft_ai_engineer");
        }
      } catch (err) {
        console.error("Failed to load user preferences:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statePreference: learningState,
          englishMode,
          targetRoleId: targetRole
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenMentor={() => setIsMentorOpen(true)}
        activeState={learningState}
        onStateChange={(st) => setLearningState(st)}
      />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-semibold">
              OPERATING SYSTEM PREFERENCES
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Settings & Adaptive Learning Controls
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Configure your cognitive state pacing, Technical English modes, target job blueprint, and privacy settings.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* 1. Learning State Adaptive Pacing */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                State-Adaptive Cognitive Pacing
              </h3>
              <p className="text-xs text-slate-400">
                How does studying feel right now? The platform adapts task granularity, explanation density, and fading support to your current operational state.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(["deep", "drift", "fog", "overload"] as LearningState[]).map((st) => {
                  const isSelected = learningState === st;
                  const cfg = STATE_CONFIGS[st];
                  return (
                    <div
                      key={st}
                      onClick={() => setLearningState(st)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? "bg-slate-950 border-indigo-500 shadow-md shadow-indigo-600/10"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-xs">{cfg.displayName}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">&ldquo;{cfg.humanCue}&rdquo;</p>
                      <div className="text-[10px] text-indigo-300 font-mono pt-1">
                        Pacing: {cfg.taskChunkSize} chunks • {cfg.suggestedSessionDurationMinutes}m sessions
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. English & Language Mode */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                Technical English & Bilingual Support
              </h3>
              <p className="text-xs text-slate-400">
                Default site language is professional Technical English. Select auxiliary assistance modes:
              </p>

              <div className="space-y-3 pt-2 text-xs">
                {[
                  { id: "standard_tech", title: "Standard Technical English (Default)", desc: "Authentic professional terminology (encapsulation, idempotency, calibration, generalization)." },
                  { id: "b1_b2", title: "B1-B2 Plain English Mode", desc: "Simplified sentence structure while retaining canonical technical terminology." },
                  { id: "arabic_assisted", title: "Arabic Assisted Mode", desc: "Dual English-Arabic explanations with technical English terms preserved." },
                  { id: "training_mode", title: "Intensive English Training Mode", desc: "Interactive vocabulary drills, oral viva speaking defense, and pronunciation phonetics." }
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      englishMode === mode.id
                        ? "bg-slate-950 border-purple-500 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="englishMode"
                      value={mode.id}
                      checked={englishMode === mode.id}
                      onChange={(e) => setEnglishMode(e.target.value)}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-semibold text-white">{mode.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{mode.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Target Career Blueprint */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                Target AI Engineering Career Blueprint
              </h3>
              <p className="text-xs text-slate-400">
                Aligns skill gap recommendations and CV bullets to actual enterprise hiring standards:
              </p>

              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="navisoft_ai_engineer">Enterprise AI & ML Engineer (Navisoft Archetype - Classical ML, Imbalanced Risk, AWS, SQL)</option>
                <option value="nuwave_production_engineer">Production AI & Systems Engineer (Nuwave Archetype - LLMs, LoRA, GraphRAG, LangGraph Agents)</option>
                <option value="ml_systems_engineer">Machine Learning Systems Infrastructure (C Memory, CUDA, Distributed Training, TensorRT)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {isSaved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Operating System Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
