"use client";

import React, { useState } from "react";
import {
  Code2,
  Database,
  Bug,
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  Table,
  CheckCircle2,
  BrainCircuit,
  Mic,
  MicOff,
  Flame,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function PracticeLabPage() {
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"python" | "sql" | "debugging" | "speaking">("python");

  // Python Sandbox
  const [pythonCode, setPythonCode] = useState<string>(`# Vectorized Cosine Similarity & Dot Product
import math

def cosine_similarity(u: list[float], v: list[float]) -> float:
    dot_prod = sum(a * b for a, b in zip(u, v))
    norm_u = math.sqrt(sum(a ** 2 for a in u))
    norm_v = math.sqrt(sum(b ** 2 for b in v))
    if norm_u == 0 or norm_v == 0:
        return 0.0
    return dot_prod / (norm_u * norm_v)

# Test embeddings:
v1 = [0.25, 0.88, -0.15]
v2 = [0.22, 0.85, -0.10]
print("Computed Similarity:", round(cosine_similarity(v1, v2), 4))
`);
  const [pythonOutput, setPythonOutput] = useState<string>("");
  const [isPythonExecuting, setIsPythonExecuting] = useState(false);

  // SQL Sandbox
  const [sqlQuery, setSqlQuery] = useState<string>(`-- Calculate Customer Running Lifetime Value (LTV) using Window Functions
SELECT 
    customer_id, 
    order_date, 
    total_amount, 
    SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_ltv,
    DENSE_RANK() OVER (ORDER BY total_amount DESC) AS customer_rank
FROM orders
LIMIT 10;
`);
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [isSqlExecuting, setIsSqlExecuting] = useState(false);

  // Debugging Lab
  const [debugCode, setDebugCode] = useState<string>(`# BUGGY TRAINING LOOP: Diagnose gradient accumulation & zero_grad omission
def train_epoch(model, dataloader, optimizer, criterion):
    model.train()
    total_loss = 0.0
    for batch_idx, (data, targets) in enumerate(dataloader):
        # BUG: Missing optimizer.zero_grad() causes gradient accumulation across batches!
        outputs = model(data)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(dataloader)
`);
  const [debugOutput, setDebugOutput] = useState<string>("");

  // Speaking Lab
  const [speechTranscript, setSpeechTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<any>(null);

  const handleRunPython = async () => {
    setIsPythonExecuting(true);
    try {
      const res = await fetch("/api/labs/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pythonCode })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setPythonOutput(data.result.output);
      }
    } catch (err) {
      setPythonOutput(`Execution Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsPythonExecuting(false);
    }
  };

  const handleRunSQL = async () => {
    setIsSqlExecuting(true);
    try {
      const res = await fetch("/api/labs/run-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sqlQuery })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setSqlResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSqlExecuting(false);
    }
  };

  const handleVoiceRecord = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setSpeechTranscript((prev) => (prev ? `${prev} ${text}` : text));
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } else {
      alert("Browser speech recognition not available. Please type your answer.");
    }
  };

  const handleEvaluateSpeech = async () => {
    if (!speechTranscript.trim()) return;
    try {
      const res = await fetch("/api/english/speak-viva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: "Explain how attention mechanisms eliminate the recurrence bottleneck.",
          transcript: speechTranscript
        })
      });
      const data = await res.json();
      if (data.success) {
        setSpeechFeedback(data);
      }
    } catch (err) {
      console.error(err);
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
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-semibold">
              INTERACTIVE ENGINEERING PRACTICE LAB
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Interactive Practice Lab & Diagnostic Sandbox
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Execute live Python algorithms, test advanced SQL Window Functions against realistic relational schemas, debug deliberately broken pipelines, and practice oral technical defenses.
            </p>
          </div>

          {/* Lab Domain Switcher */}
          <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs pb-px">
            <button
              onClick={() => setActiveTab("python")}
              className={`px-4 py-2.5 font-medium whitespace-nowrap border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "python"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Python Algorithms Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab("sql")}
              className={`px-4 py-2.5 font-medium whitespace-nowrap border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "sql"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>SQL & Relational Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("debugging")}
              className={`px-4 py-2.5 font-medium whitespace-nowrap border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "debugging"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>Debugging Diagnostic Lab</span>
            </button>

            <button
              onClick={() => setActiveTab("speaking")}
              className={`px-4 py-2.5 font-medium whitespace-nowrap border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "speaking"
                  ? "border-indigo-500 text-indigo-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Speaking Lab (Oral Viva)</span>
            </button>
          </div>

          {/* TAB 1: Python Sandbox */}
          {activeTab === "python" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-400" /> Python 3.12 Sandboxed REPL
                  </span>
                  <button
                    onClick={() => setPythonCode("# Write Python code here\n")}
                    className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>

                <textarea
                  value={pythonCode}
                  onChange={(e) => setPythonCode(e.target.value)}
                  rows={15}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-indigo-200 focus:outline-hidden focus:border-indigo-500 shadow-inner"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleRunPython}
                    disabled={isPythonExecuting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isPythonExecuting ? "Executing..." : "Execute Python"}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300">STDOUT & Execution Diagnostics</span>
                <pre className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 min-h-[340px] whitespace-pre-wrap">
                  {pythonOutput || "Click 'Execute Python' to run snippet."}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: SQL Playground */}
          {activeTab === "sql" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Target Schema: <strong>enterprise_sales_db (PostgreSQL 16)</strong></span>
                </div>
                <button
                  onClick={handleRunSQL}
                  disabled={isSqlExecuting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>{isSqlExecuting ? "Running Query..." : "Execute SQL"}</span>
                </button>
              </div>

              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-indigo-200 focus:outline-hidden focus:border-indigo-500 shadow-inner"
              />

              {sqlResult && (
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span>Query Output: {sqlResult.rowCount} rows returned in {sqlResult.executionTimeMs}ms</span>
                    <span className="font-mono text-[11px] text-emerald-400">{sqlResult.queryPlan}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-200 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          {sqlResult.columns.map((col: string, idx: number) => (
                            <th key={idx} className="p-2 font-mono uppercase text-[11px]">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlResult.rows.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            {sqlResult.columns.map((col: string, cIdx: number) => (
                              <td key={cIdx} className="p-2 font-mono text-slate-300">{String(row[col])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Debugging Lab */}
          {activeTab === "debugging" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-rose-400" />
                <h3 className="font-semibold text-white text-base">PyTorch Training Loop Bug Diagnosis</h3>
              </div>
              <p className="text-xs text-slate-400">
                A common senior AI engineering bug: PyTorch accumulates gradients by default. Diagnose where \`optimizer.zero_grad()\` belongs and why omitting it destroys convergence.
              </p>

              <textarea
                value={debugCode}
                onChange={(e) => setDebugCode(e.target.value)}
                rows={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-rose-200 focus:outline-hidden focus:border-rose-500"
              />

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-semibold text-indigo-300">Diagnostic Rule:</span>
                <p>
                  Always call \`optimizer.zero_grad()\` at the beginning of each mini-batch iteration before computing \`loss.backward()\`. Otherwise, gradients from previous batches accumulate linearly into the parameter \`.grad\` tensors.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Speaking Lab (Oral Viva) */}
          {activeTab === "speaking" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white text-base">Spoken Technical Defense Lab</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                  Browser Web Speech API
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-1">
                <span className="font-semibold text-purple-300">Prompt for Oral Defense:</span>
                <p>&ldquo;Explain the difference between L1 regularization (Lasso) and L2 regularization (Ridge). Why does L1 regularization mathematically induce parameter sparsity?&rdquo;</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Your Spoken Answer:</span>
                  <button
                    onClick={handleVoiceRecord}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isRecording
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecording ? "Listening to Speech..." : "Record Spoken Answer"}</span>
                  </button>
                </div>

                <textarea
                  value={speechTranscript}
                  onChange={(e) => setSpeechTranscript(e.target.value)}
                  rows={4}
                  placeholder="Your speech transcript will appear here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-hidden focus:border-purple-500"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleEvaluateSpeech}
                    disabled={!speechTranscript.trim()}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluate Oral Defense</span>
                  </button>
                </div>
              </div>

              {speechFeedback && (
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
                    <span className="font-semibold text-purple-300">Oral Viva Score:</span>
                    <span className="text-lg font-bold text-white font-mono">{speechFeedback.scores?.overallScore}/100</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{speechFeedback.feedback}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
