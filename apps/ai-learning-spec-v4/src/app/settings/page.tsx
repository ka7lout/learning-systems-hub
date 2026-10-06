import { requireUser, getUserSettings } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card, SectionTitle } from "@/components/ui";
import { updateSettingsAction } from "@/app/actions";
import { TARGET_ROLES } from "@/content/roles";
import { LEARNING_STATES, type LearningState } from "@/content/types";

export default async function SettingsPage() {
  const user = await requireUser();
  const s = await getUserSettings(user.id);

  return (
    <PageShell path="/settings">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
      <p className="mt-1 text-[14px] text-ink-soft">Signed in as {user.name} ({user.email})</p>

      <Card className="mt-6 max-w-2xl">
        <form action={updateSettingsAction} className="space-y-5">
          <div>
            <SectionTitle sub="Standard Technical English keeps authentic terminology; B1–B2 simplifies the surrounding language but never removes canonical terms.">
              English mode
            </SectionTitle>
            <div className="space-y-2">
              <label className="flex items-start gap-2 text-[13.5px] text-ink">
                <input type="radio" name="englishMode" value="standard" defaultChecked={s?.englishMode !== "b1b2"} className="mt-1" />
                <span>
                  <span className="font-medium">Standard Technical English</span>
                  <span className="block text-[12.5px] text-ink-soft">Full professional vocabulary: encapsulation, idempotency, observability, calibration…</span>
                </span>
              </label>
              <label className="flex items-start gap-2 text-[13.5px] text-ink">
                <input type="radio" name="englishMode" value="b1b2" defaultChecked={s?.englishMode === "b1b2"} className="mt-1" />
                <span>
                  <span className="font-medium">B1–B2 support mode</span>
                  <span className="block text-[12.5px] text-ink-soft">Simpler sentences around the same canonical technical terms. Applies to mentor responses.</span>
                </span>
              </label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" name="vocabAssist" defaultChecked={s?.vocabAssist ?? true} />
              Vocabulary assistance (ask the mentor to gloss advanced words)
            </label>
          </div>

          <div>
            <SectionTitle sub="Your default study state — you can switch it any time from the bar at the top.">
              Default learning state
            </SectionTitle>
            <select name="learningState" defaultValue={s?.learningState ?? "deep"} className="w-full max-w-xs rounded-lg border border-line px-3 py-2 text-[13.5px]">
              {(Object.keys(LEARNING_STATES) as LearningState[]).map((k) => (
                <option key={k} value={k}>{LEARNING_STATES[k].label}</option>
              ))}
            </select>
          </div>

          <div>
            <SectionTitle sub="Drives the gap analysis on the Career page. Reference blueprints — not job offers.">
              Target role
            </SectionTitle>
            <select name="targetRole" defaultValue={s?.targetRole ?? TARGET_ROLES[0].slug} className="w-full max-w-md rounded-lg border border-line px-3 py-2 text-[13.5px]">
              {TARGET_ROLES.map((r) => (
                <option key={r.slug} value={r.slug}>{r.title}</option>
              ))}
            </select>
          </div>

          <button className="rounded-lg bg-navy px-4 py-2 text-[13.5px] font-medium text-white hover:bg-navy-deep">
            Save settings
          </button>
        </form>
      </Card>

      <Card className="mt-6 max-w-2xl">
        <SectionTitle>About this system</SectionTitle>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Ismaili Harvard AI Engineering Learning OS — a Harvard-informed, Harvard-mapped
          self-study curriculum delivered through IHLS (state-adaptive learning, retrieval,
          spacing, transfer, cases, projects, evidence). It is not affiliated with Harvard
          University and grants no credential. All analytics shown anywhere in the product are
          computed from your own recorded events; nothing is simulated.
        </p>
      </Card>
    </PageShell>
  );
}
