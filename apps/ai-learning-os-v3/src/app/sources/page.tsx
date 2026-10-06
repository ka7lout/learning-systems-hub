import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { sources } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { PageHeader, Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

const STATUS_TAG: Record<string, string> = {
  confirmed_current: "tag-ok",
  confirmed_historical: "tag",
  likely_not_verified: "tag-warn",
  not_found: "tag-warn",
  design_decision: "tag",
  research_hypothesis: "tag",
};

const STATUS_MEANING: Record<string, string> = {
  confirmed_current: "Retrieved during this build and currently published by the primary source.",
  confirmed_historical: "Authentic published work, but not a statement about the present term or edition.",
  likely_not_verified: "Plausible and referenced, but NOT re-verified against the primary source in this build. Do not treat as fact.",
  not_found: "Searched for and not located.",
  design_decision: "An internal choice by this system, not an external claim.",
  research_hypothesis: "A testable proposition, explicitly not an established finding.",
};

export default async function SourcesPage() {
  const user = await getUser();
  if (!user) redirect("/");
  const rows = await db.select().from(sources).orderBy(asc(sources.publisher));
  const grouped = [...new Set(rows.map((r) => r.verificationStatus))];

  return (
    <Shell user={user} active="/sources">
      <PageHeader
        title="Sources and verification status"
        lead="Every externally derived claim in this system carries one of six statuses, and the statuses are never collapsed into a single 'verified' badge. Where a Harvard course identifier was not re-checked against the live catalogue during this build, it is stored as a candidate mapping and labelled as unverified."
      />

      <section className="surface p-4 mb-6">
        <h2 className="text-sm font-medium">What the statuses mean</h2>
        <ul className="mt-2.5 space-y-2 text-[13px]">
          {Object.entries(STATUS_MEANING).map(([k, v]) => (
            <li key={k} className="flex flex-wrap items-start gap-2">
              <span className={STATUS_TAG[k]}>{k}</span>
              <span className="muted flex-1 min-w-[16rem] leading-relaxed">{v}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-6">
        {grouped.map((status) => (
          <section key={status}>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <span className={STATUS_TAG[status] ?? "tag"}>{status}</span>
              <span className="muted font-normal">
                {rows.filter((r) => r.verificationStatus === status).length} source(s)
              </span>
            </h2>
            <ul className="mt-3 space-y-2.5">
              {rows
                .filter((r) => r.verificationStatus === status)
                .map((s) => (
                  <li key={s.id} className="surface p-3.5">
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-[13px] font-medium underline underline-offset-2">
                      {s.title}
                    </a>
                    <p className="text-[11px] muted mt-1">
                      {s.publisher} · {s.sourceType.replace(/_/g, " ")}
                      {s.publishedAt ? ` · published ${s.publishedAt}` : ""} · retrieved {s.accessedAt}
                    </p>
                    {s.notes ? <p className="muted text-xs mt-1.5 leading-relaxed">{s.notes}</p> : null}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="surface p-4 mt-7">
        <h2 className="text-sm font-medium">Academic integrity statement</h2>
        <p className="muted text-xs mt-2 leading-relaxed">
          This is a Harvard-informed, Harvard-mapped self-study curriculum. It is not Harvard enrolment, not
          Harvard credit and not a Harvard credential. Harvard College and Harvard Extension School are
          treated as separate institutions throughout, and Extension content is never presented as College
          content. No grades, credits or degree names are produced by this system.
        </p>
      </section>
    </Shell>
  );
}
