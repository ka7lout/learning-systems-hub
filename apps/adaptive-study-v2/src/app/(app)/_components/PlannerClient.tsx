"use client";
import { useEffect, useState } from "react";
import { ensureDailyPlanAction } from "@/lib/actions";

type Task = {
  id: string;
  title: string;
  kind: string;
  durationMinutes: number | null;
  done: boolean;
};

const KIND_ORDER = ["now", "after", "review", "optional"];
const KIND_LABEL: Record<string, string> = {
  now: "Now",
  after: "After this",
  review: "Review",
  optional: "Optional",
};

export default function PlannerClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [note, setNote] = useState<string>("");
  const [provisional, setProvisional] = useState(true);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const r = await ensureDailyPlanAction(today);
    setTasks(r.tasks as Task[]);
    setNote((r.plan as any).note ?? "");
    setProvisional((r.plan as any).isProvisional);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = KIND_ORDER.map((k) => ({
    kind: k,
    items: tasks.filter((t) => t.kind === k),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Today&apos;s plan</h1>
          <p className="muted mt-1 text-sm">
            Computed from your real progress, review due dates and curriculum order.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          Regenerate
        </button>
      </div>

      {provisional && (
        <p className="surface-2 px-4 py-3 text-sm muted">
          <b className="text-amber-300">PROVISIONAL PLAN.</b> {note}
        </p>
      )}

      {loading ? (
        <p className="muted text-sm">Computing your plan…</p>
      ) : tasks.length === 0 ? (
        <p className="surface-2 p-4 text-sm muted">
          No tasks could be computed. Complete the diagnostic and a lesson to populate your plan.
        </p>
      ) : (
        grouped.map((g) => (
          <section key={g.kind} className="surface p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide brand">
              {KIND_LABEL[g.kind] ?? g.kind}
            </h3>
            <ul className="mt-2 space-y-2">
              {g.items.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-100">{t.title}</span>
                  <span className="muted text-xs">
                    {t.durationMinutes ? `${t.durationMinutes} min` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
