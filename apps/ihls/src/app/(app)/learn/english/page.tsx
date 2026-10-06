import { pageSession } from "@/lib/auth/page-session";
import { buildCurriculumGraph, ENGLISH_DIMENSIONS, SPEAKING_ACTIVITIES } from "@/content";
import { getSettings, owned, type SpeakingAttemptDoc } from "@/lib/dal";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, EmptyState } from "@/components/ui";
import { SpeakingLog } from "@/components/SpeakingLog";

export const dynamic = "force-dynamic";

export default async function EnglishPage() {
  const session = await pageSession();
  const settings = await getSettings(session);
  const graph = buildCurriculumGraph();
  const attempts = await owned<SpeakingAttemptDoc>(session, "speaking_attempts").find({}, { sort: { createdAt: -1 }, limit: 20 });

  const domains = [...new Set(graph.englishTerms.map((t) => t.domain))];

  return (
    <>
      <PageHeader
        title="Technical English"
        lede="The language layer exists so that the engineering is not blocked by vocabulary. Technical terms stay exact; only the sentences around them are simplified."
      >
        <Chip tone="accent">{settings.englishMode === "b1b2" ? "B1–B2 mode" : "Standard technical English"}</Chip>
      </PageHeader>

      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <Card>
              <CardHead title="Terminology" hint={`${graph.englishTerms.length} canonical terms with plain-English and Arabic glosses.`} />
              {domains.map((domain) => (
                <div key={domain} className="border-b border-line last:border-0">
                  <p className="h-section px-5 pt-3">{domain}</p>
                  <ul className="divide-y divide-[var(--line)]">
                    {graph.englishTerms
                      .filter((t) => t.domain === domain)
                      .map((t) => (
                        <li key={t.term} className="px-5 py-3">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-semibold">{t.term}</span>
                            {t.ipa && <span className="text-xs text-ink-3">{t.ipa}</span>}
                          </div>
                          <p className="mt-0.5 text-sm text-ink-2">{t.b1b2}</p>
                          <p className="mt-0.5 text-sm text-ink-2" dir="rtl" lang="ar">{t.arabic}</p>
                          <p className="mt-1 text-xs italic text-ink-3">{t.example}</p>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </Card>

            <Card>
              <CardHead title="Speaking practice" hint="Explaining aloud exposes gaps that writing hides." />
              <div className="card-pad">
                <SpeakingLog activities={SPEAKING_ACTIVITIES} />
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHead title="Tracked separately" hint="§153–159 — seven dimensions, never one level." />
              <ul className="divide-y divide-[var(--line)]">
                {ENGLISH_DIMENSIONS.map((d) => (
                  <li key={d} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <span>{d}</span>
                    <span className="text-xs text-ink-3">
                      {d === "Speaking" ? `${attempts.length} logged attempts` : "no measurement recorded"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line px-5 py-3 text-xs text-ink-3">
                This system does not assign a CEFR level. Knowing twenty terms is not B2, and no vocabulary count here will ever be
                reported as a proficiency certificate.
              </p>
            </Card>

            <Card>
              <CardHead title="Your speaking log" />
              {attempts.length === 0 ? (
                <EmptyState title="Nothing logged yet" body="Speaking attempts appear here with your own transcript and rating. Nothing is recorded or scored automatically." />
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {attempts.map((a) => (
                    <li key={a._id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {SPEAKING_ACTIVITIES.find((x) => x.id === a.activityId)?.label ?? a.activityId}
                        </span>
                        <Chip>self-rated {a.selfRating}/5</Chip>
                      </div>
                      <p className="text-xs text-ink-3">
                        {new Date(a.createdAt).toLocaleString()} · {Math.round(a.durationSeconds / 60)} min
                      </p>
                      <p className="mt-1 text-sm text-ink-2">{a.transcript.slice(0, 240)}{a.transcript.length > 240 ? "…" : ""}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHead title="How to use the modes" />
              <ul className="list-disc space-y-1.5 px-9 py-4 text-sm text-ink-2">
                <li><strong className="text-ink">Standard</strong> — the default. Real technical English, as you will meet it at work.</li>
                <li><strong className="text-ink">B1–B2</strong> — simpler sentence structure around identical technical terms.</li>
                <li><strong className="text-ink">Arabic</strong> — ask the mentor with the Arabic action when a concept will not land in English.</li>
                <li><strong className="text-ink">Vocabulary assistance</strong> — glosses for canonical terms, on demand.</li>
              </ul>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
