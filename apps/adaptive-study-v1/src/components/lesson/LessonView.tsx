"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  Lightbulb,
  Brain,
  Target,
  FileText,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  objective: string | null;
  mission: string | null;
  simpleExplanation: string | null;
  formalContent: string | null;
  equationContent: string | null;
  workedExample: string | null;
  estimatedMinutes: number | null;
}

interface Concept {
  id: string;
  title: string;
  simpleExplanation: string | null;
  formalDefinition: string | null;
  intuition: string | null;
}

interface Course {
  id: string;
  name: string;
  color: string | null;
}

export function LessonView({ lesson, concept, course }: { 
  lesson: Lesson; 
  concept: Concept; 
  course: Course;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const steps = [
    { id: "mission", title: "Mission", icon: Target, content: lesson.mission || "Learn this concept" },
    { id: "objective", title: "Objective", icon: FileText, content: lesson.objective || concept.title },
    { id: "simple", title: "Simple Explanation", icon: Brain, content: lesson.simpleExplanation || concept.simpleExplanation || "Explanation not available" },
    { id: "formal", title: "Formal Definition", icon: BookOpen, content: lesson.formalContent || concept.formalDefinition || "Definition not available" },
    { id: "equation", title: "Equation", icon: FileText, content: lesson.equationContent || "" },
    { id: "example", title: "Worked Example", icon: Lightbulb, content: lesson.workedExample || "Example not available" },
    { id: "retrieval", title: "Test Yourself", icon: Brain, content: "Close this and try to recall the main idea" },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowAnswer(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href={`/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {course.name}
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
            <p className="text-gray-400 mt-1">{concept.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{lesson.estimatedMinutes || 15} min</span>
            </div>
            <button
              onClick={() => setTimerActive(!timerActive)}
              className={`p-2 rounded-lg ${timerActive ? "bg-green-600" : "bg-gray-700"}`}
            >
              {timerActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            {timerActive && (
              <span className="text-xl font-mono text-white">{formatTime(timerSeconds)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                index === currentStep
                  ? "bg-blue-600 text-white"
                  : index < currentStep
                  ? "bg-green-600/20 text-green-400"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-sm">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <currentStepData.icon className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">{currentStepData.title}</h2>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {currentStepData.content || "No content available for this step."}
          </p>
        </div>

        {/* Retrieval Step - Special handling */}
        {currentStepData.id === "retrieval" && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-4">
              Try to recall the main points before continuing:
            </p>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
            >
              {showAnswer ? "Hide" : "Show"} answer
              <ChevronRight className={`w-4 h-4 transition-transform ${showAnswer ? "rotate-90" : ""}`} />
            </button>
            {showAnswer && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-white">{lesson.objective || concept.title}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
            currentStep === 0
              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href="/practice"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Lesson
          </Link>
        )}
      </div>
    </div>
  );
}
