import { getCurrentUser } from "@/lib/auth";
import { getMistakes, getConceptTitle, getCourses } from "@/lib/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MistakesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [rows, courses] = await Promise.all([getMistakes(user.id), getCourses()]);
  const courseMap = new Map(courses.map((c) => [c.id, c.code]));
  const enriched = await Promise.all(
    rows.map(async (m) => ({ ...m, concept: await getConceptTitle(m.conceptId), course: m.courseId ? courseMap.get(m.courseId) : null })),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">My mistake book</h1>
        <p className="muted mt-1 text-sm">
          Real mistakes you made in practice. Search them before an exam — patterns here are your highest
          yield revision.
        </p>
      </div>

      {enriched.length === 0 ? (
        <p className="surface-2 p-4 text-sm muted">
          No mistakes recorded yet. Mistakes are added automatically when you mark a practice attempt as
          incorrect.
        </p>
      ) : (
        <ul className="space-y-2">
          {enriched.map((m) => (
            <li key={m.id} className="surface p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {m.course && <span className="rounded bg-[#13243a] px-2 py-0.5 text-[10px] brand">{m.course}</span>}
                {m.concept && <span className="muted text-xs">{m.concept}</span>}
                {m.mistakeType && (
                  <span className="surface-2 px-2 py-0.5 text-[10px] muted">{m.mistakeType}</span>
                )}
                {m.repeatCount > 1 && (
                  <span className="px-2 py-0.5 text-[10px] text-amber-300">×{m.repeatCount}</span>
                )}
              </div>
              <p className="mt-2 text-slate-100">{m.studentAnswer}</p>
              {m.explanation && <p className="muted mt-1 text-xs">{m.explanation}</p>}
              <p className="muted mt-1 text-xs">
                {m.createdAt ? new Date(m.createdAt).toISOString().slice(0, 10) : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
