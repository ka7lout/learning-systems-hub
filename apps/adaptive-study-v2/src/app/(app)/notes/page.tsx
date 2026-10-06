import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { notes, courses } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AddNote from "../_components/AddNote";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [rows, coursesList] = await Promise.all([
    db.select().from(notes).where(eq(notes.userId, user.id)).orderBy(desc(notes.createdAt)),
    db.select().from(courses),
  ]);
  const courseMap = new Map(coursesList.map((c) => [c.id, c.code]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Notes</h1>
        <p className="muted mt-1 text-sm">
          Short notes tied to your account. Prefer keywords and formulas over full transcripts.
        </p>
      </div>

      <AddNote />

      {rows.length === 0 ? (
        <p className="surface-2 p-4 text-sm muted">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((n) => (
            <li key={n.id} className="surface p-3 text-sm">
              <p className="whitespace-pre-wrap text-slate-100">{n.body}</p>
              <div className="muted mt-1 flex gap-3 text-xs">
                <span>{n.type}</span>
                {n.courseId && <span>{courseMap.get(n.courseId) ?? ""}</span>}
                <span>{n.createdAt ? new Date(n.createdAt).toISOString().slice(0, 10) : ""}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
