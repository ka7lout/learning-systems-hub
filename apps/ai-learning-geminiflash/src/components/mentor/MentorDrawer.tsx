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
  Send,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  MessageSquare,
  HelpCircleIcon
} from "lucide-react";
import { MENTOR_COUNCIL } from "@/lib/ai/personas";

interface MentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentNodeId?: string;
  currentNodeTitle?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "mentor";
  personaId: string;
  content: string;
  helpLevel?: string;
  modelUsed?: string;
  providerStatus?: string;
  thoughtProcess?: string;
  timestamp: string;
}

export function MentorDrawer({ isOpen, onClose, currentNodeId, currentNodeTitle }: MentorDrawerProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState("lead_mentor");
  const [helpLevel, setHelpLevel] = useState("hint");
  const [modelTier, setModelTier] = useState<"pro" | "flash">("pro");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThought, setExpandedThought] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "mentor",
      personaId: "lead_mentor",
      content: `Greetings! I am **Dr. Ismaili**, your Lead Academic Advisor.

I am here to guide your study of ${currentNodeTitle ? `**${currentNodeTitle}**` : "**AI Engineering Foundations**"} using the **Ismaili Harvard Learning Science (IHLS)** method.

How can the Council assist you right now? You can request a Socratic hint, test your mathematical derivations, review your code implementation, or ask for an explanation in Technical English or Arabic.`,
      modelUsed: "deepseek/deepseek-v4-pro",
      providerStatus: "puter_live",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  if (!isOpen) return null;

  const currentPersona = MENTOR_COUNCIL[selectedPersonaId] || MENTOR_COUNCIL.lead_mentor;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      personaId: "student",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          personaId: selectedPersonaId,
          nodeId: currentNodeId,
          helpLevel,
          preferredModel: modelTier
        })
      });

      const data = await res.json();
      if (data.success && data.message) {
        const mentorMsg: ChatMessage = {
          id: data.message.id || `mentor-${Date.now()}`,
          sender: "mentor",
          personaId: selectedPersonaId,
          content: data.message.content,
          modelUsed: data.message.modelUsed,
          providerStatus: data.message.providerStatus,
          thoughtProcess: data.message.thoughtProcess,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, mentorMsg]);
      } else {
        throw new Error(data.error || "Response generation error");
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "mentor",
        personaId: selectedPersonaId,
        content: `⚠️ Note from ${currentPersona.name}: The model request completed with a local advisory fallback. Review the concept guidelines in the lesson workspace.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case "HelpCircle": return <HelpCircle className="w-4 h-4" />;
      case "Code2": return <Code2 className="w-4 h-4" />;
      case "Award": return <Award className="w-4 h-4" />;
      case "Layers": return <Layers className="w-4 h-4" />;
      case "Briefcase": return <Briefcase className="w-4 h-4" />;
      case "TrendingUp": return <TrendingUp className="w-4 h-4" />;
      case "Globe2": return <Globe2 className="w-4 h-4" />;
      case "Activity": return <Activity className="w-4 h-4" />;
      case "BookOpen": return <BookOpen className="w-4 h-4" />;
      case "ShieldCheck": return <ShieldCheck className="w-4 h-4" />;
      case "FileText": return <FileText className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-base">AI Mentor Council</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                IHLS Active
              </span>
            </div>
            <p className="text-xs text-slate-400">12 Specialist Advisors • Socratic Guidance Mode</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Specialist Selector Carousel */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/90 overflow-x-auto flex gap-1.5 scrollbar-thin">
        {Object.values(MENTOR_COUNCIL).map((spec) => {
          const isSelected = spec.id === selectedPersonaId;
          return (
            <button
              key={spec.id}
              onClick={() => setSelectedPersonaId(spec.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
              }`}
            >
              {getPersonaIcon(spec.iconName)}
              <span>{spec.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Persona Banner & Controls */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-medium text-white">{currentPersona.name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 truncate max-w-[200px]">{currentPersona.domain}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Help Level */}
          <select
            value={helpLevel}
            onChange={(e) => setHelpLevel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-[11px] text-slate-200 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="hint">Socratic Hint (Default)</option>
            <option value="guidance">Step-by-Step Guidance</option>
            <option value="concept_reminder">Concept Invariant</option>
            <option value="worked_example">Worked Example</option>
            <option value="full_explanation">Full Lecture (On Demand)</option>
          </select>

          {/* Model Tier */}
          <button
            onClick={() => setModelTier(modelTier === "pro" ? "flash" : "pro")}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
              modelTier === "pro"
                ? "bg-purple-950/60 text-purple-300 border-purple-800/60"
                : "bg-amber-950/60 text-amber-300 border-amber-800/60"
            }`}
          >
            {modelTier === "pro" ? "DeepSeek V4 Pro" : "Flash (Fast)"}
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-br-xs shadow-md"
                    : "bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-bl-xs shadow-lg"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60 text-xs">
                    <span className="font-semibold text-indigo-300">
                      {MENTOR_COUNCIL[msg.personaId]?.name || "AI Mentor"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {msg.modelUsed || "IHLS Tutor Engine"}
                    </span>
                  </div>
                )}

                {/* Thought Process Accordion */}
                {!isUser && msg.thoughtProcess && (
                  <div className="mb-3 text-xs rounded-lg bg-slate-900/80 border border-slate-800 p-2">
                    <button
                      onClick={() => setExpandedThought((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                      className="flex items-center justify-between w-full text-slate-400 hover:text-slate-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" /> Pedagogical Reasoning
                      </span>
                      {expandedThought[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expandedThought[msg.id] && (
                      <p className="mt-2 text-slate-400 text-[11px] leading-normal pt-2 border-t border-slate-800 font-mono">
                        {msg.thoughtProcess}
                      </p>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className="mt-2 text-[10px] text-slate-400 text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 w-fit animate-pulse">
            <BrainCircuit className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>{currentPersona.name} is evaluating pedagogical response...</span>
          </div>
        )}
      </div>

      {/* Quick Action Chips */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex flex-wrap gap-1.5 text-xs">
        <button
          onClick={() => handleSendMessage("Give me the smallest useful Socratic hint for this step.")}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
        >
          💡 Give me a hint
        </button>
        <button
          onClick={() => handleSendMessage("Simplify this explanation to B1-B2 plain English.")}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
        >
          📖 Simplify (B1-B2)
        </button>
        <button
          onClick={() => handleSendMessage("اشرح لي هذا المفهوم باللغة العربية مع الحفاظ على المصطلحات التقنية.")}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
        >
          🌍 الشرح بالعربي
        </button>
        <button
          onClick={() => handleSendMessage("Challenge me with an unseen transfer problem on this topic.")}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
        >
          ⚡ Challenge me
        </button>
        <button
          onClick={() => handleSendMessage("What are the core MUST WRITE notes I should record by hand for this concept?")}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
        >
          ✍️ What to write?
        </button>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask ${currentPersona.name}...`}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
