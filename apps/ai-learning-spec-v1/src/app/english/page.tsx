import { AppShell } from "@/components/shell";
import { EnglishLab } from "@/components/client";
import { Badge, Card, PageHeader } from "@/components/ui";
import { requirePage } from "@/lib/page";
import { getEnglishActivity, getEnglishTerms } from "@/lib/data";

export const dynamic = "force-dynamic";

const PROMPTS = [
  {
    key: "en-speak-decision",
    dimension: "speaking",
    activity: "Explain a technical decision",
    prompt:
      "Speak for 2–3 minutes: explain a recent technical decision using context → decision → reason → trade-off → what would change it. Use at least three canonical technical terms correctly.",
  },
  {
    key: "en-write-pr",
    dimension: "writing",
    activity: "Write a pull request description",
    prompt:
      "Write a PR description for a change you made: what changed, why, how it was tested, what was deliberately excluded, and the risk. Maximum 200 words.",
  },
  {
    key: "en-write-incident",
    dimension: "writing",
    activity: "Write an incident update",
    prompt:
      "Write a 120-word incident update for a non-engineering stakeholder: impact, current status, what you are doing, next update time. No blame, no jargon without a gloss.",
  },
  {
    key: "en-interaction-interview",
    dimension: "interaction",
    activity: "Answer a technical interview question",
    prompt:
      "Answer aloud: 'Tell me about a time a model or system behaved worse in production than in evaluation. What did you do?' Structure: situation, action, measurement, result, lesson.",
  },
  {
    key: "en-interaction-client",
    dimension: "interaction",
    activity: "Client discovery call",
    prompt:
      "A client says their chatbot 'should be smarter'. Write or speak the five questions you ask next, in professional, non-condescending English.",
  },
  {
    key: "en-reading",
    dimension: "reading",
    activity: "Technical reading summary",
    prompt:
      "Read the abstract and conclusion of any paper or official documentation page. In 100 words, state the claim, the evidence, and one unstated assumption.",
  },
  {
    key: "en-vocab",
    dimension: "vocabulary",
    activity: "Use five terms in context",
    prompt:
      "Write five sentences, each using one of: idempotent, calibration, observability, generalization, trade-off. The sentences must describe your own work, not a dictionary definition.",
  },
  {
    key: "en-professional",
    dimension: "professional",
    activity: "Design document section",
    prompt:
      "Write the 'Alternatives considered' section of a design document for a system you built. Two alternatives, why rejected, what would make you reconsider.",
  },
];

const DIMENSIONS = ["reading", "listening", "writing", "speaking", "interaction", "vocabulary", "professional"];

export default async function EnglishPage() {
  const user = await requirePage();
  const [terms, activity] = await Promise.all([getEnglishTerms(), getEnglishActivity(user.id)]);
  const counts = new Map<string, number>();
  for (const a of activity) counts.set(a.dimension, (counts.get(a.dimension) ?? 0) + 1);

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Technical English"
        title="The engineering work is the English classroom"
        description="Standard Technical English is the default: real terminology, not simplified vocabulary. Progress is tracked per dimension, and no CEFR level is claimed from vocabulary counts."
      />

      <section className="mb-6 grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {DIMENSIONS.map((d) => (
          <div key={d} className="rounded-lg border border-line bg-surface p-3">
            <p className="text-xs capitalize text-muted">{d}</p>
            <p className="text-lg font-semibold tabular-nums text-ink">{counts.get(d) ?? 0}</p>
            <p className="text-[11px] text-muted">activities</p>
          </div>
        ))}
      </section>

      <Card className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Speaking and writing lab</h2>
        <EnglishLab prompts={PROMPTS} />
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-sm font-semibold text-ink">Technical vocabulary</h2>
        <p className="mb-3 text-xs text-muted">
          Canonical English term, a B1-B2 definition, Arabic meaning and a usage example. The term itself is never
          replaced by a simplified word.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {terms.map((t) => (
            <div key={t.term} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{t.term}</p>
                <Badge>{t.domain}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{t.simpleDefinition}</p>
              {t.arabic ? (
                <p dir="rtl" className="mt-1 text-sm text-muted">
                  {t.arabic}
                </p>
              ) : null}
              <p className="mt-1 text-xs italic text-muted">{t.example}</p>
            </div>
          ))}
        </div>
      </Card>

      {activity.length > 0 ? (
        <Card className="mt-6 p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Your recorded activity</h2>
          <ul className="space-y-2 text-sm">
            {activity.slice(0, 10).map((a) => (
              <li key={a.id} className="border-b border-line pb-2 last:border-0">
                <p className="text-xs uppercase tracking-wide text-muted">
                  {a.dimension} · {a.mode} · {new Date(a.createdAt).toLocaleDateString()}
                </p>
                <p className="text-ink">{a.activity}</p>
                <p className="mt-1 line-clamp-3 text-xs text-muted">{a.response}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </AppShell>
  );
}
