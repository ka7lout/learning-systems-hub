"use client";

import { Database, CheckCircle, XCircle, Clock, FileText, BookOpen, Target } from "lucide-react";

interface DataHealthViewProps {
  stats: {
    courses: number;
    sources: number;
    concepts: number;
    lessons: number;
    questions: number;
    sessions: number;
    mistakes: number;
    reviews: number;
  };
  lastIngestion: any;
}

export function DataHealthView({ stats, lastIngestion }: DataHealthViewProps) {
  const healthItems = [
    { label: "Courses", value: stats.courses, icon: BookOpen, status: stats.courses > 0 ? "healthy" : "empty" },
    { label: "Source Documents", value: stats.sources, icon: FileText, status: stats.sources > 0 ? "healthy" : "empty" },
    { label: "Concepts", value: stats.concepts, icon: Target, status: stats.concepts > 0 ? "healthy" : "empty" },
    { label: "Lessons", value: stats.lessons, icon: BookOpen, status: stats.lessons > 0 ? "healthy" : "empty" },
    { label: "Questions", value: stats.questions, icon: Target, status: stats.questions > 0 ? "healthy" : "empty" },
    { label: "Study Sessions", value: stats.sessions, icon: Clock, status: stats.sessions > 0 ? "healthy" : "empty" },
    { label: "Mistakes", value: stats.mistakes, icon: FileText, status: "info" },
    { label: "Reviews", value: stats.reviews, icon: Clock, status: stats.reviews > 0 ? "healthy" : "empty" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6" />
          Database Health
        </h1>
        <p className="text-gray-400 mt-1">Real database statistics</p>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {stats.courses >= 0 ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h2 className="font-semibold text-white">Database Connected</h2>
                <p className="text-gray-400 text-sm">Supabase PostgreSQL is reachable</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <h2 className="font-semibold text-white">Database Error</h2>
                <p className="text-gray-400 text-sm">Unable to connect to database</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {healthItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-gray-500" />
                {item.status === "healthy" && <CheckCircle className="w-4 h-4 text-green-500" />}
                {item.status === "empty" && <XCircle className="w-4 h-4 text-yellow-500" />}
                {item.status === "info" && <FileText className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Last Ingestion */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="font-semibold text-white mb-4">Last Ingestion Run</h2>
        {lastIngestion ? (
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Type</p>
              <p className="text-white font-medium capitalize">{lastIngestion.runType}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Started</p>
              <p className="text-white font-medium">
                {new Date(lastIngestion.startedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Files Processed</p>
              <p className="text-white font-medium">
                {lastIngestion.filesProcessed}/{lastIngestion.filesFound}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className={`font-medium capitalize ${
                lastIngestion.status === "completed" ? "text-green-400" :
                lastIngestion.status === "failed" ? "text-red-400" :
                "text-yellow-400"
              }`}>
                {lastIngestion.status}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No ingestion runs recorded</p>
        )}
      </div>
    </div>
  );
}
