import "server-only";
import { createRequire } from "module";
import type { DatabaseDriver } from "./driver";
import { FileDatabaseDriver } from "./file-driver";

let driver: DatabaseDriver | null = null;

/**
 * Driver selection (§206). MongoDB is used whenever MONGODB_URI is configured;
 * otherwise the file driver keeps the application honest and functional with
 * real persistence. DATA_DRIVER=file forces the file driver for local work.
 */
export function getDb(): DatabaseDriver {
  if (driver) return driver;
  const forced = process.env.DATA_DRIVER;
  const uri = process.env.MONGODB_URI;
  if (forced !== "file" && uri) {
    // Imported lazily so the mongodb package is never pulled into a bundle that does not need it.
    const require = createRequire(import.meta.url);
    const { MongoDatabaseDriver } = require("./mongo-driver") as typeof import("./mongo-driver");
    driver = new MongoDatabaseDriver();
  } else {
    driver = new FileDatabaseDriver();
  }
  return driver;
}

export function describeStorage(): { kind: string; label: string; configured: boolean } {
  const db = getDb();
  return { kind: db.kind, label: db.label, configured: Boolean(process.env.MONGODB_URI) };
}

export const COLLECTIONS = [
  "users",
  "sessions",
  "accounts",
  "profiles",
  "settings",
  "curriculum_stages",
  "courses",
  "modules",
  "lessons",
  "learning_blocks",
  "concepts",
  "skills",
  "skill_dependencies",
  "sources",
  "source_snapshots",
  "knowledge_chunks",
  "assessments",
  "assessment_items",
  "submissions",
  "mastery_records",
  "review_items",
  "tasks",
  "projects",
  "project_milestones",
  "project_submissions",
  "project_evidence",
  "rubrics",
  "ai_threads",
  "ai_messages",
  "ai_runs",
  "ai_evidence",
  "career_roles",
  "job_snapshots",
  "job_requirements",
  "freelance_services",
  "freelance_simulations",
  "english_terms",
  "speaking_attempts",
  "portfolio_items",
  "resume_evidence",
  "notifications",
  "later_items",
  "audit_logs",
  // Additional collections this implementation needs:
  "harvard_mappings",
  "notes",
  "error_notebook",
  "english_progress",
  "study_events",
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

export function col<T extends { _id: string }>(name: CollectionName) {
  return getDb().collection<T>(name);
}

export * from "./driver";
