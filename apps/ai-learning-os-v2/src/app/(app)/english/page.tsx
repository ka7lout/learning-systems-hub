import { requireUser } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import { db } from "@/db";
import { englishTerms, englishAttempts } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { PageHeader, Section } from "@/components/ui";
import { SpeakingBox } from "@/components/client";

const DIMS = ["Reading", "Listening", "Writing", "Speaking", "Interaction", "Technical Vocabulary", "Professional Communication"];
const TASKS = [
  { activity: "explain-concept", dimension: "Speaking", prompt: "Explain, in about one minute, the difference between overfitting and underfitting, and how you would detect each." },
  { activity: "pr-description", dimension: "Writing", prompt: "Write a pull-request description for a change that adds input validation to a model-serving API." },
  { activity: "interview", dimension: "Interaction", prompt: "Interview question: Tell me about a time a model performed well offline but poorly in production. What did you do? (Use a real or study project — don't invent results.)" },
  { activity: "client-summary", dimension: "Professional Communication", prompt: "Write a short client-facing summary explaining why a RAG approach was chosen over fine-tuning, without jargon overload." },
  { activity: "incident", dimension: "Speaking", prompt: "Respond to an incident: API latency has tripled in the last hour. Explain to your team lead what you will check first and why." },
];

export default async function English() {
  const u = await requireUser();
  await ensureSeed();
  const [terms, hist] = await Promise.all([db.select().from(englishTerms).orderBy(asc(englishTerms.term)), db.select().from(englishAttempts).where(eq(englishAttempts.ownerId, u.id)).orderBy(desc(englishAttempts.createdAt)).limit(50)]);
  const counts = Object.fromEntries(DIMS.map((d) => [d, hist.filter((h) => h.dimension === d).length]));
  return (
    <>
      <PageHeader title="Technical English" lead="Technical work is the English classroom. Dimensions are tracked separately; no CEFR level is claimed from vocabulary counts." />
      <Section title="Your activity by dimension"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{DIMS.map((d) => <div key={d} className="card p-3"><div className="text-xs text-muted">{d}</div><div className="text-lg font-semibold">{counts[d]}</div></div>)}</div></Section>
      <Section title="Speaking & writing lab"><div className="grid gap-4 lg:grid-cols-2">{TASKS.map((t) => <SpeakingBox key={t.activity} {...t} />)}</div></Section>
      <Section title="Core technical vocabulary">
        <dl className="grid gap-3 md:grid-cols-2">{terms.map((t) => (
          <div key={t.term} className="card p-3 text-sm"><dt className="font-medium">{t.term} <span className="font-normal text-muted" lang="ar" dir="rtl">· {t.arabic}</span></dt><dd className="mt-1">{t.simple}</dd><dd className="mt-1 text-xs italic text-muted">{t.example}</dd></div>
        ))}</dl>
      </Section>
      {hist.length > 0 && <Section title="Recent attempts"><ul className="space-y-2">{hist.slice(0, 5).map((h) => <li key={h.id} className="card p-3 text-sm"><div className="text-xs text-muted">{h.dimension} · {h.createdAt.toLocaleDateString()}</div><p className="mt-1 line-clamp-3">{h.response}</p></li>)}</ul></Section>}
    </>
  );
}
