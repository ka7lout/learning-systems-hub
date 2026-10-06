"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  BookOpen,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  FileText,
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function ResearchLabPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"papers" | "ablation" | "hypotheses">("papers");

  const [ablationClaim, setAblationClaim] = useState<string>("Removing Layer Normalization prior to Multi-Head Attention causes gradient vanishing in deep Transformer architectures.");
  const [baselineMetric, setBaselineMetric] = useState<string>("Perplexity: 14.2 | Training Loss: 1.82");
  const [ablationResult, setAblationResult] = useState<string>("");

  const handleRunAblation = () => {
    setAblationResult(`Ablation Synthesis Generated:
- Baseline (Pre-LN Transformer): Convergence at Epoch 12. Test Perplexity = 14.2.
- Ablated Variant (Post-LN without Warmup): Gradient variance exploded at Epoch 3 (NaN loss).
- Finding: Pre-LN architecture stabilizes gradient propagation variance to 1.0, enabling 10x higher learning rates.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-semibold">
              SCIENTIFIC RESEARCH & PAPER DECONSTRUCTION LAB
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI Research Engineering & Experimental Lab
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Transition from consumer to scientific contributor: deconstruct foundational AI literature, design controlled ablation experiments, and test empirical hypotheses under IHLS.
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-800 flex items-center gap-2 text-xs pb-px">
            <button
              onClick={() => setActiveTab("papers")}
              className={`px-4 py-2.5 font-medium border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "papers"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Foundational Papers Deconstruction</span>
            </button>

            <button
              onClick={() => setActiveTab("ablation")}
              className={`px-4 py-2.5 font-medium border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "ablation"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Ablation Study Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("hypotheses")}
              className={`px-4 py-2.5 font-medium border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "hypotheses"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>IHLS Hypothesis Registry (H1–H6)</span>
            </button>
          </div>

          {/* TAB 1: Papers */}
          {activeTab === "papers" && (
            <div className="space-y-4">
              {[
                {
                  title: "Attention Is All You Need (Vaswani et al., 2017)",
                  domain: "Transformer Architecture & Scaled Dot-Product Attention",
                  coreClaim: "Recurrence (RNN/LSTM) and convolutions can be entirely eliminated in favor of self-attention mechanisms, enabling massive GPU parallelization.",
                  keyEquation: "Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V",
                  ablationNote: "Ablating the 1/sqrt(d_k) factor leads to vanishing gradients for high-dimensional embeddings."
                },
                {
                  title: "Deep Residual Learning for Image Recognition (He et al., 2015)",
                  domain: "ResNet Skip Connections & Degradation Problem",
                  coreClaim: "Explicitly letting layers fit a residual mapping F(x) = H(x) - x is easier to optimize than the original unreferenced mapping H(x).",
                  keyEquation: "y = F(x, {W_i}) + x",
                  ablationNote: "Ablating identity skip connections prevents deep 50+ layer networks from converging."
                },
                {
                  title: "LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)",
                  domain: "Parameter-Efficient Fine-Tuning (PEFT)",
                  coreClaim: "Weight updates during adaptation have a low 'intrinsic dimension', meaning Delta W can be decomposed into two small low-rank matrices B * A.",
                  keyEquation: "W = W_0 + (alpha / r) * (B * A)",
                  ablationNote: "Rank r = 4 to 8 matches full fine-tuning performance while slashing trainable weights by 99.8%."
                }
              ].map((paper, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-semibold text-indigo-300">{paper.domain}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Foundational Paper {i + 1}</span>
                  </div>

                  <h3 className="font-bold text-white text-base">{paper.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-slate-400">Core Claim:</strong> {paper.coreClaim}</p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-400">
                    {paper.keyEquation}
                  </div>

                  <p className="text-xs text-slate-400 italic"><strong className="text-slate-500">Ablation Insight:</strong> {paper.ablationNote}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Ablation Study */}
          {activeTab === "ablation" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-indigo-400" />
                Ablation Experiment Designer
              </h3>
              <p className="text-xs text-slate-400">
                Formulate an ablation hypothesis: isolate a single architectural component, predict its effect, and measure the empirical difference against baseline metrics.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ablation Hypothesis & Isolated Component:</label>
                  <input
                    type="text"
                    value={ablationClaim}
                    onChange={(e) => setAblationClaim(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Baseline Metric Benchmark:</label>
                  <input
                    type="text"
                    value={baselineMetric}
                    onChange={(e) => setBaselineMetric(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <button
                  onClick={handleRunAblation}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Synthesize Ablation Analysis</span>
                </button>
              </div>

              {ablationResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-150">
                  {ablationResult}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IHLS Hypotheses Registry */}
          {activeTab === "hypotheses" && (
            <div className="space-y-4">
              {[
                { code: "H1", title: "State-Adaptive Learning Protocol", desc: "Dynamic adjustment of task granularity based on user-reported state (Deep, Drift, Fog, Overload) improves weekly study consistency and reduces drop-off compared to static time blocks." },
                { code: "H2", title: "Mandatory Student Attempt Rule", desc: "Requiring an initial student attempt before AI hint exposure produces significantly higher retention and independent problem-solving performance in delayed transfer evaluations." },
                { code: "H3", title: "Layered Transfer over Direct Recall", desc: "Layered evaluation (Recall -> Debugging -> Case Decision -> Oral Viva) yields superior engineering debugging performance over code-completion alone." },
                { code: "H4", title: "Anti-Compulsion Verification Boundaries", desc: "Enforcing verification boundaries against excessive AI reassurance prevents unproductive checking loops without compromising solution correctness." },
                { code: "H5", title: "Executive Demand Externalization", desc: "Externalizing next tasks and distraction thoughts into a dedicated Later Pad reduces task initiation friction." },
                { code: "H6", title: "Standard Technical English + Pronunciation Support", desc: "Integrating authentic technical terminology with B1-B2 definitions and IPA speech models accelerates professional bilingual communication." }
              ].map((hyp, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                      Hypothesis {hyp.code}
                    </span>
                    <h3 className="font-semibold text-white text-sm">{hyp.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{hyp.desc}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
