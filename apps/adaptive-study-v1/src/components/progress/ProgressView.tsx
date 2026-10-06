"use client";

import { BarChart3, Clock, CheckCircle, Target, AlertCircle, TrendingUp } from "lucide-react";

interface Course {
  id: string;
  name: string;
  color: string | null;
}

interface Session {
  id: string;
  type: string;
  plannedDurationMinutes: number | null;
  actualDurationMinutes: number | null;
  completed: boolean | null;
  sessionDate: Date;
}

interface Mistake {
  id: string;
  mistakeType: string;
  description: string;
  resolved: boolean | null;
}

interface ProgressViewProps {
  courses: Course[];
  completedLessons: number;
  totalStudyMinutes: number;
  recentSessions: Session[];
  mistakes: Mistake[];
}

export function ProgressView({ 
  courses, 
  completedLessons, 
  totalStudyMinutes,
  recentSessions,
  mistakes
}: ProgressViewProps) {
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const unresolvedMistakes = mistakes.filter(m => !m.resolved);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Progress
        </h1>
        <p className="text-gray-400 mt-1">Track your learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400">Completed</span>
          </div>
          <p className="text-3xl font-bold text-white">{completedLessons}</p>
          <p className="text-sm text-gray-500 mt-1">lessons</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400">Study Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatStudyTime(totalStudyMinutes)}</p>
          <p className="text-sm text-gray-500 mt-1">total</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400">Courses</span>
          </div>
          <p className="text-3xl font-bold text-white">{courses.length}</p>
          <p className="text-sm text-gray-500 mt-1">active</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-gray-400">Mistakes</span>
          </div>
          <p className="text-3xl font-bold text-white">{unresolvedMistakes.length}</p>
          <p className="text-sm text-gray-500 mt-1">to review</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Sessions
          </h3>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium capitalize">{session.type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {session.actualDurationMinutes || session.plannedDurationMinutes || 0}m
                    </p>
                    <p className={`text-sm ${session.completed ? "text-green-400" : "text-yellow-400"}`}>
                      {session.completed ? "Completed" : "In progress"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No study sessions yet</p>
          )}
        </div>

        {/* Mistake Patterns */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            Mistake Patterns
          </h3>
          {unresolvedMistakes.length > 0 ? (
            <div className="space-y-3">
              {unresolvedMistakes.slice(0, 5).map((mistake) => (
                <div key={mistake.id} className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-400 rounded">
                      {mistake.mistakeType}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{mistake.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No unresolved mistakes</p>
          )}
        </div>
      </div>

      {/* Course Progress */}
      <div className="mt-6 bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          Course Overview
        </h3>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center gap-4">
              <div 
                className="w-3 h-12 rounded-full"
                style={{ backgroundColor: course.color || "#3B82F6" }}
              />
              <div className="flex-1">
                <p className="font-medium text-white">{course.name}</p>
                <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: "0%",
                      backgroundColor: course.color || "#3B82F6"
                    }}
                  />
                </div>
              </div>
              <span className="text-gray-500 text-sm">0%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
