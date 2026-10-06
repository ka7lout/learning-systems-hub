"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Clock, BookOpen, RefreshCw, Target, CheckCircle, AlertCircle } from "lucide-react";

interface TodayTasksProps {
  userId: string;
  initialPlan: any;
  reviewCount: number;
}

export function TodayTasks({ userId, initialPlan, reviewCount }: TodayTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Generate default tasks if no plan exists
  const tasks = initialPlan?.planData?.tasks || initialPlan?.tasks || [
    {
      id: "1",
      type: "learn",
      title: "Start with a lesson",
      description: "Begin with your first concept",
      courseName: "Calculus A",
      estimatedMinutes: 15,
    },
    ...(reviewCount > 0 ? [{
      id: "2",
      type: "review",
      title: `${reviewCount} concepts due for review`,
      description: "Spaced repetition review",
      courseName: "All courses",
      estimatedMinutes: 10,
    }] : []),
  ];

  const primaryTask = tasks[0];
  const nextTask = tasks[1];

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "learn": return <BookOpen className="w-5 h-5" />;
      case "review": return <RefreshCw className="w-5 h-5" />;
      case "practice": return <Target className="w-5 h-5" />;
      default: return <Play className="w-5 h-5" />;
    }
  };

  const getTaskHref = (task: any) => {
    switch (task.type) {
      case "learn": return `/lesson/${task.conceptId || "first"}`;
      case "review": return "/review";
      case "practice": return "/practice";
      default: return "/courses";
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary Task - The ONE thing to do now */}
      {primaryTask && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-blue-200 text-sm font-medium">
              <Play className="w-4 h-4" />
              YOUR NEXT STEP
            </div>
            <div className="flex items-center gap-1 text-blue-200 text-sm">
              <Clock className="w-4 h-4" />
              {primaryTask.estimatedMinutes || 15} min
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-2">{primaryTask.title}</h2>
          <p className="text-blue-100 mb-4">{primaryTask.description}</p>
          
          {primaryTask.courseName && (
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
              <BookOpen className="w-4 h-4" />
              {primaryTask.courseName}
            </div>
          )}
          
          <Link
            href={getTaskHref(primaryTask)}
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Play className="w-5 h-5" />
            START
          </Link>
        </div>
      )}

      {/* Next Task */}
      {nextTask && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                {getTaskIcon(nextTask.type)}
              </div>
              <div>
                <p className="font-medium text-white">{nextTask.title}</p>
                <p className="text-sm text-gray-400">{nextTask.courseName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              {nextTask.estimatedMinutes || 10} min
            </div>
          </div>
        </div>
      )}

      {/* Review Alert */}
      {reviewCount > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div className="flex-1">
              <p className="font-medium text-yellow-200">
                {reviewCount} concept{reviewCount !== 1 ? "s" : ""} due for review
              </p>
              <p className="text-sm text-yellow-400/70">
                Don't forget spaced repetition
              </p>
            </div>
            <Link
              href="/review"
              className="text-yellow-400 hover:text-yellow-300 font-medium text-sm"
            >
              Review now
            </Link>
          </div>
        </div>
      )}

      {/* No tasks state */}
      {!primaryTask && reviewCount === 0 && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">All caught up!</h3>
          <p className="text-gray-400 mb-4">
            No tasks due right now. You can explore courses or practice.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
