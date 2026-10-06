"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FolderGit2,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Send,
  Award,
  Sparkles,
  GitBranch,
  Globe,
  FileText,
  Play,
  BrainCircuit
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MentorDrawer } from "@/components/mentor/MentorDrawer";

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [githubRepo, setGithubRepo] = useState<string>("");
  const [colabUrl, setColabUrl] = useState<string>("");
  const [deploymentUrl, setDeploymentUrl] = useState<string>("");
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${slug}`);
        const data = await res.json();
        if (data.success && data.project) {
          setProject(data.project);
          setUserSubmission(data.userSubmission);
          if (data.userSubmission?.githubRepo) setGithubRepo(data.userSubmission.githubRepo);
          if (data.userSubmission?.colabUrl) setColabUrl(data.userSubmission.colabUrl);
          if (data.userSubmission?.deploymentUrl) setDeploymentUrl(data.userSubmission.deploymentUrl);
          if (data.userSubmission?.reportMarkdown) setReportMarkdown(data.userSubmission.reportMarkdown);
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [slug]);

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubRepo.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          githubRepo,
          colabUrl,
          deploymentUrl,
          reportMarkdown
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionFeedback(data);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <BrainCircuit className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>Loading Project Specification...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto">
          {/* Top Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link href="/projects" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Catalog
            </Link>

            <button
              onClick={() => setIsMentorOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4 text-indigo-200" />
              <span>Ask Project Supervisor</span>
            </button>
          </div>

          {/* Project Header */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-indigo-300 font-mono font-bold">
                Ladder Level {project.ladderLevel}/10
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                {project.category}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {project.title}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {project.description}
            </p>

            {/* Why This Project Matters */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Why This Portfolio Artifact Matters:</span>
              </div>
              <p>{project.whyImportant}</p>
            </div>

            {/* Dataset & Compute Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              {project.datasetUrl && project.datasetUrl.startsWith("http") && (
                <a
                  href={project.datasetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download Dataset ({project.datasetName})</span>
                </a>
              )}

              <a
                href="https://github.com/codespaces"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Launch GitHub Codespace</span>
              </a>

              <a
                href="https://colab.research.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Google Colab GPU</span>
              </a>
            </div>
          </div>

          {/* 2-Column: Requirements & Submission Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Requirements & Criteria */}
            <div className="space-y-6">
              {/* Requirements Checklist */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  Technical Specification Requirements
                </h3>

                <div className="space-y-2.5 text-xs text-slate-300">
                  {project.requirements && (project.requirements as string[]).map((req: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="font-mono text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  Definition of Done (Acceptance Criteria)
                </h3>

                <div className="space-y-2 text-xs text-slate-300">
                  {project.acceptanceCriteria && (project.acceptanceCriteria as string[]).map((crit: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Submission & Verification Portal */}
            <div className="space-y-6">
              <form onSubmit={handleSubmitProject} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-semibold text-white text-base flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-indigo-400" />
                    Submit Verified Portfolio Evidence
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                    Truth-Bound Evidence
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Public GitHub Repository URL (Required):
                    </label>
                    <input
                      type="url"
                      required
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="https://github.com/your-username/skin-disease-resnet"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Google Colab / Kaggle Notebook Link (Optional):
                    </label>
                    <input
                      type="url"
                      value={colabUrl}
                      onChange={(e) => setColabUrl(e.target.value)}
                      placeholder="https://colab.research.google.com/drive/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Production Live Deployment / API URL (Optional):
                    </label>
                    <input
                      type="url"
                      value={deploymentUrl}
                      onChange={(e) => setDeploymentUrl(e.target.value)}
                      placeholder="https://skin-ai-model.vercel.app or API endpoint"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Model Card / Technical Summary (Markdown):
                    </label>
                    <textarea
                      rows={4}
                      value={reportMarkdown}
                      onChange={(e) => setReportMarkdown(e.target.value)}
                      placeholder="Summary of architecture, evaluation metrics (F1, Sensitivity), and known failure edge cases..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!githubRepo.trim() || isSubmitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Verifying Artifact..." : "Submit Artifact for Rubric Review"}</span>
                </button>
              </form>

              {/* Evaluator Feedback Card */}
              {(submissionFeedback || userSubmission?.evaluationScore) && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3 text-xs shadow-lg animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-semibold text-emerald-400">Supervisor Evaluation Feedback</span>
                    <span className="text-base font-bold text-white font-mono">
                      Score: {submissionFeedback?.score || userSubmission?.evaluationScore}/100
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    {submissionFeedback?.feedback || userSubmission?.evaluatorFeedback}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-indigo-300 font-mono text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Evidence Level Upgraded: {submissionFeedback?.evidenceLevel || userSubmission?.evidenceLevel}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
}
