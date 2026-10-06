import type { UnitDef } from "../content/curriculum";

/** Publication validation: broken prerequisites, cycles, missing fields, missing assessments. */
export function validateCurriculum(units: UnitDef[]): string[] {
  const errors: string[] = [];
  const ids = new Set(units.map((u) => u.id));
  if (ids.size !== units.length) errors.push("duplicate unit id");
  for (const u of units) {
    if (!u.why || !u.topics.length) errors.push(`${u.id}: missing why/topics`);
    for (const p of u.prerequisites) if (!ids.has(p)) errors.push(`${u.id}: broken prerequisite ${p}`);
    if (!u.transfer?.keyPoints.length) errors.push(`${u.id}: no assessment`);
  }
  const state = new Map<string, number>();
  const byId = new Map(units.map((u) => [u.id, u]));
  const visit = (id: string, path: string[]) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) { errors.push(`cycle: ${[...path, id].join(" -> ")}`); return; }
    state.set(id, 1);
    for (const p of byId.get(id)?.prerequisites ?? []) visit(p, [...path, id]);
    state.set(id, 2);
  };
  for (const u of units) visit(u.id, []);
  return errors;
}
