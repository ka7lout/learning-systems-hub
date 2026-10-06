"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, FileText, Folder } from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  instructor: string | null;
  color: string;
  icon: string | null;
  conceptCount: number;
  completedLessons: number;
}

interface CoursesListProps {
  courses: Course[];
}

export function CoursesList({ courses }: CoursesListProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/courses/${course.id}`}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${course.color}20` }}
            >
              <BookOpen className="w-6 h-6" style={{ color: course.color }} />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
          </div>
          
          <h3 className="font-semibold text-white text-lg mb-1">{course.name}</h3>
          {course.nameAr && (
            <p className="text-gray-500 text-sm mb-2">{course.nameAr}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {course.conceptCount} concepts
            </span>
            {course.instructor && (
              <span className="flex items-center gap-1">
                <Folder className="w-4 h-4" />
                {course.instructor}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
