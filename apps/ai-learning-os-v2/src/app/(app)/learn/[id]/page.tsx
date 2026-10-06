import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, getSettings } from "@/lib/auth";
import { unit, masteryMap } from "@/lib/dal";
import { db } from "@/db";
import { englishTerms, projectCatalog } from "@/db/schema";
import { sql } from "drizzle-orm";
import { Section, Status, Bar } from "@/components/ui";
import { SeenMarker, PracticeBox, MentorPanel, StateSelector } from "@/components/client";
import { STATE_COPY, LEVEL_LABELS, type StudyState } from "@/lib/learning";

function VocabText({ text, terms, arabic }: { text: string; terms: { term: string; simple: string; arabic: string }[]; arabic: boolean }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`\\b(${terms.map((t) => t.term.replace(/[-]/g, "\\-")).join("|")})\\b`, "gi");
  const parts = text.split(re);
  return <>{parts.map((p, i) => { const t = terms.find((x) => x.term.toLowerCase() === p.toLowerCase()); return t ? <abbr key={i} className="term no-underline" title={`${t.simple}${arabic ? ` — ${t.arabic}` : ""}`}>{p}</abbr> : <span key={i}>{p}</span>; })}</>;
}

export default async function LearnUnit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requireUser();
  const data = await unit(id);
  if (!data || data.node.type !== "unit") notFound();
  const { node, items, maps, sources, prereqs } = data;
  const [{ data: s }, m, terms, projects] = await Promise.all([
    getSettings(u.id), masteryMap(u.id), db.select().from(englishTerms),
    db.select({ id: projectCatalog.id, title: projectCatalog.title }).from(projectCatalog).where(sql`${projectCatalog.nodeIds} ? ${id}`),
  ]);
  const rec = m.get(id);
  const state = s.studyState as StudyState;
  const order = STATE_COPY[state].taskStages;
  const sorted = [...items].sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage)).filter((i) => order.includes(i.stage) || state === "deep");
  const visible = state === "deep" ? sorted : sorted.slice(0, 1);
  const hidden = items.length - visible.length;
  const weakPrereq = prereqs.filter((p) => (m.get(p.id)?.level ?? 0) < 3);
  const vt = (t: string) => s.vocabAssist ? <VocabText text={t} terms={terms} arabic={s.contentMode === "arabic" || s.uiLanguage === "ar"} /> : t;
  const plans = Object.fromEntries(Object.entries(STATE_COPY).map(([k, v]) => [k, v.plan]));
  return (
    <>
      <SeenMarker nodeId={id} />
      <nav aria-label="Breadcrumb" className="mb-2 text-xs text-muted"><Link href="/curriculum" className="hover:underline">Curriculum</Link> / {node.spine}</nav>
      <h1 className="text-2xl font-semibold tracking-tight">{node.title}</h1>
      <div className="mt-2 flex flex-wrap gap-1.5"><span className="chip">{node.sourceCategory}</span><span className="chip">{node.tier}</span><span className="chip">{node.level}</span><span className="chip">v{node.version} · verified {node.lastVerified}</span></div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <Section title="Why this matters"><p className="text-[15px]">{vt(node.why)}</p></Section>
          {weakPrereq.length > 0 && <p className="mb-6 rounded-md border border-warn/40 p-3 text-sm">Prerequisite check: {weakPrereq.map((p, i) => <span key={p.id}>{i > 0 && ", "}<Link className="text-accent underline" href={`/learn/${p.id}`}>{p.title}</Link></span>)} {weakPrereq.length > 1 ? "are" : "is"} below the safe threshold (L3). If this unit feels overwhelming, back up there first, then return.</p>}
          <Section title="Learning objectives"><ul className="list-disc space-y-1 pl-5 text-sm">{node.objectives.map((o) => <li key={o}>{o}</li>)}</ul></Section>
          <Section title="Topics in this unit">
            <ul className="flex flex-wrap gap-1.5">{node.topics.map((t) => <li key={t} className="chip !text-ink">{t}</li>)}</ul>
            <p className="mt-3 text-xs text-muted">Study each topic from a primary resource (official docs, open textbooks, or the linked sources), then close it and come back here to attempt. Use the mentor for an explanation if you want one.</p>
          </Section>
          <Section title="Notebook guidance">
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="card p-3"><div className="text-xs font-semibold uppercase text-accent">Must write</div><ul className="mt-1 list-disc pl-4 space-y-0.5">{node.mustWrite.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="card p-3"><div className="text-xs font-semibold uppercase text-muted">Recommended</div><ul className="mt-1 list-disc pl-4 space-y-0.5"><li>One diagram or mental model</li><li>Links to what this depends on / enables</li><li>Your retrieval question for later</li></ul></div>
              <div className="card p-3"><div className="text-xs font-semibold uppercase text-muted">Optional</div><ul className="mt-1 list-disc pl-4 space-y-0.5"><li>API reference details</li><li>Extra examples</li></ul><p className="mt-2 text-xs text-muted">Don’t copy the lesson.</p></div>
            </div>
          </Section>
          <Section title="Practice: recall → application → transfer" aside={<span className="text-xs text-muted">Adapted to: {STATE_COPY[state].label}</span>}>
            <div id="practice" className="space-y-4">{visible.map((it) => <PracticeBox key={it.id} item={it} state={state} />)}</div>
            {hidden > 0 && <p className="mt-2 text-xs text-muted">{hidden} more task{hidden > 1 ? "s" : ""} (including transfer) unlock when you switch to “I’m focused”. One thing at a time is fine.</p>}
          </Section>
          <Section title="Mastery checkpoint">
            <div className="card p-4 text-sm">
              <p>Current: <strong>L{rec?.level ?? 0} — {LEVEL_LABELS[rec?.level ?? 0]}</strong></p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(["recall", "application", "transfer"] as const).map((k) => <div key={k}><div className="text-xs capitalize text-muted">{k}</div><Bar value={rec?.[k] ?? 0} label={k} /></div>)}
              </div>
              <p className="mt-3 text-xs text-muted">Independent successes: {rec?.independentCount ?? 0} · Assisted attempts: {rec?.assistedCount ?? 0}</p>
              <ul className="mt-2 list-disc pl-5 text-xs text-muted">{node.masteryCriteria.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          </Section>
          {projects.length > 0 && <Section title="Build it"><ul className="text-sm space-y-1">{projects.map((p) => <li key={p.id}><Link className="text-accent hover:underline" href="/projects">{p.title}</Link></li>)}</ul></Section>}
          <Section title="Sources & Harvard mapping">
            {maps.length === 0 && sources.length === 0 ? <p className="text-sm text-muted">No external source mapping recorded for this unit; it is part of the Original Curriculum or a design decision.</p> : (
              <ul className="space-y-2 text-sm">
                {maps.map((x) => <li key={x.id} className="card p-3">{x.course} <Status s={x.status} /><div className="text-xs text-muted">{x.match} — adds: {x.adds}</div></li>)}
                {sources.map((x) => <li key={x.id}><a className="text-accent hover:underline" href={x.url} target="_blank" rel="noreferrer">{x.title}</a> <Status s={x.verificationStatus} /></li>)}
              </ul>
            )}
          </Section>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-4"><StateSelector current={s.studyState} plans={plans} /></div>
          <div className="card p-4"><h2 className="mb-2 text-sm font-semibold">Mentor</h2><MentorPanel nodeId={id} /></div>
        </aside>
      </div>
    </>
  );
}
