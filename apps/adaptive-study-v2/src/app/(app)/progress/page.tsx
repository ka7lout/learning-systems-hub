import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserStats,
  getWeakConcepts,
  getXpByDay,
  getAttemptBreakdown,
  levelForXp,
} from "@/lib/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const userId = user.id;

  const [stats, weak, xpByDay, attempts] = await Promise.all([
    getUserStats(userId),
    getWeakConcepts(userId),
    getXpByDay(userId, 14),
    getAttemptBreakdown(userId),
  ]);

  // build last 14 day labels
  const days: { label: string; xp: number }[] = [];
  const map = new Map(xpByDay.map((r) => [r.d, r.xp]));
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: key.slice(5), xp: map.get(key) ?? 0 });
  }
  const maxXp = Math.max(1, ...days.map((d) => d.xp));
  const { level, next } = levelForXp(stats.xp);
  const levelPct = Math.min(100, Math.round((stats.xp / next) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Progress</h1>
        <p className="muted mt-1 text-sm">
          Every figure here is computed from your real database records. No metric is estimated or
          fabricated.
        </p>
      </div>

      {/* key stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Level" value={String(level)} />
        <Card label="Total XP" value={String(stats.xp)} />
        <Card label="Streak" value={`${stats.streak} d`} />
        <Card label="Lessons done" value={String(stats.completedLessons)} />
        <Card label="Study minutes" value={String(stats.studyMinutes)} />
        <Card label="Attempts" value={String(stats.attempts)} />
        <Card label="Mistakes" value={String(stats.mistakes)} />
        <Card label="Reviews due" value={String(stats.reviewDue)} />
      </section>

      {/* level progress */}
      <section className="surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="muted">Progress to level {level + 1}</span>
          <span className="muted">
            {stats.xp} / {next} XP
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#1a2238]">
          <div className="h-full rounded-full bg-[#38bdf8]" style={{ width: `${levelPct}%` }} />
        </div>
      </section>

      {/* xp by day */}
      <section className="surface p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide muted">XP earned (last 14 days)</h3>
        {days.every((d) => d.xp === 0) ? (
          <p className="muted mt-3 text-sm">No XP recorded yet. Earn XP by completing focus blocks, practice and reviews.</p>
        ) : (
          <div className="mt-3 flex h-40 items-end gap-1">
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t bg-[#38bdf8]"
                  style={{ height: `${(d.xp / maxXp) * 100}%`, minHeight: d.xp > 0 ? 4 : 0 }}
                  title={`${d.xp} XP`}
                />
                <span className="text-[9px] muted">{d.label.slice(3)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* attempts */}
      <section className="surface p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide muted">Practice attempts</h3>
        {stats.attempts === 0 ? (
          <p className="muted mt-3 text-sm">No practice attempts recorded yet.</p>
        ) : (
          <div className="mt-3 flex gap-3 text-sm">
            <span className="surface-2 px-3 py-2 text-emerald-300">✓ {attempts.correct} correct</span>
            <span className="surface-2 px-3 py-2 text-red-300">✗ {attempts.incorrect} incorrect</span>
          </div>
        )}
      </section>

      {/* weak concepts */}
      <section className="surface p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide muted">Weak concepts</h3>
        {weak.length === 0 ? (
          <p className="muted mt-3 text-sm">
            No weak concepts identified yet. Concepts where you make repeated mistakes will appear here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {weak.slice(0, 8).map((w) => (
              <li key={w.conceptId} className="flex items-center justify-between text-sm">
                <span className="text-slate-100">{w.title}</span>
                <span className="surface-2 px-2 py-0.5 text-xs brand">{w.errors} mistakes</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="muted text-xs">
        Want the raw tables? See <Link href="/admin/data-health" className="brand hover:underline">Data health</Link>.
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="muted text-xs mt-1">{label}</p>
    </div>
  );
}
