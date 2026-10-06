import Link from "next/link";
import { AppShell } from "@/components/shell";
import { Card, PageHeader, SourceBadge } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { ensureReady, getAllSources } from "@/lib/data";

export const dynamic = "force-dynamic";

const STATUS_NOTES = [
  ["confirmed_current", "Checked against a primary source during this build."],
  ["confirmed_historical", "Confirmed, but from a past term or an archived page."],
  ["likely_not_verified", "Plausible and supplied to the system, but NOT re-checked against the official page in this build."],
  ["not_found", "No supporting primary source was found."],
  ["design_decision", "An internal instructional-design decision, not an external claim."],
  ["research_hypothesis", "A testable hypothesis, not an established finding."],
];

export default async function SourcesPage() {
  const user = await getCurrentUser();
  await ensureReady();
  const sources = await getAllSources();

  const content = (
    <>
      <PageHeader
        eyebrow="Provenance"
        title="Source register"
        description="Every externally derived claim in this curriculum carries one of six verification statuses. They are never collapsed into a single 'verified' label, and nothing is upgraded without a re-check."
      />

      <Card className="mb-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Status model</h2>
        <ul className="space-y-1 text-sm">
          {STATUS_NOTES.map(([status, note]) => (
            <li key={status} className="flex flex-wrap items-center gap-2">
              <SourceBadge status={status} />
              <span className="text-muted">{note}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-3">
        {sources.map((s) => (
          <Card key={s.key} className="p-4">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <SourceBadge status={s.verificationStatus} />
              <span className="text-xs text-muted">{s.sourceType.replace(/_/g, " ")}</span>
              {s.publisher ? <span className="text-xs text-muted">· {s.publisher}</span> : null}
            </div>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-accentink underline underline-offset-4">
                {s.title}
              </a>
            ) : (
              <p className="text-sm font-medium text-ink">{s.title}</p>
            )}
            {s.notes ? <p className="mt-1 text-sm leading-relaxed text-muted">{s.notes}</p> : null}
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Harvard framing</h2>
        <p className="text-sm leading-relaxed text-muted">
          No undergraduate degree named &ldquo;Artificial Intelligence Engineering&rdquo; was found at Harvard, so this
          pathway maps AI engineering onto Computer Science, mathematics, statistics, engineering and Extension material
          instead of inventing one. Harvard College and Harvard Extension School are separate schools and are kept in
          separate layers throughout. This system is not affiliated with Harvard University and completing it earns no
          Harvard credential.
        </p>
      </Card>
    </>
  );

  if (user) return <AppShell user={user}>{content}</AppShell>;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12">
      <Link href="/" className="mb-6 inline-block text-xs text-muted hover:text-ink">
        ← Back
      </Link>
      {content}
    </div>
  );
}
