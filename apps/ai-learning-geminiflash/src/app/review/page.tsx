"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Calendar,
  Flame,
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function SpacedReviewPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch("/api/review/due");
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleGradeReview = async (grade: number) => {
    const currentItem = reviews[currentIndex];
    if (!currentItem || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: currentItem.id, grade })
      });

      setShowAnswer(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to submit review response:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentItem = reviews[currentIndex];
  const isFinished = !isLoading && (reviews.length === 0 || currentIndex >= reviews.length);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
              SUPERMEMO-2 SPACED RETRIEVAL SCHEDULE
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Active Spaced Retrieval & Interleaving Center
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Long-term retention requires active memory retrieval without looking at references first. Factor in transfer performance and calibrate response ease.
            </p>
          </div>

          {!isFinished && currentItem ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                <span className="font-mono text-slate-400">
                  Review Item {currentIndex + 1} of {reviews.length}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                  Interval: {currentItem.intervalDays} day(s) • EF: {currentItem.easeFactor}
                </span>
              </div>

              {/* Retrieval Question Prompt */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Target Concept: {currentItem.concept}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                  {currentItem.prompt}
                </h3>
              </div>

              {/* Reveal Answer Toggle */}
              {!showAnswer ? (
                <div className="pt-4 flex flex-col items-center justify-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
                  <p className="text-xs text-slate-400 text-center">
                    Recall the mental model, formulas, and trade-offs in your mind first before revealing.
                  </p>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal Ideal Retrieval Target</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Ideal Target Box */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Ideal Target Formulation:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono">
                      {currentItem.idealAnswer}
                    </p>
                  </div>

                  {/* Self-Grading Buttons */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400">
                      How accurately and independently did you recall this?
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <button
                        onClick={() => handleGradeReview(1)}
                        disabled={isSubmitting}
                        className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-medium transition-colors cursor-pointer"
                      >
                        <div className="font-bold">1. Blackout</div>
                        <div className="text-[10px] text-rose-400/80 mt-0.5">Could not recall</div>
                      </button>

                      <button
                        onClick={() => handleGradeReview(3)}
                        disabled={isSubmitting}
                        className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 font-medium transition-colors cursor-pointer"
                      >
                        <div className="font-bold">3. Hard</div>
                        <div className="text-[10px] text-amber-400/80 mt-0.5">Recalled with effort</div>
                      </button>

                      <button
                        onClick={() => handleGradeReview(4)}
                        disabled={isSubmitting}
                        className="p-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 font-medium transition-colors cursor-pointer"
                      >
                        <div className="font-bold">4. Good</div>
                        <div className="text-[10px] text-indigo-400/80 mt-0.5">Accurate recall</div>
                      </button>

                      <button
                        onClick={() => handleGradeReview(5)}
                        disabled={isSubmitting}
                        className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 font-medium transition-colors cursor-pointer"
                      >
                        <div className="font-bold">5. Perfect</div>
                        <div className="text-[10px] text-emerald-400/80 mt-0.5">Instant & complete</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Review Queue Complete</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                You have consolidated all active spaced retrieval items due for today. The SuperMemo-2 algorithm will space your next retrieval session based on calibrated ease factors.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <span>Return to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
