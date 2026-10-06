import Link from "next/link";
import { pageSession } from "@/lib/auth/page-session";
import { owned, type AiMessageDoc, type AiThreadDoc } from "@/lib/dal";
import { MENTOR_ACTIONS, SPECIALISTS } from "@/lib/ai/mentor";
import { aiDependencyAudit } from "@/lib/ai/mentor";
import { PageBody, PageHeader } from "@/components/Shell";
import { Card, CardHead, Chip, EmptyState, Meter } from "@/components/ui";
import { MentorPanel } from "@/components/MentorPanel";

export const dynamic = "force-dynamic";

export default async function MentorPage({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  const { thread: threadParam } = await searchParams;
  const session = await pageSession();
  const threads = await owned<AiThreadDoc>(session, "ai_threads").find({}, { sort: { lastMessageAt: -1 }, limit: 20 });
  const activeThread = threadParam ? threads.find((t) => t._id === threadParam) : undefined;
  const messages = activeThread
    ? await owned<AiMessageDoc>(session, "ai_messages").find({ threadId: activeThread._id }, { sort: { createdAt: 1 }, limit: 100 })
    : [];
  const audit = await aiDependencyAudit(session);
  const providerConfigured = Boolean(process.env.PUTER_AUTH_TOKEN);

  return (
    <>
      <PageHeader
        title="AI Mentor"
        lede="One lead mentor, routed to a specialist for the task at hand. It teaches with the smallest useful help and refuses to do the thinking for you."
      >
        {activeThread && <Link href="/mentor" className="btn btn-sm">New conversation</Link>}
      </PageHeader>

      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHead
              title={activeThread ? activeThread.title : "New conversation"}
              hint={activeThread ? `Started ${new Date(activeThread.createdAt).toLocaleString()}` : "Scoped to your own record only."}
            />
            <MentorPanel
              actions={MENTOR_ACTIONS.map((a) => ({ id: a.id, label: a.label, helpLevel: a.helpLevel }))}
              providerConfigured={providerConfigured}
              initialThreadId={activeThread?._id}
              initialMessages={messages.map((m) => ({
                role: m.role === "student" ? ("student" as const) : ("mentor" as const),
                content: m.content,
                status: m.status,
                specialist: SPECIALISTS.find((s) => s.id === m.specialist)?.label ?? m.specialist,
              }))}
            />
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHead title="Your conversations" />
              {threads.length === 0 ? (
                <EmptyState title="No conversations yet" body="Threads appear here once you ask something. They are private to your account." />
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {threads.map((t) => (
                    <li key={t._id} className="px-5 py-2.5">
                      <Link href={`/mentor?thread=${t._id}`} className="text-sm underline-offset-2 hover:underline">
                        {t.title}
                      </Link>
                      <p className="text-xs text-ink-3">{new Date(t.lastMessageAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHead title="Dependency check" hint="Help you used, measured — not guessed." />
              <div className="card-pad">
                {audit.total === 0 ? (
                  <p className="text-sm text-ink-3">No attempts recorded, so there is nothing to measure yet.</p>
                ) : (
                  <>
                    <Meter value={audit.unaidedRate ?? 0} label="Unaided or hint-level attempts" />
                    <p className="mt-2 text-sm text-ink-2">{audit.verdict}</p>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <CardHead title="The council" hint="§139 — one specialist per request, no agent loops." />
              <ul className="divide-y divide-[var(--line)]">
                {SPECIALISTS.map((s) => (
                  <li key={s.id} className="px-5 py-2.5">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-ink-2">{s.brief}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHead title="What the mentor can see" hint="Scoped retrieval." />
              <ul className="list-disc space-y-1 px-9 py-4 text-sm text-ink-2">
                <li>The lesson or task you are on, and at most two relevant extracts from it.</li>
                <li>Your own mastery levels and your three most recent unresolved errors.</li>
                <li>Your English mode and study-state preferences.</li>
                <li>Nothing belonging to any other student, ever.</li>
              </ul>
              {!providerConfigured && (
                <p className="border-t border-line px-5 py-3 text-xs" style={{ color: "var(--caution)" }}>
                  No provider token is configured on this deployment, so requests return a truthful failure instead of an answer.
                </p>
              )}
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
