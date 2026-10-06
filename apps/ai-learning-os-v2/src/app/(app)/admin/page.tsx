import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs, users, nodes, practiceItems, projectCatalog, sources } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { validateCurriculum, ensureSeed } from "@/lib/seed";
import { PageHeader, Section } from "@/components/ui";

export default async function Admin() {
  const u = await requireUser();
  if (u.role !== "admin") notFound();
  await ensureSeed();
  const count = async (t: typeof users | typeof nodes | typeof practiceItems | typeof projectCatalog | typeof sources) => Number((await db.select({ c: sql<number>`count(*)::int` }).from(t))[0].c);
  const [nU, nN, nP, nC, nS, logs] = await Promise.all([count(users), count(nodes), count(practiceItems), count(projectCatalog), count(sources), db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(30)]);
  const errors = validateCurriculum();
  return (
    <>
      <PageHeader title="Admin" lead="Content validation, inventory and security audit. Curriculum content is versioned in code (src/content/curriculum.ts) and published by seed version." />
      <Section title="Publication validation">{errors.length ? <ul className="text-sm text-bad">{errors.map((e) => <li key={e}>{e}</li>)}</ul> : <p className="text-sm text-ok">All checks pass: no broken prerequisites, no cycles, every unit has an assessment and mastery criteria.</p>}</Section>
      <Section title="Inventory"><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[["Accounts", nU], ["Curriculum nodes", nN], ["Practice items", nP], ["Projects", nC], ["Sources", nS]].map(([k, v]) => <div key={k} className="card p-3"><div className="text-xs text-muted">{k}</div><div className="text-lg font-semibold">{v}</div></div>)}</div></Section>
      <Section title="Audit log"><div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs text-muted"><tr><th className="p-3">Time</th><th className="p-3">Action</th><th className="p-3">User</th></tr></thead><tbody className="divide-y divide-line">{logs.map((l) => <tr key={l.id}><td className="p-3 whitespace-nowrap">{l.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td><td className="p-3">{l.action}</td><td className="p-3 text-muted">{l.userId?.slice(0, 8) ?? "—"}</td></tr>)}</tbody></table></div></Section>
    </>
  );
}
