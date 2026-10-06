import { requireUser } from "@/lib/auth";
import { curriculum } from "@/lib/dal";
import { PageHeader } from "@/components/ui";
import { DiagnosticForm } from "@/components/client";

export default async function Diagnostic() {
  await requireUser();
  const all = await curriculum();
  const mods = all.filter((n) => n.type === "module");
  const groups = mods.map((m) => ({ module: m.title, units: all.filter((n) => n.parentId === m.id).map((n) => ({ id: n.id, title: n.title })) }));
  return (
    <>
      <PageHeader title="Starting diagnostic" lead="Tick units you have already studied before. This only marks them as 'recognized' — mastery still needs evidence from practice. The recommendation engine uses it to avoid sending you to material you’ve seen while still checking prerequisites." />
      <DiagnosticForm groups={groups} />
    </>
  );
}
