import { db } from "@/db";
import { skills } from "@/db/schema";
import { masteryColor, masteryLabel } from "@/lib/utils";
import { BarChart3, Link2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const all = await db.select().from(skills).orderBy(skills.category, skills.order);
  const byCat = all.reduce<Record<string, typeof all>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1 max-w-2xl">
          The complete skill taxonomy. Skills are linked to lessons, assessments, projects, interview questions,
          and career requirements. Mastery is evidenced by your work, not by video consumption.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="Total skills" value={String(all.length)} />
        <Stat label="Categories" value={String(Object.keys(byCat).length)} />
        <Stat label="Evidence-linked" value="0 / 0" />
      </div>

      {Object.entries(byCat).map(([cat, skills]) => (
        <section key={cat}>
          <h2 className="font-semibold text-lg mb-3">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {skills.map((s) => (
              <div key={s.id} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg p-3 hover:border-navy-400 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{s.title}</div>
                    <div className="text-[11px] text-[rgb(var(--text-subtle))] capitalize mt-0.5">{s.level}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${masteryColor(0)} shrink-0`}>
                    {masteryLabel(0)}
                  </span>
                </div>
                {(s.prerequisites as string[]).length > 0 && (
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <Link2 className="h-3 w-3 text-[rgb(var(--text-subtle))]" />
                    {(s.prerequisites as string[]).slice(0, 3).map((p, i) => (
                      <span key={i} className="text-[10px] text-[rgb(var(--text-subtle))]">{p}{i < Math.min((s.prerequisites as string[]).length, 3) - 1 ? "," : ""}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-navy-50 dark:bg-navy-950/60 flex items-center justify-center">
        <BarChart3 className="h-5 w-5 text-navy-600 dark:text-navy-400" />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-[rgb(var(--text-subtle))] font-medium">{label}</div>
        <div className="text-xl font-bold tracking-tight">{value}</div>
      </div>
    </div>
  );
}
