import "server-only";
import { randomBytes } from "node:crypto";
import { col, type CollectionName, type Filter, type FindOptions } from "@/lib/db";
import type { Session } from "@/lib/auth/session";
import type { HelpLevel, MasteryLevelId } from "@/content/learning-science";

/**
 * DATA ACCESS LAYER (§189).
 *
 * Every student-owned read and write goes through `owned()`, which injects an
 * ownerId taken from the server-derived session. There is no code path in this
 * layer that accepts an ownerId from a caller, so a crafted request cannot
 * reach another student's documents.
 */

export interface OwnedDoc {
  _id: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

export const newId = (prefix: string) => `${prefix}_${randomBytes(10).toString("hex")}`;

const OWNED_COLLECTIONS = new Set<CollectionName>([
  "profiles",
  "settings",
  "mastery_records",
  "review_items",
  "submissions",
  "tasks",
  "project_submissions",
  "project_evidence",
  "ai_threads",
  "ai_messages",
  "ai_runs",
  "notes",
  "error_notebook",
  "later_items",
  "speaking_attempts",
  "english_progress",
  "portfolio_items",
  "resume_evidence",
  "study_events",
  "notifications",
  "freelance_simulations",
]);

export function owned<T extends OwnedDoc>(session: Session, name: CollectionName) {
  if (!OWNED_COLLECTIONS.has(name)) throw new Error(`${name} is not an ownership-scoped collection`);
  const ownerId = session.userId; // server-derived, never from the request body
  const base = col<T>(name);
  const scope = (filter: Filter = {}): Filter => ({ ...filter, ownerId });
  return {
    find: (filter: Filter = {}, options?: FindOptions) => base.find(scope(filter), options),
    findOne: (filter: Filter = {}) => base.findOne(scope(filter)),
    count: (filter: Filter = {}) => base.count(scope(filter)),
    insert: async (doc: Omit<T, "ownerId" | "createdAt"> & Partial<Pick<T, "createdAt">>) => {
      const full = { ...doc, ownerId, createdAt: doc.createdAt ?? new Date().toISOString() } as T;
      await base.insertOne(full);
      return full;
    },
    update: (filter: Filter, patch: Partial<T>) => base.updateOne(scope(filter), { ...patch, updatedAt: new Date().toISOString() } as Partial<T>),
    upsert: async (filter: Filter, doc: Omit<T, "ownerId">) => {
      const full = { ...doc, ownerId } as T;
      return base.upsert(scope(filter), full);
    },
    remove: (filter: Filter) => base.deleteMany(scope(filter)),
  };
}

// ---------------------------------------------------------------- documents

export interface MasteryRecord extends OwnedDoc {
  skillId: string;
  level: MasteryLevelId;
  components: {
    contentSeen: number;
    practice: number;
    recall: number;
    transfer: number;
    implementation: number;
    debugging: number;
    project: number;
    delayedRetention: number;
  };
  evidenceRefs: string[];
  lastEvidenceAt?: string;
}

export interface SubmissionDoc extends OwnedDoc {
  assessmentId: string;
  lessonId: string;
  skillIds: string[];
  tier: "recall" | "application" | "transfer";
  answer: string;
  helpLevel: HelpLevel;
  evaluation: "auto" | "mentor" | "self";
  /** null when no deterministic or reviewed judgement exists yet — never guessed. */
  correct: boolean | null;
  selfRating?: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  feedbackSource?: "deterministic" | "mentor" | "self";
  errorType?: string;
  durationSeconds?: number;
}

export interface ReviewItemDoc extends OwnedDoc {
  refKind: "assessment" | "lesson";
  refId: string;
  lessonId: string;
  skillIds: string[];
  ease: number;
  intervalDays: number;
  dueAt: string;
  reps: number;
  lapses: number;
  lastResult?: "pass" | "fail";
  lastReviewedAt?: string;
}

export interface TaskDoc extends OwnedDoc {
  title: string;
  description: string;
  /** §219/§221 — every task carries a reason or it is not created. */
  reasonKind: "prerequisite" | "skill_gap" | "project" | "review" | "career" | "interview" | "research" | "client_communication" | "evidence";
  reasonText: string;
  targetKind: "lesson" | "assessment" | "project" | "speaking" | "career" | "research";
  targetId: string;
  estimatedMinutes: number;
  state: "suggested" | "active" | "done" | "dismissed";
  completedAt?: string;
}

export interface NoteDoc extends OwnedDoc {
  lessonId: string;
  kind: "must_write" | "recommended" | "free";
  content: string;
}

export interface ErrorEntryDoc extends OwnedDoc {
  errorType: string;
  lessonId?: string;
  skillIds: string[];
  description: string;
  correction: string;
  resolved: boolean;
}

export interface ProjectSubmissionDoc extends OwnedDoc {
  projectId: string;
  milestoneId?: string;
  status: "not_started" | "in_progress" | "submitted" | "reviewed";
  summary: string;
  links: { repository?: string; deployment?: string; report?: string; dataset?: string; demo?: string; notebook?: string };
  dodChecked: string[];
  reviewNotes?: string;
}

export interface EvidenceDoc extends OwnedDoc {
  kind: "repository" | "commit" | "pull_request" | "deployment" | "report" | "dataset" | "metric" | "review" | "oral" | "other";
  projectId?: string;
  skillIds: string[];
  title: string;
  url?: string;
  description: string;
  /** Verified means a human or a deterministic check confirmed it. Default false. */
  verified: boolean;
}

export interface StudyEventDoc extends OwnedDoc {
  kind: "lesson_opened" | "block_read" | "attempt" | "review" | "task_done" | "state_set" | "speaking" | "mentor_call" | "note_saved" | "distraction_captured";
  lessonId?: string;
  payload: Record<string, unknown>;
  at: string;
}

export interface SettingsDoc extends OwnedDoc {
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
  englishMode: "standard" | "b1b2";
  vocabularyAssist: boolean;
  englishTraining: boolean;
  learningState: "deep" | "drift" | "fog" | "overload";
  reducedMotion: boolean;
  textSize: "normal" | "large" | "xlarge";
  readingDensity: "comfortable" | "compact";
  hintPolicy: "minimal" | "balanced" | "generous";
  careerTargets: string[];
  notifications: boolean;
}

export const DEFAULT_SETTINGS: Omit<SettingsDoc, "_id" | "ownerId" | "createdAt"> = {
  theme: "system",
  language: "en",
  englishMode: "standard",
  vocabularyAssist: true,
  englishTraining: false,
  learningState: "deep",
  reducedMotion: false,
  textSize: "normal",
  readingDensity: "comfortable",
  hintPolicy: "minimal",
  careerTargets: ["role-nuwave"],
  notifications: true,
};

export interface LaterItemDoc extends OwnedDoc {
  text: string;
  handled: boolean;
}

export interface SpeakingAttemptDoc extends OwnedDoc {
  activityId: string;
  transcript: string;
  durationSeconds: number;
  selfRating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  feedbackSource?: "mentor" | "self";
}

export interface AiThreadDoc extends OwnedDoc {
  title: string;
  lessonId?: string;
  lastMessageAt: string;
}

export interface AiMessageDoc extends OwnedDoc {
  threadId: string;
  role: "student" | "mentor" | "system";
  specialist: string;
  content: string;
  model?: string;
  contextRefs: string[];
  /** Truthful provider state — a failed call is recorded as a failure (§216). */
  status: "ok" | "provider_unavailable" | "error";
}

export interface AuditLogDoc {
  _id: string;
  at: string;
  actorId: string | null;
  action: string;
  target?: string;
  outcome: "allow" | "deny" | "error";
  meta?: Record<string, unknown>;
}

/** §198 — audit log. Never stores answer content or secrets, only the action. */
export async function audit(entry: Omit<AuditLogDoc, "_id" | "at">): Promise<void> {
  await col<AuditLogDoc>("audit_logs").insertOne({ _id: newId("aud"), at: new Date().toISOString(), ...entry });
}

export async function getSettings(session: Session): Promise<SettingsDoc> {
  const store = owned<SettingsDoc>(session, "settings");
  const existing = await store.findOne({});
  if (existing) return existing;
  return store.insert({ _id: newId("set"), ...DEFAULT_SETTINGS });
}

export async function recordEvent(session: Session, kind: StudyEventDoc["kind"], payload: Record<string, unknown> = {}, lessonId?: string): Promise<void> {
  await owned<StudyEventDoc>(session, "study_events").insert({
    _id: newId("ev"),
    kind,
    lessonId,
    payload,
    at: new Date().toISOString(),
  });
}
