"use client";

import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  color: string;
  icon: string | null;
}

interface CoursesOverviewProps {
  courses: Course[];
  userId: string;
}

export function CoursesOverview({ courses, userId }: CoursesOverviewProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-400" />
          Your Courses
        </h2>
        <Link
          href="/courses"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="divide-y divide-gray-800">
        {courses.slice(0, 4).map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors"
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${course.color}20` }}
            >
              <BookOpen className="w-5 h-5" style={{ color: course.color }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{course.name}</p>
              <p className="text-sm text-gray-500">{course.code}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
