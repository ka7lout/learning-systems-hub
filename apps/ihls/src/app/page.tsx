import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ORIGINAL_MODULES, ORIGINAL_TOPIC_COUNT } from "@/content/original-curriculum";
import { STAGES } from "@/content/stages";
import { PROJECTS } from "@/content/projects";
import { SKILLS } from "@/content/skills";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (await getSession()) redirect("/dashboard");

  const facts = [
    { k: `${ORIGINAL_MODULES.length} modules`, v: `${ORIGINAL_TOPIC_COUNT} original topics preserved verbatim` },
    { k: `${STAGES.length} stages`, v: "sequenced by prerequisites, not by chapter order" },
    { k: `${SKILLS.length} skills`, v: "each with its own evidence trail" },
    { k: `${PROJECTS.length} projects`, v: "ten ladder levels from first script to research" },
  ];

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-16">
      <p className="h-section">Ismaili Harvard</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">AI Engineering Learning OS</h1>
      <p className="mt-4 text-ink-2">
        A learning system that treats understanding as something you demonstrate. It keeps the original curriculum intact,
        maps it against publicly documented Harvard offerings with an explicit verification status for every claim, and
        tracks competence through retrieval, transfer, implementation, debugging and shipped projects.
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.k} className="card card-pad">
            <dt className="text-sm font-semibold">{f.k}</dt>
            <dd className="mt-0.5 text-sm text-ink-2">{f.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex gap-3">
        <Link href="/register" className="btn btn-primary">Create account</Link>
        <Link href="/login" className="btn">Sign in</Link>
      </div>

      <p className="mt-10 text-xs text-ink-3">
        This project is not affiliated with or endorsed by Harvard University. Harvard course references are mappings to
        publicly documented offerings, each labelled with the date it was retrieved and whether it was verified.
      </p>
    </main>
  );
}
