import { FlaskConical, Code2, Bug, Brain, MessageSquare, Calculator, FileCode } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PRACTICE_TYPES = [
  { icon: Brain, title: "Free recall", desc: "Close the notes and explain a concept from memory. Type or speak. Mentor scores clarity.", href: "#" },
  { icon: Code2, title: "Code writing", desc: "Small, focused coding exercises with hints that fade. Browser-safe Python via Pyodide for simple exercises.", href: "#" },
  { icon: Bug, title: "Debugging", desc: "Intentionally broken code / SQL / pipelines. Diagnose before mentor reveals.", href: "#" },
  { icon: Calculator, title: "Calculation & derivation", desc: "Math problems with worked-example fading: full example → partial → independent.", href: "#" },
  { icon: MessageSquare, title: "Oral viva", desc: "Explain, justify, defend: concepts, model choices, architecture, bugs, evaluation.", href: "/mentor" },
  { icon: FileCode, title: "Code reading", desc: "Given real code: what does it do? What is its complexity? What edge case breaks it?", href: "#" },
];

export default function PracticePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice Lab</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-2xl">
          Practice is where durable learning is built. Not multiple-choice — real retrieval, real code, real debugging,
          real explanation. Multiple-choice is used sparingly as a check, not as the main exercise.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRACTICE_TYPES.map((p) => {
          const Icon = p.icon;
          return (
            <Link key={p.title} href={p.href} className="block bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-4 hover:border-navy-400 transition">
              <div className="h-10 w-10 rounded-lg bg-navy-50 dark:bg-navy-950/60 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-navy-600 dark:text-navy-400" />
              </div>
              <h3 className="font-semibold text-[15px] mb-1">{p.title}</h3>
              <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed">{p.desc}</p>
            </Link>
          );
        })}
      </div>
      <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="h-5 w-5 text-navy-600 dark:text-navy-400" />
          <h2 className="font-semibold">Practice rules</h2>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-sm text-[rgb(var(--text-muted))] leading-relaxed">
          <li>You must attempt before the mentor gives the full answer.</li>
          <li>Help level is recorded. Independent performance counts more toward job readiness.</li>
          <li>Tasks are interleaved once you have basics; not 20 of the same kind.</li>
          <li>Transfer tasks are not the same shape as the examples you learned from.</li>
        </ul>
      </div>
    </div>
  );
}
