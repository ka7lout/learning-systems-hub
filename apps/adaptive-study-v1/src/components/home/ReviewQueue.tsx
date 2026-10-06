"use client";

import Link from "next/link";
import { RefreshCw, Clock } from "lucide-react";

interface Review {
  id: string;
  conceptId: string;
  courseId: string;
  nextReview: Date;
  intervalDays: number;
}

interface ReviewQueueProps {
  reviews: Review[];
  userId: string;
}

export function ReviewQueue({ reviews, userId }: ReviewQueueProps) {
  const dueReviews = reviews.slice(0, 3); // Show max 3

  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-gray-400" />
          Review Queue
        </h2>
        <Link
          href="/review"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View all
        </Link>
      </div>
      
      <div className="p-4 space-y-3">
        {dueReviews.map((review) => (
          <div
            key={review.id}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <RefreshCw className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">Concept Review</p>
                <p className="text-xs text-gray-500">
                  {review.intervalDays} day interval
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              Due now
            </div>
          </div>
        ))}
        
        {reviews.length > 3 && (
          <Link
            href="/review"
            className="block text-center text-blue-400 hover:text-blue-300 text-sm py-2"
          >
            +{reviews.length - 3} more reviews
          </Link>
        )}
      </div>
    </div>
  );
}
