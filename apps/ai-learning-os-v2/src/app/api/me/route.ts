import { z } from "zod";
import { route } from "@/lib/api";
import { db } from "@/db";
import { settings, userProjects, evidence, laterItems, englishAttempts, projectCatalog, skills } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { HttpError, audit, getSettings } from "@/lib/auth";
import { CV_TIERS } from "@/lib/learning";

const url = z.string().trim().max(500).refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Links must start with https://");
const LINK_KEYS = ["repository", "codespace", "colab", "kaggle", "dataset", "deployment", "apiDocs", "report", "demo"] as const;

const Body = z.discriminatedUnion("op", [
  z.object({ op: z.literal("settings"), data: z.object({
    theme: z.enum(["light", "dark", "system"]), uiLanguage: z.enum(["en", "ar"]), contentMode: z.enum(["standard", "b1b2", "arabic"]), vocabAssist: z.boolean(), englishTraining: z.boolean(),
    density: z.enum(["comfortable", "compact"]), textSize: z.enum(["base", "lg"]), reducedMotion: z.boolean(), hintPolicy: z.enum(["attempt_first", "on_request"]), targetRoles: z.array(z.enum(["navisoft", "nuwave"])).max(2), studyState: z.enum(["deep", "drift", "fog", "overload"]),
  }).partial() }),
  z.object({ op: z.literal("startProject"), catalogId: z.string().max(10) }),
  z.object({ op: z.literal("projectUpdate"), id: z.number().int(), links: z.record(z.enum(LINK_KEYS), url).optional(), milestonesDone: z.array(z.number().int().min(0).max(20)).max(20).optional(), status: z.enum(["active", "completed", "paused"]).optional() }),
  z.object({ op: z.literal("evidence"), userProjectId: z.number().int().nullable(), skillId: z.string().max(40).nullable(), kind: z.enum(["repository", "commit", "pull_request", "deployment", "report", "test_suite", "model_card", "design_doc", "oral_defense", "other"]), url: url, description: z.string().trim().min(10, "Describe what this evidence proves (≥10 chars)").max(1000), cvTier: z.enum(CV_TIERS) }),
  z.object({ op: z.literal("deleteEvidence"), id: z.number().int() }),
  z.object({ op: z.literal("later"), text: z.string().trim().min(1).max(300) }),
  z.object({ op: z.literal("laterToggle"), id: z.number().int() }),
  z.object({ op: z.literal("english"), activity: z.string().max(60), dimension: z.enum(["Reading", "Listening", "Writing", "Speaking", "Interaction", "Technical Vocabulary", "Professional Communication"]), prompt: z.string().max(1000), response: z.string().trim().min(3).max(6000), feedback: z.string().max(8000).nullable() }),
]);

export const POST = route(Body, async (b, user) => {
  switch (b.op) {
    case "settings": {
      const cur = await getSettings(user.id);
      await db.update(settings).set({ data: { ...cur.data, ...b.data } }).where(eq(settings.userId, user.id));
      return { ok: true };
    }
    case "startProject": {
      const [c] = await db.select({ id: projectCatalog.id }).from(projectCatalog).where(eq(projectCatalog.id, b.catalogId));
      if (!c) throw new HttpError(404, "Project not found");
      const [p] = await db.insert(userProjects).values({ ownerId: user.id, catalogId: c.id, links: {}, milestonesDone: [] }).returning({ id: userProjects.id });
      return { id: p.id };
    }
    case "projectUpdate": {
      const own = and(eq(userProjects.id, b.id), eq(userProjects.ownerId, user.id));
      const [p] = await db.select().from(userProjects).where(own);
      if (!p) throw new HttpError(404, "Project not found");
      const links = b.links ? Object.fromEntries(Object.entries({ ...p.links, ...b.links }).filter(([, v]) => v)) : p.links;
      await db.update(userProjects).set({ links, milestonesDone: b.milestonesDone ?? p.milestonesDone, status: b.status ?? p.status }).where(own);
      return { ok: true };
    }
    case "evidence": {
      if (b.userProjectId !== null) {
        const [p] = await db.select({ id: userProjects.id }).from(userProjects).where(and(eq(userProjects.id, b.userProjectId), eq(userProjects.ownerId, user.id)));
        if (!p) throw new HttpError(404, "Project not found");
      }
      if (b.skillId) { const [s] = await db.select({ id: skills.id }).from(skills).where(eq(skills.id, b.skillId)); if (!s) throw new HttpError(422, "Unknown skill"); }
      if (CV_TIERS.indexOf(b.cvTier) >= 3 && !b.url) throw new HttpError(422, "Portfolio-level evidence needs a verifiable link (repository, deployment or report).");
      await db.insert(evidence).values({ ownerId: user.id, userProjectId: b.userProjectId, skillId: b.skillId, kind: b.kind, url: b.url || null, description: b.description, cvTier: b.cvTier });
      await audit(user.id, "evidence.add", { kind: b.kind });
      return { ok: true };
    }
    case "deleteEvidence": {
      await db.delete(evidence).where(and(eq(evidence.id, b.id), eq(evidence.ownerId, user.id)));
      await audit(user.id, "evidence.delete", { id: b.id });
      return { ok: true };
    }
    case "later": { await db.insert(laterItems).values({ ownerId: user.id, text: b.text }); return { ok: true }; }
    case "laterToggle": {
      const own = and(eq(laterItems.id, b.id), eq(laterItems.ownerId, user.id));
      const [l] = await db.select().from(laterItems).where(own);
      if (!l) throw new HttpError(404, "Not found");
      await db.update(laterItems).set({ done: !l.done }).where(own);
      return { ok: true };
    }
    case "english": { await db.insert(englishAttempts).values({ ownerId: user.id, ...b }); return { ok: true }; }
  }
}, { limit: [120, 60] });
