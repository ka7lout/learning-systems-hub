import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, Badge, SectionTitle } from "@/components/ui";
import { PROJECTS, LADDER_LEVELS } from "@/content/projects";
import { db } from "@/db";
import { userProjects } from "@/db/schema";

const STATUS_TONES: Record<string, "neutral" | "navy" | "warn" | "good"> = {
  planned: "neutral",
  active: "navy",
  submitted: "warn",
  complete: "good",
};

export default async function ProjectsPage() {
  const user = await requireUser();
  const mine = await db.select().from(userProjects).where(eq(userProjects.userId, user.id));
  const mineBySlug = new Map(mine.map((p) => [p.projectSlug, p]));

  return (
    <PageShell path="/projects">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Project ladder</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-ink-soft">
        The complete original catalog of {PROJECTS.length} projects, organized across the 10-level
        ladder. Serious projects require real public data with documented provenance, a repository,
        and an honest definition of done. Completion without evidence does not exist here.
      </p>

      <div className="mt-6 space-y-8">
        {LADDER_LEVELS.map((level) => {
          const projects = PROJECTS.filter((p) => p.level === level.level);
          if (projects.length === 0)
            return (
              <section key={level.level}>
                <SectionTitle sub="No catalog project at this level yet — reached through the capstone path and custom work.">
                  Level {level.level} · {level.name}
                </SectionTitle>
              </section>
            );
          return (
            <section key={level.level}>
              <SectionTitle>
                Level {level.level} · {level.name}
              </SectionTitle>
              <div className="grid gap-3 md:grid-cols-2">
                {projects.map((p) => {
                  const inst = mineBySlug.get(p.slug);
                  return (
                    <Card key={p.slug}>
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/projects/${p.slug}`} className="text-[14.5px] font-semibold text-ink hover:text-navy">
                          {p.title}
                        </Link>
                        <Badge tone={inst ? STATUS_TONES[inst.status] : "neutral"}>
                          {inst ? inst.status : "not started"}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{p.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge tone="navy">{p.cvClass.replace(/_/g, " ")}</Badge>
                        {p.skills.slice(0, 3).map((s) => (
                          <Badge key={s}>{s}</Badge>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
