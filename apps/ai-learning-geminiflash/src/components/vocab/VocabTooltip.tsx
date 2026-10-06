"use client";

import React, { useState } from "react";
import { Volume2, BookOpen, Globe, CheckCircle2 } from "lucide-react";
import { CANONICAL_ENGLISH_TERMS, EnglishTermSeed } from "@/data/english-vocab";

interface VocabTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export function VocabTooltip({ term, children }: VocabTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const termData = CANONICAL_ENGLISH_TERMS.find(
    (t) => t.term.toLowerCase() === term.toLowerCase()
  ) || {
    term,
    category: "Technical AI",
    partOfSpeech: "term",
    b1b2Definition: "A key technical term used in AI Engineering.",
    technicalDefinition: `Standard professional definition for ${term} in computer science and machine learning.`,
    arabicMeaning: "مصطلح تقني متخصص",
    pronunciationIpa: `/${term.toLowerCase()}/`,
    exampleSentence: `Understanding ${term} is essential for rigorous AI systems engineering.`,
    commonMistakes: "Ensure consistent professional terminology in engineering reviews."
  };

  const speakTerm = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(termData.term);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <span className="relative inline-block">
      <span
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer border-b border-dashed border-indigo-400 font-medium text-indigo-300 hover:text-indigo-200 hover:border-indigo-300 transition-colors"
        title="Click to view definition and pronunciation"
      >
        {children || term}
      </span>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 z-50 w-80 rounded-xl bg-slate-900 border border-slate-700/80 p-4 text-left shadow-2xl text-slate-100 text-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-base">{termData.term}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                  {termData.partOfSpeech}
                </span>
              </div>
              <button
                type="button"
                onClick={speakTerm}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors cursor-pointer"
                title="Pronounce word"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse text-indigo-400" : ""}`} />
              </button>
            </div>

            <div className="mt-2 space-y-2 text-xs">
              <div className="text-slate-400 font-mono text-[11px]">
                IPA: <span className="text-slate-300">{termData.pronunciationIpa}</span>
              </div>

              <div>
                <span className="text-indigo-300 font-medium flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> B1-B2 Plain Meaning:
                </span>
                <p className="text-slate-300 mt-0.5">{termData.b1b2Definition}</p>
              </div>

              <div>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Technical Standard:
                </span>
                <p className="text-slate-300 mt-0.5">{termData.technicalDefinition}</p>
              </div>

              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-amber-300 font-medium flex items-center gap-1">
                  <Globe className="w-3 h-3" /> بالعربية:
                </span>
                <span className="text-slate-200 font-medium dir-rtl">{termData.arabicMeaning}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </span>
  );
}
