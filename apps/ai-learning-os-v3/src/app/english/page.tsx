import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { englishAttempts, englishTerms } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { PageHeader, Shell } from "@/components/shell";
import { EnglishActivityForm } from "@/components/english-forms";

export const dynamic = "force-dynamic";

const DIMENSIONS = [
  "reading",
  "listening",
  "writing",
  "speaking",
  "interaction",
  "vocabulary",
  "professional",
];

const ACTIVITIES = [
  {
    dimension: "writing",
    activity: "Write a pull request description",
    prompt:
      "Write the PR description for your most recent change using What / Why / How / Risk. The first line must be an imperative sentence.",
  },
  {
    dimension: "speaking",
    activity: "Explain your architecture aloud (90 seconds)",
    prompt:
      "Without reading, explain the architecture of your current project: the components, the data flow, and the one failure mode you worry about most.",
  },
  {
    dimension: "speaking",
    activity: "Answer a technical interview question",
    prompt:
      "Answer aloud: 'Your RAG system cites the wrong document after a corpus refresh. Walk me through your triage.' Structure it: symptom, hypotheses, cheapest test first.",
  },
  {
    dimension: "interaction",
    activity: "Run a client discovery exchange",
    prompt:
      "A client says: 'We want AI in our product.' Write the first five questions you would ask, in order, and say why each one comes before the next.",
  },
  {
    dimension: "professional",
    activity: "Write an incident update",
    prompt:
      "Write a three-sentence incident update for non-technical stakeholders: user impact, action taken, time of the next update. No speculation about root cause.",
  },
  {
    dimension: "reading",
    activity: "Summarise a technical paragraph",
    prompt:
      "Take one paragraph from documentation you are currently using. Summarise its claim in two sentences, then write one question the documentation does not answer.",
  },
  {
    dimension: "vocabulary",
    activity: "Use five target terms in context",
    prompt:
      "Write five sentences about your current project, each using one of: idempotency, observability, calibration, provenance, least privilege. The sentences must be true about your work.",
  },
  {
    dimension: "listening",
    activity: "Shadow a technical explanation",
    prompt:
      "Listen to 60 seconds of a technical talk you choose, shadow it aloud, then write down three collocations you heard and would reuse.",
  },
];

export default async function EnglishPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const [terms, byDimension, recent] = await Promise.all([
    db.select().from(englishTerms),
    db
      .select({
        dimension: englishAttempts.dimension,
        n: sql<number>`count(*)::int`,
        avg: sql<number>`coalesce(avg(${englishAttempts.selfRating}), 0)::float`,
      })
      .from(englishAttempts)
      .where(eq(englishAttempts.userId, user.id))
      .groupBy(englishAttempts.dimension),
    db
      .select()
      .from(englishAttempts)
      .where(eq(englishAttempts.userId, user.id))
      .orderBy(desc(englishAttempts.createdAt))
      .limit(6),
  ]);

  const stats = new Map(byDimension.map((d) => [d.dimension, d]));

  return (
    <Shell user={user} active="/english">
      <PageHeader
        title="Technical English"
        lead="Seven dimensions tracked separately. A CEFR level is never claimed from vocabulary count, and no pronunciation score is produced by technology that cannot reliably measure it. Your engineering artefacts are the English classroom."
      />

      <section className="grid sm:grid-cols-4 gap-2.5">
        {DIMENSIONS.map((d) => {
          const s = stats.get(d);
          return (
            <div key={d} className="surface px-3 py-2.5">
              <p className="text-[11px] muted capitalize">{d}</p>
              <p className="text-base font-semibold tabular-nums">{s?.n ?? 0}</p>
              <p className="text-[11px] muted">
                {s ? `self-rating ${s.avg.toFixed(1)}/5` : "no evidence"}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Training activity</h2>
        <EnglishActivityForm dimensions={DIMENSIONS} activities={ACTIVITIES} />
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Vocabulary with assistance</h2>
        <p className="muted text-xs mb-3 leading-relaxed">
          Standard Technical English is the default: the canonical term is never hidden. The simplified
          definition sits beside it, not instead of it.
        </p>
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {terms.map((t) => (
            <li key={t.id} className="surface p-3">
              <p className="text-[13px] font-medium">
                {t.term} <span className="tag ml-1">{t.category}</span>
              </p>
              <p className="muted text-xs mt-1.5">{t.b1b2}</p>
              <p className="text-xs mt-1" dir="rtl">
                {t.arabic}
              </p>
              <p className="muted text-[11px] mt-1.5 italic">{t.example}</p>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold mb-2">Your recent responses</h2>
          <ul className="space-y-2">
            {recent.map((r) => (
              <li key={r.id} className="surface p-3">
                <p className="text-[11px] muted">
                  <span className="tag">{r.dimension}</span> {r.activity} ·{" "}
                  {new Date(r.createdAt).toLocaleString()} · self-rating {r.selfRating}/5
                </p>
                <p className="prose-block text-[13px] mt-1.5 whitespace-pre-wrap">{r.response}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Shell>
  );
}
