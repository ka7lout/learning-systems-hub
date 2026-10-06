"use client";

import { BookOpen, Target, Clock, CheckCircle } from "lucide-react";

interface QuickStatsProps {
  coursesCount: number;
  conceptsCount: number;
  sessionsCount: number;
  studyMinutes: number;
}

export function QuickStats({ coursesCount, conceptsCount, sessionsCount, studyMinutes }: QuickStatsProps) {
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <BookOpen className="w-4 h-4" />
          Courses
        </div>
        <p className="text-2xl font-bold text-white">{coursesCount}</p>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <Target className="w-4 h-4" />
          Concepts
        </div>
        <p className="text-2xl font-bold text-white">{conceptsCount}</p>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <CheckCircle className="w-4 h-4" />
          Sessions
        </div>
        <p className="text-2xl font-bold text-white">{sessionsCount}</p>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <Clock className="w-4 h-4" />
          Study Time
        </div>
        <p className="text-2xl font-bold text-white">{formatStudyTime(studyMinutes)}</p>
      </div>
    </div>
  );
}
