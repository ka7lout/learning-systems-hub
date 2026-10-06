"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, FileText, Play, Clock, FolderOpen } from "lucide-react";
import { useState } from "react";

interface Course {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  instructor: string | null;
  color: string | null;
  referenceBook: string | null;
  referenceBookEdition: string | null;
}

interface Module {
  id: string;
  title: string;
  titleAr: string | null;
}

interface Topic {
  id: string;
  moduleId: string;
  title: string;
}

interface Concept {
  id: string;
  title: string;
  titleAr: string | null;
  difficulty: number | null;
  topicId: string | null;
}

interface Lesson {
  id: string;
  conceptId: string;
  title: string;
  estimatedMinutes: number | null;
}

interface Progress {
  id: string;
  lessonId: string;
  status: string | null;
}

interface CourseDetailProps {
  course: Course;
  modules: Module[];
  topics: Topic[];
  concepts: Concept[];
  lessons: Lesson[];
  progress: Progress[];
  conceptsByTopic: Record<string, Concept[]>;
}

export function CourseDetail({ 
  course, 
  modules, 
  topics, 
  concepts, 
  lessons, 
  progress,
  conceptsByTopic 
}: CourseDetailProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getLessonForConcept = (conceptId: string) => {
    return lessons.find(l => l.conceptId === conceptId);
  };

  const getLessonProgress = (lessonId: string) => {
    return progress.find(p => p.lessonId === lessonId);
  };

  const getConceptsForModule = (moduleId: string) => {
    const moduleTopics = topics.filter(t => t.moduleId === moduleId);
    const topicIds = moduleTopics.map(t => t.id);
    return concepts.filter(c => topicIds.includes(c.topicId || ""));
  };

  // If no curriculum exists, show the source materials
  const hasCurriculum = concepts.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Course Header */}
      <div className="mb-8">
        <Link href="/courses" className="text-gray-500 hover:text-gray-400 text-sm flex items-center gap-1 mb-4">
          ← Back to courses
        </Link>
        
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${course.color || "#3B82F6"}20` }}
          >
            <BookOpen className="w-8 h-8" style={{ color: course.color || "#3B82F6" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{course.name}</h1>
            {course.nameAr && <p className="text-gray-400">{course.nameAr}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {course.instructor && <span>Instructor: {course.instructor}</span>}
              {course.referenceBook && (
                <span>Reference: {course.referenceBook} {course.referenceBookEdition}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      {hasCurriculum ? (
        <div className="space-y-4">
          {/* Modules */}
          {modules.map((module) => {
            const moduleConcepts = getConceptsForModule(module.id);
            const isExpanded = expandedModules.has(module.id);
            
            return (
              <div key={module.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-white">{module.title}</span>
                    <span className="text-sm text-gray-500">
                      {moduleConcepts.length} concepts
                    </span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-800">
                    {moduleConcepts.map((concept) => {
                      const lesson = getLessonForConcept(concept.id);
                      const lessonProgress = lesson ? getLessonProgress(lesson.id) : null;
                      
                      return (
                        <Link
                          key={concept.id}
                          href={lesson ? `/lesson/${lesson.id}` : "#"}
                          className="flex items-center justify-between p-4 pl-12 hover:bg-gray-800/50 transition-colors border-t border-gray-800 first:border-t-0"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-white">{concept.title}</p>
                              {concept.titleAr && (
                                <p className="text-sm text-gray-500">{concept.titleAr}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              (concept.difficulty || 1) <= 2 ? "bg-green-900/30 text-green-400" :
                              (concept.difficulty || 1) <= 3 ? "bg-yellow-900/30 text-yellow-400" :
                              "bg-red-900/30 text-red-400"
                            }`}>
                              Level {concept.difficulty || 1}
                            </span>
                            {lessonProgress?.status === "completed" ? (
                              <span className="text-green-500 text-sm">✓ Done</span>
                            ) : lesson ? (
                              <Play className="w-4 h-4 text-blue-400" />
                            ) : (
                              <span className="text-gray-600 text-sm">No lesson</span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized concepts */}
          {conceptsByTopic["uncategorized"]?.length > 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <h3 className="font-medium text-white mb-3">Other Concepts</h3>
              <div className="space-y-2">
                {conceptsByTopic["uncategorized"].map((concept) => (
                  <Link
                    key={concept.id}
                    href="#"
                    className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <span className="text-white">{concept.title}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Curriculum State - Show source materials */
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Curriculum not yet generated
          </h3>
          <p className="text-gray-400 mb-4">
            Course materials are available but lessons haven't been generated yet.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Available Materials:</h4>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Syllabus and schedule</li>
              <li>• Lecture notes and slides</li>
              <li>• Assignments and exercises</li>
              <li>• Reference materials</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
