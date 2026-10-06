import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { curriculumNodes, nodePrerequisites, practiceItems, sources, englishTerms, aiThreads, aiMessages, settings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getMasteryMap, markContentSeen, CORE_THRESHOLD } from "@/lib/engine";
import { MasteryBadge, SourceBadge, StatusBadge } from "@/components/ui";
import { PracticeBlock } from "@/components/PracticeBlock";
import { MentorPanel } from "@/components/MentorPanel";
import { VocabText } from "@/components/VocabText";

export default async function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [node] = await db.select().from(curriculumNodes).where(and(eq(curriculumNodes.id, id), eq(curriculumNodes.type, "lesson"))).limit(1);
  if (!node) notFound();
  await markContentSeen(user.id, node.id);

  const [parent] = node.parentId ? await db.select().from(curriculumNodes).where(eq(curriculumNodes.id, node.parentId)).limit(1) : [];
  const [topics, preRows, items, mastery, srcRows, terms, prefs, siblings] = await Promise.all([
    db.select().from(curriculumNodes).where(and(eq(curriculumNodes.parentId, node.id), eq(curriculumNodes.type, "topic"))).orderBy(asc(curriculumNodes.position)),
    db.select({ id: curriculumNodes.id, title: curriculumNodes.title }).from(nodePrerequisites).innerJoin(curriculumNodes, eq(curriculumNodes.id, nodePrerequisites.prerequisiteId)).where(eq(nodePrerequisites.nodeId, node.id)),
    db.select().from(practiceItems).where(eq(practiceItems.nodeId, node.id)).orderBy(asc(practiceItems.position)),
    getMasteryMap(user.id),
    node.sourceRefs.length ? db.select().from(sources).where(inArray(sources.id, node.sourceRefs)) : Promise.resolve([]),
    db.select().from(englishTerms),
    db.select().from(settings).where(eq(settings.ownerId, user.id)).limit(1),
    node.parentId ? db.select({ id: curriculumNodes.id, title: curriculumNodes.title, position: curriculumNodes.position }).from(curriculumNodes).where(and(eq(curriculumNodes.parentId, node.parentId), eq(curriculumNodes.type, "lesson"))).orderBy(asc(curriculumNodes.position)) : Promise.resolve([]),
  ]);
  const [thread] = await db.select().from(aiThreads).where(and(eq(aiThreads.ownerId, user.id), eq(aiThreads.nodeId, node.id))).orderBy(asc(aiThreads.createdAt)).limit(1);
  const msgs = thread ? await db.select().from(aiMessages).where(eq(aiMessages.threadId, thread.id)).orderBy(asc(aiMessages.createdAt)) : [];
  const m = mastery.get(node.id);
  const nextSibling = siblings.find((s) => s.position > (siblings.find((x) => x.id === node.id)?.position ?? 0));
  const vocab = prefs[0]?.vocabularyAssist !== false;
  const b1b2 = prefs[0]?.englishMode === "b1b2";

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="text-xs text-muted"><Link href="/curriculum" className="hover:underline">Curriculum</Link>{parent && <> / <span>{parent.title}</span></>} / <span className="text-ink">{node.title}</span></nav>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{node.title}</h1>
        <SourceBadge s={node.sourceCategory} /><span className="badge">{node.priority}</span><span className="badge">{node.level}</span><span className="badge">~{node.estimatedMinutes} min</span><MasteryBadge level={m?.level} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <section className="card border-accent/40 p-5">
            <h2 className="text-sm font-semibold text-accent">Why this matters</h2>
            <p className="mt-1 text-sm leading-relaxed"><VocabText text={node.why} terms={vocab ? terms : []} /></p>
            <h3 className="mt-4 text-sm font-semibold">Learning objectives</h3>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{node.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Prerequisite check</h2>
            {preRows.length === 0 ? <p className="mt-1 text-sm text-muted">No prerequisites — this is an entry point.</p> : (
              <ul className="mt-2 flex flex-wrap gap-1.5">{preRows.map((p) => { const lvl = mastery.get(p.id)?.level ?? 0; return <li key={p.id}><Link href={`/learn/${p.id}`} className={`badge hover:underline ${lvl >= CORE_THRESHOLD ? "!bg-ok-soft !text-ok" : "!bg-warn-soft !text-warn"}`}>{p.title} · L{lvl}</Link></li>; })}</ul>
            )}
            {preRows.some((p) => (mastery.get(p.id)?.level ?? 0) < CORE_THRESHOLD) && <p className="mt-2 text-xs text-muted">Some prerequisites are below the core threshold (L{CORE_THRESHOLD}). You may continue, but if this lesson feels like overload, the right move is to back up, repair the prerequisite, and return.</p>}
          </section>

          {b1b2 && <p className="rounded-md bg-accent-soft px-3 py-2 text-xs text-accent-strong">B1–B2 mode is on: lesson text is written in Standard Technical English; use the Mentor's “B1–B2 English” action for simplified phrasing that keeps the canonical terms.</p>}

          {node.content.map((s, i) => (
            <section key={i} className={`card p-5 ${s.kind === "case" ? "border-warn/40" : ""}`}>
              <h2 className="text-sm font-semibold">{s.heading}</h2>
              <div className="prose-ihl mt-2 text-sm">
                {s.body.split("\n\n").map((p, j) => <p key={j} className="whitespace-pre-wrap"><VocabText text={p} terms={vocab ? terms : []} /></p>)}
                {s.code && <pre><code>{s.code.source}</code></pre>}
              </div>
            </section>
          ))}

          {topics.length > 0 && (
            <section className="card p-5">
              <h2 className="text-sm font-semibold">Topics in this block ({topics.length})</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">{topics.map((t) => <span key={t.id} className="badge">{t.title}</span>)}</div>
            </section>
          )}

          {node.harvardMapping.length > 0 && (
            <section className="card p-5">
              <h2 className="text-sm font-semibold">Harvard mapping</h2>
              <p className="text-xs text-muted">Each row states exact-match, depth, what Harvard adds, what we add beyond Harvard, and a verification status with source. This is a Harvard-informed self-study mapping, not enrolment.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="text-muted"><th className="py-1 pr-3">Course</th><th className="py-1 pr-3">School</th><th className="py-1 pr-3">Exact?</th><th className="py-1 pr-3">Depth</th><th className="py-1 pr-3">Harvard adds</th><th className="py-1 pr-3">We add</th><th className="py-1">Status</th></tr></thead>
                  <tbody>{node.harvardMapping.map((h, i) => <tr key={i} className="border-t border-border align-top"><td className="py-1.5 pr-3 font-medium">{h.course}<div className="font-normal text-muted">{h.title}</div></td><td className="py-1.5 pr-3">{h.school}</td><td className="py-1.5 pr-3">{h.exactMatch ? "Yes" : "Partial"}</td><td className="py-1.5 pr-3">{h.depth}</td><td className="py-1.5 pr-3">{h.harvardAdds || "—"}</td><td className="py-1.5 pr-3">{h.weAddBeyond || "—"}</td><td className="py-1.5"><StatusBadge s={h.status} /></td></tr>)}</tbody>
                </table>
              </div>
            </section>
          )}
          {node.harvardMapping.length === 0 && node.sourceCategory === "original" && <p className="text-xs text-muted">No Harvard mapping: this block is kept as an explicit practical/business extension of your original curriculum (not found as Harvard CS core content).</p>}

          {srcRows.length > 0 && (
            <section className="card p-5">
              <h2 className="text-sm font-semibold">Sources</h2>
              <ul className="mt-2 space-y-1.5 text-xs">{srcRows.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer" className="text-accent underline">{s.title}</a> — {s.publisher} <StatusBadge s={s.verificationStatus} />{s.accessedAt && <span className="text-muted"> · retrieved {s.accessedAt.toISOString().slice(0, 10)}</span>}<div className="text-muted">{s.notes}</div></li>)}</ul>
            </section>
          )}

          <h2 className="pt-2 text-lg font-semibold">Mastery checkpoint</h2>
          <p className="-mt-4 text-sm text-muted">Recall → application → transfer. Items are filtered by your current study state. Mastery updates only from recorded attempts.</p>
          <PracticeBlock items={items.map((i) => ({ id: i.id, nodeId: i.nodeId, type: i.type, difficulty: i.difficulty, prompt: i.prompt, rubric: i.rubric, reference: i.reference, isTransfer: i.isTransfer }))} />

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Mastery criteria for this block</h2>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{node.masteryCriteria.map((c) => <li key={c}>{c}</li>)}</ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {nextSibling && <Link href={`/learn/${nextSibling.id}`} className="btn btn-primary">Next: {nextSibling.title}</Link>}
              <Link href="/review" className="btn">Review queue</Link>
              <Link href="/projects" className="btn">Build something</Link>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <MentorPanel nodeId={node.id} nodeTitle={node.title} compact initialThread={thread ? { id: thread.id, messages: msgs.filter((x) => x.role !== "system_note").map((x) => ({ role: x.role as "user" | "assistant", content: x.content, specialist: x.specialist ?? undefined, error: x.status !== "ok" })) } : undefined} />
          {node.notebook && (
            <section className="card p-4" aria-label="Notebook guidance">
              <h2 className="text-sm font-semibold">Notebook guidance</h2>
              <div className="mt-2 text-xs"><div className="font-semibold text-accent">MUST WRITE</div><ul className="mt-1 list-disc space-y-0.5 pl-4">{node.notebook.mustWrite.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="mt-3 text-xs"><div className="font-semibold">RECOMMENDED</div><ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted">{node.notebook.recommended.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="mt-3 text-xs"><div className="font-semibold">OPTIONAL</div><ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted">{node.notebook.optional.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
