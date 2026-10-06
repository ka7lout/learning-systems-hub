import { RotateCcw, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-2xl">
          Spaced review keeps durable retention high. Review items appear here automatically as you complete lessons
          and practice, using an expanding-interval schedule adapted to your performance on each concept.
        </p>
      </div>

      <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-10 text-center">
        <Clock className="h-10 w-10 text-[rgb(var(--text-subtle))] mx-auto mb-3 opacity-50" />
        <h2 className="font-semibold text-lg mb-1">Nothing scheduled yet</h2>
        <p className="text-sm text-[rgb(var(--text-muted))] max-w-md mx-auto leading-relaxed">
          Start working through lessons and practice problems. Once you complete your first retrieval check, review
          items will appear here at optimized intervals — not immediately, but after a delay that stretches as you
          succeed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoCard title="Why delay?" body="Retrieving information after a forget-attempt strengthens memory more than re-reading immediately (Cepeda et al., 2006)." />
        <InfoCard title="Not just flashcards" body="Reviews include free recall, transfer tasks, debugging, code reading, and oral explanations — not only term-definition cards." />
        <InfoCard title="Adaptive intervals" body="Items you fail come back sooner. Items you transfer successfully get longer intervals. No fixed SM-2-like schedule forced on every concept." />
      </div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <RotateCcw className="h-4 w-4 text-navy-600 dark:text-navy-400" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed">{body}</p>
    </div>
  );
}
