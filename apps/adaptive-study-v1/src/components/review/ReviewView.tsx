"use client";

import { useState } from "react";
import { 
  RefreshCw, 
  CheckCircle, 
  Brain,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export function ReviewView() {
  const [currentReview, setCurrentReview] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [reviews, setReviews] = useState([
    {
      id: "1",
      conceptTitle: "Power Rule for Derivatives",
      courseName: "Calculus A",
      interval: 1,
      dueDate: "Today",
      difficulty: "normal"
    },
    {
      id: "2",
      conceptTitle: "Limit Laws",
      courseName: "Calculus A",
      interval: 3,
      dueDate: "Today",
      difficulty: "normal"
    }
  ]);

  const review = reviews[currentReview];

  const handleConfidence = (level: number) => {
    setConfidence(level);
    // In production, this would update the review schedule
    setTimeout(() => {
      if (currentReview < reviews.length - 1) {
        setCurrentReview(currentReview + 1);
        setShowAnswer(false);
        setConfidence(null);
      } else {
        setCurrentReview(-1); // All done
      }
    }, 500);
  };

  if (currentReview === -1) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Review Complete!</h1>
          <p className="text-gray-400 mb-6">
            You've reviewed {reviews.length} concepts
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-6 h-6" />
          Spaced Review
        </h1>
        <p className="text-gray-400 mt-1">Strengthen your memory</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg px-4 py-2 border border-gray-800">
          <span className="text-gray-400">Due: </span>
          <span className="text-white font-bold">{reviews.length}</span>
        </div>
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${((currentReview) / reviews.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Review Card */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              review.difficulty === "easy" ? "bg-green-900/30 text-green-400" :
              review.difficulty === "normal" ? "bg-yellow-900/30 text-yellow-400" :
              "bg-red-900/30 text-red-400"
            }`}>
              {review.difficulty}
            </span>
            <span className="text-gray-500 text-sm">{review.courseName}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            {review.interval} day interval
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-8">
          {review.conceptTitle}
        </h2>

        {/* Retrieval Prompt */}
        <div className="p-6 bg-gray-800 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">Try to recall this concept</span>
          </div>
          <p className="text-gray-400">
            Without looking at your notes, write down everything you remember about this topic.
          </p>
        </div>

        {/* Show Answer Button */}
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Show Answer
          </button>
        ) : (
          <div className="space-y-6">
            {/* Answer */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="font-medium text-white mb-2">Key Points:</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Fundamental concept review</li>
                <li>• Core principles and rules</li>
                <li>• Common applications</li>
              </ul>
            </div>

            {/* Confidence Rating */}
            <div>
              <p className="text-gray-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                How well did you recall this?
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleConfidence(level)}
                    className={`py-3 rounded-lg text-center transition-colors ${
                      confidence === level
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-sm font-medium">{level}</div>
                    <div className="text-xs">
                      {level === 1 ? "Forgot" : level === 2 ? "Hard" : level === 3 ? "OK" : level === 4 ? "Good" : "Easy"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-200 text-sm font-medium">Spaced Repetition</p>
            <p className="text-blue-300/70 text-sm mt-1">
              Reviews are scheduled based on your performance. 
              Successful recalls extend the interval. Struggles shorten it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing Eye icon import
import { Eye } from "lucide-react";
