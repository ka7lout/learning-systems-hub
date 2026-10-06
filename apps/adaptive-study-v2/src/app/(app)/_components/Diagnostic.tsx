"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitDiagnosticAction } from "@/lib/actions";

type Q = {
  domain: string;
  q: string;
  options: string[];
  correct: number;
};

const QUESTIONS: Q[] = [
  {
    domain: "algebra",
    q: "Simplify: 3x + 5x − 2x",
    options: ["6x", "10x", "x", "6"],
    correct: 0,
  },
  {
    domain: "fractions",
    q: "What is 1/2 + 1/4?",
    options: ["2/6", "3/4", "1/6", "2/4"],
    correct: 1,
  },
  {
    domain: "equations",
    q: "Solve for x: 2x + 4 = 10",
    options: ["x = 2", "x = 3", "x = 7", "x = 6"],
    correct: 1,
  },
  {
    domain: "graph reading",
    q: "On a line graph, a steeper slope means the quantity is changing…",
    options: ["more slowly", "more quickly", "not at all", "negatively"],
    correct: 1,
  },
  {
    domain: "trigonometry basics",
    q: "In a right triangle, sin(θ) equals…",
    options: ["opposite / adjacent", "adjacent / hypotenuse", "opposite / hypotenuse", "hypotenuse / opposite"],
    correct: 2,
  },
  {
    domain: "physics fundamentals",
    q: "Speed is the rate of change of…",
    options: ["acceleration", "position", "force", "mass"],
    correct: 1,
  },
  {
    domain: "physics fundamentals",
    q: "A car moving at constant velocity has net force equal to…",
    options: ["its weight", "zero", "its mass", "infinity"],
    correct: 1,
  },
  {
    domain: "electrical fundamentals",
    q: "Ohm's Law states V = …",
    options: ["I / R", "I · R", "R / I", "I + R"],
    correct: 1,
  },
  {
    domain: "electrical fundamentals",
    q: "The unit of electric current is the…",
    options: ["Volt", "Ohm", "Ampere", "Watt"],
    correct: 2,
  },
  {
    domain: "programming logic",
    q: "What does this do?  if x > 5: print('big')",
    options: [
      "prints 'big' only when x is greater than 5",
      "always prints 'big'",
      "prints 'big' when x is 5",
      "never prints",
    ],
    correct: 0,
  },
  {
    domain: "basic python",
    q: "In Python, which creates a list?",
    options: ["x = (1,2,3)", "x = [1,2,3]", "x = {1,2,3}", "x = '1,2,3'"],
    correct: 1,
  },
];

export default function Diagnostic({ alreadyDone }: { alreadyDone: boolean }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  if (alreadyDone) {
    return (
      <div className="surface p-6">
        <h1 className="text-xl font-semibold">Diagnostic already completed</h1>
        <p className="muted mt-2 text-sm">
          Your responses are stored. You can start learning now — the system routes you from your real
          course material.
        </p>
        <a href="/" className="btn btn-primary mt-4 inline-flex">
          Go to today&apos;s step
        </a>
      </div>
    );
  }

  async function finish() {
    setSubmitting(true);
    const responses = QUESTIONS.map((qq, i) => {
      const chosen = answers[i];
      const correct = chosen === qq.correct;
      return {
        domain: qq.domain,
        question: qq.q,
        response: chosen !== undefined ? qq.options[chosen] : "(no answer)",
        correct,
        score: correct ? 1 : 0,
      };
    });
    await submitDiagnosticAction(responses);
    router.push("/");
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] brand">Day 0 — Finding your starting point</p>
        <h1 className="mt-1 text-2xl font-semibold">Diagnostic</h1>
        <p className="muted mt-2 max-w-2xl text-sm">
          You do not need to remember everything. Answer what you can — there are no trick questions
          and no penalty. This is an application-generated skill check (not an IUG exam); every answer
          is stored so the system can route you to the right starting material.
        </p>
      </div>

      {QUESTIONS.map((qq, i) => (
        <div key={i} className="surface p-4">
          <p className="text-sm font-medium">
            {i + 1}. <span className="muted">[{qq.domain}]</span> {qq.q}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {qq.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${
                  answers[i] === oi
                    ? "border-[#38bdf8] bg-[#13243a] text-white"
                    : "border-[#233052] text-slate-200 hover:bg-[#141b30]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <span className="muted text-sm">
          {Object.keys(answers).length}/{QUESTIONS.length} answered
        </span>
        <button
          className="btn btn-primary ml-auto"
          disabled={submitting}
          onClick={finish}
        >
          {submitting ? "Saving…" : "Finish diagnostic"}
        </button>
      </div>
    </div>
  );
}
