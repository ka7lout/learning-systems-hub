"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  Zap,
  Globe,
  PlusCircle,
  Check,
  BrainCircuit,
  MessageSquare,
  Shield,
  Layers,
  BookMarked
} from "lucide-react";
import { LearningState, STATE_CONFIGS } from "@/lib/learning-science/state-manager";

interface NavbarProps {
  onOpenMentor: () => void;
  activeState?: LearningState;
  onStateChange?: (state: LearningState) => void;
}

export function Navbar({ onOpenMentor, activeState = "deep", onStateChange }: NavbarProps) {
  const [currentState, setCurrentState] = useState<LearningState>(activeState);
  const [englishMode, setEnglishMode] = useState<string>("standard_tech");
  const [showLaterModal, setShowLaterModal] = useState(false);
  const [laterTitle, setLaterTitle] = useState("");
  const [laterSaved, setLaterSaved] = useState(false);

  const handleStateSelect = async (state: LearningState) => {
    setCurrentState(state);
    if (onStateChange) onStateChange(state);

    try {
      await fetch("/api/auth/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statePreference: state })
      });
    } catch (err) {
      console.error("Failed to persist state preference:", err);
    }
  };

  const handleSaveLater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laterTitle.trim()) return;

    try {
      await fetch("/api/tasks/later", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: laterTitle })
      });
      setLaterSaved(true);
      setTimeout(() => {
        setLaterTitle("");
        setLaterSaved(false);
        setShowLaterModal(false);
      }, 1200);
    } catch (err) {
      console.error("Failed to save later item:", err);
    }
  };

  const stateConfig = STATE_CONFIGS[currentState] || STATE_CONFIGS.deep;

  const getStateColor = (s: LearningState) => {
    switch (s) {
      case "deep": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "drift": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "fog": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "overload": return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between text-slate-100">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">ISMAILI HARVARD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono font-medium">
                  AI OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Learning Science & Engineering System</p>
            </div>
          </Link>
        </div>

        {/* Center: State-Adaptive Mode Selector */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <span className="text-slate-500 text-[11px] px-2 font-medium">Study State:</span>
          {(["deep", "drift", "fog", "overload"] as LearningState[]).map((st) => {
            const isSelected = currentState === st;
            return (
              <button
                key={st}
                onClick={() => handleStateSelect(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={STATE_CONFIGS[st].humanCue}
              >
                {st === "deep" && "⚡ Focused"}
                {st === "drift" && "🍃 Drifting"}
                {st === "fog" && "🌫️ Low Energy"}
                {st === "overload" && "🛑 Overload"}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Distraction Capture "Later" */}
          <button
            onClick={() => setShowLaterModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            title="Distraction Capture (Save stray thoughts for later without leaving study task)"
          >
            <BookMarked className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Later Pad</span>
          </button>

          {/* AI Mentor Trigger */}
          <button
            onClick={onOpenMentor}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-200" />
            <span className="hidden sm:inline">AI Mentor Council</span>
          </button>
        </div>
      </header>

      {/* Distraction Capture Modal */}
      {showLaterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">Distraction Capture (Later Pad)</h3>
              </div>
              <button
                onClick={() => setShowLaterModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Externalize sudden distractions immediately (e.g. &ldquo;Check YouTube video&rdquo; or &ldquo;Research new paper&rdquo;) without breaking your current focus loop.
            </p>

            <form onSubmit={handleSaveLater} className="mt-4 space-y-3">
              <input
                type="text"
                value={laterTitle}
                onChange={(e) => setLaterTitle(e.target.value)}
                placeholder="What popped into your mind?"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLaterModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!laterTitle.trim() || laterSaved}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {laterSaved ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span className="text-white">Captured!</span>
                    </>
                  ) : (
                    "Capture & Return"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
