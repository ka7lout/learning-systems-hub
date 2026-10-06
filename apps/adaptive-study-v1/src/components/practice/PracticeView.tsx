"use client";

import { useState } from "react";
import { 
  Target, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  ChevronRight,
  Brain,
  RotateCcw,
  Trophy
} from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string | null;
  hint1: string | null;
  hint2: string | null;
  hint3: string | null;
}

export function PracticeView() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      questionText: "What is the derivative of x²?",
      options: ["x", "2x", "x²", "2"],
      correctAnswer: "2x",
      explanation: "Using the power rule: d/dx(xⁿ) = n·xⁿ⁻¹. So d/dx(x²) = 2x¹ = 2x",
      difficulty: "easy",
      hint1: "Think about the power rule",
      hint2: "Bring down the exponent and subtract 1",
      hint3: "2 · x^(2-1) = 2x"
    },
    {
      id: "2",
      questionText: "What is the limit of sin(x)/x as x approaches 0?",
      options: ["0", "1", "∞", "undefined"],
      correctAnswer: "1",
      explanation: "This is a fundamental limit in calculus. As x→0, sin(x)≈x, so sin(x)/x→1",
      difficulty: "normal",
      hint1: "Consider the behavior of sin(x) near 0",
      hint2: "Use the small angle approximation",
      hint3: "sin(x) ≈ x when x is very small"
    }
  ]);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    const isCorrect = answer === question.correctAnswer;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Show final score
      setCurrentQuestion(-1);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
  };

  if (currentQuestion === -1) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Practice Complete!</h1>
          <p className="text-gray-400 mb-6">
            You got {score.correct} out of {score.total} correct
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RotateCcw className="w-5 h-5" />
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6" />
          Practice Arena
        </h1>
        <p className="text-gray-400 mt-1">Test your understanding</p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg px-4 py-2 border border-gray-800">
          <span className="text-gray-400">Score: </span>
          <span className="text-white font-bold">{score.correct}/{score.total}</span>
        </div>
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <span className={`text-xs px-2 py-1 rounded ${
            question.difficulty === "easy" ? "bg-green-900/30 text-green-400" :
            question.difficulty === "normal" ? "bg-yellow-900/30 text-yellow-400" :
            "bg-red-900/30 text-red-400"
          }`}>
            {question.difficulty || "normal"}
          </span>
          <span className="text-gray-500 text-sm">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        <h2 className="text-xl text-white mb-6">{question.questionText}</h2>

        {/* Options */}
        {question.options && (
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    showCorrect
                      ? "bg-green-900/30 border border-green-600 text-green-300"
                      : showWrong
                      ? "bg-red-900/30 border border-red-600 text-red-300"
                      : isSelected
                      ? "bg-blue-900/30 border border-blue-600 text-blue-300"
                      : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Hints */}
        {!showResult && (
          <div className="mb-6">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? "Hide hints" : "Show hints"}
            </button>
            {showHint && (
              <div className="mt-3 p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                {question.hint1 && <p className="text-yellow-200 text-sm">💡 {question.hint1}</p>}
                {question.hint2 && <p className="text-yellow-200 text-sm mt-2">💡 {question.hint2}</p>}
                {question.hint3 && <p className="text-yellow-200 text-sm mt-2">💡 {question.hint3}</p>}
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        {showResult && (
          <div className="p-4 bg-gray-800 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-white">Explanation</span>
            </div>
            <p className="text-gray-300">{question.explanation}</p>
          </div>
        )}

        {/* Next Button */}
        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isLastQuestion ? "See Results" : "Next Question"}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
