import { and, desc, eq, sql } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, SectionTitle, Badge } from "@/components/ui";
import { db } from "@/db";
import { mentorMessages } from "@/db/schema";
import { sendMentorMessageAction } from "@/app/actions";
import { externalProviderConfigured } from "@/lib/ai";

export default async function MentorPage() {
  const user = await requireUser();
  const live = externalProviderConfigured();
  const messages = await db
    .select()
    .from(mentorMessages)
    .where(eq(mentorMessages.userId, user.id))
    .orderBy(desc(mentorMessages.createdAt))
    .limit(40);

  const attemptless = await db
    .select({ count: sql<number>`count(*)` })
    .from(mentorMessages)
    .where(
      and(
        eq(mentorMessages.userId, user.id),
        eq(mentorMessages.role, "user"),
        sql`${mentorMessages.createdAt} > now() - interval '24 hours'`
      )
    );
  const recentCount = Number(attemptless[0]?.count ?? 0);

  return (
    <PageShell path="/mentor">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">AI Mentor</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-ink-soft">
        The mentor follows the IHLS contract: attempt first, smallest useful hint, then deeper
        explanation — full reference lectures on explicit request. It is a scaffold, not a
        substitute for your thinking.
      </p>

      {!live && (
        <Card className="mt-4 border-l-4 border-l-warn">
          <p className="text-[13.5px] font-semibold text-ink">Live AI model: not configured</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            No AI provider credentials are set on this server, so a clearly-labeled rule-based
            Socratic guide answers instead. Nothing is simulated: to enable the live mentor, an
            administrator must set <code className="rounded bg-surface px-1">PUTER_AUTH_TOKEN</code>,{" "}
            <code className="rounded bg-surface px-1">OPENAI_API_KEY</code>, or{" "}
            <code className="rounded bg-surface px-1">ANTHROPIC_API_KEY</code>.
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <form action={sendMentorMessageAction} className="space-y-2">
              <label htmlFor="mentor-input" className="block text-[13px] font-medium text-ink-soft">
                Show your attempt, then ask
              </label>
              <textarea
                id="mentor-input"
                name="message"
                required
                rows={4}
                maxLength={4000}
                placeholder='e.g., "My attempt at the Bayes screening problem: P = 0.019 because… — check my reasoning" '
                className="w-full rounded-lg border border-line px-3 py-2 text-[13.5px]"
              />
              <div className="flex items-center gap-3">
                <button className="rounded-lg bg-navy px-4 py-2 text-[13.5px] font-medium text-white hover:bg-navy-deep">
                  Send
                </button>
                <span className="text-[12px] text-ink-faint">{recentCount} message(s) in the last 24h · limit 30/hour</span>
              </div>
            </form>
          </Card>

          <div className="mt-4 space-y-3">
            {messages.length === 0 && (
              <Card>
                <p className="text-[13.5px] text-ink-soft">
                  No conversation yet. Open a lesson and use its mentor panel so the mentor anchors
                  to real objectives — or start here with an attempt.
                </p>
              </Card>
            )}
            {[...messages].reverse().map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border px-4 py-3 ${
                  m.role === "user"
                    ? "border-accent/20 bg-accent-soft"
                    : m.role === "system"
                      ? "border-warn/20 bg-warn-soft"
                      : "border-line bg-card"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
                    {m.role === "user" ? "You" : m.role === "system" ? "System" : "Mentor"}
                  </span>
                  {m.provider && m.role === "mentor" && (
                    <Badge tone={m.provider === "socratic-fallback" ? "warn" : "good"}>
                      {m.provider === "socratic-fallback" ? "rule-based guide" : m.provider}
                    </Badge>
                  )}
                  {m.lessonSlug && <Badge>{m.lessonSlug}</Badge>}
                </div>
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">{m.content}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="self-start">
          <SectionTitle sub="How to get the most teaching per message.">Mentor contract</SectionTitle>
          <ul className="list-disc space-y-1.5 pl-4 text-[13px] text-ink-soft">
            <li>Attempt first — even a wrong attempt produces diagnostic signal.</li>
            <li>Ask for hints before answers: “smallest useful hint.”</li>
            <li>Request explicit modes: “full lecture,” “B1–B2 English,” “Arabic explanation,” “challenge me.”</li>
            <li>Anti-reassurance guardrail: the mentor won't re-confirm the same answer endlessly — it will push you to application.</li>
            <li>Dependency watch: repeated answer-seeking without attempts changes the strategy to explain-back and prediction tasks.</li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
