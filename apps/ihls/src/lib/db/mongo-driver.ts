import "server-only";
import { MongoClient, type Db } from "mongodb";
import type { CollectionDriver, DatabaseDriver, Doc, Filter, FindOptions } from "./driver";

/**
 * MongoDB driver — the production source of truth (§188).
 * Connection pooling is reused across hot reloads via a global handle.
 * The URI is read on the server only and never serialised to the client (§193).
 */

declare global {
  var __ihls_mongo: { client: MongoClient; db: Db } | undefined;
}

function connect(): { client: MongoClient; db: Db } {
  if (global.__ihls_mongo) return global.__ihls_mongo;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  const client = new MongoClient(uri, { maxPoolSize: 10 });
  const db = client.db(process.env.MONGODB_DB || "ihls");
  global.__ihls_mongo = { client, db };
  return global.__ihls_mongo;
}

class MongoCollection<T extends Doc> implements CollectionDriver<T> {
  constructor(private readonly name: string) {}

  private get col() {
    return connect().db.collection(this.name);
  }

  async find(filter: Filter, options: FindOptions = {}): Promise<T[]> {
    let cursor = this.col.find(filter as Record<string, unknown>);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit !== undefined) cursor = cursor.limit(options.limit);
    return (await cursor.toArray()) as unknown as T[];
  }

  async findOne(filter: Filter): Promise<T | null> {
    return (await this.col.findOne(filter as Record<string, unknown>)) as unknown as T | null;
  }

  async insertOne(doc: T): Promise<T> {
    await this.col.insertOne(doc as never);
    return doc;
  }

  async insertMany(docs: T[]): Promise<number> {
    if (!docs.length) return 0;
    const res = await this.col.insertMany(docs as never[]);
    return res.insertedCount;
  }

  async updateOne(filter: Filter, patch: Partial<T>): Promise<T | null> {
    const res = await this.col.findOneAndUpdate(filter as Record<string, unknown>, { $set: patch as Record<string, unknown> }, { returnDocument: "after" });
    return (res as unknown as T) ?? null;
  }

  async upsert(filter: Filter, doc: T): Promise<T> {
    await this.col.updateOne(filter as Record<string, unknown>, { $set: doc as Record<string, unknown> }, { upsert: true });
    return doc;
  }

  async deleteMany(filter: Filter): Promise<number> {
    const res = await this.col.deleteMany(filter as Record<string, unknown>);
    return res.deletedCount ?? 0;
  }

  async count(filter: Filter): Promise<number> {
    return this.col.countDocuments(filter as Record<string, unknown>);
  }
}

export class MongoDatabaseDriver implements DatabaseDriver {
  readonly kind = "mongodb" as const;
  readonly label = "MongoDB";

  collection<T extends Doc = Doc>(name: string): CollectionDriver<T> {
    return new MongoCollection<T>(name) as CollectionDriver<T>;
  }

  async ping(): Promise<boolean> {
    try {
      await connect().db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

/** §188 — index plan applied by the seed script when MongoDB is in use. */
export async function ensureIndexes(): Promise<void> {
  const { db } = connect();
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  for (const owned of [
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
  ]) {
    await db.collection(owned).createIndex({ ownerId: 1 });
  }
  await db.collection("review_items").createIndex({ ownerId: 1, dueAt: 1 });
  await db.collection("audit_logs").createIndex({ at: -1 });
}
